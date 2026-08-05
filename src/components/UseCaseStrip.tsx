import { SectionRule } from "./SectionRule";

const USE_CASES = [
  {
    id: "01",
    title: "desktop audio rigs",
    detail: "build a visible VST3 chain around a compatible duplex ASIO, Windows Audio, or DirectSound device.",
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
    title: "expanded multichannel",
    detail: "use VoiceMeeter Patch Inserts when your setup needs an optional expanded multichannel workflow.",
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
