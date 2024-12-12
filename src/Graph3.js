import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { genderGroups, colorScheme, symbolGenerator } from "./Legend";
import DoubleTrackSlider from "./DoubleTrackSlider";

function Graph3({ data }) {
  const svgRef = useRef();
  const width = 600;
  const height = 450;
  const [ageRange, setAgeRange] = useState({ min: 18, max: 25 });

  useEffect(() => {
    if (!data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 40, right: 30, bottom: 70, left: 70 };

    // Filter data based on age range
    const filteredData = data.filter((d) => {
      const age = parseInt(d.Age);
      return age >= ageRange.min && age <= ageRange.max;
    });

    const parsedData = filteredData.map((d) => ({
      Study_Hours: parseFloat(d.Study_Hours),
      Sleep_Quality: parseFloat(d.Sleep_Quality),
      Gender: d.Gender,
      Age: parseInt(d.Age),
    }));

    // Calculate point density
    const pointDensity = new Map();
    parsedData.forEach((point1) => {
      let nearbyPoints = 0;
      parsedData.forEach((point2) => {
        const distance = Math.sqrt(
          Math.pow(point1.Study_Hours - point2.Study_Hours, 2) +
            Math.pow(point1.Sleep_Quality - point2.Sleep_Quality, 2)
        );
        if (distance < 1) {
          nearbyPoints++;
        }
      });
      pointDensity.set(point1, nearbyPoints);
    });

    // Create point opacity scale
    const pointOpacityScale = d3
      .scaleLinear()
      .domain([
        d3.min(Array.from(pointDensity.values())),
        d3.max(Array.from(pointDensity.values())),
      ])
      .range([0.2, 0.9]);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(parsedData, (d) => d.Study_Hours)])
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(parsedData, (d) => d.Sleep_Quality)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Add title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Study Hours vs Sleep Quality");

    // Add y-axis grid lines
    svg
      .append("g")
      .attr("class", "grid y-grid")
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

    // Add x-axis grid lines
    svg
      .append("g")
      .attr("class", "grid x-grid")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .tickSize(-(height - margin.top - margin.bottom))
          .tickFormat("")
      )
      .style("stroke", "#cccccc")
      .style("stroke-opacity", 0.8)
      .selectAll("line")
      .style("stroke-dasharray", "2,2");

    // Add scatter plot points
    const points = svg.append("g").attr("class", "points");

    points
      .selectAll("path")
      .data(parsedData)
      .enter()
      .append("path")
      .attr("d", (d) => {
        const shapeSize = 100;
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
      .style("fill", (d) => colorScheme[d.Gender])
      .style("opacity", (d) => pointOpacityScale(pointDensity.get(d)))
      .style("stroke", "none");

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
  }, [data, ageRange]);

  const handleAgeRangeChange = (range) => {
    setAgeRange(range);
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <svg ref={svgRef} width={width} height={height}></svg>
      <div style={{ width: "300px", marginBottom: "20px" }}>
        <div style={{ marginBottom: "5px", fontSize: "12px", color: "#666" }}>
          Age Range Filter
        </div>
        <DoubleTrackSlider
          min={18}
          max={25}
          step={1}
          onChange={handleAgeRangeChange}
        />
      </div>
    </div>
  );
}

export default Graph3;
