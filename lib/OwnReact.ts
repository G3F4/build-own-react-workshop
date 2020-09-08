// typ pojedynczego propa
type Prop =
  | string
  | EventListenerOrEventListenerObject
  | Record<string, string>
  | ReactElement;

// typ obiektu reprezentującego propsy
type Props = Record<string, Prop>;
const UpdateState = 0;
const NoEffect = 0;
const PerformedWork = 1;
const Placement = 2;
const Update = 4;
const PlacementAndUpdate = 6;
const Deletion = 8;

// interfejs Fibera, czyli obiektu reprezentującego jednostkę pracy
interface Fiber {
  tag: typeof FunctionComponent | typeof HostRoot | typeof HostComponent | typeof IndeterminateComponent; // typ Fibera
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

// Hooks are stored as a linked list on the fiber's memoizedState field. The
// current hook list is the list that belongs to the current fiber. The
// work-in-progress hook list is a new list that will be added to the
// work-in-progress fiber.

let currentHook = null;
let workInProgressHook = null;

// interfejs opisujący obiekt reprezentujący element React
interface ReactElement {
  type: Function | string; // typ elementu React, może to być funkcja, która jest komponentem albo string z nazwą elementu DOM
  props: Props; // propsy elementu React
}

const FunctionComponent = 0; // stała reprezentująca rodzaj Fibera z komponentem funkcyjnym
const HostRoot = 3; // stała reprezentująca rodzaj Fibera z elementem DOM kontenera aplikacji
const HostComponent = 5; // stała reprezentująca rodzaj Fibera z elementem DOM
const IndeterminateComponent = 2;
let workInProgressRoot = null; // Fiber związany z kontenerem aplikacji
let workInProgress = null; // Fiber, który reprezentuje aktualną pracę do wykonania
const ReactCurrentDispatcher = {
  current: null,
};
let HooksDispatcherOnMount = null;
let HooksDispatcherOnUpdate = null;

/*
funkcja kończąca jednostkę pracy
wykorzystując wcześniej stworzone powiązania, przechodzi po wszystkich Fiberach
i dla każdego Fibera, który reprezentuje element DOM
tworzy ten element i zapisuje referencje w polu `stateNode`
*/
function completeUnitOfWork(unitOfWork: Fiber): Fiber | null {
  console.log(['completeUnitOfWork'], unitOfWork);

  // ustawiamy aktualną jednostkę pracy
  workInProgress = unitOfWork;

  // co najmniej raz wykonujemy
  do {
    // jeśli aktualny Fiber jest związany z elementem DOM
    if (workInProgress.tag === HostComponent && workInProgress.stateNode === null) {
      // tworzymy ten element DOM
      workInProgress.stateNode = document.createElement(workInProgress.type);
    }

    // jeśli posiada rodzeństwa
    if (workInProgress.sibling !== null) {
      // zwróć rodzeństwo
      return workInProgress.sibling;
    }

    // jeśli doszliśmy do końca pętli, ustawiamy Fiber reprezentujący rodzica jako aktualna jednostka pracy
    workInProgress = workInProgress.return;
    // tak długo aż rodzic będzie nullem, czyli aż gdy dotrzemy do Fibera bez rodzica czyli Fibera powiązanego z kontenerem aplikacji
  } while (workInProgress !== null);

  // jeśli Fiber nie posiadał więcej niż jedno dziecko, zwracamy null aby przerwać proces
  return null;
}

/*
funkcja aktualizująca właściwości elementu DOM związanego z Fiberem
jako argument dostaje Fiber
*/
function updateProperties(fiber: Fiber): void {
  console.log(['updateProperties'], { fiber });

  // funkcja pomocnicza sprawdzająca czy props jest eventem
  const isEvent = (key) => key.startsWith('on');
  // funkcja pomocnicza sprawdzająca czy props jest obiektem styli
  const isStyle = (key) => key === 'style';
  // funkcja pomocnicza sprawdzająca czy props jest zwykłym tekstem
  const isTextContent = (prop) =>
    typeof prop === 'string' || typeof prop === 'number';

  // iterujemy po wszystkich propsach
  Object.entries(fiber.pendingProps).forEach(([name, prop]) => {
    // jeśli prop jest zwykłym tekstem
    if (isTextContent(prop)) {
      // ustawiamy atrybut textContent elementu DOM związanego z Fiberem
      fiber.stateNode.textContent = prop as string;
      // jeśli prop jest eventem
    } else if (isEvent(name)) {
      // zamieniamy wszystkie znaki nazwy eventu na małe i pomijamy prefix "on"
      const eventType = name.toLowerCase().substring(2);

      // tak przygotowaną nazwę eventu wykorzystujemy aby zacząć nasłuchiwać na event
      fiber.stateNode.addEventListener(
        eventType,
        fiber.pendingProps[name] as EventListenerOrEventListenerObject,
      );

      if (fiber.alternate) {
        fiber.stateNode.removeEventListener(
          eventType,
          fiber.alternate.pendingProps[name] as EventListenerOrEventListenerObject,
        );
      }
      // jeśli prop jest obiektem styli
    } else if (isStyle(name)) {
      // iterujemy do wszystkich stylach w obiekcie
      Object.entries(prop).forEach(([cssProperty, value]) => {
        // i modyfikujemy wartość styli elementu DOM
        fiber.stateNode.style[cssProperty] = value;
      });
    }
  });
}

/*
funkcja dołącza do najbliższego rodzica elementu DOM znalezionego w wzwyż w hierarchii Fiberów
jako argument dostaje Fiber, który jest aktualnie iterowany podczas rekurencyjnego przeglądania struktury Fiberów
*/
function commitWork(fiber: Fiber): void {
  console.log(['commitWork'], { fiber });

  // jeśli aktualny Fiber jest związany z elementem DOM
  if (fiber.stateNode != null) {
    // szukamy najbliższego rodzica powiązanego z rzeczywistym elementem DOM
    let closestParentWithNode = fiber.return;

    // jeśli aktualnie ustawiony rodzic nie jest związany z elementem DOM
    while (!closestParentWithNode.stateNode) {
      // szukamy wyżej, u dziadka(rodzic rodzica)
      closestParentWithNode = closestParentWithNode.return;
    }

    // dodajemy element DOM do nadrzędnego elementu DOM
    if (fiber.effectTag === Placement) {
      closestParentWithNode.stateNode.appendChild(fiber.stateNode);
    }

    // a następnie aktualizujemy właściwości elementu DOM
    updateProperties(fiber);
  }

  // jeśli Fiber posiada dziecko, zagłębiamy się rekurencyjnie
  fiber.child && commitWork(fiber.child);
  // jeśli Fiber posiada sąsiada, zagłębiamy się rekurencyjnie
  fiber.sibling && commitWork(fiber.sibling);
}

/*
funkcja tworząca powiązania Fibera do jego dzieci w postaci powiązanych Fiberów
w procesie dla wszystkich dzieci Fibera zostaną utworzone własne Fibery
*/
function reconcileChildren(current: Fiber | null, workInProgress: Fiber, children: unknown): void {
  console.log(['reconcileChildren'], { fiber: workInProgress, children });

  // jeśli argument children jest tablicą lub obiektem, możemy rozpocząć proces rekoncyliacji
  if (Array.isArray(children) || typeof children === 'object') {
    // zmienna pomocnicza przechowująca referencję do ostatnio utworzonego Fibera
    let previousFiber = null;
    let alternate =
      current && current.child
        ? current && current.child
        : null;
    // tablica dzieci, jeśli argument children nie jest tablicą, tworzymy z niego jednoelementową tablicę
    const elements: ReactElement[] = Array.isArray(children)
      ? children
      : [children];

    // iterujemy po wszystkich dzieciach(elementy React)
    elements.forEach((element, index) => {
      // dla każdego iterowanego dziecka tworzymy Fiber
      const tag =
        typeof element.type === 'function' ? alternate ? alternate.tag : IndeterminateComponent : HostComponent;
      const sameType = alternate && element && element.type == alternate.type;
      const effectTag = sameType ? Update : (element ? Placement : Deletion);
      const newFiber = createFiberSimple({
        tag,
        element,
        alternate,
        effectTag,
        parentFiber: workInProgress,
        stateNode: alternate && alternate.stateNode ? alternate.stateNode : null,
        // memoizedState: alternate ? alternate.memoizedState : null,
      });

      // jeśli aktualnie iterowany jest pierwsze dziecko
      if (index === 0) {
        // tworzymy w Fiberze dla którego odbywa się proces powiązanie w polu child
        workInProgress.child = newFiber;
        // jeśli iterujemy nie pierwszy element
      } else {
        // tworzymy powiązanie rodzeństwa w polu sibling, w ostatnio iterowanym Fiberze
        previousFiber.sibling = newFiber;
      }

      if (alternate) {
        alternate = alternate.sibling;
      }

      // na koniec iteracji ustawiamy ostatnio iterowany element
      previousFiber = newFiber;
    });
    // jeśli argument children nie jest tablicą ani obiektem
  } else {
    // uznajemy że Fiber nie jest związany z żadnym dzieckiem
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
    workInProgress.memoizedState = workInProgressHook = hook;
  } else {
    workInProgressHook = workInProgressHook.next = hook;
  }

  return workInProgressHook;
}

function updateWorkInProgressHook() {
  console.log(['updateWorkInProgressHook']);

  let nextCurrentHook;

  if (currentHook === null) {
    const current = workInProgress.alternate;

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
    nextWorkInProgressHook = workInProgress.memoizedState;
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
      workInProgress.memoizedState = workInProgressHook = newHook;
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

  queue.lastRenderedReducer = reducer;

  const current = currentHook;
  let baseQueue = current.baseQueue;
  const pendingQueue = queue.pending;

  console.log(['pendingQueue'], pendingQueue);

  if (pendingQueue !== null) {
    current.baseQueue = baseQueue = pendingQueue;
    queue.pending = null;
  }
  console.log(['baseQueue'], baseQueue);

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

  workInProgressRoot = createFiberSimple({
    tag: HostRoot,
    stateNode: workInProgressRoot.stateNode,
    element: {
      props: workInProgressRoot.pendingProps,
    },
    alternate: workInProgressRoot,
  });
  workInProgress = workInProgressRoot;

  performSyncWorkOnRoot(workInProgressRoot);
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
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState,
  });
  const dispatch = (queue.dispatch = dispatchAction.bind(
    null,
    workInProgress,
    queue,
  ));

  return [hook.memoizedState, dispatch];
}

{
  HooksDispatcherOnMount = {
    useState: function(initialState) {
      console.log(['HooksDispatcherOnMount.useState'], { initialState });

      const prevDispatcher = ReactCurrentDispatcher.current;

      try {
        return mountState(initialState);
      } finally {
        ReactCurrentDispatcher.current = prevDispatcher;
      }
    },
  };
  HooksDispatcherOnUpdate = {
    useState: function(initialState) {
      console.log(['HooksDispatcherOnUpdate.useState'], { initialState });

      const prevDispatcher = ReactCurrentDispatcher.current;

      try {
        return updateState();
      } finally {
        ReactCurrentDispatcher.current = prevDispatcher;
      }
    },
  };
}

function renderWithHooks(current, workInProgress, Component, props, secondArg) {
  console.log(['renderWithHooks'], {
    current,
    workInProgress,
    Component,
    props,
    secondArg,
  });

  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;

  if (current !== null && current.memoizedState !== null) {
    ReactCurrentDispatcher.current = HooksDispatcherOnUpdate;
  } else {
    ReactCurrentDispatcher.current = HooksDispatcherOnMount;
  }

  const children = Component(props, secondArg);

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
    null,
  );

  reconcileChildren(current, workInProgress, nextChildren);

  return workInProgress.child;
}

function mountIndeterminateComponent(current, workInProgress, Component) {
  console.log(['mountIndeterminateComponent'], { current, workInProgress, Component });

  const children = renderWithHooks(null, workInProgress, Component, workInProgress.pendingProps, null);

  workInProgress.tag = FunctionComponent;

  reconcileChildren(current, workInProgress, children);

  return workInProgress.child;
}

function beginWork(current: Fiber, unitOfWork: Fiber): Fiber | null {
  console.log(['beginWork'], { current, unitOfWork });

  switch (unitOfWork.tag) {
    case IndeterminateComponent: {
      return mountIndeterminateComponent(current, workInProgress, workInProgress.type);
    }
    case FunctionComponent: {
      return updateFunctionComponent(
        current,
        workInProgress,
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
      throw Error('unknown fiber tag to begin work.')
    }
  }
}

function performUnitOfWork(unitOfWork) {
  console.log(['performUnitOfWork'], { unitOfWork });
  // The current, flushed, state of this fiber is the alternate. Ideally
  // nothing should rely on this, but relying on it here means that we don't
  // need an additional field on the work in progress.
  const current = unitOfWork.alternate;
  let next;

  next = beginWork(current, unitOfWork);

  unitOfWork.memoizedProps = unitOfWork.pendingProps;

  if (next === null) {
    // If this doesn't spawn new work, complete the current work.
    next = completeUnitOfWork(unitOfWork);
  }

  return next;
}

function workLoopSync() {
  console.log(['workLoopSync']);

  while (workInProgress !== null) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}

function finishSyncRender(root) {
  console.log(['finishSyncRender'], { root });
  // workInProgressRoot = null;
  commitWork(root.child);
}

function performSyncWorkOnRoot(root: Fiber) {
  console.log(['performSyncWorkOnRoot'], root);

  if (workInProgress !== null) {
    workLoopSync();

    finishSyncRender(root);
  }

  return null;
}

requestIdleCallback(() => {
  performSyncWorkOnRoot(workInProgressRoot);
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
      ...(props || {}), // jeśli element nie posiada żadnych propsów wykorzystywany transpiler @babel/plugin-transform-react-jsx przekazuje nulla jako drugi argument
      children: children.length === 1 ? children[0] : children, // zawsze chcemy traktować children jako tablice, jeśli mamy tylko jedno dziecko, tworzymy z niego jednoelementową tablicę
    },
  };
}

function render(children: ReactElement, container: HTMLElement) {
  console.log(['render'], { children, container });
  workInProgressRoot = createFiberSimple({
    tag: HostRoot,
    stateNode: container,
    element: {
      props: {
        children,
      },
    },
  });
  workInProgress = workInProgressRoot;
}

function resolveDispatcher() {
  const dispatcher = ReactCurrentDispatcher.current;

  if (!(dispatcher !== null)) {
    {
      throw Error('Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://fb.me/react-invalid-hook-call for tips about how to debug and fix this problem.');
    }
  }

  return dispatcher;
}

function useState(initialState) {
  const dispatcher = resolveDispatcher();

  return dispatcher.useState(initialState);
}

/*
api biblioteki
*/
export default {
  useState,
  createElement,
  render,
};
