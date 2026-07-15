import type { DesktopApi } from "./shared/ipc";

declare global {
  interface Window {
    aiDirector: DesktopApi;
  }
}

export {};
