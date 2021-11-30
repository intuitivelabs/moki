import React, {
    Component
} from 'react';


import TableChart from '../../charts/table_chart.js';
import store from "../../store/index";
import {
    elasticsearchConnection
} from '@moki-client/gui';
import {parseTable} from '../../dashboards/Dashboard';

class RegistrationTable extends Component {

    // Initialize the state
    constructor(props) {
        super(props);
        this.loadData = this.loadData.bind(this);
        this.state = {
            registrations: [],
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
        var calls = await elasticsearchConnection("registration/table");

        if (calls === undefined || !calls.hits || !calls.hits.hits || (typeof calls === "string" && calls.includes("ERROR:"))) {

            return;
        } else if (calls) {
            var data = await parseTable(calls.hits.hits);
            var total = calls.hits.total.value;
            this.setState({
                registrations: data,
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
                        this.state.registrations
                    }
                    name={
                        "registration"
                    } total={this.state.total}
                    id={
                        "REGISTRATION EVENTS"
                    }
                    tags={this.props.tags}
                />  <
            /div> 
        );
    }
}

export default RegistrationTable;
