const FunctionComponent = 0;
const HostRoot = 3;
const HostComponent = 5;
let workInProgressRoot = null; // The root we're working on
let workInProgress = null; // The fiber we're working on

function reconcileChildren(fiber, children) {
  if (Array.isArray(children) || typeof children === 'object') {
    let previousFiber = null;
    const elements = Array.isArray(children) ? children : [children];

    elements.forEach((element, index) => {
      const tag =
        typeof element.type === 'function' ? FunctionComponent : HostComponent;
      const newFiber = {
        tag,
        type: element.type,
        props: element.props,
        return: fiber,
        sibling: null,
        stateNode: null,
      };

      if (index === 0) {
        fiber.child = newFiber;
      } else if (element) {
        previousFiber.sibling = newFiber;
      }

      previousFiber = newFiber;
    });
  } else {
    fiber.child = null;
  }
}

function completeUnitOfWork(unitOfWork) {
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
  let next = beginWork(unitOfWork);

  if (next === null) {
    next = completeUnitOfWork(unitOfWork);
  }

  return next;
}

function render(element, container) {
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

function updateProperties(fiber) {
  const isEvent = (key) => key.startsWith('on');
  const isChildren = (key) => key === 'children';
  const isStyle = (key) => key === 'style';
  const isTextContent = (prop) =>
    typeof prop === 'string' || typeof prop === 'number';

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
  let parentFiber = fiber.return;

  while (!parentFiber.stateNode) {
    parentFiber = parentFiber.return;
  }

  const domParent = parentFiber.stateNode;

  if (fiber.stateNode != null) {
    domParent.appendChild(fiber.stateNode);
    updateProperties(fiber);
  }

  fiber.child && commitWork(fiber.child);
  fiber.sibling && commitWork(fiber.sibling);
}

function performSyncWorkOnRoot() {
  if (workInProgress !== null) {
    while (workInProgress !== null) {
      workInProgress = performUnitOfWork(workInProgress);
    }

    workInProgressRoot.finishedWork = workInProgressRoot;
    workInProgressRoot.child && commitWork(workInProgressRoot.child);
  }

  requestIdleCallback(performSyncWorkOnRoot);
}

requestIdleCallback(performSyncWorkOnRoot);

function createElement(type, config, ...children) {
  return {
    type,
    props: {
      ...(config || {}),
      children: children.length === 1 ? children[0] : children,
    },
  };
}

export default {
  createElement,
  render,
};
