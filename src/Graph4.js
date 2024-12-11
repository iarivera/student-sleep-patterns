import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

function Graph4({ data }) {
  const svgRef = useRef();
  const width = 600;
  const height = 450;

  useEffect(() => {
    if (!data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 100, bottom: 70, left: 70 };
    const genderGroups = ["Male", "Female", "Other"];

    // Calculate gender distribution
    const genderCounts = d3.rollup(
      data,
      (v) => v.length,
      (d) => d.Gender
    );

    // Convert Map to array of objects for pie chart
    const pieData = Array.from(genderCounts, ([key, value]) => ({
      gender: key,
      count: value,
    }));

    // Set up colors
    const color = d3
      .scaleOrdinal()
      .domain(genderGroups)
      .range(["#1f77b4", "#ff7f0e", "#2ca02c"]); // Blue for Male, Orange for Female, Green for Other

    // Create pie layout
    const pie = d3
      .pie()
      .value((d) => d.count)
      .sort(null); // Don't sort, maintain order

    // Create arc generator
    const radius =
      Math.min(
        width - margin.left - margin.right,
        height - margin.top - margin.bottom
      ) / 2;
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    // Create arc for labels that's slightly larger
    const labelArc = d3
      .arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.6);

    // Create group element to hold pie chart
    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Create pie chart segments
    const arcs = g
      .selectAll(".arc")
      .data(pie(pieData))
      .enter()
      .append("g")
      .attr("class", "arc");

    // Add colored segments
    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data.gender))
      .attr("stroke", "white")
      .style("stroke-width", "2px");

    // Add percentage and count labels
    const labelGroups = arcs
      .append("g")
      .attr("transform", (d) => `translate(${labelArc.centroid(d)})`);

    // Add percentage text
    labelGroups
      .append("text")
      .attr("dy", "-0.2em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "black")
      .text((d) => {
        const percent = ((d.data.count / data.length) * 100).toFixed(1);
        return `${percent}%`;
      });

    // Add count text
    labelGroups
      .append("text")
      .attr("dy", "1.2em")
      .style("text-anchor", "middle")
      .style("font-size", "13px")
      .style("fill", "black")
      .text((d) => `(${d.data.count})`);

    // Add legend
    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width - margin.right - 200 + 70}, ${margin.top})`
      );

    const legendItems = legend
      .selectAll(".legend-item")
      .data(genderGroups)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 25})`);

    // Add colored rectangles to legend
    legendItems
      .append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", (d) => color(d));

    // Add text to legend
    legendItems
      .append("text")
      .attr("x", 25)
      .attr("y", 12)
      .text((d) => d)
      .style("font-size", "12px");
  }, [data]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
}

export default Graph4;
