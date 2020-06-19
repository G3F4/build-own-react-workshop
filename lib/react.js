/** @license React v16.13.1
 * react.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports)
    : typeof define === 'function' && define.amd
    ? define(['exports'], factory)
    : ((global = global || self), factory((global.React = {})));
})(this, function (exports) {
  'use strict';

  // The Symbol used to tag the ReactElement-like types. If there is no native Symbol
  // nor polyfill, then a plain number is used for performance.
  const hasSymbol = typeof Symbol === 'function' && Symbol.for;
  const REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
  const REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;
  const MAYBE_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  const FAUX_ITERATOR_SYMBOL = '@@iterator';

  function getIteratorFn(maybeIterable) {
    if (maybeIterable === null || typeof maybeIterable !== 'object') {
      return null;
    }

    const maybeIterator =
      (MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL]) ||
      maybeIterable[FAUX_ITERATOR_SYMBOL];

    if (typeof maybeIterator === 'function') {
      return maybeIterator;
    }

    return null;
  }

  /**
   * Keeps track of the current dispatcher.
   */
  const ReactCurrentDispatcher = {
    /**
     * @internal
     * @type {ReactComponent}
     */
    current: null,
  };
  /**
   * Keeps track of the current batch's configuration such as how long an update
   * should suspend for if it needs to.
   */
  const ReactCurrentBatchConfig = {
    suspense: null,
  };
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

  function getComponentName(type) {
    if (type == null) {
      // Host root, text node or just invalid type.
      return null;
    }

    if (typeof type === 'function') {
      return type.displayName || type.name || null;
    }

    if (typeof type === 'string') {
      return type;
    }

    return null;
  }

  const ReactDebugCurrentFrame = {};

  /**
   * Used by act() to track whether you're inside an act() scope.
   */
  const IsSomeRendererActing = {
    current: false,
  };
  const ReactSharedInternals = {
    ReactCurrentDispatcher: ReactCurrentDispatcher,
    ReactCurrentBatchConfig: ReactCurrentBatchConfig,
    ReactCurrentOwner: ReactCurrentOwner,
    IsSomeRendererActing: IsSomeRendererActing,
    // Used by renderers to avoid bundling object-assign twice in UMD bundles:
    assign: Object.assign,
  };

  {
    Object.assign(ReactSharedInternals, {
      // These should not be included in production.
      ReactDebugCurrentFrame: ReactDebugCurrentFrame,
      // Shim for React DOM 16.0.0 which still destructured (but not used) this.
      // TODO: remove in React 17.0.
      ReactComponentTreeHook: {},
    });
  }

  // by calls to these methods by a Babel plugin.
  //
  // In PROD (or in packages without access to React internals),
  // they are left as they are instead.

  function warn(format) {
    {
      for (
        var _len = arguments.length,
          args = new Array(_len > 1 ? _len - 1 : 0),
          _key = 1;
        _key < _len;
        _key++
      ) {
        args[_key - 1] = arguments[_key];
      }

      printWarning('warn', format, args);
    }
  }

  function error(format) {
    {
      for (
        var _len2 = arguments.length,
          args = new Array(_len2 > 1 ? _len2 - 1 : 0),
          _key2 = 1;
        _key2 < _len2;
        _key2++
      ) {
        args[_key2 - 1] = arguments[_key2];
      }

      printWarning('error', format, args);
    }
  }

  function printWarning(level, format, args) {
    // When changing this logic, you might want to also
    // update consoleWithStackDev.www.js as well.
    {
      const hasExistingStack =
        args.length > 0 &&
        typeof args[args.length - 1] === 'string' &&
        args[args.length - 1].indexOf('\n    in') === 0;

      if (!hasExistingStack) {
        const ReactDebugCurrentFrame =
          ReactSharedInternals.ReactDebugCurrentFrame;
        const stack = ReactDebugCurrentFrame.getStackAddendum();

        if (stack !== '') {
          format += '%s';
          args = args.concat([stack]);
        }
      }

      const argsWithFormat = args.map(function (item) {
        return '' + item;
      }); // Careful: RN currently depends on this prefix

      argsWithFormat.unshift('Warning: ' + format); // We intentionally don't use spread (or .apply) directly because it
      // breaks IE9: https://github.com/facebook/react/issues/13610
      // eslint-disable-next-line react-internal/no-production-logging

      Function.prototype.apply.call(console[level], console, argsWithFormat);

      try {
        // --- Welcome to debugging React ---
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        let argIndex = 0;
        const message =
          'Warning: ' +
          format.replace(/%s/g, function () {
            return args[argIndex++];
          });

        throw new Error(message);
      } catch (x) {}
    }
  }

  const emptyObject = {};

  {
    Object.freeze(emptyObject);
  }
  /**
   * Base class helpers for the updating state of a component.
   */

  const hasOwnProperty$1 = Object.prototype.hasOwnProperty;
  const RESERVED_PROPS = {
    key: true,
    ref: true,
    __self: true,
    __source: true,
  };
  let specialPropKeyWarningShown,
    specialPropRefWarningShown,
    didWarnAboutStringRefs;

  {
    didWarnAboutStringRefs = {};
  }

  function hasValidRef(config) {
    {
      if (hasOwnProperty$1.call(config, 'ref')) {
        const getter = Object.getOwnPropertyDescriptor(config, 'ref').get;

        if (getter && getter.isReactWarning) {
          return false;
        }
      }
    }

    return config.ref !== undefined;
  }

  function hasValidKey(config) {
    {
      if (hasOwnProperty$1.call(config, 'key')) {
        const getter = Object.getOwnPropertyDescriptor(config, 'key').get;

        if (getter && getter.isReactWarning) {
          return false;
        }
      }
    }

    return config.key !== undefined;
  }

  function defineKeyPropWarningGetter(props, displayName) {
    const warnAboutAccessingKey = function () {
      {
        if (!specialPropKeyWarningShown) {
          specialPropKeyWarningShown = true;

          error(
            '%s: `key` is not a prop. Trying to access it will result ' +
              'in `undefined` being returned. If you need to access the same ' +
              'value within the child component, you should pass it as a different ' +
              'prop. (https://fb.me/react-special-props)',
            displayName,
          );
        }
      }
    };

    warnAboutAccessingKey.isReactWarning = true;
    Object.defineProperty(props, 'key', {
      get: warnAboutAccessingKey,
      configurable: true,
    });
  }

  function defineRefPropWarningGetter(props, displayName) {
    const warnAboutAccessingRef = function () {
      {
        if (!specialPropRefWarningShown) {
          specialPropRefWarningShown = true;

          error(
            '%s: `ref` is not a prop. Trying to access it will result ' +
              'in `undefined` being returned. If you need to access the same ' +
              'value within the child component, you should pass it as a different ' +
              'prop. (https://fb.me/react-special-props)',
            displayName,
          );
        }
      }
    };

    warnAboutAccessingRef.isReactWarning = true;
    Object.defineProperty(props, 'ref', {
      get: warnAboutAccessingRef,
      configurable: true,
    });
  }

  function warnIfStringRefCannotBeAutoConverted(config) {
    {
      if (
        typeof config.ref === 'string' &&
        ReactCurrentOwner.current &&
        config.__self &&
        ReactCurrentOwner.current.stateNode !== config.__self
      ) {
        const componentName = getComponentName(ReactCurrentOwner.current.type);

        if (!didWarnAboutStringRefs[componentName]) {
          error(
            'Component "%s" contains the string ref "%s". ' +
              'Support for string refs will be removed in a future major release. ' +
              'This case cannot be automatically converted to an arrow function. ' +
              'We ask you to manually fix this case by using useRef() or createRef() instead. ' +
              'Learn more about using refs safely here: ' +
              'https://fb.me/react-strict-mode-string-ref',
            getComponentName(ReactCurrentOwner.current.type),
            config.ref,
          );

          didWarnAboutStringRefs[componentName] = true;
        }
      }
    }
  }
  /**
   * Factory method to create a new React element. This no longer adheres to
   * the class pattern, so do not use new to call it. Also, instanceof check
   * will not work. Instead test $$typeof field against Symbol.for('react.element') to check
   * if something is a React Element.
   *
   * @param {*} type
   * @param {*} props
   * @param {*} key
   * @param {string|object} ref
   * @param {*} owner
   * @param {*} self A *temporary* helper to detect places where `this` is
   * different from the `owner` when React.createElement is called, so that we
   * can warn. We want to get rid of owner and replace string `ref`s with arrow
   * functions, and as long as `this` and owner are the same, there will be no
   * change in behavior.
   * @param {*} source An annotation object (added by a transpiler or otherwise)
   * indicating filename, line number, and/or other information.
   * @internal
   */

  const ReactElement = function (type, key, ref, self, source, owner, props) {
    console.log(['ReactElement'], { type, key, ref, self, source, owner, props })
    return {
      // This tag allows us to uniquely identify this as a React Element
      $$typeof: REACT_ELEMENT_TYPE,
      // Built-in properties that belong on the element
      type: type,
      key: key,
      ref: ref,
      props: props,
      // Record the component responsible for creating this element.
      _owner: owner,
    };
  };
  /**
   * Create and return a new ReactElement of the given type.
   * See https://reactjs.org/docs/react-api.html#createelement
   */

  function createElement(type, config, children) {
    let propName; // Reserved names are extracted
    const props = {};
    let key = null;
    let ref = null;
    let self = null;
    let source = null;

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

    return ReactElement(
      type,
      key,
      ref,
      self,
      source,
      ReactCurrentOwner.current,
      props,
    );
  }

  function cloneAndReplaceKey(oldElement, newKey) {
    const newElement = ReactElement(
      oldElement.type,
      newKey,
      oldElement.ref,
      oldElement._self,
      oldElement._source,
      oldElement._owner,
      oldElement.props,
    );

    return newElement;
  }
  /**
   * Clone and return a new ReactElement using element as the starting point.
   * See https://reactjs.org/docs/react-api.html#cloneelement
   */

  function isValidElement(object) {
    return (
      typeof object === 'object' &&
      object !== null &&
      object.$$typeof === REACT_ELEMENT_TYPE
    );
  }

  const SEPARATOR = '.';
  const SUBSEPARATOR = ':';
  /**
   * Escape and wrap key so it is safe to use as a reactid
   *
   * @param {string} key to be escaped.
   * @return {string} the escaped key.
   */

  function escape(key) {
    const escapeRegex = /[=:]/g;
    const escaperLookup = {
      '=': '=0',
      ':': '=2',
    };
    const escapedString = ('' + key).replace(escapeRegex, function (match) {
      return escaperLookup[match];
    });

    return '$' + escapedString;
  }
  /**
   * TODO: Test that a single child and an array with one item have the same key
   * pattern.
   */

  let didWarnAboutMaps = false;
  const userProvidedKeyEscapeRegex = /\/+/g;

  function escapeUserProvidedKey(text) {
    return ('' + text).replace(userProvidedKeyEscapeRegex, '$&/');
  }

  const POOL_SIZE = 10;
  const traverseContextPool = [];

  function getPooledTraverseContext(
    mapResult,
    keyPrefix,
    mapFunction,
    mapContext,
  ) {
    if (traverseContextPool.length) {
      const traverseContext = traverseContextPool.pop();

      traverseContext.result = mapResult;
      traverseContext.keyPrefix = keyPrefix;
      traverseContext.func = mapFunction;
      traverseContext.context = mapContext;
      traverseContext.count = 0;

      return traverseContext;
    } else {
      return {
        result: mapResult,
        keyPrefix: keyPrefix,
        func: mapFunction,
        context: mapContext,
        count: 0,
      };
    }
  }

  function releaseTraverseContext(traverseContext) {
    traverseContext.result = null;
    traverseContext.keyPrefix = null;
    traverseContext.func = null;
    traverseContext.context = null;
    traverseContext.count = 0;

    if (traverseContextPool.length < POOL_SIZE) {
      traverseContextPool.push(traverseContext);
    }
  }
  /**
   * @param {?*} children Children tree container.
   * @param {!string} nameSoFar Name of the key path so far.
   * @param {!function} callback Callback to invoke with each child found.
   * @param {?*} traverseContext Used to pass information throughout the traversal
   * process.
   * @return {!number} The number of children in this subtree.
   */

  function traverseAllChildrenImpl(
    children,
    nameSoFar,
    callback,
    traverseContext,
  ) {
    const type = typeof children;

    if (type === 'undefined' || type === 'boolean') {
      // All of the above are perceived as null.
      children = null;
    }

    let invokeCallback = false;

    if (children === null) {
      invokeCallback = true;
    } else {
      switch (type) {
        case 'string':
        case 'number':
          invokeCallback = true;

          break;
        case 'object':
          switch (children.$$typeof) {
            case REACT_ELEMENT_TYPE:
            case REACT_PORTAL_TYPE:
              invokeCallback = true;
          }
      }
    }

    if (invokeCallback) {
      callback(
        traverseContext,
        children, // If it's the only child, treat the name as if it was wrapped in an array
        // so that it's consistent if the number of children grows.
        nameSoFar === '' ? SEPARATOR + getComponentKey(children, 0) : nameSoFar,
      );

      return 1;
    }

    let child;
    let nextName;
    let subtreeCount = 0; // Count of children found in the current subtree.
    const nextNamePrefix =
      nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;

    if (Array.isArray(children)) {
      for (let i = 0; i < children.length; i++) {
        child = children[i];
        nextName = nextNamePrefix + getComponentKey(child, i);
        subtreeCount += traverseAllChildrenImpl(
          child,
          nextName,
          callback,
          traverseContext,
        );
      }
    } else {
      const iteratorFn = getIteratorFn(children);

      if (typeof iteratorFn === 'function') {
        {
          // Warn about using Maps as children
          if (iteratorFn === children.entries) {
            if (!didWarnAboutMaps) {
              warn(
                'Using Maps as children is deprecated and will be removed in ' +
                  'a future major release. Consider converting children to ' +
                  'an array of keyed ReactElements instead.',
              );
            }

            didWarnAboutMaps = true;
          }
        }

        const iterator = iteratorFn.call(children);
        let step;
        let ii = 0;

        while (!(step = iterator.next()).done) {
          child = step.value;
          nextName = nextNamePrefix + getComponentKey(child, ii++);
          subtreeCount += traverseAllChildrenImpl(
            child,
            nextName,
            callback,
            traverseContext,
          );
        }
      } else if (type === 'object') {
        let addendum = '';

        {
          addendum =
            ' If you meant to render a collection of children, use an array ' +
            'instead.' +
            ReactDebugCurrentFrame.getStackAddendum();
        }

        const childrenString = '' + children;

        {
          {
            throw Error(
              'Objects are not valid as a React child (found: ' +
                (childrenString === '[object Object]'
                  ? 'object with keys {' +
                    Object.keys(children).join(', ') +
                    '}'
                  : childrenString) +
                ').' +
                addendum,
            );
          }
        }
      }
    }

    return subtreeCount;
  }
  /**
   * Traverses children that are typically specified as `props.children`, but
   * might also be specified through attributes:
   *
   * - `traverseAllChildren(this.props.children, ...)`
   * - `traverseAllChildren(this.props.leftPanelChildren, ...)`
   *
   * The `traverseContext` is an optional argument that is passed through the
   * entire traversal. It can be used to store accumulations or anything else that
   * the callback might find relevant.
   *
   * @param {?*} children Children tree object.
   * @param {!function} callback To invoke upon traversing each child.
   * @param {?*} traverseContext Context for traversal.
   * @return {!number} The number of children in this subtree.
   */

  function traverseAllChildren(children, callback, traverseContext) {
    if (children == null) {
      return 0;
    }

    return traverseAllChildrenImpl(children, '', callback, traverseContext);
  }
  /**
   * Generate a key string that identifies a component within a set.
   *
   * @param {*} component A component that could contain a manual key.
   * @param {number} index Index that is used if a manual key is not provided.
   * @return {string}
   */

  function getComponentKey(component, index) {
    // Do some typechecking here since we call this blindly. We want to ensure
    // that we don't block potential future ES APIs.
    if (
      typeof component === 'object' &&
      component !== null &&
      component.key != null
    ) {
      // Explicit key
      return escape(component.key);
    } // Implicit key determined by the index in the set

    return index.toString(36);
  }

  function mapSingleChildIntoContext(bookKeeping, child, childKey) {
    const result = bookKeeping.result,
      keyPrefix = bookKeeping.keyPrefix,
      func = bookKeeping.func,
      context = bookKeeping.context;
    let mappedChild = func.call(context, child, bookKeeping.count++);

    if (Array.isArray(mappedChild)) {
      mapIntoWithKeyPrefixInternal(mappedChild, result, childKey, function (c) {
        return c;
      });
    } else if (mappedChild != null) {
      if (isValidElement(mappedChild)) {
        mappedChild = cloneAndReplaceKey(
          mappedChild, // Keep both the (mapped) and old keys if they differ, just as
          // traverseAllChildren used to do for objects as children
          keyPrefix +
            (mappedChild.key && (!child || child.key !== mappedChild.key)
              ? escapeUserProvidedKey(mappedChild.key) + '/'
              : '') +
            childKey,
        );
      }

      result.push(mappedChild);
    }
  }

  function mapIntoWithKeyPrefixInternal(
    children,
    array,
    prefix,
    func,
    context,
  ) {
    let escapedPrefix = '';

    if (prefix != null) {
      escapedPrefix = escapeUserProvidedKey(prefix) + '/';
    }

    const traverseContext = getPooledTraverseContext(
      array,
      escapedPrefix,
      func,
      context,
    );

    traverseAllChildren(children, mapSingleChildIntoContext, traverseContext);
    releaseTraverseContext(traverseContext);
  }

  function useState(initialState) {
    return ReactCurrentDispatcher.current.useState(initialState);
  }

  function createElementWithValidation(type, props, children) {
    return createElement.apply(this, arguments);
  }

  const enableSchedulerDebugging = false;
  let requestHostCallback;
  let requestHostTimeout;
  let cancelHostTimeout;
  let shouldYieldToHost;
  let requestPaint;
  let getCurrentTime;
  let forceFrameRate;

  if (
    // If Scheduler runs in a non-DOM environment, it falls back to a naive
    // implementation using setTimeout.
    typeof window === 'undefined' || // Check if MessageChannel is supported, too.
    typeof MessageChannel !== 'function'
  ) {
    // If this accidentally gets imported in a non-browser environment, e.g. JavaScriptCore,
    // fallback to a naive implementation.
    let _callback = null;
    let _timeoutID = null;

    var _flushCallback = function () {
      if (_callback !== null) {
        try {
          const currentTime = getCurrentTime();
          const hasRemainingTime = true;

          _callback(hasRemainingTime, currentTime);

          _callback = null;
        } catch (e) {
          setTimeout(_flushCallback, 0);

          throw e;
        }
      }
    };

    const initialTime = Date.now();

    getCurrentTime = function () {
      return Date.now() - initialTime;
    };

    requestHostCallback = function (cb) {
      if (_callback !== null) {
        // Protect against re-entrancy.
        setTimeout(requestHostCallback, 0, cb);
      } else {
        _callback = cb;
        setTimeout(_flushCallback, 0);
      }
    };

    requestHostTimeout = function (cb, ms) {
      _timeoutID = setTimeout(cb, ms);
    };

    cancelHostTimeout = function () {
      clearTimeout(_timeoutID);
    };

    shouldYieldToHost = function () {
      return false;
    };

    requestPaint = forceFrameRate = function () {};
  } else {
    // Capture local references to native APIs, in case a polyfill overrides them.
    const performance = window.performance;
    const _Date = window.Date;
    const _setTimeout = window.setTimeout;
    const _clearTimeout = window.clearTimeout;

    if (typeof console !== 'undefined') {
      // TODO: Scheduler no longer requires these methods to be polyfilled. But
      // maybe we want to continue warning if they don't exist, to preserve the
      // option to rely on it in the future?
      const requestAnimationFrame = window.requestAnimationFrame;
      const cancelAnimationFrame = window.cancelAnimationFrame; // TODO: Remove fb.me link

      if (typeof requestAnimationFrame !== 'function') {
        // Using console['error'] to evade Babel and ESLint
        console['error'](
          "This browser doesn't support requestAnimationFrame. " +
            'Make sure that you load a ' +
            'polyfill in older browsers. https://fb.me/react-polyfills',
        );
      }

      if (typeof cancelAnimationFrame !== 'function') {
        // Using console['error'] to evade Babel and ESLint
        console['error'](
          "This browser doesn't support cancelAnimationFrame. " +
            'Make sure that you load a ' +
            'polyfill in older browsers. https://fb.me/react-polyfills',
        );
      }
    }

    if (
      typeof performance === 'object' &&
      typeof performance.now === 'function'
    ) {
      getCurrentTime = function () {
        return performance.now();
      };
    } else {
      const _initialTime = _Date.now();

      getCurrentTime = function () {
        return _Date.now() - _initialTime;
      };
    }

    let isMessageLoopRunning = false;
    let scheduledHostCallback = null;
    let taskTimeoutID = -1; // Scheduler periodically yields in case there is other work on the main
    // thread, like user events. By default, it yields multiple times per frame.
    // It does not attempt to align with frame boundaries, since most tasks don't
    // need to be frame aligned; for those that do, use requestAnimationFrame.
    let yieldInterval = 5;
    let deadline = 0; // TODO: Make this configurable

    {
      // `isInputPending` is not available. Since we have no way of knowing if
      // there's pending input, always yield at the end of the frame.
      shouldYieldToHost = function () {
        return getCurrentTime() >= deadline;
      }; // Since we yield every frame regardless, `requestPaint` has no effect.

      requestPaint = function () {};
    }

    forceFrameRate = function (fps) {
      if (fps < 0 || fps > 125) {
        // Using console['error'] to evade Babel and ESLint
        console['error'](
          'forceFrameRate takes a positive int between 0 and 125, ' +
            'forcing framerates higher than 125 fps is not unsupported',
        );

        return;
      }

      if (fps > 0) {
        yieldInterval = Math.floor(1000 / fps);
      } else {
        // reset the framerate
        yieldInterval = 5;
      }
    };

    const performWorkUntilDeadline = function () {
      if (scheduledHostCallback !== null) {
        const currentTime = getCurrentTime(); // Yield after `yieldInterval` ms, regardless of where we are in the vsync
        // cycle. This means there's always time remaining at the beginning of
        // the message event.

        deadline = currentTime + yieldInterval;

        const hasTimeRemaining = true;

        try {
          const hasMoreWork = scheduledHostCallback(
            hasTimeRemaining,
            currentTime,
          );

          if (!hasMoreWork) {
            isMessageLoopRunning = false;
            scheduledHostCallback = null;
          } else {
            // If there's more work, schedule the next message event at the end
            // of the preceding one.
            port.postMessage(null);
          }
        } catch (error) {
          // If a scheduler task throws, exit the current browser task so the
          // error can be observed.
          port.postMessage(null);

          throw error;
        }
      } else {
        isMessageLoopRunning = false;
      } // Yielding to the browser will give it a chance to paint, so we can
    };
    const channel = new MessageChannel();
    var port = channel.port2;
    channel.port1.onmessage = performWorkUntilDeadline;

    requestHostCallback = function (callback) {
      scheduledHostCallback = callback;

      if (!isMessageLoopRunning) {
        isMessageLoopRunning = true;
        port.postMessage(null);
      }
    };

    requestHostTimeout = function (callback, ms) {
      taskTimeoutID = _setTimeout(function () {
        callback(getCurrentTime());
      }, ms);
    };

    cancelHostTimeout = function () {
      _clearTimeout(taskTimeoutID);

      taskTimeoutID = -1;
    };
  }

  function push(heap, node) {
    const index = heap.length;

    heap.push(node);
    siftUp(heap, node, index);
  }

  function peek(heap) {
    const first = heap[0];

    return first === undefined ? null : first;
  }

  function pop(heap) {
    const first = heap[0];

    if (first !== undefined) {
      const last = heap.pop();

      if (last !== first) {
        heap[0] = last;
        siftDown(heap, last, 0);
      }

      return first;
    } else {
      return null;
    }
  }

  function siftUp(heap, node, i) {
    let index = i;

    while (true) {
      const parentIndex = (index - 1) >>> 1;
      const parent = heap[parentIndex];

      if (parent !== undefined && compare(parent, node) > 0) {
        // The parent is larger. Swap positions.
        heap[parentIndex] = node;
        heap[index] = parent;
        index = parentIndex;
      } else {
        // The parent is smaller. Exit.
        return;
      }
    }
  }

  function siftDown(heap, node, i) {
    let index = i;
    const length = heap.length;

    while (index < length) {
      const leftIndex = (index + 1) * 2 - 1;
      const left = heap[leftIndex];
      const rightIndex = leftIndex + 1;
      const right = heap[rightIndex]; // If the left or right node is smaller, swap with the smaller of those.

      if (left !== undefined && compare(left, node) < 0) {
        if (right !== undefined && compare(right, left) < 0) {
          heap[index] = right;
          heap[rightIndex] = node;
          index = rightIndex;
        } else {
          heap[index] = left;
          heap[leftIndex] = node;
          index = leftIndex;
        }
      } else if (right !== undefined && compare(right, node) < 0) {
        heap[index] = right;
        heap[rightIndex] = node;
        index = rightIndex;
      } else {
        // Neither child is smaller. Exit.
        return;
      }
    }
  }

  function compare(a, b) {
    // Compare sort index first, then task id.
    const diff = a.sortIndex - b.sortIndex;

    return diff !== 0 ? diff : a.id - b.id;
  }

  // TODO: Use symbols?
  const NoPriority = 0;
  const ImmediatePriority = 1;
  const UserBlockingPriority = 2;
  const NormalPriority = 3;
  const LowPriority = 4;
  const IdlePriority = 5;
  let runIdCounter = 0;
  let mainThreadIdCounter = 0;
  const profilingStateSize = 4;
  const sharedProfilingBuffer = // $FlowFixMe Flow doesn't know about SharedArrayBuffer
    typeof SharedArrayBuffer === 'function'
      ? new SharedArrayBuffer(profilingStateSize * Int32Array.BYTES_PER_ELEMENT) // $FlowFixMe Flow doesn't know about ArrayBuffer
      : typeof ArrayBuffer === 'function'
      ? new ArrayBuffer(profilingStateSize * Int32Array.BYTES_PER_ELEMENT)
      : null; // Don't crash the init path on IE9
  const profilingState =
    sharedProfilingBuffer !== null ? new Int32Array(sharedProfilingBuffer) : []; // We can't read this but it helps save bytes for null checks
  const PRIORITY = 0;
  const CURRENT_TASK_ID = 1;
  const CURRENT_RUN_ID = 2;
  const QUEUE_SIZE = 3;

  {
    profilingState[PRIORITY] = NoPriority; // This is maintained with a counter, because the size of the priority queue
    // array might include canceled tasks.

    profilingState[QUEUE_SIZE] = 0;
    profilingState[CURRENT_TASK_ID] = 0;
  } // Bytes per element is 4

  const MAX_EVENT_LOG_SIZE = 524288; // Equivalent to 2 megabytes
  let eventLogSize = 0;
  let eventLogBuffer = null;
  let eventLog = null;
  let eventLogIndex = 0;
  const TaskStartEvent = 1;
  const TaskCompleteEvent = 2;
  const TaskRunEvent = 5;
  const TaskYieldEvent = 6;

  function logEvent(entries) {
    if (eventLog !== null) {
      const offset = eventLogIndex;

      eventLogIndex += entries.length;

      if (eventLogIndex + 1 > eventLogSize) {
        eventLogSize *= 2;

        if (eventLogSize > MAX_EVENT_LOG_SIZE) {
          // Using console['error'] to evade Babel and ESLint
          console['error'](
            "Scheduler Profiling: Event log exceeded maximum size. Don't " +
              'forget to call `stopLoggingProfilingEvents()`.',
          );
          stopLoggingProfilingEvents();

          return;
        }

        const newEventLog = new Int32Array(eventLogSize * 4);

        newEventLog.set(eventLog);
        eventLogBuffer = newEventLog.buffer;
        eventLog = newEventLog;
      }

      eventLog.set(entries, offset);
    }
  }

  function stopLoggingProfilingEvents() {
    const buffer = eventLogBuffer;

    eventLogSize = 0;
    eventLogBuffer = null;
    eventLog = null;
    eventLogIndex = 0;

    return buffer;
  }

  function markTaskStart(task, ms) {
    {
      profilingState[QUEUE_SIZE]++;

      if (eventLog !== null) {
        // performance.now returns a float, representing milliseconds. When the
        // event is logged, it's coerced to an int. Convert to microseconds to
        // maintain extra degrees of precision.
        logEvent([TaskStartEvent, ms * 1000, task.id, task.priorityLevel]);
      }
    }
  }

  function markTaskCompleted(task, ms) {
    {
      profilingState[PRIORITY] = NoPriority;
      profilingState[CURRENT_TASK_ID] = 0;
      profilingState[QUEUE_SIZE]--;

      if (eventLog !== null) {
        logEvent([TaskCompleteEvent, ms * 1000, task.id]);
      }
    }
  }

  function markTaskRun(task, ms) {
    {
      runIdCounter++;
      profilingState[PRIORITY] = task.priorityLevel;
      profilingState[CURRENT_TASK_ID] = task.id;
      profilingState[CURRENT_RUN_ID] = runIdCounter;

      if (eventLog !== null) {
        logEvent([TaskRunEvent, ms * 1000, task.id, runIdCounter]);
      }
    }
  }

  function markTaskYield(task, ms) {
    {
      profilingState[PRIORITY] = NoPriority;
      profilingState[CURRENT_TASK_ID] = 0;
      profilingState[CURRENT_RUN_ID] = 0;

      if (eventLog !== null) {
        logEvent([TaskYieldEvent, ms * 1000, task.id, runIdCounter]);
      }
    }
  }

  var maxSigned31BitInt = 1073741823; // Times out immediately

  var IMMEDIATE_PRIORITY_TIMEOUT = -1; // Eventually times out

  var USER_BLOCKING_PRIORITY = 250;
  var NORMAL_PRIORITY_TIMEOUT = 5000;
  var LOW_PRIORITY_TIMEOUT = 10000; // Never times out

  var IDLE_PRIORITY = maxSigned31BitInt; // Tasks are stored on a min heap

  var taskQueue = [];
  var timerQueue = []; // Incrementing id counter. Used to maintain insertion order.

  var taskIdCounter = 1; // Pausing the scheduler is useful for debugging.
  var currentTask = null;
  var currentPriorityLevel = NormalPriority; // This is set while performing work, to prevent re-entrancy.

  var isPerformingWork = false;
  var isHostCallbackScheduled = false;
  var isHostTimeoutScheduled = false;

  function advanceTimers(currentTime) {
    // Check for tasks that are no longer delayed and add them to the queue.
    var timer = peek(timerQueue);

    while (timer !== null) {
      if (timer.callback === null) {
        // Timer was cancelled.
        pop(timerQueue);
      } else if (timer.startTime <= currentTime) {
        // Timer fired. Transfer to the task queue.
        pop(timerQueue);
        timer.sortIndex = timer.expirationTime;
        push(taskQueue, timer);

        {
          markTaskStart(timer, currentTime);
          timer.isQueued = true;
        }
      } else {
        // Remaining timers are pending.
        return;
      }

      timer = peek(timerQueue);
    }
  }

  function handleTimeout(currentTime) {
    isHostTimeoutScheduled = false;
    advanceTimers(currentTime);

    if (!isHostCallbackScheduled) {
      if (peek(taskQueue) !== null) {
        isHostCallbackScheduled = true;
        requestHostCallback(flushWork);
      } else {
        var firstTimer = peek(timerQueue);

        if (firstTimer !== null) {
          requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
        }
      }
    }
  }

  function flushWork(hasTimeRemaining, initialTime) {
    console.log(['flushWork'], { hasTimeRemaining, initialTime })

    isPerformingWork = true;

    try {
      return workLoop(hasTimeRemaining, initialTime);
    } finally {
      currentTask = null;
      isPerformingWork = false;
    }
  }

  function workLoop(hasTimeRemaining, initialTime) {
    var currentTime = initialTime;
    advanceTimers(currentTime);
    currentTask = peek(taskQueue);

    while (currentTask !== null && !enableSchedulerDebugging) {
      if (
        currentTask.expirationTime > currentTime &&
        (!hasTimeRemaining || shouldYieldToHost())
      ) {
        // This currentTask hasn't expired, and we've reached the deadline.
        break;
      }

      var callback = currentTask.callback;

      if (callback !== null) {
        currentTask.callback = null;
        currentPriorityLevel = currentTask.priorityLevel;
        var didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
        markTaskRun(currentTask, currentTime);
        var continuationCallback = callback(didUserCallbackTimeout);
        currentTime = getCurrentTime();

        if (typeof continuationCallback === 'function') {
          currentTask.callback = continuationCallback;
          markTaskYield(currentTask, currentTime);
        } else {
          {
            markTaskCompleted(currentTask, currentTime);
            currentTask.isQueued = false;
          }

          if (currentTask === peek(taskQueue)) {
            pop(taskQueue);
          }
        }

        advanceTimers(currentTime);
      } else {
        pop(taskQueue);
      }

      currentTask = peek(taskQueue);
    } // Return whether there's additional work

    if (currentTask !== null) {
      return true;
    } else {
      var firstTimer = peek(timerQueue);

      if (firstTimer !== null) {
        requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
      }

      return false;
    }
  }

  function unstable_runWithPriority(priorityLevel, eventHandler) {
    switch (priorityLevel) {
      case ImmediatePriority:
      case UserBlockingPriority:
      case NormalPriority:
      case LowPriority:
      case IdlePriority:
        break;
      default:
        priorityLevel = NormalPriority;
    }

    var previousPriorityLevel = currentPriorityLevel;
    currentPriorityLevel = priorityLevel;

    try {
      return eventHandler();
    } finally {
      currentPriorityLevel = previousPriorityLevel;
    }
  }

  function timeoutForPriorityLevel(priorityLevel) {
    switch (priorityLevel) {
      case ImmediatePriority:
        return IMMEDIATE_PRIORITY_TIMEOUT;
      case UserBlockingPriority:
        return USER_BLOCKING_PRIORITY;
      case IdlePriority:
        return IDLE_PRIORITY;
      case LowPriority:
        return LOW_PRIORITY_TIMEOUT;
      case NormalPriority:
      default:
        return NORMAL_PRIORITY_TIMEOUT;
    }
  }

  function unstable_scheduleCallback(priorityLevel, callback, options) {
    var currentTime = getCurrentTime();
    var startTime;
    var timeout;

    if (typeof options === 'object' && options !== null) {
      var delay = options.delay;

      if (typeof delay === 'number' && delay > 0) {
        startTime = currentTime + delay;
      } else {
        startTime = currentTime;
      }

      timeout =
        typeof options.timeout === 'number'
          ? options.timeout
          : timeoutForPriorityLevel(priorityLevel);
    } else {
      timeout = timeoutForPriorityLevel(priorityLevel);
      startTime = currentTime;
    }

    var expirationTime = startTime + timeout;
    var newTask = {
      id: taskIdCounter++,
      callback: callback,
      priorityLevel: priorityLevel,
      startTime: startTime,
      expirationTime: expirationTime,
      sortIndex: -1,
    };

    {
      newTask.isQueued = false;
    }

    if (startTime > currentTime) {
      // This is a delayed task.
      newTask.sortIndex = startTime;
      push(timerQueue, newTask);

      if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
        // All tasks are delayed, and this is the task with the earliest delay.
        if (isHostTimeoutScheduled) {
          // Cancel an existing timeout.
          cancelHostTimeout();
        } else {
          isHostTimeoutScheduled = true;
        } // Schedule a timeout.

        requestHostTimeout(handleTimeout, startTime - currentTime);
      }
    } else {
      newTask.sortIndex = expirationTime;
      push(taskQueue, newTask);

      {
        markTaskStart(newTask, currentTime);
        newTask.isQueued = true;
      } // Schedule a host callback, if needed. If we're already performing work,
      // wait until the next time we yield.

      if (!isHostCallbackScheduled && !isPerformingWork) {
        isHostCallbackScheduled = true;
        requestHostCallback(flushWork);
      }
    }

    return newTask;
  }

  function unstable_getCurrentPriorityLevel() {
    return currentPriorityLevel;
  }

  var Scheduler = /*#__PURE__*/ Object.freeze({
    __proto__: null,
    unstable_ImmediatePriority: () => {},
    unstable_UserBlockingPriority: () => {},
    unstable_NormalPriority: NormalPriority,
    unstable_IdlePriority: IdlePriority,
    unstable_LowPriority: LowPriority,
    unstable_runWithPriority: unstable_runWithPriority,
    unstable_next: () => {},
    unstable_scheduleCallback: unstable_scheduleCallback,
    unstable_cancelCallback: () => {},
    unstable_wrapCallback: () => {},
    unstable_getCurrentPriorityLevel: unstable_getCurrentPriorityLevel,
    unstable_shouldYield: () => {},
    unstable_requestPaint: () => {},
    unstable_continueExecution: () => {},
    unstable_pauseExecution: () => {},
    unstable_getFirstCallbackNode: () => {},
    get unstable_now() {
      return getCurrentTime;
    },
    get unstable_forceFrameRate() {
      return forceFrameRate;
    },
    unstable_Profiling: () => {},
  });

  var interactionsRef = null; // Listener(s) to notify when interactions begin and end.

  var subscriberRef = null;

  {
    interactionsRef = {
      current: new Set(),
    };
    subscriberRef = {
      current: null,
    };
  }

  var SchedulerTracing = /*#__PURE__*/ Object.freeze({
    __proto__: null,
    get __interactionsRef() {
      return interactionsRef;
    },
    get __subscriberRef() {
      return subscriberRef;
    },
    unstable_clear: () => {},
    unstable_getCurrent: () => {},
    unstable_getThreadID: () => {},
    unstable_trace: () => {},
    unstable_wrap: () => {},
    unstable_subscribe: () => {},
    unstable_unsubscribe: () => {},
  });

  var ReactSharedInternals$1 = {
    ReactCurrentDispatcher: ReactCurrentDispatcher,
    ReactCurrentOwner: ReactCurrentOwner,
    IsSomeRendererActing: IsSomeRendererActing,
    // Used by renderers to avoid bundling object-assign twice in UMD bundles:
    assign: Object.assign,
  };

  Object.assign(ReactSharedInternals$1, {
    Scheduler: Scheduler,
    SchedulerTracing: SchedulerTracing,
  });

  var createElement$1 = createElementWithValidation;

  exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactSharedInternals$1;
  exports.createElement = createElement$1;
  exports.useState = useState;
});
