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

    const margin = { top: 20, right: 100, bottom: 70, left: 70 };
    const genderGroups = ['Male', 'Female', 'Other'];

    const parsedData = data.map(d => ({
      Study_Hours: parseFloat(d.Study_Hours),
      Sleep_Quality: parseFloat(d.Sleep_Quality),
    }))
    
    console.log(d => d.Sleep_Quality)
    const color = d3.scaleOrdinal()
      .domain(genderGroups)
      .range(['#1f77b4', '#ff7f0e', '#2ca02c']);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(parsedData, d => d.Study_Hours)])
      .range([margin.left, width - margin.right])
    
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(parsedData, d => d.Sleep_Quality)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg 
      .append('g')
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
        .attr("cx", function (d) { return x(d.Study_Hours) })
        .attr("cy", function (d) { return y(d.Sleep_Quality) })
        .attr("r", 2)
        .style("fill", d => color(d.Gender));

    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y));

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(${width/2},${height - margin.bottom + 35})`)
      .text("Study Hours")

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(${margin.left / 2},${height / 2})rotate(-90)`)
      .text("Sleep Quality")

    /*svg
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
      .selectAll('text')
      .data(genderGroups)
      .enter()
      .append('text')
      .attr('x', (d, i) => width - margin.right - 185 + i * 70)
      .attr('y', 20)
      .text(d => d)
      .style('font-size', '12px')
      .attr('alignment-baseline', 'middle');*/
  
  }, [data]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
}

export default Graph3;
