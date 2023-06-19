import type { Meta, StoryObj } from "@storybook/react";
import {
  MultipleLineRender,
  RenderProps,
  UNIT_BYTES_SECOND,
  UNIT_CALLS,
  ValueType,
} from "@charts/MultipleLine";
import { timerangeProps } from "@/stories/utils/timerange";
import type { TimerangeProps } from "@/stories/utils/timerange";
import { DAY_TIME } from "@/data/utils/date";
import {
  GeneratorProps,
  genMultipleLineData,
} from "@/data/charts/genMultipleLine";
import { parseMultipleLineData } from "@/es-response-parser";

type StoryProps =
  & RenderProps
  & TimerangeProps
  & GeneratorProps;

const meta: Meta<StoryProps> = {
  title: "charts/MultipleLines/Default",
  tags: ["autodocs"],
  argTypes: {
    startDate: { control: "date" },
    endDate: { control: "date" },
    sample: {
      control: { type: "range", min: 0, max: 500, step: 1 },
    },
    type: {
      options: ["rate", "absolute", "difference"] satisfies ValueType[],
    },
  },
  args: {
    seed: 0,
    type: "absolute",
    valueMod: 1,
    increaseRate: 20,
    packed: 4,
    sample: 100,
    unit: UNIT_CALLS,
    startDate: Date.now() - DAY_TIME / 10,
    endDate: Date.now(),
    keys: ["sbc", "sbc01-cont", "bloup", "foo-long-name"],
  },
  render: (args) => {
    const data = genMultipleLineData(args);
    const parsedData = parseMultipleLineData(data);
    return (
      <MultipleLineRender
        {...{
          ...timerangeProps(args),
          data: parsedData,
        }}
      />
    );
  },
};

export default meta;
type Story = StoryObj<StoryProps>;

export const Primary: Story = {
  args: {
    name: "RESSOURCE",
  },
};

export const Rate: Story = {
  args: {
    name: "RATE",
    type: "rate",
    unit: UNIT_BYTES_SECOND,
  },
};

export const Difference: Story = {
  args: {
    name: "DIFFERENCE",
    type: "difference",
    unit: UNIT_CALLS
  },
};

export const Hostnames: Story = {
  args: {
    name: "NETWORK TRAFIC",
    increaseRate: 1,
    packed: 3,
    keys: ["sbc", "sbc01-cont", "bloup", "foo-long-name"],
    hostnames: {
      "sbc": "#58a959",
      "sbc01-cont": "#61BEE2",
      "bloup": "#61BEE2",
      "foo-long-name": "#58a959",
    },
  },
};
