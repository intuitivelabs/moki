import type { Meta, StoryObj } from "@storybook/react";
import LogsWindow from "@/js/diagram/SyslogsWindow";

const meta: Meta<typeof LogsWindow> = {
  title: "diagrams/LogsWindow",
  component: LogsWindow,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof LogsWindow>;

export const Primary: Story = {
  args: {
    syslogs: [
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409306,
          "payload":
            "sems 5406: [AmSession.cpp:523] DEBUG:  vv S [|789875A0-64820C39000484EB-712BE6C0] Disconnected, running, 0 UACTransPending, 0 usages vv",
        },
        "timestamp": "+ 6ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409306,
          "payload":
            "sems 5406: [AmSession.cpp:823] DEBUG:  AmSession processing event",
        },
        "timestamp": "+ 6ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409307,
          "payload":
            "sems 5406: [AmBasicSipDialog.cpp:480] DEBUG:  AmBasicSipDialog::onRxRequest(req = INVITE/9520)",
        },
        "timestamp": "+ 7ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409307,
          "payload": "sems 5406: [Am100rel.cpp:26] DEBUG:  reliable_1xx = 3",
        },
        "timestamp": "+ 7ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409307,
          "payload":
            "sems 5406: [parse_uri.cpp:387] DEBUG:  Converted URI port (61732) to int (61732)",
        },
        "timestamp": "+ 7ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409308,
          "payload":
            "sems 5406: [parse_uri.cpp:387] DEBUG:  Converted URI port () to int (5060)",
        },
        "timestamp": "+ 8ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409308,
          "payload":
            "sems 5406: [parse_uri.cpp:387] DEBUG:  Converted URI port () to int (5060)",
        },
        "timestamp": "+ 8ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409308,
          "payload":
            "sems 5406: [AmBasicSipDialog.cpp:308] DEBUG:  setting outbound interface to 0",
        },
        "timestamp": "+ 8ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409308,
          "payload":
            "sems 5406: [AmBasicSipDialog.cpp:107] DEBUG:  setting SIP dialog status: Disconnected->Trying",
        },
        "timestamp": "+ 8ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409309,
          "payload":
            "sems 5406: [AmOfferAnswer.cpp:283] DEBUG:  entering onRxSdp(), oa_state=None",
        },
        "timestamp": "+ 9ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409309,
          "payload":
            "sems 5406: [AmSdp.cpp:2242] DEBUG:  parsing SDP message...",
        },
        "timestamp": "+ 9ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409310,
          "payload":
            "sems 5406: [AmSdp.cpp:257] DEBUG:  SDP: got session level connection: IP4 192.168.1.240",
        },
        "timestamp": "+ 10ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409310,
          "payload":
            "sems 5406: [AmSdp.cpp:357] DEBUG:  SDP: got media: port 37582, payloads: 0 8 101",
        },
        "timestamp": "+ 10ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409310,
          "payload":
            "sems 5406: [AmOfferAnswer.cpp:80] DEBUG:  setting SIP dialog O/A status: None->OfferRecved",
        },
        "timestamp": "+ 10ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409310,
          "payload":
            "sems 5406: [GuiImdb.cpp:2344] DEBUG:  A-leg BW check (offer=1)",
        },
        "timestamp": "+ 10ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409311,
          "payload":
            "sems 5406: [GuiImdb.cpp:2347] DEBUG:  end of A-leg BW check",
        },
        "timestamp": "+ 11ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409313,
          "payload":
            "sems 5406: [AmOfferAnswer.cpp:352] DEBUG:  oa_state: None -> OfferRecved",
        },
        "timestamp": "+ 13ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409313,
          "payload":
            "sems 5406: [AmSession.cpp:2112] DEBUG:  update last remote ip '192.168.1.240'",
        },
        "timestamp": "+ 13ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409313,
          "payload":
            "sems 5406: [SBCCallLeg.cpp:1309] DEBUG:  replying 100 Trying to INVITE",
        },
        "timestamp": "+ 13ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409313,
          "payload":
            "sems 5406: [AmBasicSipDialog.cpp:939] DEBUG:  reply: transaction found!",
        },
        "timestamp": "+ 13ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409313,
          "payload": "sems 5406: [Am100rel.cpp:212] DEBUG:  reliable_1xx = 3",
        },
        "timestamp": "+ 13ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409313,
          "payload":
            "sems 5406: [AmBasicSipDialog.cpp:107] DEBUG:  setting SIP dialog status: Trying->Early",
        },
        "timestamp": "+ 13ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409313,
          "payload":
            "sems 5406: [HeaderFilter.cpp:352] DEBUG:  looking for filters filtering require (no compact form)",
        },
        "timestamp": "+ 13ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409313,
          "payload":
            "sems 5406: [HeaderFilter.cpp:352] DEBUG:  looking for filters filtering supported (k)",
        },
        "timestamp": "+ 13ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409313,
          "payload":
            "sems 5406: [HeaderFilter.cpp:352] DEBUG:  looking for filters filtering allow (no compact form)",
        },
        "timestamp": "+ 13ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409313,
          "payload":
            "sems 5406: [HeaderFilter.cpp:352] DEBUG:  looking for filters filtering require (no compact form)",
        },
        "timestamp": "+ 13ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409314,
          "payload":
            "sems 5406: [HeaderFilter.cpp:352] DEBUG:  looking for filters filtering supported (k)",
        },
        "timestamp": "+ 14ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409314,
          "payload":
            "sems 5406: [HeaderFilter.cpp:352] DEBUG:  looking for filters filtering allow (no compact form)",
        },
        "timestamp": "+ 14ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409314,
          "payload": "sems 5406: [trans_layer.cpp:535] DEBUG:  reply_len = 260",
        },
        "timestamp": "+ 14ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409314,
          "payload":
            "sems 5406: [transport.cpp:100] DEBUG:  trsp_socket::socket_options = 0x0",
        },
        "timestamp": "+ 14ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409316,
          "payload":
            "sems 5406: [transport.cpp:100] DEBUG:  trsp_socket::socket_options = 0x0",
        },
        "timestamp": "+ 16ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409316,
          "payload":
            "sems 5406: [trans_layer.cpp:783] DEBUG:  Sending to 192.168.1.240:61752 <SIP/2.0 100 Trying..Via: SIP/2.0/TCP 192.168.1.240:61732;branch=z9hG4bK57417ab0abfb5ed0;rport=61752;received=192.168.1.240..To: <sip:music@iptel.org>..From: <sip:raf@nuc>;tag=f3688c96acd11276..Call-ID: 31c7c996f8570905..CSeq: 9520 INVITE..Content-Length: 0....>",
        },
        "timestamp": "+ 16ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409316,
          "payload":
            "sems 5406: [trans_layer.cpp:2847] DEBUG:  update_uas_reply(t=0x7f26800244d0)",
        },
        "timestamp": "+ 16ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409317,
          "payload":
            "sems 5406: [sip_trans.cpp:230] DEBUG:  Clearing old timer of type FR (this=0x7f268001fbe0)",
        },
        "timestamp": "+ 17ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409317,
          "payload":
            "sems 5406: [CallLeg.cpp:1231] DEBUG:  789875A0-64820C39000484EB-712BE6C0: SIP request 9520 INVITE received in Disconnected state (replacing=0, r4replace=0)",
        },
        "timestamp": "+ 17ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409317,
          "payload":
            "sems 5406: [CallLeg.cpp:1247] DEBUG:  handling request INVITE in disconnected state",
        },
        "timestamp": "+ 17ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409318,
          "payload":
            "sems 5406: [AmSession.cpp:911] DEBUG:  onSipRequest: method = INVITE",
        },
        "timestamp": "+ 18ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409318,
          "payload":
            "sems 5406: [AmSession.cpp:1567] DEBUG:  remote allows UPDATE, using UPDATE for session refresh.",
        },
        "timestamp": "+ 18ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409319,
          "payload":
            "sems 5406: [SBCCallLeg.cpp:2324] DEBUG:  processing initial INVITE sip:music@iptel.org",
        },
        "timestamp": "+ 19ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409319,
          "payload":
            "sems 5406: [AmSipDialog.cpp:728] DEBUG:  notusing Q850 call termination reason/phrase for SIP dialog [789875A0-64820C39000484EB-712BE6C0/0x7f2680019870]",
        },
        "timestamp": "+ 19ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409320,
          "payload":
            "sems 5406: [AmSipDialog.cpp:301] DEBUG:  setting 100rel state for '789875A0-64820C39000484EB-712BE6C0' to 3",
        },
        "timestamp": "+ 20ms",
      },
      {
        "packet": {
          "facility": "daemon",
          "severity": "debug",
          "unixTimestamp": 1686244409320,
          "payload":
            "sems 5406: [GuiImdb.cpp:2078] DEBUG:  checking dynamic modules...",
        },
        "timestamp": "+ 20ms",
      },
    ],
  },
};

export const NoData: Story = {
  args: {
    syslogs: [],
  },
};
