import React, {
    Component
} from 'react';


import TableChart from '../../charts/table_chart.js';
import store from "../../store/index";
import {
    elasticsearchConnection
} from '@moki-client/gui';
import {parseTable} from '../../dashboards/Dashboard';

class RestrictedExceededTable extends Component {

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

    componentWillUnmount() {
        // fix Warning: Can't perform a React state update on an unmounted component
        this.setState = (state, callback) => {
            return;
        };
    }

    componentDidMount() {
        this.loadData();
    }

    async loadData() {

        var calls = await elasticsearchConnection("restricted/table");
        if ((calls === undefined) || !calls.hits || !calls.hits.hits || (typeof calls === "string" && calls.includes("ERROR:"))) {

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
            <div className="row no-gutters" >
                <TableChart data={
                    this.state.calls
                } total={this.state.total}
                    name={
                        "exceeded"
                    }
                    id={
                        "EXCEEDED EVENTS"
                    }
                    loadData={
                        this.update
                    }
                    tags={this.props.tags}
                />  </div >

        );
    }
}

export default RestrictedExceededTable;
