import React, {
    Component
} from 'react';
import SavingScreen from '../helpers/SavingScreen';
import isNumber from '../helpers/isNumber';
import isIP from '../helpers/isIP';
import isEmail from '../helpers/isEmail';
import deleteIcon from "../../styles/icons/delete_grey.png";
import { elasticsearchConnection } from '@moki-client/gui';
import storePersistent from "../store/indexPersistent";


class Settings extends Component {
    constructor(props) {
        super(props);
        this.load = this.load.bind(this);
        this.save = this.save.bind(this);
        this.check = this.check.bind(this);
        this.generate = this.generate.bind(this);
        this.state = {
            data: [],
            wait: false,
            tags: this.props.tags
        }
    }

    componentWillMount() {
        this.load("/api/setting");
    }


    componentWillReceiveProps(nextProps) {
        if (nextProps.tags !== this.props.tags) {
            this.setState({
                tags: nextProps.tags
            });
        }

    }

    /*
       Load data 
       */
    async load(url) {
        var jsonData;
        try {
            const response = await fetch(url, {
                method: "GET",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Credentials": "include"
                }
            });
            jsonData = await response.json();
            var result = [];
            jsonData.forEach(data => {
                if (data.app === "m_config")
                    result = data.attrs
            });
            this.setState({
                data: result
            });
            console.info("Got general settings data " + JSON.stringify(result));

        } catch (error) {
            console.error(error);
            alert("Problem with receiving settings data. " + error);
        }

    }

    validate(attribute, value, restriction) {
        if (restriction) {
            restriction = JSON.parse(restriction);

            if (restriction.max) {
                if (value > restriction.max) return "Error: " + attribute + " must be lower than " + restriction.max;
            }

            if (restriction.min) {
                if (value < restriction.min) return "Error: " + attribute + " must be higher than " + restriction.min;
            }

            if (restriction.type === "ip") {
                if (value.length === 0) {
                    return true;
                }
                var checkValue = value.split(' ');
                var i = checkValue.map(x => isIP(x));
                if (i.includes(false)) {
                    return "Error: " + attribute + " must have format IP or subnet format.";
                }
            }

            if (restriction.type === "email") {
                if (value.length === 0) {
                    return true;
                }

                if (isEmail(value)) {
                    return true;
                }
                return "Error: " + attribute + " must have email format.";
            }

            if (restriction.type === "number") {
                if (isNumber(value)) {
                    return true;
                }
                return "Error: " + attribute + " must be integer.";
            }

            if (restriction.type === "ldapIP") {
                if (/^(ldap(s)?:\/\/)(((\d{1,3}.){3}\d{1,3}(:\d+)?)|(\[([a-f0-9]{1,4}:{1,2}){1,4}([a-f0-9]{1,4})\]:\d+)|((\w|\d|-|_)+\.)+(\w)+(:\d+)?|([a-f0-9]{1,4}:{1,2}){1,4}([a-f0-9]{1,4}))$/.test(value)) {
                    return true; 
                }
                return "Error: " + attribute + " must have format 'ldap:// + ipv4 or ipv4:port or ipv6 or ip6:port or dns";
            }


            if (restriction.type && restriction.type.enum) {
                if (restriction.type.enum.includes(value)) {
                    return true;
                }
                return "Error: value must be one of " + restriction.type.enum.join('-');
            }

            return true;
        }

        if (attribute === "slowlog_query_warn" || attribute === "slowlog_query_info" || attribute === "slowlog_fetch_warn" || attribute === "slowlog_fetch_info" || attribute === "slowlog_indexing_info" || attribute === "slowlog_indexing_warn" || attribute === "refresh_interval_logstash" || attribute === "refresh_interval_collectd" || attribute === "refresh_interval_exceeded") {
            if (value.slice(-1) === "s" && isNumber(value.slice(0, value.length - 1)) && value.slice(0, value.length - 1) % 1 === 0) {
                return true;
            }
            return "Error: " + attribute + " must have format integer and s suffix.";
        }

        return true;
    }

    check(attribute, value, restriction) {
        var error = this.validate(attribute, value, restriction);
        if (error !== true) {
            this.setState({
                [attribute]: error
            })
        }
        else {
            this.setState({
                [attribute]: ""
            })
        }
    }


    //save data   
    async save() {
        if (this.state.wait !== true) {
            var jsonData = this.state.data;
            var result = [];

            //check if LDAP enabled OR gui auth enabled
            var ldap_enable = false;
            var auth_dis = false;
            var ldapChange = false;
            for (var i = 0; i < jsonData.length; i++) {
                var data = document.getElementById(jsonData[i].attribute);
                if (jsonData[i].attribute === "ldap_enable") {
                    ldap_enable = data.checked;
                    if (jsonData[i].value !== data.checked) {
                        ldapChange = true;
                    }
                }

                if (jsonData[i].attribute === "disable_auth") {
                    auth_dis = data.checked;
                    if (jsonData[i].value !== data.checked) {
                        ldapChange = true;
                    }
                }
            }

            if (auth_dis === true && ldap_enable === false) {
                this.setState({
                    "disable_auth": "You must choose LDAP or GUI authentication"
                })
                window.scrollTo(0, 0);
                return;
            }


            for (i = 0; i < jsonData.length; i++) {
                data = document.getElementById(jsonData[i].attribute);
                if (data.type === "checkbox") {
                    jsonData[i].value = data.checked;
                }
                else if (jsonData[i].attribute === "jwtAdmins" && !Array.isArray(jsonData[i].value)) {
                    jsonData[i].value = jsonData[i].value.split(",");

                } else {
                    jsonData[i].value = data.value;
                }

                var validateResult = this.validate(jsonData[i].attribute, jsonData[i].value, JSON.stringify(jsonData[i].restriction))
                if (validateResult !== true) {
                    alert(validateResult);
                    return;
                }
                result.push({
                    attribute: jsonData[i].attribute,
                    value: jsonData[i].value
                });

            };
            this.setState({
                wait: true
            });
            var thiss = this;

            if (!ldapChange) {
                await fetch("api/save", {
                    method: "POST",
                    body: JSON.stringify({
                        "app": "m_config",
                        "attrs": result
                    }),
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Credentials": "include"
                    }
                }).then(function (response) {
                    thiss.setState({
                        wait: false
                    });
                    if (!response.ok) {
                        console.error(response.statusText);
                    }
                    else {
                        //store new settings in storage
                        result.forEach(res => {
                            jsonData.forEach(data => {
                                if (data.attributes === res.attribute) {
                                    data.value = res.value;
                                }
                            })
                        });
                        let settings = storePersistent.getState().settings;
                        settings[0] = { app: "m_config", attrs: jsonData };
                    }
                    return response.json();
                }).then(function (responseData) {
                    if (responseData.msg && responseData.msg !== "Data has been saved.") {
                        alert(JSON.stringify(responseData.msg));
                    }

                }).catch(function (error) {
                    console.error(error);
                    alert("Problem with saving data. " + error);
                });
            }
            else {
                fetch("api/save", {
                    method: "POST",
                    body: JSON.stringify({
                        "app": "m_config",
                        "attrs": result
                    }),
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Credentials": "include"
                    }

                })


                setTimeout(function () {
                    thiss.setState({
                        wait: false
                    });

                }, 1000);
            }


        }
    }



    generate(dataAlarm) {
        var data = dataAlarm;
        var alarms = [];
        if (data.length !== 0) {
            // Outer loop to create parent
            for (var i = 0; i < data.length; i++) {
                //special case: time format
                if (data[i].attribute === "dateFormat") {
                    alarms.push(
                        <div key={data[i].attribute + "key"} className="tab ">
                            <span className="form-inline row justify-content-start paddingBottom">
                                <span className="col-6" >
                                    <label> {data[i].label} </label>
                                    {data[i].details ? <div className="smallText">{data[i].details}</div> : ""}
                                </span>
                                {<select className="text-left form-control form-check-input" defaultValue={data[i].value} id={data[i].attribute} restriction={JSON.stringify(data[i].restriction)} label={data[i].attribute} onChange={(e) => { this.check(e.target.getAttribute("label"), e.target.value, e.target.getAttribute("restriction")) }} >
                                    <option value={"DD/MM/YYYY"} key={"20/12/2020"}>20/12/2020</option>
                                    <option value={"MM/DD/YYYY"} key={"12/20/2020"}>12/20/2020</option>
                                    <option value={"YYYY-MM-DD"} key={"2020-20-12"}>2020-20-12</option>
                                    <option value={"DD-MMM-YYYY"} key={"20-Dec-2020"}>20-Dec-2020</option>
                                    <option value={"DD MMM, YYYY"} key={"20 Dec, 2020"}>20 Dec, 2020</option>
                                    <option value={"MMM DD, YYYY"} key={"Dec 20, 2020"}>Dec 20, 2020</option>
                                </select>}
                            </span></div>);
                }
                //special case:  date format
                else if (data[i].attribute === "timeFormat") {
                    alarms.push(
                        <div key={data[i].attribute + "key"} className="tab ">
                            <span className="form-inline row justify-content-start paddingBottom">
                                <span className="col-6" >
                                    <label> {data[i].label} </label>
                                    {data[i].details ? <div className="smallText">{data[i].details}</div> : ""}
                                </span>
                                {<select className="text-left form-control form-check-input" defaultValue={data[i].value} id={data[i].attribute} restriction={JSON.stringify(data[i].restriction)} label={data[i].attribute} onChange={(e) => { this.check(e.target.getAttribute("label"), e.target.value, e.target.getAttribute("restriction")) }} >
                                    <option value={"hh:mm:ss A"} key={"9:40 AM"}>7:40:20 AM</option>
                                    <option value={"HH:mm:ss"} key={"9:40:20"}>19:40:20</option>
                                </select>}
                            </span></div>);
                }
                //special case: number restriction
                else if (data[i].restriction && (data[i].restriction.min || data[i].restriction.max)) {
                    alarms.push(
                        <div key={data[i].attribute + "key"} className="tab ">
                            <span className="form-inline row justify-content-start paddingBottom">
                                <span className="col-6" >
                                    <label> {data[i].label} </label>
                                    {data[i].details ? <div className="smallText">{data[i].details}</div> : ""}
                                </span>
                                {<input className="text-left form-control form-check-input" type="number" min={data[i].restriction.min} max={data[i].restriction.max ? data[i].restriction.max : ""} defaultValue={data[i].value} id={data[i].attribute} restriction={JSON.stringify(data[i].restriction)} label={data[i].attribute} onChange={(e) => { this.check(e.target.getAttribute("label"), e.target.value, e.target.getAttribute("restriction")) }} />}
                                {this.state[data[i].attribute] ? <span className="col-3 errorStay" >{this.state[data[i].attribute]}</span> : ""}
                            </span></div>);
                }
                //special case: select input for enum type
                else if (data[i].restriction && data[i].restriction.type && data[i].restriction.type.enum) {
                    alarms.push(
                        <div key={data[i].attribute + "key"} className="tab ">
                            <span className="form-inline row justify-content-start paddingBottom">
                                <span className="col-6" >
                                    <label> {data[i].label} </label>
                                    {data[i].details ? <div className="smallText">{data[i].details}</div> : ""}
                                </span>
                                {<select className="text-left form-control form-check-input" defaultValue={data[i].value} id={data[i].attribute} restriction={JSON.stringify(data[i].restriction)} label={data[i].attribute} onChange={(e) => { this.check(e.target.getAttribute("label"), e.target.value, e.target.getAttribute("restriction")) }} >
                                    {data[i].restriction.type.enum.map((e, i) => {
                                        return (<option value={e} key={e}>{e}</option>)
                                    })}
                                </select>
                                }

                                {this.state[data[i].attribute] ? <span className="col-3 errorStay" >{this.state[data[i].attribute]}</span> : ""}
                            </span></div>);

                }
                else {
                    alarms.push(
                        <div key={data[i].attribute + "key"} className="tab ">
                            <span className="form-inline row justify-content-start paddingBottom">
                                <span className="col-6" >
                                    <label> {data[i].label} </label>
                                    {data[i].details ? <div className="smallText">{data[i].details}</div> : ""}
                                </span>
                                {data[i].type === "boolean" ? data[i].value ? <input className="text-left form-check-input" type="checkbox" defaultChecked="true" id={data[i].attribute} /> :
                                    <input className="text-left form-check-input" type="checkbox" id={data[i].attribute} />
                                    : <input className="text-left form-control form-check-input" type={data[i].type} defaultValue={data[i].value} id={data[i].attribute} label={data[i].attribute} restriction={JSON.stringify(data[i].restriction)} onChange={(e) => { this.check(e.target.getAttribute("label"), e.target.value, e.target.getAttribute("restriction")) }} />
                                }
                                {this.state[data[i].attribute] ? <span className="col-3 errorStay" >{this.state[data[i].attribute]}</span> : ""}

                            </span></div>);
                }
            }
        }
        return alarms
    }

    generateTags() {
        var data = this.state.tags;

        var tags = [];
        if (data.length !== 0) {
            for (var i = 0; i < data.length; i++) {
                tags.push(<div key={data[i].key} className="tab">
                    <span className="form-inline row justify-content-start paddingBottom" >
                        <img className="icon"
                            alt="deleteIcon"
                            src={deleteIcon}
                            title="delete tag"
                            onClick={this.deleteTag.bind(this)}
                            id={data[i].key}
                        />
                        <label className="col-4" > {
                            data[i].key + " (" + data[i].doc_count + ")"
                        } </label>
                    </span>
                </div>);
            }
        } else {
            tags.push(< div className="tab" key="notags"> No tags. Create them directly in event's table.</div>);
        }
        return tags
    }

    async deleteTag(e) {
        var tag = e.currentTarget.id;
        var data = await elasticsearchConnection("/api/tag/delete", { id: "", index: "", tags: tag });
        if (data.deleted >= 0) {
            var tags = this.state.tags;
            for (var i = 0; i < tags.length; i++) {
                if (tags[i].key === tag) {
                    tags.splice(i, 1);
                }
            }
            //this.props.getTags();
            this.setState({
                tags: tags
            });
        } else {
            alert(JSON.stringify(data));
        }

    }


    render() {

        var data = this.state.data;
        var General = [];
        var Slowlog = [];
        var LE = [];
        var Events = [];
        var Auth = [];

        //separate type
        for (var i = 0; i < data.length; i++) {
            if (data[i].category === "General") {
                General.push(data[i]);
            } else if (data[i].category === "Slowlog") {
                Slowlog.push(data[i]);
            } else if (data[i].category === "Logstash and elasticsearch") {
                LE.push(data[i]);
            } else if (data[i].category === "Events") {
                Events.push(data[i]);
            }
            else if (data[i].category === "Authentication") {
                Auth.push(data[i]);
            }
        }

        var Generaldata = this.generate(General);
        var Slowlogdata = this.generate(Slowlog);
        var LEdata = this.generate(LE);
        var Eventsdata = this.generate(Events);
        var Authdata = this.generate(Auth);
        //        var Tagdata = this.generateTags();


        return (<div className="container-fluid" > {this.state.wait && < SavingScreen />}
            <div className="chart"><p className="settingsH" style={{ "marginTop": "30px" }}> General </p> {Generaldata} </div>
            <div className="chart"><p className="settingsH" > Authentication </p> {Authdata}</div>
            <div className="chart"><p className="settingsH" > Events </p> {Eventsdata} </div>
            <div className="chart"><p className="settingsH" > Elasticsearch and logstash </p> {LEdata} </div>
            <div className="chart"><p className="settingsH" > Slowlog </p> {Slowlogdata} </div>
            <div className="btn-group rightButton" >
                <button type="button"
                    className="btn btn-primary "
                    onClick={this.save}
                    style={{ "marginRight": "5px" }} > Save </button>
                <button type="button"
                    className="btn btn-secondary"
                    onClick={() => this.load("api/defaults")} > Reset </button>
            </div >
        </div>
        )
    }

}

export default Settings;
