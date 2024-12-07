import React from 'react';

function Graph4({ data }) {
  return (
    <div style={{ flex: 1, border: '1px solid black', margin: '5px', padding: '10px' }}>
      <h3>Graph 4</h3>
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

export default Graph4;
