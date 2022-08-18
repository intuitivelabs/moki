import React, {
  Component
} from 'react';
import { createFilter } from '@moki-client/gui';
import filter from "../../styles/icons/filter.png";
import unfilter from "../../styles/icons/unfilter.png";
import emptyIcon from "../../styles/icons/empty_small.png";
import Animation from '../helpers/Animation';
import CountryFlag from "../helpers/countryFlag";
import storePersistent from "../store/indexPersistent";
import clipboardIcon from "../../styles/icons/clipboard.png";

class TableChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data
    }
    this.filter = this.filter.bind(this);
    this.setData = this.setData.bind(this);
  }

  filter(event) {
    createFilter(event.currentTarget.getAttribute('field') + ":\"" + event.currentTarget.getAttribute('value') + "\"");
  }


  unfilter(event) {
    createFilter("NOT " + event.currentTarget.getAttribute('field') + ":\"" + event.currentTarget.getAttribute('value') + "\"");
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.state.data) {
      this.setState({ data: nextProps.data });
    }
  }

  setData(data) {
    this.setState({ data: data });
  }

 encryptedAttr(value) {
    let isEncrypted = false;
    let field = this.props.field;

    //fix for keyword type in attribute's name
    field = field === "attrs.from.keyword" ? "attrs.from" : field;
    field = field === "attrs.to.keyword" ? "attrs.to" : field;
    field = field === "attrs.r-uri.keyword" ? "attrs.r-uri" : field;

    if (storePersistent.getState().profile[0] && storePersistent.getState().profile[0].userprefs.mode && storePersistent.getState().profile[0].userprefs.mode === "anonymous" && storePersistent.getState().profile[0].userprefs.anonymizableAttrs[field] ) {
      isEncrypted = true;
    }

    return <span style={{ "color": isEncrypted ? "darkred" : "#212529" }}>{value}</span>
  }

  render() {
    function niceNumber(nmb, name) {
      if (name.includes("DURATION") && name !== "DURATION GROUP" && name !== "TOP DURATION < 5 sec") {
        var sec_num = parseInt(nmb, 10);

        var days = Math.floor(sec_num / 86400) ? Math.floor(sec_num / 86400) + "d" : "";

        var hours = Math.floor(sec_num / 3600) ? Math.floor(sec_num / 3600) + "h" : "";

        var minutes = Math.floor((sec_num % 3600) / 60) ? Math.floor((sec_num % 3600) / 60) + "m" : "";

        var seconds = sec_num % 60 ? sec_num % 60 + "s" : "";

        //don't  display seconds if value is in days
        if (days) {
          seconds = "";
        }

        if (!days && !hours && !minutes && !seconds) return "0s";
        return days + " " + hours + " " + minutes + " " + seconds;
      }
      else if (nmb) {
        return nmb.toLocaleString();
      } else {
        return 0;
      }
    }

    function roundNumber(nmb) {
      if (nmb) {
        return nmb.toFixed(2).toLocaleString();
      }
      else return nmb;
    }

    function shortText(string) {
      if (string.length > 40) {
        return string.substring(0, 40) + '...';
      }
      else {
        return string;
      }
    }

    //copy value in table to clipboard and show msg
    function copyToclipboard(value) {
      var dummy = document.createElement("textarea");
      document.body.appendChild(dummy);
      dummy.value = value;
      dummy.select();
      document.execCommand("copy");
      document.body.removeChild(dummy);

      document.getElementById("copyToClipboardText" + value).style.display = "inline";
      setTimeout(function () {
        document.getElementById("copyToClipboardText" + value).style.display = "none";
      }, 1000);
    }

    function longestText(data) {
      var longestText = 0;
      for (var i = 0; i < data[0].length; i++) {
        if (data[0][i].key.length > longestText) {
          longestText = data[0][i].key.length;
        }
      }
      return longestText < 30 ? longestText : 30;
    }
    if (window.location.pathname === "/web") {
      var data = this.state.data[0];


      while (data && data.length < 3 && data.length !== 0) {
        data.push({ "key": "", "doc_count": "" });

      }

      return (
        <div className="tableChart chart" >
          <h3 className="alignLeft title" style={{ "float": "inherit" }}>{this.props.name}</h3>
          <Animation display="none" name={this.props.name} type={this.props.type} setData={this.setData} dataAll={this.state.data} autoplay={this.props.autoplay} />
          {this.state.data[0] && this.state.data[0].length > 0 &&
            <table>
              <tbody>{data.map((item, key) => {
                return (
                  <tr key={key} style={{ "height": "30px" }}>
                    <td className="listChart filterToggleActiveWhite" id={item.key} style={{ "borderBottom": "none" }} title={item.key}>
                      {(this.props.name.includes("COUNTRY") || this.props.name.includes("COUNTRIES")) && item.key !== "unknown" && item.key !== "" && (storePersistent.getState().profile[0] && storePersistent.getState().profile[0].mode && storePersistent.getState().profile[0].mode !== "anonymous") ? <CountryFlag countryCode={item.key} /> : <span />}
                      {this.encryptedAttr(item.key.substring(0, 16))}
                    </td>
                    {(item.doc_count !== "" && this.state.data[1]) && <td className="listChart" style={{ "borderBottom": "none", "color": "grey" }}>{roundNumber(item.doc_count / this.state.data[1] * 100) + "%"}</td>}
                  </tr>
                )

              })}</tbody>
            </table>
          }
          {((this.state.data[0] && this.state.data[0].length === 0) || this.state.data[0] === "") &&
            <table style={{ "minWidth": "17em" }}>
              <tbody>
                <span className="noDataIcon"> <img alt="nodata" src={emptyIcon} style={{ "marginLeft": "3em", "padding": "1em", "marginTop": "10px", "marginBottom": "11px" }} />  </span>
              </tbody>
            </table>
          }
        </div>)

    }
    else {
      var isAnimation = window.location.pathname !== "/web" && (this.props.name === "EVENTS BY IP ADDR" || this.props.name === "TOP SUBNETS" || this.props.name === "EVENTS BY COUNTRY"); return (
        <div className="tableChart chart chartMinHeight">
          <h3 className="alignLeft title" style={{ "float": isAnimation ? "left" : "inherit" }}>{this.props.name}</h3>
          {isAnimation && <Animation name={this.props.name} type={this.props.type} setData={this.setData} dataAll={this.state.data} />}
          {this.state.data && this.state.data[0] && this.state.data[0] !== "" && this.state.data[0].length > 0 &&
            <table style={{ "display": "initial" }}>
              <tbody>{this.state.data[0].map((item, key) => {
                return (
                  <tr key={key}>
                    <td className="filtertd listChart filterToggleActiveWhite" id={item.key} title={item.key} style={{ "width": longestText(this.state.data) * 10 + 150 + "px" }}>
                      {(this.props.name.includes("COUNTRY") || this.props.name.includes("COUNTRIES")) && item.key !== "unknown" && storePersistent.getState().profile[0] && storePersistent.getState().profile[0].mode !== "anonymous" ? <CountryFlag countryCode={item.key} /> : <span />}
                      {this.encryptedAttr(shortText(item.key))}
                      {this.props.field && <span className="filterToggle">
                        <img onClick={this.filter} field={this.props.field} value={item.key} className="icon" alt="filterIcon" src={filter} />
                        <img field={this.props.field} value={item.key} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} />
                        <span><img onClick={() => copyToclipboard(item.key)} className="icon" title="copy to clipboard" alt="clipboardIcon" src={clipboardIcon} /><span id={"copyToClipboardText" + item.key} className="copyToClip">copied to clipboard</span></span>
                      </span>}
                    </td>
                    <td className="alignRight listChart">{niceNumber(item.doc_count, this.props.name)}</td>
                    {(item.doc_count !== "" && this.state.data[1]) && <td className="alignRight listChart tab" style={{ "color": "grey" }}>{roundNumber(item.doc_count / this.state.data[1] * 100) + "%"}</td>}
                  </tr>
                )

              })}</tbody>
            </table>
          }
          {((this.state.data && this.state.data[0] && this.state.data[0].length === 0) || (this.state.data && this.state.data[0] === "")) &&
            <table style={{ "minWidth": "17em" }}>
              <tbody>
                <span className="noDataIcon"> <img alt="nodata" src={emptyIcon} className="noDataList" />  </span>
              </tbody>
            </table>
          }
        </div>
      )
    }
  }
}

export default TableChart;
