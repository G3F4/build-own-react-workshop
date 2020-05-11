/* eslint-disable react/no-unescaped-entities */
import React from 'react';

const App = (
  <div>
    <h1>My Own React App!</h1>
    <div className="content">
      <p>It's awesome!</p>
      <button
        onClick={() => {
          alert('wow');
        }}
      >
        Click it like it's hot!
      </button>
    </div>
  </div>
);

export default App;
