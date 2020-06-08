function createElement(...args) {
  console.log(['createElement'], args);
}

function render(...args) {
  console.log(['render'], args);
}

export default {
  createElement,
  render,
}