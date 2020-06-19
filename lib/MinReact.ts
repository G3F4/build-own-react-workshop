const topLevelFunctionsCallRegister = {};
const missingNamesInRegister = [];
const topLevelFunctionsRegister = [];

window.topLevelFunctionsCallRegister = topLevelFunctionsCallRegister;
window.missingNamesInRegister = missingNamesInRegister;
window.topLevelFunctionsRegister = topLevelFunctionsRegister;

window.noCalls = function () {
  return topLevelFunctionsRegister.filter(
    (key) => !topLevelFunctionsCallRegister[key],
  );
};

function logFuncUsage(...args) {
  const [[name]] = args;

  if (topLevelFunctionsRegister.includes(name)) {
    if (topLevelFunctionsCallRegister[name]) {
      topLevelFunctionsCallRegister[name]++;
    } else {
      topLevelFunctionsCallRegister[name] = 1;
    }
  } else {
    missingNamesInRegister.push(name);

    if (topLevelFunctionsCallRegister[name]) {
      topLevelFunctionsCallRegister[name]++;
    } else {
      topLevelFunctionsCallRegister[name] = 1;
    }
  }

  // console.log(...args);
}

const NO_CONTEXT = {};
const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
const MATH_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const TEXT_NODE = 3;
const DOCUMENT_NODE = 9;
const DOCUMENT_FRAGMENT_NODE = 11;
const UpdateState = 0;
const NoEffect = 0;
const PerformedWork = 1;
const Placement = 2;
const Update = 4;
const PlacementAndUpdate = 6;
const Deletion = 8;
const Incomplete = 2048;
const FunctionComponent = 0;
const IndeterminateComponent = 2;
const HostRoot = 3;
const HostComponent = 5;
const HostText = 6;
let currentlyRenderingFiber$1 = null;
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
const DiscreteEvent = 0;
let hasForceUpdate = false;
let currentlyProcessingQueue;
let isRendering = false;
const ContextOnlyDispatcher = {
  useState: null,
};
const EVENT_POOL_SIZE = 10;
let _enabled = true;
const DOMEventPluginOrder = ['SimpleEventPlugin'];
const eventPriorities = new Map();
const randomKey = Math.random().toString(36).slice(2);
const internalInstanceKey = '__reactInternalInstance$' + randomKey;
const internalEventHandlersKey = '__reactEventHandlers$' + randomKey;
const REACT_ELEMENT_TYPE = Symbol.for('react.element');
const PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map; // prettier-ignore
const elementListenerMap = new PossiblyWeakMap();
let getFiberCurrentPropsFromNode = null;
let getInstanceFromNode = null;
let getNodeFromInstance = null;
const namesToPlugins = {};
let eventPluginOrder = null;
const plugins = [];
const eventNameDispatchConfigs = {};
let eventsEnabled = null;
let selectionInformation = null;
const valueStack = [];
const fiberStack = [];
let index = -1;
let syncQueue = null;
const simpleEventPluginEventTypes = {};
const topLevelEventsToDispatchConfig = new Map();
let workInProgressRoot = null; // The root we're working on
let workInProgress = null; // The fiber we're working on
const PLUGIN_EVENT_SYSTEM = 1;
const registrationNameDependencies = {};
const CALLBACK_BOOKKEEPING_POOL_SIZE = 10;
const callbackBookkeepingPool = [];
const IS_FIRST_ANCESTOR = 1 << 6;
let eventQueue = null;
const registrationNameModules = {};
const HTML$1 = '__html';
const STYLE = 'style';
const isArray$1 = Array.isArray;
let performUnitOfWorkCounter = 0;
let nextEffect = null;
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
let immediateQueueCallbackNode = null;
let isBatchingEventUpdates = false;

topLevelFunctionsRegister.push('useState');

function useState(initialState) {
  logFuncUsage(['useState'], { initialState });

  return ReactCurrentDispatcher.current.useState(initialState);
}

topLevelFunctionsRegister.push('ReactElement');

function ReactElement(type, props) {
  logFuncUsage(['ReactElement'], { type, props });

  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type: type,
    props: props,
  };
}

topLevelFunctionsRegister.push('createElement');

function createElement(type, config, children) {
  logFuncUsage(['createElement'], { type, config, children });

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

  return ReactElement(type, props);
}

topLevelFunctionsRegister.push('FiberNode');

function FiberNode(tag, pendingProps, key) {
  logFuncUsage(['FiberNode'], { tag, pendingProps, key });
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

topLevelFunctionsRegister.push('createFiber');

function createFiber(tag, pendingProps, key) {
  logFuncUsage(['createFiber'], { tag, pendingProps, key });

  return new FiberNode(tag, pendingProps, key);
}

topLevelFunctionsRegister.push('createFiberRoot');

function createFiberRoot(containerInfo) {
  logFuncUsage(['createFiberRoot'], { containerInfo });

  const current = createFiber(HostRoot, null, null);
  const root = {
    current,
    finishedWork: null,
    containerInfo: containerInfo,
  };

  current.stateNode = root;
  current.updateQueue = {
    shared: {
      pending: null,
    },
    // baseState: null,
    // baseQueue: null,
    // effects: null,
  };

  return root;
}

topLevelFunctionsRegister.push('createUpdate');

function createUpdate() {
  logFuncUsage(['createUpdate']);

  const update = {
    tag: UpdateState,
    payload: null,
    callback: null,
    next: null,
  };

  update.next = update;

  return update;
}

topLevelFunctionsRegister.push('enqueueUpdate');

function enqueueUpdate(fiber, update) {
  logFuncUsage(['enqueueUpdate'], { fiber, update });

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

topLevelFunctionsRegister.push('markUpdateTimeFromFiberToRoot');

function markUpdateTimeFromFiberToRoot(fiber) {
  logFuncUsage(['markUpdateTimeFromFiberToRoot'], { fiber });

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

topLevelFunctionsRegister.push('scheduleSyncCallback');

function scheduleSyncCallback(callback) {
  logFuncUsage(['scheduleSyncCallback'], { callback });

  if (syncQueue === null) {
    syncQueue = [callback];
  } else {
    syncQueue.push(callback);
  }
}

topLevelFunctionsRegister.push('createWorkInProgress');

function createWorkInProgress(current, pendingProps) {
  logFuncUsage(['createWorkInProgress'], { current, pendingProps });

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

topLevelFunctionsRegister.push('prepareFreshStack');

function prepareFreshStack(root) {
  logFuncUsage(['prepareFreshStack'], { root });
  root.finishedWork = null;

  workInProgressRoot = root;
  workInProgress = createWorkInProgress(root.current, null);
}

topLevelFunctionsRegister.push('pop');

function pop(cursor) {
  logFuncUsage(['pop'], { cursor });
  cursor.current = valueStack[index];
  valueStack[index] = null;

  {
    fiberStack[index] = null;
  }

  index--;
}

topLevelFunctionsRegister.push('push');

function push(cursor, value, fiber) {
  logFuncUsage(['push'], { cursor, value, fiber });
  index++;
  valueStack[index] = cursor.current;

  {
    fiberStack[index] = fiber;
  }

  cursor.current = value;
}

topLevelFunctionsRegister.push('getIntrinsicNamespace');

function getIntrinsicNamespace(type) {
  logFuncUsage(['getIntrinsicNamespace'], { type });

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

topLevelFunctionsRegister.push('pushHostContainer');

function pushHostContainer(fiber, nextRootInstance) {
  logFuncUsage(['pushHostContainer'], { fiber, nextRootInstance });
  push(rootInstanceStackCursor, nextRootInstance, fiber);

  const nextRootContext = {
    namespace: HTML_NAMESPACE,
    ancestorInfo: '',
  };

  pop(contextStackCursor$1);
  push(contextStackCursor$1, nextRootContext, fiber);
}

topLevelFunctionsRegister.push('getStateFromUpdate');

function getStateFromUpdate(
  workInProgress,
  queue,
  update,
  prevState,
  nextProps,
  instance,
) {
  logFuncUsage(['getStateFromUpdate'], {
    workInProgress,
    queue,
    update,
    prevState,
    nextProps,
    instance,
  });

  return Object.assign({}, prevState, update.payload);
}

topLevelFunctionsRegister.push('processUpdateQueue');

function processUpdateQueue(workInProgress, props, instance) {
  logFuncUsage(['processUpdateQueue'], { workInProgress, props, instance });

  const queue = workInProgress.updateQueue;

  hasForceUpdate = false;

  let baseQueue = queue.baseQueue;
  let pendingQueue = queue.shared.pending;

  if (pendingQueue !== null) {
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
    const newBaseQueueLast = null;

    if (first !== null) {
      let update = first;

      do {
        newState = getStateFromUpdate(
          workInProgress,
          queue,
          update,
          newState,
          props,
          instance,
        );

        update = update.next;

        if (update === null || update === first) {
          pendingQueue = queue.shared.pending;

          break;
        }
      } while (true);
    }

    newBaseState = newState;

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

topLevelFunctionsRegister.push('reconcileChildren');

function reconcileChildren(current, workInProgress, nextChildren) {
  logFuncUsage(['reconcileChildren'], {
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

topLevelFunctionsRegister.push('updateHostRoot');

function updateHostRoot(current, workInProgress) {
  logFuncUsage(['updateHostRoot'], {
    current,
    workInProgress,
  });
  pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);

  const nextProps = workInProgress.pendingProps;

  processUpdateQueue(workInProgress, nextProps, null);

  const nextChildren = workInProgress.memoizedState.element;

  reconcileChildren(current, workInProgress, nextChildren);

  return workInProgress.child;
}

topLevelFunctionsRegister.push('mountWorkInProgressHook');

function mountWorkInProgressHook() {
  logFuncUsage(['mountWorkInProgressHook']);

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

topLevelFunctionsRegister.push('dispatchAction');

function dispatchAction(fiber, queue, action) {
  logFuncUsage(['dispatchAction'], { fiber, queue, action });

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

topLevelFunctionsRegister.push('mountState');

function mountState(initialState) {
  logFuncUsage(['mountState'], { initialState });

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
  topLevelFunctionsRegister.push('HooksDispatcherOnMountInDEV.useState');
  HooksDispatcherOnMountInDEV = {
    useState: function (initialState) {
      logFuncUsage(['HooksDispatcherOnMountInDEV.useState'], { initialState });
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
  topLevelFunctionsRegister.push('HooksDispatcherOnUpdateInDEV.useState');
  HooksDispatcherOnUpdateInDEV = {
    useState: function (initialState) {
      logFuncUsage(['HooksDispatcherOnUpdateInDEV.useState'], { initialState });
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

topLevelFunctionsRegister.push('updateWorkInProgressHook');

function updateWorkInProgressHook() {
  logFuncUsage(['updateWorkInProgressHook']);

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

topLevelFunctionsRegister.push('updateReducer');

function updateReducer(reducer) {
  logFuncUsage(['updateReducer'], { reducer });

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

topLevelFunctionsRegister.push('updateState');

function updateState() {
  logFuncUsage(['updateState']);

  return updateReducer(basicStateReducer);
}

function basicStateReducer(state, action) {
  logFuncUsage(['basicStateReducer'], { state, action });

  return typeof action === 'function' ? action(state) : action;
}

topLevelFunctionsRegister.push('renderWithHooks');

function renderWithHooks(current, workInProgress, Component, props, secondArg) {
  logFuncUsage(['renderWithHooks'], {
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

topLevelFunctionsRegister.push('mountIndeterminateComponent');

function mountIndeterminateComponent(_current, workInProgress, Component) {
  logFuncUsage(['mountIndeterminateComponent'], {
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

topLevelFunctionsRegister.push('updateHostComponent');

function updateHostComponent(current, workInProgress) {
  logFuncUsage(['updateHostComponent'], { current, workInProgress });
  reconcileChildren(
    current,
    workInProgress,
    workInProgress.pendingProps.children,
  );

  return workInProgress.child;
}

topLevelFunctionsRegister.push('updateFunctionComponent');

function updateFunctionComponent(
  current,
  workInProgress,
  Component,
  nextProps,
) {
  logFuncUsage(['updateFunctionComponent'], {
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

topLevelFunctionsRegister.push('beginWork');

function beginWork(current, workInProgress) {
  logFuncUsage(['beginWork'], { current, workInProgress });

  switch (workInProgress.tag) {
    case IndeterminateComponent: {
      return mountIndeterminateComponent(
        current,
        workInProgress,
        workInProgress.type,
      );
    }
    case FunctionComponent: {
      return updateFunctionComponent(
        current,
        workInProgress,
        workInProgress.type,
        workInProgress.pendingProps,
      );
    }
    case HostRoot: {
      return updateHostRoot(current, workInProgress);
    }
    case HostComponent: {
      return updateHostComponent(current, workInProgress);
    }
  }
}

topLevelFunctionsRegister.push('precacheFiberNode');

function precacheFiberNode(hostInst, node) {
  logFuncUsage(['precacheFiberNode'], { hostInst, node });
  node[internalInstanceKey] = hostInst;
}

topLevelFunctionsRegister.push('updateFiberProps');

function updateFiberProps(node, props) {
  logFuncUsage(['updateFiberProps'], { node, props });
  node[internalEventHandlersKey] = props;
}

topLevelFunctionsRegister.push('getOwnerDocumentFromRootContainer');

function getOwnerDocumentFromRootContainer(rootContainerElement) {
  logFuncUsage(['getOwnerDocumentFromRootContainer'], { rootContainerElement });

  return rootContainerElement.nodeType === DOCUMENT_NODE
    ? rootContainerElement
    : rootContainerElement.ownerDocument;
}

topLevelFunctionsRegister.push('createInstance');

function createInstance(
  type,
  props,
  rootContainerInstance,
  hostContext,
  internalInstanceHandle,
) {
  console.log(['createInstance'], type)
  logFuncUsage(['createInstance'], {
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

    if (namespaceURI === HTML_NAMESPACE) {
      namespaceURI = getIntrinsicNamespace(type);
    }

    if (namespaceURI === HTML_NAMESPACE) {
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

topLevelFunctionsRegister.push('createCursor');

function createCursor(defaultValue) {
  logFuncUsage(['createCursor'], { defaultValue });

  return {
    current: defaultValue,
  };
}

const rootInstanceStackCursor = createCursor(NO_CONTEXT);

topLevelFunctionsRegister.push('appendInitialChild');

function appendInitialChild(parentInstance, child) {
  logFuncUsage(['appendInitialChild'], { parentInstance, child });
  parentInstance.appendChild(child);
}

topLevelFunctionsRegister.push('getRootHostContainer');

function getRootHostContainer() {
  logFuncUsage(['getRootHostContainer']);

  return rootInstanceStackCursor.current;
}

topLevelFunctionsRegister.push('diffProperties');

function diffProperties(
  domElement,
  tag,
  lastRawProps,
  nextRawProps,
  rootContainerElement,
) {
  logFuncUsage(['diffProperties'], {
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

topLevelFunctionsRegister.push('prepareUpdate');

function prepareUpdate(
  domElement,
  type,
  oldProps,
  newProps,
  rootContainerInstance,
) {
  logFuncUsage(['prepareUpdate'], {
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
  topLevelFunctionsRegister.push('appendAllChildren');
  appendAllChildren = function (parent, workInProgress) {
    logFuncUsage(['appendAllChildren'], { parent, workInProgress });

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
  topLevelFunctionsRegister.push('updateHostComponent$1');
  updateHostComponent$1 = function (
    current,
    workInProgress,
    type,
    newProps,
    rootContainerInstance,
  ) {
    logFuncUsage(['updateHostComponent$1'], {
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

topLevelFunctionsRegister.push('isCustomComponent');

function isCustomComponent(tagName, props) {
  logFuncUsage(['isCustomComponent'], { tagName, props });

  if (tagName.indexOf('-') === -1) {
    return typeof props.is === 'string';
  }

  return true;
}

topLevelFunctionsRegister.push('publishRegistrationName');

function publishRegistrationName(registrationName, pluginModule, eventName) {
  logFuncUsage(['publishRegistrationName']);
  registrationNameModules[registrationName] = pluginModule;
  registrationNameDependencies[registrationName] =
    pluginModule.eventTypes[eventName].dependencies;
}

topLevelFunctionsRegister.push('getListenerMapForElement');

function getListenerMapForElement(element) {
  logFuncUsage(['getListenerMapForElement'], { element });

  let listenerMap = elementListenerMap.get(element);

  if (listenerMap === undefined) {
    listenerMap = new Map();
    elementListenerMap.set(element, listenerMap);
  }

  return listenerMap;
}

topLevelFunctionsRegister.push('getTopLevelCallbackBookKeeping');

function getTopLevelCallbackBookKeeping(
  topLevelType,
  nativeEvent,
  targetInst,
  eventSystemFlags,
) {
  logFuncUsage(['getTopLevelCallbackBookKeeping'], {
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

topLevelFunctionsRegister.push('releaseTopLevelCallbackBookKeeping');

function releaseTopLevelCallbackBookKeeping(instance) {
  logFuncUsage(['releaseTopLevelCallbackBookKeeping'], { instance });
  instance.topLevelType = null;
  instance.nativeEvent = null;
  instance.targetInst = null;
  instance.ancestors.length = 0;

  if (callbackBookkeepingPool.length < CALLBACK_BOOKKEEPING_POOL_SIZE) {
    callbackBookkeepingPool.push(instance);
  }
}

topLevelFunctionsRegister.push('batchedUpdatesImpl');

const batchedUpdatesImpl = function (fn, bookkeeping) {
  logFuncUsage(['batchedUpdatesImpl'], { fn, bookkeeping });

  return fn(bookkeeping);
};
const batchedEventUpdatesImpl = batchedUpdatesImpl;

topLevelFunctionsRegister.push('batchedEventUpdates');

function batchedEventUpdates(fn, a, b) {
  logFuncUsage(['batchedEventUpdates'], { fn, a, b });

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

topLevelFunctionsRegister.push('findRootContainerNode');

function findRootContainerNode(inst) {
  logFuncUsage(['findRootContainerNode'], { inst });

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

topLevelFunctionsRegister.push('executeDispatch');

function executeDispatch(event, listener, inst) {
  logFuncUsage(['executeDispatch'], { event, listener, inst });
  event.currentTarget = getNodeFromInstance(inst);
  listener(undefined, event);
  event.currentTarget = null;
}

topLevelFunctionsRegister.push('executeDispatchesInOrder');

function executeDispatchesInOrder(event) {
  logFuncUsage(['executeDispatchesInOrder'], { event });

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

topLevelFunctionsRegister.push('executeDispatchesAndRelease');

const executeDispatchesAndRelease = function (event) {
  logFuncUsage(['executeDispatchesAndRelease'], {
    executeDispatchesAndRelease,
  });

  if (event) {
    executeDispatchesInOrder(event);

    event.constructor.release(event);
  }
};

topLevelFunctionsRegister.push('executeDispatchesAndReleaseTopLevel');

const executeDispatchesAndReleaseTopLevel = function (e) {
  logFuncUsage(['executeDispatchesAndReleaseTopLevel'], { e });

  return executeDispatchesAndRelease(e);
};

topLevelFunctionsRegister.push('accumulateInto');

function accumulateInto(current, next) {
  logFuncUsage(['accumulateInto'], { current, next });

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

topLevelFunctionsRegister.push('forEachAccumulated');

function forEachAccumulated(arr, cb) {
  logFuncUsage(['forEachAccumulated'], { arr, cb });
  cb(arr);
}

topLevelFunctionsRegister.push('runEventsInBatch');

function runEventsInBatch(events) {
  logFuncUsage(['runEventsInBatch'], { events });

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

topLevelFunctionsRegister.push('extractPluginEvents');

function extractPluginEvents(
  topLevelType,
  targetInst,
  nativeEvent,
  nativeEventTarget,
  eventSystemFlags,
) {
  logFuncUsage(['extractPluginEvents'], {
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

topLevelFunctionsRegister.push('runExtractedPluginEventsInBatch');

function runExtractedPluginEventsInBatch(
  topLevelType,
  targetInst,
  nativeEvent,
  nativeEventTarget,
  eventSystemFlags,
) {
  logFuncUsage(['runExtractedPluginEventsInBatch'], {
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

topLevelFunctionsRegister.push('handleTopLevel');

function handleTopLevel(bookKeeping) {
  logFuncUsage(['handleTopLevel'], { bookKeeping });

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

topLevelFunctionsRegister.push('dispatchEventForLegacyPluginEventSystem');

function dispatchEventForLegacyPluginEventSystem(
  topLevelType,
  eventSystemFlags,
  nativeEvent,
  targetInst,
) {
  logFuncUsage(['dispatchEventForLegacyPluginEventSystem'], {
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
  logFuncUsage(['addEventBubbleListener'], { element, eventType, listener });
  element.addEventListener(eventType, listener, false);
}

topLevelFunctionsRegister.push('getClosestInstanceFromNode');

function getClosestInstanceFromNode(targetNode) {
  logFuncUsage(['getClosestInstanceFromNode'], { targetNode });

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

topLevelFunctionsRegister.push('getEventTarget');

function getEventTarget(nativeEvent) {
  logFuncUsage(['getEventTarget'], { nativeEvent });

  let target = nativeEvent.target || nativeEvent.srcElement || window;

  if (target.correspondingUseElement) {
    target = target.correspondingUseElement;
  }

  return target.nodeType === TEXT_NODE ? target.parentNode : target;
}

topLevelFunctionsRegister.push('attemptToDispatchEvent');

function attemptToDispatchEvent(
  topLevelType,
  eventSystemFlags,
  container,
  nativeEvent,
) {
  logFuncUsage(['attemptToDispatchEvent'], {
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

topLevelFunctionsRegister.push('dispatchEvent');

function dispatchEvent(topLevelType, eventSystemFlags, container, nativeEvent) {
  logFuncUsage(['dispatchEvent']);
  attemptToDispatchEvent(
    topLevelType,
    eventSystemFlags,
    container,
    nativeEvent,
  );
}

topLevelFunctionsRegister.push('trapEventForPluginEventSystem');

function trapEventForPluginEventSystem(container, topLevelType) {
  logFuncUsage(['trapEventForPluginEventSystem'], { container, topLevelType });

  let listener;

  listener = dispatchEvent.bind(
    null,
    topLevelType,
    PLUGIN_EVENT_SYSTEM,
    container,
  );

  addEventBubbleListener(container, topLevelType, listener);
}

topLevelFunctionsRegister.push('trapBubbledEvent');

function trapBubbledEvent(topLevelType, element) {
  logFuncUsage(['trapBubbledEvent'], { topLevelType, element });
  trapEventForPluginEventSystem(element, topLevelType, false);
}

topLevelFunctionsRegister.push('legacyListenToTopLevelEvent');

function legacyListenToTopLevelEvent(topLevelType, mountAt, listenerMap) {
  logFuncUsage(['legacyListenToTopLevelEvent'], {
    topLevelType,
    mountAt,
    listenerMap,
  });

  if (!listenerMap.has(topLevelType)) {
    trapBubbledEvent(topLevelType, mountAt);
    listenerMap.set(topLevelType, null);
  }
}

topLevelFunctionsRegister.push('legacyListenToEvent');

function legacyListenToEvent(registrationName, mountAt) {
  logFuncUsage(['legacyListenToEvent'], { registrationName, mountAt });

  const listenerMap = getListenerMapForElement(mountAt);
  const dependencies = registrationNameDependencies[registrationName];

  for (let i = 0; i < dependencies.length; i++) {
    const dependency = dependencies[i];

    legacyListenToTopLevelEvent(dependency, mountAt, listenerMap);
  }
}

topLevelFunctionsRegister.push('ensureListeningTo');

function ensureListeningTo(rootContainerElement, registrationName) {
  logFuncUsage(['ensureListeningTo'], {
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

topLevelFunctionsRegister.push('setInitialDOMProperties');

function setInitialDOMProperties(
  tag,
  domElement,
  rootContainerElement,
  nextProps,
  isCustomComponentTag,
) {
  logFuncUsage(['setInitialDOMProperties'], {
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
      setValueForStyles(domElement, nextProp);
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
    }
  }
}

topLevelFunctionsRegister.push('setInitialProperties');

function setInitialProperties(domElement, tag, rawProps, rootContainerElement) {
  logFuncUsage(['setInitialProperties'], {
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

topLevelFunctionsRegister.push('shouldAutoFocusHostComponent');

function shouldAutoFocusHostComponent(type, props) {
  logFuncUsage(['shouldAutoFocusHostComponent'], { type, props });

  switch (type) {
    case 'button':
    case 'input':
    case 'select':
    case 'textarea':
      return !!props.autoFocus;
  }

  return false;
}

topLevelFunctionsRegister.push('finalizeInitialChildren');

function finalizeInitialChildren(
  domElement,
  type,
  props,
  rootContainerInstance,
) {
  logFuncUsage(['finalizeInitialChildren'], {
    domElement,
    type,
    props,
    rootContainerInstance,
  });
  setInitialProperties(domElement, type, props, rootContainerInstance);

  return shouldAutoFocusHostComponent(type, props);
}

topLevelFunctionsRegister.push('markUpdate');

function markUpdate(workInProgress) {
  logFuncUsage(['markUpdate'], { workInProgress });
  workInProgress.effectTag |= Update;
}

topLevelFunctionsRegister.push('completeWork');

function completeWork(current, workInProgress) {
  logFuncUsage(['completeWork'], { current, workInProgress });

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

topLevelFunctionsRegister.push('createFiberFromTypeAndProps');

function createFiberFromTypeAndProps(type, key, pendingProps, owner, mode) {
  logFuncUsage(['createFiberFromTypeAndProps'], {
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

topLevelFunctionsRegister.push('createFiberFromElement');

function createFiberFromElement(element) {
  logFuncUsage(['createFiberFromElement'], { element });

  const type = element.type;
  const key = element.key;
  const pendingProps = element.props;

  return createFiberFromTypeAndProps(type, key, pendingProps, null);
}

topLevelFunctionsRegister.push('ChildReconciler');

function ChildReconciler(shouldTrackSideEffects) {
  logFuncUsage(['ChildReconciler'], { shouldTrackSideEffects });
  topLevelFunctionsRegister.push('deleteChild');

  function deleteChild(returnFiber, childToDelete) {
    logFuncUsage(['deleteChild'], { returnFiber, childToDelete });

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

  topLevelFunctionsRegister.push('deleteRemainingChildren');

  function deleteRemainingChildren(returnFiber, currentFirstChild) {
    logFuncUsage(['deleteRemainingChildren'], currentFirstChild);

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

  topLevelFunctionsRegister.push('mapRemainingChildren');

  function mapRemainingChildren(returnFiber, currentFirstChild) {
    logFuncUsage(['mapRemainingChildren'], { returnFiber, currentFirstChild });

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

  topLevelFunctionsRegister.push('useFiber');

  function useFiber(fiber, pendingProps) {
    logFuncUsage(['useFiber'], { fiber, pendingProps });

    const clone = createWorkInProgress(fiber, pendingProps);

    clone.index = 0;
    clone.sibling = null;

    return clone;
  }

  topLevelFunctionsRegister.push('placeChild');

  function placeChild(newFiber, lastPlacedIndex, newIndex) {
    logFuncUsage(['placeChild'], { newFiber, lastPlacedIndex, newIndex });
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

  topLevelFunctionsRegister.push('placeSingleChild');

  function placeSingleChild(newFiber) {
    logFuncUsage(['placeSingleChild'], { newFiber });

    if (shouldTrackSideEffects && newFiber.alternate === null) {
      newFiber.effectTag = Placement;
    }

    return newFiber;
  }

  topLevelFunctionsRegister.push('updateElement');

  function updateElement(returnFiber, current, element) {
    logFuncUsage(['updateElement'], { returnFiber, current, element });

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

  topLevelFunctionsRegister.push('updateSlot');

  function updateSlot(returnFiber, oldFiber, newChild) {
    logFuncUsage(['updateSlot'], {
      returnFiber,
      oldFiber,
      newChild,
    });

    const key = oldFiber !== null ? oldFiber.key : null;

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

  topLevelFunctionsRegister.push('updateFromMap');

  function updateFromMap(existingChildren, returnFiber, newIdx, newChild) {
    logFuncUsage(['updateFromMap'], {
      existingChildren,
      returnFiber,
      newIdx,
      newChild,
    });

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

  topLevelFunctionsRegister.push('reconcileChildrenArray');

  function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
    logFuncUsage(['reconcileChildrenArray'], {
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

  topLevelFunctionsRegister.push('reconcileSingleElement');

  function reconcileSingleElement(returnFiber, currentFirstChild, element) {
    logFuncUsage(['reconcileSingleElement'], {
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
    logFuncUsage(['reconcileChildFibers'], {
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

topLevelFunctionsRegister.push('completeUnitOfWork');

function completeUnitOfWork(unitOfWork) {
  logFuncUsage(['completeUnitOfWork'], { unitOfWork });
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

topLevelFunctionsRegister.push('performUnitOfWork');

function performUnitOfWork(unitOfWork) {
  logFuncUsage(['performUnitOfWork'], performUnitOfWorkCounter, { unitOfWork });
  console.log(['performUnitOfWork'], performUnitOfWorkCounter, { unitOfWork });
  performUnitOfWorkCounter++;

  let next;

  next = beginWork(unitOfWork.alternate, unitOfWork);

  unitOfWork.memoizedProps = unitOfWork.pendingProps;

  logFuncUsage(['performUnitOfWork.next'], next);

  if (next === null) {
    next = completeUnitOfWork(unitOfWork);
  }

  ReactCurrentOwner.current = null;

  return next;
}

topLevelFunctionsRegister.push('getActiveElement');

function getActiveElement() {
  logFuncUsage(['getActiveElement']);

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

topLevelFunctionsRegister.push('getSelectionInformation');

function getSelectionInformation() {
  logFuncUsage(['getSelectionInformation']);

  const focusedElem = getActiveElement();

  return {
    activeElementDetached: null,
    focusedElem: focusedElem,
    selectionRange: null,
  };
}

topLevelFunctionsRegister.push('workLoopSync');

function workLoopSync() {
  logFuncUsage(['workLoopSync']);

  while (workInProgress !== null) {
    const work = performUnitOfWork(workInProgress);

    workInProgress = work;
  }
}

topLevelFunctionsRegister.push('isEnabled');

function isEnabled() {
  logFuncUsage(['isEnabled']);

  return _enabled;
}

topLevelFunctionsRegister.push('setEnabled');

function setEnabled(enabled) {
  logFuncUsage(['setEnabled'], { enabled });
  _enabled = !!enabled;
}

topLevelFunctionsRegister.push('prepareForCommit');

function prepareForCommit() {
  logFuncUsage(['prepareForCommit']);
  eventsEnabled = isEnabled();
  selectionInformation = getSelectionInformation();
  setEnabled(false);
}

topLevelFunctionsRegister.push('resetAfterCommit');

function resetAfterCommit() {
  logFuncUsage(['resetAfterCommit']);
  setEnabled(eventsEnabled);
  eventsEnabled = null;

  selectionInformation = null;
}

topLevelFunctionsRegister.push('isHostParent');

function isHostParent(fiber) {
  logFuncUsage(['isHostParent'], { fiber });

  return fiber.tag === HostComponent || fiber.tag === HostRoot;
}

topLevelFunctionsRegister.push('getHostParentFiber');

function getHostParentFiber(fiber) {
  logFuncUsage(['getHostParentFiber'], { fiber });

  let parent = fiber.return;

  while (parent !== null) {
    if (isHostParent(parent)) {
      return parent;
    }

    parent = parent.return;
  }
}

topLevelFunctionsRegister.push('getHostSibling');

function getHostSibling(fiber) {
  logFuncUsage(['getHostSibling'], { fiber });

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

topLevelFunctionsRegister.push('insertOrAppendPlacementNodeIntoContainer');

function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
  logFuncUsage(['insertOrAppendPlacementNodeIntoContainer'], {
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

topLevelFunctionsRegister.push('appendChild');

function appendChild(parentInstance, child) {
  logFuncUsage(['appendChild'], { parentInstance, child });
  parentInstance.appendChild(child);
}

topLevelFunctionsRegister.push('insertOrAppendPlacementNode');

function insertOrAppendPlacementNode(node, before, parent) {
  logFuncUsage(['insertOrAppendPlacementNode'], { node, before, parent });

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

topLevelFunctionsRegister.push('commitPlacement');

function commitPlacement(finishedWork) {
  logFuncUsage(['commitPlacement'], { finishedWork });

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

topLevelFunctionsRegister.push('dangerousStyleValue');

function dangerousStyleValue(name, value, isCustomProperty) {
  logFuncUsage(['dangerousStyleValue'], { name, value, isCustomProperty });

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

topLevelFunctionsRegister.push('setValueForStyles');

function setValueForStyles(node, styles) {
  console.log(['setValueForStyles'], { node, styles });
  logFuncUsage(['setValueForStyles'], { node, styles });

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

topLevelFunctionsRegister.push('setTextContent');

const setTextContent = function (node, text) {
  logFuncUsage(['setTextContent'], { node, text });

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

topLevelFunctionsRegister.push('updateDOMProperties');

function updateDOMProperties(
  domElement,
  updatePayload,
  wasCustomComponentTag,
  isCustomComponentTag,
) {
  // TODO: Handle wasCustomComponentTag
  logFuncUsage(['updateDOMProperties'], {
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
    } else if (propKey === CHILDREN) {
      setTextContent(domElement, propValue);
    }
  }
}

topLevelFunctionsRegister.push('updateProperties');

function updateProperties(
  domElement,
  updatePayload,
  tag,
  lastRawProps,
  nextRawProps,
) {
  logFuncUsage(['updateProperties'], {
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

topLevelFunctionsRegister.push('commitUpdate');

function commitUpdate(domElement, updatePayload, type, oldProps, newProps) {
  logFuncUsage(['commitUpdate'], {
    domElement,
    updatePayload,
    type,
    oldProps,
    newProps,
  });
  updateFiberProps(domElement, newProps);

  updateProperties(domElement, updatePayload, type, oldProps, newProps);
}

topLevelFunctionsRegister.push('commitWork');

function commitWork(current, finishedWork) {
  logFuncUsage(['commitWork'], { current, finishedWork });

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

topLevelFunctionsRegister.push('commitDeletion');

function commitDeletion(finishedRoot, current) {
  logFuncUsage(['commitDeletion'], {
    finishedRoot,
    current,
  });

  {
    unmountHostComponents(finishedRoot, current);
  }

  detachFiber(current);
}

topLevelFunctionsRegister.push('detachFiber');

function detachFiber(current) {
  logFuncUsage(['detachFiber'], { current });

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

topLevelFunctionsRegister.push('commitNestedUnmounts');

function commitNestedUnmounts(finishedRoot, root) {
  logFuncUsage(['commitNestedUnmounts'], {
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

topLevelFunctionsRegister.push('removeChild');

function removeChild(parentInstance, child) {
  logFuncUsage(['removeChild'], { parentInstance, child });
  parentInstance.removeChild(child);
}

topLevelFunctionsRegister.push('unmountHostComponents');

function unmountHostComponents(finishedRoot, current) {
  logFuncUsage(['unmountHostComponents'], {
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

    removeChild(currentParent, node.stateNode);

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

topLevelFunctionsRegister.push('commitMutationEffects');

function commitMutationEffects(root) {
  console.log(['commitMutationEffects'], { root });
  logFuncUsage(['commitMutationEffects'], { root });

  while (nextEffect !== null) {
    const effectTag = nextEffect.effectTag;
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

        commitWork(nextEffect.alternate, nextEffect);

        break;
      }
      case Update: {
        commitWork(nextEffect.alternate, nextEffect);

        break;
      }
      case Deletion: {
        commitDeletion(root, nextEffect);

        break;
      }
    }

    nextEffect = nextEffect.nextEffect;
  }
}

topLevelFunctionsRegister.push('commitRoot');

function commitRoot(root) {
  logFuncUsage(['commitRoot'], { root });

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

topLevelFunctionsRegister.push('finishSyncRender');

function finishSyncRender(root) {
  logFuncUsage(['finishSyncRender'], { root });
  workInProgressRoot = null;
  commitRoot(root);
}

topLevelFunctionsRegister.push('performSyncWorkOnRoot');

function performSyncWorkOnRoot(root) {
  logFuncUsage(['performSyncWorkOnRoot'], root);

  if (root !== workInProgressRoot) {
    prepareFreshStack(root);
  }

  if (workInProgress !== null) {
    logFuncUsage(['reconsilation start']);
    workLoopSync();

    root.finishedWork = root.current.alternate;
    logFuncUsage(['reconsilation finished'], performUnitOfWorkCounter);
    performUnitOfWorkCounter = 0;
    finishSyncRender(root);
  }

  return null;
}

topLevelFunctionsRegister.push('ensureRootIsScheduled');

function ensureRootIsScheduled(root) {
  logFuncUsage(['ensureRootIsScheduled'], { root });

  scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
}

topLevelFunctionsRegister.push('flushSyncCallbackQueue');

function flushSyncCallbackQueue() {
  logFuncUsage(['flushSyncCallbackQueue']);

  immediateQueueCallbackNode = null;

  let i = 0;
  const _isSync = true;
  const queue = syncQueue;

  for (; i < queue.length; i++) {
    let callback = queue[i];

    do {
      callback = callback(_isSync);
    } while (callback !== null);
  }
}

topLevelFunctionsRegister.push('scheduleWork');

function scheduleWork(fiber) {
  logFuncUsage(['scheduleWork'], { fiber });

  const root = markUpdateTimeFromFiberToRoot(fiber);

  if (root === null) {
    return;
  }

  ensureRootIsScheduled(root);

  flushSyncCallbackQueue();
}

topLevelFunctionsRegister.push('updateContainer');

function updateContainer(element, container, parentComponent) {
  logFuncUsage(['updateContainer'], { element, container, parentComponent });
  console.log(['updateContainer'], { element, container, parentComponent });

  const update = createUpdate();

  update.payload = {
    element: element,
  };

  enqueueUpdate(container.current, update);
  scheduleWork(container.current);
}

topLevelFunctionsRegister.push('render');

function render(element, container) {
  console.log(['render'], { element, container });
  logFuncUsage(['render'], { element, container });

  const fiberRoot = createFiberRoot(container);
  console.log(['render.fiberRoot'], fiberRoot);

  updateContainer(element, fiberRoot, null);

  return null;
}

topLevelFunctionsRegister.push('publishEventForPlugin');

function publishEventForPlugin(dispatchConfig, pluginModule, eventName) {
  logFuncUsage(['publishEventForPlugin'], {
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

topLevelFunctionsRegister.push('recomputePluginOrdering');

function recomputePluginOrdering() {
  logFuncUsage(['recomputePluginOrdering']);

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

topLevelFunctionsRegister.push('injectEventPluginsByName');

function injectEventPluginsByName(injectedNamesToPlugins) {
  logFuncUsage(['injectEventPluginsByName'], { injectedNamesToPlugins });

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

topLevelFunctionsRegister.push('SyntheticEvent');

function SyntheticEvent(
  dispatchConfig,
  targetInst,
  nativeEvent,
  nativeEventTarget,
) {
  logFuncUsage(['SyntheticEvent'], {
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

topLevelFunctionsRegister.push('getPooledEvent');

function getPooledEvent(dispatchConfig, targetInst, nativeEvent, nativeInst) {
  logFuncUsage(['getPooledEvent'], {
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

topLevelFunctionsRegister.push('releasePooledEvent');

function releasePooledEvent(event) {
  logFuncUsage(['releasePooledEvent'], { event });

  const EventConstructor = this;

  if (EventConstructor.eventPool.length < EVENT_POOL_SIZE) {
    EventConstructor.eventPool.push(event);
  }
}

topLevelFunctionsRegister.push('addEventPoolingTo');

function addEventPoolingTo(EventConstructor) {
  logFuncUsage(['addEventPoolingTo'], { EventConstructor });
  EventConstructor.eventPool = [];
  EventConstructor.getPooled = getPooledEvent;
  EventConstructor.release = releasePooledEvent;
}

topLevelFunctionsRegister.push('SyntheticEvent.extend');
SyntheticEvent.extend = function (Interface) {
  logFuncUsage(['SyntheticEvent.extend'], { Interface });

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

topLevelFunctionsRegister.push('getParent');

function getParent(inst) {
  logFuncUsage(['getParent'], { inst });
  do {
    inst = inst.return;
  } while (inst && inst.tag !== HostComponent);

  if (inst) {
    return inst;
  }

  return null;
}

topLevelFunctionsRegister.push('traverseTwoPhase');

function traverseTwoPhase(inst, fn, arg) {
  logFuncUsage(['traverseTwoPhase'], { inst, fn, arg });

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

topLevelFunctionsRegister.push('getNodeFromInstance$1');

function getNodeFromInstance$1(inst) {
  logFuncUsage(['getNodeFromInstance$1'], { inst });

  if (inst.tag === HostComponent || inst.tag === HostText) {
    return inst.stateNode;
  }
}

topLevelFunctionsRegister.push('getFiberCurrentPropsFromNode$1');

function getFiberCurrentPropsFromNode$1(node) {
  logFuncUsage(['getFiberCurrentPropsFromNode$1'], { node });

  return node[internalEventHandlersKey] || null;
}

topLevelFunctionsRegister.push('setComponentTree');

function setComponentTree(
  getFiberCurrentPropsFromNodeImpl,
  getInstanceFromNodeImpl,
  getNodeFromInstanceImpl,
) {
  logFuncUsage(['setComponentTree'], {
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
topLevelFunctionsRegister.push('getListener');

function getListener(inst, registrationName) {
  logFuncUsage(['getListener'], { inst, registrationName });

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

topLevelFunctionsRegister.push('listenerAtPhase');

function listenerAtPhase(inst, event, propagationPhase) {
  logFuncUsage(['listenerAtPhase'], { inst, event, propagationPhase });

  const registrationName =
    event.dispatchConfig.phasedRegistrationNames[propagationPhase];

  return getListener(inst, registrationName);
}

topLevelFunctionsRegister.push('accumulateDirectionalDispatches');

function accumulateDirectionalDispatches(inst, phase, event) {
  logFuncUsage(['accumulateDirectionalDispatches']);

  const listener = listenerAtPhase(inst, event, phase);

  if (listener) {
    event._dispatchListeners = accumulateInto(
      event._dispatchListeners,
      listener,
    );
    event._dispatchInstances = accumulateInto(event._dispatchInstances, inst);
  }
}

topLevelFunctionsRegister.push('accumulateTwoPhaseDispatchesSingle');

function accumulateTwoPhaseDispatchesSingle(event) {
  logFuncUsage(['accumulateTwoPhaseDispatchesSingle'], { event });

  if (event && event.dispatchConfig.phasedRegistrationNames) {
    traverseTwoPhase(event._targetInst, accumulateDirectionalDispatches, event);
  }
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

    forEachAccumulated(event, accumulateTwoPhaseDispatchesSingle);

    return event;
  },
};

topLevelFunctionsRegister.push('injectEventPluginOrder');

function injectEventPluginOrder(injectedEventPluginOrder) {
  logFuncUsage(['injectEventPluginOrder'], { injectedEventPluginOrder });
  eventPluginOrder = Array.prototype.slice.call(injectedEventPluginOrder);
  recomputePluginOrdering();
}

topLevelFunctionsRegister.push('processSimpleEventPluginPairsByPriority');

function processSimpleEventPluginPairsByPriority(eventTypes, priority) {
  logFuncUsage(['processSimpleEventPluginPairsByPriority'], {
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

topLevelFunctionsRegister.push('unsafeCastStringToDOMTopLevelType');

function unsafeCastStringToDOMTopLevelType(topLevelType) {
  logFuncUsage(['unsafeCastStringToDOMTopLevelType'], { topLevelType });

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
