export type FaqEntry = {
  id: string;
  category: "product" | "routing" | "plugins" | "licensing";
  question: string;
  answer: string;
  links?: readonly { label: string; href: string }[];
};

/**
 * Deliberate editorial checkpoint, shared by the visible page, JSON-LD, and
 * verification. Update both fields only after checking every answer against
 * the named public release and the website's current terms.
 */
export const faqReview = {
  date: "2026-08-05",
  productVersion: "0.5.3",
} as const;

/**
 * One source of truth for the visible FAQ and its FAQPage structured data.
 * Answers are intentionally direct and self-contained so they work as search
 * snippets without requiring the surrounding page.
 */
export const faqEntries: readonly FaqEntry[] = [
  {
    id: "what-is-patchtray",
    category: "product",
    question: "What is PatchTray?",
    answer:
      "PatchTray is a visual VST3 host for live audio on Windows. It connects input and output ports from one logical duplex audio device through VST3 effects on a visual canvas, then keeps that processing chain running from the system tray.",
    links: [{ label: "see how the signal path works", href: "/" }],
  },
  {
    id: "who-is-it-for",
    category: "product",
    question: "Who is PatchTray for?",
    answer:
      "PatchTray is for Windows users who need VST3 processing outside a recording session, including streamers, broadcasters, voice-chat users, and musicians with a live microphone or instrument chain.",
  },
  {
    id: "requirements",
    category: "routing",
    question: "What do I need to run PatchTray?",
    answer:
      "You need Windows, a compatible duplex audio device, and compatible VST3 effects. PatchTray supports compatible duplex ASIO and DirectSound devices, plus Windows Audio in Shared, Exclusive, and Low Latency modes, with one logical duplex device active at a time.",
    links: [{ label: "review the download requirements", href: "/download" }],
  },
  {
    id: "without-daw",
    category: "routing",
    question: "Can I run VST3 effects without a DAW?",
    answer:
      "Yes. PatchTray hosts VST3 effects directly on a live route from a supported duplex audio device, without opening a DAW or creating a recording project.",
    links: [{ label: "follow the no-DAW guide", href: "/guides/run-vst3-without-daw" }],
  },
  {
    id: "voicemeeter",
    category: "routing",
    question: "Does PatchTray work with Voicemeeter?",
    answer:
      "Yes. VoiceMeeter Patch Inserts are an optional expanded multichannel workflow. Select the matching VoiceMeeter Insert Virtual ASIO driver and connect the corresponding input and output channels in PatchTray.",
    links: [{ label: "set up a Voicemeeter insert", href: "/guides/voicemeeter-vst3-plugins" }],
  },
  {
    id: "audio-route",
    category: "routing",
    question: "How does audio move through PatchTray?",
    answer:
      "Audio enters through an input node for the selected duplex device, passes through connected VST3 plugin nodes in order, and leaves through an output node for that same logical device. The cables on the canvas show the active signal path.",
    links: [{ label: "build your first route", href: "/guides/build-your-first-vst3-chain" }],
  },
  {
    id: "vst3-only",
    category: "plugins",
    question: "Does PatchTray support VST2 plugins?",
    answer:
      "No. PatchTray scans and hosts VST3 plugins only; it does not scan or host VST2 plugins. Use the 64-bit VST3 version of a plugin when its developer provides one.",
  },
  {
    id: "instruments",
    category: "plugins",
    question: "Can PatchTray load VST instruments?",
    answer:
      "No, not as a supported workflow. PatchTray is an audio-effect host rather than a MIDI instrument host. It is intended for effects such as equalizers, compressors, gates, de-essers, noise reduction, and reverbs.",
  },
  {
    id: "latency",
    category: "plugins",
    question: "How can I reduce audio latency?",
    answer:
      "Buffer controls and behavior vary by backend and device. Start with a stable device-recommended setting, account for latency added by individual plugins, and change one setting at a time while checking for clicks or dropouts.",
  },
  {
    id: "free-vs-pro",
    category: "licensing",
    question: "What is the difference between PatchTray Free and Pro?",
    answer:
      "PatchTray Free includes up to 4 VST3 nodes in a graph and 1 preset. PatchTray Pro includes unlimited VST3 nodes and unlimited presets; monthly and lifetime purchases differ in billing and device allowance, not the audio-routing workflow.",
    links: [{ label: "compare Free and Pro", href: "/pricing#compare" }],
  },
  {
    id: "offline",
    category: "licensing",
    question: "Does PatchTray need a constant internet connection?",
    answer:
      "No. After activation, monthly Pro licenses can run offline for up to 7 days and lifetime Pro licenses for up to 30 days. PatchTray refreshes the lease after a successful validation; if the lease expires, Pro features stop until validation succeeds.",
    links: [{ label: "read the offline-use terms", href: "/terms#offline" }],
  },
  {
    id: "support",
    category: "product",
    question: "Where can I get help with PatchTray?",
    answer:
      "Use the PatchTray support page for installation, audio routing, activation, device, billing, privacy, or security questions. Include your Windows version, selected audio backend and device, PatchTray version, and exact error text for audio issues.",
    links: [{ label: "open PatchTray support", href: "/support" }],
  },
];
