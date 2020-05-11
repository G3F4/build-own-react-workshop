/* eslint-disable react/no-unescaped-entities */
import React from 'react';

function GrowingButton({ label }) {
  const [buttonSize, setButtonSize] = React.useState(10);

  return (
    <button
      style={{ fontSize: `${buttonSize}px` }}
      onClick={() => setButtonSize((size) => size + 1)}
    >
      {label}
    </button>
  );
}

function App() {
  return (
    <div>
      <h1>My Own React App!</h1>
      <div className="content">
        <p>It's awesome!</p>
        <GrowingButton label="Click it like it's hot!" />
      </div>
    </div>
  );
}

export default App;
