// @ts-ignore
import App from './App.tsx';
import React from 'react';
import ReactDOM from 'react-dom';
// @ts-ignore
import AppWithState from './AppWithState.tsx';

const params = new URLSearchParams(window.location.search);

function getElementToRender(scenarioName: string) {
  if (scenarioName === 'simplest') {
    return <span>Simplest React App</span>;
  }

  if (scenarioName === 'withState') {
    return <AppWithState />;
  }

  return <App />;
}

window.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    getElementToRender(params.get('scenario')),
    document.getElementById('root'),
  );
});
