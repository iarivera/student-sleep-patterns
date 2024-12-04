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
    const genderGroups = ['Male', 'Female', 'Other'];

    const groupedData = d3.group(data, d => d.University_Year);

    const preparedData = Array.from(groupedData).map(([year, entries]) => {
      const maleData = entries.filter(d => d.Gender === 'Male');
      const femaleData = entries.filter(d => d.Gender === 'Female');
      const otherData = entries.filter(d => d.Gender === 'Other');

      return {
        University_Year: year,
        Male: d3.mean(maleData, d => +d.Sleep_Duration), // Calculate average sleep duration for Male
        Female: d3.mean(femaleData, d => +d.Sleep_Duration), // Calculate average sleep duration for Female
        Other: d3.mean(otherData, d => +d.Sleep_Duration) // Calculate average sleep duration for Other
      };
    });

    const x0 = d3
      .scaleBand()
      .domain(preparedData.map(d => d.University_Year))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const x1 = d3
      .scaleBand()
      .domain(genderGroups)
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(preparedData, d => d.Male + d.Female + d.Other)])
      .nice()
      .range([height - margin.bottom, margin.top]);
      
    const color = d3.scaleOrdinal()
      .domain(genderGroups)
      .range(['#1f77b4', '#ff7f0e', '#2ca02c']);
  })

  return (
    <div style={{ flex: 1, border: '1px solid black', margin: '5px', padding: '10px' }}>
      <h3>Graph 1</h3>
      {data ? (
        <svg width="100%" height="100%">
          {/* Render specific graph using D3 here */}
        </svg>
      ) : (
        <p>Upload a CSV file to display the graph</p>
      )}
    </div>
  );
}

export default Graph1;
