const NO_CONTEXT = {};
const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
const MATH_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const COMMENT_NODE = 8;
const DOCUMENT_NODE = 9;
const DOCUMENT_FRAGMENT_NODE = 11;
const UpdateState = 0;
const ReplaceState = 1;
const ForceUpdate = 2;
const CaptureUpdate = 3;
const NoEffect = 0;
const PerformedWork = 1;
const Placement = 2;
const Update = 4;
const PlacementAndUpdate = 6;
const Deletion = 8;
const ContentReset = 16;
const Callback = 32;
const DidCapture = 64;
const Ref = 128;
const Incomplete = 2048;
const ShouldCapture = 4096;
const FunctionComponent = 0;
const IndeterminateComponent = 2;
const HostRoot = 3;
const HostComponent = 5;
const HostText = 6;
let currentlyRenderingFiber$1 = null;
const Namespaces = {
  html: HTML_NAMESPACE,
  mathml: MATH_NAMESPACE,
  svg: SVG_NAMESPACE,
};
const HTML_NAMESPACE$1 = Namespaces.html;
const ReactCurrentOwner = {
  current: null,
};
const ReactCurrentDispatcher = {
  current: null,
};
let currentHook = null;
let workInProgressHook = null;
let HooksDispatcherOnMountInDEV = null;
let HooksDispatcherOnUpdateInDEV = null;
const InvalidNestedHooksDispatcherOnMountInDEV = null;
const InvalidNestedHooksDispatcherOnUpdateInDEV = null;
let currentHookNameInDev = null;

function useState(initialState) {
  console.log(['useState'], { initialState });

  return ReactCurrentDispatcher.current.useState(initialState);
}

const REACT_ELEMENT_TYPE = Symbol.for('react.element');
const ReactElement = function (type, props) {
  console.log(['ReactElement'], { type, props });

  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type: type,
    props: props,
  };
};

function createElement(type, config, children) {
  console.log(['createElement'], { type, config, children });

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
  } // Resolve default props

  return ReactElement(type, props);
}

function FiberNode(tag, pendingProps, key) {
  console.log(['FiberNode'], { tag, pendingProps, key });
  this.tag = tag;
  this.key = key;
  this.elementType = null;
  this.type = null;
  this.stateNode = null; // Fiber

  this.return = null;
  this.child = null;
  this.sibling = null;
  this.index = 0;
  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;

  this.effectTag = NoEffect;
  this.nextEffect = null;
  this.firstEffect = null;
  this.lastEffect = null;
  this.alternate = null;
}

const createFiber = function (tag, pendingProps, key) {
  console.log(['createFiber'], { tag, pendingProps, key });

  return new FiberNode(tag, pendingProps, key);
};
const LegacyRoot = 0;

function FiberRootNode(containerInfo) {
  console.log(['FiberRootNode'], { containerInfo });
  this.tag = LegacyRoot;
  this.current = null;
  this.containerInfo = containerInfo;
  this.finishedWork = null;
}

function createHostRootFiber() {
  console.log(['createHostRootFiber']);

  return createFiber(HostRoot, null, null);
}

function initializeUpdateQueue(fiber) {
  console.log(['initializeUpdateQueue'], { fiber });
  fiber.updateQueue = {
    baseState: fiber.memoizedState,
    baseQueue: null,
    shared: {
      pending: null,
    },
    effects: null,
  };
}

function createFiberRoot(containerInfo) {
  console.log(['createFiberRoot'], { containerInfo });

  const root = new FiberRootNode(containerInfo);
  const uninitializedFiber = createHostRootFiber();

  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;
  initializeUpdateQueue(uninitializedFiber);

  return root;
}

function createUpdate() {
  console.log(['createUpdate']);

  const update = {
    tag: UpdateState,
    payload: null,
    callback: null,
    next: null,
  };

  update.next = update;

  return update;
}

function enqueueUpdate(fiber, update) {
  console.log(['enqueueUpdate'], { fiber, update });

  const updateQueue = fiber.updateQueue;

  if (updateQueue === null) {
    // Only occurs if the fiber has been unmounted.
    return;
  }

  const sharedQueue = updateQueue.shared;
  const pending = sharedQueue.pending;

  if (pending === null) {
    // This is the first update. Create a circular list.
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }

  sharedQueue.pending = update;
}

function markUpdateTimeFromFiberToRoot(fiber) {
  console.log(['markUpdateTimeFromFiberToRoot'], { fiber });

  let alternate = fiber.alternate;
  let node = fiber.return;
  let root = null;

  if (node === null && fiber.tag === HostRoot) {
    root = fiber.stateNode;
  } else {
    while (node !== null) {
      alternate = node.alternate;

      if (node.return === null && node.tag === HostRoot) {
        root = node.stateNode;

        break;
      }

      node = node.return;
    }
  }

  return root;
}

let syncQueue = null;

function scheduleSyncCallback(callback) {
  console.log(['scheduleSyncCallback'], { callback });

  if (syncQueue === null) {
    syncQueue = [callback];
  } else {
    syncQueue.push(callback);
  }
}

let workInProgressRoot = null; // The root we're working on
let workInProgress = null; // The fiber we're working on

function createWorkInProgress(current, pendingProps) {
  console.log(['createWorkInProgress'], { current, pendingProps });

  let workInProgress = current.alternate;

  if (workInProgress === null) {
    workInProgress = createFiber(current.tag, pendingProps, current.key);
    workInProgress.elementType = current.elementType;
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    workInProgress.pendingProps = pendingProps;
    workInProgress.effectTag = NoEffect;
    workInProgress.nextEffect = null;
    workInProgress.firstEffect = null;
    workInProgress.lastEffect = null;
  }

  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;
  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;

  return workInProgress;
}

function prepareFreshStack(root) {
  console.log(['prepareFreshStack'], { root });
  root.finishedWork = null;

  workInProgressRoot = root;
  workInProgress = createWorkInProgress(root.current, null);
}

const valueStack = [];
const fiberStack = [];
let index = -1;

function pop(cursor) {
  console.log(['pop'], { cursor });
  cursor.current = valueStack[index];
  valueStack[index] = null;

  {
    fiberStack[index] = null;
  }

  index--;
}

function push(cursor, value, fiber) {
  console.log(['push'], { cursor, value, fiber });
  index++;
  valueStack[index] = cursor.current;

  {
    fiberStack[index] = fiber;
  }

  cursor.current = value;
}

function getIntrinsicNamespace(type) {
  console.log(['getIntrinsicNamespace'], { type });

  switch (type) {
    case 'svg':
      return SVG_NAMESPACE;
    case 'math':
      return MATH_NAMESPACE;
    default:
      return HTML_NAMESPACE;
  }
}

const contextStackCursor$1 = createCursor(NO_CONTEXT);

function getChildNamespace(parentNamespace, type) {
  console.log(['getChildNamespace'], { parentNamespace, type });

  if (parentNamespace == null || parentNamespace === HTML_NAMESPACE) {
    return getIntrinsicNamespace(type);
  }

  if (parentNamespace === SVG_NAMESPACE && type === 'foreignObject') {
    return HTML_NAMESPACE;
  }

  return parentNamespace;
}

function getRootHostContext(rootContainerInstance) {
  console.log(['getRootHostContext'], { rootContainerInstance });

  let type;
  let namespace;
  const nodeType = rootContainerInstance.nodeType;

  switch (nodeType) {
    case DOCUMENT_NODE:
    case DOCUMENT_FRAGMENT_NODE: {
      type = nodeType === DOCUMENT_NODE ? '#document' : '#fragment';

      const root = rootContainerInstance.documentElement;

      namespace = root ? root.namespaceURI : getChildNamespace(null, '');

      break;
    }
    default: {
      const container =
        nodeType === COMMENT_NODE
          ? rootContainerInstance.parentNode
          : rootContainerInstance;
      const ownNamespace = container.namespaceURI || null;

      type = container.tagName;
      namespace = getChildNamespace(ownNamespace, type);

      break;
    }
  }

  return {
    namespace: namespace,
    ancestorInfo: '',
  };
}

function pushHostContainer(fiber, nextRootInstance) {
  console.log(['pushHostContainer'], { fiber, nextRootInstance });
  push(rootInstanceStackCursor, nextRootInstance, fiber);

  const nextRootContext = getRootHostContext(nextRootInstance);

  pop(contextStackCursor$1, fiber);
  push(contextStackCursor$1, nextRootContext, fiber);
}

function cloneUpdateQueue(current, workInProgress) {
  console.log(['getStateFromUpdate'], { current, workInProgress });

  const queue = workInProgress.updateQueue;
  const currentQueue = current.updateQueue;

  if (queue === currentQueue) {
    const clone = {
      baseState: currentQueue.baseState,
      baseQueue: currentQueue.baseQueue,
      shared: currentQueue.shared,
      effects: currentQueue.effects,
    };

    workInProgress.updateQueue = clone;
  }
}

let hasForceUpdate = false;

function getStateFromUpdate(
  workInProgress,
  queue,
  update,
  prevState,
  nextProps,
  instance,
) {
  console.log(['getStateFromUpdate'], {
    workInProgress,
    queue,
    update,
    prevState,
    nextProps,
    instance,
  });

  switch (update.tag) {
    case ReplaceState: {
      const payload = update.payload;

      if (typeof payload === 'function') {
        {
          if (workInProgress.mode) {
            payload.call(instance, prevState, nextProps);
          }
        }

        const nextState = payload.call(instance, prevState, nextProps);

        return nextState;
      }

      return payload;
    }
    case CaptureUpdate: {
      workInProgress.effectTag =
        (workInProgress.effectTag & ~ShouldCapture) | DidCapture;
    }
    case UpdateState: {
      const _payload = update.payload;
      let partialState;

      if (typeof _payload === 'function') {
        {
          if (workInProgress.mode) {
            _payload.call(instance, prevState, nextProps);
          }
        }

        partialState = _payload.call(instance, prevState, nextProps);
      } else {
        partialState = _payload;
      }

      if (partialState === null || partialState === undefined) {
        return prevState;
      }

      return Object.assign({}, prevState, partialState);
    }
    case ForceUpdate: {
      hasForceUpdate = true;

      return prevState;
    }
  }

  return prevState;
}

let currentlyProcessingQueue;

function processUpdateQueue(workInProgress, props, instance) {
  console.log(['processUpdateQueue'], { workInProgress, props, instance });

  const queue = workInProgress.updateQueue;

  hasForceUpdate = false;

  let baseQueue = queue.baseQueue;
  let pendingQueue = queue.shared.pending;

  if (pendingQueue !== null) {
    if (baseQueue !== null) {
      const baseFirst = baseQueue.next;
      const pendingFirst = pendingQueue.next;

      baseQueue.next = pendingFirst;
      pendingQueue.next = baseFirst;
    }

    baseQueue = pendingQueue;
    queue.shared.pending = null;

    const current = workInProgress.alternate;

    if (current !== null) {
      const currentQueue = current.updateQueue;

      if (currentQueue !== null) {
        currentQueue.baseQueue = pendingQueue;
      }
    }
  }

  if (baseQueue !== null) {
    const first = baseQueue.next;
    let newState = queue.baseState;
    let newBaseState = null;
    let newBaseQueueFirst = null;
    let newBaseQueueLast = null;

    if (first !== null) {
      let update = first;

      do {
        const updateExpirationTime = update.expirationTime;

        if (updateExpirationTime < 123123123) {
          const clone = {
            expirationTime: update.expirationTime,
            suspenseConfig: update.suspenseConfig,
            tag: update.tag,
            payload: update.payload,
            callback: update.callback,
            next: null,
          };

          if (newBaseQueueLast === null) {
            newBaseQueueFirst = newBaseQueueLast = clone;
            newBaseState = newState;
          } else {
            newBaseQueueLast = newBaseQueueLast.next = clone;
          }
        } else {
          if (newBaseQueueLast !== null) {
            const _clone = {
              tag: update.tag,
              payload: update.payload,
              callback: update.callback,
              next: null,
            };

            newBaseQueueLast = newBaseQueueLast.next = _clone;
          }

          newState = getStateFromUpdate(
            workInProgress,
            queue,
            update,
            newState,
            props,
            instance,
          );

          const callback = update.callback;

          if (callback !== null) {
            workInProgress.effectTag |= Callback;

            const effects = queue.effects;

            if (effects === null) {
              queue.effects = [update];
            } else {
              effects.push(update);
            }
          }
        }

        update = update.next;

        if (update === null || update === first) {
          pendingQueue = queue.shared.pending;

          if (pendingQueue === null) {
            break;
          } else {
            update = baseQueue.next = pendingQueue.next;
            pendingQueue.next = first;
            queue.baseQueue = baseQueue = pendingQueue;
            queue.shared.pending = null;
          }
        }
      } while (true);
    }

    if (newBaseQueueLast === null) {
      newBaseState = newState;
    } else {
      newBaseQueueLast.next = newBaseQueueFirst;
    }

    queue.baseState = newBaseState;
    queue.baseQueue = newBaseQueueLast;
    workInProgress.memoizedState = newState;
  }

  {
    currentlyProcessingQueue = null;
  }
}

const reconcileChildFibers = ChildReconciler(true);
const mountChildFibers = ChildReconciler(false);

function reconcileChildren(current, workInProgress, nextChildren) {
  console.log(['reconcileChildren'], {
    current,
    workInProgress,
    nextChildren,
  });

  if (current === null) {
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
  } else {
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
    );
  }
}

function updateHostRoot(current, workInProgress) {
  console.log(['updateHostRoot'], {
    current,
    workInProgress,
  });
  pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);

  const nextProps = workInProgress.pendingProps;

  cloneUpdateQueue(current, workInProgress);
  processUpdateQueue(workInProgress, nextProps, null);

  const nextState = workInProgress.memoizedState;
  const nextChildren = nextState.element;

  reconcileChildren(current, workInProgress, nextChildren);

  return workInProgress.child;
}

let isRendering = false;

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
    currentlyRenderingFiber$1.memoizedState = workInProgressHook = hook;
  } else {
    workInProgressHook = workInProgressHook.next = hook;
  }

  return workInProgressHook;
}

function dispatchAction(fiber, queue, action) {
  console.log(['dispatchAction'], { fiber, queue, action });

  const update = {
    action: action,
    eagerReducer: null,
    eagerState: null,
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

  const lastRenderedReducer = queue.lastRenderedReducer;

  if (lastRenderedReducer !== null) {
    let prevDispatcher;

    {
      prevDispatcher = ReactCurrentDispatcher.current;
      ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
    }

    ReactCurrentDispatcher.current = prevDispatcher;
  }

  scheduleWork(fiber);
}

function mountState(initialState) {
  console.log(['mountState.useState'], { initialState });

  const hook = mountWorkInProgressHook();

  if (typeof initialState === 'function') {
    initialState = initialState();
  }

  hook.memoizedState = hook.baseState = initialState;

  const queue = (hook.queue = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState,
  });
  const dispatch = (queue.dispatch = dispatchAction.bind(
    null,
    currentlyRenderingFiber$1,
    queue,
  ));

  return [hook.memoizedState, dispatch];
}

{
  HooksDispatcherOnMountInDEV = {
    useState: function (initialState) {
      console.log(['HooksDispatcherOnMountInDEV.useState'], { initialState });
      currentHookNameInDev = 'useState';

      const prevDispatcher = ReactCurrentDispatcher.current;

      ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnMountInDEV;

      try {
        return mountState(initialState);
      } finally {
        ReactCurrentDispatcher.current = prevDispatcher;
      }
    },
  };
  HooksDispatcherOnUpdateInDEV = {
    useState: function (initialState) {
      console.log(['HooksDispatcherOnUpdateInDEV.useState'], { initialState });
      currentHookNameInDev = 'useState';

      const prevDispatcher = ReactCurrentDispatcher.current;

      ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnUpdateInDEV;

      try {
        return updateState(initialState);
      } finally {
        ReactCurrentDispatcher.current = prevDispatcher;
      }
    },
  };
}

function updateWorkInProgressHook() {
  console.log(['updateWorkInProgressHook']);

  let nextCurrentHook;

  if (currentHook === null) {
    const current = currentlyRenderingFiber$1.alternate;

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
    nextWorkInProgressHook = currentlyRenderingFiber$1.memoizedState;
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
      currentlyRenderingFiber$1.memoizedState = workInProgressHook = newHook;
    } else {
      workInProgressHook = workInProgressHook.next = newHook;
    }
  }

  return workInProgressHook;
}

function updateReducer(reducer) {
  console.log(['updateReducer'], { reducer });

  const hook = updateWorkInProgressHook();
  const queue = hook.queue;

  queue.lastRenderedReducer = reducer;

  const current = currentHook;
  let baseQueue = current.baseQueue;
  const pendingQueue = queue.pending;

  if (pendingQueue !== null) {
    current.baseQueue = baseQueue = pendingQueue;
    queue.pending = null;
  }

  if (baseQueue !== null) {
    // We have a queue to process.
    const first = baseQueue.next;
    let newState = current.baseState;
    let update = first;

    do {
      newState = reducer(newState, update.action);

      update = update.next;
    } while (update !== null && update !== first);

    hook.memoizedState = newState;
    hook.baseState = newState;
    queue.lastRenderedState = newState;
  }

  const dispatch = queue.dispatch;

  return [hook.memoizedState, dispatch];
}

function updateState() {
  return updateReducer(basicStateReducer);
}

function basicStateReducer(state, action) {
  return typeof action === 'function' ? action(state) : action;
}

const ContextOnlyDispatcher = {
  useState: null,
};

function renderWithHooks(current, workInProgress, Component, props, secondArg) {
  console.log(['renderWithHooks'], {
    current,
    workInProgress,
    Component,
    props,
    secondArg,
  });
  currentlyRenderingFiber$1 = workInProgress;

  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;

  {
    if (current !== null && current.memoizedState !== null) {
      ReactCurrentDispatcher.current = HooksDispatcherOnUpdateInDEV;
    } else {
      ReactCurrentDispatcher.current = HooksDispatcherOnMountInDEV;
    }
  }

  const children = Component(props, secondArg);

  ReactCurrentDispatcher.current = ContextOnlyDispatcher;

  currentlyRenderingFiber$1 = null;
  currentHook = null;
  workInProgressHook = null;

  {
    currentHookNameInDev = null;
  }

  return children;
}

function mountIndeterminateComponent(_current, workInProgress, Component) {
  console.log(['mountIndeterminateComponent'], {
    _current,
    workInProgress,
    Component,
  });

  const props = workInProgress.pendingProps;
  let value;

  {
    ReactCurrentOwner.current = workInProgress;
    value = renderWithHooks(null, workInProgress, Component, props, {});
  }

  workInProgress.tag = FunctionComponent;

  reconcileChildren(null, workInProgress, value);

  return workInProgress.child;
}

function updateHostComponent(current, workInProgress) {
  console.log(['updateHostComponent'], { current, workInProgress });
  reconcileChildren(
    current,
    workInProgress,
    workInProgress.pendingProps.children,
  );

  return workInProgress.child;
}

function resolveDefaultProps(Component, baseProps) {
  console.log(['resolveDefaultProps'], { Component, baseProps });

  if (Component && Component.defaultProps) {
    const props = Object.assign({}, baseProps);
    const defaultProps = Component.defaultProps;

    for (const propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }

    return props;
  }

  return baseProps;
}

function updateFunctionComponent(
  current,
  workInProgress,
  Component,
  nextProps,
) {
  console.log(['updateFunctionComponent'], {
    current,
    workInProgress,
    Component,
    nextProps,
  });

  let nextChildren;

  {
    ReactCurrentOwner.current = workInProgress;
    nextChildren = renderWithHooks(
      current,
      workInProgress,
      Component,
      nextProps,
      null,
    );
  }

  workInProgress.effectTag |= PerformedWork;
  reconcileChildren(current, workInProgress, nextChildren);

  return workInProgress.child;
}

function beginWork(current, workInProgress) {
  console.log(['beginWork'], { current, workInProgress });

  switch (workInProgress.tag) {
    case IndeterminateComponent: {
      console.log(['beginWork.IndeterminateComponent']);

      return mountIndeterminateComponent(
        current,
        workInProgress,
        workInProgress.type,
      );
    }
    case FunctionComponent: {
      console.log(['beginWork.FunctionComponent']);

      const _Component = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      const resolvedProps =
        workInProgress.elementType === _Component
          ? unresolvedProps
          : resolveDefaultProps(_Component, unresolvedProps);

      return updateFunctionComponent(
        current,
        workInProgress,
        _Component,
        resolvedProps,
      );
    }
    case HostRoot: {
      console.log(['beginWork.HostRoot']);

      return updateHostRoot(current, workInProgress);
    }
    case HostComponent: {
      console.log(['beginWork.HostComponent']);

      return updateHostComponent(current, workInProgress);
    }
  }
}

const randomKey = Math.random().toString(36).slice(2);
const internalInstanceKey = '__reactInternalInstance$' + randomKey;
const internalEventHandlersKey = '__reactEventHandlers$' + randomKey;

function precacheFiberNode(hostInst, node) {
  console.log(['precacheFiberNode'], { hostInst, node });
  node[internalInstanceKey] = hostInst;
}

function updateFiberProps(node, props) {
  console.log(['updateFiberProps'], { node, props });
  node[internalEventHandlersKey] = props;
}

function getOwnerDocumentFromRootContainer(rootContainerElement) {
  console.log(['getOwnerDocumentFromRootContainer'], { rootContainerElement });

  return rootContainerElement.nodeType === DOCUMENT_NODE
    ? rootContainerElement
    : rootContainerElement.ownerDocument;
}

function createInstance(
  type,
  props,
  rootContainerInstance,
  hostContext,
  internalInstanceHandle,
) {
  console.log(['createInstance'], {
    type,
    props,
    rootContainerInstance,
    hostContext,
    internalInstanceHandle,
  });

  function createElement(type, props, rootContainerElement, parentNamespace) {
    const ownerDocument = getOwnerDocumentFromRootContainer(
      rootContainerElement,
    );
    let domElement;
    let namespaceURI = parentNamespace;

    if (namespaceURI === HTML_NAMESPACE$1) {
      namespaceURI = getIntrinsicNamespace(type);
    }

    if (namespaceURI === HTML_NAMESPACE$1) {
      if (typeof props.is === 'string') {
        domElement = ownerDocument.createElement(type, {
          is: props.is,
        });
      } else {
        domElement = ownerDocument.createElement(type);

        if (type === 'select') {
          const node = domElement;

          if (props.multiple) {
            node.multiple = true;
          } else if (props.size) {
            node.size = props.size;
          }
        }
      }
    } else {
      domElement = ownerDocument.createElementNS(namespaceURI, type);
    }

    return domElement;
  }

  let parentNamespace;

  {
    const hostContextDev = hostContext;

    parentNamespace = hostContextDev.namespace;
  }

  const domElement = createElement(
    type,
    props,
    rootContainerInstance,
    parentNamespace,
  );

  precacheFiberNode(internalInstanceHandle, domElement);
  updateFiberProps(domElement, props);

  return domElement;
}

function createCursor(defaultValue) {
  console.log(['createCursor'], { defaultValue });

  return {
    current: defaultValue,
  };
}

const rootInstanceStackCursor = createCursor(NO_CONTEXT);

function appendInitialChild(parentInstance, child) {
  console.log(['appendInitialChild'], { parentInstance, child });
  parentInstance.appendChild(child);
}

function getRootHostContainer() {
  console.log(['getRootHostContainer']);

  return rootInstanceStackCursor.current;
}

function diffProperties(
  domElement,
  tag,
  lastRawProps,
  nextRawProps,
  rootContainerElement,
) {
  console.log(['diffProperties'], {
    domElement,
    tag,
    lastRawProps,
    nextRawProps,
    rootContainerElement,
  });

  let updatePayload = null;
  let lastProps;
  let nextProps;

  switch (tag) {
    default:
      lastProps = lastRawProps;
      nextProps = nextRawProps;

      break;
  }

  let propKey;
  let styleName;
  let styleUpdates = null;

  for (propKey in lastProps) {
    if (
      nextProps.hasOwnProperty(propKey) ||
      !lastProps.hasOwnProperty(propKey) ||
      lastProps[propKey] == null
    ) {
      continue;
    }

    if (propKey === STYLE) {
      const lastStyle = lastProps[propKey];

      for (styleName in lastStyle) {
        if (lastStyle.hasOwnProperty(styleName)) {
          if (!styleUpdates) {
            styleUpdates = {};
          }

          styleUpdates[styleName] = '';
        }
      }
    } else if (propKey === AUTOFOCUS);
    else {
      (updatePayload = updatePayload || []).push(propKey, null);
    }
  }

  for (propKey in nextProps) {
    const nextProp = nextProps[propKey];
    const lastProp = lastProps != null ? lastProps[propKey] : undefined;

    if (
      !nextProps.hasOwnProperty(propKey) ||
      nextProp === lastProp ||
      (nextProp == null && lastProp == null)
    ) {
      continue;
    }

    if (propKey === STYLE) {
      {
        if (nextProp) {
          Object.freeze(nextProp);
        }
      }

      if (lastProp) {
        for (styleName in lastProp) {
          if (
            lastProp.hasOwnProperty(styleName) &&
            (!nextProp || !nextProp.hasOwnProperty(styleName))
          ) {
            if (!styleUpdates) {
              styleUpdates = {};
            }

            styleUpdates[styleName] = '';
          }
        }

        for (styleName in nextProp) {
          if (
            nextProp.hasOwnProperty(styleName) &&
            lastProp[styleName] !== nextProp[styleName]
          ) {
            if (!styleUpdates) {
              styleUpdates = {};
            }

            styleUpdates[styleName] = nextProp[styleName];
          }
        }
      } else {
        if (!styleUpdates) {
          if (!updatePayload) {
            updatePayload = [];
          }

          updatePayload.push(propKey, styleUpdates);
        }

        styleUpdates = nextProp;
      }
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
      const nextHtml = nextProp ? nextProp[HTML$1] : undefined;
      const lastHtml = lastProp ? lastProp[HTML$1] : undefined;

      if (nextHtml != null) {
        if (lastHtml !== nextHtml) {
          (updatePayload = updatePayload || []).push(propKey, nextHtml);
        }
      }
    } else if (propKey === CHILDREN) {
      if (
        lastProp !== nextProp &&
        (typeof nextProp === 'string' || typeof nextProp === 'number')
      ) {
        (updatePayload = updatePayload || []).push(propKey, '' + nextProp);
      }
    } else if (registrationNameModules.hasOwnProperty(propKey)) {
      if (nextProp != null) {
        ensureListeningTo(rootContainerElement, propKey);
      }

      if (!updatePayload && lastProp !== nextProp) {
        updatePayload = [];
      }
    } else {
      (updatePayload = updatePayload || []).push(propKey, nextProp);
    }
  }

  if (styleUpdates) {
    (updatePayload = updatePayload || []).push(STYLE, styleUpdates);
  }

  return updatePayload;
}

function prepareUpdate(
  domElement,
  type,
  oldProps,
  newProps,
  rootContainerInstance,
) {
  console.log(['prepareUpdate'], {
    domElement,
    type,
    oldProps,
    newProps,
    rootContainerInstance,
  });

  return diffProperties(
    domElement,
    type,
    oldProps,
    newProps,
    rootContainerInstance,
  );
}

let appendAllChildren;
let updateHostComponent$1;

{
  appendAllChildren = function (parent, workInProgress) {
    console.log(['appendAllChildren'], { parent, workInProgress });

    let node = workInProgress.child;

    while (node !== null) {
      if (node.tag === HostComponent || node.tag === HostText) {
        appendInitialChild(parent, node.stateNode);
      } else if (node.child !== null) {
        node.child.return = node;
        node = node.child;

        continue;
      }

      if (node === workInProgress) {
        return;
      }

      while (node.sibling === null) {
        if (node.return === null || node.return === workInProgress) {
          return;
        }

        node = node.return;
      }

      node.sibling.return = node.return;
      node = node.sibling;
    }
  };

  updateHostComponent$1 = function (
    current,
    workInProgress,
    type,
    newProps,
    rootContainerInstance,
  ) {
    console.log(['updateHostComponent$1'], {
      current,
      workInProgress,
      type,
      newProps,
      rootContainerInstance,
    });

    const oldProps = current.memoizedProps;

    if (oldProps === newProps) {
      return;
    }

    const instance = workInProgress.stateNode;
    const updatePayload = prepareUpdate(
      instance,
      type,
      oldProps,
      newProps,
      rootContainerInstance,
    );

    workInProgress.updateQueue = updatePayload;

    if (updatePayload) {
      markUpdate(workInProgress);
    }
  };
}

function isCustomComponent(tagName, props) {
  console.log(['isCustomComponent'], { tagName, props });

  if (tagName.indexOf('-') === -1) {
    return typeof props.is === 'string';
  }

  return true;
}

const PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map; // prettier-ignore
const elementListenerMap = new PossiblyWeakMap();

function publishRegistrationName(registrationName, pluginModule, eventName) {
  console.log(['publishRegistrationName']);
  registrationNameModules[registrationName] = pluginModule;
  registrationNameDependencies[registrationName] =
    pluginModule.eventTypes[eventName].dependencies;
}

function getListenerMapForElement(element) {
  console.log(['getListenerMapForElement'], { element });

  let listenerMap = elementListenerMap.get(element);

  if (listenerMap === undefined) {
    listenerMap = new Map();
    elementListenerMap.set(element, listenerMap);
  }

  return listenerMap;
}

const PLUGIN_EVENT_SYSTEM = 1;
var registrationNameDependencies = {};

function getTopLevelCallbackBookKeeping(
  topLevelType,
  nativeEvent,
  targetInst,
  eventSystemFlags,
) {
  console.log(['getTopLevelCallbackBookKeeping'], {
    topLevelType,
    nativeEvent,
    targetInst,
    eventSystemFlags,
  });

  return {
    topLevelType: topLevelType,
    eventSystemFlags: eventSystemFlags,
    nativeEvent: nativeEvent,
    targetInst: targetInst,
    ancestors: [],
  };
}

const CALLBACK_BOOKKEEPING_POOL_SIZE = 10;
const callbackBookkeepingPool = [];

function releaseTopLevelCallbackBookKeeping(instance) {
  console.log(['releaseTopLevelCallbackBookKeeping'], { instance });
  instance.topLevelType = null;
  instance.nativeEvent = null;
  instance.targetInst = null;
  instance.ancestors.length = 0;

  if (callbackBookkeepingPool.length < CALLBACK_BOOKKEEPING_POOL_SIZE) {
    callbackBookkeepingPool.push(instance);
  }
}

let isBatchingEventUpdates = false;
const batchedUpdatesImpl = function (fn, bookkeeping) {
  console.log(['batchedUpdatesImpl'], { fn, bookkeeping });

  return fn(bookkeeping);
};
const batchedEventUpdatesImpl = batchedUpdatesImpl;

function batchedEventUpdates(fn, a, b) {
  console.log(['batchedEventUpdates'], { fn, a, b });

  if (isBatchingEventUpdates) {
    return fn(a, b);
  }

  isBatchingEventUpdates = true;

  try {
    return batchedEventUpdatesImpl(fn, a, b);
  } finally {
    isBatchingEventUpdates = false;
  }
}

function findRootContainerNode(inst) {
  console.log(['findRootContainerNode'], { inst });

  if (inst.tag === HostRoot) {
    return inst.stateNode.containerInfo;
  }

  while (inst.return) {
    inst = inst.return;
  }

  if (inst.tag !== HostRoot) {
    return null;
  }

  return inst.stateNode.containerInfo;
}

const IS_FIRST_ANCESTOR = 1 << 6;

function executeDispatch(event, listener, inst) {
  console.log(['executeDispatch'], { event, listener, inst });
  event.currentTarget = getNodeFromInstance(inst);
  listener(undefined, event);
  event.currentTarget = null;
}

function executeDispatchesInOrder(event) {
  console.log(['executeDispatchesInOrder'], { event });

  const dispatchListeners = event._dispatchListeners;
  const dispatchInstances = event._dispatchInstances;

  if (Array.isArray(dispatchListeners)) {
    for (let i = 0; i < dispatchListeners.length; i++) {
      if (event.isPropagationStopped()) {
        break;
      }

      executeDispatch(event, dispatchListeners[i], dispatchInstances[i]);
    }
  } else if (dispatchListeners) {
    executeDispatch(event, dispatchListeners, dispatchInstances);
  }

  event._dispatchListeners = null;
  event._dispatchInstances = null;
}

const executeDispatchesAndRelease = function (event) {
  console.log(['executeDispatchesAndRelease'], { executeDispatchesAndRelease });

  if (event) {
    executeDispatchesInOrder(event);

    event.constructor.release(event);
  }
};
const executeDispatchesAndReleaseTopLevel = function (e) {
  console.log(['executeDispatchesAndReleaseTopLevel'], { e });

  return executeDispatchesAndRelease(e);
};

function accumulateInto(current, next) {
  console.log(['accumulateInto'], { current, next });

  if (current == null) {
    return next;
  }

  if (Array.isArray(current)) {
    if (Array.isArray(next)) {
      current.push.apply(current, next);

      return current;
    }

    current.push(next);

    return current;
  }

  if (Array.isArray(next)) {
    return [current].concat(next);
  }

  return [current, next];
}

function forEachAccumulated(arr, cb) {
  console.log(['forEachAccumulated'], { arr, cb });
  cb(arr);
}

let eventQueue = null;

function runEventsInBatch(events) {
  console.log(['runEventsInBatch'], { events });

  if (events !== null) {
    eventQueue = accumulateInto(eventQueue, events);
  }

  const processingEventQueue = eventQueue;

  eventQueue = null;

  if (!processingEventQueue) {
    return;
  }

  forEachAccumulated(processingEventQueue, executeDispatchesAndReleaseTopLevel);
}

function extractPluginEvents(
  topLevelType,
  targetInst,
  nativeEvent,
  nativeEventTarget,
  eventSystemFlags,
) {
  console.log(['extractPluginEvents'], {
    topLevelType,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
  });

  let events = null;

  for (let i = 0; i < plugins.length; i++) {
    const possiblePlugin = plugins[i];

    if (possiblePlugin) {
      const extractedEvents = possiblePlugin.extractEvents(
        topLevelType,
        targetInst,
        nativeEvent,
        nativeEventTarget,
        eventSystemFlags,
      );

      if (extractedEvents) {
        events = accumulateInto(events, extractedEvents);
      }
    }
  }

  return events;
}

function runExtractedPluginEventsInBatch(
  topLevelType,
  targetInst,
  nativeEvent,
  nativeEventTarget,
  eventSystemFlags,
) {
  console.log(['runExtractedPluginEventsInBatch'], {
    topLevelType,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
  });

  const events = extractPluginEvents(
    topLevelType,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
  );

  runEventsInBatch(events);
}

function handleTopLevel(bookKeeping) {
  console.log(['handleTopLevel'], { bookKeeping });

  let targetInst = bookKeeping.targetInst;
  let ancestor = targetInst;

  do {
    if (!ancestor) {
      const ancestors = bookKeeping.ancestors;

      ancestors.push(ancestor);

      break;
    }

    const root = findRootContainerNode(ancestor);

    if (!root) {
      break;
    }

    const tag = ancestor.tag;

    if (tag === HostComponent || tag === HostText) {
      bookKeeping.ancestors.push(ancestor);
    }

    ancestor = getClosestInstanceFromNode(root);
  } while (ancestor);

  for (let i = 0; i < bookKeeping.ancestors.length; i++) {
    targetInst = bookKeeping.ancestors[i];

    const eventTarget = getEventTarget(bookKeeping.nativeEvent);
    const topLevelType = bookKeeping.topLevelType;
    const nativeEvent = bookKeeping.nativeEvent;
    let eventSystemFlags = bookKeeping.eventSystemFlags;

    if (i === 0) {
      eventSystemFlags |= IS_FIRST_ANCESTOR;
    }

    runExtractedPluginEventsInBatch(
      topLevelType,
      targetInst,
      nativeEvent,
      eventTarget,
      eventSystemFlags,
    );
  }
}

function dispatchEventForLegacyPluginEventSystem(
  topLevelType,
  eventSystemFlags,
  nativeEvent,
  targetInst,
) {
  console.log(['dispatchEventForLegacyPluginEventSystem'], {
    topLevelType,
    eventSystemFlags,
    nativeEvent,
    targetInst,
  });

  const bookKeeping = getTopLevelCallbackBookKeeping(
    topLevelType,
    nativeEvent,
    targetInst,
    eventSystemFlags,
  );

  try {
    batchedEventUpdates(handleTopLevel, bookKeeping);
  } finally {
    releaseTopLevelCallbackBookKeeping(bookKeeping);
  }
}

function addEventBubbleListener(element, eventType, listener) {
  console.log(['addEventBubbleListener'], { element, eventType, listener });
  element.addEventListener(eventType, listener, false);
}

function getClosestInstanceFromNode(targetNode) {
  console.log(['getClosestInstanceFromNode'], { targetNode });

  let targetInst = targetNode[internalInstanceKey];

  if (targetInst) {
    return targetInst;
  }

  let parentNode = targetNode.parentNode;

  while (parentNode) {
    targetInst = parentNode[internalInstanceKey];

    if (targetInst) {
      return targetInst;
    }

    targetNode = parentNode;
    parentNode = targetNode.parentNode;
  }

  return null;
}

function getEventTarget(nativeEvent) {
  console.log(['getEventTarget'], { nativeEvent });

  let target = nativeEvent.target || nativeEvent.srcElement || window;

  if (target.correspondingUseElement) {
    target = target.correspondingUseElement;
  }

  return target.nodeType === TEXT_NODE ? target.parentNode : target;
}

function attemptToDispatchEvent(
  topLevelType,
  eventSystemFlags,
  container,
  nativeEvent,
) {
  console.log(['attemptToDispatchEvent'], {
    topLevelType,
    eventSystemFlags,
    container,
    nativeEvent,
  });

  const nativeEventTarget = getEventTarget(nativeEvent);
  const targetInst = getClosestInstanceFromNode(nativeEventTarget);

  dispatchEventForLegacyPluginEventSystem(
    topLevelType,
    eventSystemFlags,
    nativeEvent,
    targetInst,
  );

  return null;
}

function dispatchEvent(topLevelType, eventSystemFlags, container, nativeEvent) {
  console.log(['dispatchEvent']);
  attemptToDispatchEvent(
    topLevelType,
    eventSystemFlags,
    container,
    nativeEvent,
  );
}

function trapEventForPluginEventSystem(container, topLevelType) {
  console.log(['trapEventForPluginEventSystem'], { container, topLevelType });

  let listener;

  listener = dispatchEvent.bind(
    null,
    topLevelType,
    PLUGIN_EVENT_SYSTEM,
    container,
  );

  addEventBubbleListener(container, topLevelType, listener);
}

function trapBubbledEvent(topLevelType, element) {
  console.log(['trapBubbledEvent'], { topLevelType, element });
  trapEventForPluginEventSystem(element, topLevelType, false);
}

function legacyListenToTopLevelEvent(topLevelType, mountAt, listenerMap) {
  console.log(['legacyListenToTopLevelEvent'], {
    topLevelType,
    mountAt,
    listenerMap,
  });

  if (!listenerMap.has(topLevelType)) {
    trapBubbledEvent(topLevelType, mountAt);
    listenerMap.set(topLevelType, null);
  }
}

function legacyListenToEvent(registrationName, mountAt) {
  console.log(['legacyListenToEvent'], { registrationName, mountAt });

  const listenerMap = getListenerMapForElement(mountAt);
  const dependencies = registrationNameDependencies[registrationName];

  for (let i = 0; i < dependencies.length; i++) {
    const dependency = dependencies[i];

    legacyListenToTopLevelEvent(dependency, mountAt, listenerMap);
  }
}

function ensureListeningTo(rootContainerElement, registrationName) {
  console.log(['ensureListeningTo'], {
    rootContainerElement,
    registrationName,
  });

  const isDocumentOrFragment =
    rootContainerElement.nodeType === DOCUMENT_NODE ||
    rootContainerElement.nodeType === DOCUMENT_FRAGMENT_NODE;
  const doc = isDocumentOrFragment
    ? rootContainerElement
    : rootContainerElement.ownerDocument;

  legacyListenToEvent(registrationName, doc);
}

var registrationNameModules = {};
const HTML$1 = '__html';
const STYLE = 'style';

function setInitialDOMProperties(
  tag,
  domElement,
  rootContainerElement,
  nextProps,
  isCustomComponentTag,
) {
  console.log(['setInitialDOMProperties'], {
    tag,
    domElement,
    rootContainerElement,
    nextProps,
    isCustomComponentTag,
  });

  for (const propKey in nextProps) {
    if (!nextProps.hasOwnProperty(propKey)) {
      continue;
    }

    const nextProp = nextProps[propKey];

    if (propKey === STYLE) {
      {
        if (nextProp) {
          Object.freeze(nextProp);
        }
      }

      setValueForStyles(domElement, nextProp);
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
      const nextHtml = nextProp ? nextProp[HTML$1] : undefined;

      if (nextHtml != null) {
        setInnerHTML(domElement, nextHtml);
      }
    } else if (propKey === CHILDREN) {
      if (typeof nextProp === 'string') {
        const canSetTextContent = tag !== 'textarea' || nextProp !== '';

        if (canSetTextContent) {
          setTextContent(domElement, nextProp);
        }
      } else if (typeof nextProp === 'number') {
        setTextContent(domElement, '' + nextProp);
      }
    } else if (propKey === AUTOFOCUS);
    else if (registrationNameModules.hasOwnProperty(propKey)) {
      if (nextProp != null) {
        ensureListeningTo(rootContainerElement, propKey);
      }
    } else if (nextProp != null) {
      setValueForProperty(domElement, propKey, nextProp, isCustomComponentTag);
    }
  }
}

function setInitialProperties(domElement, tag, rawProps, rootContainerElement) {
  console.log(['setInitialProperties'], {
    domElement,
    tag,
    rawProps,
    rootContainerElement,
  });

  const isCustomComponentTag = isCustomComponent(tag, rawProps);
  let props;

  props = rawProps;

  setInitialDOMProperties(
    tag,
    domElement,
    rootContainerElement,
    props,
    isCustomComponentTag,
  );
}

function shouldAutoFocusHostComponent(type, props) {
  console.log(['shouldAutoFocusHostComponent'], { type, props });

  switch (type) {
    case 'button':
    case 'input':
    case 'select':
    case 'textarea':
      return !!props.autoFocus;
  }

  return false;
}

function finalizeInitialChildren(
  domElement,
  type,
  props,
  rootContainerInstance,
) {
  console.log(['finalizeInitialChildren'], {
    domElement,
    type,
    props,
    rootContainerInstance,
  });
  setInitialProperties(domElement, type, props, rootContainerInstance);

  return shouldAutoFocusHostComponent(type, props);
}

function markUpdate(workInProgress) {
  console.log(['markUpdate'], { workInProgress });
  workInProgress.effectTag |= Update;
}

function completeWork(current, workInProgress) {
  console.log(['completeWork'], { current, workInProgress });

  const newProps = workInProgress.pendingProps;

  switch (workInProgress.tag) {
    case IndeterminateComponent:
    case FunctionComponent:
    case HostRoot: {
      return null;
    }
    case HostComponent: {
      const rootContainerInstance = getRootHostContainer();
      const type = workInProgress.type;

      if (current !== null && workInProgress.stateNode != null) {
        updateHostComponent$1(
          current,
          workInProgress,
          type,
          newProps,
          rootContainerInstance,
        );
      } else {
        if (!newProps) {
          return null;
        }

        const currentHostContext = contextStackCursor$1.current;
        // bottom->up. Top->down is faster in IE11.
        const instance = createInstance(
          type,
          newProps,
          rootContainerInstance,
          currentHostContext,
          workInProgress,
        );

        appendAllChildren(instance, workInProgress, false, false);

        workInProgress.stateNode = instance;

        if (
          finalizeInitialChildren(
            instance,
            type,
            newProps,
            rootContainerInstance,
          )
        ) {
          markUpdate(workInProgress);
        }
      }

      return null;
    }
  }
}

function createFiberFromText(content) {
  console.log(['createFiberFromText'], { content });

  const fiber = createFiber(HostText, content, null);

  return fiber;
}

function createFiberFromTypeAndProps(type, key, pendingProps, owner, mode) {
  console.log(['createFiberFromTypeAndProps'], {
    type,
    key,
    pendingProps,
    mode,
  });

  let fiber;
  let fiberTag = IndeterminateComponent;
  const resolvedType = type;

  if (typeof type === 'string') {
    fiberTag = HostComponent;
  }

  fiber = createFiber(fiberTag, pendingProps, key, mode);
  fiber.elementType = type;
  fiber.type = resolvedType;

  return fiber;
}

const isArray$1 = Array.isArray;

function createFiberFromElement(element) {
  console.log(['createFiberFromElement'], { element });

  const type = element.type;
  const key = element.key;
  const pendingProps = element.props;

  return createFiberFromTypeAndProps(type, key, pendingProps, null);
}

function ChildReconciler(shouldTrackSideEffects) {
  console.log(['ChildReconciler'], { shouldTrackSideEffects });

  function deleteChild(returnFiber, childToDelete) {
    console.log(['deleteChild'], { returnFiber, childToDelete });

    if (!shouldTrackSideEffects) {
      return;
    }

    const last = returnFiber.lastEffect;

    if (last !== null) {
      last.nextEffect = childToDelete;
      returnFiber.lastEffect = childToDelete;
    } else {
      returnFiber.firstEffect = returnFiber.lastEffect = childToDelete;
    }

    childToDelete.nextEffect = null;
    childToDelete.effectTag = Deletion;
  }

  function deleteRemainingChildren(returnFiber, currentFirstChild) {
    console.log(['deleteRemainingChildren'], currentFirstChild);

    if (!shouldTrackSideEffects) {
      return null;
    }

    let childToDelete = currentFirstChild;

    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete);
      childToDelete = childToDelete.sibling;
    }

    return null;
  }

  function mapRemainingChildren(returnFiber, currentFirstChild) {
    console.log(['mapRemainingChildren'], { returnFiber, currentFirstChild });

    const existingChildren = new Map();
    let existingChild = currentFirstChild;

    while (existingChild !== null) {
      if (existingChild.key !== null) {
        existingChildren.set(existingChild.key, existingChild);
      } else {
        existingChildren.set(existingChild.index, existingChild);
      }

      existingChild = existingChild.sibling;
    }

    return existingChildren;
  }

  function useFiber(fiber, pendingProps) {
    console.log(['useFiber'], { fiber, pendingProps });

    const clone = createWorkInProgress(fiber, pendingProps);

    clone.index = 0;
    clone.sibling = null;

    return clone;
  }

  function placeChild(newFiber, lastPlacedIndex, newIndex) {
    console.log(['placeChild'], { newFiber, lastPlacedIndex, newIndex });
    newFiber.index = newIndex;

    if (!shouldTrackSideEffects) {
      return lastPlacedIndex;
    }

    const current = newFiber.alternate;

    if (current !== null) {
      const oldIndex = current.index;

      if (oldIndex < lastPlacedIndex) {
        newFiber.effectTag = Placement;

        return lastPlacedIndex;
      } else {
        return oldIndex;
      }
    } else {
      newFiber.effectTag = Placement;

      return lastPlacedIndex;
    }
  }

  function placeSingleChild(newFiber) {
    console.log(['placeSingleChild'], { newFiber });

    if (shouldTrackSideEffects && newFiber.alternate === null) {
      newFiber.effectTag = Placement;
    }

    return newFiber;
  }

  function updateTextNode(returnFiber, current, textContent) {
    console.log(['updateTextNode'], { returnFiber, current, textContent });

    if (current === null || current.tag !== HostText) {
      const created = createFiberFromText(textContent);

      created.return = returnFiber;

      return created;
    } else {
      const existing = useFiber(current, textContent);

      existing.return = returnFiber;

      return existing;
    }
  }

  function updateElement(returnFiber, current, element) {
    console.log(['updateElement'], { returnFiber, current, element });

    if (current !== null) {
      if (current.elementType === element.type) {
        const existing = useFiber(current, element.props);

        existing.ref = null;

        existing.return = returnFiber;

        return existing;
      }
    }

    const created = createFiberFromElement(element);

    created.ref = null;

    created.return = returnFiber;

    return created;
  }

  function updateSlot(returnFiber, oldFiber, newChild) {
    console.log(['updateSlot'], {
      returnFiber,
      oldFiber,
      newChild,
    });

    const key = oldFiber !== null ? oldFiber.key : null;

    if (typeof newChild === 'string' || typeof newChild === 'number') {
      if (key !== null) {
        return null;
      }

      return updateTextNode(returnFiber, oldFiber, '' + newChild);
    }

    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          if (newChild.key === key) {
            return updateElement(returnFiber, oldFiber, newChild);
          } else {
            return null;
          }
        }
      }
    }

    return null;
  }

  function updateFromMap(existingChildren, returnFiber, newIdx, newChild) {
    console.log(['updateFromMap'], {
      existingChildren,
      returnFiber,
      newIdx,
      newChild,
    });

    if (typeof newChild === 'string' || typeof newChild === 'number') {
      const matchedFiber = existingChildren.get(newIdx) || null;

      return updateTextNode(returnFiber, matchedFiber, '' + newChild);
    }

    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          const _matchedFiber =
            existingChildren.get(
              newChild.key === null ? newIdx : newChild.key,
            ) || null;

          return updateElement(returnFiber, _matchedFiber, newChild);
        }
      }
    }

    return null;
  }

  function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
    console.log(['reconcileChildrenArray'], {
      returnFiber,
      currentFirstChild,
      newChildren,
    });

    let resultingFirstChild = null;
    let previousNewFiber = null;
    let oldFiber = currentFirstChild;
    let lastPlacedIndex = 0;
    let newIdx = 0;
    let nextOldFiber = null;

    for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
      if (oldFiber.index > newIdx) {
        nextOldFiber = oldFiber;
        oldFiber = null;
      } else {
        nextOldFiber = oldFiber.sibling;
      }

      const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx]);

      if (newFiber === null) {
        if (oldFiber === null) {
          oldFiber = nextOldFiber;
        }

        break;
      }

      if (shouldTrackSideEffects) {
        if (oldFiber && newFiber.alternate === null) {
          deleteChild(returnFiber, oldFiber);
        }
      }

      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);

      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }

      previousNewFiber = newFiber;
      oldFiber = nextOldFiber;
    }

    const existingChildren = mapRemainingChildren(returnFiber, oldFiber); // Keep scanning and use the map to restore deleted items as moves.

    for (; newIdx < newChildren.length; newIdx++) {
      const _newFiber2 = updateFromMap(
        existingChildren,
        returnFiber,
        newIdx,
        newChildren[newIdx],
      );

      if (_newFiber2 !== null) {
        if (shouldTrackSideEffects) {
          if (_newFiber2.alternate !== null) {
            existingChildren.delete(
              _newFiber2.key === null ? newIdx : _newFiber2.key,
            );
          }
        }

        lastPlacedIndex = placeChild(_newFiber2, lastPlacedIndex, newIdx);

        if (previousNewFiber === null) {
          resultingFirstChild = _newFiber2;
        } else {
          previousNewFiber.sibling = _newFiber2;
        }

        previousNewFiber = _newFiber2;
      }
    }

    if (shouldTrackSideEffects) {
      existingChildren.forEach(function (child) {
        return deleteChild(returnFiber, child);
      });
    }

    return resultingFirstChild;
  }

  function reconcileSingleElement(returnFiber, currentFirstChild, element) {
    console.log(['reconcileSingleElement'], {
      returnFiber,
      currentFirstChild,
      element,
    });

    let child = currentFirstChild;

    while (child !== null) {
      if (child.elementType === element.type) {
        deleteRemainingChildren(returnFiber, child.sibling);

        const _existing3 = useFiber(child, element.props);

        _existing3.ref = null;

        _existing3.return = returnFiber;

        return _existing3;
      }

      deleteRemainingChildren(returnFiber, child);

      child = child.sibling;
    }

    const _created4 = createFiberFromElement(element);

    _created4.ref = null;
    _created4.return = returnFiber;

    return _created4;
  }

  function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
    console.log(['reconcileChildFibers'], {
      returnFiber,
      currentFirstChild,
      newChild,
    });

    const isObject = typeof newChild === 'object' && newChild !== null;

    if (isObject) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcileSingleElement(returnFiber, currentFirstChild, newChild),
          );
      }
    }

    if (isArray$1(newChild)) {
      return reconcileChildrenArray(returnFiber, currentFirstChild, newChild);
    }

    return deleteRemainingChildren(returnFiber, currentFirstChild);
  }

  return reconcileChildFibers;
}

function completeUnitOfWork(unitOfWork) {
  console.log(['completeUnitOfWork'], { unitOfWork });
  workInProgress = unitOfWork;

  do {
    const current = workInProgress.alternate;
    const returnFiber = workInProgress.return; // Check if the work completed or if something threw.
    let next = void 0;

    next = completeWork(current, workInProgress);

    if (
      returnFiber !== null && // Do not append effects to parents if a sibling failed to complete
      (returnFiber.effectTag & Incomplete) === NoEffect
    ) {
      if (returnFiber.firstEffect === null) {
        returnFiber.firstEffect = workInProgress.firstEffect;
      }

      if (workInProgress.lastEffect !== null) {
        if (returnFiber.lastEffect !== null) {
          returnFiber.lastEffect.nextEffect = workInProgress.firstEffect;
        }

        returnFiber.lastEffect = workInProgress.lastEffect;
      }

      const effectTag = workInProgress.effectTag;

      if (effectTag > PerformedWork) {
        if (returnFiber.lastEffect !== null) {
          returnFiber.lastEffect.nextEffect = workInProgress;
        } else {
          returnFiber.firstEffect = workInProgress;
        }

        returnFiber.lastEffect = workInProgress;
      }
    }

    const siblingFiber = workInProgress.sibling;

    if (siblingFiber !== null) {
      return siblingFiber;
    }

    workInProgress = returnFiber;
  } while (workInProgress !== null); // We've reached the root.

  return null;
}

let performUnitOfWorkCounter = 0;

function performUnitOfWork(unitOfWork) {
  console.log(['performUnitOfWork'], performUnitOfWorkCounter, { unitOfWork });
  performUnitOfWorkCounter++;

  const current = unitOfWork.alternate;
  let next;

  next = beginWork(current, unitOfWork);

  unitOfWork.memoizedProps = unitOfWork.pendingProps;

  console.log(['performUnitOfWork.next'], next);

  if (next === null) {
    next = completeUnitOfWork(unitOfWork);
  }

  ReactCurrentOwner.current = null;

  return next;
}

function hasSelectionCapabilities(elem) {
  console.log(['hasSelectionCapabilities'], { elem });

  const nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();

  return (
    nodeName &&
    ((nodeName === 'input' &&
      (elem.type === 'text' ||
        elem.type === 'search' ||
        elem.type === 'tel' ||
        elem.type === 'url' ||
        elem.type === 'password')) ||
      nodeName === 'textarea' ||
      elem.contentEditable === 'true')
  );
}

function getActiveElement() {
  console.log(['getActiveElement']);

  const doc = typeof document !== 'undefined' ? document : undefined;

  if (typeof doc === 'undefined') {
    return null;
  }

  try {
    return doc.activeElement || doc.body;
  } catch (e) {
    return doc.body;
  }
}

function getSelectionInformation() {
  console.log(['getSelectionInformation']);

  const focusedElem = getActiveElement();

  return {
    activeElementDetached: null,
    focusedElem: focusedElem,
    selectionRange: null,
  };
}

function workLoopSync() {
  console.log(['workLoopSync']);

  while (workInProgress !== null) {
    const work = performUnitOfWork(workInProgress);

    workInProgress = work;
  }
}

let _enabled = true;

function isEnabled() {
  console.log(['isEnabled']);

  return _enabled;
}

function setEnabled(enabled) {
  console.log(['setEnabled'], { enabled });
  _enabled = !!enabled;
}

let eventsEnabled = null;
let selectionInformation = null;

function prepareForCommit() {
  console.log(['prepareForCommit']);
  eventsEnabled = isEnabled();
  selectionInformation = getSelectionInformation();
  setEnabled(false);
}

function isTextNode(node) {
  console.log(['isTextNode'], { node });

  return node && node.nodeType === TEXT_NODE;
}

function containsNode(outerNode, innerNode) {
  console.log(['containsNode'], { outerNode, innerNode });

  if (!outerNode || !innerNode) {
    return false;
  } else if (outerNode === innerNode) {
    return true;
  } else if (isTextNode(outerNode)) {
    return false;
  } else if (isTextNode(innerNode)) {
    return containsNode(outerNode, innerNode.parentNode);
  } else if ('contains' in outerNode) {
    return outerNode.contains(innerNode);
  } else if (outerNode.compareDocumentPosition) {
    return !!(outerNode.compareDocumentPosition(innerNode) & 16);
  } else {
    return false;
  }
}

function isInDocument(node) {
  console.log(['isInDocument'], { node });

  return (
    node &&
    node.ownerDocument &&
    containsNode(node.ownerDocument.documentElement, node)
  );
}

function getSiblingNode(node) {
  console.log(['getSiblingNode'], { node });

  while (node) {
    if (node.nextSibling) {
      return node.nextSibling;
    }

    node = node.parentNode;
  }
}

function getLeafNode(node) {
  console.log(['getLeafNode'], { node });

  while (node && node.firstChild) {
    node = node.firstChild;
  }

  return node;
}

function getNodeForCharacterOffset(root, offset) {
  console.log(['getNodeForCharacterOffset'], { root, offset });

  let node = getLeafNode(root);
  let nodeStart = 0;
  let nodeEnd = 0;

  while (node) {
    if (node.nodeType === TEXT_NODE) {
      nodeEnd = nodeStart + node.textContent.length;

      if (nodeStart <= offset && nodeEnd >= offset) {
        return {
          node: node,
          offset: offset - nodeStart,
        };
      }

      nodeStart = nodeEnd;
    }

    node = getLeafNode(getSiblingNode(node));
  }
}

function setOffsets(node, offsets) {
  console.log(['setOffsets'], { node, offsets });

  const doc = node.ownerDocument || document;
  const win = (doc && doc.defaultView) || window;

  if (!win.getSelection) {
    return;
  }

  const selection = win.getSelection();
  const length = node.textContent.length;
  let start = Math.min(offsets.start, length);
  let end = offsets.end === undefined ? start : Math.min(offsets.end, length);

  if (!selection.extend && start > end) {
    const temp = end;

    end = start;
    start = temp;
  }

  const startMarker = getNodeForCharacterOffset(node, start);
  const endMarker = getNodeForCharacterOffset(node, end);

  if (startMarker && endMarker) {
    if (
      selection.rangeCount === 1 &&
      selection.anchorNode === startMarker.node &&
      selection.anchorOffset === startMarker.offset &&
      selection.focusNode === endMarker.node &&
      selection.focusOffset === endMarker.offset
    ) {
      return;
    }

    const range = doc.createRange();

    range.setStart(startMarker.node, startMarker.offset);
    selection.removeAllRanges();

    if (start > end) {
      selection.addRange(range);
      selection.extend(endMarker.node, endMarker.offset);
    } else {
      range.setEnd(endMarker.node, endMarker.offset);
      selection.addRange(range);
    }
  }
}

function setSelection(input, offsets) {
  console.log(['setSelection'], { input, offsets });

  let start = offsets.start,
    end = offsets.end;

  if (end === undefined) {
    end = start;
  }

  if ('selectionStart' in input) {
    input.selectionStart = start;
    input.selectionEnd = Math.min(end, input.value.length);
  } else {
    setOffsets(input, offsets);
  }
}

function restoreSelection(priorSelectionInformation) {
  console.log(['restoreSelection'], { priorSelectionInformation });

  const curFocusedElem = getActiveElement();
  const priorFocusedElem = priorSelectionInformation.focusedElem;
  const priorSelectionRange = priorSelectionInformation.selectionRange;

  if (curFocusedElem !== priorFocusedElem && isInDocument(priorFocusedElem)) {
    if (
      priorSelectionRange !== null &&
      hasSelectionCapabilities(priorFocusedElem)
    ) {
      setSelection(priorFocusedElem, priorSelectionRange);
    }

    const ancestors = [];
    let ancestor = priorFocusedElem;

    while ((ancestor = ancestor.parentNode)) {
      if (ancestor.nodeType === ELEMENT_NODE) {
        ancestors.push({
          element: ancestor,
          left: ancestor.scrollLeft,
          top: ancestor.scrollTop,
        });
      }
    }

    if (typeof priorFocusedElem.focus === 'function') {
      priorFocusedElem.focus();
    }

    for (let i = 0; i < ancestors.length; i++) {
      const info = ancestors[i];

      info.element.scrollLeft = info.left;
      info.element.scrollTop = info.top;
    }
  }
}

function resetAfterCommit() {
  console.log(['resetAfterCommit']);
  restoreSelection(selectionInformation);
  setEnabled(eventsEnabled);
  eventsEnabled = null;

  selectionInformation = null;
}

let current = null;
let nextEffect = null;

function resetCurrentFiber() {
  console.log(['resetCurrentFiber']);
  current = null;
  isRendering = false;
}

function setCurrentFiber(fiber) {
  console.log(['setCurrentFiber'], { fiber });
  current = fiber;
  isRendering = false;
}

let effectCountInCurrentCommit = 0;

function recordEffect() {
  console.log(['recordEffect']);

  {
    effectCountInCurrentCommit++;
  }
}

function isHostParent(fiber) {
  console.log(['isHostParent'], { fiber });

  return fiber.tag === HostComponent || fiber.tag === HostRoot;
}

function getHostParentFiber(fiber) {
  console.log(['getHostParentFiber'], { fiber });

  let parent = fiber.return;

  while (parent !== null) {
    if (isHostParent(parent)) {
      return parent;
    }

    parent = parent.return;
  }
}

function getHostSibling(fiber) {
  console.log(['getHostSibling'], { fiber });

  let node = fiber;

  siblings: while (true) {
    while (node.sibling === null) {
      if (node.return === null || isHostParent(node.return)) {
        return null;
      }

      node = node.return;
    }

    node.sibling.return = node.return;
    node = node.sibling;

    while (node.tag !== HostComponent && node.tag !== HostText) {
      if (node.effectTag & Placement) {
        continue siblings;
      }

      if (node.child === null) {
        continue siblings;
      } else {
        node.child.return = node;
        node = node.child;
      }
    }

    if (!(node.effectTag & Placement)) {
      return node.stateNode;
    }
  }
}

function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
  console.log(['insertOrAppendPlacementNodeIntoContainer'], {
    node,
    before,
    parent,
  });

  const tag = node.tag;
  const isHost = tag === HostComponent || tag === HostText;

  if (isHost) {
    const stateNode = isHost ? node.stateNode : node.stateNode.instance;

    parent.appendChild(stateNode);
  } else {
    const child = node.child;

    if (child !== null) {
      insertOrAppendPlacementNodeIntoContainer(child, before, parent);

      let sibling = child.sibling;

      while (sibling !== null) {
        insertOrAppendPlacementNodeIntoContainer(sibling, before, parent);
        sibling = sibling.sibling;
      }
    }
  }
}

function appendChild(parentInstance, child) {
  console.log(['parentInstance'], { parentInstance, child });
  parentInstance.appendChild(child);
}

function insertOrAppendPlacementNode(node, before, parent) {
  console.log(['insertOrAppendPlacementNode'], { node, before, parent });

  const tag = node.tag;
  const isHost = tag === HostComponent || tag === HostText;

  if (isHost) {
    const stateNode = isHost ? node.stateNode : node.stateNode.instance;

    appendChild(parent, stateNode);
  } else {
    const child = node.child;

    if (child !== null) {
      insertOrAppendPlacementNode(child, before, parent);

      let sibling = child.sibling;

      while (sibling !== null) {
        insertOrAppendPlacementNode(sibling, before, parent);
        sibling = sibling.sibling;
      }
    }
  }
}

function commitPlacement(finishedWork) {
  console.log(['commitPlacement'], { finishedWork });

  const parentFiber = getHostParentFiber(finishedWork);
  let parent;
  let isContainer;
  const parentStateNode = parentFiber.stateNode;

  switch (parentFiber.tag) {
    case HostComponent:
      parent = parentStateNode;
      isContainer = false;

      break;
    case HostRoot:
      parent = parentStateNode.containerInfo;
      isContainer = true;

      break;
  }

  const before = getHostSibling(finishedWork);

  if (isContainer) {
    insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
  } else {
    insertOrAppendPlacementNode(finishedWork, before, parent);
  }
}

const DANGEROUSLY_SET_INNER_HTML = 'dangerouslySetInnerHTML';
const AUTOFOCUS = 'autoFocus';
const CHILDREN = 'children';
const isUnitlessNumber = {
  animationIterationCount: true,
  borderImageOutset: true,
  borderImageSlice: true,
  borderImageWidth: true,
  boxFlex: true,
  boxFlexGroup: true,
  boxOrdinalGroup: true,
  columnCount: true,
  columns: true,
  flex: true,
  flexGrow: true,
  flexPositive: true,
  flexShrink: true,
  flexNegative: true,
  flexOrder: true,
  gridArea: true,
  gridRow: true,
  gridRowEnd: true,
  gridRowSpan: true,
  gridRowStart: true,
  gridColumn: true,
  gridColumnEnd: true,
  gridColumnSpan: true,
  gridColumnStart: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  tabSize: true,
  widows: true,
  zIndex: true,
  zoom: true,
  fillOpacity: true,
  floodOpacity: true,
  stopOpacity: true,
  strokeDasharray: true,
  strokeDashoffset: true,
  strokeMiterlimit: true,
  strokeOpacity: true,
  strokeWidth: true,
};

function dangerousStyleValue(name, value, isCustomProperty) {
  console.log(['dangerousStyleValue'], { name, value, isCustomProperty });

  const isEmpty = value == null || typeof value === 'boolean' || value === '';

  if (isEmpty) {
    return '';
  }

  if (
    !isCustomProperty &&
    typeof value === 'number' &&
    value !== 0 &&
    !(isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name])
  ) {
    return value + 'px';
  }

  return ('' + value).trim();
}

function setValueForStyles(node, styles) {
  console.log(['setValueForStyles'], { node, styles });

  const style = node.style;

  for (let styleName in styles) {
    if (!styles.hasOwnProperty(styleName)) {
      continue;
    }

    const isCustomProperty = styleName.indexOf('--') === 0;
    const styleValue = dangerousStyleValue(
      styleName,
      styles[styleName],
      isCustomProperty,
    );

    if (styleName === 'float') {
      styleName = 'cssFloat';
    }

    if (isCustomProperty) {
      style.setProperty(styleName, styleValue);
    } else {
      style[styleName] = styleValue;
    }
  }
}

function setInnerHTML(node, html) {
  console.log(['setInnerHTML'], { node, html });
  node.innerHTML = html;
}

const setTextContent = function (node, text) {
  console.log(['setTextContent'], { node, text });

  if (text) {
    const firstChild = node.firstChild;

    if (
      firstChild &&
      firstChild === node.lastChild &&
      firstChild.nodeType === TEXT_NODE
    ) {
      firstChild.nodeValue = text;

      return;
    }
  }

  node.textContent = text;
};

function updateDOMProperties(
  domElement,
  updatePayload,
  wasCustomComponentTag,
  isCustomComponentTag,
) {
  // TODO: Handle wasCustomComponentTag
  console.log(['updateDOMProperties'], {
    domElement,
    updatePayload,
    wasCustomComponentTag,
    isCustomComponentTag,
  });

  for (let i = 0; i < updatePayload.length; i += 2) {
    const propKey = updatePayload[i];
    const propValue = updatePayload[i + 1];

    if (propKey === STYLE) {
      setValueForStyles(domElement, propValue);
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
      setInnerHTML(domElement, propValue);
    } else if (propKey === CHILDREN) {
      setTextContent(domElement, propValue);
    } else {
      setValueForProperty(domElement, propKey, propValue, isCustomComponentTag);
    }
  }
}

function shouldIgnoreAttribute(name, isCustomComponentTag) {
  console.log(['shouldIgnoreAttribute'], { name, isCustomComponentTag });

  if (isCustomComponentTag) {
    return false;
  }

  if (
    name.length > 2 &&
    (name[0] === 'o' || name[0] === 'O') &&
    (name[1] === 'n' || name[1] === 'N')
  ) {
    return true;
  }

  return false;
}

function shouldRemoveAttribute(
  name,
  value,
  propertyInfo,
  isCustomComponentTag,
) {
  console.log(['shouldRemoveAttribute'], {
    name,
    value,
    propertyInfo,
    isCustomComponentTag,
  });

  if (value === null || typeof value === 'undefined') {
    return true;
  }

  if (isCustomComponentTag) {
    return false;
  }

  return false;
}

function setValueForProperty(node, name, value, isCustomComponentTag) {
  console.log(['setValueForProperty'], {
    node,
    name,
    value,
    isCustomComponentTag,
  });

  const propertyInfo = null;

  if (shouldIgnoreAttribute(name, isCustomComponentTag)) {
    return;
  }

  if (shouldRemoveAttribute(name, value, propertyInfo, isCustomComponentTag)) {
    value = null;
  }

  const mustUseProperty = propertyInfo.mustUseProperty;

  if (mustUseProperty) {
    const propertyName = propertyInfo.propertyName;

    if (value === null) {
      const type = propertyInfo.type;

      node[propertyName] = type === BOOLEAN ? false : '';
    } else {
      node[propertyName] = value;
    }

    return;
  }

  const attributeName = propertyInfo.attributeName;

  node.removeAttribute(attributeName);
}

function updateProperties(
  domElement,
  updatePayload,
  tag,
  lastRawProps,
  nextRawProps,
) {
  console.log(['updateProperties'], {
    domElement,
    updatePayload,
    tag,
    lastRawProps,
    nextRawProps,
  });

  const wasCustomComponentTag = isCustomComponent(tag, lastRawProps);
  const isCustomComponentTag = isCustomComponent(tag, nextRawProps); // Apply the diff.

  updateDOMProperties(
    domElement,
    updatePayload,
    wasCustomComponentTag,
    isCustomComponentTag,
  );
}

function commitUpdate(domElement, updatePayload, type, oldProps, newProps) {
  console.log(['commitUpdate'], {
    domElement,
    updatePayload,
    type,
    oldProps,
    newProps,
  });
  updateFiberProps(domElement, newProps);

  updateProperties(domElement, updatePayload, type, oldProps, newProps);
}

function commitWork(current, finishedWork) {
  console.log(['commitWork'], { current, finishedWork });

  switch (finishedWork.tag) {
    case HostComponent: {
      const instance = finishedWork.stateNode;

      if (instance != null) {
        const newProps = finishedWork.memoizedProps;
        const oldProps = current !== null ? current.memoizedProps : newProps;
        const type = finishedWork.type;
        const updatePayload = finishedWork.updateQueue;

        finishedWork.updateQueue = null;

        if (updatePayload !== null) {
          commitUpdate(instance, updatePayload, type, oldProps, newProps);
        }
      }

      return;
    }
  }
}

function commitDeletion(finishedRoot, current) {
  console.log(['commitDeletion'], {
    finishedRoot,
    current,
  });

  {
    unmountHostComponents(finishedRoot, current);
  }

  detachFiber(current);
}

function detachFiber(current) {
  console.log(['detachFiber'], { current });

  const alternate = current.alternate;

  current.return = null;
  current.child = null;
  current.memoizedState = null;
  current.updateQueue = null;
  current.dependencies = null;
  current.alternate = null;
  current.firstEffect = null;
  current.lastEffect = null;
  current.pendingProps = null;
  current.memoizedProps = null;
  current.stateNode = null;

  if (alternate !== null) {
    detachFiber(alternate);
  }
}

function commitNestedUnmounts(finishedRoot, root) {
  console.log(['commitNestedUnmounts'], {
    finishedRoot,
    root,
  });

  let node = root;

  while (true) {
    if (node.child !== null) {
      node.child.return = node;
      node = node.child;

      continue;
    }

    if (node === root) {
      return;
    }

    while (node.sibling === null) {
      if (node.return === null || node.return === root) {
        return;
      }

      node = node.return;
    }

    node.sibling.return = node.return;
    node = node.sibling;
  }
}

function removeChild(parentInstance, child) {
  console.log(['removeChildFromContainer'], { parentInstance, child });
  parentInstance.removeChild(child);
}

function removeChildFromContainer(container, child) {
  console.log(['removeChildFromContainer'], { container, child });
  container.removeChild(child);
}

function unmountHostComponents(finishedRoot, current) {
  console.log(['unmountHostComponents'], {
    finishedRoot,
    current,
  });

  let node = current;
  let currentParentIsValid = false;
  let currentParent;
  let currentParentIsContainer;

  while (true) {
    if (!currentParentIsValid) {
      let parent = node.return;

      findParent: while (true) {
        const parentStateNode = parent.stateNode;

        switch (parent.tag) {
          case HostComponent:
            currentParent = parentStateNode;
            currentParentIsContainer = false;

            break findParent;
          case HostRoot:
            currentParent = parentStateNode.containerInfo;
            currentParentIsContainer = true;

            break findParent;
        }

        parent = parent.return;
      }

      currentParentIsValid = true;
    }

    commitNestedUnmounts(finishedRoot, node);

    if (currentParentIsContainer) {
      removeChildFromContainer(currentParent, node.stateNode);
    } else {
      removeChild(currentParent, node.stateNode);
    }

    if (node === current) {
      return;
    }

    while (node.sibling === null) {
      if (node.return === null || node.return === current) {
        return;
      }

      node = node.return;
    }

    node.sibling.return = node.return;
    node = node.sibling;
  }
}

function resetTextContent(domElement) {
  console.log(['resetTextContent'], { domElement });
  setTextContent(domElement, '');
}

function commitResetTextContent(current) {
  console.log(['commitResetTextContent'], { current });
  resetTextContent(current.stateNode);
}

function commitDetachRef(current) {
  console.log(['commitDetachRef'], { current });

  const currentRef = current.ref;

  if (currentRef !== null) {
    if (typeof currentRef === 'function') {
      currentRef(null);
    } else {
      currentRef.current = null;
    }
  }
}

function commitMutationEffects(root) {
  console.log(['commitMutationEffects'], { root });

  while (nextEffect !== null) {
    setCurrentFiber(nextEffect);

    const effectTag = nextEffect.effectTag;

    if (effectTag & ContentReset) {
      commitResetTextContent(nextEffect);
    }

    if (effectTag & Ref) {
      const current = nextEffect.alternate;

      if (current !== null) {
        commitDetachRef(current);
      }
    }

    const primaryEffectTag = effectTag & (Placement | Update | Deletion);

    switch (primaryEffectTag) {
      case Placement: {
        commitPlacement(nextEffect);

        nextEffect.effectTag &= ~Placement;

        break;
      }
      case PlacementAndUpdate: {
        commitPlacement(nextEffect);
        nextEffect.effectTag &= ~Placement;

        const _current = nextEffect.alternate;

        commitWork(_current, nextEffect);

        break;
      }
      case Update: {
        const _current3 = nextEffect.alternate;

        commitWork(_current3, nextEffect);

        break;
      }
      case Deletion: {
        commitDeletion(root, nextEffect);

        break;
      }
    }

    recordEffect();
    resetCurrentFiber();
    nextEffect = nextEffect.nextEffect;
  }
}

function commitRoot(root) {
  console.log(['commitRoot'], { root });

  const finishedWork = root.finishedWork;

  if (finishedWork === null) {
    return null;
  }

  root.finishedWork = null;

  if (root === workInProgressRoot) {
    workInProgressRoot = null;
    workInProgress = null;
  }

  let firstEffect;

  if (finishedWork.effectTag > PerformedWork) {
    if (finishedWork.lastEffect !== null) {
      finishedWork.lastEffect.nextEffect = finishedWork;
      firstEffect = finishedWork.firstEffect;
    } else {
      firstEffect = finishedWork;
    }
  } else {
    firstEffect = finishedWork.firstEffect;
  }

  ReactCurrentOwner.current = null;

  prepareForCommit();
  nextEffect = firstEffect;

  nextEffect = firstEffect;

  do {
    commitMutationEffects(root);
  } while (nextEffect !== null);

  resetAfterCommit();

  root.current = finishedWork;

  nextEffect = firstEffect;

  nextEffect = null;

  return null;
}

function finishSyncRender(root) {
  console.log(['finishSyncRender'], { root });
  workInProgressRoot = null;
  commitRoot(root);
}

function performSyncWorkOnRoot(root) {
  console.log(['performSyncWorkOnRoot'], root);

  if (root !== workInProgressRoot) {
    prepareFreshStack(root);
  }

  if (workInProgress !== null) {
    console.log(['reconsilation start']);
    workLoopSync();

    root.finishedWork = root.current.alternate;
    console.log(['reconsilation finished'], performUnitOfWorkCounter);
    performUnitOfWorkCounter = 0;
    finishSyncRender(root);
  }

  return null;
}

function ensureRootIsScheduled(root) {
  console.log(['ensureRootIsScheduled'], { root });

  scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
}

function Scheduler_scheduleCallback(callback) {
  console.log(['Scheduler_scheduleCallback'], { callback });
  callback();
}

let isFlushingSyncQueue = false;
let immediateQueueCallbackNode = null;

function flushSyncCallbackQueueImpl() {
  console.log(['flushSyncCallbackQueueImpl']);

  if (!isFlushingSyncQueue && syncQueue !== null) {
    isFlushingSyncQueue = true;

    let i = 0;

    try {
      const _isSync = true;
      const queue = syncQueue;

      for (; i < queue.length; i++) {
        let callback = queue[i];

        do {
          callback = callback(_isSync);
        } while (callback !== null);
      }

      syncQueue = null;
    } catch (error) {
      if (syncQueue !== null) {
        syncQueue = syncQueue.slice(i + 1);
      }

      Scheduler_scheduleCallback(flushSyncCallbackQueue);

      throw error;
    } finally {
      isFlushingSyncQueue = false;
    }
  }
}

function flushSyncCallbackQueue() {
  console.log(['flushSyncCallbackQueue']);

  immediateQueueCallbackNode = null;

  flushSyncCallbackQueueImpl();
}

function scheduleWork(fiber) {
  console.log(['scheduleUpdateOnFiber'], { fiber });

  const root = markUpdateTimeFromFiberToRoot(fiber);

  if (root === null) {
    return;
  }

  ensureRootIsScheduled(root);

  flushSyncCallbackQueue();
}

function updateContainer(element, container, parentComponent) {
  console.log(['updateContainer'], { element, container, parentComponent });

  const update = createUpdate();

  update.payload = {
    element: element,
  };

  enqueueUpdate(container.current, update);
  scheduleWork(container.current);
}

function render(element, container) {
  console.log(['render'], { element, container });

  const fiberRoot = createFiberRoot(container);

  updateContainer(element, fiberRoot, null);

  return null;
}

const namesToPlugins = {};
let eventPluginOrder = null;
var plugins = [];
const eventNameDispatchConfigs = {};

function publishEventForPlugin(dispatchConfig, pluginModule, eventName) {
  console.log(['publishEventForPlugin'], {
    dispatchConfig,
    pluginModule,
    eventName,
  });
  eventNameDispatchConfigs[eventName] = dispatchConfig;

  const phasedRegistrationNames = dispatchConfig.phasedRegistrationNames;

  if (phasedRegistrationNames) {
    for (const phaseName in phasedRegistrationNames) {
      if (phasedRegistrationNames.hasOwnProperty(phaseName)) {
        const phasedRegistrationName = phasedRegistrationNames[phaseName];

        publishRegistrationName(
          phasedRegistrationName,
          pluginModule,
          eventName,
        );
      }
    }

    return true;
  } else if (dispatchConfig.registrationName) {
    publishRegistrationName(
      dispatchConfig.registrationName,
      pluginModule,
      eventName,
    );

    return true;
  }

  return false;
}

function recomputePluginOrdering() {
  console.log(['recomputePluginOrdering']);

  if (!eventPluginOrder) {
    // Wait until an `eventPluginOrder` is injected.
    return;
  }

  for (const pluginName in namesToPlugins) {
    const pluginModule = namesToPlugins[pluginName];
    const pluginIndex = eventPluginOrder.indexOf(pluginName);

    if (plugins[pluginIndex]) {
      continue;
    }

    plugins[pluginIndex] = pluginModule;

    const publishedEvents = pluginModule.eventTypes;

    for (const eventName in publishedEvents) {
      publishEventForPlugin(
        publishedEvents[eventName],
        pluginModule,
        eventName,
      );
    }
  }
}

function injectEventPluginsByName(injectedNamesToPlugins) {
  console.log(['injectEventPluginsByName'], { injectedNamesToPlugins });

  let isOrderingDirty = false;

  for (const pluginName in injectedNamesToPlugins) {
    if (!injectedNamesToPlugins.hasOwnProperty(pluginName)) {
      continue;
    }

    const pluginModule = injectedNamesToPlugins[pluginName];

    if (
      !namesToPlugins.hasOwnProperty(pluginName) ||
      namesToPlugins[pluginName] !== pluginModule
    ) {
      namesToPlugins[pluginName] = pluginModule;
      isOrderingDirty = true;
    }
  }

  if (isOrderingDirty) {
    recomputePluginOrdering();
  }
}

const simpleEventPluginEventTypes = {};
const topLevelEventsToDispatchConfig = new Map();

function SyntheticEvent(
  dispatchConfig,
  targetInst,
  nativeEvent,
  nativeEventTarget,
) {
  console.log(['SyntheticEvent'], {
    dispatchConfig,
    targetInst,
    nativeEvent,
    nativeEventTarget,
  });

  {
    delete this.nativeEvent;
    delete this.preventDefault;
    delete this.stopPropagation;
    delete this.isDefaultPrevented;
    delete this.isPropagationStopped;
  }

  this.dispatchConfig = dispatchConfig;
  this._targetInst = targetInst;
  this.nativeEvent = nativeEvent;

  const Interface = this.constructor.Interface;

  for (const propName in Interface) {
    if (!Interface.hasOwnProperty(propName)) {
      continue;
    }

    {
      delete this[propName];
    }

    const normalize = Interface[propName];

    if (normalize) {
      this[propName] = normalize(nativeEvent);
    } else {
      if (propName === 'target') {
        this.target = nativeEventTarget;
      } else {
        this[propName] = nativeEvent[propName];
      }
    }
  }

  return this;
}

function getPooledEvent(dispatchConfig, targetInst, nativeEvent, nativeInst) {
  console.log(['getPooledEvent'], {
    dispatchConfig,
    targetInst,
    nativeEvent,
    nativeInst,
  });

  const EventConstructor = this;

  if (EventConstructor.eventPool.length) {
    const instance = EventConstructor.eventPool.pop();

    EventConstructor.call(
      instance,
      dispatchConfig,
      targetInst,
      nativeEvent,
      nativeInst,
    );

    return instance;
  }

  return new EventConstructor(
    dispatchConfig,
    targetInst,
    nativeEvent,
    nativeInst,
  );
}

const EVENT_POOL_SIZE = 10;

function releasePooledEvent(event) {
  console.log(['releasePooledEvent'], { event });

  const EventConstructor = this;

  if (EventConstructor.eventPool.length < EVENT_POOL_SIZE) {
    EventConstructor.eventPool.push(event);
  }
}

function addEventPoolingTo(EventConstructor) {
  console.log(['addEventPoolingTo'], { EventConstructor });
  EventConstructor.eventPool = [];
  EventConstructor.getPooled = getPooledEvent;
  EventConstructor.release = releasePooledEvent;
}

SyntheticEvent.extend = function (Interface) {
  console.log(['SyntheticEvent.extend'], { Interface });

  const Super = this;
  const E = function () {};

  E.prototype = Super.prototype;

  const prototype = new E();

  function Class() {
    return Super.apply(this, arguments);
  }

  Object.assign(prototype, Class.prototype);

  Class.prototype = prototype;
  Class.prototype.constructor = Class;
  Class.Interface = Object.assign({}, Super.Interface, Interface);
  Class.extend = Super.extend;
  addEventPoolingTo(Class);

  return Class;
};

const SyntheticUIEvent = SyntheticEvent.extend({
  view: null,
  detail: null,
});
const SyntheticMouseEvent = SyntheticUIEvent.extend({
  screenX: null,
  screenY: null,
  clientX: null,
  clientY: null,
  pageX: null,
  pageY: null,
  ctrlKey: null,
  shiftKey: null,
  altKey: null,
  metaKey: null,
  button: null,
  buttons: null,
});

function getParent(inst) {
  console.log(['getParent'], { inst });
  do {
    inst = inst.return;
  } while (inst && inst.tag !== HostComponent);

  if (inst) {
    return inst;
  }

  return null;
}

function traverseTwoPhase(inst, fn, arg) {
  console.log(['traverseTwoPhase'], { inst, fn, arg });

  const path = [];

  while (inst) {
    path.push(inst);
    inst = getParent(inst);
  }

  let i;

  for (i = path.length; i-- > 0; ) {
    fn(path[i], 'captured', arg);
  }

  for (i = 0; i < path.length; i++) {
    fn(path[i], 'bubbled', arg);
  }
}

let getFiberCurrentPropsFromNode = null;
let getInstanceFromNode = null;
let getNodeFromInstance = null;

function getNodeFromInstance$1(inst) {
  console.log(['getNodeFromInstance$1'], { inst });

  if (inst.tag === HostComponent || inst.tag === HostText) {
    return inst.stateNode;
  }
}

function getFiberCurrentPropsFromNode$1(node) {
  console.log(['getFiberCurrentPropsFromNode$1'], { node });

  return node[internalEventHandlersKey] || null;
}

function setComponentTree(
  getFiberCurrentPropsFromNodeImpl,
  getInstanceFromNodeImpl,
  getNodeFromInstanceImpl,
) {
  console.log(['setComponentTree'], {
    getFiberCurrentPropsFromNodeImpl,
    getInstanceFromNodeImpl,
    getNodeFromInstanceImpl,
  });
  getFiberCurrentPropsFromNode = getFiberCurrentPropsFromNodeImpl;
  getInstanceFromNode = null;
  getNodeFromInstance = getNodeFromInstanceImpl;
}

setComponentTree(
  getFiberCurrentPropsFromNode$1,
  () => {},
  getNodeFromInstance$1,
);

function getListener(inst, registrationName) {
  console.log(['getListener'], { inst, registrationName });

  let listener;
  const stateNode = inst.stateNode;

  if (!stateNode) {
    return null;
  }

  const props = getFiberCurrentPropsFromNode(stateNode);

  if (!props) {
    return null;
  }

  listener = props[registrationName];

  return listener;
}

function listenerAtPhase(inst, event, propagationPhase) {
  console.log(['listenerAtPhase'], { inst, event, propagationPhase });

  const registrationName =
    event.dispatchConfig.phasedRegistrationNames[propagationPhase];

  return getListener(inst, registrationName);
}

function accumulateDirectionalDispatches(inst, phase, event) {
  console.log(['accumulateDirectionalDispatches']);

  const listener = listenerAtPhase(inst, event, phase);

  if (listener) {
    event._dispatchListeners = accumulateInto(
      event._dispatchListeners,
      listener,
    );
    event._dispatchInstances = accumulateInto(event._dispatchInstances, inst);
  }
}

function accumulateTwoPhaseDispatchesSingle(event) {
  console.log(['accumulateTwoPhaseDispatchesSingle'], { event });

  if (event && event.dispatchConfig.phasedRegistrationNames) {
    traverseTwoPhase(event._targetInst, accumulateDirectionalDispatches, event);
  }
}

function accumulateTwoPhaseDispatches(events) {
  console.log(['accumulateTwoPhaseDispatches'], { events });
  forEachAccumulated(events, accumulateTwoPhaseDispatchesSingle);
}

const SimpleEventPlugin = {
  eventTypes: simpleEventPluginEventTypes,
  extractEvents: function (
    topLevelType,
    targetInst,
    nativeEvent,
    nativeEventTarget,
  ) {
    const dispatchConfig = topLevelEventsToDispatchConfig.get(topLevelType);

    if (!dispatchConfig) {
      return null;
    }

    let EventConstructor;

    EventConstructor = SyntheticMouseEvent;

    const event = EventConstructor.getPooled(
      dispatchConfig,
      targetInst,
      nativeEvent,
      nativeEventTarget,
    );

    accumulateTwoPhaseDispatches(event);

    return event;
  },
};

function injectEventPluginOrder(injectedEventPluginOrder) {
  console.log(['injectEventPluginOrder'], { injectedEventPluginOrder });
  eventPluginOrder = Array.prototype.slice.call(injectedEventPluginOrder);
  recomputePluginOrdering();
}

const DOMEventPluginOrder = ['SimpleEventPlugin'];
const eventPriorities = new Map();

function processSimpleEventPluginPairsByPriority(eventTypes, priority) {
  console.log(['processSimpleEventPluginPairsByPriority'], {
    eventTypes,
    priority,
  });

  for (let i = 0; i < eventTypes.length; i += 2) {
    const topEvent = eventTypes[i];
    const event = eventTypes[i + 1];
    const capitalizedEvent = event[0].toUpperCase() + event.slice(1);
    const onEvent = 'on' + capitalizedEvent;
    const config = {
      phasedRegistrationNames: {
        bubbled: onEvent,
        captured: onEvent + 'Capture',
      },
      dependencies: [topEvent],
      eventPriority: priority,
    };

    eventPriorities.set(topEvent, priority);
    topLevelEventsToDispatchConfig.set(topEvent, config);
    simpleEventPluginEventTypes[event] = config;
  }
}

const DiscreteEvent = 0;

function unsafeCastStringToDOMTopLevelType(topLevelType) {
  console.log(['unsafeCastStringToDOMTopLevelType'], { topLevelType });

  return topLevelType;
}

const TOP_CLICK = unsafeCastStringToDOMTopLevelType('click');
const discreteEventPairsForSimpleEventPlugin = [TOP_CLICK, 'click'];
try {
  processSimpleEventPluginPairsByPriority(
    discreteEventPairsForSimpleEventPlugin,
    DiscreteEvent,
  );
  injectEventPluginsByName({
    SimpleEventPlugin: SimpleEventPlugin,
  });
  injectEventPluginOrder(DOMEventPluginOrder);
} catch (e) {
  console.error(['error'], e.toString());
}
const OwnReact = {
  createElement,
  render,
  useState,
};

export default OwnReact;
