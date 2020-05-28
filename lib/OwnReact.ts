console.log(['script loaded']);

let nextUnitOfWork: Fiber = null;
let workDone: Fiber = null;
let workInProgress: Fiber = null;
let workInProgressRoot: Fiber = null;
let deletions: Fiber[] = null;
let hookIndex: number | null = null;

interface Hook {
  state: unknown;
  queue: Function[];
}

interface Element {
  $$typeof?: never;
  type;
  props: {
    children: Element[];
  };
}

interface Fiber {
  type?: any;
  effectTag?: string;
  dom: HTMLElement;
  props: {
    children: Element[];
  };
  alternate: Fiber;
  parent?: Fiber;
  child?: Fiber;
  sibling?: Fiber;
  hooks?: Hook[];
  state?: Record<string, unknown>;
}

function render(element: Element, container: HTMLElement) {
  console.log(['render'], { element, container });
  workInProgressRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: workDone,
  };
  deletions = [];
  nextUnitOfWork = workInProgressRoot;
}

function createTextElement(text: unknown) {
  console.log(['jsx -> Element | createTextElement'], { text });

  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: typeof text === 'string' ? text : '',
      children: [],
    },
  };
}

function createElement(
  type: string,
  props: Record<string, unknown>,
  ...children: Element[]
) {
  console.log(['jsx -> Element | createElement'], { type, props, children });

  return {
    $$typeof: Symbol('react.element'),
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === 'object' ? child : createTextElement(child),
      ),
    },
  };
}

function isEvent(key: string) {
  return key.startsWith('on');
}

function isProperty(key: string) {
  return key !== 'children' && !isEvent(key);
}

function isNew(prev: Record<string, unknown>, next: Record<string, unknown>) {
  return (key) => prev[key] !== next[key];
}

function isGone(prev: Record<string, unknown>, next: Record<string, unknown>) {
  return (key) => !(key in next);
}

function updateDom(
  dom: HTMLElement,
  prevProps: Record<string, unknown>,
  nextProps: Record<string, unknown>,
) {
  console.log(['updateDom'], { dom, prevProps, nextProps });
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = '';
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      if (name === 'style') {
        Object.keys(nextProps[name]).forEach((cssProperty) => {
          dom.style[cssProperty] = nextProps.style[cssProperty];
        });
      } else {
        dom[name] = nextProps[name];
      }
    });

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      dom.addEventListener(eventType, nextProps[name]);
    });
}

function createDom(fiber: Fiber) {
  console.log(['createDom'], { fiber });

  const dom =
    fiber.type == 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);

  return dom;
}

function commitDeletion(fiber: Fiber, domParent: Node) {
  console.log(['commitDeletion'], { fiber, domParent });

  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}

function commitWork(fiber: Fiber) {
  fiber && console.log(['commitWork'], { fiber });

  if (!fiber) {
    return;
  }

  let domParentFiber = fiber.parent;

  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }

  const domParent = domParentFiber.dom;

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, domParent);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function removeNodes() {
  console.log(['removeNode'], deletions.length);
  deletions.forEach(commitWork);
}

function commitRoot() {
  console.log(['commitRoot']);
  removeNodes();
  console.log(['after deletions']);
  commitWork(workInProgressRoot.child);
  console.log(['all work commited']);
  workDone = workInProgressRoot;
  workInProgressRoot = null;
}

// add to fiber `child` field
function reconcileChildren(fiber: Fiber, elements: Element[]) {
  console.log(['reconcileChildren'], { fiber, elements });

  let index = 0;
  let oldFiber = fiber.alternate && fiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    const sameType = oldFiber && element && element.type == oldFiber.type;
    let newFiber = null;

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: fiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      };
    }

    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: fiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      };
    }

    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      fiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

function updateFunctionComponent(fiber: Fiber) {
  console.log(['updateFunctionComponent'], { fiber });
  workInProgress = fiber;
  hookIndex = 0;
  workInProgress.hooks = [];

  const elements = [fiber.type(fiber.props)];

  reconcileChildren(fiber, elements);
}

function updateHostComponent(fiber: Fiber) {
  console.log(['updateHostComponent'], { fiber });

  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  reconcileChildren(fiber, fiber.props.children);
}

function useState<T>(initial: T) {
  console.log(['useState'], { initial });

  const oldHook =
    workInProgress.alternate &&
    workInProgress.alternate.hooks &&
    workInProgress.alternate.hooks[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };
  const actions = oldHook ? oldHook.queue : [];

  actions.forEach((action) => {
    hook.state = action(hook.state);
  });

  function setState(action) {
    hook.queue.push(action);
    workInProgressRoot = {
      dom: workDone.dom,
      props: workDone.props,
      alternate: workDone,
    };
    nextUnitOfWork = workInProgressRoot;
    deletions = [];
  }

  workInProgress.hooks.push(hook);
  hookIndex++;

  return [hook.state, setState];
}

function performUnitOfWork(fiber: Fiber): Fiber | undefined {
  console.log(['performUnitOfWork'], { fiber });

  const isFunctionComponent = fiber.type instanceof Function;

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    console.log(['performUnitOfWork.fiber.child'], fiber.child);

    return fiber.child;
  }

  console.log(['performUnitOfWork.fiber.no-child'], fiber);

  let nextFiber = fiber;

  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }

    nextFiber = nextFiber.parent;
  }
}

function workLoop(deadline: IdleDeadline) {
  let shouldYield = false;

  nextUnitOfWork && console.log(['workLoop'], { deadline, nextUnitOfWork });

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && workInProgressRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

const OwnReact = {
  createElement,
  render,
  useState,
};

export default OwnReact;
