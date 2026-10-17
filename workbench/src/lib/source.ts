export type DataSource = "repo" | "example";

export function parseSource(value: string | string[] | undefined | null): DataSource {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "repo" ? "repo" : "example";
}

export function sourceLabel(source: DataSource) {
  return source === "example" ? "示例数据《末班》" : "当前仓库";
}

export function withSource(
  pathname: string,
  source: DataSource,
  query?: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();
  params.set("source", source);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value) params.set(key, value);
  }
  return `${pathname}?${params.toString()}`;
}
