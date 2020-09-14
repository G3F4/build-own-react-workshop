"use strict";
exports.__esModule = true;
var topLevelFunctionsCallRegister = {};
var missingNamesInRegister = [];
var topLevelFunctionsRegister = [];
window.topLevelFunctionsCallRegister = topLevelFunctionsCallRegister;
window.missingNamesInRegister = missingNamesInRegister;
window.topLevelFunctionsRegister = topLevelFunctionsRegister;
window.noCalls = function () {
    return topLevelFunctionsRegister.filter(function (key) { return !topLevelFunctionsCallRegister[key]; });
};
function logFuncUsage() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var name = args[0][0];
    if (topLevelFunctionsRegister.includes(name)) {
        if (topLevelFunctionsCallRegister[name]) {
            topLevelFunctionsCallRegister[name]++;
        }
        else {
            topLevelFunctionsCallRegister[name] = 1;
        }
    }
    else {
        missingNamesInRegister.push(name);
        if (topLevelFunctionsCallRegister[name]) {
            topLevelFunctionsCallRegister[name]++;
        }
        else {
            topLevelFunctionsCallRegister[name] = 1;
        }
    }
    // console.log(...args);
}
var NO_CONTEXT = {};
var HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
var MATH_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
var TEXT_NODE = 3;
var DOCUMENT_NODE = 9;
var DOCUMENT_FRAGMENT_NODE = 11;
var UpdateState = 0;
var NoEffect = 0;
var PerformedWork = 1;
var Placement = 2;
var Update = 4;
var PlacementAndUpdate = 6;
var Deletion = 8;
var Incomplete = 2048;
var FunctionComponent = 0;
var IndeterminateComponent = 2;
var HostRoot = 3;
var HostComponent = 5;
var HostText = 6;
var currentlyRenderingFiber = null;
var ReactCurrentOwner = {
    current: null,
};
var ReactCurrentDispatcher = {
    current: null,
};
var currentHook = null;
var workInProgressHook = null;
var HooksDispatcherOnMount = null;
var HooksDispatcherOnUpdate = null;
var DiscreteEvent = 0;
var ContextOnlyDispatcher = {
    useState: null,
};
var EVENT_POOL_SIZE = 10;
var _enabled = true;
var DOMEventPluginOrder = ['SimpleEventPlugin'];
var eventPriorities = new Map();
var randomKey = Math.random().toString(36).slice(2);
var internalInstanceKey = '__reactInternalInstance$' + randomKey;
var internalEventHandlersKey = '__reactEventHandlers$' + randomKey;
var REACT_ELEMENT_TYPE = Symbol["for"]('react.element');
var PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map; // prettier-ignore
var elementListenerMap = new PossiblyWeakMap();
var getFiberCurrentPropsFromNode = null;
var getNodeFromInstance = null;
var namesToPlugins = {};
var eventPluginOrder = null;
var plugins = [];
var eventNameDispatchConfigs = {};
var eventsEnabled = null;
var valueStack = [];
var fiberStack = [];
var index = -1;
var syncQueue = null;
var simpleEventPluginEventTypes = {};
var topLevelEventsToDispatchConfig = new Map();
var workInProgressRoot = null; // The root we're working on
var workInProgress = null; // The fiber we're working on
var PLUGIN_EVENT_SYSTEM = 1;
var registrationNameDependencies = {};
var CALLBACK_BOOKKEEPING_POOL_SIZE = 10;
var callbackBookkeepingPool = [];
var IS_FIRST_ANCESTOR = 1 << 6;
var eventQueue = null;
var registrationNameModules = {};
var HTML$1 = '__html';
var STYLE = 'style';
var isArray$1 = Array.isArray;
var performUnitOfWorkCounter = 0;
var nextEffect = null;
var DANGEROUSLY_SET_INNER_HTML = 'dangerouslySetInnerHTML';
var AUTOFOCUS = 'autoFocus';
var CHILDREN = 'children';
var isUnitlessNumber = {
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
var immediateQueueCallbackNode = null;
var isBatchingEventUpdates = false;
topLevelFunctionsRegister.push('useState');
function useState(initialState) {
    logFuncUsage(['useState'], { initialState: initialState });
    return ReactCurrentDispatcher.current.useState(initialState);
}
topLevelFunctionsRegister.push('ReactElement');
function ReactElement(type, props) {
    logFuncUsage(['ReactElement'], { type: type, props: props });
    return {
        $$typeof: REACT_ELEMENT_TYPE,
        type: type,
        props: props,
    };
}
topLevelFunctionsRegister.push('createElement');
function createElement(type, config, children) {
    logFuncUsage(['createElement'], { type: type, config: config, children: children });
    var propName;
    var props = {};
    if (config != null) {
        for (propName in config) {
            props[propName] = config[propName];
        }
    }
    var childrenLength = arguments.length - 2;
    if (childrenLength === 1) {
        props.children = children;
    }
    else if (childrenLength > 1) {
        var childArray = Array(childrenLength);
        for (var i = 0; i < childrenLength; i++) {
            childArray[i] = arguments[i + 2];
        }
        props.children = childArray;
    }
    return ReactElement(type, props);
}
topLevelFunctionsRegister.push('FiberNode');
function FiberNode(tag, pendingProps, key) {
    logFuncUsage(['FiberNode'], { tag: tag, pendingProps: pendingProps, key: key });
    this.tag = tag;
    this.key = key;
    this.elementType = null;
    this.type = null;
    this.stateNode = null; // Fiber
    this["return"] = null;
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
    logFuncUsage(['createFiber'], { tag: tag, pendingProps: pendingProps, key: key });
    return new FiberNode(tag, pendingProps, key);
}
topLevelFunctionsRegister.push('createFiberRoot');
function createFiberRoot(containerInfo) {
    logFuncUsage(['createFiberRoot'], { containerInfo: containerInfo });
    var current = createFiber(HostRoot, null, null);
    var root = {
        current: current,
        finishedWork: null,
        containerInfo: containerInfo,
    };
    current.stateNode = root;
    current.updateQueue = {
        shared: {
            pending: null,
        },
    };
    return root;
}
topLevelFunctionsRegister.push('createUpdate');
function createUpdate() {
    logFuncUsage(['createUpdate']);
    var update = {
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
    logFuncUsage(['enqueueUpdate'], { fiber: fiber, update: update });
    var updateQueue = fiber.updateQueue;
    if (updateQueue === null) {
        // Only occurs if the fiber has been unmounted.
        return;
    }
    var sharedQueue = updateQueue.shared;
    var pending = sharedQueue.pending;
    if (pending === null) {
        // This is the first update. Create a circular list.
        update.next = update;
    }
    else {
        update.next = pending.next;
        pending.next = update;
    }
    sharedQueue.pending = update;
}
topLevelFunctionsRegister.push('markUpdateTimeFromFiberToRoot');
function markUpdateTimeFromFiberToRoot(fiber) {
    logFuncUsage(['markUpdateTimeFromFiberToRoot'], { fiber: fiber });
    var alternate = fiber.alternate;
    var node = fiber["return"];
    var root = null;
    if (node === null && fiber.tag === HostRoot) {
        root = fiber.stateNode;
    }
    else {
        while (node !== null) {
            alternate = node.alternate;
            if (node["return"] === null && node.tag === HostRoot) {
                root = node.stateNode;
                break;
            }
            node = node["return"];
        }
    }
    return root;
}
topLevelFunctionsRegister.push('scheduleSyncCallback');
function scheduleSyncCallback(callback) {
    logFuncUsage(['scheduleSyncCallback'], { callback: callback });
    if (syncQueue === null) {
        syncQueue = [callback];
    }
    else {
        syncQueue.push(callback);
    }
}
topLevelFunctionsRegister.push('createWorkInProgress');
function createWorkInProgress(current, pendingProps) {
    logFuncUsage(['createWorkInProgress'], { current: current, pendingProps: pendingProps });
    var workInProgress = current.alternate;
    if (workInProgress === null) {
        workInProgress = createFiber(current.tag, pendingProps, current.key);
        workInProgress.elementType = current.elementType;
        workInProgress.type = current.type;
        workInProgress.stateNode = current.stateNode;
        workInProgress.alternate = current;
        current.alternate = workInProgress;
    }
    else {
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
    logFuncUsage(['prepareFreshStack'], { root: root });
    root.finishedWork = null;
    workInProgressRoot = root;
    workInProgress = createWorkInProgress(root.current, null);
}
topLevelFunctionsRegister.push('pop');
function pop(cursor) {
    logFuncUsage(['pop'], { cursor: cursor });
    cursor.current = valueStack[index];
    valueStack[index] = null;
    {
        fiberStack[index] = null;
    }
    index--;
}
topLevelFunctionsRegister.push('push');
function push(cursor, value, fiber) {
    logFuncUsage(['push'], { cursor: cursor, value: value, fiber: fiber });
    index++;
    valueStack[index] = cursor.current;
    {
        fiberStack[index] = fiber;
    }
    cursor.current = value;
}
topLevelFunctionsRegister.push('getIntrinsicNamespace');
function getIntrinsicNamespace(type) {
    logFuncUsage(['getIntrinsicNamespace'], { type: type });
    switch (type) {
        case 'svg':
            return SVG_NAMESPACE;
        case 'math':
            return MATH_NAMESPACE;
        default:
            return HTML_NAMESPACE;
    }
}
var contextStackCursor$1 = createCursor(NO_CONTEXT);
topLevelFunctionsRegister.push('pushHostContainer');
function pushHostContainer(fiber, nextRootInstance) {
    logFuncUsage(['pushHostContainer'], { fiber: fiber, nextRootInstance: nextRootInstance });
    push(rootInstanceStackCursor, nextRootInstance, fiber);
    var nextRootContext = {
        namespace: HTML_NAMESPACE,
        ancestorInfo: '',
    };
    pop(contextStackCursor$1);
    push(contextStackCursor$1, nextRootContext, fiber);
}
topLevelFunctionsRegister.push('getStateFromUpdate');
function getStateFromUpdate(workInProgress, queue, update, prevState, nextProps, instance) {
    logFuncUsage(['getStateFromUpdate'], {
        workInProgress: workInProgress,
        queue: queue,
        update: update,
        prevState: prevState,
        nextProps: nextProps,
        instance: instance,
    });
    return Object.assign({}, prevState, update.payload);
}
topLevelFunctionsRegister.push('processUpdateQueue');
function processUpdateQueue(workInProgress, props, instance) {
    logFuncUsage(['processUpdateQueue'], { workInProgress: workInProgress, props: props, instance: instance });
    console.log(['processUpdateQueue'], { workInProgress: workInProgress, props: props, instance: instance });
    var queue = workInProgress.updateQueue;
    var baseQueue = queue.baseQueue;
    var pendingQueue = queue.shared.pending;
    if (pendingQueue !== null) {
        baseQueue = pendingQueue;
        queue.shared.pending = null;
        var current = workInProgress.alternate;
        if (current !== null) {
            var currentQueue = current.updateQueue;
            if (currentQueue !== null) {
                currentQueue.baseQueue = pendingQueue;
            }
        }
    }
    if (baseQueue !== null) {
        var first = baseQueue.next;
        var newState = queue.baseState;
        var newBaseState = null;
        var newBaseQueueLast = null;
        if (first !== null) {
            var update = first;
            do {
                newState = getStateFromUpdate(workInProgress, queue, update, newState, props, instance);
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
}
var reconcileChildFibers = ChildReconciler(true);
var mountChildFibers = ChildReconciler(false);
topLevelFunctionsRegister.push('reconcileChildren');
function reconcileChildren(current, workInProgress, nextChildren) {
    logFuncUsage(['reconcileChildren'], {
        current: current,
        workInProgress: workInProgress,
        nextChildren: nextChildren,
    });
    if (current === null) {
        workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
    }
    else {
        workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren);
    }
}
topLevelFunctionsRegister.push('updateHostRoot');
function updateHostRoot(current, workInProgress) {
    logFuncUsage(['updateHostRoot'], {
        current: current,
        workInProgress: workInProgress,
    });
    pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
    var nextProps = workInProgress.pendingProps;
    processUpdateQueue(workInProgress, nextProps, null);
    var nextChildren = workInProgress.memoizedState.element;
    reconcileChildren(current, workInProgress, nextChildren);
    return workInProgress.child;
}
topLevelFunctionsRegister.push('mountWorkInProgressHook');
function mountWorkInProgressHook() {
    logFuncUsage(['mountWorkInProgressHook']);
    var hook = {
        memoizedState: null,
        baseState: null,
        baseQueue: null,
        queue: null,
        next: null,
    };
    if (workInProgressHook === null) {
        currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
    }
    else {
        workInProgressHook = workInProgressHook.next = hook;
    }
    return workInProgressHook;
}
topLevelFunctionsRegister.push('dispatchAction');
function dispatchAction(fiber, queue, action) {
    logFuncUsage(['dispatchAction'], { fiber: fiber, queue: queue, action: action });
    var update = {
        action: action,
        eagerReducer: null,
        eagerState: null,
        next: null,
    };
    var pending = queue.pending;
    if (pending === null) {
        update.next = update;
    }
    else {
        update.next = pending.next;
        pending.next = update;
    }
    queue.pending = update;
    var lastRenderedReducer = queue.lastRenderedReducer;
    if (lastRenderedReducer !== null) {
        var prevDispatcher = void 0;
        {
            prevDispatcher = ReactCurrentDispatcher.current;
            // ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
        }
        ReactCurrentDispatcher.current = prevDispatcher;
    }
    scheduleWork(fiber);
}
topLevelFunctionsRegister.push('mountState');
function mountState(initialState) {
    logFuncUsage(['mountState'], { initialState: initialState });
    var hook = mountWorkInProgressHook();
    if (typeof initialState === 'function') {
        initialState = initialState();
    }
    hook.memoizedState = hook.baseState = initialState;
    var queue = (hook.queue = {
        pending: null,
        dispatch: null,
        lastRenderedReducer: basicStateReducer,
        lastRenderedState: initialState,
    });
    var dispatch = (queue.dispatch = dispatchAction.bind(null, currentlyRenderingFiber, queue));
    return [hook.memoizedState, dispatch];
}
{
    topLevelFunctionsRegister.push('HooksDispatcherOnMount.useState');
    HooksDispatcherOnMount = {
        useState: function (initialState) {
            logFuncUsage(['HooksDispatcherOnMount.useState'], { initialState: initialState });
            var prevDispatcher = ReactCurrentDispatcher.current;
            try {
                return mountState(initialState);
            }
            finally {
                ReactCurrentDispatcher.current = prevDispatcher;
            }
        },
    };
    topLevelFunctionsRegister.push('HooksDispatcherOnUpdate.useState');
    HooksDispatcherOnUpdate = {
        useState: function (initialState) {
            logFuncUsage(['HooksDispatcherOnUpdate.useState'], { initialState: initialState });
            var prevDispatcher = ReactCurrentDispatcher.current;
            try {
                return updateState();
            }
            finally {
                ReactCurrentDispatcher.current = prevDispatcher;
            }
        },
    };
}
topLevelFunctionsRegister.push('updateWorkInProgressHook');
function updateWorkInProgressHook() {
    logFuncUsage(['updateWorkInProgressHook']);
    var nextCurrentHook;
    if (currentHook === null) {
        var current = currentlyRenderingFiber.alternate;
        if (current !== null) {
            nextCurrentHook = current.memoizedState;
        }
        else {
            nextCurrentHook = null;
        }
    }
    else {
        nextCurrentHook = currentHook.next;
    }
    var nextWorkInProgressHook;
    if (workInProgressHook === null) {
        nextWorkInProgressHook = currentlyRenderingFiber.memoizedState;
    }
    else {
        nextWorkInProgressHook = workInProgressHook.next;
    }
    if (nextWorkInProgressHook !== null) {
        workInProgressHook = nextWorkInProgressHook;
        currentHook = nextCurrentHook;
    }
    else {
        currentHook = nextCurrentHook;
        var newHook = {
            memoizedState: currentHook.memoizedState,
            baseState: currentHook.baseState,
            baseQueue: currentHook.baseQueue,
            queue: currentHook.queue,
            next: null,
        };
        if (workInProgressHook === null) {
            currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
        }
        else {
            workInProgressHook = workInProgressHook.next = newHook;
        }
    }
    return workInProgressHook;
}
topLevelFunctionsRegister.push('updateReducer');
function updateReducer(reducer) {
    logFuncUsage(['updateReducer'], { reducer: reducer });
    var hook = updateWorkInProgressHook();
    var queue = hook.queue;
    queue.lastRenderedReducer = reducer;
    var current = currentHook;
    var baseQueue = current.baseQueue;
    var pendingQueue = queue.pending;
    if (pendingQueue !== null) {
        current.baseQueue = baseQueue = pendingQueue;
        queue.pending = null;
    }
    if (baseQueue !== null) {
        // We have a queue to process.
        var first = baseQueue.next;
        var newState = current.baseState;
        var update = first;
        do {
            newState = reducer(newState, update.action);
            update = update.next;
        } while (update !== null && update !== first);
        hook.memoizedState = newState;
        hook.baseState = newState;
        queue.lastRenderedState = newState;
    }
    var dispatch = queue.dispatch;
    return [hook.memoizedState, dispatch];
}
topLevelFunctionsRegister.push('updateState');
function updateState() {
    logFuncUsage(['updateState']);
    return updateReducer(basicStateReducer);
}
function basicStateReducer(state, action) {
    logFuncUsage(['basicStateReducer'], { state: state, action: action });
    return typeof action === 'function' ? action(state) : action;
}
topLevelFunctionsRegister.push('renderWithHooks');
function renderWithHooks(current, workInProgress, Component, props, secondArg) {
    logFuncUsage(['renderWithHooks'], {
        current: current,
        workInProgress: workInProgress,
        Component: Component,
        props: props,
        secondArg: secondArg,
    });
    currentlyRenderingFiber = workInProgress;
    workInProgress.memoizedState = null;
    workInProgress.updateQueue = null;
    if (current !== null && current.memoizedState !== null) {
        ReactCurrentDispatcher.current = HooksDispatcherOnUpdate;
    }
    else {
        ReactCurrentDispatcher.current = HooksDispatcherOnMount;
    }
    var children = Component(props, secondArg);
    ReactCurrentDispatcher.current = ContextOnlyDispatcher;
    currentlyRenderingFiber = null;
    currentHook = null;
    workInProgressHook = null;
    return children;
}
topLevelFunctionsRegister.push('mountIndeterminateComponent');
function mountIndeterminateComponent(_current, workInProgress, Component) {
    logFuncUsage(['mountIndeterminateComponent'], {
        _current: _current,
        workInProgress: workInProgress,
        Component: Component,
    });
    var props = workInProgress.pendingProps;
    var value;
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
    logFuncUsage(['updateHostComponent'], { current: current, workInProgress: workInProgress });
    reconcileChildren(current, workInProgress, workInProgress.pendingProps.children);
    return workInProgress.child;
}
topLevelFunctionsRegister.push('updateFunctionComponent');
function updateFunctionComponent(current, workInProgress, Component, nextProps) {
    logFuncUsage(['updateFunctionComponent'], {
        current: current,
        workInProgress: workInProgress,
        Component: Component,
        nextProps: nextProps,
    });
    var nextChildren;
    {
        ReactCurrentOwner.current = workInProgress;
        nextChildren = renderWithHooks(current, workInProgress, Component, nextProps, null);
    }
    workInProgress.effectTag |= PerformedWork;
    reconcileChildren(current, workInProgress, nextChildren);
    return workInProgress.child;
}
topLevelFunctionsRegister.push('beginWork');
function beginWork(current, workInProgress) {
    logFuncUsage(['beginWork'], { current: current, workInProgress: workInProgress });
    switch (workInProgress.tag) {
        case IndeterminateComponent: {
            return mountIndeterminateComponent(current, workInProgress, workInProgress.type);
        }
        case FunctionComponent: {
            return updateFunctionComponent(current, workInProgress, workInProgress.type, workInProgress.pendingProps);
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
    logFuncUsage(['precacheFiberNode'], { hostInst: hostInst, node: node });
    node[internalInstanceKey] = hostInst;
}
topLevelFunctionsRegister.push('updateFiberProps');
function updateFiberProps(node, props) {
    logFuncUsage(['updateFiberProps'], { node: node, props: props });
    node[internalEventHandlersKey] = props;
}
topLevelFunctionsRegister.push('getOwnerDocumentFromRootContainer');
function getOwnerDocumentFromRootContainer(rootContainerElement) {
    logFuncUsage(['getOwnerDocumentFromRootContainer'], { rootContainerElement: rootContainerElement });
    return rootContainerElement.nodeType === DOCUMENT_NODE
        ? rootContainerElement
        : rootContainerElement.ownerDocument;
}
topLevelFunctionsRegister.push('createInstance');
function createInstance(type, props, rootContainerInstance, hostContext, internalInstanceHandle) {
    logFuncUsage(['createInstance'], {
        type: type,
        props: props,
        rootContainerInstance: rootContainerInstance,
        hostContext: hostContext,
        internalInstanceHandle: internalInstanceHandle,
    });
    function createElement(type, props, rootContainerElement, parentNamespace) {
        var ownerDocument = getOwnerDocumentFromRootContainer(rootContainerElement);
        var domElement;
        var namespaceURI = parentNamespace;
        if (namespaceURI === HTML_NAMESPACE) {
            namespaceURI = getIntrinsicNamespace(type);
        }
        if (namespaceURI === HTML_NAMESPACE) {
            if (typeof props.is === 'string') {
                domElement = ownerDocument.createElement(type, {
                    is: props.is,
                });
            }
            else {
                domElement = ownerDocument.createElement(type);
                if (type === 'select') {
                    var node = domElement;
                    if (props.multiple) {
                        node.multiple = true;
                    }
                    else if (props.size) {
                        node.size = props.size;
                    }
                }
            }
        }
        else {
            domElement = ownerDocument.createElementNS(namespaceURI, type);
        }
        return domElement;
    }
    var parentNamespace;
    {
        var hostContextDev = hostContext;
        parentNamespace = hostContextDev.namespace;
    }
    var domElement = createElement(type, props, rootContainerInstance, parentNamespace);
    precacheFiberNode(internalInstanceHandle, domElement);
    updateFiberProps(domElement, props);
    return domElement;
}
topLevelFunctionsRegister.push('createCursor');
function createCursor(defaultValue) {
    logFuncUsage(['createCursor'], { defaultValue: defaultValue });
    return {
        current: defaultValue,
    };
}
var rootInstanceStackCursor = createCursor(NO_CONTEXT);
topLevelFunctionsRegister.push('appendInitialChild');
function appendInitialChild(parentInstance, child) {
    logFuncUsage(['appendInitialChild'], { parentInstance: parentInstance, child: child });
    parentInstance.appendChild(child);
}
topLevelFunctionsRegister.push('getRootHostContainer');
function getRootHostContainer() {
    logFuncUsage(['getRootHostContainer']);
    return rootInstanceStackCursor.current;
}
topLevelFunctionsRegister.push('diffProperties');
function diffProperties(domElement, tag, lastRawProps, nextRawProps, rootContainerElement) {
    logFuncUsage(['diffProperties'], {
        domElement: domElement,
        tag: tag,
        lastRawProps: lastRawProps,
        nextRawProps: nextRawProps,
        rootContainerElement: rootContainerElement,
    });
    var updatePayload = null;
    var lastProps;
    var nextProps;
    switch (tag) {
        default:
            lastProps = lastRawProps;
            nextProps = nextRawProps;
            break;
    }
    var propKey;
    var styleName;
    var styleUpdates = null;
    for (propKey in lastProps) {
        if (nextProps.hasOwnProperty(propKey) ||
            !lastProps.hasOwnProperty(propKey) ||
            lastProps[propKey] == null) {
            continue;
        }
        if (propKey === STYLE) {
            var lastStyle = lastProps[propKey];
            for (styleName in lastStyle) {
                if (lastStyle.hasOwnProperty(styleName)) {
                    if (!styleUpdates) {
                        styleUpdates = {};
                    }
                    styleUpdates[styleName] = '';
                }
            }
        }
        else if (propKey === AUTOFOCUS)
            ;
        else {
            (updatePayload = updatePayload || []).push(propKey, null);
        }
    }
    for (propKey in nextProps) {
        var nextProp = nextProps[propKey];
        var lastProp = lastProps != null ? lastProps[propKey] : undefined;
        if (!nextProps.hasOwnProperty(propKey) ||
            nextProp === lastProp ||
            (nextProp == null && lastProp == null)) {
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
                    if (lastProp.hasOwnProperty(styleName) &&
                        (!nextProp || !nextProp.hasOwnProperty(styleName))) {
                        if (!styleUpdates) {
                            styleUpdates = {};
                        }
                        styleUpdates[styleName] = '';
                    }
                }
                for (styleName in nextProp) {
                    if (nextProp.hasOwnProperty(styleName) &&
                        lastProp[styleName] !== nextProp[styleName]) {
                        if (!styleUpdates) {
                            styleUpdates = {};
                        }
                        styleUpdates[styleName] = nextProp[styleName];
                    }
                }
            }
            else {
                if (!styleUpdates) {
                    if (!updatePayload) {
                        updatePayload = [];
                    }
                    updatePayload.push(propKey, styleUpdates);
                }
                styleUpdates = nextProp;
            }
        }
        else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
            var nextHtml = nextProp ? nextProp[HTML$1] : undefined;
            var lastHtml = lastProp ? lastProp[HTML$1] : undefined;
            if (nextHtml != null) {
                if (lastHtml !== nextHtml) {
                    (updatePayload = updatePayload || []).push(propKey, nextHtml);
                }
            }
        }
        else if (propKey === CHILDREN) {
            if (lastProp !== nextProp &&
                (typeof nextProp === 'string' || typeof nextProp === 'number')) {
                (updatePayload = updatePayload || []).push(propKey, '' + nextProp);
            }
        }
        else if (registrationNameModules.hasOwnProperty(propKey)) {
            if (nextProp != null) {
                ensureListeningTo(rootContainerElement, propKey);
            }
            if (!updatePayload && lastProp !== nextProp) {
                updatePayload = [];
            }
        }
        else {
            (updatePayload = updatePayload || []).push(propKey, nextProp);
        }
    }
    if (styleUpdates) {
        (updatePayload = updatePayload || []).push(STYLE, styleUpdates);
    }
    return updatePayload;
}
topLevelFunctionsRegister.push('prepareUpdate');
function prepareUpdate(domElement, type, oldProps, newProps, rootContainerInstance) {
    logFuncUsage(['prepareUpdate'], {
        domElement: domElement,
        type: type,
        oldProps: oldProps,
        newProps: newProps,
        rootContainerInstance: rootContainerInstance,
    });
    return diffProperties(domElement, type, oldProps, newProps, rootContainerInstance);
}
var appendAllChildren;
var updateHostComponent$1;
{
    topLevelFunctionsRegister.push('appendAllChildren');
    appendAllChildren = function (parent, workInProgress) {
        logFuncUsage(['appendAllChildren'], { parent: parent, workInProgress: workInProgress });
        var node = workInProgress.child;
        while (node !== null) {
            if (node.tag === HostComponent || node.tag === HostText) {
                appendInitialChild(parent, node.stateNode);
            }
            else if (node.child !== null) {
                node.child["return"] = node;
                node = node.child;
                continue;
            }
            if (node === workInProgress) {
                return;
            }
            while (node.sibling === null) {
                if (node["return"] === null || node["return"] === workInProgress) {
                    return;
                }
                node = node["return"];
            }
            node.sibling["return"] = node["return"];
            node = node.sibling;
        }
    };
    topLevelFunctionsRegister.push('updateHostComponent$1');
    updateHostComponent$1 = function (current, workInProgress, type, newProps, rootContainerInstance) {
        logFuncUsage(['updateHostComponent$1'], {
            current: current,
            workInProgress: workInProgress,
            type: type,
            newProps: newProps,
            rootContainerInstance: rootContainerInstance,
        });
        var oldProps = current.memoizedProps;
        if (oldProps === newProps) {
            return;
        }
        var instance = workInProgress.stateNode;
        var updatePayload = prepareUpdate(instance, type, oldProps, newProps, rootContainerInstance);
        workInProgress.updateQueue = updatePayload;
        if (updatePayload) {
            markUpdate(workInProgress);
        }
    };
}
topLevelFunctionsRegister.push('isCustomComponent');
function isCustomComponent(tagName, props) {
    logFuncUsage(['isCustomComponent'], { tagName: tagName, props: props });
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
    logFuncUsage(['getListenerMapForElement'], { element: element });
    var listenerMap = elementListenerMap.get(element);
    if (listenerMap === undefined) {
        listenerMap = new Map();
        elementListenerMap.set(element, listenerMap);
    }
    return listenerMap;
}
topLevelFunctionsRegister.push('getTopLevelCallbackBookKeeping');
function getTopLevelCallbackBookKeeping(topLevelType, nativeEvent, targetInst, eventSystemFlags) {
    logFuncUsage(['getTopLevelCallbackBookKeeping'], {
        topLevelType: topLevelType,
        nativeEvent: nativeEvent,
        targetInst: targetInst,
        eventSystemFlags: eventSystemFlags,
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
    logFuncUsage(['releaseTopLevelCallbackBookKeeping'], { instance: instance });
    instance.topLevelType = null;
    instance.nativeEvent = null;
    instance.targetInst = null;
    instance.ancestors.length = 0;
    if (callbackBookkeepingPool.length < CALLBACK_BOOKKEEPING_POOL_SIZE) {
        callbackBookkeepingPool.push(instance);
    }
}
topLevelFunctionsRegister.push('batchedUpdatesImpl');
var batchedUpdatesImpl = function (fn, bookkeeping) {
    logFuncUsage(['batchedUpdatesImpl'], { fn: fn, bookkeeping: bookkeeping });
    return fn(bookkeeping);
};
var batchedEventUpdatesImpl = batchedUpdatesImpl;
topLevelFunctionsRegister.push('batchedEventUpdates');
function batchedEventUpdates(fn, a, b) {
    logFuncUsage(['batchedEventUpdates'], { fn: fn, a: a, b: b });
    if (isBatchingEventUpdates) {
        return fn(a, b);
    }
    isBatchingEventUpdates = true;
    try {
        return batchedEventUpdatesImpl(fn, a, b);
    }
    finally {
        isBatchingEventUpdates = false;
    }
}
topLevelFunctionsRegister.push('findRootContainerNode');
function findRootContainerNode(inst) {
    logFuncUsage(['findRootContainerNode'], { inst: inst });
    if (inst.tag === HostRoot) {
        return inst.stateNode.containerInfo;
    }
    while (inst["return"]) {
        inst = inst["return"];
    }
    if (inst.tag !== HostRoot) {
        return null;
    }
    return inst.stateNode.containerInfo;
}
topLevelFunctionsRegister.push('executeDispatch');
function executeDispatch(event, listener, inst) {
    logFuncUsage(['executeDispatch'], { event: event, listener: listener, inst: inst });
    event.currentTarget = getNodeFromInstance(inst);
    listener(undefined, event);
    event.currentTarget = null;
}
topLevelFunctionsRegister.push('executeDispatchesInOrder');
function executeDispatchesInOrder(event) {
    logFuncUsage(['executeDispatchesInOrder'], { event: event });
    var dispatchListeners = event._dispatchListeners;
    var dispatchInstances = event._dispatchInstances;
    if (Array.isArray(dispatchListeners)) {
        for (var i = 0; i < dispatchListeners.length; i++) {
            if (event.isPropagationStopped()) {
                break;
            }
            executeDispatch(event, dispatchListeners[i], dispatchInstances[i]);
        }
    }
    else if (dispatchListeners) {
        executeDispatch(event, dispatchListeners, dispatchInstances);
    }
    event._dispatchListeners = null;
    event._dispatchInstances = null;
}
topLevelFunctionsRegister.push('executeDispatchesAndRelease');
var executeDispatchesAndRelease = function (event) {
    logFuncUsage(['executeDispatchesAndRelease'], {
        executeDispatchesAndRelease: executeDispatchesAndRelease,
    });
    if (event) {
        executeDispatchesInOrder(event);
        event.constructor.release(event);
    }
};
topLevelFunctionsRegister.push('executeDispatchesAndReleaseTopLevel');
var executeDispatchesAndReleaseTopLevel = function (e) {
    logFuncUsage(['executeDispatchesAndReleaseTopLevel'], { e: e });
    return executeDispatchesAndRelease(e);
};
topLevelFunctionsRegister.push('accumulateInto');
function accumulateInto(current, next) {
    logFuncUsage(['accumulateInto'], { current: current, next: next });
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
    logFuncUsage(['forEachAccumulated'], { arr: arr, cb: cb });
    cb(arr);
}
topLevelFunctionsRegister.push('runEventsInBatch');
function runEventsInBatch(events) {
    logFuncUsage(['runEventsInBatch'], { events: events });
    if (events !== null) {
        eventQueue = accumulateInto(eventQueue, events);
    }
    var processingEventQueue = eventQueue;
    eventQueue = null;
    if (!processingEventQueue) {
        return;
    }
    forEachAccumulated(processingEventQueue, executeDispatchesAndReleaseTopLevel);
}
topLevelFunctionsRegister.push('extractPluginEvents');
function extractPluginEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags) {
    logFuncUsage(['extractPluginEvents'], {
        topLevelType: topLevelType,
        targetInst: targetInst,
        nativeEvent: nativeEvent,
        nativeEventTarget: nativeEventTarget,
        eventSystemFlags: eventSystemFlags,
    });
    var events = null;
    for (var i = 0; i < plugins.length; i++) {
        var possiblePlugin = plugins[i];
        if (possiblePlugin) {
            var extractedEvents = possiblePlugin.extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags);
            if (extractedEvents) {
                events = accumulateInto(events, extractedEvents);
            }
        }
    }
    return events;
}
topLevelFunctionsRegister.push('runExtractedPluginEventsInBatch');
function runExtractedPluginEventsInBatch(topLevelType, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags) {
    logFuncUsage(['runExtractedPluginEventsInBatch'], {
        topLevelType: topLevelType,
        targetInst: targetInst,
        nativeEvent: nativeEvent,
        nativeEventTarget: nativeEventTarget,
        eventSystemFlags: eventSystemFlags,
    });
    var events = extractPluginEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags);
    runEventsInBatch(events);
}
topLevelFunctionsRegister.push('handleTopLevel');
function handleTopLevel(bookKeeping) {
    logFuncUsage(['handleTopLevel'], { bookKeeping: bookKeeping });
    var targetInst = bookKeeping.targetInst;
    var ancestor = targetInst;
    do {
        if (!ancestor) {
            var ancestors = bookKeeping.ancestors;
            ancestors.push(ancestor);
            break;
        }
        var root = findRootContainerNode(ancestor);
        if (!root) {
            break;
        }
        var tag = ancestor.tag;
        if (tag === HostComponent || tag === HostText) {
            bookKeeping.ancestors.push(ancestor);
        }
        ancestor = getClosestInstanceFromNode(root);
    } while (ancestor);
    for (var i = 0; i < bookKeeping.ancestors.length; i++) {
        targetInst = bookKeeping.ancestors[i];
        var eventTarget = getEventTarget(bookKeeping.nativeEvent);
        var topLevelType = bookKeeping.topLevelType;
        var nativeEvent = bookKeeping.nativeEvent;
        var eventSystemFlags = bookKeeping.eventSystemFlags;
        if (i === 0) {
            eventSystemFlags |= IS_FIRST_ANCESTOR;
        }
        runExtractedPluginEventsInBatch(topLevelType, targetInst, nativeEvent, eventTarget, eventSystemFlags);
    }
}
topLevelFunctionsRegister.push('dispatchEventForLegacyPluginEventSystem');
function dispatchEventForLegacyPluginEventSystem(topLevelType, eventSystemFlags, nativeEvent, targetInst) {
    logFuncUsage(['dispatchEventForLegacyPluginEventSystem'], {
        topLevelType: topLevelType,
        eventSystemFlags: eventSystemFlags,
        nativeEvent: nativeEvent,
        targetInst: targetInst,
    });
    var bookKeeping = getTopLevelCallbackBookKeeping(topLevelType, nativeEvent, targetInst, eventSystemFlags);
    try {
        batchedEventUpdates(handleTopLevel, bookKeeping);
    }
    finally {
        releaseTopLevelCallbackBookKeeping(bookKeeping);
    }
}
function addEventBubbleListener(element, eventType, listener) {
    logFuncUsage(['addEventBubbleListener'], { element: element, eventType: eventType, listener: listener });
    element.addEventListener(eventType, listener, false);
}
topLevelFunctionsRegister.push('getClosestInstanceFromNode');
function getClosestInstanceFromNode(targetNode) {
    logFuncUsage(['getClosestInstanceFromNode'], { targetNode: targetNode });
    var targetInst = targetNode[internalInstanceKey];
    if (targetInst) {
        return targetInst;
    }
    var parentNode = targetNode.parentNode;
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
    logFuncUsage(['getEventTarget'], { nativeEvent: nativeEvent });
    var target = nativeEvent.target || nativeEvent.srcElement || window;
    if (target.correspondingUseElement) {
        target = target.correspondingUseElement;
    }
    return target.nodeType === TEXT_NODE ? target.parentNode : target;
}
topLevelFunctionsRegister.push('attemptToDispatchEvent');
function attemptToDispatchEvent(topLevelType, eventSystemFlags, container, nativeEvent) {
    logFuncUsage(['attemptToDispatchEvent'], {
        topLevelType: topLevelType,
        eventSystemFlags: eventSystemFlags,
        container: container,
        nativeEvent: nativeEvent,
    });
    var nativeEventTarget = getEventTarget(nativeEvent);
    var targetInst = getClosestInstanceFromNode(nativeEventTarget);
    dispatchEventForLegacyPluginEventSystem(topLevelType, eventSystemFlags, nativeEvent, targetInst);
    return null;
}
topLevelFunctionsRegister.push('dispatchEvent');
function dispatchEvent(topLevelType, eventSystemFlags, container, nativeEvent) {
    logFuncUsage(['dispatchEvent']);
    attemptToDispatchEvent(topLevelType, eventSystemFlags, container, nativeEvent);
}
topLevelFunctionsRegister.push('trapEventForPluginEventSystem');
function trapEventForPluginEventSystem(container, topLevelType) {
    logFuncUsage(['trapEventForPluginEventSystem'], { container: container, topLevelType: topLevelType });
    var listener;
    listener = dispatchEvent.bind(null, topLevelType, PLUGIN_EVENT_SYSTEM, container);
    addEventBubbleListener(container, topLevelType, listener);
}
topLevelFunctionsRegister.push('trapBubbledEvent');
function trapBubbledEvent(topLevelType, element) {
    logFuncUsage(['trapBubbledEvent'], { topLevelType: topLevelType, element: element });
    trapEventForPluginEventSystem(element, topLevelType, false);
}
topLevelFunctionsRegister.push('legacyListenToTopLevelEvent');
function legacyListenToTopLevelEvent(topLevelType, mountAt, listenerMap) {
    logFuncUsage(['legacyListenToTopLevelEvent'], {
        topLevelType: topLevelType,
        mountAt: mountAt,
        listenerMap: listenerMap,
    });
    if (!listenerMap.has(topLevelType)) {
        trapBubbledEvent(topLevelType, mountAt);
        listenerMap.set(topLevelType, null);
    }
}
topLevelFunctionsRegister.push('legacyListenToEvent');
function legacyListenToEvent(registrationName, mountAt) {
    logFuncUsage(['legacyListenToEvent'], { registrationName: registrationName, mountAt: mountAt });
    var listenerMap = getListenerMapForElement(mountAt);
    var dependencies = registrationNameDependencies[registrationName];
    for (var i = 0; i < dependencies.length; i++) {
        var dependency = dependencies[i];
        legacyListenToTopLevelEvent(dependency, mountAt, listenerMap);
    }
}
topLevelFunctionsRegister.push('ensureListeningTo');
function ensureListeningTo(rootContainerElement, registrationName) {
    logFuncUsage(['ensureListeningTo'], {
        rootContainerElement: rootContainerElement,
        registrationName: registrationName,
    });
    var isDocumentOrFragment = rootContainerElement.nodeType === DOCUMENT_NODE ||
        rootContainerElement.nodeType === DOCUMENT_FRAGMENT_NODE;
    var doc = isDocumentOrFragment
        ? rootContainerElement
        : rootContainerElement.ownerDocument;
    legacyListenToEvent(registrationName, doc);
}
topLevelFunctionsRegister.push('setInitialDOMProperties');
function setInitialDOMProperties(tag, domElement, rootContainerElement, nextProps, isCustomComponentTag) {
    logFuncUsage(['setInitialDOMProperties'], {
        tag: tag,
        domElement: domElement,
        rootContainerElement: rootContainerElement,
        nextProps: nextProps,
        isCustomComponentTag: isCustomComponentTag,
    });
    for (var propKey in nextProps) {
        if (!nextProps.hasOwnProperty(propKey)) {
            continue;
        }
        var nextProp = nextProps[propKey];
        if (propKey === STYLE) {
            setValueForStyles(domElement, nextProp);
        }
        else if (propKey === CHILDREN) {
            if (typeof nextProp === 'string') {
                var canSetTextContent = tag !== 'textarea' || nextProp !== '';
                if (canSetTextContent) {
                    setTextContent(domElement, nextProp);
                }
            }
            else if (typeof nextProp === 'number') {
                setTextContent(domElement, '' + nextProp);
            }
        }
        else if (propKey === AUTOFOCUS)
            ;
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
        domElement: domElement,
        tag: tag,
        rawProps: rawProps,
        rootContainerElement: rootContainerElement,
    });
    var isCustomComponentTag = isCustomComponent(tag, rawProps);
    var props;
    props = rawProps;
    setInitialDOMProperties(tag, domElement, rootContainerElement, props, isCustomComponentTag);
}
topLevelFunctionsRegister.push('shouldAutoFocusHostComponent');
function shouldAutoFocusHostComponent(type, props) {
    logFuncUsage(['shouldAutoFocusHostComponent'], { type: type, props: props });
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
function finalizeInitialChildren(domElement, type, props, rootContainerInstance) {
    logFuncUsage(['finalizeInitialChildren'], {
        domElement: domElement,
        type: type,
        props: props,
        rootContainerInstance: rootContainerInstance,
    });
    setInitialProperties(domElement, type, props, rootContainerInstance);
    return shouldAutoFocusHostComponent(type, props);
}
topLevelFunctionsRegister.push('markUpdate');
function markUpdate(workInProgress) {
    logFuncUsage(['markUpdate'], { workInProgress: workInProgress });
    workInProgress.effectTag |= Update;
}
topLevelFunctionsRegister.push('completeWork');
function completeWork(current, workInProgress) {
    logFuncUsage(['completeWork'], { current: current, workInProgress: workInProgress });
    var newProps = workInProgress.pendingProps;
    switch (workInProgress.tag) {
        case IndeterminateComponent:
        case FunctionComponent:
        case HostRoot: {
            return null;
        }
        case HostComponent: {
            var rootContainerInstance = getRootHostContainer();
            var type = workInProgress.type;
            if (current !== null && workInProgress.stateNode != null) {
                updateHostComponent$1(current, workInProgress, type, newProps, rootContainerInstance);
            }
            else {
                if (!newProps) {
                    return null;
                }
                var currentHostContext = contextStackCursor$1.current;
                // bottom->up. Top->down is faster in IE11.
                var instance = createInstance(type, newProps, rootContainerInstance, currentHostContext, workInProgress);
                appendAllChildren(instance, workInProgress, false, false);
                workInProgress.stateNode = instance;
                if (finalizeInitialChildren(instance, type, newProps, rootContainerInstance)) {
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
        type: type,
        key: key,
        pendingProps: pendingProps,
        mode: mode,
    });
    var fiber;
    var fiberTag = IndeterminateComponent;
    var resolvedType = type;
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
    logFuncUsage(['createFiberFromElement'], { element: element });
    var type = element.type;
    var key = element.key;
    var pendingProps = element.props;
    return createFiberFromTypeAndProps(type, key, pendingProps, null);
}
topLevelFunctionsRegister.push('ChildReconciler');
function ChildReconciler(shouldTrackSideEffects) {
    logFuncUsage(['ChildReconciler'], { shouldTrackSideEffects: shouldTrackSideEffects });
    topLevelFunctionsRegister.push('deleteChild');
    function deleteChild(returnFiber, childToDelete) {
        logFuncUsage(['deleteChild'], { returnFiber: returnFiber, childToDelete: childToDelete });
        if (!shouldTrackSideEffects) {
            return;
        }
        var last = returnFiber.lastEffect;
        if (last !== null) {
            last.nextEffect = childToDelete;
            returnFiber.lastEffect = childToDelete;
        }
        else {
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
        var childToDelete = currentFirstChild;
        while (childToDelete !== null) {
            deleteChild(returnFiber, childToDelete);
            childToDelete = childToDelete.sibling;
        }
        return null;
    }
    topLevelFunctionsRegister.push('mapRemainingChildren');
    function mapRemainingChildren(returnFiber, currentFirstChild) {
        logFuncUsage(['mapRemainingChildren'], { returnFiber: returnFiber, currentFirstChild: currentFirstChild });
        var existingChildren = new Map();
        var existingChild = currentFirstChild;
        while (existingChild !== null) {
            if (existingChild.key !== null) {
                existingChildren.set(existingChild.key, existingChild);
            }
            else {
                existingChildren.set(existingChild.index, existingChild);
            }
            existingChild = existingChild.sibling;
        }
        return existingChildren;
    }
    topLevelFunctionsRegister.push('useFiber');
    function useFiber(fiber, pendingProps) {
        logFuncUsage(['useFiber'], { fiber: fiber, pendingProps: pendingProps });
        var clone = createWorkInProgress(fiber, pendingProps);
        clone.index = 0;
        clone.sibling = null;
        return clone;
    }
    topLevelFunctionsRegister.push('placeChild');
    function placeChild(newFiber, lastPlacedIndex, newIndex) {
        logFuncUsage(['placeChild'], { newFiber: newFiber, lastPlacedIndex: lastPlacedIndex, newIndex: newIndex });
        newFiber.index = newIndex;
        if (!shouldTrackSideEffects) {
            return lastPlacedIndex;
        }
        var current = newFiber.alternate;
        if (current !== null) {
            var oldIndex = current.index;
            if (oldIndex < lastPlacedIndex) {
                newFiber.effectTag = Placement;
                return lastPlacedIndex;
            }
            else {
                return oldIndex;
            }
        }
        else {
            newFiber.effectTag = Placement;
            return lastPlacedIndex;
        }
    }
    topLevelFunctionsRegister.push('placeSingleChild');
    function placeSingleChild(newFiber) {
        logFuncUsage(['placeSingleChild'], { newFiber: newFiber });
        if (shouldTrackSideEffects && newFiber.alternate === null) {
            newFiber.effectTag = Placement;
        }
        return newFiber;
    }
    topLevelFunctionsRegister.push('updateElement');
    function updateElement(returnFiber, current, element) {
        logFuncUsage(['updateElement'], { returnFiber: returnFiber, current: current, element: element });
        if (current !== null) {
            if (current.elementType === element.type) {
                var existing = useFiber(current, element.props);
                existing.ref = null;
                existing["return"] = returnFiber;
                return existing;
            }
        }
        var created = createFiberFromElement(element);
        created.ref = null;
        created["return"] = returnFiber;
        return created;
    }
    topLevelFunctionsRegister.push('updateSlot');
    function updateSlot(returnFiber, oldFiber, newChild) {
        logFuncUsage(['updateSlot'], {
            returnFiber: returnFiber,
            oldFiber: oldFiber,
            newChild: newChild,
        });
        var key = oldFiber !== null ? oldFiber.key : null;
        if (typeof newChild === 'object' && newChild !== null) {
            switch (newChild.$$typeof) {
                case REACT_ELEMENT_TYPE: {
                    if (newChild.key === key) {
                        return updateElement(returnFiber, oldFiber, newChild);
                    }
                    else {
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
            existingChildren: existingChildren,
            returnFiber: returnFiber,
            newIdx: newIdx,
            newChild: newChild,
        });
        if (typeof newChild === 'object' && newChild !== null) {
            switch (newChild.$$typeof) {
                case REACT_ELEMENT_TYPE: {
                    var _matchedFiber = existingChildren.get(newChild.key === null ? newIdx : newChild.key) || null;
                    return updateElement(returnFiber, _matchedFiber, newChild);
                }
            }
        }
        return null;
    }
    topLevelFunctionsRegister.push('reconcileChildrenArray');
    function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
        logFuncUsage(['reconcileChildrenArray'], {
            returnFiber: returnFiber,
            currentFirstChild: currentFirstChild,
            newChildren: newChildren,
        });
        var resultingFirstChild = null;
        var previousNewFiber = null;
        var oldFiber = currentFirstChild;
        var lastPlacedIndex = 0;
        var newIdx = 0;
        var nextOldFiber = null;
        for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
            if (oldFiber.index > newIdx) {
                nextOldFiber = oldFiber;
                oldFiber = null;
            }
            else {
                nextOldFiber = oldFiber.sibling;
            }
            var newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx]);
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
            }
            else {
                previousNewFiber.sibling = newFiber;
            }
            previousNewFiber = newFiber;
            oldFiber = nextOldFiber;
        }
        var existingChildren = mapRemainingChildren(returnFiber, oldFiber); // Keep scanning and use the map to restore deleted items as moves.
        for (; newIdx < newChildren.length; newIdx++) {
            var _newFiber2 = updateFromMap(existingChildren, returnFiber, newIdx, newChildren[newIdx]);
            if (_newFiber2 !== null) {
                if (shouldTrackSideEffects) {
                    if (_newFiber2.alternate !== null) {
                        existingChildren["delete"](_newFiber2.key === null ? newIdx : _newFiber2.key);
                    }
                }
                lastPlacedIndex = placeChild(_newFiber2, lastPlacedIndex, newIdx);
                if (previousNewFiber === null) {
                    resultingFirstChild = _newFiber2;
                }
                else {
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
            returnFiber: returnFiber,
            currentFirstChild: currentFirstChild,
            element: element,
        });
        var child = currentFirstChild;
        while (child !== null) {
            if (child.elementType === element.type) {
                deleteRemainingChildren(returnFiber, child.sibling);
                var _existing3 = useFiber(child, element.props);
                _existing3.ref = null;
                _existing3["return"] = returnFiber;
                return _existing3;
            }
            deleteRemainingChildren(returnFiber, child);
            child = child.sibling;
        }
        var _created4 = createFiberFromElement(element);
        _created4.ref = null;
        _created4["return"] = returnFiber;
        return _created4;
    }
    function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
        logFuncUsage(['reconcileChildFibers'], {
            returnFiber: returnFiber,
            currentFirstChild: currentFirstChild,
            newChild: newChild,
        });
        var isObject = typeof newChild === 'object' && newChild !== null;
        if (isObject) {
            switch (newChild.$$typeof) {
                case REACT_ELEMENT_TYPE:
                    return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstChild, newChild));
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
    logFuncUsage(['completeUnitOfWork'], { unitOfWork: unitOfWork });
    workInProgress = unitOfWork;
    do {
        var current = workInProgress.alternate;
        var returnFiber = workInProgress["return"]; // Check if the work completed or if something threw.
        var next = void 0;
        next = completeWork(current, workInProgress);
        if (returnFiber !== null && // Do not append effects to parents if a sibling failed to complete
            (returnFiber.effectTag & Incomplete) === NoEffect) {
            if (returnFiber.firstEffect === null) {
                returnFiber.firstEffect = workInProgress.firstEffect;
            }
            if (workInProgress.lastEffect !== null) {
                if (returnFiber.lastEffect !== null) {
                    returnFiber.lastEffect.nextEffect = workInProgress.firstEffect;
                }
                returnFiber.lastEffect = workInProgress.lastEffect;
            }
            var effectTag = workInProgress.effectTag;
            if (effectTag > PerformedWork) {
                if (returnFiber.lastEffect !== null) {
                    returnFiber.lastEffect.nextEffect = workInProgress;
                }
                else {
                    returnFiber.firstEffect = workInProgress;
                }
                returnFiber.lastEffect = workInProgress;
            }
        }
        var siblingFiber = workInProgress.sibling;
        if (siblingFiber !== null) {
            return siblingFiber;
        }
        workInProgress = returnFiber;
    } while (workInProgress !== null); // We've reached the root.
    return null;
}
topLevelFunctionsRegister.push('performUnitOfWork');
function performUnitOfWork(unitOfWork) {
    logFuncUsage(['performUnitOfWork'], performUnitOfWorkCounter, { unitOfWork: unitOfWork });
    performUnitOfWorkCounter++;
    var next;
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
    var doc = typeof document !== 'undefined' ? document : undefined;
    if (typeof doc === 'undefined') {
        return null;
    }
    try {
        return doc.activeElement || doc.body;
    }
    catch (e) {
        return doc.body;
    }
}
topLevelFunctionsRegister.push('getSelectionInformation');
function getSelectionInformation() {
    logFuncUsage(['getSelectionInformation']);
    var focusedElem = getActiveElement();
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
        var work = performUnitOfWork(workInProgress);
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
    logFuncUsage(['setEnabled'], { enabled: enabled });
    _enabled = !!enabled;
}
topLevelFunctionsRegister.push('prepareForCommit');
function prepareForCommit() {
    logFuncUsage(['prepareForCommit']);
    eventsEnabled = isEnabled();
    setEnabled(false);
}
topLevelFunctionsRegister.push('resetAfterCommit');
function resetAfterCommit() {
    logFuncUsage(['resetAfterCommit']);
    setEnabled(eventsEnabled);
    eventsEnabled = null;
}
topLevelFunctionsRegister.push('isHostParent');
function isHostParent(fiber) {
    logFuncUsage(['isHostParent'], { fiber: fiber });
    return fiber.tag === HostComponent || fiber.tag === HostRoot;
}
topLevelFunctionsRegister.push('getHostParentFiber');
function getHostParentFiber(fiber) {
    logFuncUsage(['getHostParentFiber'], { fiber: fiber });
    var parent = fiber["return"];
    while (parent !== null) {
        if (isHostParent(parent)) {
            return parent;
        }
        parent = parent["return"];
    }
}
topLevelFunctionsRegister.push('getHostSibling');
function getHostSibling(fiber) {
    logFuncUsage(['getHostSibling'], { fiber: fiber });
    var node = fiber;
    siblings: while (true) {
        while (node.sibling === null) {
            if (node["return"] === null || isHostParent(node["return"])) {
                return null;
            }
            node = node["return"];
        }
        node.sibling["return"] = node["return"];
        node = node.sibling;
        while (node.tag !== HostComponent && node.tag !== HostText) {
            if (node.effectTag & Placement) {
                continue siblings;
            }
            if (node.child === null) {
                continue siblings;
            }
            else {
                node.child["return"] = node;
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
        node: node,
        before: before,
        parent: parent,
    });
    var tag = node.tag;
    var isHost = tag === HostComponent || tag === HostText;
    if (isHost) {
        var stateNode = isHost ? node.stateNode : node.stateNode.instance;
        parent.appendChild(stateNode);
    }
    else {
        var child = node.child;
        if (child !== null) {
            insertOrAppendPlacementNodeIntoContainer(child, before, parent);
            var sibling = child.sibling;
            while (sibling !== null) {
                insertOrAppendPlacementNodeIntoContainer(sibling, before, parent);
                sibling = sibling.sibling;
            }
        }
    }
}
topLevelFunctionsRegister.push('appendChild');
function appendChild(parentInstance, child) {
    logFuncUsage(['appendChild'], { parentInstance: parentInstance, child: child });
    parentInstance.appendChild(child);
}
topLevelFunctionsRegister.push('insertOrAppendPlacementNode');
function insertOrAppendPlacementNode(node, before, parent) {
    logFuncUsage(['insertOrAppendPlacementNode'], { node: node, before: before, parent: parent });
    var tag = node.tag;
    var isHost = tag === HostComponent || tag === HostText;
    if (isHost) {
        var stateNode = isHost ? node.stateNode : node.stateNode.instance;
        appendChild(parent, stateNode);
    }
    else {
        var child = node.child;
        if (child !== null) {
            insertOrAppendPlacementNode(child, before, parent);
            var sibling = child.sibling;
            while (sibling !== null) {
                insertOrAppendPlacementNode(sibling, before, parent);
                sibling = sibling.sibling;
            }
        }
    }
}
topLevelFunctionsRegister.push('commitPlacement');
function commitPlacement(finishedWork) {
    logFuncUsage(['commitPlacement'], { finishedWork: finishedWork });
    var parentFiber = getHostParentFiber(finishedWork);
    var parent;
    var isContainer;
    var parentStateNode = parentFiber.stateNode;
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
    var before = getHostSibling(finishedWork);
    if (isContainer) {
        insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
    }
    else {
        insertOrAppendPlacementNode(finishedWork, before, parent);
    }
}
topLevelFunctionsRegister.push('dangerousStyleValue');
function dangerousStyleValue(name, value, isCustomProperty) {
    logFuncUsage(['dangerousStyleValue'], { name: name, value: value, isCustomProperty: isCustomProperty });
    var isEmpty = value == null || typeof value === 'boolean' || value === '';
    if (isEmpty) {
        return '';
    }
    if (!isCustomProperty &&
        typeof value === 'number' &&
        value !== 0 &&
        !(isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name])) {
        return value + 'px';
    }
    return ('' + value).trim();
}
topLevelFunctionsRegister.push('setValueForStyles');
function setValueForStyles(node, styles) {
    logFuncUsage(['setValueForStyles'], { node: node, styles: styles });
    var style = node.style;
    for (var styleName in styles) {
        if (!styles.hasOwnProperty(styleName)) {
            continue;
        }
        var isCustomProperty = styleName.indexOf('--') === 0;
        var styleValue = dangerousStyleValue(styleName, styles[styleName], isCustomProperty);
        if (styleName === 'float') {
            styleName = 'cssFloat';
        }
        if (isCustomProperty) {
            style.setProperty(styleName, styleValue);
        }
        else {
            style[styleName] = styleValue;
        }
    }
}
topLevelFunctionsRegister.push('setTextContent');
var setTextContent = function (node, text) {
    logFuncUsage(['setTextContent'], { node: node, text: text });
    if (text) {
        var firstChild = node.firstChild;
        if (firstChild &&
            firstChild === node.lastChild &&
            firstChild.nodeType === TEXT_NODE) {
            firstChild.nodeValue = text;
            return;
        }
    }
    node.textContent = text;
};
topLevelFunctionsRegister.push('updateDOMProperties');
function updateDOMProperties(domElement, updatePayload, wasCustomComponentTag, isCustomComponentTag) {
    // TODO: Handle wasCustomComponentTag
    logFuncUsage(['updateDOMProperties'], {
        domElement: domElement,
        updatePayload: updatePayload,
        wasCustomComponentTag: wasCustomComponentTag,
        isCustomComponentTag: isCustomComponentTag,
    });
    for (var i = 0; i < updatePayload.length; i += 2) {
        var propKey = updatePayload[i];
        var propValue = updatePayload[i + 1];
        if (propKey === STYLE) {
            setValueForStyles(domElement, propValue);
        }
        else if (propKey === CHILDREN) {
            setTextContent(domElement, propValue);
        }
    }
}
topLevelFunctionsRegister.push('updateProperties');
function updateProperties(domElement, updatePayload, tag, lastRawProps, nextRawProps) {
    logFuncUsage(['updateProperties'], {
        domElement: domElement,
        updatePayload: updatePayload,
        tag: tag,
        lastRawProps: lastRawProps,
        nextRawProps: nextRawProps,
    });
    var wasCustomComponentTag = isCustomComponent(tag, lastRawProps);
    var isCustomComponentTag = isCustomComponent(tag, nextRawProps); // Apply the diff.
    updateDOMProperties(domElement, updatePayload, wasCustomComponentTag, isCustomComponentTag);
}
topLevelFunctionsRegister.push('commitUpdate');
function commitUpdate(domElement, updatePayload, type, oldProps, newProps) {
    logFuncUsage(['commitUpdate'], {
        domElement: domElement,
        updatePayload: updatePayload,
        type: type,
        oldProps: oldProps,
        newProps: newProps,
    });
    updateFiberProps(domElement, newProps);
    updateProperties(domElement, updatePayload, type, oldProps, newProps);
}
topLevelFunctionsRegister.push('commitWork');
function commitWork(current, finishedWork) {
    logFuncUsage(['commitWork'], { current: current, finishedWork: finishedWork });
    switch (finishedWork.tag) {
        case HostComponent: {
            var instance = finishedWork.stateNode;
            if (instance != null) {
                var newProps = finishedWork.memoizedProps;
                var oldProps = current !== null ? current.memoizedProps : newProps;
                var type = finishedWork.type;
                var updatePayload = finishedWork.updateQueue;
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
        finishedRoot: finishedRoot,
        current: current,
    });
    {
        unmountHostComponents(finishedRoot, current);
    }
    detachFiber(current);
}
topLevelFunctionsRegister.push('detachFiber');
function detachFiber(current) {
    logFuncUsage(['detachFiber'], { current: current });
    var alternate = current.alternate;
    current["return"] = null;
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
        finishedRoot: finishedRoot,
        root: root,
    });
    var node = root;
    while (true) {
        if (node.child !== null) {
            node.child["return"] = node;
            node = node.child;
            continue;
        }
        if (node === root) {
            return;
        }
        while (node.sibling === null) {
            if (node["return"] === null || node["return"] === root) {
                return;
            }
            node = node["return"];
        }
        node.sibling["return"] = node["return"];
        node = node.sibling;
    }
}
topLevelFunctionsRegister.push('removeChild');
function removeChild(parentInstance, child) {
    logFuncUsage(['removeChild'], { parentInstance: parentInstance, child: child });
    parentInstance.removeChild(child);
}
topLevelFunctionsRegister.push('unmountHostComponents');
function unmountHostComponents(finishedRoot, current) {
    logFuncUsage(['unmountHostComponents'], {
        finishedRoot: finishedRoot,
        current: current,
    });
    var node = current;
    var currentParentIsValid = false;
    var currentParent;
    var currentParentIsContainer;
    while (true) {
        if (!currentParentIsValid) {
            var parent_1 = node["return"];
            findParent: while (true) {
                var parentStateNode = parent_1.stateNode;
                switch (parent_1.tag) {
                    case HostComponent:
                        currentParent = parentStateNode;
                        currentParentIsContainer = false;
                        break findParent;
                    case HostRoot:
                        currentParent = parentStateNode.containerInfo;
                        currentParentIsContainer = true;
                        break findParent;
                }
                parent_1 = parent_1["return"];
            }
            currentParentIsValid = true;
        }
        commitNestedUnmounts(finishedRoot, node);
        removeChild(currentParent, node.stateNode);
        if (node === current) {
            return;
        }
        while (node.sibling === null) {
            if (node["return"] === null || node["return"] === current) {
                return;
            }
            node = node["return"];
        }
        node.sibling["return"] = node["return"];
        node = node.sibling;
    }
}
topLevelFunctionsRegister.push('commitMutationEffects');
function commitMutationEffects(root) {
    logFuncUsage(['commitMutationEffects'], { root: root });
    while (nextEffect !== null) {
        var effectTag = nextEffect.effectTag;
        var primaryEffectTag = effectTag & (Placement | Update | Deletion);
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
    logFuncUsage(['commitRoot'], { root: root });
    var finishedWork = root.finishedWork;
    if (finishedWork === null) {
        return null;
    }
    root.finishedWork = null;
    if (root === workInProgressRoot) {
        workInProgressRoot = null;
        workInProgress = null;
    }
    var firstEffect;
    if (finishedWork.effectTag > PerformedWork) {
        if (finishedWork.lastEffect !== null) {
            finishedWork.lastEffect.nextEffect = finishedWork;
            firstEffect = finishedWork.firstEffect;
        }
        else {
            firstEffect = finishedWork;
        }
    }
    else {
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
    logFuncUsage(['finishSyncRender'], { root: root });
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
    logFuncUsage(['ensureRootIsScheduled'], { root: root });
    scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
}
topLevelFunctionsRegister.push('flushSyncCallbackQueue');
function flushSyncCallbackQueue() {
    logFuncUsage(['flushSyncCallbackQueue']);
    immediateQueueCallbackNode = null;
    var i = 0;
    var _isSync = true;
    var queue = syncQueue;
    for (; i < queue.length; i++) {
        var callback = queue[i];
        do {
            callback = callback(_isSync);
        } while (callback !== null);
    }
}
topLevelFunctionsRegister.push('scheduleWork');
function scheduleWork(fiber) {
    logFuncUsage(['scheduleWork'], { fiber: fiber });
    var root = markUpdateTimeFromFiberToRoot(fiber);
    if (root === null) {
        return;
    }
    ensureRootIsScheduled(root);
    flushSyncCallbackQueue();
}
topLevelFunctionsRegister.push('updateContainer');
function updateContainer(element, container, parentComponent) {
    logFuncUsage(['updateContainer'], { element: element, container: container, parentComponent: parentComponent });
    var update = createUpdate();
    update.payload = {
        element: element,
    };
    enqueueUpdate(container.current, update);
    scheduleWork(container.current);
}
topLevelFunctionsRegister.push('render');
function render(element, container) {
    logFuncUsage(['render'], { element: element, container: container });
    var fiberRoot = createFiberRoot(container);
    updateContainer(element, fiberRoot, null);
    return null;
}
topLevelFunctionsRegister.push('publishEventForPlugin');
function publishEventForPlugin(dispatchConfig, pluginModule, eventName) {
    logFuncUsage(['publishEventForPlugin'], {
        dispatchConfig: dispatchConfig,
        pluginModule: pluginModule,
        eventName: eventName,
    });
    eventNameDispatchConfigs[eventName] = dispatchConfig;
    var phasedRegistrationNames = dispatchConfig.phasedRegistrationNames;
    if (phasedRegistrationNames) {
        for (var phaseName in phasedRegistrationNames) {
            if (phasedRegistrationNames.hasOwnProperty(phaseName)) {
                var phasedRegistrationName = phasedRegistrationNames[phaseName];
                publishRegistrationName(phasedRegistrationName, pluginModule, eventName);
            }
        }
        return true;
    }
    else if (dispatchConfig.registrationName) {
        publishRegistrationName(dispatchConfig.registrationName, pluginModule, eventName);
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
    for (var pluginName in namesToPlugins) {
        var pluginModule = namesToPlugins[pluginName];
        var pluginIndex = eventPluginOrder.indexOf(pluginName);
        if (plugins[pluginIndex]) {
            continue;
        }
        plugins[pluginIndex] = pluginModule;
        var publishedEvents = pluginModule.eventTypes;
        for (var eventName in publishedEvents) {
            publishEventForPlugin(publishedEvents[eventName], pluginModule, eventName);
        }
    }
}
topLevelFunctionsRegister.push('injectEventPluginsByName');
function injectEventPluginsByName(injectedNamesToPlugins) {
    logFuncUsage(['injectEventPluginsByName'], { injectedNamesToPlugins: injectedNamesToPlugins });
    var isOrderingDirty = false;
    for (var pluginName in injectedNamesToPlugins) {
        if (!injectedNamesToPlugins.hasOwnProperty(pluginName)) {
            continue;
        }
        var pluginModule = injectedNamesToPlugins[pluginName];
        if (!namesToPlugins.hasOwnProperty(pluginName) ||
            namesToPlugins[pluginName] !== pluginModule) {
            namesToPlugins[pluginName] = pluginModule;
            isOrderingDirty = true;
        }
    }
    if (isOrderingDirty) {
        recomputePluginOrdering();
    }
}
topLevelFunctionsRegister.push('SyntheticEvent');
function SyntheticEvent(dispatchConfig, targetInst, nativeEvent, nativeEventTarget) {
    logFuncUsage(['SyntheticEvent'], {
        dispatchConfig: dispatchConfig,
        targetInst: targetInst,
        nativeEvent: nativeEvent,
        nativeEventTarget: nativeEventTarget,
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
    var Interface = this.constructor.Interface;
    for (var propName in Interface) {
        if (!Interface.hasOwnProperty(propName)) {
            continue;
        }
        {
            delete this[propName];
        }
        var normalize = Interface[propName];
        if (normalize) {
            this[propName] = normalize(nativeEvent);
        }
        else {
            if (propName === 'target') {
                this.target = nativeEventTarget;
            }
            else {
                this[propName] = nativeEvent[propName];
            }
        }
    }
    return this;
}
topLevelFunctionsRegister.push('getPooledEvent');
function getPooledEvent(dispatchConfig, targetInst, nativeEvent, nativeInst) {
    logFuncUsage(['getPooledEvent'], {
        dispatchConfig: dispatchConfig,
        targetInst: targetInst,
        nativeEvent: nativeEvent,
        nativeInst: nativeInst,
    });
    var EventConstructor = this;
    if (EventConstructor.eventPool.length) {
        var instance = EventConstructor.eventPool.pop();
        EventConstructor.call(instance, dispatchConfig, targetInst, nativeEvent, nativeInst);
        return instance;
    }
    return new EventConstructor(dispatchConfig, targetInst, nativeEvent, nativeInst);
}
topLevelFunctionsRegister.push('releasePooledEvent');
function releasePooledEvent(event) {
    logFuncUsage(['releasePooledEvent'], { event: event });
    var EventConstructor = this;
    if (EventConstructor.eventPool.length < EVENT_POOL_SIZE) {
        EventConstructor.eventPool.push(event);
    }
}
topLevelFunctionsRegister.push('addEventPoolingTo');
function addEventPoolingTo(EventConstructor) {
    logFuncUsage(['addEventPoolingTo'], { EventConstructor: EventConstructor });
    EventConstructor.eventPool = [];
    EventConstructor.getPooled = getPooledEvent;
    EventConstructor.release = releasePooledEvent;
}
topLevelFunctionsRegister.push('SyntheticEvent.extend');
SyntheticEvent.extend = function (Interface) {
    logFuncUsage(['SyntheticEvent.extend'], { Interface: Interface });
    var Super = this;
    var E = function () { };
    E.prototype = Super.prototype;
    var prototype = new E();
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
var SyntheticUIEvent = SyntheticEvent.extend({
    view: null,
    detail: null,
});
var SyntheticMouseEvent = SyntheticUIEvent.extend({
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
    logFuncUsage(['getParent'], { inst: inst });
    do {
        inst = inst["return"];
    } while (inst && inst.tag !== HostComponent);
    if (inst) {
        return inst;
    }
    return null;
}
topLevelFunctionsRegister.push('traverseTwoPhase');
function traverseTwoPhase(inst, fn, arg) {
    logFuncUsage(['traverseTwoPhase'], { inst: inst, fn: fn, arg: arg });
    var path = [];
    while (inst) {
        path.push(inst);
        inst = getParent(inst);
    }
    var i;
    for (i = path.length; i-- > 0;) {
        fn(path[i], 'captured', arg);
    }
    for (i = 0; i < path.length; i++) {
        fn(path[i], 'bubbled', arg);
    }
}
topLevelFunctionsRegister.push('getNodeFromInstance$1');
function getNodeFromInstance$1(inst) {
    logFuncUsage(['getNodeFromInstance$1'], { inst: inst });
    if (inst.tag === HostComponent || inst.tag === HostText) {
        return inst.stateNode;
    }
}
topLevelFunctionsRegister.push('getFiberCurrentPropsFromNode$1');
function getFiberCurrentPropsFromNode$1(node) {
    logFuncUsage(['getFiberCurrentPropsFromNode$1'], { node: node });
    return node[internalEventHandlersKey] || null;
}
topLevelFunctionsRegister.push('setComponentTree');
function setComponentTree(getFiberCurrentPropsFromNodeImpl, getInstanceFromNodeImpl, getNodeFromInstanceImpl) {
    logFuncUsage(['setComponentTree'], {
        getFiberCurrentPropsFromNodeImpl: getFiberCurrentPropsFromNodeImpl,
        getInstanceFromNodeImpl: getInstanceFromNodeImpl,
        getNodeFromInstanceImpl: getNodeFromInstanceImpl,
    });
    getFiberCurrentPropsFromNode = getFiberCurrentPropsFromNodeImpl;
    getNodeFromInstance = getNodeFromInstanceImpl;
}
setComponentTree(getFiberCurrentPropsFromNode$1, function () { }, getNodeFromInstance$1);
topLevelFunctionsRegister.push('getListener');
function getListener(inst, registrationName) {
    logFuncUsage(['getListener'], { inst: inst, registrationName: registrationName });
    var listener;
    var stateNode = inst.stateNode;
    if (!stateNode) {
        return null;
    }
    var props = getFiberCurrentPropsFromNode(stateNode);
    if (!props) {
        return null;
    }
    listener = props[registrationName];
    return listener;
}
topLevelFunctionsRegister.push('listenerAtPhase');
function listenerAtPhase(inst, event, propagationPhase) {
    logFuncUsage(['listenerAtPhase'], { inst: inst, event: event, propagationPhase: propagationPhase });
    var registrationName = event.dispatchConfig.phasedRegistrationNames[propagationPhase];
    return getListener(inst, registrationName);
}
topLevelFunctionsRegister.push('accumulateDirectionalDispatches');
function accumulateDirectionalDispatches(inst, phase, event) {
    logFuncUsage(['accumulateDirectionalDispatches']);
    var listener = listenerAtPhase(inst, event, phase);
    if (listener) {
        event._dispatchListeners = accumulateInto(event._dispatchListeners, listener);
        event._dispatchInstances = accumulateInto(event._dispatchInstances, inst);
    }
}
topLevelFunctionsRegister.push('accumulateTwoPhaseDispatchesSingle');
function accumulateTwoPhaseDispatchesSingle(event) {
    logFuncUsage(['accumulateTwoPhaseDispatchesSingle'], { event: event });
    if (event && event.dispatchConfig.phasedRegistrationNames) {
        traverseTwoPhase(event._targetInst, accumulateDirectionalDispatches, event);
    }
}
var SimpleEventPlugin = {
    eventTypes: simpleEventPluginEventTypes,
    extractEvents: function (topLevelType, targetInst, nativeEvent, nativeEventTarget) {
        var dispatchConfig = topLevelEventsToDispatchConfig.get(topLevelType);
        if (!dispatchConfig) {
            return null;
        }
        var EventConstructor;
        EventConstructor = SyntheticMouseEvent;
        var event = EventConstructor.getPooled(dispatchConfig, targetInst, nativeEvent, nativeEventTarget);
        forEachAccumulated(event, accumulateTwoPhaseDispatchesSingle);
        return event;
    },
};
topLevelFunctionsRegister.push('injectEventPluginOrder');
function injectEventPluginOrder(injectedEventPluginOrder) {
    logFuncUsage(['injectEventPluginOrder'], { injectedEventPluginOrder: injectedEventPluginOrder });
    eventPluginOrder = Array.prototype.slice.call(injectedEventPluginOrder);
    recomputePluginOrdering();
}
topLevelFunctionsRegister.push('processSimpleEventPluginPairsByPriority');
function processSimpleEventPluginPairsByPriority(eventTypes, priority) {
    logFuncUsage(['processSimpleEventPluginPairsByPriority'], {
        eventTypes: eventTypes,
        priority: priority,
    });
    for (var i = 0; i < eventTypes.length; i += 2) {
        var topEvent = eventTypes[i];
        var event_1 = eventTypes[i + 1];
        var capitalizedEvent = event_1[0].toUpperCase() + event_1.slice(1);
        var onEvent = 'on' + capitalizedEvent;
        var config = {
            phasedRegistrationNames: {
                bubbled: onEvent,
                captured: onEvent + 'Capture',
            },
            dependencies: [topEvent],
            eventPriority: priority,
        };
        eventPriorities.set(topEvent, priority);
        topLevelEventsToDispatchConfig.set(topEvent, config);
        simpleEventPluginEventTypes[event_1] = config;
    }
}
topLevelFunctionsRegister.push('unsafeCastStringToDOMTopLevelType');
function unsafeCastStringToDOMTopLevelType(topLevelType) {
    logFuncUsage(['unsafeCastStringToDOMTopLevelType'], { topLevelType: topLevelType });
    return topLevelType;
}
var TOP_CLICK = unsafeCastStringToDOMTopLevelType('click');
var discreteEventPairsForSimpleEventPlugin = [TOP_CLICK, 'click'];
try {
    processSimpleEventPluginPairsByPriority(discreteEventPairsForSimpleEventPlugin, DiscreteEvent);
    injectEventPluginsByName({
        SimpleEventPlugin: SimpleEventPlugin,
    });
    injectEventPluginOrder(DOMEventPluginOrder);
}
catch (e) {
    console.error(['error'], e.toString());
}
var OwnReact = {
    createElement: createElement,
    render: render,
    useState: useState,
};
exports["default"] = OwnReact;
