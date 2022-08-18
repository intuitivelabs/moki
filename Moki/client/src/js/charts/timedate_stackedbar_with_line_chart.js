import React, { Component} from 'react';
import * as d3 from "d3";
import { ColorType, Colors } from '@moki-client/gui';
import store from "../store/index";
import storePersistent from "../store/indexPersistent";
import { setTimerange } from "../actions/index";
import { createFilter } from '@moki-client/gui';
import emptyIcon from "../../styles/icons/empty_small.png";
import { getTimeBucket, getTimeBucketInt } from "../helpers/getTimeBucket";
import { parseTimestamp, parseTimestampD3js, parseTimeData } from "../helpers/parseTimestamp";
import {setTickNrForTimeXAxis} from "../helpers/chart";

/*
format:

time
key
*/
export default class StackedChartLine extends Component {

    componentDidUpdate(prevProps) {
        this.draw(this.props.data, this.props.id, this.props.data2, this.props.width, this.props.units, this.props.name);
    }


    draw(data, id, data2, width, units, name) {
        //FOR UPDATE: remove chart if it's already there
        var chart = document.getElementById(id + "SVG");
        if (chart) {
            chart.remove();
        }

        // Clean up lost tooltips
        var elements = document.getElementsByClassName('tooltip' + id);
        while (elements.length > 0) {
            elements[0].parentNode.removeChild(elements[0]);
        }


        var svg = d3.select('#' + id);
        var margin = {
            top: 20,
            right: 60,
            bottom: 30,
            left: 35
        };
        var widthChart = width - margin.left - margin.right - 100;
        var height = 200 - margin.top - margin.bottom;

        var colorScale = d3.scaleOrdinal(Colors);
        var parseDate = parseTimestampD3js(store.getState().timerange[0], store.getState().timerange[1]);

        // var bucketSize = d3.timeFormat(timestampBucketSizeWidth(store.getState().timerange[0], store.getState().timerange[1]));

        var rootsvg = svg.append("svg")
            .attr('width', width)
            .attr('height', height + margin.top + margin.bottom)
            .attr('id', id + "SVG");
        //  .append('g');
        //max and min date
        var maxTime = parseTimeData(store.getState().timerange[1]) + getTimeBucketInt();
        var minTime = parseTimeData(store.getState().timerange[0]) - (60 * 1000); //minus one minute fix for round up

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

        setTickNrForTimeXAxis(xAxis);

        var yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(function (d) {
            if (d / 1000000000000 >= 1) return d / 1000000000000 + " T";
            if (d / 1000000000 >= 1) return d / 1000000000 + " G";
            if (d / 1000000 >= 1) return d / 1000000 + " M";
            if (d / 1000 >= 1) return d / 1000 + " K";
            return d;
        });

        rootsvg.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        if (data === undefined || data.length === 0) {
            rootsvg
                .append('svg:image')
                .attr("xlink:href", emptyIcon)
                .attr('transform', 'translate(' + widthChart / 2 + ',' + height / 2 + ')')
        }
        else {

          
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
                    }
                    else {
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

                    tooltip.select("div").html("<strong>Time: </strong> " + parseTimestamp(d.data.time) + " + " + getTimeBucket() + "<br/><strong>Value:</strong> " + d3.format(',')(d[1] - d[0]) + units + "<br/><strong>Type: </strong>" + this.parentNode.getAttribute("type") + "<br/> ");
                    d3.select(this).style("cursor", "pointer");

                    var tooltipDim = tooltip.node().getBoundingClientRect();
                    var chartRect = d3.select('#' + id).node().getBoundingClientRect();
                    tooltip
                        .style("visibility", "visible")
                        .style("left", (d3.event.clientX - chartRect.left + document.body.scrollLeft - (tooltipDim.width / 2)) + "px")
                        .style("top", (d3.event.clientY - chartRect.top + document.body.scrollTop + 15) + "px");
                })
                .on("mouseout", function () {
                    //  d3.select(this).style("stroke","none");
                    tooltip.style("visibility", "hidden");
                })
                .on("mousemove", function (d) {
                    var tooltipDim = tooltip.node().getBoundingClientRect();
                    var chartRect = d3.select('#' + id).node().getBoundingClientRect();
                    tooltip
                        .style("left", (d3.event.clientX - chartRect.left + document.body.scrollLeft - (tooltipDim.width / 2)) + "px")
                        .style("top", (d3.event.clientY - chartRect.top + document.body.scrollTop + 15) + "px");
                });

            //filter type onClick
            layer.on("click", el => {
                if (window.location.pathname === "/exceeded" || window.location.pathname.includes("/alerts")) {
                    createFilter("exceeded:" + el.key);
                }
                else {
                    createFilter("attrs.type:" + el.key);
                }

                var tooltips = document.getElementById("tooltip" + id);
                if (tooltips) {
                    tooltips.style.opacity = 0;
                }
            });

            // Animation
            /* Add 'curtain' rectangle to hide entire graph */
            var curtain = rootsvg.append('rect')
            .attr('x', -1 * width - 70)
            .attr('y', -1 * height)
            .attr('height', height)
            .attr('width', width + 100)
            .attr('class', 'curtain')
            .attr('transform', 'rotate(180)')
            .style('fill', '#ffffff');

        // Now transition the curtain to double of its width
        curtain.transition()
            .duration(1200)
            .ease(d3.easeLinear)
            .attr('x', -2 * width - 300);


            //y axis label
            /*g.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0- margin.left)
                .attr("x",0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Events count");   */

            // tooltip
            var tooltip = d3.select('#' + id).append("div")
                .style("width", "200px")
                .style("height", "90px")
                .style("background", "white")
                .attr('class', 'tooltip tooltip' + id)
                .style("opacity", "0.9")
                .style("position", "absolute")
                .style("visibility", "hidden")
                .style("box-shadow", "0px 0px 6px black")
                .style("padding", "10px");

            tooltip.append("div");


            // Add the valueline path
            //scale for line
            var yLine = d3.scaleLinear().range([height, 0]);

            if (d3.max(data2, function (d) {
                return parseInt(d.agg.value + (d.agg.value / 3), 10);
            }) !== 0) {

                yLine.domain([0, d3.max(data2, function (d) {
                    return parseInt(d.agg.value + (d.agg.value / 3), 10);
                })]);

                // define the line
                var valueline = d3.line()
                    .x(function (d) { return xScale(d.key); })
                    .y(function (d) { return yLine(d.agg.value); });

                g.append("path")
                    .data([data2])
                    .attr("class", "lineBackground")
                    .attr("d", valueline);


                // Add the Yline Axis
                g.append("g")
                    .attr("class", "axisLine")
                    .attr("transform", "translate( " + widthChart + ", 0 )")
                    .call(d3.axisRight(yLine).ticks(5));



                //yLine axis label
                g.append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", widthChart + 40)
                    .attr("x", 0 - (height / 2))
                    .attr("dy", "1em")
                    .style("text-anchor", "middle")
                    .text("ASR (%)");

                // Data dots
                g.selectAll(".dot")
                    .data(data2)
                    .enter().append("circle") // Uses the enter().append() method
                    .attr("class", "dot") // Assign a class for styling
                    .attr("cx", function (d, i) { return xScale(d.key) })
                    .attr("cy", function (d) { return yLine(d.agg.value) })
                    .attr("r", 3)
                    .on("mouseover", function (d, i) {
                        tooltip.style("visibility", "visible");
                        tooltip.select("div").html("<strong>Time: </strong> " + parseTimestamp(d.key) + "<br/><strong>Value:</strong> " + d3.format(',')(Math.round(d.agg.value)) + "% <br/>");
                        d3.select(this).style("cursor", "pointer");
                    })
                    .on("mouseout", function () {
                        tooltip.style("visibility", "hidden");
                    })
                    .on("mousemove", function (d) {
                        tooltip
                            .style("left", (d3.event.pageX - 200) + "px")
                            .style("top", (d3.event.pageY - 100) + "px");
                    });



                /*

               // define legend box size and space
                  var legend_keys = ["duration"]

                  var lineLegend = g.selectAll(".lineLegend").data(legend_keys)
                      .enter().append("g")
                      .attr("class","lineLegend")
                      .attr("transform", function (d,i) {
                              return "translate(" + width + "," + (i*20)+")";
                          });

                  lineLegend.append("text").text(function (d) {return d;})
                      .attr("transform", "translate(15,9)"); //align texts with boxes

                  lineLegend.append("rect")
                      .attr("fill", "indigo")
                      .attr("width", 10).attr("height", 10);
                      */
            }
        }
    }

    render() {
        return (<div id={this.props.id} className="chart"> <h3 className="alignLeft title">{this.props.name}</h3></div>)
    }
}
