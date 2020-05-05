import { ELEMENT_TYPE } from './constants.js';

function createDom(fiber) {
  const dom = fiber.type === ELEMENT_TYPE.TEXT
    ? document.createTextNode('')
    : document.createElement(fiber.type);
  const isProperty = key => key !== 'children';

  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = fiber.props[name]
    });

  return dom;
}

function render(element, container) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  }
}

let nextUnitOfWork = null;

function workLoop(deadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1
  }
  requestIdleCallback(workLoop)
}

function requestIdleCallback(callback) {
  return window.requestIdleCallback(callback);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  let prevSibling = null;
  let nextFiber = fiber;

  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom)
  }

  fiber.props.children.forEach((element, index) => {
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };

    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber;
  });

  if (fiber.child) {
    return fiber.child
  }

  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }

    nextFiber = nextFiber.parent
  }
}

const OwnReact = {
  render,
};

module.exports = OwnReact;