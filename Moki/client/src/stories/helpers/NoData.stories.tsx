import type { Meta, StoryObj } from "@storybook/react";
import NoData from "@/js/charts/NoData";

const meta: Meta<typeof NoData> = {
  title: "helpers/NoData",
  component: NoData,
  tags: ["autodocs"],
}

export default meta;
type Story = StoryObj<typeof NoData>;

export const Primary: Story = {
  args: {},
};
