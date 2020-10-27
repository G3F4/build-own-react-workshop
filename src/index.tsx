// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import App from './App.tsx';
import React from 'react';
import ReactDOM from 'react-dom';

const params = new URLSearchParams(window.location.search);

function getElementToRender(scenarioName: string) {
  if (scenarioName === 'simplest') {
    return <span>Simplest React App</span>;
  }

  return <App />;
}

window.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    getElementToRender(params.get('scenario')),
    document.getElementById('root'),
  );
});
