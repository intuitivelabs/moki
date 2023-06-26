import { Line } from "@visx/shape";
import { Text } from "@visx/text";
import { Group } from "@visx/group";
import { Fragment } from "react";

interface Props {
  activeHosts: string[];
  classWidth: number;
  vertSpace: number;
  xPad: number;
  height: number;
}

const VERT_PAD = 20;
const YPAD = 30;

function HostLines(
  { activeHosts, classWidth, height, vertSpace, xPad }: Props,
) {
  return (
    <Group>
      {activeHosts.map((name, i) => {
        const x = xPad + i * vertSpace;
        return (
          <Fragment key={i}>
            <Line
              style={{ stroke: "#888", strokeDasharray: "3, 3" }}
              from={{ x, y: YPAD + 20 }}
              to={{ x, y: YPAD + VERT_PAD + height }}
            />
            <Group
              transform={`translate(${x}, ${YPAD})`}
              className="class-rect"
            >
              <rect
                x={-classWidth / 2}
                width={classWidth}
                height={24}
                opacity={0.1}
                rx={5}
              />
            </Group>
            <Group transform={`translate(${x}, ${YPAD})`}>
              <Text className="class-label" textAnchor="middle" dy={16}>
                {name}
              </Text>
            </Group>
          </Fragment>
        );
      })}
    </Group>
  );
}

export { HostLines };
