import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

function Graph1({ data }) {
  const svgRef = useRef();
  const width = 600;
  const height = 450;

  useEffect(() => {
    if (!data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 100, bottom: 70, left: 70 };
    const genderGroups = ["Male", "Female", "Other"];
    const yearOrder = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

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

    const color = d3
      .scaleOrdinal()
      .domain(genderGroups)
      .range(["#1f77b4", "#ff7f0e", "#2ca02c"]); // Blue for Male, Orange for Female, Green for Other

    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "lightgray")
      .style("padding", "5px")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // Create stacked bars
    svg
      .selectAll("g.stack")
      .data(stackedData)
      .join("g")
      .attr("class", "stack")
      .attr("fill", (d) => color(d.key))
      .selectAll("rect")
      .data((d) => d)
      .join("rect")
      .attr("x", (d) => x(d.data.University_Year))
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth())
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

    // X-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-30)")
      .style("text-anchor", "end");

    // Y-axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(6));

    // Y-axis title
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr(
        "transform",
        `translate(${margin.left / 2},${height / 2})rotate(-90)`
      )
      .text("Number of Students Per Year")
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

export default Graph1;
