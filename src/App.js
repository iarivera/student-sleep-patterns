import React, { useState } from "react";
import * as d3 from "d3";
import Graph1 from "./Graph1";
import Graph2 from "./Graph2";
import Graph3 from "./Graph3";
import Graph4 from "./Graph4";
import Graph5 from "./Graph5";
import Graph6 from "./Graph6";
import Legend from "./Legend";

function App() {
  const [data, setData] = useState(null);

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

  return (
    <div style={{ padding: "20px" }}>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "20px",
        }}
      >
        <Legend />
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "space-between",
        }}
      >
        <Graph1 data={data} />
        <Graph2 data={data} />
        <Graph3 data={data} />
        <Graph4 data={data} />
        <Graph5 data={data} />
        <Graph6 data={data} />
      </div>
    </div>
  );
}

export default App;
