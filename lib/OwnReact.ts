type Prop =
  | string
  | EventListenerOrEventListenerObject
  | Record<string, string>
  | ReactElement;

type Props = Record<string, Prop>;
const Placement = 2;
const Update = 4;
const Deletion = 8;
type EffectTag = typeof Placement | typeof Update | typeof Deletion;
type Tag =
  | typeof FunctionComponent
  | typeof HostRoot
  | typeof HostComponent
  | typeof IndeterminateComponent;

interface Fiber {
  tag: Tag; // typ Fibera
  stateNode: HTMLElement | null; // element DOM, z którym jest związany Fiber
  type: Function | string; // typ elementu React, z którym jest związany Fiber
  pendingProps: Props; // propsy Elementu React, z którym jest związany Fiber
  return: Fiber | null; // powiązanie do Fibera, który jest rodzicem dla tego Fibera
  sibling: Fiber | null; // powiązanie do Fibera, który jest rodzeństwem dla tego Fibera
  child: Fiber | null; // powiązanie do Fibera, który jest bezpośrednim dzieckiem dla tego Fibera
  alternate: Fiber | null; // powiązanie do Fibera, który reprezentuje wyrenderowany Fiber
  effectTag: EffectTag; // rodzaj pracy do wykonania na Fiberze
  memoizedState: any; // powiązana lista hooków
}

interface Hook {
  memoizedState: unknown;
  baseState: unknown;
  baseQueue: HookQueue;
  queue: any;
  next: any;
}

interface HookQueue {
  next: HookUpdate;
  pending: any;
  dispatch: Function;
}

interface HookUpdate {
  action: Function;
  next: HookUpdate;
}

let currentHook: Hook | null = null;
let workInProgressHook: Hook | null = null;

interface ReactElement {
  type: Function | string;
  props: Props;
}

const FunctionComponent = 0;
const HostRoot = 3;
const HostComponent = 5;
const IndeterminateComponent = 2;
let finishedRootFiber: Fiber = null;
let currentRootFiber: Fiber = null;
let currentFiber: Fiber = null;
let currentDispatcher:
  | typeof dispatcherOnMount
  | typeof dispatcherOnUpdate
  | null = null;

import { SVG } from '@svgdotjs/svg.js';
const draw = SVG().addTo('#fiberView').size(800, 1000);
const renderButton: HTMLButtonElement = document.querySelector(
  '[value="RENDER"]',
);
const commitWorkButton: HTMLButtonElement = document.querySelector(
  '[value="COMMIT_WORK"]',
);
const workLoopButton: HTMLButtonElement = document.querySelector(
  '[value="WORK_LOOP"]',
);
const finishWorkButton: HTMLButtonElement = document.querySelector(
  '[value="FINISH_WORK"]',
);

workLoopButton.addEventListener('click', () => {
  workLoopSync();
});

function getFiberLabel(fiber: Fiber) {
  if (typeof fiber.type === 'string') {
    return fiber.type;
  }

  if (typeof fiber.type === 'function') {
    return fiber.type.name;
  }

  return 'div#root';
}

function getChildOrder(fiber: Fiber) {
  if (fiber === null || fiber.return === null) {
    return 0;
  }

  const parent = fiber.return;
  let child = parent.child;
  let order = 0;

  while (child !== fiber) {
    order++;
    child = child.sibling;
  }

  return order;
}

function traverseFiber(
  fiber: Fiber,
  path: { childDepth: number; siblingsDepth: number },
  callback: (
    fiber: Fiber,
    path: { childDepth: number; siblingsDepth: number },
  ) => void,
) {
  // console.log(['traverseFiber'], path);

  callback(fiber, path);

  if (fiber.child) {
    traverseFiber(
      fiber.child,
      { ...path, childDepth: path.childDepth + 1 },
      callback,
    );
  }

  if (fiber.sibling) {
    traverseFiber(
      fiber.sibling,
      {
        ...path,
        siblingsDepth: path.siblingsDepth + 1,
      },
      callback,
    );
  }
}

function drawFiber(
  fiber: Fiber,
  path: { childDepth: number; siblingsDepth: number },
) {
  const cx = 150 * path.siblingsDepth + 75;
  const cy = 100 * path.childDepth + 50;
  const fiberLabel = getFiberLabel(fiber);
  const drawingCurrent = fiber === currentFiber;

  if (drawingCurrent) {
    draw.rect(150, 100).attr({ fill: 'black' }).cx(cx).cy(cy);
  }

  draw.rect(140, 90).attr({ fill: '#f06' }).cx(cx).cy(cy);

  draw
    .text(fiberLabel)
    .move(cx - 60, cy - 30)
    .font({ fill: '#000', family: 'Inconsolata' });
}

function drawFiberLinks(
  fiber: Fiber,
  path: { childDepth: number; siblingsDepth: number },
) {
  const cx = 150 * path.siblingsDepth + 75;
  const cy = 100 * path.childDepth + 50;
  const childOrder = getChildOrder(fiber);

  if (fiber.return) {
    draw
      .line(cx + 20, cy - 40, cx + 20 - childOrder * 150, cy - 60)
      .stroke({ color: 'green', width: 8, linecap: 'round' });
  }

  if (fiber.child) {
    draw
      .line(cx, cy + 40, cx, cy + 60)
      .stroke({ color: 'yellow', width: 8, linecap: 'round' });
  }

  if (fiber.sibling) {
    draw
      .line(cx + 60, cy + 20, cx + 90, cy + 20)
      .stroke({ color: 'orange', width: 8, linecap: 'round' });
  }
}

function setCurrentFiber(fiber: Fiber) {
  // console.log(['setCurrentFiber'], fiber);
  currentFiber = fiber;
  draw.clear();

  traverseFiber(
    currentRootFiber || finishedRootFiber,
    { childDepth: 0, siblingsDepth: 0 },
    drawFiber,
  );
  traverseFiber(
    currentRootFiber || finishedRootFiber,
    { childDepth: 0, siblingsDepth: 0 },
    drawFiberLinks,
  );
}

const dispatcherOnMount = {
  useState: function <T>(initialState: T) {
    // console.log(['dispatcherOnMount.useState'], { initialState });

    return mountState(initialState);
  },
};
const dispatcherOnUpdate = {
  useState: function <T>(initialState: T) {
    // console.log(['dispatcherOnUpdate.useState'], { initialState });

    return updateState();
  },
};

function completeUnitOfWork(workInProgress: Fiber): Fiber | null {
  console.log(['completeUnitOfWork'], workInProgress);

  setCurrentFiber(workInProgress);

  do {
    if (currentFiber.tag === HostComponent && currentFiber.stateNode === null) {
      currentFiber.stateNode = document.createElement(
        currentFiber.type as string,
      );
    }

    if (currentFiber.sibling !== null) {
      return currentFiber.sibling;
    }

    setCurrentFiber(currentFiber.return);
  } while (currentFiber !== null);

  return null;
}

function updateProperties(fiber: Fiber): void {
  // console.log(['updateProperties'], { fiber });

  const isEvent = (key: string) => key.startsWith('on');
  const isStyle = (key: string) => key === 'style';
  const isTextContent = (prop: unknown) =>
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
        // @ts-ignore
        fiber.stateNode.style[cssProperty] = value;
      });
    }
  });
}

function commitWork(fiber: Fiber | null): void {
  console.log(['commitWork'], { fiber });

  if (fiber && fiber.stateNode != null) {
    let closestParentWithNode = fiber.return;

    while (!closestParentWithNode.stateNode) {
      closestParentWithNode = closestParentWithNode.return;
    }

    if (fiber.effectTag === Placement) {
      closestParentWithNode.stateNode.appendChild(fiber.stateNode);
    }

    updateProperties(fiber);
  }

  // if (fiber.child && fiber.sibling === null) {
  //   commitWorkButton.addEventListener(
  //     'click',
  //     () => {
  //       commitWork(fiber.child);
  //     },
  //     { once: true },
  //   );
  // }
  //
  // if (fiber.sibling) {
  //   commitWorkButton.addEventListener(
  //     'click',
  //     () => {
  //       commitWork(fiber.sibling);
  //     },
  //     { once: true },
  //   );
  // }

  // fiber.child && commitWork(fiber.child);
  // fiber.sibling && commitWork(fiber.sibling);

  let nextFiber: Fiber;

  if (fiber.child) {
    nextFiber = fiber.child;
  } else if (fiber.sibling) {
    nextFiber = fiber.sibling;
  } else if (fiber.child === null && fiber.sibling === null) {
    let fiberParentSibling = fiber.return;

    while (fiberParentSibling && fiberParentSibling.sibling === null) {
      fiberParentSibling = fiberParentSibling.return;
    }

    nextFiber = fiberParentSibling ? fiberParentSibling.sibling : null;
  }

  setCurrentFiber(nextFiber);

  if (nextFiber) {
    commitWorkButton.addEventListener(
      'click',
      () => {
        commitWork(nextFiber);
      },
      { once: true },
    );
  } else {
    setCurrentFiber(null);
    commitWorkButton.disabled = true;
  }
}

function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  children: unknown,
): void {
  // console.log(['reconcileChildren'], { fiber: workInProgress, children });

  if (Array.isArray(children) || typeof children === 'object') {
    let previousFiber: Fiber;
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
        child: undefined,
        memoizedState: undefined,
        pendingProps: undefined,
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
  // console.log(['mountWorkInProgressHook']);

  const hook: Hook = {
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
  // console.log(['updateWorkInProgressHook']);

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

    const newHook: Hook = {
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

function basicStateReducer(state: unknown, action: unknown) {
  // console.log(['basicStateReducer'], { state, action });

  return typeof action === 'function' ? action(state) : action;
}

function updateReducer(reducer: typeof basicStateReducer) {
  // console.log(['updateReducer'], { reducer });

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
  // console.log(['updateState']);

  return updateReducer(basicStateReducer);
}

function scheduleWork() {
  // console.log(['scheduleWork'], { fiber });

  currentRootFiber = createFiberSimple({
    tag: HostRoot,
    stateNode: finishedRootFiber.stateNode,
    element: {
      props: finishedRootFiber.pendingProps,
      type: undefined,
    },
    alternate: finishedRootFiber,
    effectTag: undefined,
    child: undefined,
    memoizedState: undefined,
    parentFiber: undefined,
    pendingProps: undefined,
  });

  setCurrentFiber(currentRootFiber);
  performSyncWorkOnRoot(currentRootFiber);
}

function dispatchAction(fiber: Fiber, queue: HookQueue, action: Function) {
  // console.log(['dispatchAction'], { fiber, queue, action });

  const update: HookUpdate = {
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

  scheduleWork();
}

function mountState(initialState: unknown) {
  // console.log(['mountState'], { initialState });

  const hook = mountWorkInProgressHook();

  if (typeof initialState === 'function') {
    initialState = initialState();
  }

  hook.memoizedState = hook.baseState = initialState;

  const queue = (hook.queue = {
    pending: null,
    dispatch: null,
  } as any);
  const dispatch = (queue.dispatch = dispatchAction.bind(
    null,
    currentFiber,
    queue,
  ));

  return [hook.memoizedState, dispatch];
}

function renderWithHooks(
  current: Fiber,
  workInProgress: Fiber,
  Component: Function,
  props: Props,
) {
  // console.log(['renderWithHooks'], {
  //   current,
  //   workInProgress,
  //   Component,
  //   props,
  // });

  workInProgress.memoizedState = null;

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
  // console.log(['updateFunctionComponent'], {
  //   current,
  //   workInProgress,
  //   Component,
  //   nextProps,
  // });

  const nextChildren = renderWithHooks(
    current,
    workInProgress,
    Component,
    nextProps,
  );

  reconcileChildren(current, workInProgress, nextChildren);

  return workInProgress.child;
}

function mountIndeterminateComponent(
  current: Fiber,
  workInProgress: Fiber,
  Component: Function,
) {
  // console.log(['mountIndeterminateComponent'], {
  //   current,
  //   workInProgress,
  //   Component,
  // });

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
        currentFiber.type as Function,
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

function performUnitOfWork(workInProgress: Fiber) {
  console.log('#'.repeat(120));
  console.log(['performUnitOfWork'], getFiberLabel(workInProgress));

  const current = workInProgress.alternate;
  const next = beginWork(current, workInProgress);

  if (next === null) {
    return completeUnitOfWork(workInProgress);
  }

  return next;
}

function workLoopSync() {
  console.log(['workLoopSync']);

  if (currentFiber !== null) {
    const nextWork = performUnitOfWork(currentFiber);

    setCurrentFiber(nextWork);

    if (nextWork === null) {
      workLoopButton.disabled = true;
    }
  }
}

// function finishSyncRender() {
//   console.log(['finishSyncRender']);
//
//   commitWork(currentRootFiber.child);
//   finishedRootFiber = currentRootFiber;
//   currentRootFiber = null;
// }

finishWorkButton.addEventListener('click', () => {
  setCurrentFiber(currentRootFiber.child);
  commitWorkButton.addEventListener(
    'click',
    () => {
      commitWork(finishedRootFiber.child);
    },
    { once: true },
  );
  finishedRootFiber = currentRootFiber;
  currentRootFiber = null;
  finishWorkButton.disabled = true;
});

function performSyncWorkOnRoot(root: Fiber): null {
  console.log(['performSyncWorkOnRoot'], root);

  if (currentFiber !== null) {
    workLoopSync();

    finishSyncRender();
  }

  return null;
}

// requestIdleCallback(() => {
//   console.log(['requestIdleCallback']);
//   performSyncWorkOnRoot(currentRootFiber);
// });

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
}: {
  element: ReactElement | null;
  tag: Tag;
  parentFiber: Fiber;
  stateNode: HTMLElement | null;
  alternate: Fiber | null;
  effectTag: EffectTag;
  memoizedState: unknown;
  pendingProps: Props;
  child: Fiber | null;
}): Fiber {
  // console.log(['createFiberSimple'], { element, tag, parentFiber, stateNode });

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

function createElement(
  type: string | Function,
  props: Props,
  ...children: any[]
): ReactElement {
  // console.log(['createElement'], { type, props, children });

  return {
    type,
    props: {
      ...(props || {}),
      children: children.length === 1 ? children[0] : children,
    },
  };
}

function render(children: ReactElement, container: HTMLElement) {
  // console.log(['render'], { children, container });

  renderButton.addEventListener(
    'click',
    () => {
      currentRootFiber = createFiberSimple({
        child: undefined,
        effectTag: undefined,
        memoizedState: undefined,
        parentFiber: undefined,
        pendingProps: undefined,
        tag: HostRoot,
        stateNode: container,
        element: {
          type: undefined,
          props: {
            children,
          },
        },
        alternate: finishedRootFiber,
      });
      setCurrentFiber(currentRootFiber);
      renderButton.disabled = true;
    },
    { once: true },
  );
}

function useState<T>(initialState: T) {
  return currentDispatcher.useState(initialState);
}

export default {
  useState,
  createElement,
  render,
};
