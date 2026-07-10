import type { PageName } from "./types";

export const pageMeta: Record<PageName, { title: string; description: string }> = {
  home: {
    title: "PatchTray — stop fighting the signal path.",
    description:
      "A low-latency system-tray VST3 host for Windows ASIO inserts — Voicemeeter and other ASIO-capable mixers.",
  },
  download: {
    title: "Download PatchTray for Windows",
    description: "PatchTray public beta download, requirements, and Free / Pro details.",
  },
  guide: {
    title: "PatchTray guide — make the signal path visible",
    description:
      "A practical starting guide for PatchTray, Windows, ASIO, VST3 processors, and mixer routing.",
  },
};
