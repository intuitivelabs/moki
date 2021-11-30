import React, {
    Component
} from 'react';


import TableChart from '../../charts/table_chart.js';
import store from "../../store/index";
import {
    elasticsearchConnection
} from '@moki-client/gui';
import { parseTable } from '../../dashboard/Dashboard';

class DiagnosticsTable extends Component {

    // Initialize the state
    constructor(props) {
        super(props);
        this.loadData = this.loadData.bind(this);
        this.state = {
            calls: [],
            total: 0
        }
        store.subscribe(() => this.loadData());
    }

    componentDidMount() {
        this.loadData();
    }

    componentWillUnmount() {
        // fix Warning: Can't perform a React state update on an unmounted component
        this.setState = (state, callback) => {
            return;
        };
    }

    async loadData() {
        var calls = await elasticsearchConnection("diagnostics/table");

        if (calls === undefined || (typeof calls === "string" && calls.includes("ERROR:"))) {

            console.error(calls);
            return;
        } else if (calls) {

            var data = await parseTable(calls.hits.hits);
            var total = calls.hits.total.value;
            this.setState({
                calls: data,
                total: total
            });
        }
    }

    render() {
        return (
            <
            div className="row no-gutters" >
                <
                    TableChart data={
                        this.state.calls
                    }
                    name={
                        "diagnostics"
                    } total={this.state.total}
                    id={
                        "DIAGNOSTICS EVENTS"
                    }
                    tags={this.props.tags}
                />  <
            /div>
                );
    }
}

                export default DiagnosticsTable;
