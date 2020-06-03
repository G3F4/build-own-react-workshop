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
const NoEffect =
  /*              */
  0;
const PerformedWork =
  /*         */
  1; // You can change the rest (and add more).
const Placement =
  /*             */
  2;
const Update =
  /*                */
  4;
const PlacementAndUpdate =
  /*    */
  6;
const Deletion =
  /*              */
  8;
const ContentReset =
  /*          */
  16;
const Callback =
  /*              */
  32;
const DidCapture =
  /*            */
  64;
const Ref =
  /*                   */
  128;
const Hydrating =
  /*             */
  1024;
const Incomplete =
  /*            */
  2048;
const ShouldCapture =
  /*         */
  4096;
const FunctionComponent = 0;
const IndeterminateComponent = 2; // Before we know whether it is function or class
const HostRoot = 3; // Root of a host tree. Could be nested inside another node.
const HostComponent = 5;
const HostText = 6;
let currentlyRenderingFiber$1 = null;
const Namespaces = {
  html: HTML_NAMESPACE,
  mathml: MATH_NAMESPACE,
  svg: SVG_NAMESPACE,
};
const HTML_NAMESPACE$1 = Namespaces.html;
/**
 * Keeps track of the current owner.
 *
 * The current owner is the component who should own any components that are
 * currently being constructed.
 */
const ReactCurrentOwner = {
  /**
   * @internal
   * @type {ReactComponent}
   */
  current: null,
};
const ReactCurrentDispatcher = {
  /**
   * @internal
   * @type {ReactComponent}
   */
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
    // This tag allows us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,
    // Built-in properties that belong on the element
    type: type,
    props: props,
  };
};
/**
 * Create and return a new ReactElement of the given type.
 * See https://reactjs.org/docs/react-api.html#createelement
 */

function createElement(type, config, children) {
  let propName; // Reserved names are extracted
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
  // Instance
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
  return createFiber(HostRoot, null, null);
}

function initializeUpdateQueue(fiber) {
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
  console.log(['createFiberRoot'], containerInfo);

  const root = new FiberRootNode(containerInfo);
  // stateNode is any.
  const uninitializedFiber = createHostRootFiber();

  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;
  initializeUpdateQueue(uninitializedFiber);

  console.log(['createFiberRoot, root'], root);

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
  // Push this callback into an internal queue. We'll flush these either in
  // the next tick, or earlier if something calls `flushSyncCallbackQueue`.
  console.log(['scheduleSyncCallback.syncQueue === null'], syncQueue === null);

  if (syncQueue === null) {
    syncQueue = [callback]; // Flush the queue in the next tick, at the earliest.

    // immediateQueueCallbackNode = Scheduler_scheduleCallback(
    //   Scheduler_ImmediatePriority,
    //   flushSyncCallbackQueueImpl,
    // );
  } else {
    // Push onto existing queue. Don't need to schedule a callback because
    // we already scheduled one when we created the queue.
    syncQueue.push(callback);
  }
}

let workInProgressRoot = null; // The root we're working on
let workInProgress = null; // The fiber we're working on

function createWorkInProgress(current, pendingProps) {
  console.log(['createWorkInProgress'], { current, pendingProps });

  let workInProgress = current.alternate;

  if (workInProgress === null) {
    // We use a double buffering pooling technique because we know that we'll
    // only ever need at most two versions of a tree. We pool the "other" unused
    // node that we're free to reuse. This is lazily created to avoid allocating
    // extra objects for things that are never updated. It also allow us to
    // reclaim the extra memory if needed.
    workInProgress = createFiber(current.tag, pendingProps, current.key);
    workInProgress.elementType = current.elementType;
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    workInProgress.pendingProps = pendingProps; // We already have an alternate.
    // Reset the effect tag.
    workInProgress.effectTag = NoEffect; // The effect list is no longer valid.
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
} // Used to reuse a Fiber for a second pass.

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
  cursor.current = valueStack[index];
  valueStack[index] = null;

  {
    fiberStack[index] = null;
  }

  index--;
}

function push(cursor, value, fiber) {
  index++;
  valueStack[index] = cursor.current;

  {
    fiberStack[index] = fiber;
  }

  cursor.current = value;
}

function getIntrinsicNamespace(type) {
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
  if (parentNamespace == null || parentNamespace === HTML_NAMESPACE) {
    // No (or default) parent namespace: potential entry point.
    return getIntrinsicNamespace(type);
  }

  if (parentNamespace === SVG_NAMESPACE && type === 'foreignObject') {
    // We're leaving SVG.
    return HTML_NAMESPACE;
  } // By default, pass namespace below.

  return parentNamespace;
}

function getRootHostContext(rootContainerInstance) {
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
  // Push current root instance onto the stack;
  // This allows us to reset root when portals are popped.
  push(rootInstanceStackCursor, nextRootInstance, fiber); // Track the context and the Fiber that provided it.

  const nextRootContext = getRootHostContext(nextRootInstance); // Now that we know this function doesn't throw, replace it.

  pop(contextStackCursor$1, fiber);
  push(contextStackCursor$1, nextRootContext, fiber);
}

function cloneUpdateQueue(current, workInProgress) {
  // Clone the update queue from current. Unless it's already a clone.
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
  console.log(['getStateFromUpdate']);

  switch (update.tag) {
    case ReplaceState: {
      const payload = update.payload;

      if (typeof payload === 'function') {
        // Updater function
        {
          if (workInProgress.mode) {
            payload.call(instance, prevState, nextProps);
          }
        }

        const nextState = payload.call(instance, prevState, nextProps);

        return nextState;
      } // State object

      return payload;
    }
    case CaptureUpdate: {
      workInProgress.effectTag =
        (workInProgress.effectTag & ~ShouldCapture) | DidCapture;
    }
    // Intentional fallthrough
    case UpdateState: {
      const _payload = update.payload;
      let partialState;

      if (typeof _payload === 'function') {
        // Updater function
        {
          if (workInProgress.mode) {
            _payload.call(instance, prevState, nextProps);
          }
        }

        partialState = _payload.call(instance, prevState, nextProps);
      } else {
        // Partial state object
        partialState = _payload;
      }

      if (partialState === null || partialState === undefined) {
        // Null and undefined are treated as no-ops.
        return prevState;
      } // Merge the partial state and the previous state.

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
  // This is always non-null on a ClassComponent or HostRoot
  const queue = workInProgress.updateQueue;

  hasForceUpdate = false;

  let baseQueue = queue.baseQueue; // The last pending update that hasn't been processed yet.
  let pendingQueue = queue.shared.pending;

  if (pendingQueue !== null) {
    // We have new updates that haven't been processed yet.
    // We'll add them to the base queue.
    if (baseQueue !== null) {
      // Merge the pending queue and the base queue.
      const baseFirst = baseQueue.next;
      const pendingFirst = pendingQueue.next;

      baseQueue.next = pendingFirst;
      pendingQueue.next = baseFirst;
    }

    baseQueue = pendingQueue;
    queue.shared.pending = null; // TODO: Pass `current` as argument

    const current = workInProgress.alternate;

    if (current !== null) {
      const currentQueue = current.updateQueue;

      if (currentQueue !== null) {
        currentQueue.baseQueue = pendingQueue;
      }
    }
  } // These values may change as we process the queue.

  if (baseQueue !== null) {
    const first = baseQueue.next; // Iterate through the list of updates to compute the result.
    let newState = queue.baseState;
    let newBaseState = null;
    let newBaseQueueFirst = null;
    let newBaseQueueLast = null;

    if (first !== null) {
      let update = first;

      do {
        const updateExpirationTime = update.expirationTime;

        if (updateExpirationTime < 123123123) {
          // Priority is insufficient. Skip this update. If this is the first
          // skipped update, the previous update/state is the new base
          // update/state.
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
          } // Update the remaining priority in the queue.
        } else {
          // This update does have sufficient priority.
          if (newBaseQueueLast !== null) {
            const _clone = {
              tag: update.tag,
              payload: update.payload,
              callback: update.callback,
              next: null,
            };

            newBaseQueueLast = newBaseQueueLast.next = _clone;
          } // Mark the event time of this update as relevant to this render pass.
          // TODO: This should ideally use the true event time of this update rather than
          // its priority which is a derived and not reverseable value.
          // TODO: We should skip this update if it was already committed but currently
          // we have no way of detecting the difference between a committed and suspended
          // update here.

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
            // An update was scheduled from inside a reducer. Add the new
            // pending updates to the end of the list and keep processing.
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
    queue.baseQueue = newBaseQueueLast; // Set the remaining expiration time to be whatever is remaining in the queue.
    // This should be fine because the only two other things that contribute to
    // expiration time are props and context. We're already in the middle of the
    // begin phase by the time we start processing the queue, so we've already
    // dealt with the props. Context in components that specify
    // shouldComponentUpdate is tricky; but we'll have to account for
    // that regardless.

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
    // If this is a fresh new component that hasn't been rendered yet, we
    // won't update its child set by applying minimal side-effects. Instead,
    // we will add them all to the child before it gets rendered. That means
    // we can optimize this reconciliation pass by not tracking side-effects.
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
  } else {
    // If the current child is the same as the work in progress, it means that
    // we haven't yet started any work on these children. Therefore, we use
    // the clone algorithm to create a copy of all the current children.
    // If we had any progressed work already, that is invalid at this point so
    // let's throw it out.
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

  const nextState = workInProgress.memoizedState; // Caution: React DevTools currently depends on this property
  // being called "element".
  const nextChildren = nextState.element;

  reconcileChildren(current, workInProgress, nextChildren);

  return workInProgress.child;
}

let isRendering = false;

function mountWorkInProgressHook() {
  const hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };

  if (workInProgressHook === null) {
    // This is the first hook in the list

    currentlyRenderingFiber$1.memoizedState = workInProgressHook = hook;
  } else {
    // Append to the end of the list
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
    // This is the first update. Create a circular list.
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
  const hook = mountWorkInProgressHook();

  if (typeof initialState === 'function') {
    // $FlowFixMe: Flow doesn't like mixed types
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
  // This function is used both for updates and for re-renders triggered by a
  // render phase update. It assumes there is either a current hook we can
  // clone, or a work-in-progress hook from a previous render pass that we can
  // use as a base. When we reach the end of the base list, we must switch to
  // the dispatcher used for mounts.
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
    // There's already a work-in-progress. Reuse it.
    workInProgressHook = nextWorkInProgressHook;
    currentHook = nextCurrentHook;
  } else {
    // Clone from the current hook.
    currentHook = nextCurrentHook;

    const newHook = {
      memoizedState: currentHook.memoizedState,
      baseState: currentHook.baseState,
      baseQueue: currentHook.baseQueue,
      queue: currentHook.queue,
      next: null,
    };

    if (workInProgressHook === null) {
      // This is the first hook in the list.

      currentlyRenderingFiber$1.memoizedState = workInProgressHook = newHook;
    } else {
      // Append to the end of the list.
      workInProgressHook = workInProgressHook.next = newHook;
    }
  }

  return workInProgressHook;
}

function updateReducer(reducer) {
  const hook = updateWorkInProgressHook();
  const queue = hook.queue;

  queue.lastRenderedReducer = reducer;

  const current = currentHook; // The last rebase update that is NOT part of the base state.
  let baseQueue = current.baseQueue; // The last pending update that hasn't been processed yet.
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
  // TODO Warn if no hooks are used at all during mount, then some are used during update.
  // Currently we will identify the update render as a mount because memoizedState === null.
  // This is tricky because it's valid for certain types of components (e.g. React.lazy)
  // Using memoizedState to differentiate between mount/update only works if at least one stateful hook is used.
  // Non-stateful hooks (e.g. context) don't get added to memoizedState,
  // so memoizedState would be null during updates and mounts.

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

  // Proceed under the assumption that this is a function component
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
  if (Component && Component.defaultProps) {
    // Resolve default props. Taken from ReactElement
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
  console.log(['updateFunctionComponent'], { current,
    workInProgress,
    Component,
    nextProps })
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
  reconcileChildren(
    current,
    workInProgress,
    nextChildren,
  );

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
  node[internalInstanceKey] = hostInst;
}

function updateFiberProps(node, props) {
  console.log(['updateFiberProps'], { node, props });
  node[internalEventHandlersKey] = props;
}

function getOwnerDocumentFromRootContainer(rootContainerElement) {
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
        // Separate else branch instead of using `props.is || undefined` above because of a Firefox bug.
        // See discussion in https://github.com/facebook/react/pull/6896
        // and discussion in https://bugzilla.mozilla.org/show_bug.cgi?id=1276240
        domElement = ownerDocument.createElement(type); // Normally attributes are assigned in `setInitialDOMProperties`, however the `multiple` and `size`
        // attributes on `select`s needs to be added before `option`s are inserted.
        // This prevents:
        // - a bug where the `select` does not scroll to the correct option because singular
        //  `select` elements automatically pick the first item #13222
        // - a bug where the `select` set the first item as selected despite the `size` attribute #14239
        // See https://github.com/facebook/react/issues/13222
        // and https://github.com/facebook/react/issues/14239

        if (type === 'select') {
          const node = domElement;

          if (props.multiple) {
            node.multiple = true;
          } else if (props.size) {
            // Setting a size greater than 1 causes a select to behave like `multiple=true`, where
            // it is possible that no option is selected.
            //
            // This is only necessary when a select in "single selection mode".
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
    // TODO: take namespace into account when validating.
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
  return {
    current: defaultValue,
  };
}

const rootInstanceStackCursor = createCursor(NO_CONTEXT);

function appendInitialChild(parentInstance, child) {
  parentInstance.appendChild(child);
}

// function prepareUpdate(
//   domElement,
//   type,
//   oldProps,
//   newProps,
//   rootContainerInstance,
// ) {
//   return diffProperties(
//     domElement,
//     type,
//     oldProps,
//     newProps,
//     rootContainerInstance,
//   );
// }

function getRootHostContainer() {
  return rootInstanceStackCursor.current;
}

function getHostProps(element, props) {
  const node = element;
  const checked = props.checked;
  const hostProps = Object.assign({}, props, {
    defaultChecked: undefined,
    defaultValue: undefined,
    value: undefined,
    checked: checked != null ? checked : node._wrapperState.initialChecked,
  });

  return hostProps;
}

// Calculate the diff between the two objects.
function diffProperties(
  domElement,
  tag,
  lastRawProps,
  nextRawProps,
  rootContainerElement,
) {
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
    }
    else if (propKey === AUTOFOCUS);
    else {
      // For all other deleted properties we add it to the queue. We use
      // the whitelist in the commit phase instead.
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
          // Freeze the next style object so that we can assume it won't be
          // mutated. We have already warned for this in the past.
          Object.freeze(nextProp);
        }
      }

      if (lastProp) {
        // Unset styles on `lastProp` but not on `nextProp`.
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
        } // Update styles that changed since `lastProp`.

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
        // Relies on `updateStylesByID` not mutating `styleUpdates`.
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
    }
    else if (registrationNameModules.hasOwnProperty(propKey)) {
      if (nextProp != null) {

        ensureListeningTo(rootContainerElement, propKey);
      }

      if (!updatePayload && lastProp !== nextProp) {
        // This is a special case. If any listener updates we need to ensure
        // that the "current" props pointer gets updated so we need a commit
        // to update this element.
        updatePayload = [];
      }
    } else {
      // For any other property we always add it to the queue and then we
      // filter it out using the whitelist during the commit.
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
  // Mutation mode
  appendAllChildren = function (parent, workInProgress) {
    // We only have the top Fiber that was created but we need recurse down its
    // children to find all the terminal nodes.
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
    // If we have an alternate, that means this is an update and we need to
    // schedule a side-effect to do the updates.
    const oldProps = current.memoizedProps;

    if (oldProps === newProps) {
      // In mutation mode, this is sufficient for a bailout because
      // we won't touch this node even if children changed.
      return;
    } // If we get updated because one of our children updated, we don't
    // have newProps so we'll have to reuse them.
    // TODO: Split the update API as separate for the props vs. children.
    // Even better would be if children weren't special cased at all tho.

    const instance = workInProgress.stateNode;
    const updatePayload = prepareUpdate(
      instance,
      type,
      oldProps,
      newProps,
      rootContainerInstance,
    ); // TODO: Type this specific to this type of component.

    workInProgress.updateQueue = updatePayload; // If the update payload indicates that there is a change or if there
    // is a new ref we mark this as an update. All the work is done in commitWork.

    if (updatePayload) {
      markUpdate(workInProgress);
    }
  };
}

function isCustomComponent(tagName, props) {
  if (tagName.indexOf('-') === -1) {
    return typeof props.is === 'string';
  }

  switch (tagName) {
    // These are reserved SVG and MathML elements.
    // We don't mind this whitelist too much because we expect it to never grow.
    // The alternative is to track the namespace in a few places which is convoluted.
    // https://w3c.github.io/webcomponents/spec/custom/#custom-elements-core-concepts
    case 'annotation-xml':
    case 'color-profile':
    case 'font-face':
    case 'font-face-src':
    case 'font-face-uri':
    case 'font-face-format':
    case 'font-face-name':
    case 'missing-glyph':
      return false;
    default:
      return true;
  }
}

const PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map; // prettier-ignore
const elementListenerMap = new PossiblyWeakMap();

function publishRegistrationName(registrationName, pluginModule, eventName) {
  console.log(['publishRegistrationName'])
  registrationNameModules[registrationName] = pluginModule;
  registrationNameDependencies[registrationName] =
    pluginModule.eventTypes[eventName].dependencies;
}

function getListenerMapForElement(element) {
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
  return fn(bookkeeping);
};
const batchedEventUpdatesImpl = batchedUpdatesImpl;

function batchedEventUpdates(fn, a, b) {
  if (isBatchingEventUpdates) {
    // If we are currently inside another batch, we need to wait until it
    // fully completes before restoring state.
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
  if (inst.tag === HostRoot) {
    return inst.stateNode.containerInfo;
  } // TODO: It may be a good idea to cache this to prevent unnecessary DOM
  // traversal, but caching is difficult to do correctly without using a
  // mutation observer to listen for all DOM changes.

  while (inst.return) {
    inst = inst.return;
  }

  if (inst.tag !== HostRoot) {
    // This can happen if we're in a detached tree.
    return null;
  }

  return inst.stateNode.containerInfo;
}
const IS_FIRST_ANCESTOR = 1 << 6;
function executeDispatch(event, listener, inst) {
  event.currentTarget = getNodeFromInstance(inst);
  listener(undefined, event)
  event.currentTarget = null;
}
/**
 * Allows registered plugins an opportunity to extract events from top-level
 * native browser events.
 *
 * @return {*} An accumulation of synthetic events.
 * @internal
 */
function executeDispatchesInOrder(event) {
  console.log(['executeDispatchesInOrder'], { event })
  const dispatchListeners = event._dispatchListeners;
  const dispatchInstances = event._dispatchInstances;

  if (Array.isArray(dispatchListeners)) {
    for (let i = 0; i < dispatchListeners.length; i++) {
      if (event.isPropagationStopped()) {
        break;
      } // Listeners and Instances are two parallel arrays that are always in sync.

      executeDispatch(event, dispatchListeners[i], dispatchInstances[i]);
    }
  } else if (dispatchListeners) {
    executeDispatch(event, dispatchListeners, dispatchInstances);
  }

  event._dispatchListeners = null;
  event._dispatchInstances = null;
}
const executeDispatchesAndRelease = function (event) {
  console.log(['executeDispatchesAndRelease'], { executeDispatchesAndRelease })
  if (event) {
    executeDispatchesInOrder(event);

    event.constructor.release(event);
  }
};
const executeDispatchesAndReleaseTopLevel = function (e) {
  console.log(['executeDispatchesAndReleaseTopLevel'], { e })
  return executeDispatchesAndRelease(e);
};
function accumulateInto(current, next) {
  console.log(['accumulateInto'], { current, next })
  if (current == null) {
    return next;
  } // Both are not empty. Warning: Never call x.concat(y) when you are not
  // certain that x is an Array (x could be a string with concat method).

  if (Array.isArray(current)) {
    if (Array.isArray(next)) {
      current.push.apply(current, next);

      return current;
    }

    current.push(next);

    return current;
  }

  if (Array.isArray(next)) {
    // A bit too dangerous to mutate `next`.
    return [current].concat(next);
  }

  return [current, next];
}

function forEachAccumulated(arr, cb) {
  console.log(['forEachAccumulated'], { arr, cb })
  cb(arr);
}
let eventQueue = null;
function runEventsInBatch(events) {
  console.log(['runEventsInBatch'], { events })
  if (events !== null) {
    eventQueue = accumulateInto(eventQueue, events);
  } // Set `eventQueue` to null before processing it so that we can tell if more
  // events get enqueued while processing.

  const processingEventQueue = eventQueue;

  eventQueue = null;

  if (!processingEventQueue) {
    return;
  }

  forEachAccumulated(
    processingEventQueue,
    executeDispatchesAndReleaseTopLevel,
  );
}

function extractPluginEvents(
  topLevelType,
  targetInst,
  nativeEvent,
  nativeEventTarget,
  eventSystemFlags,
) {
  let events = null;

  for (let i = 0; i < plugins.length; i++) {
    // Not every plugin in the ordering may be loaded at runtime.
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
  let targetInst = bookKeeping.targetInst; // Loop through the hierarchy, in case there's any nested components.
  // It's important that we build the array of ancestors before calling any
  // event handlers, because event handlers can modify the DOM, leading to
  // inconsistencies with ReactMount's node cache. See #1105.
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
    let eventSystemFlags = bookKeeping.eventSystemFlags; // If this is the first ancestor, we mark it on the system flags

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
    // Event queue being processed in the same cycle allows
    // `preventDefault`.
    batchedEventUpdates(handleTopLevel, bookKeeping);
  } finally {
    releaseTopLevelCallbackBookKeeping(bookKeeping);
  }
}
function addEventBubbleListener(element, eventType, listener) {
  element.addEventListener(eventType, listener, false);
}
function getClosestInstanceFromNode(targetNode) {
  let targetInst = targetNode[internalInstanceKey];

  if (targetInst) {
    // Don't return HostRoot or SuspenseComponent here.
    return targetInst;
  } // If the direct event target isn't a React owned DOM node, we need to look
  // to see if one of its parents is a React owned DOM node.

  let parentNode = targetNode.parentNode;

  while (parentNode) {
    // We'll check if this is a container root that could include
    // React nodes in the future. We need to check this first because
    // if we're a child of a dehydrated container, we need to first
    // find that inner container before moving on to finding the parent
    // instance. Note that we don't check this field on  the targetNode
    // itself because the fibers are conceptually between the container
    // node and the first child. It isn't surrounding the container node.
    // If it's not a container, we check if it's an instance.
    targetInst =
      parentNode[internalInstanceKey];

    if (targetInst) {
      // Since this wasn't the direct target of the event, we might have
      // stepped past dehydrated DOM nodes to get here. However they could
      // also have been non-React nodes. We need to answer which one.
      // If we the instance doesn't have any children, then there can't be
      // a nested suspense boundary within it. So we can use this as a fast
      // bailout. Most of the time, when people add non-React children to
      // the tree, it is using a ref to a child-less DOM node.
      // Normally we'd only need to check one of the fibers because if it
      // has ever gone from having children to deleting them or vice versa
      // it would have deleted the dehydrated boundary nested inside already.
      // However, since the HostRoot starts out with an alternate it might
      // have one on the alternate so we need to check in case this was a
      // root.
      return targetInst;
    }

    targetNode = parentNode;
    parentNode = targetNode.parentNode;
  }

  return null;
}
function getEventTarget(nativeEvent) {
  // Fallback to nativeEvent.srcElement for IE9
  // https://github.com/facebook/react/issues/12506
  let target = nativeEvent.target || nativeEvent.srcElement || window; // Normalize SVG <use> element events #4963

  if (target.correspondingUseElement) {
    target = target.correspondingUseElement;
  } // Safari may fire events on text nodes (Node.TEXT_NODE is 3).
  // @see http://www.quirksmode.org/js/events_properties.html

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

  // TODO: Warn if _enabled is false.
  const nativeEventTarget = getEventTarget(nativeEvent);
  let targetInst = getClosestInstanceFromNode(nativeEventTarget);

  dispatchEventForLegacyPluginEventSystem(
    topLevelType,
    eventSystemFlags,
    nativeEvent,
    targetInst,
  );

  return null;
}
function dispatchEvent(
  topLevelType,
  eventSystemFlags,
  container,
  nativeEvent,
) {
  console.log(['dispatchEvent'])
  attemptToDispatchEvent(
    topLevelType,
    eventSystemFlags,
    container,
    nativeEvent,
  );
}
function trapEventForPluginEventSystem(container, topLevelType) {
  console.log(['trapEventForPluginEventSystem'], { container, topLevelType })
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
  trapEventForPluginEventSystem(element, topLevelType, false);
}
function legacyListenToTopLevelEvent(topLevelType, mountAt, listenerMap) {
  console.log(['legacyListenToTopLevelEvent'], { topLevelType, mountAt, listenerMap })
  if (!listenerMap.has(topLevelType)) {
    // By default, listen on the top level to all non-media events.
    // Media events don't bubble so adding the listener wouldn't do anything.
    trapBubbledEvent(topLevelType, mountAt);
    listenerMap.set(topLevelType, null);
  }
}

function legacyListenToEvent(registrationName, mountAt) {
  const listenerMap = getListenerMapForElement(mountAt);
  const dependencies = registrationNameDependencies[registrationName];

  for (let i = 0; i < dependencies.length; i++) {
    const dependency = dependencies[i];

    legacyListenToTopLevelEvent(dependency, mountAt, listenerMap);
  }
}

function ensureListeningTo(rootContainerElement, registrationName) {
  console.log(['ensureListeningTo'], { rootContainerElement, registrationName })
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
  for (const propKey in nextProps) {
    if (!nextProps.hasOwnProperty(propKey)) {
      continue;
    }

    const nextProp = nextProps[propKey];

    if (propKey === STYLE) {
      {
        if (nextProp) {
          // Freeze the next style object so that we can assume it won't be
          // mutated. We have already warned for this in the past.
          Object.freeze(nextProp);
        }
      } // Relies on `updateStylesByID` not mutating `styleUpdates`.

      setValueForStyles(domElement, nextProp);
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
      const nextHtml = nextProp ? nextProp[HTML$1] : undefined;

      if (nextHtml != null) {
        setInnerHTML(domElement, nextHtml);
      }
    } else if (propKey === CHILDREN) {
      if (typeof nextProp === 'string') {
        // Avoid setting initial textContent when the text is empty. In IE11 setting
        // textContent on a <textarea> will cause the placeholder to not
        // show within the <textarea> until it has been focused and blurred again.
        // https://github.com/facebook/react/issues/6731#issuecomment-254874553
        const canSetTextContent = tag !== 'textarea' || nextProp !== '';

        if (canSetTextContent) {
          setTextContent(domElement, nextProp);
        }
      } else if (typeof nextProp === 'number') {
        setTextContent(domElement, '' + nextProp);
      }
    }
    else if (propKey === AUTOFOCUS);
    else if (registrationNameModules.hasOwnProperty(propKey)) {
      if (nextProp != null) {
        ensureListeningTo(rootContainerElement, propKey);
      }
    } else if (nextProp != null) {
      setValueForProperty(
        domElement,
        propKey,
        nextProp,
        isCustomComponentTag,
      );
    }
  }
}

function setInitialProperties(domElement, tag, rawProps, rootContainerElement) {
  const isCustomComponentTag = isCustomComponent(tag, rawProps);
  let props;

  switch (tag) {
    // case 'iframe':
    // case 'object':
    // case 'embed':
    //   trapBubbledEvent(TOP_LOAD, domElement);
    //   props = rawProps;
    //
    //   break;
    // case 'video':
    // case 'audio':
    //   // Create listener for each media event
    //   for (let i = 0; i < mediaEventTypes.length; i++) {
    //     trapBubbledEvent(mediaEventTypes[i], domElement);
    //   }
    //
    //   props = rawProps;
    //
    //   break;
    // case 'source':
    //   trapBubbledEvent(TOP_ERROR, domElement);
    //   props = rawProps;
    //
    //   break;
    // case 'img':
    // case 'image':
    // case 'link':
    //   trapBubbledEvent(TOP_ERROR, domElement);
    //   trapBubbledEvent(TOP_LOAD, domElement);
    //   props = rawProps;
    //
    //   break;
    // case 'form':
    //   trapBubbledEvent(TOP_RESET, domElement);
    //   trapBubbledEvent(TOP_SUBMIT, domElement);
    //   props = rawProps;
    //
    //   break;
    // case 'details':
    //   trapBubbledEvent(TOP_TOGGLE, domElement);
    //   props = rawProps;
    //
    //   break;
    // case 'input':
    //   initWrapperState(domElement, rawProps);
    //   props = getHostProps(domElement, rawProps);
    //   trapBubbledEvent(TOP_INVALID, domElement); // For controlled components we always need to ensure we're listening
    //   // to onChange. Even if there is no listener.
    //
    //   ensureListeningTo(rootContainerElement, 'onChange');
    //
    //   break;
    // case 'option':
    //   validateProps(domElement, rawProps);
    //   props = getHostProps$1(domElement, rawProps);
    //
    //   break;
    // case 'select':
    //   initWrapperState$1(domElement, rawProps);
    //   props = getHostProps$2(domElement, rawProps);
    //   trapBubbledEvent(TOP_INVALID, domElement); // For controlled components we always need to ensure we're listening
    //   // to onChange. Even if there is no listener.
    //
    //   ensureListeningTo(rootContainerElement, 'onChange');
    //
    //   break;
    // case 'textarea':
    //   initWrapperState$2(domElement, rawProps);
    //   props = getHostProps$3(domElement, rawProps);
    //   trapBubbledEvent(TOP_INVALID, domElement); // For controlled components we always need to ensure we're listening
    //   // to onChange. Even if there is no listener.
    //
    //   ensureListeningTo(rootContainerElement, 'onChange');
    //
    //   break;
    default:
      props = rawProps;
  }

  setInitialDOMProperties(
    tag,
    domElement,
    rootContainerElement,
    props,
    isCustomComponentTag,
  );

  // switch (tag) {
  //   case 'input':
  //     // TODO: Make sure we check if this is still unmounted or do any clean
  //     // up necessary since we never stop tracking anymore.
  //     track(domElement);
  //     postMountWrapper(domElement, rawProps, false);
  //
  //     break;
  //   case 'textarea':
  //     // TODO: Make sure we check if this is still unmounted or do any clean
  //     // up necessary since we never stop tracking anymore.
  //     track(domElement);
  //     postMountWrapper$3(domElement);
  //
  //     break;
  //   case 'option':
  //     postMountWrapper$1(domElement, rawProps);
  //
  //     break;
  //   case 'select':
  //     postMountWrapper$2(domElement, rawProps);
  //
  //     break;
  //   default:
  //     if (typeof props.onClick === 'function') {
  //       // TODO: This cast may not be sound for SVG, MathML or custom elements.
  //       trapClickOnNonInteractiveElement(domElement);
  //     }
  //
  //     break;
  // }
}

function shouldAutoFocusHostComponent(type, props) {
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
  setInitialProperties(domElement, type, props, rootContainerInstance);

  return shouldAutoFocusHostComponent(type, props);
}

function markUpdate(workInProgress) {
  // Tag the fiber with an update effect. This turns a Placement into
  // a PlacementAndUpdate.
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

        const currentHostContext = contextStackCursor$1.current; // TODO: Move createInstance to beginWork and keep it on a context
        // "stack" as the parent. Then append children as we go in beginWork
        // or completeWork depending on whether we want to add them top->down or
        // bottom->up. Top->down is faster in IE11.
        const instance = createInstance(
          type,
          newProps,
          rootContainerInstance,
          currentHostContext,
          workInProgress,
        );

        appendAllChildren(instance, workInProgress, false, false); // This needs to be set before we mount Flare event listeners

        workInProgress.stateNode = instance;
        // (eg DOM renderer supports auto-focus for certain elements).
        // Make sure such renderers get scheduled for later work.

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
  let fiberTag = IndeterminateComponent; // The resolved type is set if we know what the final type will be. I.e. it's not lazy.
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
  function deleteChild(returnFiber, childToDelete) {
    if (!shouldTrackSideEffects) {
      // Noop.
      return;
    } // Deletions are added in reversed order so we add it to the front.
    // At this point, the return fiber's effect list is empty except for
    // deletions, so we can just append the deletion to the list. The remaining
    // effects aren't added until the complete phase. Once we implement
    // resuming, this may not be true.

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
      // Noop.
      return null;
    } // TODO: For the shouldClone case, this could be micro-optimized a bit by
    // assuming that after the first child we've already added everything.

    let childToDelete = currentFirstChild;

    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete);
      childToDelete = childToDelete.sibling;
    }

    return null;
  }

  function mapRemainingChildren(returnFiber, currentFirstChild) {
    console.log(['mapRemainingChildren'], { returnFiber, currentFirstChild });

    // Add the remaining children to a temporary map so that we can find them by
    // keys quickly. Implicit (null) keys get added to this set with their index
    // instead.
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

    // We currently set sibling to null and index to 0 here because it is easy
    // to forget to do before returning it. E.g. for the single child case.
    const clone = createWorkInProgress(fiber, pendingProps);

    clone.index = 0;
    clone.sibling = null;

    return clone;
  }

  function placeChild(newFiber, lastPlacedIndex, newIndex) {
    console.log(['placeChild'], { newFiber, lastPlacedIndex, newIndex });
    newFiber.index = newIndex;

    if (!shouldTrackSideEffects) {
      // Noop.
      return lastPlacedIndex;
    }

    const current = newFiber.alternate;

    if (current !== null) {
      const oldIndex = current.index;

      if (oldIndex < lastPlacedIndex) {
        // This is a move.
        newFiber.effectTag = Placement;

        return lastPlacedIndex;
      } else {
        // This item can stay in place.
        return oldIndex;
      }
    } else {
      // This is an insertion.
      newFiber.effectTag = Placement;

      return lastPlacedIndex;
    }
  }

  function placeSingleChild(newFiber) {
    // This is simpler for the single child case. We only need to do a
    // placement for inserting new children.
    if (shouldTrackSideEffects && newFiber.alternate === null) {
      newFiber.effectTag = Placement;
    }

    return newFiber;
  }

  function updateTextNode(returnFiber, current, textContent) {
    if (current === null || current.tag !== HostText) {
      // Insert
      const created = createFiberFromText(textContent);

      created.return = returnFiber;

      return created;
    } else {
      // Update
      const existing = useFiber(current, textContent);

      existing.return = returnFiber;

      return existing;
    }
  }

  function updateElement(returnFiber, current, element) {
    if (current !== null) {
      if (current.elementType === element.type) {
        // Move based on index
        const existing = useFiber(current, element.props);

        existing.ref = null;

        existing.return = returnFiber;

        return existing;
      }
    } // Insert

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

    // Update the fiber if the keys match, otherwise return null.
    const key = oldFiber !== null ? oldFiber.key : null;

    if (typeof newChild === 'string' || typeof newChild === 'number') {
      // Text nodes don't have keys. If the previous node is implicitly keyed
      // we can continue to replace it without aborting even if it is not a text
      // node.
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
      // Text nodes don't have keys, so we neither have to check the old nor
      // new node for the key. If both are text nodes, they match.
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
        // TODO: This breaks on empty slots like null children. That's
        // unfortunate because it triggers the slow path all the time. We need
        // a better way to communicate whether this was a miss or null,
        // boolean, undefined, etc.
        if (oldFiber === null) {
          oldFiber = nextOldFiber;
        }

        break;
      }

      if (shouldTrackSideEffects) {
        if (oldFiber && newFiber.alternate === null) {
          // We matched the slot, but we didn't reuse the existing fiber, so we
          // need to delete the existing child.
          deleteChild(returnFiber, oldFiber);
        }
      }

      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);

      if (previousNewFiber === null) {
        // TODO: Move out of the loop. This only happens for the first run.
        resultingFirstChild = newFiber;
      } else {
        // TODO: Defer siblings if we're not at the right index for this slot.
        // I.e. if we had null values before, then we want to defer this
        // for each null value. However, we also don't want to call updateSlot
        // with the previous one.
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
            // The new fiber is a work in progress, but if there exists a
            // current, that means that we reused the fiber. We need to delete
            // it from the child list so that we don't add it to the deletion
            // list.
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
      // Any existing children that weren't consumed above were deleted. We need
      // to add them to the deletion list.
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
      // TODO: If key === null and child.key === null, then this only applies to
      // the first item in the list.
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
  // Attempt to complete the current unit of work, then move to the next
  // sibling. If there are no more siblings, return to the parent fiber.
  workInProgress = unitOfWork;

  do {
    // The current, flushed, state of this fiber is the alternate. Ideally
    // nothing should rely on this, but relying on it here means that we don't
    // need an additional field on the work in progress.
    const current = workInProgress.alternate;
    const returnFiber = workInProgress.return; // Check if the work completed or if something threw.
    let next = void 0;

    next = completeWork(current, workInProgress);

    if (
      returnFiber !== null && // Do not append effects to parents if a sibling failed to complete
      (returnFiber.effectTag & Incomplete) === NoEffect
    ) {
      // Append all the effects of the subtree and this fiber onto the effect
      // list of the parent. The completion order of the children affects the
      // side-effect order.
      if (returnFiber.firstEffect === null) {
        returnFiber.firstEffect = workInProgress.firstEffect;
      }

      if (workInProgress.lastEffect !== null) {
        if (returnFiber.lastEffect !== null) {
          returnFiber.lastEffect.nextEffect = workInProgress.firstEffect;
        }


        returnFiber.lastEffect = workInProgress.lastEffect;
      } // If this fiber had side-effects, we append it AFTER the children's
      // side-effects. We can perform certain side-effects earlier if needed,
      // by doing multiple passes over the effect list. We don't want to
      // schedule our own side-effect on our own list because if end up
      // reusing children we'll schedule this effect onto itself since we're
      // at the end.

      const effectTag = workInProgress.effectTag; // Skip both NoWork and PerformedWork tags when creating the effect
      // list. PerformedWork effect is read by React DevTools but shouldn't be
      // committed.

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
      // If there is more work to do in this returnFiber, do that next.
      return siblingFiber;
    } // Otherwise, return to the parent

    workInProgress = returnFiber;
  } while (workInProgress !== null); // We've reached the root.

  return null;
}

let performUnitOfWorkCounter = 0;

function performUnitOfWork(unitOfWork) {
  console.log(['performUnitOfWork'], performUnitOfWorkCounter, { unitOfWork });
  performUnitOfWorkCounter++;

  // The current, flushed, state of this fiber is the alternate. Ideally
  // nothing should rely on this, but relying on it here means that we don't
  // need an additional field on the work in progress.
  const current = unitOfWork.alternate;
  let next;

  next = beginWork(current, unitOfWork);

  unitOfWork.memoizedProps = unitOfWork.pendingProps;

  console.log(['performUnitOfWork.next'], next);

  if (next === null) {
    // If this doesn't spawn new work, complete the current work.
    next = completeUnitOfWork(unitOfWork);
  }

  ReactCurrentOwner.current = null;

  return next;
}

function hasSelectionCapabilities(elem) {
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

function getModernOffsetsFromPoints(
  outerNode,
  anchorNode,
  anchorOffset,
  focusNode,
  focusOffset,
) {
  let length = 0;
  let start = -1;
  let end = -1;
  let indexWithinAnchor = 0;
  let indexWithinFocus = 0;
  let node = outerNode;
  let parentNode = null;

  outer: while (true) {
    let next = null;

    while (true) {
      if (
        node === anchorNode &&
        (anchorOffset === 0 || node.nodeType === TEXT_NODE)
      ) {
        start = length + anchorOffset;
      }

      if (
        node === focusNode &&
        (focusOffset === 0 || node.nodeType === TEXT_NODE)
      ) {
        end = length + focusOffset;
      }

      if (node.nodeType === TEXT_NODE) {
        length += node.nodeValue.length;
      }

      if ((next = node.firstChild) === null) {
        break;
      } // Moving from `node` to its first child `next`.

      parentNode = node;
      node = next;
    }

    while (true) {
      if (node === outerNode) {
        // If `outerNode` has children, this is always the second time visiting
        // it. If it has no children, this is still the first loop, and the only
        // valid selection is anchorNode and focusNode both equal to this node
        // and both offsets 0, in which case we will have handled above.
        break outer;
      }

      if (parentNode === anchorNode && ++indexWithinAnchor === anchorOffset) {
        start = length;
      }

      if (parentNode === focusNode && ++indexWithinFocus === focusOffset) {
        end = length;
      }

      if ((next = node.nextSibling) !== null) {
        break;
      }

      node = parentNode;
      parentNode = node.parentNode;
    } // Moving from `node` to its next sibling `next`.

    node = next;
  }

  if (start === -1 || end === -1) {
    // This should never happen. (Would happen if the anchor/focus nodes aren't
    // actually inside the passed-in node.)
    return null;
  }

  return {
    start,
    end,
  };
}

function getSelectionInformation() {
  const focusedElem = getActiveElement();

  return {
    // Used by Flare
    activeElementDetached: null,
    focusedElem: focusedElem,
    selectionRange: null,
  };
}

function workLoopSync() {
  // Already timed out, so perform work without checking if we need to yield.
  while (workInProgress !== null) {
    const work = performUnitOfWork(workInProgress);

    workInProgress = work;
  }
}

let _enabled = true;

function isEnabled() {
  return _enabled;
}

function setEnabled(enabled) {
  _enabled = !!enabled;
}

let eventsEnabled = null;
let selectionInformation = null;

function prepareForCommit() {
  eventsEnabled = isEnabled();
  selectionInformation = getSelectionInformation();
  setEnabled(false);
}

function isTextNode(node) {
  return node && node.nodeType === TEXT_NODE;
}

function containsNode(outerNode, innerNode) {
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
  return (
    node &&
    node.ownerDocument &&
    containsNode(node.ownerDocument.documentElement, node)
  );
}

function getSiblingNode(node) {
  while (node) {
    if (node.nextSibling) {
      return node.nextSibling;
    }

    node = node.parentNode;
  }
}

function getLeafNode(node) {
  while (node && node.firstChild) {
    node = node.firstChild;
  }

  return node;
}

function getNodeForCharacterOffset(root, offset) {
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
  const doc = node.ownerDocument || document;
  const win = (doc && doc.defaultView) || window; // Edge fails with "Object expected" in some scenarios.
  // (For instance: TinyMCE editor used in a list component that supports pasting to add more,
  // fails when pasting 100+ items)

  if (!win.getSelection) {
    return;
  }

  const selection = win.getSelection();
  const length = node.textContent.length;
  let start = Math.min(offsets.start, length);
  let end = offsets.end === undefined ? start : Math.min(offsets.end, length); // IE 11 uses modern selection, but doesn't support the extend method.
  // Flip backward selections, so we can set with a single range.

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
  const curFocusedElem = getActiveElement();
  const priorFocusedElem = priorSelectionInformation.focusedElem;
  const priorSelectionRange = priorSelectionInformation.selectionRange;

  if (curFocusedElem !== priorFocusedElem && isInDocument(priorFocusedElem)) {
    if (
      priorSelectionRange !== null &&
      hasSelectionCapabilities(priorFocusedElem)
    ) {
      setSelection(priorFocusedElem, priorSelectionRange);
    } // Focusing a node can change the scroll position, which is undesirable

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
  restoreSelection(selectionInformation);
  setEnabled(eventsEnabled);
  eventsEnabled = null;

  selectionInformation = null;
}

let current = null;
let nextEffect = null;

function resetCurrentFiber() {
  current = null;
  isRendering = false;
}

function setCurrentFiber(fiber) {
  current = fiber;
  isRendering = false;
}

let effectCountInCurrentCommit = 0;

function recordEffect() {
  {
    effectCountInCurrentCommit++;
  }
}

function isHostParent(fiber) {
  return fiber.tag === HostComponent || fiber.tag === HostRoot;
}

function getHostParentFiber(fiber) {
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

  // We're going to search forward into the tree until we find a sibling host
  // node. Unfortunately, if multiple insertions are done in a row we have to
  // search past them. This leads to exponential search for the next sibling.
  // TODO: Find a more efficient way to do this.
  let node = fiber;

  siblings: while (true) {
    // If we didn't find anything, let's try the next sibling.
    while (node.sibling === null) {
      if (node.return === null || isHostParent(node.return)) {
        // If we pop out of the root or hit the parent the fiber we are the
        // last sibling.
        return null;
      }

      node = node.return;
    }

    node.sibling.return = node.return;
    node = node.sibling;

    while (node.tag !== HostComponent && node.tag !== HostText) {
      // If it is not host node and, we might have a host node inside it.
      // Try to search down until we find one.
      if (node.effectTag & Placement) {
        // If we don't have a child, try the siblings instead.
        continue siblings;
      } // If we don't have a child, try the siblings instead.
      // We also skip portals because they are not part of this host tree.

      if (node.child === null) {
        continue siblings;
      } else {
        node.child.return = node;
        node = node.child;
      }
    } // Check if this host node is stable or about to be placed.

    if (!(node.effectTag & Placement)) {
      // Found it!
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
  parentInstance.appendChild(child);
}

function insertOrAppendPlacementNode(node, before, parent) {
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

  const parentFiber = getHostParentFiber(finishedWork); // Note: these two variables *must* always be updated together.
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

  const before = getHostSibling(finishedWork); // We only have the top Fiber that was inserted but we need to recurse down its
  // children to find all the terminal nodes.

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
  // SVG-related properties
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
  // Note that we've removed escapeTextForBrowser() calls here since the
  // whole string will be escaped when the attribute is injected into
  // the markup. If you provide unsafe user data here they can inject
  // arbitrary CSS which may be problematic (I couldn't repro this):
  // https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
  // http://www.thespanner.co.uk/2007/11/26/ultimate-xss-css-injection/
  // This is not an XSS hole but instead a potential CSS injection issue
  // which has lead to a greater discussion about how we're going to
  // trust URLs moving forward. See #2115901
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
    return value + 'px'; // Presumes implicit 'px' suffix for unitless numbers
  }

  return ('' + value).trim();
}

function setValueForStyles(node, styles) {
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
  node.innerHTML = html;
}

const setTextContent = function (node, text) {
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

function setDefaultValue(node, type, value) {
  if (
    // Focused number inputs synchronize on blur. See ChangeEventPlugin.js
    type !== 'number' ||
    node.ownerDocument.activeElement !== node
  ) {
    if (value == null) {
      node.defaultValue = toString(node._wrapperState.initialValue);
    } else if (node.defaultValue !== toString(value)) {
      node.defaultValue = toString(value);
    }
  }
}

function updateWrapper(element, props) {
  const node = element;

  updateChecked(element, props);

  const value = getToStringValue(props.value);
  const type = props.type;

  if (value != null) {
    if (type === 'number') {
      if (
        (value === 0 && node.value === '') || // We explicitly want to coerce to number here if possible.
        // eslint-disable-next-line
        node.value != value) {
        node.value = toString(value);
      }
    } else if (node.value !== toString(value)) {
      node.value = toString(value);
    }
  } else if (type === 'submit' || type === 'reset') {
    // Submit/reset inputs need the attribute removed completely to avoid
    // blank-text buttons.
    node.removeAttribute('value');

    return;
  }

  {
    // When syncing the value attribute, the value comes from a cascade of
    // properties:
    //  1. The value React property
    //  2. The defaultValue React property
    //  3. Otherwise there should be no change
    if (props.hasOwnProperty('value')) {
      setDefaultValue(node, props.type, value);
    } else if (props.hasOwnProperty('defaultValue')) {
      setDefaultValue(node, props.type, getToStringValue(props.defaultValue));
    }
  }

  {
    // When syncing the checked attribute, it only changes when it needs
    // to be removed, such as transitioning from a checkbox into a text input
    if (props.checked == null && props.defaultChecked != null) {
      node.defaultChecked = !!props.defaultChecked;
    }
  }
}

function shouldIgnoreAttribute(name, isCustomComponentTag) {
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
  if (value === null || typeof value === 'undefined') {
    return true;
  }

  if (isCustomComponentTag) {
    return false;
  }

  return false;
}

function setValueForProperty(node, name, value, isCustomComponentTag) {
  const propertyInfo = null;

  if (shouldIgnoreAttribute(name, isCustomComponentTag)) {
    return;
  }

  if (shouldRemoveAttribute(name, value, propertyInfo, isCustomComponentTag)) {
    value = null;
  } // If the prop isn't in the special list, treat it as a simple attribute.

  const mustUseProperty = propertyInfo.mustUseProperty;

  if (mustUseProperty) {
    const propertyName = propertyInfo.propertyName;

    if (value === null) {
      const type = propertyInfo.type;

      node[propertyName] = type === BOOLEAN ? false : '';
    } else {
      // Contrary to `setAttribute`, object properties are properly
      // `toString`ed by IE8/9.
      node[propertyName] = value;
    }

    return;
  } // The rest are treated as attributes with special cases.

  const attributeName = propertyInfo.attributeName,
    attributeNamespace = propertyInfo.attributeNamespace;

  if (value === null) {
    node.removeAttribute(attributeName);
  } else {
    const _type = propertyInfo.type;
    let attributeValue;

    if (_type === BOOLEAN || (_type === OVERLOADED_BOOLEAN && value === true)) {
      // If attribute type is boolean, we know for sure it won't be an execution sink
      // and we won't require Trusted Type here.
      attributeValue = '';
    } else {
      // `setAttribute` with objects becomes only `[object]` in IE8/9,
      // ('' + value) makes it output the correct toString()-value.
      {
        attributeValue = '' + value;
      }

      if (propertyInfo.sanitizeURL) {
        sanitizeURL(attributeValue.toString());
      }
    }

    if (attributeNamespace) {
      node.setAttributeNS(attributeNamespace, attributeName, attributeValue);
    } else {
      node.setAttribute(attributeName, attributeValue);
    }
  }
}

function updateChecked(element, props) {
  const node = element;
  const checked = props.checked;

  if (checked != null) {
    setValueForProperty(node, 'checked', checked, false);
  }
}

function getToStringValue(value) {
  switch (typeof value) {
    case 'boolean':
    case 'number':
    case 'object':
    case 'string':
    case 'undefined':
      return value;
    default:
      // function, symbol are assigned as empty strings
      return '';
  }
}

function updateWrapper$1(element, props) {
  const node = element;
  const value = getToStringValue(props.value);
  const defaultValue = getToStringValue(props.defaultValue);

  if (value != null) {
    // Cast `value` to a string to ensure the value is set correctly. While
    // browsers typically do this as necessary, jsdom doesn't.
    const newValue = toString(value); // To avoid side effects (such as losing text selection), only set value if changed

    if (newValue !== node.value) {
      node.value = newValue;
    }

    if (props.defaultValue == null && node.defaultValue !== newValue) {
      node.defaultValue = newValue;
    }
  }

  if (defaultValue != null) {
    node.defaultValue = toString(defaultValue);
  }
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
  // Update the props handle so that we know which props are the ones with
  // with current event handlers.
  updateFiberProps(domElement, newProps); // Apply the diff to the DOM node.

  updateProperties(domElement, updatePayload, type, oldProps, newProps);
}

function commitWork(current, finishedWork) {
  console.log(['commitWork'], { current, finishedWork });

  switch (finishedWork.tag) {
    case HostComponent: {
      const instance = finishedWork.stateNode;

      if (instance != null) {
        // Commit the work prepared earlier.
        const newProps = finishedWork.memoizedProps; // For hydration we reuse the update path but we treat the oldProps
        // as the newProps. The updatePayload will contain the real change in
        // this case.
        const oldProps = current !== null ? current.memoizedProps : newProps;
        const type = finishedWork.type; // TODO: Type the updateQueue to be specific to host components.
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
    // Recursively delete all host nodes from the parent.
    // Detach refs and call componentWillUnmount() on the whole subtree.
    unmountHostComponents(finishedRoot, current);
  }

  detachFiber(current);
}

function detachFiber(current) {
  console.log(['detachFiber'], { current });

  const alternate = current.alternate; // Cut off the return pointers to disconnect it from the tree. Ideally, we
  // should clear the child pointer of the parent alternate to let this
  // get GC:ed but we don't know which for sure which parent is the current
  // one so we'll settle for GC:ing the subtree of this child. This child
  // itself will be GC:ed when the parent updates the next time.

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

  // While we're inside a removed host node we don't want to call
  // removeChild on the inner nodes because they're removed by the top
  // call anyway. We also want to call componentWillUnmount on all
  // composites before this host node is removed from the tree. Therefore
  // we do an inner loop while we're still inside the host node.
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
  parentInstance.removeChild(child);
}

function removeChildFromContainer(container, child) {
  container.removeChild(child);
}

function unmountHostComponents(finishedRoot, current) {
  console.log(['unmountHostComponents'], {
    finishedRoot,
    current,
  });

  // We only have the top Fiber that was deleted but we need to recurse down its
  // children to find all the terminal nodes.
  let node = current; // Each iteration, currentParent is populated with node's host parent if not
  // currentParentIsValid.
  let currentParentIsValid = false; // Note: these two variables *must* always be updated together.
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

    commitNestedUnmounts(finishedRoot, node); // After all the children have unmounted, it is now safe to remove the
    // node from the tree.

    if (currentParentIsContainer) {
      removeChildFromContainer(currentParent, node.stateNode);
    } else {
      removeChild(currentParent, node.stateNode);
    } // Don't visit children because we already visited them.

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
  setTextContent(domElement, '');
}
function commitResetTextContent(current) {
  resetTextContent(current.stateNode);
}
function commitDetachRef(current) {
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

  // TODO: Should probably move the bulk of this function to commitWork.
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
    } // The following switch statement is only concerned about placement,
    // updates, and deletions. To avoid needing to add a case for every possible
    // bitmap value, we remove the secondary effects from the effect tag and
    // switch on that value.

    const primaryEffectTag = effectTag & (Placement | Update | Deletion);

    switch (primaryEffectTag) {
      case Placement: {
        commitPlacement(nextEffect); // Clear the "placement" from effect tag so that we know that this is
        // inserted, before any life-cycles like componentDidMount gets called.
        // TODO: findDOMNode doesn't rely on this any more but isMounted does
        // and isMounted is deprecated anyway so we should be able to kill this.

        nextEffect.effectTag &= ~Placement;

        break;
      }
      case PlacementAndUpdate: {
        // Placement
        commitPlacement(nextEffect); // Clear the "placement" from effect tag so that we know that this is
        // inserted, before any life-cycles like componentDidMount gets called.

        nextEffect.effectTag &= ~Placement; // Update

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
    } // TODO: Only record a mutation effect if primaryEffectTag is non-zero.

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
    // We can reset these now that they are finished.
    workInProgressRoot = null;
    workInProgress = null;
  } // This indicates that the last root we worked on is not the same one that
  // we're committing now. This most commonly happens when a suspended root
  // times out.
  // Get the list of effects.

  let firstEffect;

  if (finishedWork.effectTag > PerformedWork) {
    // A fiber's effect list consists only of its children, not itself. So if
    // the root has an effect, we need to add it to the end of the list. The
    // resulting list is the set that would belong to the root's parent, if it
    // had one; that is, all the effects in the tree including the root.
    if (finishedWork.lastEffect !== null) {
      finishedWork.lastEffect.nextEffect = finishedWork;
      firstEffect = finishedWork.firstEffect;
    } else {
      firstEffect = finishedWork;
    }
  } else {
    // There is no effect on the root.
    firstEffect = finishedWork.firstEffect;
  }

  ReactCurrentOwner.current = null; // The commit phase is broken into several sub-phases. We do a separate pass
  // of the effect list for each phase: all mutation effects come before all
  // layout effects, and so on.
  // The first phase a "before mutation" phase. We use this phase to read the
  // state of the host tree right before we mutate it. This is where
  // getSnapshotBeforeUpdate is called.

  prepareForCommit();
  nextEffect = firstEffect;

  nextEffect = firstEffect;

  do {
    commitMutationEffects(root);
  } while (nextEffect !== null);

  resetAfterCommit(); // The work-in-progress tree is now the current tree. This must come after
  // the mutation phase, so that the previous tree is still current during
  // componentWillUnmount, but before the layout phase, so that the finished
  // work is current during componentDidMount/Update.

  root.current = finishedWork; // The next phase is the layout phase, where we call effects that read
  // the host tree after it's been mutated. The idiomatic use case for this is
  // layout, but class component lifecycles also fire here for legacy reasons.

  nextEffect = firstEffect;

  nextEffect = null; // Tell Scheduler to yield at the end of the frame, so the browser has an
  // opportunity to paint.

  return null;
}

function finishSyncRender(root) {
  // Set this to null to indicate there's no in-progress render.
  workInProgressRoot = null;
  commitRoot(root);
}

function performSyncWorkOnRoot(root) {
  console.log(['performSyncWorkOnRoot'], root);

  // Check if there's expired work on this root.
  if (root !== workInProgressRoot) {
    prepareFreshStack(root);
  }

  // If we have a work-in-progress fiber, it means there's still work to do
  // in this root.
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
  if (!isFlushingSyncQueue && syncQueue !== null) {
    // Prevent re-entrancy.
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
      // If something throws, leave the remaining callbacks on the queue.
      if (syncQueue !== null) {
        syncQueue = syncQueue.slice(i + 1);
      } // Resume flushing in the next tick

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

  // Flush the synchronous work now, unless we're already working or inside
  // a batch. This is intentionally inside scheduleUpdateOnFiber instead of
  // scheduleCallbackForFiber to preserve the ability to schedule a callback
  // without immediately flushing it. We only do this for user-initiated
  // updates, to preserve historical behavior of legacy mode.
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
/**
 * Ordered list of injected plugins.
 */

var plugins = [];
/**
 * Publishes an event so that it can be dispatched by the supplied plugin.
 *
 * @param {object} dispatchConfig Dispatch configuration for the event.
 * @param {object} PluginModule Plugin publishing the event.
 * @return {boolean} True if the event was successfully published.
 * @private
 */
var eventNameDispatchConfigs = {};
function publishEventForPlugin(dispatchConfig, pluginModule, eventName) {
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
  console.log(['recomputePluginOrdering'])
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
      )
    }
  }
}

function injectEventPluginsByName(injectedNamesToPlugins) {
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
  {
    // these have a getter/setter for warnings
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
      delete this[propName]; // this has a getter/setter for warnings
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
  const EventConstructor = this;

  if (EventConstructor.eventPool.length < EVENT_POOL_SIZE) {
    EventConstructor.eventPool.push(event);
  }
}
function addEventPoolingTo(EventConstructor) {
  EventConstructor.eventPool = [];
  EventConstructor.getPooled = getPooledEvent;
  EventConstructor.release = releasePooledEvent;
}
SyntheticEvent.extend = function (Interface) {
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
  do {
    inst = inst.return; // TODO: If this is a HostRoot we might want to bail out.
    // That is depending on if we want nested subtrees (layers) to bubble
    // events to their parent. We could also go through parentNode on the
    // host node but that wouldn't work for React Native and doesn't let us
    // do the portal feature.
  } while (inst && inst.tag !== HostComponent);

  if (inst) {
    return inst;
  }

  return null;
}
function traverseTwoPhase(inst, fn, arg) {
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
/**
 * Given a DOM node, return the ReactDOMComponent or ReactDOMTextComponent
 * instance, or null if the node was not rendered by this React.
 */

function getInstanceFromNode$1(node) {
  console.log(['getInstanceFromNode$1']);

  const inst =
    node[internalInstanceKey] || node[internalContainerInstanceKey];

  if (inst) {
    if (
      inst.tag === HostComponent ||
      inst.tag === HostText ||
      inst.tag === HostRoot
    ) {
      return inst;
    } else {
      return null;
    }
  }

  return null;
}

/**
 * Given a ReactDOMComponent or ReactDOMTextComponent, return the corresponding
 * DOM node.
 */

function getNodeFromInstance$1(inst) {
  if (inst.tag === HostComponent || inst.tag === HostText) {
    // In Fiber this, is just the state node right now. We assume it will be
    // a host component or host text.
    return inst.stateNode;
  }
}

function getFiberCurrentPropsFromNode$1(node) {
  return node[internalEventHandlersKey] || null;
}
function setComponentTree(
  getFiberCurrentPropsFromNodeImpl,
  getInstanceFromNodeImpl,
  getNodeFromInstanceImpl,
) {
  getFiberCurrentPropsFromNode = getFiberCurrentPropsFromNodeImpl;
  getInstanceFromNode = getInstanceFromNodeImpl;
  getNodeFromInstance = getNodeFromInstanceImpl;
}
setComponentTree(
  getFiberCurrentPropsFromNode$1,
  getInstanceFromNode$1,
  getNodeFromInstance$1,
);
/**
 * @param {object} inst The instance, which is the source of events.
 * @param {string} registrationName Name of listener (e.g. `onClick`).
 * @return {?function} The stored callback.
 */

function getListener(inst, registrationName) {
  let listener; // TODO: shouldPreventMouseEvent is DOM-specific and definitely should not
  // live here; needs to be moved to a better place soon
  const stateNode = inst.stateNode;

  if (!stateNode) {
    // Work in progress (ex: onload events in incremental mode).
    return null;
  }

  const props = getFiberCurrentPropsFromNode(stateNode);

  if (!props) {
    // Work in progress.
    return null;
  }

  listener = props[registrationName];

  return listener;
}
/**
 * Some event types have a notion of different registration names for different
 * "phases" of propagation. This finds listeners by a given phase.
 */
function listenerAtPhase(inst, event, propagationPhase) {
  const registrationName =
    event.dispatchConfig.phasedRegistrationNames[propagationPhase];

  return getListener(inst, registrationName);
}

/**
 * A small set of propagation patterns, each of which will accept a small amount
 * of information, and generate a set of "dispatch ready event objects" - which
 * are sets of events that have already been annotated with a set of dispatched
 * listener functions/ids. The API is designed this way to discourage these
 * propagation strategies from actually executing the dispatches, since we
 * always want to collect the entire set of dispatches before executing even a
 * single one.
 */

/**
 * Tags a `SyntheticEvent` with dispatched listeners. Creating this function
 * here, allows us to not have to bind or create functions for each event.
 * Mutating the event's members allows us to not have to create a wrapping
 * "dispatch" object that pairs the event with the listener.
 */

function accumulateDirectionalDispatches(inst, phase, event) {
  console.log(['accumulateDirectionalDispatches'])

  const listener = listenerAtPhase(inst, event, phase);

  if (listener) {
    event._dispatchListeners = accumulateInto(
      event._dispatchListeners,
      listener,
    );
    event._dispatchInstances = accumulateInto(event._dispatchInstances, inst);
  }
}
/**
 * Collect dispatches (must be entirely collected before dispatching - see unit
 * tests). Lazily allocate the array to conserve memory.  We must loop through
 * each event and perform the traversal for each one. We cannot perform a
 * single traversal for the entire collection of events because each event may
 * have a different target.
 */

function accumulateTwoPhaseDispatchesSingle(event) {
  if (event && event.dispatchConfig.phasedRegistrationNames) {
    traverseTwoPhase(
      event._targetInst,
      accumulateDirectionalDispatches,
      event,
    );
  }
}

function accumulateTwoPhaseDispatches(events) {
  console.log(['accumulateTwoPhaseDispatches'], { events })
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
  eventPluginOrder = Array.prototype.slice.call(injectedEventPluginOrder);
  recomputePluginOrdering();
}
/**
 * Specifies a deterministic ordering of `EventPlugin`s. A convenient way to
 * reason about plugins, without having to package every one of them. This
 * is better than having plugins be ordered in the same order that they
 * are injected because that ordering would be influenced by the packaging order.
 * `ResponderEventPlugin` must occur before `SimpleEventPlugin` so that
 * preventing default on events is convenient in `SimpleEventPlugin` handlers.
 */

const DOMEventPluginOrder = [
  'SimpleEventPlugin',
];

const eventPriorities = new Map(); // We store most of the events in this module in pairs of two strings so we can re-use
// the code required to apply the same logic for event prioritization and that of the
// SimpleEventPlugin. This complicates things slightly, but the aim is to reduce code
// duplication (for which there would be quite a bit). For the events that are not needed
// for the SimpleEventPlugin (otherDiscreteEvents) we process them separately as an
// array of top level events.
// Lastly, we ignore prettier so we can keep the formatting sane.
// prettier-ignore
function processSimpleEventPluginPairsByPriority(eventTypes, priority) {
  // As the event types are in pairs of two, we need to iterate
  // through in twos. The events are in pairs of two to save code
  // and improve init perf of processing this array, as it will
  // result in far fewer object allocations and property accesses
  // if we only use three arrays to process all the categories of
  // instead of tuples.
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
  console.error(['error'], e.toString())
}
const OwnReact = {
  createElement,
  render,
  useState,
};

export default OwnReact;
