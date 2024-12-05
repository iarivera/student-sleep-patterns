import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function Graph3({ data }) {
  const svgRef = useRef();
  const width = 600;
  const height = 450;

  useEffect(() => {
    if (!data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 70, left: 70 };
    const genderGroups = ['Male', 'Female', 'Other'];

    const preparedData = data;

    
    console.log(d => d.Sleep_Quality)

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(preparedData, d => d.Study_Hours)])
      .range([margin.left, width - margin.right])
    
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(preparedData, d => d.Sleep_Quality)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg
      .append('text')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .text("Study Hours")

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(${margin.left / 2},${height / 2})rotate(-90)`)
      .text("Sleep Quality")

    const color = d3.scaleOrdinal()
      .domain(genderGroups)
      .range(['#1f77b4', '#ff7f0e', '#2ca02c']);

    svg
      .append('g')
      .selectAll('rect')
      .data(genderGroups)
      .enter()
      .append('rect')
      .attr('x', (d, i) => width - margin.right - 200 + i * 70)
      .attr('y', 10)
      .attr('width', 10)
      .attr('height', 10)
      .attr('fill', d => color(d));

    svg 
      .append('g')
      .selectAll("dot")
      .data(preparedData)
      .enter()
      .append("circle")
        .attr("cx", function (d) { return x(d.Study_Hours) })
        .attr("cy", function (d) { return y(d.Sleep_Quality) })
        .attr("r", 5)
        .style("fill", d => color(d));
  
  }, [data]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
}

export default Graph3;
