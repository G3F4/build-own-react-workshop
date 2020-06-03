import React from 'react';

function GrowingButton({ label, visible }) {
  const [buttonSize, setButtonSize] = React.useState(20);

  if (!visible) {
    return null;
  }

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
  const [count, setCount] = React.useState(0);
  const [visible, setVisible] = React.useState(true);

  function disappear() {
    setVisible(() => false);
  }

  function appear() {
    setVisible(() => true);
  }

  function increase() {
    setCount((c) => c + 1);
  }

  function decrease() {
    setCount((c) => c - 1);
  }

  return (
    <div>
      <h1>My Own React App!</h1>
      <div>
        <div>
          <span>{count.toString()}</span>
          <button onClick={increase}>increase counter</button>
          <button onClick={decrease}>decrease counter</button>
        </div>
        <GrowingButton label="Click it like it's hot!" visible={visible} />
        <button onClick={visible ? disappear : appear}>{`${
          visible ? 'disappear' : 'appear'
        } now!`}</button>
      </div>
    </div>
  );
}

export default App;
