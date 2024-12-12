import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { yearOrder, genderGroups, colorScheme } from "./utils";

function Graph1({ data }) {
  const svgRef = useRef();
  const width = 600;
  const height = 450;

  useEffect(() => {
    if (!data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Set initial opacity to 0 for fade-in
    svg.style("opacity", 0);

    const margin = { top: 40, right: 30, bottom: 70, left: 70 };

    // Group data by year and gender
    const groupedData = yearOrder.map((year) => {
      const yearData = data.filter((d) => d.University_Year === year);
      return {
        University_Year: year,
        Male: yearData.filter((d) => d.Gender === "Male").length,
        Female: yearData.filter((d) => d.Gender === "Female").length,
        Other: yearData.filter((d) => d.Gender === "Other").length,
      };
    });

    // Stack the data
    const stack = d3
      .stack()
      .keys(genderGroups)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    const stackedData = stack(groupedData);

    const x = d3
      .scaleBand()
      .domain(yearOrder)
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(stackedData[stackedData.length - 1], (d) => d[1])])
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

    // Add title with initial opacity 0
    const title = svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("opacity", 0)
      .text("Students per Year");

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

    // Create stacked bars with animation
    const bars = svg
      .selectAll("g.stack")
      .data(stackedData)
      .join("g")
      .attr("class", "stack")
      .attr("fill", (d) => colorScheme[d.key])
      .selectAll("rect")
      .data((d) => d)
      .join("rect")
      .attr("x", (d) => x(d.data.University_Year))
      .attr("width", x.bandwidth())
      .attr("y", height - margin.bottom) // Start from bottom
      .attr("height", 0) // Initial height 0
      .on("mouseover", (event, d) => {
        const genderCount = d[1] - d[0];
        tooltip.style("opacity", 1);
        tooltip.html(
          `${d.data.University_Year}<br>${
            d3.select(event.target.parentNode).datum().key
          }: ${genderCount} students`
        );
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`);
      })
      .on("mouseout", () => tooltip.style("opacity", 0));

    // Add axes with initial opacity 0
    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .style("opacity", 0)
      .call(d3.axisBottom(x));

    xAxis
      .selectAll("text")
      .attr("transform", "rotate(-30)")
      .style("text-anchor", "end");

    const yAxis = svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .style("opacity", 0)
      .call(d3.axisLeft(y).ticks(6));

    // Y-axis title with initial opacity 0
    const yAxisTitle = svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr(
        "transform",
        `translate(${margin.left / 2},${height / 2})rotate(-90)`
      )
      .text("Number of Students Per Year")
      .style("font-size", "12px")
      .style("opacity", 0);

    // Fade in the entire graph
    svg
      .transition()
      .duration(300)
      .style("opacity", 1)
      .on("end", () => {
        // After graph fades in, animate the bars
        bars
          .transition()
          .duration(1000)
          .delay((d, i) => i * 50)
          .attr("y", (d) => y(d[1]))
          .attr("height", (d) => y(d[0]) - y(d[1]));

        // Fade in axes, title, and labels
        title.transition().duration(750).style("opacity", 1);
        xAxis.transition().duration(750).style("opacity", 1);
        yAxis.transition().duration(750).style("opacity", 1);
        yAxisTitle.transition().duration(750).style("opacity", 1);
      });
  }, [data]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
}

export default Graph1;
