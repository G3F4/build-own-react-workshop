// typ pojedynczego propa
type Prop =
  | string
  | EventListenerOrEventListenerObject
  | Record<string, string>
  | ReactElement;

// typ obiektu reprezentującego propsy
type Props = Record<string, Prop>;

// interfejs Fibera, czyli obiektu reprezentującego jednostkę pracy
interface Fiber {
  tag: number; // typ Fibera
  stateNode: HTMLElement | null; // element DOM, z którym jest związany Fiber
  type: Function | string; // typ elementu React, z którym jest związany Fiber
  props: Props; // propsy Elementu React, z którym jest związany Fiber
  return: Fiber | null; // powiązanie do Fibera, który jest rodzicem dla tego Fibera
  sibling: Fiber | null; // powiązanie do Fibera, który jest rodzeństwem dla tego Fibera
  child: Fiber | null; // powiązanie do Fibera, który jest bezpośrednim dzieckiem dla tego Fibera
}

// interfejs opisujący obiekt reprezentujący element React
interface ReactElement {
  type: Function | string; // typ elementu React, może to być funkcja, która jest komponentem albo string z nazwą elementu DOM
  props: Props; // propsy elementu React
}

const FunctionComponent = 0; // stała reprezentująca rodzaj Fibera z komponentem funkcyjnym
const HostRoot = 3; // stała reprezentująca rodzaj Fibera z elementem DOM kontenera aplikacji
const HostComponent = 5; // stała reprezentująca rodzaj Fibera z elementem DOM
let workInProgressRoot = null; // Fiber związany z kontenerem aplikacji
let workInProgress = null; // Fiber, który reprezentuje aktualną pracę do wykonania

/*
funkcja kończąca jednostkę pracy
wykorzystując wcześniej stworzone powiązania, przechodzi po wszystkich Fiberach
i dla każdego Fibera, który reprezentuje element DOM
tworzy ten element i zapisuje referencje w polu `stateNode`
*/
function completeUnitOfWork(unitOfWork: Fiber): Fiber | null {
  console.log(['completeUnitOfWork'], unitOfWork);
  // TODO

  return null;
}

/*
funkcja aktualizująca właściwości elementu DOM związanego z Fiberem
jako argument dostaje Fiber
*/
function updateProperties(fiber: Fiber): void {
  console.log(['updateProperties'], { fiber });
  // TODO
}

/*
funkcja dołącza do najbliższego rodzica elementu DOM znalezionego w wzwyż w hierarchii Fiberów
jako argument dostaje Fiber, który jest aktualnie iterowany podczas rekurencyjnego przeglądania struktury Fiberów
*/
function commitWork(fiber: Fiber): void {
  console.log(['commitWork'], { fiber });
  // TODO
}

/*
funkcja tworząca powiązania Fibera do jego dzieci w postaci powiązanych Fiberów
w procesie dla wszystkich dzieci Fibera zostaną utworzone własne Fibery
*/
function reconcileChildren(fiber: Fiber, children: unknown): void {
  console.log(['reconcileChildren'], { fiber, children });
  // TODO
}

/*
funkcja rozpoczynająca pracę
jako argument dostaje Fiber
zwraca dziecko Fibera po wykonaniu procesu rekoncyliacji(org. reconciliation)
*/
function beginWork(unitOfWork: Fiber): Fiber | null {
  console.log(['beginWork'], { unitOfWork });
  // TODO

  return null;
}

/*
wykonuje jednostkę pracy
jako argument dostaje Fiber
zwraca następną jednostkę pracy
*/
function performUnitOfWork(unitOfWork: Fiber): Fiber | null {
  console.log(['performUnitOfWork'], { unitOfWork });
  // TODO

  return null;
}

/*
funkcja rozpoczyna pracę na root'cie, czyli Fiberem związanych z kontenerem aplikacji (<div id="root" />)
efektem końcowym jest wyrenderowana aplikacja (DOM)
*/
function performSyncWorkOnRoot(): void {
  workInProgress && console.log(['performSyncWorkOnRoot']);

  // jeśli jest jakaś praca do wykonania
  if (workInProgress !== null) {
    // tak długo jak jest praca do wykonania
    while (workInProgress !== null) {
      // wykonujemy pracę na aktualnie ustawionym Fiberze
      workInProgress = performUnitOfWork(workInProgress);
    }
  }

  // rejestrujemy ponowne załadowanie funkcji sprawdzającej czy jest praca do wykonania
  requestIdleCallback(performSyncWorkOnRoot);
}

// rozpoczynamy nieskończoną pętle, która sprawdza czy jest jakaś praca do wykonania
// funkcja requestIdleCallback rejestruje do wykonania funkcję i wywołuje ją w momencie gdy przeglądarka jest bezczynna
// docs: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback
requestIdleCallback(performSyncWorkOnRoot);

/*
funkcja tworząca nowy Fiber
jako argument otrzymuje obiekt z interfejsem
element - element React, dla którego tworzony jest Fiber
tag - rodzaj Fibera
parentFiber - Fiber rodzica
stateNode - element DOM, z którym powiązany jest tworzony Fiber
zwraca nowy Fiber
*/
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

/*
wykorzystywana przez babel, funkcja do zamiany JSX na elementy React
jako argumenty dostajemy kolejno:
- typ elementu, np. div albo App
- propsy elementu bez dzieci
- kolejne dzieci elementu, czyli tekst albo inny element

zwraca element React, który składa się z propsów oraz typu elementu
*/
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

/*
funkcja tworząca pierwszą jednostkę pracy, która jest związana z kontenerem aplikacji
*/
function render(element: ReactElement, container: HTMLElement) {
  console.log(['render'], { element, container });
  // tworzymy Fiber związany z kontenerem aplikacji i zapisujemy referencję
  workInProgressRoot = createFiber({
    tag: HostRoot,
    stateNode: container,
    element: {
      props: {
        children: [element],
      },
    },
  });
  // ustawiamy stworzony Fiber jako aktualna praca do wykonania
  // co spowoduje że pętla aplikacji rozpocznie prace
  workInProgress = workInProgressRoot;
}

/*
api biblioteki
*/
export default {
  createElement,
  render,
};
