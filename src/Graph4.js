import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { colorScheme } from "./utils";

function Graph4({ data }) {
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

    // Create arc generators for animation
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    // Create arc for labels
    const labelArc = d3
      .arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.6);

    // Add title with initial opacity 0
    const title = svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("opacity", 0)
      .text("Gender Distribution of Students");

    // Create group element to hold pie chart
    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Create pie chart segments with initial angle of 0
    const arcs = g
      .selectAll(".arc")
      .data(pie(pieData))
      .enter()
      .append("g")
      .attr("class", "arc");

    // Add colored segments with animation
    const paths = arcs
      .append("path")
      .attr("fill", (d) => colorScheme[d.data.gender])
      .attr("stroke", "white")
      .style("stroke-width", "2px");

    // Add percentage and count labels with initial opacity 0
    const labelGroups = arcs.append("g").style("opacity", 0);

    // Add percentage text
    labelGroups
      .append("text")
      .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
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
      .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
      .attr("dy", "1.2em")
      .style("text-anchor", "middle")
      .style("font-size", "13px")
      .style("fill", "black")
      .text((d) => `(${d.data.count})`);

    // Fade in the entire graph
    svg
      .transition()
      .duration(300)
      .style("opacity", 1)
      .on("end", () => {
        // Animate pie segments with circular wipe
        paths.each(function (d) {
          const path = d3.select(this);
          const arcTween = function (d) {
            const interpolate = d3.interpolate(
              { startAngle: 0, endAngle: 0 },
              d
            );
            return function (t) {
              return arc(interpolate(t));
            };
          };

          path.transition().duration(1000).attrTween("d", arcTween);
        });

        // Fade in labels after segments are drawn
        labelGroups.transition().delay(1000).duration(500).style("opacity", 1);

        // Fade in title
        title.transition().duration(750).style("opacity", 1);
      });
  }, [data]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
}

export default Graph4;
