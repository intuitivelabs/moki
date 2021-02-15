import React, {
    Component
} from 'react';
import * as d3 from "d3";
import {
    createFilter
} from '@moki-client/gui';
import {
    ColorsRedGreen
} from "../helpers/style/ColorsRedGreen";
import {
    ColorsGreen
} from "../helpers/style/ColorsGreen";
import {
    durationFormat
} from "../helpers/durationFormat";
import emptyIcon from "../../styles/icons/empty_small.png";
import Animation from '../helpers/Animation';

export default class heatmap extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: this.props.data,
            colorScale: ""
        }
        this.setData = this.setData.bind(this);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.data !== prevState.data) {
            return { data: nextProps.data };
        }
        else return null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.data !== this.props.data) {
            this.setState({ data: this.props.data });
            this.draw(this.state.data, this.props.id, this.props.field, this.props.field2, this.props.width, this.props.name, this.props.units);
        }
    }

    setData(data) {
        this.setState({ data: data });
    }

    draw(data, id, field, field2, passWidth, name, units) {
        units = units ? " (" + units + ")" : "";
        //FOR UPDATE: remove chart if it's already there
        var chart = document.getElementById(id + "SVG");
        if (chart) {
            chart.remove();
            var tooltips = document.getElementsByClassName("tooltip" + id);
            if (tooltips) {
                for (var j = 0; j < tooltips.length; j++) {
                    tooltips[j].remove();
                }
            }
        }

        //compute max label length to get bottom margin
        var marginBottom = 100;
        var marginLeft = 100;
        if (data && data.length > 0) {
            var maxTextWidth = d3.max(data.map(n => n.attr1.length));
            marginBottom = maxTextWidth > 50 ? 150 : (maxTextWidth * 7) + 10;
            maxTextWidth = d3.max(data.map(n => n.attr2.length));
            marginLeft = maxTextWidth > 50 ? 150 : maxTextWidth > 15 ? maxTextWidth * 8 : maxTextWidth * 13;
        }

        var margin = {
            top: 20,
            right: 30,
            bottom: marginBottom,
            left: marginLeft
        };
        //width 1100
        var width = passWidth - margin.right - margin.left;

        var colorOneShade = ColorsGreen;
        //special green-red color scale
        if (name.includes("CALL-ATTEMPS") || name.includes("ERROR")) {
            colorOneShade = ColorsRedGreen;
        }

        const buckets = 10;
        var colorScale = this.state.colorScale;
        //store global color scale (for animation)
        if (colorScale === "") {
            colorScale = d3.scaleQuantile()
                .domain([0, buckets - 1, d3.max(data, (d) => d.value)])
                .range(colorOneShade);
            this.setState({ colorScale: colorScale });
        }
        var height = 350;
        var widthSum = passWidth;
        var rootsvg = d3.select('#' + id)
            .append("svg")
            .attr('id', id + "SVG")
            .attr("width", widthSum)
            //  .attr("style", "margin-bottom: 30px;")
            .attr("height", height + margin.top + margin.bottom);

        if (data.length === 0) {
            rootsvg.attr("height", 100);

            rootsvg.append("line")
                .attr("x1", 0)
                .attr("y1", 10)
                .attr("x2", widthSum)
                .attr("y2", 10)
                .attr("stroke-width", 0.4)
                .attr("stroke", "#808080");

            rootsvg.append('svg:image')
                .attr("xlink:href", emptyIcon)
                .attr('transform', 'translate(' + (widthSum / 2) + ',25)')

            rootsvg.append("line")
                .attr("x1", 0)
                .attr("y1", 90)
                .attr("x2", widthSum)
                .attr("y2", 90)
                .attr("stroke-width", 0.4)
                .attr("stroke", "#808080");

        } else {

            var x_elements = d3.set(data.map(function (item) {
                return item.attr1;
            })).values();
            var y_elements = d3.set(data.map(function (item) {
                return item.attr2;
            })).values();

            var itemHeight = 16 - 3;
            var itemSize = (width - marginLeft) / x_elements.length;
            var cellSize = itemSize - 3;
            height = (itemHeight * y_elements.length) + margin.top;



            var xScale = d3.scaleBand()
                .domain(x_elements)
                .range([0, width])
                .paddingInner(.2).paddingOuter(.2);


            var xAxis = d3.axisBottom()
                .scale(xScale)
                .tickFormat(function (d) {
                    return d;
                });

            var yScale = d3.scaleBand()
                .domain(y_elements)
                .range([0, height])
                .paddingInner(.2).paddingOuter(.2);

            var yAxis = d3.axisLeft()
                .scale(yScale)
                .tickFormat(function (d) {
                    return d;
                });


            rootsvg.attr("height", height + margin.top + margin.bottom);
            var svg = rootsvg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


            // tooltip
            var tooltip = d3.select('#' + id).append("div")
                .style("background", "white")
                .attr('class', 'tooltip tooltip' + id)
                .style("opacity", "0.9")
                .style("position", "absolute")
                .style("visibility", "hidden")
                .style("box-shadow", "0px 0px 6px black")
                .style("padding", "10px");

            tooltip.append("div");


            var rect = svg.selectAll('rect')
                .data(data)
                .enter().append('g').append('rect')
                .attr('class', 'cell')
                // .style("opacity", "0")
                .attr('width', function (d) {
                    if (d.value === -1) return 0;
                    return cellSize + 5;
                })
                .attr('height', function (d) {
                    if (d.value === -1) return 0;
                    return itemHeight;
                })
                .attr('y', function (d) {
                    return yScale(d.attr2);
                })
                .attr('x', function (d) {
                    return xScale(d.attr1) - cellSize / 2;
                })
                .attr('fill', function (d) {
                    if (name === "CONNECTION FAILURE RATIO CA") {
                        if (d.value <= 10) { return "#1a321a" }
                        if (d.value <= 20) { return "#346535" }
                        if (d.value <= 30) { return "#4f9850" }
                        if (d.value <= 40) { return "#68b169" }
                        if (d.value <= 50) { return "#9acb9b" }
                        if (d.value <= 60) { return "#fecac2" }
                        if (d.value <= 70) { return "#fd9584" }
                        if (d.value <= 80) { return "#fc6047" }
                        if (d.value <= 90) { return "#fb2a0a" }
                        else { return "#c41d03" }

                    }
                    else return colorScale(d.value);
                })
                .attr("rx", 2)
                .attr("ry", 2)
                .attr('transform', 'translate(' + cellSize / 2 + ',0)')
                .on("mouseover", function (d) {
                    d3.select(this).style("stroke", "orange");
                    tooltip.style("visibility", "visible")
                        .style('left', `${d3.event.layerX + 20}px`)
                        .style('top', `${(d3.event.layerY - 50)}px`);

                    if (d3.mouse(d3.event.target)[0] > window.innerWidth - 1200) {
                        tooltip
                            .style("left", `${d3.event.layerX - 600}px`)
                    }
                    if (name.includes("DURATION")) {
                        var value = durationFormat(d.value);
                        tooltip.select("div").html("<strong>SRC:</strong> " + d.attr2 + "<br/> <strong>DST: </strong>" + d.attr1 + "<br/> <strong>Value: </strong>" + value + units);
                    }
                    else if (units === " (count)") {
                        tooltip.select("div").html("<strong>SRC:</strong> " + d.attr2 + "<br/> <strong>DST: </strong>" + d.attr1 + "<br/> <strong>Value: </strong>" + d.value + units);
                    }
                    else {
                        tooltip.select("div").html("<strong>SRC:</strong> " + d.attr2 + "<br/> <strong>DST: </strong>" + d.attr1 + "<br/> <strong>Value: </strong>" + (+d.value).toFixed(2) + units);
                    }
                })
                .on("mouseout", function () {
                    d3.select(this).style("stroke", "none");
                    tooltip.style("visibility", "hidden");
                });

            /*      var animationSpeed = data.length > 10 ? 20 : 40;
                  console.log(animationSpeed);
              //animation
              rect.transition()
                  .duration(0)
                  .delay((d, i) => i * animationSpeed)
                  .style("opacity", 1);
          */

            //filter type onClick
            rect.on("click", el => {
                // d3.select(this).style("stroke", "none");
                tooltip.style("visibility", "hidden");
                if (field2) {
                    createFilter(field2 + ":" + el.attr2);
                }

                createFilter(field + ":" + el.attr1);


                var tooltips = document.getElementsByClassName("tooltip" + id);
                if (tooltip) {
                    for (var j = 0; j < tooltips.length; j++) {
                        tooltips[j].style.opacity = 0;
                    }
                }
            });

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .selectAll('text')
                .text(function (d) {
                    if (d.length > 20)
                        return d.substring(0, 20) + '...';
                    else
                        return d;
                })
                .attr('font-weight', 'normal')
                .append("svg:title")
                .text(function (d) { return d });

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .text(function (d) {
                    if (d.length > 20)
                        return d.substring(0, 20) + '...';
                    else
                        return d;
                })
                .attr("transform", "rotate(-65)")
                .append("svg:title")
                .text(function (d) { return d });

            if (id === "failureCA" || id === "callAtemptsCA" || id === "callEndsCA" || id === "durationCA") {
                // text label for the x axis
                svg.append("text")
                    .attr("transform",
                        "translate(" + (width) + " ," +
                        (height + margin.top) + ")")
                    .style("text-anchor", "middle")
                    .text("DST CA");

                // text label for the y axis
                svg.append("text")
                    .attr("y", -20)
                    .attr("x", -20)
                    .attr("dy", "1em")
                    .style("text-anchor", "middle")
                    .text("SRC CA");
            }
            else if (id === "codeAnalysis") {

            }
            else {
                // text label for the x axis
                svg.append("text")
                    .attr("transform",
                        "translate(" + (width) + " ," +
                        (height + margin.top) + ")")
                    .style("text-anchor", "middle")
                    .text("TO");

                // text label for the y axis
                svg.append("text")
                    .attr("y", -20)
                    .attr("x", -20)
                    .attr("dy", "1em")
                    .style("text-anchor", "middle")
                    .text("FROM");


            }


        }

    }


    render() {
        return (<div id={
            this.props.id
        } > <h3 className="alignLeft title" > {
            this.props.name
        } </h3>
            {window.location.pathname !== "/connectivity" && <Animation name={this.props.name} type={this.props.type} setData={this.setData} dataAll={this.state.data} />}
        </div>)
    }
}
