let nextUnitOfWork = null;
let workDone = null;
let workInProgress = null;
let workInProgressRoot = null;
let deletions = null;
let hookIndex = null;

function render(element, container) {
  workInProgressRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: workDone,
  };
  deletions = [];
  nextUnitOfWork = workInProgressRoot;
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createElement(type, props, ...children) {
  console.log(['createElement.type'], type);

  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === 'object' ? child : createTextElement(child),
      ),
    },
  };
}

function isEvent(key) {
  return key.startsWith('on');
}

function isProperty(key) {
  return key !== 'children' && !isEvent(key);
}

function isNew(prev, next) {
  return (key) => prev[key] !== next[key];
}

function isGone(prev, next) {
  return (key) => !(key in next);
}

function updateDom(dom, prevProps, nextProps) {
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);

      dom.removeEventListener(eventType, prevProps[name]);
    });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = '';
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      if (name === 'style') {
        Object.keys(nextProps[name]).forEach((cssProperty) => {
          dom.style[cssProperty] = nextProps.style[cssProperty];
        });
      } else {
        dom[name] = nextProps[name];
      }
    });

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);

      dom.addEventListener(eventType, nextProps[name]);
    });
}

function createDom(fiber) {
  const dom =
    fiber.type == 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);

  return dom;
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  let domParentFiber = fiber.return;

  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.return;
  }

  const domParent = domParentFiber.dom;

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, domParent);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(workInProgressRoot.child);
  workDone = workInProgressRoot;
  workInProgressRoot = null;
}

function reconcileChildren(fiber, elements) {
  let index = 0;
  let oldFiber = fiber.alternate && fiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    const sameType = oldFiber && element && element.type == oldFiber.type;
    let newFiber = null;

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        return: fiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      };
    }

    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        return: fiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      };
    }

    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      fiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

function renderClassComponent(Component, props) {
  const instance = new Component(props);

  return instance.render();
}

function shouldConstruct(Component) {
  return typeof Component === 'function' && Component.isReactComponent;
}

function updateFunctionComponent(fiber) {
  workInProgress = fiber;
  hookIndex = 0;
  workInProgress.hooks = [];

  const elements = shouldConstruct(fiber.type)
    ? [renderClassComponent(fiber.type, fiber.props)]
    : [fiber.type(fiber.props)];

  reconcileChildren(fiber, elements);
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  reconcileChildren(fiber, fiber.props.children);
}

function useState(initial) {
  const oldHook =
    workInProgress.alternate &&
    workInProgress.alternate.hooks &&
    workInProgress.alternate.hooks[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };
  const actions = oldHook ? oldHook.queue : [];

  actions.forEach((action) => {
    hook.state = action(hook.state);
  });

  function setState(action) {
    hook.queue.push(action);
    workInProgressRoot = {
      dom: workDone.dom,
      props: workDone.props,
      alternate: workDone,
    };
    nextUnitOfWork = workInProgressRoot;
    deletions = [];
  }

  workInProgress.hooks.push(hook);
  hookIndex++;

  return [hook.state, setState];
}

class Component {
  static isReactComponent = true;

  props;
  state;

  constructor(props) {
    this.props = props;
  }

  setState(statePartial) {
    Object.assign(this.state, statePartial);
  }

  render() {
    throw new Error('implement render method');
  }
}

function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function;

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;

  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }

    nextFiber = nextFiber.return;
  }
}

function workLoop(deadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && workInProgressRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

const OwnReact = {
  Component,
  createElement,
  render,
  useState,
};

export default OwnReact;
