const FunctionComponent = 0;
const HostRoot = 3;
const HostComponent = 5;
const HostText = 6;
let workInProgressRoot = null; // The root we're working on
let workInProgress = null; // The fiber we're working on

function reconcileChildren(wipFiber, children) {
  console.log(['reconcileChildren'], { wipFiber, children });

  if (Array.isArray(children) || typeof children === 'object') {
    let index = 0;
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
    let prevSibling = null;
    const elements = Array.isArray(children) ? children : [children];

    while (index < elements.length || oldFiber != null) {
      const element = elements[index];

      console.log(['element.type'], element.type);

      const newFiber = {
        tag:
          typeof element.type === 'function'
            ? FunctionComponent
            : HostComponent,
        type: element.type,
        props: element.props,
        stateNode: null,
        return: wipFiber,
        alternate: null,
        sibling: null,
        effectTag: 'PLACEMENT',
      };

      if (oldFiber) {
        oldFiber = oldFiber.sibling;
      }

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

function createInstance(type) {
  return document.createElement(type);
}

function completeWork(workInProgress) {
  switch (workInProgress.tag) {
    case FunctionComponent:
    case HostRoot: {
      return null;
    }
    case HostComponent: {
      workInProgress.stateNode = createInstance(workInProgress.type);

      return null;
    }
  }
}

function completeUnitOfWork(unitOfWork) {
  console.log(['completeUnitOfWork'], { unitOfWork });
  workInProgress = unitOfWork;

  do {
    const returnFiber = workInProgress.return;

    completeWork(workInProgress);

    const siblingFiber = workInProgress.sibling;

    if (siblingFiber !== null) {
      return siblingFiber;
    }

    workInProgress = returnFiber;
  } while (workInProgress !== null); // We've reached the root.

  return null;
}

function updateFunctionComponent(unitOfWork) {
  reconcileChildren(unitOfWork, unitOfWork.type(unitOfWork.props));

  return unitOfWork.child;
}

function updateHostRoot(unitOfWork) {
  reconcileChildren(unitOfWork, unitOfWork.props.children);

  return unitOfWork.child;
}

function updateHostComponent(unitOfWork) {
  reconcileChildren(unitOfWork, unitOfWork.props.children);

  return unitOfWork.child;
}

function beginWork(workInProgress) {
  console.log(['beginWork'], { workInProgress });

  switch (workInProgress.tag) {
    case FunctionComponent: {
      return updateFunctionComponent(workInProgress);
    }
    case HostRoot: {
      return updateHostRoot(workInProgress);
    }
    case HostComponent: {
      return updateHostComponent(workInProgress);
    }
  }
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

function workLoopSync() {
  console.log(['workLoopSync']);

  while (workInProgress !== null) {
    const work = performUnitOfWork(workInProgress);

    workInProgress = work;
  }
}

function render(element, container) {
  console.log(['render'], { element, container });
  workInProgressRoot = {
    tag: HostRoot,
    stateNode: container,
    props: {
      children: [element],
    },
    alternate: workInProgressRoot,
    sibling: null,
    return: null,
    child: null,
  };
  workInProgress = workInProgressRoot;
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

  if (fiber.effectTag === 'PLACEMENT' && fiber.stateNode != null) {
    domParent.appendChild(fiber.stateNode);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitRoot() {
  console.log(['commitRoot']);
  commitWork(workInProgressRoot.child);
}

function performSyncWorkOnRoot() {
  if (workInProgress !== null) {
    workLoopSync();

    workInProgressRoot.finishedWork = workInProgressRoot;
    commitRoot();
  }

  requestIdleCallback(performSyncWorkOnRoot);
}

requestIdleCallback(performSyncWorkOnRoot);

function useState(initialState) {
  return [initialState, (currentState) => currentState];
}

function createElement(type, config, children) {
  console.log(['createElement'], { type, config, children, arguments });

  let propName;
  const props = {};

  if (config != null) {
    for (propName in config) {
      props[propName] = config[propName];
    }
  }

  const childrenLength = arguments.length - 2;

  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    const childArray = Array(childrenLength);

    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }

    props.children = childArray;
  }

  return {
    type,
    props,
  };
}

export default {
  createElement,
  useState,
  render,
};
