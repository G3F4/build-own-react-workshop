const ELEMENT_TYPE = {
  TEXT: Symbol('ELEMENT_TYPE.TEXT'),
};

function createTextElement(text) {
  return {
    type: ELEMENT_TYPE.TEXT,
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(
        child => typeof child === 'object'
          ? child
          : createTextElement(child)
      )
    },
  }
}

function render(element, container) {
  const dom = element.type === ELEMENT_TYPE.TEXT
    ? document.createTextNode('')
    : document.createElement(element.type);
  const isProperty = key => key !== 'children';

  Object.keys(element.props)
    .filter(isProperty)
    .forEach(prop => {
      dom[prop] = element.props[prop];
    });

  element.props.children.forEach(child => render(child, dom));

  container.append(dom);
}

const OwnReact = {
  createElement,
  render,
};

module.exports = OwnReact;