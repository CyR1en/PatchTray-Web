import { SectionRule } from "./SectionRule";

const USE_CASES = [
  {
    id: "01",
    title: "voicemeeter rigs",
    detail: "process your microphone through VST3 plugins on the insert path before voicemeeter mixes it.",
  },
  {
    id: "02",
    title: "streaming & broadcast",
    detail: "keep one voice chain live for the whole stream — no session to reopen before you go live.",
  },
  {
    id: "03",
    title: "rehearsal & performance",
    detail: "run instrument or vocal effects straight from input to output, without opening a DAW.",
  },
  {
    id: "04",
    title: "podcast & voice work",
    detail: "eq, compression, and cleanup on the live mic, monitored as you speak.",
  },
] as const;

export function UseCaseStrip() {
  return (
    <section className="use-cases content-width" aria-labelledby="use-cases-title">
      <SectionRule>where it fits</SectionRule>
      <h2 id="use-cases-title">Built for setups that stay live.</h2>
      <div className="use-cases__grid">
        {USE_CASES.map((useCase) => (
          <article key={useCase.id} className="use-case">
            <span className="use-case__index">{useCase.id}</span>
            <strong>{useCase.title}</strong>
            <p>{useCase.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
