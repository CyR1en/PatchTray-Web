import type { RefObject } from "react";
import { DEMO_PARAMS } from "./constants";
import { DemoKnob } from "./DemoKnob";
import { NodeJack } from "./NodeJack";

export function PluginNode({
  active,
  visible,
  inJackRef,
  outJackRef,
}: {
  active: boolean;
  visible: boolean;
  inJackRef: RefObject<HTMLSpanElement | null>;
  outJackRef: RefObject<HTMLSpanElement | null>;
}) {
  return (
    <div
      className={`signal-node signal-node--plugin ${active ? "is-active" : ""} ${visible ? "is-visible" : ""}`}
      data-node="plugin"
    >
      <div className="signal-node__head">
        <span>
          <i className="node-led node-led--plugin" aria-hidden="true" />
          spectral comp
        </span>
        <span className="plugin-actions" aria-label="Plugin controls: on, GUI, delete">
          <span>[ on ]</span>
          <span>[ gui ]</span>
          <span>[ × ]</span>
        </span>
      </div>
      <div className="plugin-node__body">
        <div className="plugin-parameter-grid" aria-label="Example VST3 parameter controls">
          {DEMO_PARAMS.map((param) => (
            <DemoKnob key={param.label} label={param.label} value={param.value} amount={param.amount} />
          ))}
        </div>
      </div>
      <div className="plugin-node__foot">
        <span className="plugin-node__page" aria-hidden="true" />
        <span className="plugin-node__cfg">[ cfg ]</span>
        <span className="plugin-node__latency">0 smp</span>
      </div>
      <span className="port-label port-label--in">in</span>
      <span className="port-label port-label--out">out</span>
      <NodeJack side="left" placement="footer" jackRef={inJackRef} />
      <NodeJack side="right" placement="footer" jackRef={outJackRef} />
    </div>
  );
}
