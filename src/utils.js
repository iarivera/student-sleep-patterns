import * as d3 from "d3";

// Define color scheme and gender groups that will be used across all components
export const genderGroups = ["Male", "Female", "Other"];
export const yearOrder = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
export const colorScheme = {
  Male: "#ffa245", // Orange
  Female: "#27c498", // Green
  Other: "#8827c4", // Purple
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
