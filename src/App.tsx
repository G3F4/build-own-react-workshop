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

function GrowingButton({ label }) {
  const [buttonSize, setButtonSize] = React.useState(10);

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
  return (
    <div>
      <h1>My Own React App!</h1>
      <div>
        <p>It's awesome!</p>
        <GrowingButton label="Click it like it's hot!" />
      </div>
      <ExtendedTestClassComponent testProp="orajt" />
    </div>
  );
}

export default App;
