export type GuideArticleDefinition = {
  page: "voicemeeterVst3Guide" | "vst3WithoutDawGuide";
  path: string;
  title: string;
  cardTitle: string;
  description: string;
  category: string;
  readingTime: string;
  published: string;
  reviewed: string;
  topics: readonly string[];
};

export const VOICEMEETER_VST3_GUIDE: GuideArticleDefinition = {
  page: "voicemeeterVst3Guide",
  path: "/guides/voicemeeter-vst3-plugins",
  title: "How to use VST3 plugins with Voicemeeter",
  cardTitle: "Use VST3 plugins with Voicemeeter",
  description:
    "Configure a Voicemeeter ASIO insert, match its channel pair in PatchTray, build a microphone chain, and check the route safely.",
  category: "routing guide",
  readingTime: "8 minute read",
  published: "2026-07-27",
  reviewed: "2026-07-27",
  topics: ["Voicemeeter", "ASIO inserts", "VST3 effects", "microphone processing"],
};

export const VST3_WITHOUT_DAW_GUIDE: GuideArticleDefinition = {
  page: "vst3WithoutDawGuide",
  path: "/guides/run-vst3-without-daw",
  title: "How to run VST3 effects without opening a DAW on Windows",
  cardTitle: "Run VST3 effects without a DAW",
  description:
    "Use a standalone Windows VST3 host to connect an ASIO input, a live effect chain, and an ASIO output without a recording session.",
  category: "workflow guide",
  readingTime: "7 minute read",
  published: "2026-07-27",
  reviewed: "2026-07-27",
  topics: ["VST3 host", "Windows audio", "ASIO routing", "live effects"],
};

export const guideArticles = [VOICEMEETER_VST3_GUIDE, VST3_WITHOUT_DAW_GUIDE] as const;
