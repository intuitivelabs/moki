/*
Class to get data for all charts iin Call dashboard
*/

import React from 'react';
import Dashboard from '../Dashboard.js';
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import store from "../../store/index";
import MultipleLineChart from '../../charts/multipleLine_chart';
import {parseMultipleLineData} from 'es-response-parser';


class SystemCharts extends Dashboard {

    // Initialize the state
    constructor(props) {
        super(props);
        this.state = {
            dashboardName: "system/charts",
            shortterm: [],
            midterm: [],
            longterm: [],
            memoryFree: [],
            memoryUsed: [],
            memoryCached: [],
            memoryBuffered: [],
            uas: [],
            uac: [],
            cpuUser: [],
            cpuSystem: [],
            cpuIdle: [],
            isLoading: false,
            hostnames: []

        };
        this.callBacks = {
            functors: [
              //LOAD-SHORTTERM
              [{result: 'shortterm', func: parseMultipleLineData}],

              //LOAD-midTERM
              [{result: 'midterm', func: parseMultipleLineData}],

              //LOAD-SHORTTERM
              [{result: 'longterm', func: parseMultipleLineData}],

              //MEMORY FREE
              [{result: 'memoryFree', func: parseMultipleLineData}],

              //MEMORY USED
              [{result: 'memoryUsed', func: parseMultipleLineData}],

              //MEMORY CACHED
              [{result: 'memoryCached', func: parseMultipleLineData}],

              //MEMORY BUFFERED
              [{result: 'memoryBuffered', func: parseMultipleLineData}],

              //UAS
              [{result: 'uas', func: parseMultipleLineData}],

              //UAC
              [{result: 'uac', func: parseMultipleLineData}],

              //CPU-USER
              [{result: 'cpuUser', func: parseMultipleLineData}],

              //CPU-SYSTEM
              [{result: 'cpuSystem', func: parseMultipleLineData}],

              //CPU-IDLE
              [{result: 'cpuIdle', func: parseMultipleLineData}]
            ]
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.hostnames !== prevState.hostnames) {
            return { hostnames: nextProps.hostnames };
        }
        else return null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.hostnames !== this.props.hostnames) {
            this.setState({ hostnames: this.props.hostnames });
        }
    }

    //render GUI
    render() {

        return (<
            div > {
                this.state.isLoading && < LoadingScreenCharts />
            }

            <
            div className="row no-gutters" >
                <
            div className="col" >
                    <
                        MultipleLineChart id="shortterm"
                        data={
                            this.state.shortterm
                        }
                        name={
                            "LOAD-SHORTTERM"
                        }
                        width={
                            (store.getState().width - 250) / 3
                        }

                        hostnames={this.state.hostnames}

                        ticks={
                            3
                        }
                    />                            <
            /div> <
            div className="col" >
                        <
                            MultipleLineChart id="midterm"
                            data={
                                this.state.midterm
                            }
                            name={
                                "LOAD-MIDTERM"
                            }
                            hostnames={this.state.hostnames}
                            width={
                                (store.getState().width - 250) / 3
                            }
                            ticks={
                                3
                            }
                        />                            <
            /div> <
            div className="col" >
                            <
                                MultipleLineChart id="longterm"
                                data={
                                    this.state.longterm
                                }
                                name={
                                    "LOAD-LONGTERM"
                                }
                                hostnames={this.state.hostnames}
                                width={
                                    (store.getState().width - 250) / 3
                                }
                                ticks={
                                    3
                                }
                            />                            <
            /div> <
            div className="col" >
                                <
                                    MultipleLineChart id="memoryFree"
                                    data={
                                        this.state.memoryFree
                                    }
                                    hostnames={this.state.hostnames}
                                    name={
                                        "MEMORY-FREE"
                                    }
                                    width={
                                        (store.getState().width - 250) / 3
                                    }
                                    ticks={
                                        3
                                    }
                                />                            <
            /div>

            <
            div className="col" >
                                    <
                                        MultipleLineChart id="memoryUsed"
                                        data={
                                            this.state.memoryUsed
                                        }
                                        hostnames={this.state.hostnames}
                                        name={
                                            "MEMORY-USED"
                                        }
                                        width={
                                            (store.getState().width - 250) / 3
                                        }
                                        ticks={
                                            3
                                        }
                                    />                            <
            /div>

            <
            div className="col" >
                                        <
                                            MultipleLineChart id="memoryCached"
                                            hostnames={this.state.hostnames}
                                            data={
                                                this.state.memoryCached
                                            }
                                            name={
                                                "MEMORY-CACHED"
                                            }
                                            width={
                                                (store.getState().width - 250) / 3
                                            }
                                            ticks={
                                                3
                                            }
                                        />                            <
            /div>

            <
            div className="col" >
                                            <
                                                MultipleLineChart id="memoryBuffered"
                                                data={
                                                    this.state.memoryBuffered
                                                }
                                                hostnames={this.state.hostnames}
                                                name={
                                                    "MEMORY-BUFFERED"
                                                }
                                                width={
                                                    (store.getState().width - 250) / 3
                                                }
                                                ticks={
                                                    3
                                                }
                                            />                            <
            /div>

            <
            div className="col" >
                                                <
                                                    MultipleLineChart id="uas"
                                                    data={
                                                        this.state.uas
                                                    }
                                                    name={
                                                        "UAS SIP trans."
                                                    }
                                                    hostnames={this.state.hostnames}
                                                    width={
                                                        (store.getState().width - 250) / 3
                                                    }
                                                    ticks={
                                                        3
                                                    }
                                                />                            <
            /div>

            <
            div className="col" >
                                                    <
                                                        MultipleLineChart id="uac"
                                                        data={
                                                            this.state.uac
                                                        }
                                                        name={
                                                            "UAC SIP trans."
                                                        }
                                                        hostnames={this.state.hostnames}
                                                        width={
                                                            (store.getState().width - 250) / 3
                                                        }
                                                        ticks={
                                                            3
                                                        }
                                                    />                            <
            /div>

            <
            div className="col" >
                                                        <
                                                            MultipleLineChart id="cpuUser"
                                                            data={
                                                                this.state.cpuUser
                                                            }
                                                            hostnames={this.state.hostnames}
                                                            name={
                                                                "CPU-USER"
                                                            }
                                                            width={
                                                                (store.getState().width - 250) / 3
                                                            }
                                                            ticks={
                                                                3
                                                            }
                                                        />                            <
            /div>

            <
            div className="col" >
                                                            <
                                                                MultipleLineChart id="cpuSystem"
                                                                data={
                                                                    this.state.cpuSystem
                                                                }
                                                                hostnames={this.state.hostnames}
                                                                name={
                                                                    "CPU-SYSTEM"
                                                                }
                                                                width={
                                                                    (store.getState().width - 250) / 3
                                                                }
                                                                ticks={
                                                                    3
                                                                }
                                                            />                            <
            /div> <
            div className="col" >
                                                                <
                                                                    MultipleLineChart id="cpuIdle"
                                                                    data={
                                                                        this.state.cpuIdle
                                                                    }
                                                                    hostnames={this.state.hostnames}
                                                                    name={
                                                                        "CPU-IDLE"
                                                                    }
                                                                    width={
                                                                        (store.getState().width - 250) / 3
                                                                    }
                                                                    ticks={
                                                                        3
                                                                    }
                                                                />                            <
            /div>

            <
            /div> <
            /div>
        );
    }
}

export default SystemCharts;
