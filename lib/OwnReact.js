import { ELEMENT_TYPE } from './constants.js';

function createTextElement(text) {
  return {
    type: ELEMENT_TYPE.TEXT,
    props: {
      children: [],
      nodeValue: text,
    },
  };
}

function mapChildrenToTextOrChild(child) {
  return child => typeof child === 'object'
    ? child
    : createTextElement(child);
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(mapChildrenToTextOrChild)
    },
  }
}

const OwnReact = {
  createElement,
};

module.exports = OwnReact;