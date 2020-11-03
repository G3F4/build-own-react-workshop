import { Fiber } from './OwnReact';
import { SVG } from '@svgdotjs/svg.js';

const fibersTreeSize = 800;
const fibersTreeRatio = 0.9;
const elementsTreeSize = 600;
const elementsTreeRatio = 0.9;
const fiberPrinter = SVG()
  .addTo('#fiberView main')
  .size(fibersTreeSize, fibersTreeSize * fibersTreeRatio);
const elementsTreePrinter = SVG()
  .addTo('#elementsTree')
  .size(elementsTreeSize, elementsTreeSize * elementsTreeRatio);
let currentFiberGlobal: Fiber | null = null;

interface PrintDashboardProps {
  currentFiber: Fiber;
  finishedRootFiber: Fiber;
  currentRootFiber: Fiber;
}

export default function printDashboard({
  currentFiber,
  currentRootFiber,
  finishedRootFiber,
}: PrintDashboardProps) {
  currentFiberGlobal = currentFiber;
  fiberPrinter.clear();
  elementsTreePrinter.clear();
  currentFiber && drawCurrentFiberInfo(currentFiber);
  drawAlternateFibers(finishedRootFiber);
  drawCurrentFibers(currentRootFiber || finishedRootFiber);
  drawElementsTree(currentRootFiber || finishedRootFiber);
}

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

let traverseFiberElementsCounter = 0;

function traverseFiberElements(
  fiber: Fiber,
  path: { childDepth: number; siblingsDepth: number },
  callback: (
    fiber: Fiber,
    path: { childDepth: number; siblingsDepth: number },
  ) => void,
) {
  callback(fiber, path);
  traverseFiberElementsCounter++;

  if (fiber.child) {
    traverseFiberElements(
      fiber.child,
      { ...path, childDepth: path.childDepth + 1 },
      callback,
    );
  }

  if (fiber.sibling) {
    traverseFiberElements(
      fiber.sibling,
      {
        ...path,
        siblingsDepth: path.siblingsDepth + 1,
      },
      callback,
    );
  }
}

const drawUnit = fibersTreeSize / 60;
const fiberWidth = 15 * drawUnit;
const fiberHeight = 9 * drawUnit;
const jsxLineHeight = drawUnit * 1.8;
const fontFamily = 'sans-serif';
const colorPalette = {
  white: '#fff',
  black: '#000',
  fiber: '#adcbe3',
  fiberInfo: '#e7eff6',
  childArrow: '#2a4d69',
  returnArrow: '#4b86b4',
  siblingArrow: '#63ace5',
} as const;
const fiberBackgroundColor = colorPalette.fiber;

function drawFiber(
  fiber: Fiber,
  path: { childDepth: number; siblingsDepth: number },
  opacity = 1,
) {
  const cx = fiberWidth * path.siblingsDepth + fiberWidth / 2;
  const cy = fiberHeight * path.childDepth + fiberHeight / 2;
  const fiberLabel = getFiberLabel(fiber);
  const drawingCurrent = fiber === currentFiberGlobal;

  if (drawingCurrent) {
    fiberPrinter
      .rect(fiberWidth, fiberHeight)
      .attr({ fill: colorPalette.black })
      .cx(cx)
      .cy(cy)
      .opacity(opacity);
  }

  fiberPrinter
    .rect(fiberWidth - drawUnit, fiberHeight - drawUnit)
    .attr({ fill: fiberBackgroundColor })
    .cx(cx)
    .cy(cy)
    .opacity(opacity);

  fiberPrinter
    .text(fiberLabel)
    .move(cx - 6.5 * drawUnit, cy - 4 * drawUnit)
    .font({
      fill: colorPalette.black,
      family: fontFamily,
      size: drawUnit * 1.7,
    })
    .opacity(opacity);

  const propsString = Object.entries(fiber.pendingProps)
    .filter(([key]) => key !== 'children')
    .map(([key, value]) => {
      const formattedValue =
        typeof value === 'function' ? value.name : value.toString();

      return `${key}: ${formattedValue}`;
    })
    .join('\n');

  fiberPrinter
    .text(propsString)
    .move(cx - 6.5 * drawUnit, cy - drawUnit * 1.5)
    .font({ fill: colorPalette.black, family: fontFamily, size: drawUnit })
    .opacity(opacity);
}

function drawCurrentFiberInfo(fiber: Fiber) {
  const cx = drawUnit * 38;
  const cy = drawUnit * 12;
  const fiberLabel = getFiberLabel(fiber);
  const size = drawUnit * 20;

  fiberPrinter
    .rect(size * 2 + drawUnit, size + drawUnit)
    .attr({ fill: colorPalette.black })
    .cx(cx)
    .cy(cy);
  fiberPrinter
    .rect(size * 2, size)
    .attr({ fill: colorPalette.fiberInfo })
    .cx(cx)
    .cy(cy);

  fiberPrinter
    .text(fiberLabel)
    .move(cx - drawUnit * 18, drawUnit * 3)
    .font({ fill: colorPalette.black, family: fontFamily, size: drawUnit * 3 });

  const propsString = Object.entries(fiber.pendingProps)
    // .filter(([key, value]) => {
    //   if (key === 'children') {
    //     return typeof value === 'string';
    //   }
    //
    //   return true;
    // })
    .map(([key, value]) => {
      const ellipsisFrom = drawUnit * 2;
      let formattedValue =
        typeof value === 'function'
          ? value.toString().split('{')[0]
          : JSON.stringify(value);

      if (key === 'children' && Array.isArray(value)) {
        formattedValue = value.reduce((acc, { type }) => `${acc}, ${type}`, '');
      }

      if (formattedValue.length > ellipsisFrom) {
        formattedValue = formattedValue.slice(0, ellipsisFrom) + '...';
      }

      return `${key}: ${formattedValue}`;
    })
    .join('\n');

  fiberPrinter
    .text(propsString)
    .move(cx - drawUnit * 18, cy - drawUnit * 5)
    .font({ fill: colorPalette.black, family: fontFamily, size: drawUnit * 2 });
}

function drawElement(
  fiber: Fiber,
  path: { childDepth: number; siblingsDepth: number },
) {
  const elementName = getFiberLabel(fiber);
  const drawingCurrent = fiber === currentFiberGlobal;
  const topMargin = drawUnit;
  const cx = drawUnit * 3 * path.childDepth + fiberWidth / 2;
  const cy =
    jsxLineHeight * traverseFiberElementsCounter - drawUnit / 2 + topMargin;
  const y = cy;
  const x1 = cx - 6 * drawUnit + path.childDepth * drawUnit;
  const y1 = y + jsxLineHeight + drawUnit / 3;
  const x2 = x1 + drawUnit * 6;
  const y2 = y1;

  if (drawingCurrent) {
    elementsTreePrinter
      .line(x1, y1, x2, y2)
      .stroke({ color: colorPalette.returnArrow, width: drawUnit / 2 });
  }

  elementsTreePrinter
    .text(`<${elementName}>`)
    .move(x1, y)
    .font({ fill: colorPalette.black, family: fontFamily, size: drawUnit * 2 });
}

function drawFiberLinks(
  fiber: Fiber,
  path: { childDepth: number; siblingsDepth: number },
) {
  const cx = fiberWidth * path.siblingsDepth + fiberWidth / 2;
  const cy = fiberHeight * path.childDepth + fiberHeight / 2;
  const childOrder = getChildOrder(fiber);
  const arrowSize = drawUnit / 3;

  function getArrowMarker(color: string) {
    return fiberPrinter.marker(arrowSize, arrowSize, function (add) {
      add
        .polyline([
          [0, arrowSize / 2],
          [(arrowSize * 2) / 2, arrowSize],
          [(arrowSize * 2) / 2, 0],
        ])
        .rotate(180)
        .fill(color);
    });
  }

  if (fiber.return) {
    const x1 = cx + 2 * drawUnit;
    const y1 = cy - 4 * drawUnit;
    const x2 =
      cx + 2 * drawUnit - childOrder * fiberWidth + childOrder * drawUnit;
    const y2 = cy - 6 * drawUnit;

    fiberPrinter
      .line(x1, y1, x2, y2)
      .stroke({ color: colorPalette.returnArrow, width: 4, linecap: 'round' })
      .marker('end', getArrowMarker(colorPalette.returnArrow));
  }

  if (fiber.child) {
    fiberPrinter
      .line(cx, cy + 4 * drawUnit, cx, cy + 6 * drawUnit)
      .stroke({ color: colorPalette.childArrow, width: 4, linecap: 'round' })
      .marker('end', getArrowMarker(colorPalette.childArrow));
  }

  if (fiber.sibling) {
    fiberPrinter
      .line(
        cx + 6 * drawUnit,
        cy + 2 * drawUnit,
        cx + 9 * drawUnit,
        cy + 2 * drawUnit,
      )
      .stroke({ color: colorPalette.siblingArrow, width: 4, linecap: 'round' })
      .marker('end', getArrowMarker(colorPalette.siblingArrow));
  }
}

function drawCurrentFibers(fiber: Fiber) {
  traverseFiber(fiber, { childDepth: 0, siblingsDepth: 0 }, drawFiber);
  traverseFiber(fiber, { childDepth: 0, siblingsDepth: 0 }, drawFiberLinks);
}

function drawElementsTree(fiber: Fiber) {
  traverseFiberElementsCounter = 0;
  traverseFiberElements(
    fiber,
    { childDepth: 0, siblingsDepth: 0 },
    drawElement,
  );
}

function drawAlternateFibers(fiber: Fiber) {
  if (fiber) {
    traverseFiber(fiber, { childDepth: 0, siblingsDepth: 0 }, (fiber, path) =>
      drawFiber(fiber, path, 0.5),
    );
    traverseFiber(fiber, { childDepth: 0, siblingsDepth: 0 }, drawFiberLinks);
  }
}
