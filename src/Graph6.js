import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

function Graph6({ data }) {
  const svgRef = useRef();
  const width = 600;
  const height = 600;

  useEffect(() => {
    if (!data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 40, right: 30, bottom: 150, left: 100 };

    // Define variables to correlate
    const variables = [
      "Sleep_Duration",
      "Study_Hours",
      "Screen_Time",
      "Sleep_Quality",
      "Physical_Activity",
    ];

    // Calculate correlations
    const correlationMatrix = variables.map((var1) => {
      return variables.map((var2) => {
        const values1 = data.map((d) => +d[var1]).filter((v) => !isNaN(v));
        const values2 = data.map((d) => +d[var2]).filter((v) => !isNaN(v));

        // Calculate Pearson correlation
        const mean1 = d3.mean(values1);
        const mean2 = d3.mean(values2);
        const variance1 = d3.variance(values1);
        const variance2 = d3.variance(values2);
        const n = Math.min(values1.length, values2.length);

        const covariance =
          d3.sum(
            values1
              .slice(0, n)
              .map((v1, i) => (v1 - mean1) * (values2[i] - mean2))
          ) /
          (n - 1);

        return covariance / Math.sqrt(variance1 * variance2);
      });
    });

    // Create color scale with exponential transformation
    const exponentialScale = (d) => Math.sign(d) * Math.pow(Math.abs(d), 0.5); // Square root for less aggressive exponential
    const colorScale = d3
      .scaleLinear()
      .domain([-1, 0, 1])
      .range(["#c51b8a", "#f7f7f7", "#2c7bb6"])
      .clamp(true)
      .interpolate(d3.interpolateRgb);

    // Function to apply color with exponential transformation
    const getColor = (d) => colorScale(exponentialScale(d));

    const size =
      Math.min(
        width - margin.left - margin.right,
        height - margin.top - margin.bottom
      ) / variables.length;

    // Add title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Correlation Matrix of Sleep Patterns");

    // Create the matrix
    const matrix = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add cells
    matrix
      .selectAll("g")
      .data(correlationMatrix)
      .join("g")
      .attr("transform", (d, i) => `translate(0,${i * size})`)
      .selectAll("rect")
      .data((d) => d)
      .join("rect")
      .attr("x", (d, i) => i * size)
      .attr("width", size)
      .attr("height", size)
      .style("fill", (d) => getColor(d))
      .style("stroke", "white");

    // Add correlation values
    matrix
      .selectAll(".correlation-text")
      .data(correlationMatrix)
      .join("g")
      .attr("transform", (d, i) => `translate(0,${i * size})`)
      .selectAll("text")
      .data((d) => d)
      .join("text")
      .attr("x", (d, i) => i * size + size / 2)
      .attr("y", size / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", "12px")
      .style("fill", (d) => (Math.abs(d) > 0.5 ? "white" : "black"))
      .text((d) => d.toFixed(2));

    // Add row labels
    matrix
      .selectAll(".row-label")
      .data(variables)
      .join("text")
      .attr("class", "row-label")
      .attr("x", -10)
      .attr("y", (d, i) => i * size + size / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .style("font-size", "12px")
      .text((d) => d.replace(/_/g, " "));

    // Add column labels
    matrix
      .selectAll(".column-label")
      .data(variables)
      .join("text")
      .attr("class", "column-label")
      .attr("x", (d, i) => i * size + size / 2)
      .attr("y", variables.length * size + 20)
      .attr("text-anchor", "start")
      .attr(
        "transform",
        (d, i) =>
          `rotate(45,${i * size + size / 2},${variables.length * size + 20})`
      )
      .style("font-size", "12px")
      .text((d) => d.replace(/_/g, " "));

    // Add legend
    const legendWidth = width - margin.left - margin.right;
    const legendHeight = 20;

    const legendScale = d3
      .scaleLinear()
      .domain([-1, 1])
      .range([0, legendWidth]);

    const legendAxis = d3
      .axisBottom(legendScale)
      .tickFormat(d3.format(".1f"))
      .ticks(5);

    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left},${height - margin.bottom + 90})`
      );

    const legendGradient = legend
      .append("defs")
      .append("linearGradient")
      .attr("id", "correlation-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%");

    legendGradient
      .selectAll("stop")
      .data([
        { offset: "0%", color: getColor(-1) },
        { offset: "50%", color: getColor(0) },
        { offset: "100%", color: getColor(1) },
      ])
      .join("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color);

    legend
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#correlation-gradient)");

    legend
      .append("g")
      .attr("transform", `translate(0,${legendHeight})`)
      .call(legendAxis);

    legend
      .append("text")
      .attr("x", legendWidth / 2)
      .attr("y", legendHeight + 40)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Correlation Coefficient");
  }, [data]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
}

export default Graph6;
