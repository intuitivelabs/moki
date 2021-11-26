/*
Class to get data for all charts iin Call dashboard
*/
import React from 'react';

import Dashboard from '../Dashboard.js';
import TimedateStackedChart from '../../charts/timedate_stackedbar.js';
import DonutChart from '../../charts/donut_chart.js';
import ListChart from '../../charts/list_chart.js';
import ValueChart from '../../charts/value_chart.js';
import store from "../../store/index";
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import { parseListData, parseIp, parseStackedbarTimeData, parseBucketData, parseQueryStringData, parseUri } from '@moki-client/es-response-parser';

class ExceededCharts extends Dashboard {

    // Initialize the state
    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            dashboardName: "exceeded/charts",
            eventCallsTimeline: [],
            exceededCount: [],
            exceededType: [],
            topOffenders: [],
            subnets: [],
            ipAddress: [],
            charts: [],
            isLoading: true
        };
        this.callBacks = {
            functors: [
                //EVENT CALLS TIMELINE
                [{ result: 'eventCallsTimeline', func: parseStackedbarTimeData, attrs:["exceeded"] }],

                //EXCEEDED COUNT
                [{ result: 'exceededCount', func: parseQueryStringData }],

                //EXCEEDED TYPE
                [{ result: 'exceededType', func: parseBucketData, attrs:["exceeded"]  }],

                //TOP OFFENDERS
                [{ result: 'topOffenders', func: parseUri, attrs:["attrs.from"]  }],

                //EVENTS BY IP ADDR 
                [{ result: 'ipAddress', func: parseIp, attrs:["attrs.source"]   }],

                //TOP SUBNETS /24 EXCEEDED
                [{ result: 'subnets', func: parseListData, attrs:["attrs.sourceSubnets"]  }]
            ]
        };
    }

    //render GUI
    render() {
        return (<div> {
            this.state.isLoading && < LoadingScreenCharts />
        } <div className="row no-gutters" >
                {this.state.charts["EVENTS OVER TIME"] && <div className="col-auto" style={{"marginRight": "5px"}}>
                    <TimedateStackedChart id="eventsOverTime"
                        data={this.state.eventCallsTimeline}
                        units={"count"}
                        name={"EVENTS OVER TIME"}
                        keys={"exceeded"}
                        width={store.getState().width - 400}
                    />  </div>
                }
                {this.state.charts["INCIDENTS COUNT"] && <div className="col-auto">
                    <ValueChart data={this.state.exceededCount}
                        name={"INCIDENTS COUNT"}
                        biggerFont={"biggerFont"}
                    />  </div>}
                {this.state.charts["EXCEEDED TYPE"] && <div className="col-auto" style={{"marginRight": "5px"}}>
                    <DonutChart data={this.state.exceededType}
                        units={"count"}
                        name={"EXCEEDED TYPE"}
                        id="exceededType"
                        width={(store.getState().width - 300) / 2}
                        height={170}
                        legendSize={50}
                        field="exceeded" />
                </div>}
                {this.state.charts["TOP OFFENDERS"] && <div className="col-auto" >
                    <ListChart data={this.state.topOffenders}
                        name={"TOP OFFENDERS"}
                        field={"attrs.from.keyword"}
                    />  </div>}
                {this.state.charts["TOP SUBNETS /24 EXCEEDED"] && <div className="col-auto">
                    <ListChart data={this.state.subnets}
                        name={"TOP SUBNETS /24 EXCEEDED"}
                        field={"attrs.sourceSubnets"}
                    />  </div>}
                {this.state.charts["EXCEEDED EVENTS BY IP ADDR"] && <div className="col-auto" >
                    <ListChart data={this.state.ipAddress}
                        name={"EXCEEDED EVENTS BY IP ADDR"}
                        field={"attrs.source"}
                    />  </div>
                }
            </div> </div>
        );
    }
}

export default ExceededCharts;
