import { Buffer } from "buffer";

(globalThis as any).global = globalThis;

if (!(globalThis as any).Buffer) {
  (globalThis as any).Buffer = Buffer;
}