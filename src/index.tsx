// @ts-ignore
import App from './App.tsx';
import React from 'react';
import ReactDOM from 'react-dom';
// @ts-ignore
import AppWithComponent from './AppWithComponent.tsx';

const params = new URLSearchParams(window.location.search);

function getElementToRender(scenarioName: string) {
  if (scenarioName === 'simplest') {
    return <span>Simplest React App</span>;
  }

  if (scenarioName === 'withComponent') {
    return <AppWithComponent />;
  }

  return <App />;
}

window.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    getElementToRender(params.get('scenario')),
    document.getElementById('root'),
  );
});
