import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

function Graph3({ data }) {
  const svgRef = useRef();
  const width = 600;
  const height = 450;

  useEffect(() => {
    if (!data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 100, bottom: 70, left: 70 };
    const genderGroups = ["Male", "Female", "Other"];

    const parsedData = data.map((d) => ({
      Study_Hours: parseFloat(d.Study_Hours),
      Sleep_Quality: parseFloat(d.Sleep_Quality),
      Gender: d.Gender,
    }));

    const color = d3
      .scaleOrdinal()
      .domain(genderGroups)
      .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(parsedData, (d) => d.Study_Hours)])
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(parsedData, (d) => d.Sleep_Quality)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Create density data
    const densityData = d3
      .contourDensity()
      .x((d) => x(d.Study_Hours))
      .y((d) => y(d.Sleep_Quality))
      .size([
        width - margin.left - margin.right,
        height - margin.top - margin.bottom,
      ])
      .bandwidth(30)
      .thresholds(10)(parsedData);

    // Add grid lines
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(y)
          .tickSize(-width + margin.left + margin.right)
          .tickFormat("")
      )
      .style("stroke", "#cccccc")
      .style("stroke-opacity", 0.8)
      .selectAll("line")
      .style("stroke-dasharray", "2,2");

    // Add contours
    const contours = svg.append("g").attr("class", "contours");

    contours
      .selectAll("path")
      .data(densityData)
      .enter()
      .append("path")
      .attr("d", d3.geoPath())
      .attr("fill", "none")
      .attr("stroke", "#666")
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", 0.5)
      .attr("transform", `translate(${0}, ${0})`);

    // Function to create different shapes
    const symbolGenerator = (type, size) => {
      if (type === "triangle") {
        return d3.symbol().type(d3.symbolTriangle).size(size)();
      } else if (type === "square") {
        return d3.symbol().type(d3.symbolSquare).size(size)();
      } else {
        return d3.symbol().type(d3.symbolCircle).size(size)();
      }
    };

    // Add scatter plot points with different shapes
    const points = svg.append("g").attr("class", "points");

    points
      .selectAll("path")
      .data(parsedData)
      .enter()
      .append("path")
      .attr("d", (d) => {
        const shapeSize = 100; // Increased size for all shapes
        switch (d.Gender) {
          case "Male":
            return symbolGenerator("triangle", shapeSize);
          case "Female":
            return symbolGenerator("square", shapeSize);
          default:
            return symbolGenerator("circle", shapeSize);
        }
      })
      .attr(
        "transform",
        (d) => `translate(${x(d.Study_Hours)},${y(d.Sleep_Quality)})`
      )
      .style("fill", (d) => color(d.Gender))
      .style("opacity", 0.6);

    // Add axes
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y));

    // Add labels
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr(
        "transform",
        `translate(${width / 2},${height - margin.bottom + 35})`
      )
      .text("Study Hours")
      .style("font-size", "12px");

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr(
        "transform",
        `translate(${margin.left / 2},${height / 2})rotate(-90)`
      )
      .text("Sleep Quality")
      .style("font-size", "12px");

    // Add legend with matching shapes
    const legendGroup = svg.append("g");

    // Add shapes to legend
    legendGroup
      .selectAll("path")
      .data(genderGroups)
      .enter()
      .append("path")
      .attr("d", (d) => {
        const shapeSize = 100; // Match size with scatter plot
        switch (d) {
          case "Male":
            return symbolGenerator("triangle", shapeSize);
          case "Female":
            return symbolGenerator("square", shapeSize);
          default:
            return symbolGenerator("circle", shapeSize);
        }
      })
      .attr(
        "transform",
        (d, i) => `translate(${width - margin.right - 195 + i * 70}, 15)`
      )
      .attr("fill", (d) => color(d));

    // Add text to legend
    legendGroup
      .selectAll("text")
      .data(genderGroups)
      .enter()
      .append("text")
      .attr("x", (d, i) => width - margin.right - 185 + i * 70)
      .attr("y", 20)
      .text((d) => d)
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle");
  }, [data]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
}

export default Graph3;
