const OwnReact = require('../lib/OwnReact');

const App = (
  <div>
    <h1>My Own React App!</h1>
    <div className="content">
      <p>
        It's awesome!
      </p>
      <button onclick={() => { console.log('wow'); }}>
        Click it like it's hot!
      </button>
    </div>
  </div>
);

module.exports = App;
