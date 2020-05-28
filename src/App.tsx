import React from 'react';

class TestClassComponent extends React.Component<
  { testProp: string },
  { testState: boolean }
> {
  state = { testState: true };

  render() {
    const { testProp } = this.props;
    const { testState } = this.state;

    return testState && <div>{testProp}</div>;
  }
}

class ExtendedTestClassComponent extends TestClassComponent {
  render() {
    const { testProp } = this.props;
    const { testState } = this.state;

    console.log(['ExtendedTestClassComponent.render'], this);

    return testState && <div>{testProp}</div>;
  }
}

function GrowingButton({ label, visible }) {
  const [buttonSize, setButtonSize] = React.useState(10);

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

  return (
    <div>
      <h1>My Own React App!</h1>
      <div>
        <div>
          <span>{count.toString()}</span>
          <button onClick={() => setCount((c) => c + 1)}>
            increase counter
          </button>
          <button onClick={() => setCount((c) => c - 1)}>
            decrease counter
          </button>
        </div>
        <GrowingButton label="Click it like it's hot!" visible={visible} />
        <button onClick={visible ? disappear : appear}>{`${
          visible ? 'disappear' : 'appear'
        } now!`}</button>
      </div>
      <br />
      <ExtendedTestClassComponent testProp="I'm classy" />
    </div>
  );
}

export default App;
