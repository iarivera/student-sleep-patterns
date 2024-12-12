import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { genderGroups, colorScheme, yearOrder } from "./Legend";

function Graph2({ data }) {
  const svgRef = useRef();
  const width = 600;
  const height = 450;

  useEffect(() => {
    if (!data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 70, left: 70 };

    // Group the data by University Year and Gender, then calculate the average sleep duration for each gender
    const groupedData = d3.group(data, (d) => d.University_Year);

    // Prepare data for the grouped bar chart with averages by gender and university year
    const preparedData = Array.from(groupedData).map(([year, entries]) => {
      const maleData = entries.filter((d) => d.Gender === "Male");
      const femaleData = entries.filter((d) => d.Gender === "Female");
      const otherData = entries.filter((d) => d.Gender === "Other");

      return {
        University_Year: year,
        Male: d3.mean(maleData, (d) => +d.Sleep_Duration),
        Female: d3.mean(femaleData, (d) => +d.Sleep_Duration),
        Other: d3.mean(otherData, (d) => +d.Sleep_Duration),
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
      .domain([0, maxValue * 1.3])
      .nice()
      .range([height - margin.bottom, margin.top]);

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

    // Create tooltip
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
      .attr("transform", (d) => `translate(${x0(d.University_Year)}, 0)`)
      .selectAll("rect")
      .data((d) =>
        genderGroups.map((gender) => ({
          key: gender,
          value: d[gender],
          year: d.University_Year,
        }))
      )
      .join("rect")
      .attr("x", (d) => x1(d.key))
      .attr("y", (d) => y(d.value || 0))
      .attr("height", (d) => y(0) - y(d.value || 0))
      .attr("width", x1.bandwidth())
      .attr("fill", (d) => colorScheme[d.key])
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
      .selectAll("text")
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
  }, [data]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
}

export default Graph2;
