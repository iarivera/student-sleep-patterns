import React, { useState } from "react";
import * as d3 from "d3";
import Graph1 from "./Graph1";
import Graph2 from "./Graph2";
import Graph3 from "./Graph3";
import Graph4 from "./Graph4";
import Graph5 from "./Graph5";
import Graph6 from "./Graph6";
import Legend from "./Legend";
import { yearOrder, genderGroups } from "./utils";
import "./App.css";

function App() {
  const [data, setData] = useState(null);
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedGender, setSelectedGender] = useState("All Genders");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;
      const parsedData = d3.csvParse(text);
      setData(parsedData);
    };

    if (file) {
      reader.readAsText(file);
    }
  };

  // Filter data based on selected year and gender
  const filteredData = data?.filter((d) => {
    const yearMatch =
      selectedYear === "All Years" || d.University_Year === selectedYear;
    const genderMatch =
      selectedGender === "All Genders" || d.Gender === selectedGender;
    return yearMatch && genderMatch;
  });

  return (
    <div className="dashboard-container">
      <div className="controls">
        <input type="file" accept=".csv" onChange={handleFileUpload} />
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="filter-select"
        >
          <option value="All Years">All Years</option>
          {yearOrder.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <select
          value={selectedGender}
          onChange={(e) => setSelectedGender(e.target.value)}
          className="filter-select"
        >
          <option value="All Genders">All Genders</option>
          {genderGroups.map((gender) => (
            <option key={gender} value={gender}>
              {gender}
            </option>
          ))}
        </select>
      </div>
      <div className="legend-container">
        <Legend />
      </div>
      <div className="graphs-grid">
        <Graph1 data={filteredData} />
        <Graph2 data={filteredData} />
        <Graph3 data={filteredData} />
        <Graph4 data={filteredData} />
        <Graph5 data={filteredData} />
        <Graph6 data={filteredData} />
      </div>
    </div>
  );
}

export default App;
