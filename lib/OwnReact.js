"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var Placement = 2;
var Update = 4;
var Deletion = 8;
var currentHook = null;
var workInProgressHook = null;
var FunctionComponent = 0;
var HostRoot = 3;
var HostComponent = 5;
var IndeterminateComponent = 2;
var finishedRootFiber = null;
var currentRootFiber = null;
var currentFiber = null;
var currentDispatcher = null;
var dispatcherOnMount = {
    useState: function (initialState) {
        console.log(['dispatcherOnMount.useState'], { initialState: initialState });
        return mountState(initialState);
    },
};
var dispatcherOnUpdate = {
    useState: function (initialState) {
        console.log(['dispatcherOnUpdate.useState'], { initialState: initialState });
        return updateState();
    },
};
function completeUnitOfWork(unitOfWork) {
    console.log(['completeUnitOfWork'], unitOfWork);
    currentFiber = unitOfWork;
    do {
        if (currentFiber.tag === HostComponent && currentFiber.stateNode === null) {
            currentFiber.stateNode = document.createElement(currentFiber.type);
        }
        if (currentFiber.sibling !== null) {
            return currentFiber.sibling;
        }
        currentFiber = currentFiber["return"];
    } while (currentFiber !== null);
    return null;
}
function updateProperties(fiber) {
    console.log(['updateProperties'], { fiber: fiber });
    var isEvent = function (key) { return key.startsWith('on'); };
    var isStyle = function (key) { return key === 'style'; };
    var isTextContent = function (prop) {
        return typeof prop === 'string' || typeof prop === 'number';
    };
    Object.entries(fiber.pendingProps).forEach(function (_a) {
        var name = _a[0], prop = _a[1];
        if (isTextContent(prop)) {
            fiber.stateNode.textContent = prop;
        }
        else if (isEvent(name)) {
            var eventType = name.toLowerCase().substring(2);
            fiber.stateNode.addEventListener(eventType, fiber.pendingProps[name]);
            if (fiber.alternate) {
                fiber.stateNode.removeEventListener(eventType, fiber.alternate.pendingProps[name]);
            }
        }
        else if (isStyle(name)) {
            Object.entries(prop).forEach(function (_a) {
                var cssProperty = _a[0], value = _a[1];
                // @ts-ignore
                fiber.stateNode.style[cssProperty] = value;
            });
        }
    });
}
function commitWork(fiber) {
    console.log(['commitWork'], { fiber: fiber });
    if (fiber.stateNode != null) {
        var closestParentWithNode = fiber["return"];
        while (!closestParentWithNode.stateNode) {
            closestParentWithNode = closestParentWithNode["return"];
        }
        if (fiber.effectTag === Placement) {
            closestParentWithNode.stateNode.appendChild(fiber.stateNode);
        }
        updateProperties(fiber);
    }
    fiber.child && commitWork(fiber.child);
    fiber.sibling && commitWork(fiber.sibling);
}
function reconcileChildren(current, workInProgress, children) {
    console.log(['reconcileChildren'], { fiber: workInProgress, children: children });
    if (Array.isArray(children) || typeof children === 'object') {
        var previousFiber_1;
        var alternate_1 = current && current.child ? current && current.child : null;
        var elements = Array.isArray(children)
            ? children
            : [children];
        elements.forEach(function (element, index) {
            var tag = typeof element.type === 'function'
                ? alternate_1
                    ? alternate_1.tag
                    : IndeterminateComponent
                : HostComponent;
            var sameType = alternate_1 && element && element.type == alternate_1.type;
            var effectTag = sameType ? Update : element ? Placement : Deletion;
            var newFiber = createFiberSimple({
                tag: tag,
                element: element,
                alternate: alternate_1,
                effectTag: effectTag,
                parentFiber: workInProgress,
                stateNode: alternate_1 && alternate_1.stateNode ? alternate_1.stateNode : null,
            });
            if (index === 0) {
                workInProgress.child = newFiber;
            }
            else {
                previousFiber_1.sibling = newFiber;
            }
            if (alternate_1) {
                alternate_1 = alternate_1.sibling;
            }
            previousFiber_1 = newFiber;
        });
    }
    else {
        workInProgress.child = null;
    }
}
function mountWorkInProgressHook() {
    console.log(['mountWorkInProgressHook']);
    var hook = {
        memoizedState: null,
        baseState: null,
        baseQueue: null,
        queue: null,
        next: null,
    };
    if (workInProgressHook === null) {
        currentFiber.memoizedState = workInProgressHook = hook;
    }
    else {
        workInProgressHook = workInProgressHook.next = hook;
    }
    return workInProgressHook;
}
function updateWorkInProgressHook() {
    console.log(['updateWorkInProgressHook']);
    var nextCurrentHook;
    if (currentHook === null) {
        var current = currentFiber.alternate;
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
        nextWorkInProgressHook = currentFiber.memoizedState;
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
            currentFiber.memoizedState = workInProgressHook = newHook;
        }
        else {
            workInProgressHook = workInProgressHook.next = newHook;
        }
    }
    return workInProgressHook;
}
function basicStateReducer(state, action) {
    console.log(['basicStateReducer'], { state: state, action: action });
    return typeof action === 'function' ? action(state) : action;
}
function updateReducer(reducer) {
    console.log(['updateReducer'], { reducer: reducer });
    var hook = updateWorkInProgressHook();
    var queue = hook.queue;
    var current = currentHook;
    var pendingQueue = queue.pending;
    var baseQueue = current.baseQueue;
    if (pendingQueue !== null) {
        current.baseQueue = baseQueue = pendingQueue;
        queue.pending = null;
    }
    if (baseQueue !== null) {
        var first = baseQueue.next;
        var newState = current.baseState;
        var update = first;
        do {
            newState = reducer(newState, update.action);
            update = update.next;
        } while (update !== null && update !== first);
        hook.memoizedState = newState;
        hook.baseState = newState;
    }
    var dispatch = queue.dispatch;
    return [hook.memoizedState, dispatch];
}
function updateState() {
    console.log(['updateState']);
    return updateReducer(basicStateReducer);
}
function scheduleWork(fiber) {
    console.log(['scheduleWork'], { fiber: fiber });
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
function dispatchAction(fiber, queue, action) {
    console.log(['dispatchAction'], { fiber: fiber, queue: queue, action: action });
    var update = {
        action: action,
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
    scheduleWork(fiber);
}
function mountState(initialState) {
    console.log(['mountState'], { initialState: initialState });
    var hook = mountWorkInProgressHook();
    if (typeof initialState === 'function') {
        initialState = initialState();
    }
    hook.memoizedState = hook.baseState = initialState;
    var queue = (hook.queue = {
        pending: null,
        dispatch: null,
    });
    var dispatch = (queue.dispatch = dispatchAction.bind(null, currentFiber, queue));
    return [hook.memoizedState, dispatch];
}
function renderWithHooks(current, workInProgress, Component, props) {
    console.log(['renderWithHooks'], {
        current: current,
        workInProgress: workInProgress,
        Component: Component,
        props: props,
    });
    workInProgress.memoizedState = null;
    if (current !== null && current.memoizedState !== null) {
        currentDispatcher = dispatcherOnUpdate;
    }
    else {
        currentDispatcher = dispatcherOnMount;
    }
    var children = Component(props);
    workInProgress = null;
    currentHook = null;
    workInProgressHook = null;
    return children;
}
function updateFunctionComponent(current, workInProgress, Component, nextProps) {
    console.log(['updateFunctionComponent'], {
        current: current,
        workInProgress: workInProgress,
        Component: Component,
        nextProps: nextProps,
    });
    var nextChildren = renderWithHooks(current, workInProgress, Component, nextProps);
    reconcileChildren(current, workInProgress, nextChildren);
    return workInProgress.child;
}
function mountIndeterminateComponent(current, workInProgress, Component) {
    console.log(['mountIndeterminateComponent'], {
        current: current,
        workInProgress: workInProgress,
        Component: Component,
    });
    var children = renderWithHooks(null, workInProgress, Component, workInProgress.pendingProps);
    workInProgress.tag = FunctionComponent;
    reconcileChildren(current, workInProgress, children);
    return workInProgress.child;
}
function beginWork(current, unitOfWork) {
    console.log(['beginWork'], { current: current, unitOfWork: unitOfWork });
    switch (unitOfWork.tag) {
        case IndeterminateComponent: {
            return mountIndeterminateComponent(current, currentFiber, currentFiber.type);
        }
        case FunctionComponent: {
            return updateFunctionComponent(current, currentFiber, unitOfWork.type, unitOfWork.pendingProps);
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
function performUnitOfWork(workInProgress) {
    console.log(['performUnitOfWork'], { unitOfWork: workInProgress });
    var current = workInProgress.alternate;
    var next = beginWork(current, workInProgress);
    if (next === null) {
        return completeUnitOfWork(workInProgress);
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
    console.log(['finishSyncRender'], { root: root });
    commitWork(root.child);
    finishedRootFiber = currentRootFiber;
    currentRootFiber = null;
}
function performSyncWorkOnRoot(root) {
    console.log(['performSyncWorkOnRoot'], root);
    if (currentFiber !== null) {
        workLoopSync();
        finishSyncRender(root);
    }
    return null;
}
requestIdleCallback(function () {
    performSyncWorkOnRoot(currentRootFiber);
});
function createFiberSimple(_a) {
    var element = _a.element, tag = _a.tag, _b = _a.parentFiber, parentFiber = _b === void 0 ? null : _b, _c = _a.stateNode, stateNode = _c === void 0 ? null : _c, _d = _a.alternate, alternate = _d === void 0 ? null : _d, _e = _a.effectTag, effectTag = _e === void 0 ? null : _e, _f = _a.memoizedState, memoizedState = _f === void 0 ? null : _f, _g = _a.pendingProps, pendingProps = _g === void 0 ? {} : _g, _h = _a.child, child = _h === void 0 ? null : _h;
    console.log(['createFiberSimple'], { element: element, tag: tag, parentFiber: parentFiber, stateNode: stateNode });
    return {
        alternate: alternate,
        tag: tag,
        stateNode: stateNode,
        effectTag: effectTag,
        memoizedState: memoizedState,
        child: child,
        type: element.type,
        pendingProps: element.props || pendingProps,
        "return": parentFiber,
        sibling: null,
    };
}
function createElement(type, props) {
    var children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        children[_i - 2] = arguments[_i];
    }
    console.log(['createElement'], { type: type, props: props, children: children });
    return {
        type: type,
        props: __assign(__assign({}, (props || {})), { children: children.length === 1 ? children[0] : children }),
    };
}
function render(children, container) {
    console.log(['render'], { children: children, container: container });
    currentRootFiber = createFiberSimple({
        tag: HostRoot,
        stateNode: container,
        element: {
            props: {
                children: children,
            },
        },
        alternate: finishedRootFiber,
    });
    currentFiber = currentRootFiber;
}
function useState(initialState) {
    return currentDispatcher.useState(initialState);
}
exports["default"] = {
    useState: useState,
    createElement: createElement,
    render: render,
};
