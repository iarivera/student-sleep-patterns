import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function Graph1({ data }) {
  const svgRef = useRef();
  const width = 600;
  const height = 450;

  useEffect(() => {
    if (!data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 70, left: 70 };
    //const genderGroups = ['Male', 'Female', 'Other'];
    const yearOrder = ['1st Year', '2nd Year', '3rd Year', '4th Year']; // Order the data by University Year

    // Put all students together based on year
    const groupedData = d3.rollup(
      data,
      group => group.length, 
      d => d.University_Year);    

    // Set up data
    const preparedData = Array.from(groupedData, ([year, count]) => ({
      University_Year: year,
      Student_Count: count,
    }));

    const x = d3
      .scaleBand()
      .domain(yearOrder)
      .range([margin.left, width - margin.right])
      .padding(0.2);


    const y = d3
      .scaleLinear()
      .domain([0, d3.max(preparedData, d => d.Student_Count)])
      .nice()
      .range([height - margin.bottom, margin.top]);
      
    // Tooltip setup
    const tooltip = d3.select('body')
      .append('div')
      .style('position', 'absolute')
      .style('background', 'lightgray')
      .style('padding', '5px')
      .style('border-radius', '5px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    // Bars for student count
    svg
      .selectAll('g')
      .data(preparedData)
      .join('rect')
      .attr('x', d => x(d.University_Year))
      .attr('y', d=> y(d.Student_Count))
      .attr('height', d => y(0) - y(d.Student_Count))
      .attr('width', x.bandwidth())
      .attr('fill', '#1f77b4')
      .on('mouseover', (event, d) => {
        tooltip.style('opacity', 1);
        tooltip.html(
          `Male: <br> Female: <br> Other:`
        );
      })
      .on('mousemove', event => {
        tooltip
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 20}px`);
    })
    .on('mouseout', () => tooltip.style('opacity', 0));
    
    
    // X-axis
    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll('text') // Rotate x-axis labels
      .attr('transform', 'rotate(-30)')
      .style('text-anchor', 'end');
    
    // Y-axis
    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(6));

    // Y-axis title
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(${margin.left / 2},${height / 2})rotate(-90)`)
      .text('Number of Students Per Year')
      .style('font-size', '12px');
  }, [data]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
}

export default Graph1;
