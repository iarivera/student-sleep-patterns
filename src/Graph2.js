import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

function Graph2({ data }) {
  const svgRef = useRef();
  const width = 600; // Width of the graph
  const height = 450; // Height of the graph

  useEffect(() => {
    if (!data) {
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const margin = { top: 20, right: 100, bottom: 70, left: 70 };
    const genderGroups = ["Male", "Female", "Other"]; // Include "Other" in gender groups
    const yearOrder = ["1st Year", "2nd Year", "3rd Year", "4th Year"]; // Order the data by University Year

    // Group the data by University Year and Gender, then calculate the average sleep duration for each gender
    const groupedData = d3.group(data, (d) => d.University_Year);

    // Prepare data for the stacked bar chart with averages by gender and university year
    const preparedData = Array.from(groupedData).map(([year, entries]) => {
      const maleData = entries.filter((d) => d.Gender === "Male");
      const femaleData = entries.filter((d) => d.Gender === "Female");
      const otherData = entries.filter((d) => d.Gender === "Other");

      return {
        University_Year: year,
        Male: d3.mean(maleData, (d) => +d.Sleep_Duration), // Calculate average sleep duration for Male
        Female: d3.mean(femaleData, (d) => +d.Sleep_Duration), // Calculate average sleep duration for Female
        Other: d3.mean(otherData, (d) => +d.Sleep_Duration), // Calculate average sleep duration for Other
      };
    });

    // Create scales for the axes
    const x0 = d3
      .scaleBand()
      .domain(yearOrder)
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const x1 = d3
      .scaleBand()
      .domain(genderGroups)
      .range([0, x0.bandwidth()])
      .padding(0.05);

    // Adjust y-axis scale to use the maximum of individual gender averages
    const maxValue = d3.max(preparedData, (d) =>
      Math.max(d.Male || 0, d.Female || 0, d.Other || 0)
    );
    const y = d3
      .scaleLinear()
      .domain([0, maxValue * 1.3]) // Add 30% more space at the top
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Update the color scale to include "Other"
    const color = d3
      .scaleOrdinal()
      .domain(genderGroups)
      .range(["#1f77b4", "#ff7f0e", "#2ca02c"]); // Blue for Male, Orange for Female, Green for Other

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

    // Tooltip setup
    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "lightgray")
      .style("padding", "5px")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // Create the bars for each gender and university year
    svg
      .selectAll("g.year")
      .data(preparedData)
      .join("g")
      .attr("class", "year")
      .attr("transform", (d) => `translate(${x0(d.University_Year)}, 0)`) // Align each university year
      .selectAll("rect")
      .data((d) =>
        genderGroups.map((gender) => ({
          key: gender,
          value: d[gender],
          year: d.University_Year,
        }))
      ) // Map each gender to a value
      .join("rect")
      .attr("x", (d) => x1(d.key)) // Position each gender bar side by side
      .attr("y", (d) => y(d.value || 0)) // Y position depends on the value (height)
      .attr("height", (d) => y(0) - y(d.value || 0)) // Height of each segment based on the value
      .attr("width", x1.bandwidth()) // Width of each bar for a gender
      .attr("fill", (d) => color(d.key)) // Color each segment by gender
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1);
        tooltip.html(
          `Gender: ${d.key}<br>Average Sleep Duration: ${
            d.value ? d.value.toFixed(2) : "N/A"
          } hrs<br>University Year: ${d.year}`
        );
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`);
      })
      .on("mouseout", () => tooltip.style("opacity", 0));

    // X-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x0))
      .selectAll("text") // Rotate x-axis labels
      .attr("transform", "rotate(-30)")
      .style("text-anchor", "end");

    // Y-axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(6));

    // Y-axis Title
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr(
        "transform",
        `translate(${margin.left / 2},${height / 2})rotate(-90)`
      )
      .text("Average Sleep Duration (hours)")
      .style("font-size", "12px");

    // Legend
    svg
      .append("g")
      .selectAll("rect")
      .data(genderGroups)
      .enter()
      .append("rect")
      .attr("x", (d, i) => width - margin.right - 200 + i * 70)
      .attr("y", 10)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", (d) => color(d));

    svg
      .append("g")
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

export default Graph2;
