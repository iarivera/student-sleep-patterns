import React from "react";
import * as d3 from "d3";
import { genderGroups, colorScheme, symbolGenerator } from "./utils";

function Legend() {
  const width = 500;
  const height = 60;
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const symbolSize = 200;
  const spacing = 150;

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {genderGroups.map((gender, i) => (
          <g key={gender} transform={`translate(${i * spacing}, 0)`}>
            <path
              d={symbolGenerator(
                gender === "Male"
                  ? "triangle"
                  : gender === "Female"
                  ? "square"
                  : "circle",
                symbolSize
              )}
              transform={`translate(5, 5)`}
              fill={colorScheme[gender]}
            />
            <text
              x={35}
              y={10}
              style={{ fontSize: "16px", alignmentBaseline: "middle" }}
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
