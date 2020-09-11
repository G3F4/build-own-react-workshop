type Prop =
  | string
  | EventListenerOrEventListenerObject
  | Record<string, string>
  | ReactElement;

type Props = Record<string, Prop>;
const Placement = 2;
const Update = 4;
const Deletion = 8;

interface Fiber {
  tag:
    | typeof FunctionComponent
    | typeof HostRoot
    | typeof HostComponent
    | typeof IndeterminateComponent; // typ Fibera
  stateNode: HTMLElement | null; // element DOM, z którym jest związany Fiber
  type: Function | string; // typ elementu React, z którym jest związany Fiber
  pendingProps: Props; // propsy Elementu React, z którym jest związany Fiber
  return: Fiber | null; // powiązanie do Fibera, który jest rodzicem dla tego Fibera
  sibling: Fiber | null; // powiązanie do Fibera, który jest rodzeństwem dla tego Fibera
  child: Fiber | null; // powiązanie do Fibera, który jest bezpośrednim dzieckiem dla tego Fibera
  alternate: Fiber | null; // powiązanie do Fibera, który reprezentuje wyrenderowany Fiber
  effectTag: typeof Placement | typeof Update; // rodzaj pracy do wykonania na Fiberze
  memoizedState: any; // powiązana lista hooków
}

let currentHook = null;
let workInProgressHook = null;

interface ReactElement {
  type: Function | string;
  props: Props;
}

const FunctionComponent = 0;
const HostRoot = 3;
const HostComponent = 5;
const IndeterminateComponent = 2;
let finishedRootFiber = null;
let currentRootFiber = null;
let currentFiber = null;
let currentDispatcher = null;
let dispatcherOnMount = null;
let dispatcherOnUpdate = null;

function completeUnitOfWork(unitOfWork: Fiber): Fiber | null {
  console.log(['completeUnitOfWork'], unitOfWork);

  currentFiber = unitOfWork;

  do {
    if (currentFiber.tag === HostComponent && currentFiber.stateNode === null) {
      currentFiber.stateNode = document.createElement(currentFiber.type);
    }

    if (currentFiber.sibling !== null) {
      return currentFiber.sibling;
    }

    currentFiber = currentFiber.return;
  } while (currentFiber !== null);

  return null;
}

function updateProperties(fiber: Fiber): void {
  console.log(['updateProperties'], { fiber });

  const isEvent = (key) => key.startsWith('on');
  const isStyle = (key) => key === 'style';
  const isTextContent = (prop) =>
    typeof prop === 'string' || typeof prop === 'number';

  Object.entries(fiber.pendingProps).forEach(([name, prop]) => {
    if (isTextContent(prop)) {
      fiber.stateNode.textContent = prop as string;
    } else if (isEvent(name)) {
      const eventType = name.toLowerCase().substring(2);

      fiber.stateNode.addEventListener(
        eventType,
        fiber.pendingProps[name] as EventListenerOrEventListenerObject,
      );

      if (fiber.alternate) {
        fiber.stateNode.removeEventListener(
          eventType,
          fiber.alternate.pendingProps[
            name
          ] as EventListenerOrEventListenerObject,
        );
      }
    } else if (isStyle(name)) {
      Object.entries(prop).forEach(([cssProperty, value]) => {
        fiber.stateNode.style[cssProperty] = value;
      });
    }
  });
}

function commitWork(fiber: Fiber): void {
  console.log(['commitWork'], { fiber });

  if (fiber.stateNode != null) {
    let closestParentWithNode = fiber.return;

    while (!closestParentWithNode.stateNode) {
      closestParentWithNode = closestParentWithNode.return;
    }

    if (fiber.effectTag === Placement) {
      closestParentWithNode.stateNode.appendChild(fiber.stateNode);
    }

    updateProperties(fiber);
  }

  fiber.child && commitWork(fiber.child);
  fiber.sibling && commitWork(fiber.sibling);
}

function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  children: unknown,
): void {
  console.log(['reconcileChildren'], { fiber: workInProgress, children });

  if (Array.isArray(children) || typeof children === 'object') {
    let previousFiber = null;
    let alternate = current && current.child ? current && current.child : null;
    const elements: ReactElement[] = Array.isArray(children)
      ? children
      : [children];

    elements.forEach((element, index) => {
      const tag =
        typeof element.type === 'function'
          ? alternate
            ? alternate.tag
            : IndeterminateComponent
          : HostComponent;
      const sameType = alternate && element && element.type == alternate.type;
      const effectTag = sameType ? Update : element ? Placement : Deletion;
      const newFiber = createFiberSimple({
        tag,
        element,
        alternate,
        effectTag,
        parentFiber: workInProgress,
        stateNode:
          alternate && alternate.stateNode ? alternate.stateNode : null,
      });

      if (index === 0) {
        workInProgress.child = newFiber;
      } else {
        previousFiber.sibling = newFiber;
      }

      if (alternate) {
        alternate = alternate.sibling;
      }

      previousFiber = newFiber;
    });
  } else {
    workInProgress.child = null;
  }
}

function mountWorkInProgressHook() {
  console.log(['mountWorkInProgressHook']);

  const hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };

  if (workInProgressHook === null) {
    currentFiber.memoizedState = workInProgressHook = hook;
  } else {
    workInProgressHook = workInProgressHook.next = hook;
  }

  return workInProgressHook;
}

function updateWorkInProgressHook() {
  console.log(['updateWorkInProgressHook']);

  let nextCurrentHook;

  if (currentHook === null) {
    const current = currentFiber.alternate;

    if (current !== null) {
      nextCurrentHook = current.memoizedState;
    } else {
      nextCurrentHook = null;
    }
  } else {
    nextCurrentHook = currentHook.next;
  }

  let nextWorkInProgressHook;

  if (workInProgressHook === null) {
    nextWorkInProgressHook = currentFiber.memoizedState;
  } else {
    nextWorkInProgressHook = workInProgressHook.next;
  }

  if (nextWorkInProgressHook !== null) {
    workInProgressHook = nextWorkInProgressHook;
    currentHook = nextCurrentHook;
  } else {
    currentHook = nextCurrentHook;

    const newHook = {
      memoizedState: currentHook.memoizedState,
      baseState: currentHook.baseState,
      baseQueue: currentHook.baseQueue,
      queue: currentHook.queue,
      next: null,
    };

    if (workInProgressHook === null) {
      currentFiber.memoizedState = workInProgressHook = newHook;
    } else {
      workInProgressHook = workInProgressHook.next = newHook;
    }
  }

  return workInProgressHook;
}

function basicStateReducer(state, action) {
  console.log(['basicStateReducer'], { state, action });

  return typeof action === 'function' ? action(state) : action;
}

function updateReducer(reducer) {
  console.log(['updateReducer'], { reducer });

  const hook = updateWorkInProgressHook();
  const queue = hook.queue;
  const current = currentHook;
  const pendingQueue = queue.pending;
  let baseQueue = current.baseQueue;

  if (pendingQueue !== null) {
    current.baseQueue = baseQueue = pendingQueue;
    queue.pending = null;
  }

  if (baseQueue !== null) {
    const first = baseQueue.next;
    let newState = current.baseState;
    let update = first;

    do {
      newState = reducer(newState, update.action);

      update = update.next;
    } while (update !== null && update !== first);

    hook.memoizedState = newState;
    hook.baseState = newState;
  }

  const dispatch = queue.dispatch;

  return [hook.memoizedState, dispatch];
}

function updateState() {
  console.log(['updateState']);

  return updateReducer(basicStateReducer);
}

function scheduleWork(fiber) {
  console.log(['scheduleWork'], { fiber });

  currentRootFiber = createFiberSimple({
    tag: HostRoot,
    stateNode: finishedRootFiber.stateNode,
    element: {
      props: finishedRootFiber.pendingProps,
    },
    alternate: finishedRootFiber,
  });
  currentFiber = currentRootFiber;

  performSyncWorkOnRoot(currentRootFiber);
}

function dispatchAction(fiber: Fiber, queue, action) {
  console.log(['dispatchAction'], { fiber, queue, action });

  const update = {
    action: action,
    next: null,
  };
  const pending = queue.pending;

  if (pending === null) {
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }

  queue.pending = update;

  scheduleWork(fiber);
}

function mountState(initialState) {
  console.log(['mountState'], { initialState });

  const hook = mountWorkInProgressHook();

  if (typeof initialState === 'function') {
    initialState = initialState();
  }

  hook.memoizedState = hook.baseState = initialState;

  const queue = (hook.queue = {
    pending: null,
    dispatch: null,
  });
  const dispatch = (queue.dispatch = dispatchAction.bind(
    null,
    currentFiber,
    queue,
  ));

  return [hook.memoizedState, dispatch];
}

dispatcherOnMount = {
  useState: function (initialState) {
    console.log(['dispatcherOnMount.useState'], { initialState });

    return mountState(initialState);
  },
};
dispatcherOnUpdate = {
  useState: function (initialState) {
    console.log(['dispatcherOnUpdate.useState'], { initialState });

    return updateState();
  },
};

function renderWithHooks(current, workInProgress, Component, props) {
  console.log(['renderWithHooks'], {
    current,
    workInProgress,
    Component,
    props,
  });

  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;

  if (current !== null && current.memoizedState !== null) {
    currentDispatcher = dispatcherOnUpdate;
  } else {
    currentDispatcher = dispatcherOnMount;
  }

  const children = Component(props);

  workInProgress = null;
  currentHook = null;
  workInProgressHook = null;

  return children;
}

function updateFunctionComponent(
  current: Fiber,
  workInProgress: Fiber,
  Component: Function,
  nextProps: Props,
) {
  console.log(['updateFunctionComponent'], {
    current,
    workInProgress,
    Component,
    nextProps,
  });

  const nextChildren = renderWithHooks(
    current,
    workInProgress,
    Component,
    nextProps,
  );

  reconcileChildren(current, workInProgress, nextChildren);

  return workInProgress.child;
}

function mountIndeterminateComponent(current, workInProgress, Component) {
  console.log(['mountIndeterminateComponent'], {
    current,
    workInProgress,
    Component,
  });

  const children = renderWithHooks(
    null,
    workInProgress,
    Component,
    workInProgress.pendingProps,
  );

  workInProgress.tag = FunctionComponent;

  reconcileChildren(current, workInProgress, children);

  return workInProgress.child;
}

function beginWork(current: Fiber, unitOfWork: Fiber): Fiber | null {
  console.log(['beginWork'], { current, unitOfWork });

  switch (unitOfWork.tag) {
    case IndeterminateComponent: {
      return mountIndeterminateComponent(
        current,
        currentFiber,
        currentFiber.type,
      );
    }
    case FunctionComponent: {
      return updateFunctionComponent(
        current,
        currentFiber,
        unitOfWork.type as Function,
        unitOfWork.pendingProps,
      );
    }
    case HostRoot:
    case HostComponent: {
      reconcileChildren(current, unitOfWork, unitOfWork.pendingProps.children);

      return unitOfWork.child;
    }
    default: {
      throw Error('unknown fiber tag to begin work.');
    }
  }
}

function performUnitOfWork(unitOfWork) {
  console.log(['performUnitOfWork'], { unitOfWork });

  const current = unitOfWork.alternate;
  const next = beginWork(current, unitOfWork);

  if (next === null) {
    return completeUnitOfWork(unitOfWork);
  }

  return next;
}

function workLoopSync() {
  console.log(['workLoopSync']);

  while (currentFiber !== null) {
    currentFiber = performUnitOfWork(currentFiber);
  }
}

function finishSyncRender(root) {
  console.log(['finishSyncRender'], { root });

  commitWork(root.child);
  finishedRootFiber = currentRootFiber;
  currentRootFiber = null;
}

function performSyncWorkOnRoot(root: Fiber) {
  console.log(['performSyncWorkOnRoot'], root);

  if (currentFiber !== null) {
    workLoopSync();

    finishSyncRender(root);
  }

  return null;
}

requestIdleCallback(() => {
  performSyncWorkOnRoot(currentRootFiber);
});

function createFiberSimple({
  element,
  tag,
  parentFiber = null,
  stateNode = null,
  alternate = null,
  effectTag = null,
  memoizedState = null,
  pendingProps = {},
  child = null,
}): Fiber {
  console.log(['createFiberSimple'], { element, tag, parentFiber, stateNode });

  return {
    alternate,
    tag,
    stateNode,
    effectTag,
    memoizedState,
    child,
    type: element.type,
    pendingProps: element.props || pendingProps,
    return: parentFiber,
    sibling: null,
  };
}

function createElement(type, props, ...children): ReactElement {
  console.log(['createElement'], { type, props, children });

  return {
    type,
    props: {
      ...(props || {}),
      children: children.length === 1 ? children[0] : children,
    },
  };
}

function render(children: ReactElement, container: HTMLElement) {
  console.log(['render'], { children, container });

  currentRootFiber = createFiberSimple({
    tag: HostRoot,
    stateNode: container,
    element: {
      props: {
        children,
      },
    },
    alternate: finishedRootFiber,
  });
  currentFiber = currentRootFiber;
}

function useState(initialState) {
  return currentDispatcher.useState(initialState);
}

export default {
  useState,
  createElement,
  render,
};
