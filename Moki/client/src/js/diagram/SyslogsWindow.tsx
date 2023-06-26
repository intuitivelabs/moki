import NoData from "../charts/NoData";
import Syslog from "./Syslog";
import { SipSyslog } from "./extractFlow";

interface Props {
  syslogs: SipSyslog[];
}

function SyslogsWindow({ syslogs }: Props) {
  const noData = syslogs.length == 0;

  return (
    <div>
      {noData && <NoData />}
      {!noData && (
        <div
          className="py-1"
          style={{ maxHeight: 200, overflowY: "auto" }}
        >
          {syslogs.map((syslog, i) => <Syslog key={i} sipLog={syslog} />)}
        </div>
      )}
    </div>
  );
}

export default SyslogsWindow;
