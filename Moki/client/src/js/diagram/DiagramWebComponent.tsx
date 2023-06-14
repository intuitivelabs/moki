import r2wc from "@r2wc/react-to-web-component"
import { SequenceDiagramRender } from "./sequenceDiagram";

function DiagramWebComponent({ content }: { content: string }) {
  return (
      <SequenceDiagramRender
        {...{
          download: false,
          load: async () => {
            return content;
          },
          filenames: undefined,
        }}
      />
  );
}

const Diagram = r2wc(DiagramWebComponent, {
  props: { content: "string" },
});
customElements.define("sequence-diagram", Diagram);
