import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { yearOrder, genderGroups, colorScheme } from "./utils";

function Graph5({ data }) {
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

    // Group data by year and gender, calculate average screen time
    const groupedData = yearOrder
      .map((year) => {
        const yearData = data.filter((d) => d.University_Year === year);
        return genderGroups.map((gender) => {
          const genderData = yearData.filter((d) => d.Gender === gender);
          return {
            year,
            gender,
            avgScreenTime: d3.mean(genderData, (d) => +d.Screen_Time) || 0,
          };
        });
      })
      .flat();

    // Create scales
    const x = d3
      .scaleBand()
      .domain(yearOrder)
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(groupedData, (d) => d.avgScreenTime) * 0.9,
        d3.max(groupedData, (d) => d.avgScreenTime) * 1.1,
      ])
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
      .text("Daily Screen Time Trends by University Year");

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

    // Create line generator
    const line = d3
      .line()
      .x((d) => x(d.year) + x.bandwidth() / 2)
      .y((d) => y(d.avgScreenTime));

    // Create paths with initial state (no length)
    const paths = svg
      .selectAll(".line")
      .data(genderGroups)
      .join("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", (d) => colorScheme[d])
      .attr("stroke-width", 2)
      .attr("opacity", (d) => (d === "Other" ? 0.5 : 0.8))
      .attr("d", (gender) => {
        const genderData = groupedData.filter((d) => d.gender === gender);
        return line(genderData);
      })
      .attr("stroke-dasharray", function () {
        return this.getTotalLength() + " " + this.getTotalLength();
      })
      .attr("stroke-dashoffset", function () {
        return this.getTotalLength();
      });

    // Add data points with initial opacity 0
    const points = svg
      .selectAll(".points")
      .data(genderGroups)
      .join("g")
      .attr("class", "points")
      .selectAll("circle")
      .data((gender) => groupedData.filter((d) => d.gender === gender))
      .join("circle")
      .attr("cx", (d) => x(d.year) + x.bandwidth() / 2)
      .attr("cy", (d) => y(d.avgScreenTime))
      .attr("r", 5)
      .attr("fill", (d) => colorScheme[d.gender])
      .attr("opacity", 0)
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1);
        tooltip.html(
          `${d.year}<br>${
            d.gender
          }<br>Average Screen Time: ${d.avgScreenTime.toFixed(2)} hours`
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
      .text("Average Daily Screen Time (hours)")
      .style("font-size", "12px")
      .style("opacity", 0);

    // Fade in the entire graph
    svg
      .transition()
      .duration(300)
      .style("opacity", 1)
      .on("end", () => {
        // Animate lines drawing
        paths
          .transition()
          .duration(1500)
          .attr("stroke-dashoffset", 0)
          .on("end", () => {
            // Fade in points after line is drawn
            points
              .transition()
              .duration(400)
              .attr("opacity", (d) => (d.gender === "Other" ? 0.5 : 0.8));
          });

        // Fade in axes, title, and labels
        title.transition().duration(750).style("opacity", 1);
        xAxis.transition().duration(750).style("opacity", 1);
        yAxis.transition().duration(750).style("opacity", 1);
        yAxisTitle.transition().duration(750).style("opacity", 1);
      });
  }, [data]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
}

export default Graph5;
