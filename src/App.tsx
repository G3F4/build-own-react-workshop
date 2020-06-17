import React from 'react';

function GrowingButton() {
  const count = 0;

  function increase() {
    console.log(['increase']);
  }

  function decrease() {
    console.log(['decrease']);
  }

  return (
    <div>
      <div>
        <span>{count.toString()}</span>
        <button onClick={increase}>increase counter</button>
        <button onClick={decrease}>decrease counter</button>
      </div>
    </div>
  );
}

function App() {
  return (
    <div>
      <h1>My Own React App!</h1>
      <GrowingButton />
    </div>
  );
}

export default App;
