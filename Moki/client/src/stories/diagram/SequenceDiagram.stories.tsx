import type { Meta, StoryObj } from "@storybook/react";
import { SequenceDiagramRender } from "@/js/diagram/sequenceDiagram";
import diagram_file from "../assets/diagrams/stream.xml?raw";

const meta: Meta<typeof SequenceDiagramRender> = {
  title: "diagrams/SequenceDiagram",
  tags: ["autodocs"],
  render: () => {
    return (
      <SequenceDiagramRender
        {...{
          load: async () => diagram_file,
          filenames: undefined,
        }}
      />
    );
  },
};

export default meta;
type Story = StoryObj<typeof SequenceDiagramRender>;

export const Primary: Story = {
  args: {},
};

export const NoData: Story = {
  render: () => {
    return (
      <SequenceDiagramRender
        {...{
          load: async () => "",
          filenames: undefined,
        }}
      />
    );
  },
};
