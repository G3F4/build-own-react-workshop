type Prop =
  | string
  | EventListenerOrEventListenerObject
  | Record<string, string>
  | ReactElement;

type Props = Record<string, Prop>;

interface Fiber {
  tag: number;
  stateNode: HTMLElement | null;
  type: Function | string;
  props: Props;
  return: Fiber | null;
  sibling: Fiber | null;
  child: Fiber | null;
}

interface ReactElement {
  type: Function | string;
  props: Props;
}

const FunctionComponent = 0;
const HostRoot = 3;
const HostComponent = 5;
let workInProgressRoot = null;
let workInProgress = null;

function completeUnitOfWork(unitOfWork: Fiber): Fiber | null {
  workInProgress = unitOfWork;

  do {
    const parentFiber = workInProgress.return;

    if (workInProgress.tag === HostComponent) {
      workInProgress.stateNode = document.createElement(workInProgress.type);
    }

    const siblingFiber = workInProgress.sibling;

    if (siblingFiber !== null) {
      return siblingFiber;
    }

    workInProgress = parentFiber;
  } while (workInProgress !== null);

  return null;
}

function updateProperties(fiber: Fiber): void {
  console.log(['updateProperties'], { fiber });

  const isEvent = (key) => key.startsWith('on');
  const isStyle = (key) => key === 'style';
  const isTextContent = (prop) =>
    typeof prop === 'string' || typeof prop === 'number';

  Object.entries(fiber.props).forEach(([name, prop]) => {
    if (isTextContent(prop)) {
      fiber.stateNode.textContent = prop as string;
    } else if (isEvent(name)) {
      const eventType = name.toLowerCase().substring(2);

      fiber.stateNode.addEventListener(
        eventType,
        fiber.props[name] as EventListenerOrEventListenerObject,
      );
    } else if (isStyle(name)) {
      Object.entries(prop).forEach(([cssProperty, value]) => {
        fiber.stateNode.style[cssProperty] = value;
      });
    }
  });
}

function commitWork(fiber: Fiber): void {
  if (fiber.stateNode != null) {
    let closestParentWithNode = fiber.return;

    while (!closestParentWithNode.stateNode) {
      closestParentWithNode = closestParentWithNode.return;
    }

    closestParentWithNode.stateNode.appendChild(fiber.stateNode);
    updateProperties(fiber);
  }

  fiber.child && commitWork(fiber.child);
  fiber.sibling && commitWork(fiber.sibling);
}

function reconcileChildren(fiber: Fiber, children: unknown): void {
  console.log(['reconcileChildren'], { fiber, children });

  if (Array.isArray(children) || typeof children === 'object') {
    let previousFiber = null;
    const elements: ReactElement[] = Array.isArray(children)
      ? children
      : [children];

    elements.forEach((element, index) => {
      const tag =
        typeof element.type === 'function' ? FunctionComponent : HostComponent;
      const newFiber = createFiber({ tag, element, parentFiber: fiber });

      if (index === 0) {
        fiber.child = newFiber;
      } else {
        previousFiber.sibling = newFiber;
      }

      previousFiber = newFiber;
    });
  } else {
    fiber.child = null;
  }
}

function beginWork(unitOfWork: Fiber): Fiber | null {
  switch (unitOfWork.tag) {
    case FunctionComponent: {
      if (typeof unitOfWork.type === 'function') {
        reconcileChildren(unitOfWork, unitOfWork.type(unitOfWork.props));
      }

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

function performUnitOfWork(unitOfWork: Fiber): Fiber | null {
  console.log(['performUnitOfWork'], { unitOfWork });

  let next = beginWork(unitOfWork);

  if (next === null) {
    next = completeUnitOfWork(unitOfWork);
  }

  return next;
}

function performSyncWorkOnRoot(): void {
  workInProgress && console.log(['performSyncWorkOnRoot']);

  if (workInProgress !== null) {
    while (workInProgress !== null) {
      workInProgress = performUnitOfWork(workInProgress);
    }

    commitWork(workInProgressRoot.child);
  }

  requestIdleCallback(performSyncWorkOnRoot);
}

requestIdleCallback(performSyncWorkOnRoot);

function createFiber({
  element,
  tag,
  parentFiber = null,
  stateNode = null,
}): Fiber {
  console.log(['createFiber'], { element, tag, parentFiber, stateNode });

  return {
    tag,
    stateNode,
    type: element.type,
    props: element.props,
    return: parentFiber,
    sibling: null,
    child: null,
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

function render(element: ReactElement, container: HTMLElement) {
  workInProgressRoot = createFiber({
    tag: HostRoot,
    stateNode: container,
    element: {
      props: {
        children: [element],
      },
    },
  });
  workInProgress = workInProgressRoot;
}

export default {
  createElement,
  render,
};
