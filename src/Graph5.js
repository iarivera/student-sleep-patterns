import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { yearOrder } from "./Legend";

function Graph5({ data }) {
  const svgRef = useRef();
  const width = 600;
  const height = 450;

  useEffect(() => {
    if (!data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 70, left: 70 };

    // Calculate average screen time for each year and gender with error handling
    const genders = ["Male", "Female", "Other"];
    const screenTimeByYearAndGender = genders
      .map((gender) => {
        return yearOrder.map((year) => {
          const yearGenderData = data.filter(
            (d) => d.University_Year === year && d.Gender === gender
          );
          const validScreenTimes = yearGenderData
            .map((d) => parseFloat(d.Screen_Time))
            .filter((time) => !isNaN(time));

          return {
            year: year,
            gender: gender,
            screenTime:
              validScreenTimes.length > 0 ? d3.mean(validScreenTimes) : 0,
          };
        });
      })
      .flat();

    const x = d3
      .scaleBand()
      .domain(yearOrder)
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(screenTimeByYearAndGender, (d) => d.screenTime) * 0.95,
        d3.max(screenTimeByYearAndGender, (d) => d.screenTime) * 1.05,
      ])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Color scale for genders
    const colorScale = d3
      .scaleOrdinal()
      .domain(genders)
      .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

    // Add grid lines
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

    // Add the lines
    const line = d3
      .line()
      .x((d) => x(d.year) + x.bandwidth() / 2)
      .y((d) => y(d.screenTime))
      .defined((d) => d.screenTime > 0);

    genders.forEach((gender, index) => {
      const genderData = screenTimeByYearAndGender.filter(
        (d) => d.gender === gender
      );

      // Add line
      svg
        .append("path")
        .datum(genderData)
        .attr("fill", "none")
        .attr("stroke", colorScale(gender))
        .attr("stroke-width", 2)
        .attr("opacity", 0.6)
        .attr("d", line);

      // Add dots
      svg
        .selectAll(`circle-${gender}`)
        .data(genderData.filter((d) => d.screenTime > 0))
        .join("circle")
        .attr("cx", (d) => x(d.year) + x.bandwidth() / 2)
        .attr("cy", (d) => y(d.screenTime))
        .attr("r", 5)
        .attr("fill", colorScale(gender))
        .attr("opacity", 0.6)
        .on("mouseover", (event, d) => {
          tooltip.style("opacity", 1);
          tooltip.html(
            `${d.year}<br>${
              d.gender
            }<br>Average Screen Time: ${d.screenTime.toFixed(2)} hours`
          );
        })
        .on("mousemove", (event) => {
          tooltip
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 20}px`);
        })
        .on("mouseout", () => tooltip.style("opacity", 0));
    });

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
      .text("Average Daily Screen Time (hours)")
      .style("font-size", "12px");
  }, [data]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
}

export default Graph5;
