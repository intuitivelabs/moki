import React, { Component } from 'react';
import { isHostnameOrIp, isHostname } from './isHostnameOrIp';
import querySrv from './querySrv';

const ccmAddrLabel = "Hostname or IP of CCM";
const ccmProxiedLabel = "Proxy CCM authentication behind ABC Monitor";
const ccmRedirectedLabel = "Redirect to CCM authentication";

export default class FirstLoginPopup extends Component {

    constructor(props) {
        super(props);
        this.state = {
            error: ""
        };
        this.save = this.save.bind(this);
        this.keyDown = this.keyDown.bind(this);
    }

    // Return part of the string behind 2nd last dot. E.g. from 'mon.example.com' it return the 'example.com'
    getDomain(val){
        // get position of last dot
        let lastDot = val.lastIndexOf('.');
        if (lastDot < 0) return '';

        // get position of 2nd last dot
        lastDot = val.lastIndexOf('.', lastDot-1);
        if (lastDot < 0) return '';

        return val.slice(lastDot + 1);
    }

    // Check whether two hostnames belong to the same domain, like:
    // 'ccm.example.com' and 'monitor.example.com'
    isFromSameDomain(val1, val2){
        const dom1 = this.getDomain(val1);
        const dom2 = this.getDomain(val2);

        if (!dom1 || !dom2 || dom1 !== dom2) return false;
        return true;
    }

    validate(){

        const ccmAddr = document.getElementById("ccmAddr").value;
        const ccmProxied = document.getElementById("ccmModeProxied").checked;

        if (ccmAddr.trim() === "") {
            this.setState({ "error": `${ccmAddrLabel} must be filled.` });
            return false;
        }

        if (!isHostnameOrIp(ccmAddr)) {
            this.setState({ "error": `${ccmAddrLabel} must contain hostname or IP address.` });
            return false;
        }

        if (!ccmProxied){
            // When CCM is running on the same host as monitor, single-sign-on
            // is working too and we do not need those limitations on hostname etc.
            if (window.location.hostname == ccmAddr) return true;

            if (!isHostname(window.location.hostname)) {
                this.setState({ "error": `When CCM is not proxied behind monitor, the monitor shall be accessed by hostname, not by IP address (${window.location.hostname}).` });
                return false;
            }

            if (!isHostname(ccmAddr)) {
                this.setState({ "error": `When CCM is not proxied behind monitor ${ccmAddrLabel} must contain hostname.` });
                return false;
            }

            if (!this.isFromSameDomain(ccmAddr, window.location.hostname)){
                this.setState({ "error": `When CCM is not proxied behind monitor, the hostname in ${ccmAddrLabel} field must belong to the same domain as the monitor (${this.getDomain(window.location.hostname)}).` });
                return false;
            }
        }

        return true;
    }

    async save() {
        this.setState({ "error": "" });

        if (!this.validate()) return;

        document.getElementById("createR").style.display = "none";
        document.getElementById("create").style.display = "block";

        const ccmAddr = document.getElementById("ccmAddr").value;
        const ccmProxied = document.getElementById("ccmModeProxied").checked;

        try {
            var response = await querySrv("/api/firsttimelogin/save", {
                method: "POST",
                body:
                    JSON.stringify({
                        ccmAddr    : ccmAddr,
                        ccmProxied : ccmProxied
                    }),
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Credentials": "include"
                }
            })

            if (response.status !== 200) {
                document.getElementById("createR").style.display = "block";
                document.getElementById("create").style.display = "none";
                this.setState({ "error": "Problem to save values." });
            }

            var res = await response.json();
            if (res.error) {
                this.setState({ "error": res.error });
                document.getElementById("createR").style.display = "block";
                document.getElementById("create").style.display = "none";
            }
            else {
                // var thiss = this;
                setTimeout(function () {
                    // thiss.props.setFirstTimeLogin(false);
                    window.location.reload();
                }, 10000);
            }
        }
        catch (error) {
            this.setState({ "error": error });
            document.getElementById("createR").style.display = "block";
            document.getElementById("create").style.display = "none";
        }
    }

    keyDown(e){
        if (e.key === "Enter") {
            e.preventDefault();
            this.save();
          }
    }

    render() {
        return (
            <div className="container firstLoginPopup">
                <hr />
                    <h3 className="text-center">Welcome to the ABC Monitor</h3>
                <hr />

                <p  className="text-justify">
                    An ABC Cluster Config Manager (CCM) is used for user authentication.
                    Its URL or IP can be set here.
                </p>

                <p className="text-justify">
                    A “Proxy” mode can be used, or a “Redirect” mode. In the proxy mode,
                    the CCM is proxied behind the ABC Monitor for authentication.
                    This allows using IP addresses, i.e. deployment without DNS,
                    and also e.g. allows to use the monitor GUI via an SSH tunnel
                    as everything is behind a single IP address.
                </p>

                <p className="text-justify">
                    The “Redirect” mode supports single-sign-on for ABC Monitor and
                    CCM GUI; a FQDN (not an IP address) must used for accessing
                    both ABC Monitor and CCM and they need to be in the same domain.
                    In the case both CCM and ABC Monitor are running on same IP address
                    the “Redirect” mode is supported too and FQDN is not required
                    in this special case.
                </p>

                <hr />

                <div className="row align-items-center">
                    <div className="form-check col-auto">
                        <input type="radio" name="ccmMode" id="ccmModeProxied" className="mb-0" />
                    </div>
                    <label className="col form-check-label" htmlFor="ccmModeProxied">{ccmProxiedLabel}</label>
                </div>

                <div className="row align-items-center">
                    <div className="form-check col-auto">
                        <input type="radio" name="ccmMode" id="ccmModeRedirected" className="mb-0" defaultChecked />
                    </div>
                    <label className="col form-check-label" htmlFor="ccmModeRedirected">{ccmRedirectedLabel}</label>
                </div>

                <div className="row align-items-center">
                    <label className="col-auto col-form-label" htmlFor="ccmAddr">{ccmAddrLabel}</label>
                    <input type="text" id="ccmAddr" required className="form-control col" onKeyDown={(e) => this.keyDown(e)} />
                </div>

                {this.state.error ? <p className="error">{this.state.error}</p> : ""}

                <hr />
                <div style={{ "textAlign": "center" }} className="mt-4">
                    <button onClick={this.save} style={{ "marginRight": "5px" }} className="btn btn-primary"><i className="fa fa-circle-o-notch fa-spin" id="create" style={{ "display": "none" }}></i> <span id="createR">Save</span> </button>
                </div>
            </div>
        )
    }
}


