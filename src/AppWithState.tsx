import React from 'react';

export default function AppWithState() {
  const jump = 3;
  const [count, setCount] = React.useState(10);

  function increase() {
    console.log(['increase']);

    if (count < 90) {
      setCount((c) => c + jump);
    }
  }

  function decrease() {
    console.log(['decrease']);

    if (count > jump) {
      setCount((c) => c - jump);
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <button
        style={{ textTransform: 'uppercase', padding: '5px' }}
        onClick={increase}
      >
        increase size
      </button>
      <span
        style={{ fontSize: `${count}px`, margin: '10px' }}
      >{`${count}px`}</span>
      <button
        style={{ textTransform: 'uppercase', padding: '5px' }}
        onClick={decrease}
      >
        decrease size
      </button>
    </div>
  );
}
