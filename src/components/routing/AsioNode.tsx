import type { RefObject } from "react";
import { NodeJack } from "./NodeJack";

export function AsioNode({
  type,
  active,
  visible,
  jackRef,
}: {
  type: "input" | "output";
  active: boolean;
  visible: boolean;
  jackRef: RefObject<HTMLSpanElement | null>;
}) {
  const isInput = type === "input";
  const endpoint = isInput ? "source" : "destination";
  const port = isInput ? "output" : "input";

  return (
    <div
      className={`signal-node signal-node--asio signal-node--${type} ${active ? "is-active" : ""} ${visible ? "is-visible" : ""}`}
      data-node={type}
    >
      <div className="signal-node__head">
        <span>
          <i className="node-led" aria-hidden="true" />
          asio {type}
        </span>
      </div>
      <div className="signal-node__body">
        <div className="asio-field">
          <p>{endpoint}</p>
          <strong title="ASIO Device">ASIO Device</strong>
        </div>
        <div className="asio-field">
          <p>status</p>
          <span className="node-state">{active ? "[ active ]" : "[ idle ]"}</span>
        </div>
        <div className="asio-field asio-field--port">
          <p>{port}</p>
          <div className="asio-port-row">
            <strong className="asio-port">
              stereo <em>· ch 3+4</em>
            </strong>
            {/* Jack sits on the card edge, vertically centered on the ch line. */}
            <NodeJack side={isInput ? "right" : "left"} placement="port" jackRef={jackRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
