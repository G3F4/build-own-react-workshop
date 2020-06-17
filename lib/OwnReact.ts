const FunctionComponent = 0;
const HostRoot = 3;
const HostComponent = 5;
let workInProgressRoot = null; // The root we're working on
let workInProgress = null; // The fiber we're working on

function reconcileChildren(wipFiber, children) {
  console.log(['reconcileChildren'], { wipFiber, children });

  if (Array.isArray(children) || typeof children === 'object') {
    let index = 0;
    let prevSibling = null;
    const elements = Array.isArray(children) ? children : [children];

    while (index < elements.length) {
      const element = elements[index];
      const newFiber = {
        tag:
          typeof element.type === 'function'
            ? FunctionComponent
            : HostComponent,
        type: element.type,
        props: element.props,
        stateNode: null,
        return: wipFiber,
        sibling: null,
      };

      if (index === 0) {
        wipFiber.child = newFiber;
      } else if (element) {
        prevSibling.sibling = newFiber;
      }

      prevSibling = newFiber;
      index++;
    }
  } else {
    wipFiber.child = null;
  }
}

function completeUnitOfWork(unitOfWork) {
  console.log(['completeUnitOfWork'], { unitOfWork });
  workInProgress = unitOfWork;

  do {
    const returnFiber = workInProgress.return;

    if (workInProgress.tag === HostComponent) {
      workInProgress.stateNode = document.createElement(workInProgress.type);
    }

    const siblingFiber = workInProgress.sibling;

    if (siblingFiber !== null) {
      return siblingFiber;
    }

    workInProgress = returnFiber;
  } while (workInProgress !== null); // We've reached the root.

  return null;
}

function beginWork(unitOfWork) {
  console.log(['beginWork'], { unitOfWork });

  switch (unitOfWork.tag) {
    case FunctionComponent: {
      reconcileChildren(unitOfWork, unitOfWork.type(unitOfWork.props));

      break;
    }
    case HostRoot:
    case HostComponent: {
      reconcileChildren(unitOfWork, unitOfWork.props.children);

      break;
    }
  }

  return unitOfWork.child;
}

function performUnitOfWork(unitOfWork) {
  console.log(['performUnitOfWork'], { unitOfWork });

  let next;

  next = beginWork(unitOfWork);

  if (next === null) {
    next = completeUnitOfWork(unitOfWork);
  }

  return next;
}

function render(element, container) {
  console.log(['render'], { element, container });
  workInProgressRoot = {
    tag: HostRoot,
    stateNode: container,
    props: {
      children: [element],
    },
    sibling: null,
    return: null,
    child: null,
  };
  workInProgress = workInProgressRoot;
}

const isEvent = (key) => key.startsWith('on');
const isChildren = (key) => key === 'children';
const isStyle = (key) => key === 'style';
const isTextContent = (prop) =>
  typeof prop === 'string' || typeof prop === 'number';

function updateProperties(fiber) {
  console.log(['updateProperties'], { fiber });

  Object.keys(fiber.props).forEach((name) => {
    const prop = fiber.props[name];

    if (isTextContent(prop)) {
      fiber.stateNode.textContent = prop;
    } else if (isEvent(name)) {
      const eventType = name.toLowerCase().substring(2);

      fiber.stateNode.addEventListener(eventType, fiber.props[name]);
    } else if (isStyle(name)) {
      Object.entries(prop).forEach(([key, value]) => {
        fiber.stateNode.style[key] = value;
      });
    } else if (!isChildren(name)) {
      fiber.stateNode[name] = fiber.props[name];
    }
  });
}

function commitWork(fiber) {
  console.log(['commitWork'], { fiber });

  if (!fiber) {
    return;
  }

  let domParentFiber = fiber.return;

  while (!domParentFiber.stateNode) {
    domParentFiber = domParentFiber.return;
  }

  const domParent = domParentFiber.stateNode;

  if (fiber.stateNode != null) {
    domParent.appendChild(fiber.stateNode);
    updateProperties(fiber);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function performSyncWorkOnRoot() {
  if (workInProgress !== null) {
    while (workInProgress !== null) {
      workInProgress = performUnitOfWork(workInProgress);
    }

    workInProgressRoot.finishedWork = workInProgressRoot;
    commitWork(workInProgressRoot.child);
  }

  requestIdleCallback(performSyncWorkOnRoot);
}

requestIdleCallback(performSyncWorkOnRoot);

function createElement(type, config, ...children) {
  console.log(['createElement'], { type, config, children });

  const props = config || {};

  if (children.length === 1) {
    props.children = children[0];
  } else if (children.length > 1) {
    props.children = children;
  }

  return {
    type,
    props,
  };
}

export default {
  createElement,
  render,
};
