# warsawjs-workshop-45-own-react
Workshop for purpose of WarsawJS Workshop 45 - build Your own React

## Transpiling JSX

First step is to set up working environment, so it can transpile JSX templates to nested functions calls.

### Steps

* install npm module `@babel/transform-react-jsx`
* open `.babelrc` and add `plugins` field at top level

## Creating Elements

Next step is to transform JSX into tree of Elements.
Elements represents the shape of UI.

## Representing work as Fiber

All work done in React is represented by Fiber - special object containg call information about work that needs to be done on specific node.
Every Element need corresponding Fiber.

## Traversing through linked Fibers

Every Fiber is linked to at least one other Fiber.
Fiber can have two linked Fibers:
* child - first descendent children
* sibling - sibling node

## Commit work - render DOM

After all work is represented as Fibers, start rendering DOM.

## Attach events lister

To rendered DOM attach events listers.

## Adding state - useState

Implement simple useState hook implementation.

## Updating DOM

Check weather node needs to be placed or updated
