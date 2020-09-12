import React from 'react';

function GrowingCounter() {
  const [count, setCount] = React.useState(24);

  function increase() {
    console.log(['increase']);
    setCount((c) => c + 3);
  }

  function decrease() {
    console.log(['decrease']);
    setCount((c) => {
      return c - 3;
    });
  }

  return (
    <div>
      <button onClick={increase}>increase size</button>
      <span style={{ fontSize: `${count}px` }}>{`${count}px`}</span>
      <button onClick={decrease}>decrease size</button>
    </div>
  );
}

function App() {
  return (
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ whiteSpace: 'nowrap' }}>Amazing Growing counter!</h1>
      <GrowingCounter />
    </div>
  );
}

export default App;
