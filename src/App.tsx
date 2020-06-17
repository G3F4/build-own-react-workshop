import React from 'react';

function GrowingButton({ label, visible }) {
  if (!visible) {
    return null;
  }

  function grow() {
    console.log(['grow']);
  }

  return (
    <button style={{ fontSize: '15px' }} onClick={grow}>
      {label}
    </button>
  );
}

function App() {
  const count = 0;
  const visible = true;

  function disappear() {
    console.log(['disappear']);
  }

  function appear() {
    console.log(['appear']);
  }

  function increase() {
    console.log(['increase']);
  }

  function decrease() {
    console.log(['decrease']);
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
