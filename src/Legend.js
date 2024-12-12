import React from "react";
import * as d3 from "d3";

// Define color scheme and gender groups that will be used across all components
export const genderGroups = ["Male", "Female", "Other"];
export const yearOrder = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
export const colorScheme = {
  Male: "#1f77b4", // Blue
  Female: "#ff7f0e", // Orange
  Other: "#2ca02c", // Green
};

// Function to generate shapes (used in scatter plot and legend)
export const symbolGenerator = (type, size) => {
  if (type === "triangle") {
    return d3.symbol().type(d3.symbolTriangle).size(size)();
  } else if (type === "square") {
    return d3.symbol().type(d3.symbolSquare).size(size)();
  } else {
    return d3.symbol().type(d3.symbolCircle).size(size)();
  }
};

function Legend() {
  const width = 200;
  const height = 100;
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {genderGroups.map((gender, i) => (
          <g key={gender} transform={`translate(0, ${i * 25})`}>
            <path
              d={symbolGenerator(
                gender === "Male"
                  ? "triangle"
                  : gender === "Female"
                  ? "square"
                  : "circle",
                100
              )}
              transform={`translate(5, 5)`}
              fill={colorScheme[gender]}
            />
            <text
              x={25}
              y={10}
              style={{ fontSize: "12px", alignmentBaseline: "middle" }}
            >
              {gender}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

export default Legend;
