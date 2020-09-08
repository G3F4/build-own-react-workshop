import React from 'react';

function GrowingCounter() {
  const [count, setCount] = React.useState(0);

  console.log(['count'], count);

  function increase() {
    console.log(['increase']);
    setCount((c) => c + 1);
  }

  function decrease() {
    console.log(['decrease']);
    setCount((c) => {
      return c - 1;
    });
  }

  return (
    <div>
      <button onClick={increase}>increase size</button>
      <span style={{ fontSize: `${30 + count}px`, margin: `10px` }}>
        {count.toString()}
      </span>
      <button onClick={decrease}>decrease size</button>
    </div>
  );
}

function App() {
  return (
    <div>
      <h1>My Own React App!</h1>
      <GrowingCounter />
      <GrowingCounter />
      <GrowingCounter />
    </div>
  );
}

export default App;
