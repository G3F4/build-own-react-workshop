import React from 'react';

function GrowingCounter() {
  const count = 0;

  function increase() {
    console.log(['increase']);
  }

  function decrease() {
    console.log(['decrease']);
  }

  return (
    <div>
      <button onClick={increase}>increase counter</button>
      <span style={{ fontSize: `${30 + count}px`, margin: `10px` }}>
        {count.toString()}
      </span>
      <button onClick={decrease}>decrease counter</button>
    </div>
  );
}

function App() {
  return (
    <div>
      <h1>My Own React App!</h1>
      <GrowingCounter />
    </div>
  );
}

export default App;
