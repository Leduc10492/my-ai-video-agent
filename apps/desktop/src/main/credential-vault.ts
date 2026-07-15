import { chmod, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { safeStorage } from "electron";

interface CredentialMetadata {
  lastTestedAt?: string;
  status: "ready" | "invalid" | "unchecked";
  message?: string;
}

export class CredentialVault {
  readonly #credentialPath: string;
  readonly #metadataPath: string;

  constructor(userDataPath: string) {
    this.#credentialPath = join(userDataPath, "credentials", "openai-api-key.bin");
    this.#metadataPath = join(userDataPath, "credentials", "openai-api-key.json");
  }

  async has(): Promise<boolean> {
    try {
      await readFile(this.#credentialPath);
      return true;
    } catch {
      return false;
    }
  }

  async store(apiKey: string): Promise<void> {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("macOS Keychain 当前不可用，无法安全保存 API Key。请解锁钥匙串后重试。");
    }
    const encrypted = safeStorage.encryptString(apiKey);
    await mkdir(dirname(this.#credentialPath), { recursive: true, mode: 0o700 });
    await writeFile(this.#credentialPath, encrypted, { mode: 0o600 });
    await chmod(this.#credentialPath, 0o600);
    await this.writeMetadata({ status: "unchecked", message: "密钥已安全保存，尚未测试连接。" });
  }

  async readForRuntime(): Promise<string | null> {
    try {
      const encrypted = await readFile(this.#credentialPath);
      return safeStorage.decryptString(encrypted);
    } catch {
      return null;
    }
  }

  async remove(): Promise<void> {
    await Promise.all([
      rm(this.#credentialPath, { force: true }),
      rm(this.#metadataPath, { force: true })
    ]);
  }

  async readMetadata(): Promise<CredentialMetadata> {
    try {
      return JSON.parse(await readFile(this.#metadataPath, "utf8")) as CredentialMetadata;
    } catch {
      return { status: "unchecked" };
    }
  }

  async writeMetadata(metadata: CredentialMetadata): Promise<void> {
    await mkdir(dirname(this.#metadataPath), { recursive: true, mode: 0o700 });
    await writeFile(this.#metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
    await chmod(this.#metadataPath, 0o600);
  }
}
