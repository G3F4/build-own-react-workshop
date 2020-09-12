import React from 'react';

function GrowingCounter(props: {
  count: number;
  increase: () => void;
  decrease: () => void;
}) {
  const { count, increase, decrease } = props;

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

function App() {
  const initialCount = 24;
  const [count, setCount] = React.useState(initialCount);
  const jump = 3;

  function increase() {
    console.log(['increase']);

    if (count < 90) {
      setCount((c) => c + jump);
    }
  }

  function decrease() {
    console.log(['decrease']);

    if (count > jump) {
      setCount((c) => {
        return c - jump;
      });
    }
  }

  function resetCounter() {
    setCount(initialCount);
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ whiteSpace: 'nowrap' }}>Amazing Growing counter!</h1>
      <GrowingCounter count={count} decrease={decrease} increase={increase} />
      <h2>Click it like it's hot!</h2>
      <button onClick={resetCounter}>reset counter</button>
    </div>
  );
}

export default App;
