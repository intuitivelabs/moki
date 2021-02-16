/*
Class to get data for all charts iin Call dashboard
*/
import React from 'react';

import Dashboard from '../Dashboard.js';
import store from "../../store/index";
import ListChart from '../../charts/list_chart.js';
import DonutChart from '../../charts/donut_chart.js';
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import {parseListData, parseListDataCardinality, parseBucketData} from '../../es-response-parser/index.js';


class MicroanalysisCharts extends Dashboard {

    // Initialize the state
    constructor(props) {
      super(props);
      this.state = {
        dashboardName: "microanalysis/charts",
        typesCount: [],
        fromUA: [],
        sipMethod: [],
        sipCode: [],
        topSubnets: [],
        prefixStripped: [],
        sourceIP: [],
        top10from: [],
        callerDomain: [],
        top10to: [],
        distinctDestinations: [],
        topCallAttempts: [],
        topCallEnds: [],
        destination: [],
        sumDuration: [],
        topDuration: [],
        topDuration5: [],
        topSBC: [],
        srcCA: [],
        dstCA: [],
        originator: [],
        isLoading: true
      }
      this.callBacks = {
        functors: [
          //parse data
          //TYPES 0
          [{result: 'typesCount', func: parseBucketData}],

          //FROM UA 1
          [{result: 'fromUA', func: parseListData}],

          //SIP METHOD 2
          [{result: 'sipMethod', func: parseListData}],

          //SIP CODE 3
          [{result: 'sipCode', func: parseListData}],

          //TOP SUBNETS 4
          [{result: 'topSubnets', func: parseListData}],

          //r-URI PREFIX STRIPPED 5
          [{result: 'prefixStripped', func: parseListData}],

          //SOURCE IP ADDRESS 6
          [{result: 'sourceIP', func: this.parseListData}],

          //TOP 10 FROM 7
          [{result: 'top10from', func: parseListData}],

          //CALLER DOMAIN 8
          [{result: 'callerDomain', func: parseListData}],

          //TOP 10 TO 9
          [{result: 'top10to', func: parseListData}],

          //DOMAIN STATS 10
          [{result: 'distinctDestinations', func: parseListDataCardinality}],

          //TOP CALL ATTEMPTS 11
          [{result: 'topCallAttempts', func: parseListData}],

          //TOP CALL ENDS 12
          [{result: 'topCallEnds', func: parseListData}],

          //DESTINATION BY R-URI 13
          [{result: 'destination', func: parseListData}],

          //SUM DURATION 14
          [{result: 'sumDuration', func: parseListDataCardinality}],

          //TOP DURATION 15
          [{result: 'topDuration', func: parseListDataCardinality}],

          //TOP DURATION < 5 sec 16
          [{result: 'topDuration5', func: parseListData}],

          //TOP SBCs 17
          [{result: 'topSBC', func: parseListData}],

          //SRC CA 18
          [{result: 'srcCA', func: parseListData}],

          //DST CA 19
          [{result: 'dstCA', func: parseListData}],

          //ORIGINATOR 20
          [{result: 'originator', func: parseListData}]
        ]
      }
    }
  
  /* parseListData will call the exported one with encryption turned on */
  parseListData(data) {
    return parseListData(data, true);
  }

    //render GUI
    render() {
        console.log("------------------");
        console.log(this.state.sourceIP);
        return (<
            div > {
                this.state.isLoading && < LoadingScreenCharts />
            }

            <
            div className="row no-gutters" >
                <
            div className="col" >
                    <
                        DonutChart data={
                            this.state.typesCount
                        }
                        units={"count"}
                        name={
                            "TYPES"
                        }
                        id="types"
                        width={
                            store.getState().width / 2 - 150
                        }
                        legendSize={
                            50
                        }
                        height={
                            200
                        }
                        field="attrs.type" />
                    <
            /div> <
            div className="col" >
                        <
                            ListChart data={
                                this.state.fromUA
                            }
                            name={
                                "FROM UA"
                            }
                            field={
                                "attrs.from-ua"
                            }
                        />   < /
            div > <
            /div> <
            div className="row no-gutters" >
                            <
            div className="col" >
                                <
                                    ListChart data={
                                        this.state.sipMethod
                                    }
                                    name={
                                        "SIP METHOD"
                                    }
                                    field={
                                        "attrs.method"
                                    }
                                />  < /
            div > <
            div className="col" >
                                    <
                                        ListChart data={
                                            this.state.sipCode
                                        }
                                        name={
                                            "SIP CODE"
                                        }
                                        field={
                                            "attrs.sip-code"
                                        }
                                    />  < /
            div > <
            div className="col" >
                                        <
                                            ListChart data={
                                                this.state.topSubnets
                                            }
                                            name={
                                                "TOP SUBNETS /24"
                                            }
                                            field={
                                                "attrs.sourceSubnets"
                                            }
                                        />  < /
            div > <
            div className="col" >
                                            <
                                                ListChart data={
                                                    this.state.prefixStripped
                                                }
                                                name={
                                                    "r-URI"
                                                }
                                                field={
                                                    "attrs.r-uri-shorted"
                                                }
                                            />  < /
            div > <
            div className="col" >
                                                <
                                                    ListChart data={
                                                        this.state.sourceIP
                                                    }
                                                    name={
                                                        "SOURCE IP ADDRESS"
                                                    }
                                                    field={
                                                        "attrs.source"
                                                    }
                                                />  < /
            div > <
            div className="col" >
                                                    <
                                                        ListChart data={
                                                            this.state.srcCA
                                                        }
                                                        name={
                                                            "SRC CA"
                                                        }
                                                        field={
                                                            "attrs.src_ca_name"
                                                        }
                                                    />  < /
            div > <
            div className="col" >
                                                        <
                                                            ListChart data={
                                                                this.state.dstCA
                                                            }
                                                            name={
                                                                "DST CA"
                                                            }
                                                            field={
                                                                "attrs.dst_ca_name"
                                                            }
                                                        />  < /
            div > <
            div className="col" >
                                                            <
                                                                ListChart data={
                                                                    this.state.originator
                                                                }
                                                                name={
                                                                    "ORIGINATOR"
                                                                }
                                                                field={
                                                                    "attrs.originator"
                                                                }
                                                            />  < /
            div > <
            div className="col" >
                                                                <
                                                                    ListChart data={
                                                                        this.state.top10from
                                                                    }
                                                                    name={
                                                                        "TOP 10 FROM"
                                                                    }
                                                                    field={
                                                                        "attrs.from.keyword"
                                                                    }
                                                                />  < /
            div > <
            div className="col" >
                                                                    <
                                                                        ListChart data={
                                                                            this.state.callerDomain
                                                                        }
                                                                        name={
                                                                            "CALLER DOMAIN"
                                                                        }
                                                                        field={
                                                                            "attrs.from-domain"
                                                                        }
                                                                    />  < /
            div > <
            div className="col" >
                                                                        <
                                                                            ListChart data={
                                                                                this.state.top10to
                                                                            }
                                                                            name={
                                                                                "TOP 10 TO"
                                                                            }
                                                                            field={
                                                                                "attrs.to.keyword"
                                                                            }
                                                                        />  < /
            div > <
            div className="col" >
                                                                            <
                                                                                ListChart data={
                                                                                    this.state.distinctDestinations
                                                                                }
                                                                                name={
                                                                                    "DISTINCT DESTINATIONS"
                                                                                }
                                                                                field={
                                                                                    "attrs.from.keyword"
                                                                                }
                                                                            />  < /
            div >

            <
            div className="col" >
                                                                                <
                                                                                    ListChart data={
                                                                                        this.state.topCallAttempts
                                                                                    }
                                                                                    name={
                                                                                        "TOP CALL ATTEMPTS"
                                                                                    }
                                                                                    field={
                                                                                        "attrs.from.keyword"
                                                                                    }
                                                                                />  < /
            div > <
            div className="col" >
                                                                                    <
                                                                                        ListChart data={
                                                                                            this.state.topCallEnds
                                                                                        }
                                                                                        name={
                                                                                            "TOP CALL ENDS"
                                                                                        }
                                                                                        field={
                                                                                            "attrs.from-keyword"
                                                                                        }
                                                                                    />  < /
            div > <
            div className="col" >
                                                                                        <
                                                                                            ListChart data={
                                                                                                this.state.destination
                                                                                            }
                                                                                            name={
                                                                                                "DESTINATION BY R-URI"
                                                                                            }
                                                                                            field={
                                                                                                "attrs.r-uri.keyword"
                                                                                            }
                                                                                        />  < /
            div > <
            div className="col" >
                                                                                            <
                                                                                                ListChart data={
                                                                                                    this.state.sumDuration
                                                                                                }
                                                                                                name={
                                                                                                    "SUM DURATION"
                                                                                                }
                                                                                                field={
                                                                                                    "attrs.from.keyword"
                                                                                                }
                                                                                            />  < /
            div > <
            div className="col" >
                                                                                                <
                                                                                                    ListChart data={
                                                                                                        this.state.topDuration
                                                                                                    }
                                                                                                    name={
                                                                                                        "TOP DURATION"
                                                                                                    }
                                                                                                    field={
                                                                                                        "attrs.from.keyword"
                                                                                                    }
                                                                                                />  < /
            div > <
            div className="col" >
                                                                                                    <
                                                                                                        ListChart data={
                                                                                                            this.state.topDuration5
                                                                                                        }
                                                                                                        name={
                                                                                                            "TOP DURATION < 5 sec"
                                                                                                        }
                                                                                                        field={
                                                                                                            "attrs.from.keyword"
                                                                                                        }
                                                                                                    />  < /
            div > <
            div className="col" >
                                                                                                        <
                                                                                                            ListChart data={
                                                                                                                this.state.topSBC
                                                                                                            }
                                                                                                            name={
                                                                                                                "TOP SBCs LIST"
                                                                                                            }
                                                                                                            field={
                                                                                                                "attrs.sbc"
                                                                                                            }
                                                                                                        />  < /
            div > <
            /div> < /
            div >
        );
    }
}

export default MicroanalysisCharts;
