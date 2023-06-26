import type { Meta, StoryObj } from "@storybook/react";
import Syslog from "@/js/diagram/Syslog";

const meta: Meta<typeof Syslog> = {
  title: "diagrams/Syslog",
  component: Syslog,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Syslog>;

export const Info: Story = {
  args: {
    sipLog: {
      "packet": {
        "facility": "daemon",
        "severity": "debug",
        "unixTimestamp": 1686244409306,
        "payload":
          "sems 5406: [AmSession.cpp:523] DEBUG:  vv S [|789875A0-64820C39000484EB-712BE6C0] Disconnected, running, 0 UACTransPending, 0 usages vv",
      },
      "timestamp": "+ 6ms",
    },
  },
};

export const Warning: Story = {
  args: {
    sipLog: {
      "packet": {
        "facility": "daemon",
        "severity": "notice",
        "unixTimestamp": 1686244409306,
        "payload":
          "sems 5406: [AmSession.cpp:523] DEBUG:  vv S [|789875A0-64820C39000484EB-712BE6C0] Disconnected, running, 0 UACTransPending, 0 usages vv",
      },
      "timestamp": "+ 6ms",
    },
  },
};

export const Error: Story = {
  args: {
    sipLog: {
      "packet": {
        "facility": "daemon",
        "severity": "alert",
        "unixTimestamp": 1686244409306,
        "payload":
          "sems 5406: [AmSession.cpp:523] DEBUG:  vv S [|789875A0-64820C39000484EB-712BE6C0] Disconnected, running, 0 UACTransPending, 0 usages vv",
      },
      "timestamp": "+ 6ms",
    },
  },
};
