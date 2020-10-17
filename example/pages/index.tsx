import { Tooltip } from "react-hover-tooltip";

export default function Index() {
  return (
    <div>
      <style jsx>{`
        :global(body) {
          font-family: system-ui;
        }
      `}</style>
      <Tooltip content="Some tooltip content" bottom>
        <span>Some span</span>
      </Tooltip>
      <Tooltip replace content="Some tooltip content">
        <p style={{ background: "#eee", width: 400 }}>Some paragraph text</p>
      </Tooltip>
      <Tooltip content="Some tooltip content">
        <button>Some button</button>
      </Tooltip>
      <div />
      <Tooltip
        replace
        content={
          <div style={{ color: "red" }}>
            Some
            <br />
            Crazy
            <br />
            Content
          </div>
        }
      >
        <button>Some button</button>
      </Tooltip>
    </div>
  );
}
