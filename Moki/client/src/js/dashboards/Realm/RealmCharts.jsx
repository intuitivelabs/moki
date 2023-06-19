/*
Class to get data for all charts iin Call dashboard
*/

import { useDashboardData } from "@hooks/useDashboardData";
import LoadingScreenCharts from "../../helpers/LoadingScreenCharts";
import MultipleLine, {
  UNIT_BYTES_SECOND,
  UNIT_CALLS,
} from "@charts/MultipleLine";
import { parseMultipleLineData } from "../../../es-response-parser";

function RealmCharts({ hostnames }) {
  const { chartsData, isLoading } = useDashboardData("realm/charts", {
    functors: [
      //MAX CALLS FROM BY HOST
      [{ result: "callsFromByHost", func: parseMultipleLineData }],
      //MAX CALLS To BY HOST
      [{ result: "callsToByHost", func: parseMultipleLineData }],
      ////MAX CALLS FROM BY REALM
      [{ result: "callsFromByrealm", func: parseMultipleLineData }],
      //MAX CALLS TO BY REALM
      [{ result: "callsToByrealm", func: parseMultipleLineData }],
      //MAX START CALLS FROM BY HOST
      [{ result: "callsStartFromByHost", func: parseMultipleLineData }],
      //MAX START CALLS To BY HOST
      [{ result: "callsStartToByHost", func: parseMultipleLineData }],
      //MAX START CALLS FROM BY REALM
      [{ result: "callsStartFromByrealm", func: parseMultipleLineData }],
      //MAX START CALLS TO BY REALM
      [{ result: "callsStartToByrealm", func: parseMultipleLineData }],
      //RTP RELAYED TO BY HOST
      [{ result: "mediaToByHost", func: parseMultipleLineData }],
      //RTP RELAYED FROM BY HOST
      [{ result: "mediaFromByHost", func: parseMultipleLineData }],
      //RTP RELAYED TO BY REALM
      [{ result: "mediaToByRealm", func: parseMultipleLineData }],
      //RTP RELAYED FROM BY REALM
      [{ result: "mediaFromByRealm", func: parseMultipleLineData }],
    ],
  }, false);

  return (
    <div>
      {isLoading && <LoadingScreenCharts />}{" "}
      <div className="row no-gutters">
        <div className="col-6 pr-1">
          <MultipleLine
            unit={UNIT_CALLS}
            hostnames={hostnames}
            data={chartsData.callsFromByHost}
            name={"CALLS FROM BY HOST"}
          />
        </div>
        <div className="col-6 px-1">
          <MultipleLine
            unit={UNIT_CALLS}
            data={chartsData.callsToByHost}
            name={"CALLS TO BY HOST"}
            hostnames={hostnames}
          />
        </div>
        <div className="col-6 pr-1">
          <MultipleLine
            unit={UNIT_CALLS}
            data={chartsData.callsFromByrealm}
            hostnames={chartsData.realm}
            name={"CALLS FROM BY REALM"}
            field={"attrs.realm"}
          />
        </div>
        <div className="col-6 px-1">
          <MultipleLine
            unit={UNIT_CALLS}
            data={chartsData.callsToByrealm}
            name={"CALLS TO BY REALM"}
            field={"attrs.realm"}
            hostnames={hostnames}
          />
        </div>

        <div className="col-6 pr-1">
          <MultipleLine
            type="difference"
            unit={UNIT_CALLS}
            data={chartsData.callsStartFromByHost}
            hostnames={hostnames}
            name={"CALLS START FROM BY HOST"}
            ticks={3}
          />
        </div>

        <div className="col-6 px-1">
          <MultipleLine
            type="difference"
            unit={UNIT_CALLS}
            data={chartsData.callsStartToByHost}
            hostnames={hostnames}
            name={"CALLS START TO BY HOST"}
          />
        </div>

        <div className="col-6 pr-1">
          <MultipleLine
            type="difference"
            unit={UNIT_CALLS}
            data={chartsData.callsStartFromByrealm}
            hostnames={hostnames}
            name={"CALLS START FROM BY REALM"}
            field={"attrs.realm"}
          />
        </div>

        <div className="col-6 px-1">
          <MultipleLine
            type="difference"
            unit={UNIT_CALLS}
            data={chartsData.callsStartToByrealm}
            hostnames={hostnames}
            name={"CALLS START TO BY REALM"}
            field={"attrs.realm"}
          />
        </div>

        <div className="col-6 pr-1">
          <MultipleLine
            type="rate"
            unit={UNIT_BYTES_SECOND}
            data={chartsData.mediaToByHost}
            hostnames={hostnames}
            name={"MEDIA RELAYED TO BY HOST"}
          />
        </div>

        <div className="col-6 px-1">
          <MultipleLine
            type="rate"
            unit={UNIT_BYTES_SECOND}
            data={chartsData.mediaFromByHost}
            name={"MEDIA RELAYED FROM BY HOST"}
            hostnames={hostnames}
          />
        </div>

        <div className="col-6 pr-1">
          <MultipleLine
            type="rate"
            unit={UNIT_BYTES_SECOND}
            data={chartsData.mediaToByRealm}
            name={"MEDIA RELAYED TO BY REALM"}
            field={"attrs.realm"}
            hostnames={hostnames}
          />
        </div>

        <div className="col-6 px-1">
          <MultipleLine
            type="rate"
            unit={UNIT_BYTES_SECOND}
            data={chartsData.mediaFromByRealm}
            name={"MEDIA RELAYED FROM BY REALM"}
            field={"attrs.realm"}
            hostnames={hostnames}
          />
        </div>
      </div>
    </div>
  );
}

export default RealmCharts;
