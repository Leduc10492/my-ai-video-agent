export type JsonRpcFraming = "newline" | "content-length";

export interface JsonRpcMessage {
  jsonrpc: "2.0";
  id?: number | string;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

export function encodeJsonRpcMessage(message: JsonRpcMessage, framing: JsonRpcFraming): Buffer {
  const body = Buffer.from(JSON.stringify(message), "utf8");
  return framing === "content-length"
    ? Buffer.concat([Buffer.from(`Content-Length: ${body.byteLength}\r\n\r\n`, "ascii"), body])
    : Buffer.concat([body, Buffer.from("\n")]);
}

export class JsonRpcMessageParser {
  #buffer = Buffer.alloc(0);

  push(chunk: Buffer | string): JsonRpcMessage[] {
    this.#buffer = Buffer.concat([this.#buffer, Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)]);
    const messages: JsonRpcMessage[] = [];
    while (this.#buffer.length > 0) {
      const leading = this.#buffer.toString("ascii", 0, Math.min(this.#buffer.length, 32));
      if (/^Content-Length:/i.test(leading)) {
        const headerEnd = this.#buffer.indexOf("\r\n\r\n");
        if (headerEnd < 0) break;
        const header = this.#buffer.toString("ascii", 0, headerEnd);
        const lengthMatch = header.match(/(?:^|\r\n)Content-Length:\s*(\d+)/i);
        if (!lengthMatch?.[1]) throw new Error("Malformed JSON-RPC Content-Length header.");
        const length = Number(lengthMatch[1]);
        const bodyStart = headerEnd + 4;
        if (this.#buffer.length < bodyStart + length) break;
        const body = this.#buffer.subarray(bodyStart, bodyStart + length).toString("utf8");
        this.#buffer = this.#buffer.subarray(bodyStart + length);
        messages.push(JSON.parse(body) as JsonRpcMessage);
        continue;
      }

      const newline = this.#buffer.indexOf("\n");
      if (newline < 0) break;
      const line = this.#buffer.subarray(0, newline).toString("utf8").trim();
      this.#buffer = this.#buffer.subarray(newline + 1);
      if (!line) continue;
      messages.push(JSON.parse(line) as JsonRpcMessage);
    }
    return messages;
  }
}
