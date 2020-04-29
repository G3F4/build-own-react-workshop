const OwnReact = require('../lib/OwnReact');
const App = require('./App.jsx');

window.addEventListener('DOMContentLoaded', () => {
  OwnReact.render(App, document.getElementById('root'));
});