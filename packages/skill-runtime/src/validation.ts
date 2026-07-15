import semver from "semver";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { DirectorSkillManifest, SkillCapability, SkillDescriptor } from "./contracts.js";
import { DirectorSkillManifestSchema } from "./contracts.js";

export interface SkillValidationIssue {
  severity: "error" | "warning";
  code: string;
  message: string;
}

export interface SkillValidationResult {
  valid: boolean;
  issues: SkillValidationIssue[];
}

export function validateSkillManifest(input: unknown): SkillValidationResult {
  const result = DirectorSkillManifestSchema.safeParse(input);
  if (result.success) return { valid: true, issues: [] };
  return {
    valid: false,
    issues: result.error.issues.map((issue) => ({
      severity: "error",
      code: "manifest.invalid",
      message: `${issue.path.join(".") || "manifest"}: ${issue.message}`,
    })),
  };
}

export function validateSkillDependencies(
  manifest: DirectorSkillManifest,
  installed: readonly Pick<SkillDescriptor, "id" | "manifest">[],
): SkillValidationIssue[] {
  const issues: SkillValidationIssue[] = [];
  for (const dependency of manifest.dependencies ?? []) {
    const candidates = installed.filter((skill) => skill.id === dependency.id);
    if (candidates.length === 0) {
      issues.push({ severity: "error", code: "dependency.missing", message: `Missing dependency ${dependency.id} ${dependency.versionRange}.` });
      continue;
    }
    if (!candidates.some((skill) => semver.satisfies(skill.manifest.version, dependency.versionRange, { includePrerelease: true }))) {
      issues.push({
        severity: "error",
        code: "dependency.version",
        message: `Dependency ${dependency.id} does not satisfy ${dependency.versionRange}.`,
      });
    }
  }
  return issues;
}

/**
 * Resolve each declared dependency to the highest installed version that
 * satisfies its semver range. Results preserve manifest declaration order.
 */
export function resolveSkillDependencies<T extends Pick<SkillDescriptor, "id" | "manifest">>(
  manifest: DirectorSkillManifest,
  installed: readonly T[],
): T[] {
  return (manifest.dependencies ?? []).map((dependency) => {
    if (semver.validRange(dependency.versionRange) === null) {
      throw new Error(
        `Dependency ${dependency.id} declares an invalid semver range: ${dependency.versionRange}.`,
      );
    }

    const candidates = installed.filter((skill) => skill.id === dependency.id);
    if (candidates.length === 0) {
      throw new Error(`Missing dependency ${dependency.id} ${dependency.versionRange}.`);
    }

    const invalidVersion = candidates.find((skill) => semver.valid(skill.manifest.version) === null);
    if (invalidVersion) {
      throw new Error(
        `Installed dependency ${dependency.id} has an invalid semver version: ${invalidVersion.manifest.version}.`,
      );
    }

    const compatible = candidates
      .filter((skill) => semver.satisfies(
        skill.manifest.version,
        dependency.versionRange,
        { includePrerelease: true },
      ))
      .sort((left, right) => semver.rcompare(left.manifest.version, right.manifest.version));
    const selected = compatible[0];
    if (!selected) {
      const available = candidates
        .map((skill) => skill.manifest.version)
        .sort(semver.rcompare)
        .join(", ");
      throw new Error(
        `Dependency ${dependency.id} requires ${dependency.versionRange}, but installed versions are ${available}.`,
      );
    }
    return selected;
  });
}

export function validateCapabilities(
  manifest: DirectorSkillManifest,
  granted: readonly SkillCapability[],
): SkillValidationIssue[] {
  const allowed = new Set(granted);
  return manifest.capabilities
    .filter((capability) => !allowed.has(capability))
    .map((capability) => ({
      severity: "error" as const,
      code: "capability.not_granted",
      message: `Skill requires ${capability}, but the project has not granted it.`,
    }));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function validateStructuredOutputSchema(schema: unknown): SkillValidationIssue[] {
  const issues: SkillValidationIssue[] = [];
  const visit = (node: unknown, location: string): void => {
    if (!isRecord(node)) {
      issues.push({ severity: "error", code: "output_schema.node", message: `${location} must be a JSON Schema object.` });
      return;
    }
    const hasShape = "type" in node || "enum" in node || "$ref" in node || "anyOf" in node || "oneOf" in node || "allOf" in node;
    if (!hasShape) {
      issues.push({ severity: "error", code: "output_schema.type", message: `${location} must declare a type or another concrete schema shape.` });
    }
    const types = Array.isArray(node.type) ? node.type : [node.type];
    if (types.includes("object")) {
      if (node.additionalProperties !== false) {
        issues.push({
          severity: "error",
          code: "output_schema.additional_properties",
          message: `${location} must set additionalProperties to false for structured output.`,
        });
      }
      const properties = isRecord(node.properties) ? node.properties : {};
      const required = new Set(Array.isArray(node.required) ? node.required.filter((item): item is string => typeof item === "string") : []);
      const missing = Object.keys(properties).filter((key) => !required.has(key));
      if (missing.length > 0) {
        issues.push({
          severity: "error",
          code: "output_schema.required",
          message: `${location} must include every property in required; use nullable types for optional values (${missing.join(", ")}).`,
        });
      }
      for (const [key, child] of Object.entries(properties)) visit(child, `${location}.properties.${key}`);
    }
    if (types.includes("array")) {
      if (!("items" in node)) {
        issues.push({ severity: "error", code: "output_schema.items", message: `${location} must declare array items.` });
      } else {
        visit(node.items, `${location}.items`);
      }
    }
    for (const keyword of ["anyOf", "oneOf", "allOf"] as const) {
      const branches = node[keyword];
      if (Array.isArray(branches)) branches.forEach((branch, index) => visit(branch, `${location}.${keyword}[${index}]`));
    }
    for (const keyword of ["$defs", "definitions"] as const) {
      const definitions = node[keyword];
      if (isRecord(definitions)) for (const [key, child] of Object.entries(definitions)) visit(child, `${location}.${keyword}.${key}`);
    }
  };
  visit(schema, "$schema");
  return issues;
}

export async function validateSkillOutputSchema(skill: SkillDescriptor): Promise<SkillValidationIssue[]> {
  if (skill.manifestStatus === "synthesized") {
    return [{ severity: "warning", code: "output_schema.synthesized", message: `${skill.id} uses the app's generic DraftOperation schema.` }];
  }
  const outputPath = path.resolve(skill.path, skill.manifest.outputSchema);
  try {
    return validateStructuredOutputSchema(JSON.parse(await readFile(outputPath, "utf8")));
  } catch (error) {
    return [{ severity: "error", code: "output_schema.read", message: `Could not read ${skill.manifest.outputSchema}: ${String(error)}` }];
  }
}

export async function validateSkillPackage(
  skill: SkillDescriptor,
  installed: readonly SkillDescriptor[],
  grantedCapabilities: readonly SkillCapability[],
): Promise<SkillValidationResult> {
  const issues = [
    ...validateSkillDependencies(skill.manifest, installed),
    ...validateCapabilities(skill.manifest, grantedCapabilities),
    ...await validateSkillOutputSchema(skill),
  ];
  return { valid: !issues.some((issue) => issue.severity === "error"), issues };
}
