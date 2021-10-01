import React, { Component } from 'react';
import * as d3 from "d3";
import ColorType from '../helpers/style/ColorType';
import Colors from '../helpers/style/Colors';
import { timestampBucket } from '../bars/TimestampBucket.js';
import store from "../store/index";
import storePersistent from "../store/indexPersistent";
import { setTimerange } from "../actions/index";
import { createFilter } from '@moki-client/gui';
import { getTimeBucket, getTimeBucketInt } from "../helpers/getTimeBucket";
import emptyIcon from "../../styles/icons/empty_small.png";
import {parseTimestamp} from "../helpers/parseTimestamp";

/*
format:

time
key
*/
export default class StackedChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            keys: []
        }
        this.draw = this.draw.bind(this);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps !== prevState) {
            return { data: nextProps.data };
        }
        else return null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps !== this.props) {
            this.setState({ data: this.props.data });
            var isFirst = this.state.data && this.state.data.length === 0 ? true : false;
            this.draw(this.props.data, this.props.id, this.props.width, this.props.name, this.props.units, isFirst);
        }
    }

    draw(data, id, width, name, units, isFirst) {
        width = width < 0 ? 1028 : width;
        units = units ? " (" + units + ")" : "";
        //FOR UPDATE: remove chart if it's already there
        var chart = document.getElementById(id + "SVG");
        if (chart) {
            chart.remove();
        }

        // Clean up lost tooltips
        var elements = document.getElementById('tooltip' + id);
        if (elements) {
            elements.parentNode.removeChild(elements);
        }
        var svg = d3.select('#' + id);
        var margin = {
            top: 13,
            right: 20,
            bottom: 30,
            left: 35
        };
        //window.innerWidth -200 
        width = width - margin.left - margin.right - 30;
        var height = 200 - margin.top - margin.bottom;

        var colorScale = d3.scaleOrdinal(Colors);

        var parseDate = d3.timeFormat(timestampBucket(store.getState().timerange[0], store.getState().timerange[1]));

        var rootsvg = svg.append("svg")
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .attr('id', id + "SVG");
        //  .append('g');

        //max and min date
        var maxTime = store.getState().timerange[1] + getTimeBucketInt();
        var minTime = store.getState().timerange[0] - (60 * 1000); //minus one minute fix for round up

        var x = d3.scaleBand().range([0, width]).padding(0.1);

        //scale for brush function
        var xScale = d3.scaleLinear()
            .range([0, width])
            .domain([minTime, maxTime]);

        if (data !== undefined) {
            var max = d3.max(data, d => d.sum + 5);
            var domain = max ? max + max / 3 : 1;
        }
        var yScale = d3.scaleLinear().range([height, 0]).domain([0, domain]);
        var z = d3.scaleOrdinal().range(['#d53e4f', '#fc8d59', '#fee08b', '#ffffbf', '#e6f598', '#99d594', '#3288bd']);


        var xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks(7)
            .tickFormat(parseDate);

        var yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(function (d) {
            if (d / 1000000000000 >= 1) return d / 1000000000000 + " T";
            if (d / 1000000000 >= 1) return d / 1000000000 + " G";
            if (d / 1000000 >= 1) return d / 1000000 + " M";
            if (d / 1000 >= 1) return d / 1000 + " K";
            return d;
        });

        rootsvg.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        if (data === undefined || data.length === 0) {
            rootsvg.append('svg:image')
                .attr("xlink:href", emptyIcon)
                .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')

        } else {

            rootsvg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(" + margin.left + "," + (height) + ")")
                .call(xAxis);

            rootsvg.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + margin.left + ",0)").call(yAxis);

            var dataLength = 0;
            for (var o = 0; o < data.length; o++) {
                dataLength = dataLength + Object.keys(data[o]).length - 2;   //minus time attribute
            }
            var g = rootsvg.append("g")
                .attr("transform", "translate(" + margin.left + ",0)");

            g.append("g")
                .attr("class", "brush")
                .call(d3.brushX()
                    .extent([[0, 0], [width, height]])
                    .on("end", brushended));

            function brushended() {
                if (!d3.event.sourceEvent) return;
                // Only transition after input.
                if (!d3.event.selection) return;
                // Ignore empty selections.
                var extent = d3.event.selection;
                var timestamp_gte = Math.round(xScale.invert(extent[0]));
                var timestamp_lte = Math.round(xScale.invert(extent[1]));

                var timestamp_readiable = parseTimestamp(new Date(Math.trunc(timestamp_gte))) + " - " + parseTimestamp(new Date(Math.trunc(timestamp_lte)));
                store.dispatch(setTimerange([timestamp_gte, timestamp_lte, timestamp_readiable]));

            }


            x.domain(data.map(function (d) {
                return parseDate(d.time);
            }));




            z.domain(data.map(function (d) {
                return d.keys;
            }));

            /*
            var keys = d3.keys(data[2]).filter(function (d) {
                if (d !== "time") {
                    if (d !== "value") {
                        if (d !== "sum") {
                            return d;
                        }
                    }
                }
                return "";

            });
*/
            var keys = this.props.keys ? storePersistent.getState().layout.types[this.props.keys] ? storePersistent.getState().layout.types[this.props.keys] : this.props.keys : storePersistent.getState().layout.types["overview"];
            //var id = 0;
            var stack = d3.stack()
                //.keys(["Register new", "Registration expired", "Register del"])
                .keys(keys)
                .order(d3.stackOrderNone)
                .offset(d3.stackOffsetNone);

            var layers = stack(data);

            var layer = g.selectAll(".layer")
                .data(layers)
                .enter().append("g")
                .attr("class", "layer")
                .attr("type", function (d) {
                    return d.key;
                })
                .style("fill", function (d) {
                    if (name === "MoS STATS") {
                        if (d.key === "*-2.58") { return "#FE2E2E"; }
                        if (d.key === "2.58-3.1") { return "#F79F81"; }
                        if (d.key === "3.1-3.6") { return "#F3E2A9"; }
                        if (d.key === "3.6-4.03") { return "#95c196"; }
                        if (d.key === "4.03-*") { return "#4f9850"; }
                    }
                    else if (ColorType[d.key]) {
                        return ColorType[d.key];
                    } else {
                        return colorScale(d.key);
                    }
                })
                .on("mouseover", function (d) {
                    d3.select(this).style("stroke", "orange");
                })
                .on("mouseout", function (d) {
                    d3.select(this).style("stroke", "none");
                });

            // gridlines in y axis function
            function make_y_gridlines() {
                return d3.axisLeft(yScale)
                    .ticks(5)
            }


            layer.selectAll("rect")
                .data(function (d, i) {

                    return d;
                })
                .enter().append("rect")
                .attr('class', 'barStacked')
                .attr("x", function (d) {
                    //bug fix
                    if (xScale(d.data.time) < 0) {
                        return -1000;
                    }
                    return xScale(d.data.time);
                })
                //.attr("x", function(d) { return x(d.data.date); })
                /*     .attr("y", function (d) {
                         return yScale(d[1]);
                     })
                     .attr("height", function (d) {
                     var height = yScale(d[0]) - yScale(d[1]); 
                         if(height){
                             return height
                         }
                         else {
                             return 0;
                         }
                     })*/
                .attr('width', function (d, i) {
                    var timebucket = getTimeBucket();
                    var nextTime = d.data.time;
                    if (timebucket.includes("m")) {
                        nextTime = nextTime + (timebucket.slice(0, -1) * 60 * 1000);
                    }
                    else if (timebucket.includes("s")) {
                        nextTime = nextTime + (timebucket.slice(0, -1) * 1000);
                    }
                    else {
                        nextTime = nextTime + (timebucket.slice(0, -1) * 60 * 60 * 1000);
                    }

                    if (nextTime < maxTime && d.data.time > minTime) {
                        return xScale(nextTime) - xScale(d.data.time) - 1;
                    }
                    return;
                })
                .attr("y", function (d) {
                    return yScale(d[1]);
                })
                .attr("height", function (d) {
                    var height = yScale(d[0]) - yScale(d[1]);
                    if (height) {
                        return height
                    }
                    else {
                        return 0;
                    }
                })
                .on("mouseover", function (d, i) {
                    //d3.select(this).style("stroke","orange");
                    if (d3.mouse(d3.event.target)[0] > window.innerWidth - 600) {
                        tooltip.style.left = d3.mouse(d3.event.target)[1] - 200 + 'px';
                    }


                    tooltip.style("visibility", "visible");
                    // .style("left", this.getAttribute("x") + 300 + "px")
                    //   .style("top", this.getAttribute("y") + 300 + "px");

                    tooltip.select("div").html("<strong>Time: </strong> " + parseTimestamp(d.data.time) + " + " + getTimeBucket() + "<br/><strong>Value:</strong> " + d3.format(',')(d[1] - d[0]) + units + "<br/><strong>Type: </strong>" + this.parentNode.getAttribute("type") + "<br/> ");
                    d3.select(this).style("cursor", "pointer");


                })
                .on("mouseout", function () {
                    //  d3.select(this).style("stroke","none");
                    tooltip.style("visibility", "hidden");
                })
                .on("mousemove", function (d) {
                    tooltip
                        .style("left", (d3.event.pageX - 200) + "px")
                        .style("top", (d3.event.pageY - 130) + "px");

                    if (d3.mouse(d3.event.target)[0] > window.innerWidth - 600) {
                        tooltip
                            .style("left", (d3.event.pageX - 500) + "px")
                    }
                });

            //filter type onClick
            layer.on("click", el => {
                createFilter("attrs.type:" + el.key);

                var tooltips = document.getElementById("tooltip" + id);
                if (tooltip) {
                    tooltips.style.opacity = 0;
                }
            });

            //turn off animation for web page because we need refresh every minute there
            if (window.location.pathname !== "/web") {
                // Animation
                /* Add 'curtain' rectangle to hide entire graph */
                var curtain = rootsvg.append('rect')
                    .attr('x', -1 * width)
                    .attr('y', -1 * height)
                    .attr('height', height)
                    .attr('width', width)
                    .attr('class', 'curtain')
                    .attr('transform', 'rotate(180)')
                    .style('fill', '#ffffff');

                // Now transition the curtain to double of its width
                curtain.transition()
                    .duration(1200)
                    .ease(d3.easeLinear)
                    .attr('x', -2 * width - 50);

            }


            /*
                        // add the X gridlines
                        g.append("g")
                            .attr("class", "grid")
                            .attr("transform", "translate(0," + height + ")")
                            .call(make_x_gridlines()
                                .tickSize(-height)
                                .tickFormat("")
                            )
            */
            // add the Y gridlines
            g.append("g")
                .attr("class", "grid")
                .call(make_y_gridlines()
                    .tickSize(-width)
                    .tickFormat("")
                )

            // tooltip
            var tooltip = d3.select('#' + id).append("div")
                .attr('id', 'tooltip' + id)
                .attr("class", "tooltipCharts");


            tooltip.append("div");

            //special case: show time line for video animation
            if (this.props.animation && isFirst) {
                var timebucket = Math.round((maxTime - minTime) / 30);
                var time = timebucket;
                var animation = setInterval(function () {
                    if (document.getElementById("timeIndicator")) {
                        document.getElementById("timeIndicator").remove();
                    }
                    g.append("rect")
                        .attr("x", function (d) {

                            return xScale(minTime + time);
                        })
                        .attr("id", "timeIndicator")
                        .attr("y", function (d) {
                            return 0;
                        })
                        .attr("width", xScale(minTime + timebucket))
                        .style("fill", "#D4D3E8")
                        .style("opacity", "0.5")
                        .attr("height", height);

                    time = time + timebucket;
                    if (minTime + time >= maxTime) {
                        clearInterval(animation);
                        console.log("stop auto animation");
                        if (document.getElementById("timeIndicator")) {
                            document.getElementById("timeIndicator").remove();
                        }
                    }
                }, 1000);
            }

        }
    }

    render() {
        var bucket = getTimeBucket();
        return (<div id={
            this.props.id
        } className="chart"> <h3 className="alignLeft title" > {
            this.props.name
        } <span className="smallText"> (interval: {bucket})</span></h3></div >)
    }
}
