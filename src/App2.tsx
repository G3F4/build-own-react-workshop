import React from 'react';

function App2() {
  const [s, setS] = React.useState(0);

  function increase() {
    setS((s) => s + 1);
  }

  return (
    <div>
      <span>{s}</span>
      <button onClick={increase}>increase</button>
    </div>
  );
}

export default App2;
