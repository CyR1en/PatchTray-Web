import type { PageName } from "./types";

export const pageMeta: Record<PageName, { title: string; description: string }> = {
  home: {
    title: "PatchTray — process live audio with VST3 plugins",
    description:
      "A Windows VST3 host for building visible ASIO signal chains and keeping them running from the system tray.",
  },
  download: {
    title: "Download PatchTray for Windows",
    description: "PatchTray public beta download, requirements, and Free / Pro details.",
  },
  guide: {
    title: "PatchTray guide — build your first live plugin chain",
    description:
      "A practical starting guide for PatchTray, Windows, ASIO, VST3 processors, and mixer routing.",
  },
};
