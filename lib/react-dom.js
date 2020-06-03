/** @license React v16.13.1
 * react-dom.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports, require('react'))
    : typeof define === 'function' && define.amd
    ? define(['exports', 'react'], factory)
    : ((global = global || self),
      factory((global.ReactDOM = {}), global.React));
})(this, function (exports, React) {
  'use strict';

  const ReactSharedInternals =
    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED; // Prevent newer renderers from RTE when used with older react package versions.
  // Current owner and dispatcher used to share the same ref,
  // but PR #14548 split them out to better support the react-debug-tools package.

  if (!ReactSharedInternals.hasOwnProperty('ReactCurrentDispatcher')) {
    ReactSharedInternals.ReactCurrentDispatcher = {
      current: null,
    };
  }

  if (!ReactSharedInternals.hasOwnProperty('ReactCurrentBatchConfig')) {
    ReactSharedInternals.ReactCurrentBatchConfig = {
      suspense: null,
    };
  }

  // by calls to these methods by a Babel plugin.
  //
  // In PROD (or in packages without access to React internals),
  // they are left as they are instead.

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

  if (!React) {
    {
      throw Error(
        'ReactDOM was loaded before React. Make sure you load the React package before loading ReactDOM.',
      );
    }
  }

  const invokeGuardedCallbackImpl = function (
    name,
    func,
    context,
    a,
    b,
    c,
    d,
    e,
    f,
  ) {
    const funcArgs = Array.prototype.slice.call(arguments, 3);

    try {
      func.apply(context, funcArgs);
    } catch (error) {
      this.onError(error);
    }
  };
  const invokeGuardedCallbackImpl$1 = invokeGuardedCallbackImpl;
  let hasError = false;
  let caughtError = null; // Used by event system to capture/rethrow the first error.
  let hasRethrowError = false;
  let rethrowError = null;
  const reporter = {
    onError: function (error) {
      hasError = true;
      caughtError = error;
    },
  };

  /**
   * Call a function while guarding against errors that happens within it.
   * Returns an error if it throws, otherwise null.
   *
   * In production, this is implemented using a try-catch. The reason we don't
   * use a try-catch directly is so that we can swap out a different
   * implementation in DEV mode.
   *
   * @param {String} name of the guard to use for logging or debugging
   * @param {Function} func The function to invoke
   * @param {*} context The context to use when calling the function
   * @param {...*} args Arguments for function
   */

  function invokeGuardedCallback(name, func, context, a, b, c, d, e, f) {
    hasError = false;
    caughtError = null;
    invokeGuardedCallbackImpl$1.apply(reporter, arguments);
  }

  let getFiberCurrentPropsFromNode = null;
  let getInstanceFromNode = null;
  let getNodeFromInstance = null;

  function setComponentTree(
    getFiberCurrentPropsFromNodeImpl,
    getInstanceFromNodeImpl,
    getNodeFromInstanceImpl,
  ) {
    getFiberCurrentPropsFromNode = getFiberCurrentPropsFromNodeImpl;
    getInstanceFromNode = getInstanceFromNodeImpl;
    getNodeFromInstance = getNodeFromInstanceImpl;
  }

  /**
   * Dispatch the event to the listener.
   * @param {SyntheticEvent} event SyntheticEvent to handle
   * @param {function} listener Application-level callback
   * @param {*} inst Internal component instance
   */

  function executeDispatch(event, listener, inst) {
    event.currentTarget = getNodeFromInstance(inst);
    listener(undefined, event)
    event.currentTarget = null;
  }

  /**
   * Standard/simple iteration through an event's collected dispatches.
   */

  function executeDispatchesInOrder(event) {
    const dispatchListeners = event._dispatchListeners;
    const dispatchInstances = event._dispatchInstances;

    {
      // validateEventDispatches(event);
    }

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

  const FunctionComponent = 0;
  const IndeterminateComponent = 2; // Before we know whether it is function or class
  const HostRoot = 3; // Root of a host tree. Could be nested inside another node.
  const HostComponent = 5;
  const HostText = 6;
  /**
   * Injectable ordering of event plugins.
   */
  let eventPluginOrder = null;
  /**
   * Injectable mapping from names to event plugin modules.
   */
  const namesToPlugins = {};

  /**
   * Recomputes the plugin list using the injected plugins and plugin ordering.
   *
   * @private
   */

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

  /**
   * Publishes an event so that it can be dispatched by the supplied plugin.
   *
   * @param {object} dispatchConfig Dispatch configuration for the event.
   * @param {object} PluginModule Plugin publishing the event.
   * @return {boolean} True if the event was successfully published.
   * @private
   */

  function publishEventForPlugin(dispatchConfig, pluginModule, eventName) {
    if (!!eventNameDispatchConfigs.hasOwnProperty(eventName)) {
      {
        throw Error(
          'EventPluginRegistry: More than one plugin attempted to publish the same event name, `' +
            eventName +
            '`.',
        );
      }
    }

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

  /**
   * Publishes a registration name that is used to identify dispatched events.
   *
   * @param {string} registrationName Registration name to add.
   * @param {object} PluginModule Plugin publishing the event.
   * @private
   */

  function publishRegistrationName(registrationName, pluginModule, eventName) {
    console.log(['publishRegistrationName'])
    registrationNameModules[registrationName] = pluginModule;
    registrationNameDependencies[registrationName] =
      pluginModule.eventTypes[eventName].dependencies;

  }

  /**
   * Registers plugins so that they can extract and dispatch events.
   */

  /**
   * Ordered list of injected plugins.
   */

  var plugins = [];
  /**
   * Mapping from event name to dispatch config
   */

  var eventNameDispatchConfigs = {};
  /**
   * Mapping from registration name to plugin module
   */

  var registrationNameModules = {};
  /**
   * Mapping from registration name to event name
   */

  var registrationNameDependencies = {};
  /**
   * Mapping from lowercase registration names to the properly cased version,
   * used to warn in the case of missing event handlers. Available
   * only in true.
   * @type {Object}
   */

  /**
   * Injects an ordering of plugins (by plugin name). This allows the ordering
   * to be decoupled from injection of the actual plugins so that ordering is
   * always deterministic regardless of packaging, on-the-fly injection, etc.
   *
   * @param {array} InjectedEventPluginOrder
   * @internal
   */

  function injectEventPluginOrder(injectedEventPluginOrder) {
    if (!!eventPluginOrder) {
      {
        throw Error(
          'EventPluginRegistry: Cannot inject event plugin ordering more than once. You are likely trying to load more than one copy of React.',
        );
      }
    } // Clone the ordering so it cannot be dynamically mutated.

    eventPluginOrder = Array.prototype.slice.call(injectedEventPluginOrder);
    recomputePluginOrdering();
  }

  /**
   * Injects plugins to be used by plugin event system. The plugin names must be
   * in the ordering injected by `injectEventPluginOrder`.
   *
   * Plugins can be injected as part of page initialization or on-the-fly.
   *
   * @param {object} injectedNamesToPlugins Map from names to plugin modules.
   * @internal
   */

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
        if (!!namesToPlugins[pluginName]) {
          {
            throw Error(
              'EventPluginRegistry: Cannot inject two different event plugins using the same name, `' +
                pluginName +
                '`.',
            );
          }
        }

        namesToPlugins[pluginName] = pluginModule;
        isOrderingDirty = true;
      }
    }

    if (isOrderingDirty) {
      recomputePluginOrdering();
    }
  }

  const canUseDOM = !!(
    typeof window !== 'undefined' &&
    typeof window.document !== 'undefined' &&
    typeof window.document.createElement !== 'undefined'
  );
  const ReactInternals =
    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  const _assign = ReactInternals.assign;
  const PLUGIN_EVENT_SYSTEM = 1;
  const IS_FIRST_ANCESTOR = 1 << 6;
  let restoreTarget = null;
  let restoreQueue = null;

  function enqueueStateRestore(target) {
    if (restoreTarget) {
      if (restoreQueue) {
        restoreQueue.push(target);
      } else {
        restoreQueue = [target];
      }
    } else {
      restoreTarget = target;
    }
  }

  const enableFundamentalAPI = false; // Experimental Scope support.

  // the renderer. Such as when we're dispatching events or if third party
  // libraries need to call batchedUpdates. Eventually, this API will go away when
  // everything is batched by default. We'll then have a similar API to opt-out of
  // scheduled work and instead do synchronous work.
  // Defaults

  const batchedUpdatesImpl = function (fn, bookkeeping) {
    return fn(bookkeeping);
  };
  const batchedEventUpdatesImpl = batchedUpdatesImpl;
  let isInsideEventHandler = false;
  let isBatchingEventUpdates = false;

  function batchedUpdates(fn, bookkeeping) {
    if (isInsideEventHandler) {
      // If we are currently inside another batch, we need to wait until it
      // fully completes before restoring state.
      return fn(bookkeeping);
    }

    isInsideEventHandler = true;

    try {
      return batchedUpdatesImpl(fn, bookkeeping);
    } finally {
      isInsideEventHandler = false;
      // finishEventHandler();
    }
  }

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
      // finishEventHandler();
    }
  } // This is for the React Flare event system

  const DiscreteEvent = 0;
  const ReactInternals$1 =
    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  const _ReactInternals$Sched = ReactInternals$1.Scheduler,
    unstable_scheduleCallback = _ReactInternals$Sched.unstable_scheduleCallback,
    unstable_runWithPriority = _ReactInternals$Sched.unstable_runWithPriority,
    unstable_ImmediatePriority =
      _ReactInternals$Sched.unstable_ImmediatePriority,
    unstable_UserBlockingPriority =
      _ReactInternals$Sched.unstable_UserBlockingPriority,
    unstable_NormalPriority = _ReactInternals$Sched.unstable_NormalPriority,
    unstable_LowPriority = _ReactInternals$Sched.unstable_LowPriority,
    unstable_IdlePriority = _ReactInternals$Sched.unstable_IdlePriority;
  // A reserved attribute.
  // It is handled by React separately and shouldn't be written to the DOM.
  const RESERVED = 0; // A simple string attribute.
  // Attributes that aren't in the whitelist are presumed to have this type.
  const STRING = 1; // A string attribute that accepts booleans in React. In HTML, these are called
  // "enumerated" attributes with "true" and "false" as possible values.
  // When true, it should be set to a "true" string.
  // When false, it should be set to a "false" string.
  const BOOLEANISH_STRING = 2; // A real boolean attribute.
  // When true, it should be present (set either to an empty string or its name).
  // When false, it should be omitted.
  const BOOLEAN = 3; // An attribute that can be used as a flag as well as with a value.
  // When true, it should be present (set either to an empty string or its name).
  // When false, it should be omitted.
  // For any other value, should be present with that value.
  const OVERLOADED_BOOLEAN = 4; // An attribute that must be numeric or parse as a numeric.
  // When falsy, it should be removed.
  const NUMERIC = 5; // An attribute that must be positive numeric or parse as a positive numeric.
  // When falsy, it should be removed.
  const POSITIVE_NUMERIC = 6;

  function shouldIgnoreAttribute(name, propertyInfo, isCustomComponentTag) {
    if (propertyInfo !== null) {
      return propertyInfo.type === RESERVED;
    }

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


  function PropertyInfoRecord(
    name,
    type,
    mustUseProperty,
    attributeName,
    attributeNamespace,
    sanitizeURL,
  ) {
    this.acceptsBooleans =
      type === BOOLEANISH_STRING ||
      type === BOOLEAN ||
      type === OVERLOADED_BOOLEAN;
    this.attributeName = attributeName;
    this.attributeNamespace = attributeNamespace;
    this.mustUseProperty = mustUseProperty;
    this.propertyName = name;
    this.type = type;
    this.sanitizeURL = sanitizeURL;
  } // When adding attributes to this list, be sure to also add them to
  // the `possibleStandardNames` module to ensure casing and incorrect
  // name warnings.

  var properties = {}; // These props are reserved by React. They shouldn't be written to the DOM.

  const reservedProps = [
    'children',
    'dangerouslySetInnerHTML', // TODO: This prevents the assignment of defaultValue to regular
    // elements (not just inputs). Now that ReactDOMInput assigns to the
    // defaultValue property -- do we need this?
    'defaultValue',
    'defaultChecked',
    'innerHTML',
    'suppressContentEditableWarning',
    'suppressHydrationWarning',
    'style',
  ];

  reservedProps.forEach(function (name) {
    properties[name] = new PropertyInfoRecord(
      name,
      RESERVED,
      false, // mustUseProperty
      name, // attributeName
      null, // attributeNamespace
      false,
    );
  }); // A few React string attributes have a different name.
  // This is a mapping from React prop names to the attribute names.

  [
    ['acceptCharset', 'accept-charset'],
    ['className', 'class'],
    ['htmlFor', 'for'],
    ['httpEquiv', 'http-equiv'],
  ].forEach(function (_ref) {
    const name = _ref[0],
      attributeName = _ref[1];

    properties[name] = new PropertyInfoRecord(
      name,
      STRING,
      false, // mustUseProperty
      attributeName, // attributeName
      null, // attributeNamespace
      false,
    );
  }); // These are "enumerated" HTML attributes that accept "true" and "false".
  // In React, we let users pass `true` and `false` even though technically
  // these aren't boolean attributes (they are coerced to strings).

  ['contentEditable', 'draggable', 'spellCheck', 'value'].forEach(function (
    name,
  ) {
    properties[name] = new PropertyInfoRecord(
      name,
      BOOLEANISH_STRING,
      false, // mustUseProperty
      name.toLowerCase(), // attributeName
      null, // attributeNamespace
      false,
    );
  }); // These are "enumerated" SVG attributes that accept "true" and "false".
  // In React, we let users pass `true` and `false` even though technically
  // these aren't boolean attributes (they are coerced to strings).
  // Since these are SVG attributes, their attribute names are case-sensitive.

  [
    'autoReverse',
    'externalResourcesRequired',
    'focusable',
    'preserveAlpha',
  ].forEach(function (name) {
    properties[name] = new PropertyInfoRecord(
      name,
      BOOLEANISH_STRING,
      false, // mustUseProperty
      name, // attributeName
      null, // attributeNamespace
      false,
    );
  }); // These are HTML boolean attributes.

  [
    'allowFullScreen',
    'async', // Note: there is a special case that prevents it from being written to the DOM
    // on the client side because the browsers are inconsistent. Instead we call focus().
    'autoFocus',
    'autoPlay',
    'controls',
    'default',
    'defer',
    'disabled',
    'disablePictureInPicture',
    'formNoValidate',
    'hidden',
    'loop',
    'noModule',
    'noValidate',
    'open',
    'playsInline',
    'readOnly',
    'required',
    'reversed',
    'scoped',
    'seamless', // Microdata
    'itemScope',
  ].forEach(function (name) {
    properties[name] = new PropertyInfoRecord(
      name,
      BOOLEAN,
      false, // mustUseProperty
      name.toLowerCase(), // attributeName
      null, // attributeNamespace
      false,
    );
  }); // These are the few React props that we set as DOM properties
  // rather than attributes. These are all booleans.

  [
    'checked', // Note: `option.selected` is not updated if `select.multiple` is
    // disabled with `removeAttribute`. We have special logic for handling this.
    'multiple',
    'muted',
    'selected', // NOTE: if you add a camelCased prop to this list,
    // you'll need to set attributeName to name.toLowerCase()
    // instead in the assignment below.
  ].forEach(function (name) {
    properties[name] = new PropertyInfoRecord(
      name,
      BOOLEAN,
      true, // mustUseProperty
      name, // attributeName
      null, // attributeNamespace
      false,
    );
  }); // These are HTML attributes that are "overloaded booleans": they behave like
  // booleans, but can also accept a string value.

  [
    'capture',
    'download', // NOTE: if you add a camelCased prop to this list,
    // you'll need to set attributeName to name.toLowerCase()
    // instead in the assignment below.
  ].forEach(function (name) {
    properties[name] = new PropertyInfoRecord(
      name,
      OVERLOADED_BOOLEAN,
      false, // mustUseProperty
      name, // attributeName
      null, // attributeNamespace
      false,
    );
  }); // These are HTML attributes that must be positive numbers.

  [
    'cols',
    'rows',
    'size',
    'span', // NOTE: if you add a camelCased prop to this list,
    // you'll need to set attributeName to name.toLowerCase()
    // instead in the assignment below.
  ].forEach(function (name) {
    properties[name] = new PropertyInfoRecord(
      name,
      POSITIVE_NUMERIC,
      false, // mustUseProperty
      name, // attributeName
      null, // attributeNamespace
      false,
    );
  }); // These are HTML attributes that must be numbers.

  ['rowSpan', 'start'].forEach(function (name) {
    properties[name] = new PropertyInfoRecord(
      name,
      NUMERIC,
      false, // mustUseProperty
      name.toLowerCase(), // attributeName
      null, // attributeNamespace
      false,
    );
  });

  const CAMELIZE = /[\-\:]([a-z])/g;
  const capitalize = function (token) {
    return token[1].toUpperCase();
  }; // This is a list of all SVG attributes that need special casing, namespacing,
  // or boolean value assignment. Regular attributes that just accept strings
  // and have the same names are omitted, just like in the HTML whitelist.
  // Some of these attributes can be hard to find. This list was created by
  // scraping the MDN documentation.

  [
    'accent-height',
    'alignment-baseline',
    'arabic-form',
    'baseline-shift',
    'cap-height',
    'clip-path',
    'clip-rule',
    'color-interpolation',
    'color-interpolation-filters',
    'color-profile',
    'color-rendering',
    'dominant-baseline',
    'enable-background',
    'fill-opacity',
    'fill-rule',
    'flood-color',
    'flood-opacity',
    'font-family',
    'font-size',
    'font-size-adjust',
    'font-stretch',
    'font-style',
    'font-variant',
    'font-weight',
    'glyph-name',
    'glyph-orientation-horizontal',
    'glyph-orientation-vertical',
    'horiz-adv-x',
    'horiz-origin-x',
    'image-rendering',
    'letter-spacing',
    'lighting-color',
    'marker-end',
    'marker-mid',
    'marker-start',
    'overline-position',
    'overline-thickness',
    'paint-order',
    'panose-1',
    'pointer-events',
    'rendering-intent',
    'shape-rendering',
    'stop-color',
    'stop-opacity',
    'strikethrough-position',
    'strikethrough-thickness',
    'stroke-dasharray',
    'stroke-dashoffset',
    'stroke-linecap',
    'stroke-linejoin',
    'stroke-miterlimit',
    'stroke-opacity',
    'stroke-width',
    'text-anchor',
    'text-decoration',
    'text-rendering',
    'underline-position',
    'underline-thickness',
    'unicode-bidi',
    'unicode-range',
    'units-per-em',
    'v-alphabetic',
    'v-hanging',
    'v-ideographic',
    'v-mathematical',
    'vector-effect',
    'vert-adv-y',
    'vert-origin-x',
    'vert-origin-y',
    'word-spacing',
    'writing-mode',
    'xmlns:xlink',
    'x-height', // NOTE: if you add a camelCased prop to this list,
    // you'll need to set attributeName to name.toLowerCase()
    // instead in the assignment below.
  ].forEach(function (attributeName) {
    const name = attributeName.replace(CAMELIZE, capitalize);

    properties[name] = new PropertyInfoRecord(
      name,
      STRING,
      false, // mustUseProperty
      attributeName,
      null, // attributeNamespace
      false,
    );
  }); // String SVG attributes with the xlink namespace.

  [
    'xlink:actuate',
    'xlink:arcrole',
    'xlink:role',
    'xlink:show',
    'xlink:title',
    'xlink:type', // NOTE: if you add a camelCased prop to this list,
    // you'll need to set attributeName to name.toLowerCase()
    // instead in the assignment below.
  ].forEach(function (attributeName) {
    const name = attributeName.replace(CAMELIZE, capitalize);

    properties[name] = new PropertyInfoRecord(
      name,
      STRING,
      false, // mustUseProperty
      attributeName,
      'http://www.w3.org/1999/xlink',
      false,
    );
  }); // String SVG attributes with the xml namespace.

  [
    'xml:base',
    'xml:lang',
    'xml:space', // NOTE: if you add a camelCased prop to this list,
    // you'll need to set attributeName to name.toLowerCase()
    // instead in the assignment below.
  ].forEach(function (attributeName) {
    const name = attributeName.replace(CAMELIZE, capitalize);

    properties[name] = new PropertyInfoRecord(
      name,
      STRING,
      false, // mustUseProperty
      attributeName,
      'http://www.w3.org/XML/1998/namespace',
      false,
    );
  }); // These attribute exists both in HTML and SVG.
  // The attribute name is case-sensitive in SVG so we can't just use
  // the React name like we do for attributes that exist only in HTML.

  ['tabIndex', 'crossOrigin'].forEach(function (attributeName) {
    properties[attributeName] = new PropertyInfoRecord(
      attributeName,
      STRING,
      false, // mustUseProperty
      attributeName.toLowerCase(), // attributeName
      null, // attributeNamespace
      false,
    );
  }); // These attributes accept URLs. These must not allow javascript: URLS.
  // These will also need to accept Trusted Types object in the future.

  const xlinkHref = 'xlinkHref';

  properties[xlinkHref] = new PropertyInfoRecord(
    'xlinkHref',
    STRING,
    false, // mustUseProperty
    'xlink:href',
    'http://www.w3.org/1999/xlink',
    true,
  );
  ['src', 'href', 'action', 'formAction'].forEach(function (attributeName) {
    properties[attributeName] = new PropertyInfoRecord(
      attributeName,
      STRING,
      false, // mustUseProperty
      attributeName.toLowerCase(), // attributeName
      null, // attributeNamespace
      true,
    );
  });

  let ReactDebugCurrentFrame = null;

  {
    ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
  } // A javascript: URL can contain leading C0 control or \u0020 SPACE,
  // and any newline or tab are filtered out as if they're not part of the URL.
  // https://url.spec.whatwg.org/#url-parsing
  // Tab or newline are defined as \r\n\t:
  // https://infra.spec.whatwg.org/#ascii-tab-or-newline
  // A C0 control is a code point in the range \u0000 NULL to \u001F
  // INFORMATION SEPARATOR ONE, inclusive:
  // https://infra.spec.whatwg.org/#c0-control-or-space

  /* eslint-disable max-len */

  const isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*\:/i;
  let didWarn = false;

  function sanitizeURL(url) {
    {
      if (!didWarn && isJavaScriptProtocol.test(url)) {
        didWarn = true;

        error(
          'A future version of React will block javascript: URLs as a security precaution. ' +
            'Use event handlers instead if you can. If you need to generate unsafe HTML try ' +
            'using dangerouslySetInnerHTML instead. React was passed %s.',
          JSON.stringify(url),
        );
      }
    }
  }

  function setValueForProperty(node, name, value, isCustomComponentTag) {
    const propertyInfo = null;

    if (shouldIgnoreAttribute(name, propertyInfo, isCustomComponentTag)) {
      return;
    }

    if (
      shouldRemoveAttribute(name, value, propertyInfo, isCustomComponentTag)
    ) {
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

      if (
        _type === BOOLEAN ||
        (_type === OVERLOADED_BOOLEAN && value === true)
      ) {
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

  // The Symbol used to tag the ReactElement-like types. If there is no native Symbol
  // nor polyfill, then a plain number is used for performance.
  const hasSymbol = typeof Symbol === 'function' && Symbol.for;
  const REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;

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

  let current = null;
  let isRendering = false;

  function getCurrentFiberOwnerNameInDevOrNull() {
    {
      if (current === null) {
        return null;
      }

      const owner = current._debugOwner;

      if (owner !== null && typeof owner !== 'undefined') {
        return getComponentName(owner.type);
      }
    }

    return null;
  }

  function resetCurrentFiber() {
    {
      current = null;
      isRendering = false;
    }
  }

  function setCurrentFiber(fiber) {
    {
      current = fiber;
      isRendering = false;
    }
  }

  // Flow does not allow string concatenation of most non-string types. To work
  // around this limitation, we use an opaque type that can only be obtained by
  // passing the value through getToStringValue first.
  function toString(value) {
    return '' + value;
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

  /**
   * Copyright (c) 2013-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  const ReactControlledValuePropTypes = {
    checkPropTypes: null,
  };

  function isCheckable(elem) {
    const type = elem.type;
    const nodeName = elem.nodeName;

    return (
      nodeName &&
      nodeName.toLowerCase() === 'input' &&
      (type === 'checkbox' || type === 'radio')
    );
  }

  function getTracker(node) {
    return node._valueTracker;
  }

  function detachTracker(node) {
    node._valueTracker = null;
  }

  function getValueFromNode(node) {
    let value = '';

    if (!node) {
      return value;
    }

    value = node.value;

    return value;
  }

  function trackValueOnNode(node) {
    const valueField = isCheckable(node) ? 'checked' : 'value';
    const descriptor = Object.getOwnPropertyDescriptor(
      node.constructor.prototype,
      valueField,
    );
    let currentValue = '' + node[valueField]; // if someone has already defined a value or Safari, then bail
    // and don't track value will cause over reporting of changes,
    // but it's better then a hard failure
    // (needed for certain tests that spyOn input values and Safari)

    if (
      node.hasOwnProperty(valueField) ||
      typeof descriptor === 'undefined' ||
      typeof descriptor.get !== 'function' ||
      typeof descriptor.set !== 'function'
    ) {
      return;
    }

    const get = descriptor.get,
      set = descriptor.set;

    Object.defineProperty(node, valueField, {
      configurable: true,
      get: function () {
        return get.call(this);
      },
      set: function (value) {
        currentValue = '' + value;
        set.call(this, value);
      },
    }); // We could've passed this the first time
    // but it triggers a bug in IE11 and Edge 14/15.
    // Calling defineProperty() again should be equivalent.
    // https://github.com/facebook/react/issues/11768

    Object.defineProperty(node, valueField, {
      enumerable: descriptor.enumerable,
    });

    const tracker = {
      getValue: function () {
        return currentValue;
      },
      setValue: function (value) {
        currentValue = '' + value;
      },
      stopTracking: function () {
        detachTracker(node);
        delete node[valueField];
      },
    };

    return tracker;
  }

  function track(node) {
    if (getTracker(node)) {
      return;
    } // TODO: Once it's just Fiber we can move this to node._wrapperState

    node._valueTracker = trackValueOnNode(node);
  }

  function updateValueIfChanged(node) {
    if (!node) {
      return false;
    }

    const tracker = getTracker(node); // if there is no tracker at this point it's unlikely
    // that trying again will succeed

    if (!tracker) {
      return true;
    }

    const lastValue = tracker.getValue();
    const nextValue = getValueFromNode(node);

    if (nextValue !== lastValue) {
      tracker.setValue(nextValue);

      return true;
    }

    return false;
  }

  let didWarnValueDefaultValue = false;
  let didWarnCheckedDefaultChecked = false;

  function isControlled(props) {
    const usesChecked = props.type === 'checkbox' || props.type === 'radio';

    return usesChecked ? props.checked != null : props.value != null;
  }

  /**
   * Implements an <input> host component that allows setting these optional
   * props: `checked`, `value`, `defaultChecked`, and `defaultValue`.
   *
   * If `checked` or `value` are not supplied (or null/undefined), user actions
   * that affect the checked state or value will trigger updates to the element.
   *
   * If they are supplied (and not null/undefined), the rendered element will not
   * trigger updates to the element. Instead, the props must change in order for
   * the rendered element to be updated.
   *
   * The rendered element will be initialized as unchecked (or `defaultChecked`)
   * with an empty value (or `defaultValue`).
   *
   * See http://www.w3.org/TR/2012/WD-html5-20121025/the-input-element.html
   */

  function getHostProps(element, props) {
    const node = element;
    const checked = props.checked;
    const hostProps = _assign({}, props, {
      defaultChecked: undefined,
      defaultValue: undefined,
      value: undefined,
      checked: checked != null ? checked : node._wrapperState.initialChecked,
    });

    return hostProps;
  }

  function initWrapperState(element, props) {
    {
      ReactControlledValuePropTypes.checkPropTypes('input', props);

      if (
        props.checked !== undefined &&
        props.defaultChecked !== undefined &&
        !didWarnCheckedDefaultChecked
      ) {
        error(
          '%s contains an input of type %s with both checked and defaultChecked props. ' +
            'Input elements must be either controlled or uncontrolled ' +
            '(specify either the checked prop, or the defaultChecked prop, but not ' +
            'both). Decide between using a controlled or uncontrolled input ' +
            'element and remove one of these props. More info: ' +
            'https://fb.me/react-controlled-components',
          getCurrentFiberOwnerNameInDevOrNull() || 'A component',
          props.type,
        );

        didWarnCheckedDefaultChecked = true;
      }

      if (
        props.value !== undefined &&
        props.defaultValue !== undefined &&
        !didWarnValueDefaultValue
      ) {
        error(
          '%s contains an input of type %s with both value and defaultValue props. ' +
            'Input elements must be either controlled or uncontrolled ' +
            '(specify either the value prop, or the defaultValue prop, but not ' +
            'both). Decide between using a controlled or uncontrolled input ' +
            'element and remove one of these props. More info: ' +
            'https://fb.me/react-controlled-components',
          getCurrentFiberOwnerNameInDevOrNull() || 'A component',
          props.type,
        );

        didWarnValueDefaultValue = true;
      }
    }

    const node = element;
    const defaultValue = props.defaultValue == null ? '' : props.defaultValue;

    node._wrapperState = {
      initialChecked:
        props.checked != null ? props.checked : props.defaultChecked,
      initialValue: getToStringValue(
        props.value != null ? props.value : defaultValue,
      ),
      controlled: isControlled(props),
    };
  }

  function postMountWrapper(element, props, isHydrating) {
    const node = element; // Do not assign value if it is already set. This prevents user text input
    // from being lost during SSR hydration.

    if (props.hasOwnProperty('value') || props.hasOwnProperty('defaultValue')) {
      const type = props.type;
      const isButton = type === 'submit' || type === 'reset'; // Avoid setting value attribute on submit/reset inputs as it overrides the
      // default value provided by the browser. See: #12872

      if (isButton && (props.value === undefined || props.value === null)) {
        return;
      }

      const initialValue = toString(node._wrapperState.initialValue); // Do not assign value if it is already set. This prevents user text input
      // from being lost during SSR hydration.

      if (!isHydrating) {
        {
          // When syncing the value attribute, the value property should use
          // the wrapperState._initialValue property. This uses:
          //
          //   1. The value React property when present
          //   2. The defaultValue React property when present
          //   3. An empty string
          if (initialValue !== node.value) {
            node.value = initialValue;
          }
        }
      }

      {
        // Otherwise, the value attribute is synchronized to the property,
        // so we assign defaultValue to the same thing as the value property
        // assignment step above.
        node.defaultValue = initialValue;
      }
    } // Normally, we'd just do `node.checked = node.checked` upon initial mount, less this bug
    // this is needed to work around a chrome bug where setting defaultChecked
    // will sometimes influence the value of checked (even after detachment).
    // Reference: https://bugs.chromium.org/p/chromium/issues/detail?id=608416
    // We need to temporarily unset name to avoid disrupting radio button groups.

    const name = node.name;

    if (name !== '') {
      node.name = '';
    }

    {
      // When syncing the checked attribute, both the checked property and
      // attribute are assigned at the same time using defaultChecked. This uses:
      //
      //   1. The checked React property when present
      //   2. The defaultChecked React property when present
      //   3. Otherwise, false
      node.defaultChecked = !node.defaultChecked;
      node.defaultChecked = !!node._wrapperState.initialChecked;
    }

    if (name !== '') {
      node.name = name;
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

  function flattenChildren(children) {
    let content = ''; // Flatten children. We'll warn if they are invalid
    // during validateProps() which runs for hydration too.
    // Note that this would throw on non-element objects.
    // Elements are stringified (which is normally irrelevant
    // but matters for <fbt>).

    React.Children.forEach(children, function (child) {
      if (child == null) {
        return;
      }

      content += child; // Note: we don't warn about invalid children here.
      // Instead, this is done separately below so that
      // it happens during the hydration codepath too.
    });

    return content;
  }

  /**
   * Implements an <option> host component that warns when `selected` is set.
   */

  function postMountWrapper$1(element, props) {
    // value="" should make a value attribute (#6219)
    if (props.value != null) {
      element.setAttribute('value', toString(getToStringValue(props.value)));
    }
  }

  function getHostProps$1(element, props) {
    const hostProps = _assign(
      {
        children: undefined,
      },
      props,
    );
    const content = flattenChildren(props.children);

    if (content) {
      hostProps.children = content;
    }

    return hostProps;
  }

  function updateOptions(node, multiple, propValue, setDefaultSelected) {
    const options = node.options;

    if (multiple) {
      const selectedValues = propValue;
      const selectedValue = {};

      for (let i = 0; i < selectedValues.length; i++) {
        // Prefix to avoid chaos with special keys.
        selectedValue['$' + selectedValues[i]] = true;
      }

      for (let _i = 0; _i < options.length; _i++) {
        const selected = selectedValue.hasOwnProperty('$' + options[_i].value);

        if (options[_i].selected !== selected) {
          options[_i].selected = selected;
        }

        if (selected && setDefaultSelected) {
          options[_i].defaultSelected = true;
        }
      }
    } else {
      // Do not set `select.value` as exact behavior isn't consistent across all
      // browsers for all cases.
      const _selectedValue = toString(getToStringValue(propValue));
      let defaultSelected = null;

      for (let _i2 = 0; _i2 < options.length; _i2++) {
        if (options[_i2].value === _selectedValue) {
          options[_i2].selected = true;

          if (setDefaultSelected) {
            options[_i2].defaultSelected = true;
          }

          return;
        }

        if (defaultSelected === null && !options[_i2].disabled) {
          defaultSelected = options[_i2];
        }
      }

      if (defaultSelected !== null) {
        defaultSelected.selected = true;
      }
    }
  }

  /**
   * Implements a <select> host component that allows optionally setting the
   * props `value` and `defaultValue`. If `multiple` is false, the prop must be a
   * stringable. If `multiple` is true, the prop must be an array of stringables.
   *
   * If `value` is not supplied (or null/undefined), user actions that change the
   * selected option will trigger updates to the rendered options.
   *
   * If it is supplied (and not null/undefined), the rendered options will not
   * update in response to user actions. Instead, the `value` prop must change in
   * order for the rendered options to update.
   *
   * If `defaultValue` is provided, any options with the supplied values will be
   * selected.
   */

  function getHostProps$2(element, props) {
    return _assign({}, props, {
      value: undefined,
    });
  }

  function postMountWrapper$2(element, props) {
    const node = element;

    node.multiple = !!props.multiple;

    const value = props.value;

    if (value != null) {
      updateOptions(node, !!props.multiple, value, false);
    } else if (props.defaultValue != null) {
      updateOptions(node, !!props.multiple, props.defaultValue, true);
    }
  }

  let didWarnValDefaultVal = false;

  /**
   * Implements a <textarea> host component that allows setting `value`, and
   * `defaultValue`. This differs from the traditional DOM API because value is
   * usually set as PCDATA children.
   *
   * If `value` is not supplied (or null/undefined), user actions that affect the
   * value will trigger updates to the element.
   *
   * If `value` is supplied (and not null/undefined), the rendered element will
   * not trigger updates to the element. Instead, the `value` prop must change in
   * order for the rendered element to be updated.
   *
   * The rendered element will be initialized with an empty value, the prop
   * `defaultValue` if specified, or the children content (deprecated).
   */
  function getHostProps$3(element, props) {
    const node = element;

    if (!(props.dangerouslySetInnerHTML == null)) {
      {
        throw Error(
          '`dangerouslySetInnerHTML` does not make sense on <textarea>.',
        );
      }
    } // Always set children to the same thing. In IE9, the selection range will
    // get reset if `textContent` is mutated.  We could add a check in setTextContent
    // to only set the value if/when the value differs from the node value (which would
    // completely solve this IE9 bug), but Sebastian+Sophie seemed to like this
    // solution. The value can be a boolean or object so that's why it's forced
    // to be a string.

    const hostProps = _assign({}, props, {
      value: undefined,
      defaultValue: undefined,
      children: toString(node._wrapperState.initialValue),
    });

    return hostProps;
  }

  function initWrapperState$2(element, props) {
    const node = element;

    {
      ReactControlledValuePropTypes.checkPropTypes('textarea', props);

      if (
        props.value !== undefined &&
        props.defaultValue !== undefined &&
        !didWarnValDefaultVal
      ) {
        error(
          '%s contains a textarea with both value and defaultValue props. ' +
            'Textarea elements must be either controlled or uncontrolled ' +
            '(specify either the value prop, or the defaultValue prop, but not ' +
            'both). Decide between using a controlled or uncontrolled textarea ' +
            'and remove one of these props. More info: ' +
            'https://fb.me/react-controlled-components',
          getCurrentFiberOwnerNameInDevOrNull() || 'A component',
        );

        didWarnValDefaultVal = true;
      }
    }

    let initialValue = props.value; // Only bother fetching default value if we're going to use it

    if (initialValue == null) {
      let children = props.children,
        defaultValue = props.defaultValue;

      if (children != null) {
        {
          error(
            'Use the `defaultValue` or `value` props instead of setting ' +
              'children on <textarea>.',
          );
        }

        {
          if (!(defaultValue == null)) {
            {
              throw Error(
                'If you supply `defaultValue` on a <textarea>, do not pass children.',
              );
            }
          }

          if (Array.isArray(children)) {
            if (!(children.length <= 1)) {
              {
                throw Error('<textarea> can only have at most one child.');
              }
            }

            children = children[0];
          }

          defaultValue = children;
        }
      }

      if (defaultValue == null) {
        defaultValue = '';
      }

      initialValue = defaultValue;
    }

    node._wrapperState = {
      initialValue: getToStringValue(initialValue),
    };
  }

  function postMountWrapper$3(element, props) {
    const node = element; // This is in postMount because we need access to the DOM node, which is not
    // available until after the component has mounted.
    const textContent = node.textContent; // Only set node.value if textContent is equal to the expected
    // initial value. In IE10/IE11 there is a bug where the placeholder attribute
    // will populate textContent as well.
    // https://developer.microsoft.com/microsoft-edge/platform/issues/101525/

    if (textContent === node._wrapperState.initialValue) {
      if (textContent !== '' && textContent !== null) {
        node.value = textContent;
      }
    }
  }

  const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
  const MATH_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
  const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
  const Namespaces = {
    html: HTML_NAMESPACE,
    mathml: MATH_NAMESPACE,
    svg: SVG_NAMESPACE,
  }; // Assumes there is no parent namespace.

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

  /* globals MSApp */

  /**
   * Create a function which has 'unsafe' privileges (required by windows8 apps)
   */
  const createMicrosoftUnsafeLocalFunction = function (func) {
    if (typeof MSApp !== 'undefined' && MSApp.execUnsafeLocalFunction) {
      return function (arg0, arg1, arg2, arg3) {
        MSApp.execUnsafeLocalFunction(function () {
          return func(arg0, arg1, arg2, arg3);
        });
      };
    } else {
      return func;
    }
  };
  let reusableSVGContainer;
  /**
   * Set the innerHTML property of a node
   *
   * @param {DOMElement} node
   * @param {string} html
   * @internal
   */
  const setInnerHTML = createMicrosoftUnsafeLocalFunction(function (
    node,
    html,
  ) {
    if (node.namespaceURI === Namespaces.svg) {
      if (!('innerHTML' in node)) {
        // IE does not have innerHTML for SVG nodes, so instead we inject the
        // new markup in a temp node and then move the child nodes across into
        // the target node
        reusableSVGContainer =
          reusableSVGContainer || document.createElement('div');
        reusableSVGContainer.innerHTML =
          '<svg>' + html.valueOf().toString() + '</svg>';

        const svgNode = reusableSVGContainer.firstChild;

        while (node.firstChild) {
          node.removeChild(node.firstChild);
        }

        while (svgNode.firstChild) {
          node.appendChild(svgNode.firstChild);
        }

        return;
      }
    }

    node.innerHTML = html;
  });
  /**
   * HTML nodeType values that represent the type of the node
   */
  const ELEMENT_NODE = 1;
  const TEXT_NODE = 3;
  const COMMENT_NODE = 8;
  const DOCUMENT_NODE = 9;
  const DOCUMENT_FRAGMENT_NODE = 11;

  /**
   * Set the textContent property of a node. For text updates, it's faster
   * to set the `nodeValue` of the Text node directly instead of using
   * `.textContent` which will remove the existing node and create a new one.
   *
   * @param {DOMElement} node
   * @param {string} text
   * @internal
   */

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

  // Do not use the below two methods directly!
  // Instead use constants exported from DOMTopLevelEventTypes in ReactDOM.
  // (It is the only module that is allowed to access these methods.)
  function unsafeCastStringToDOMTopLevelType(topLevelType) {
    return topLevelType;
  }

  function unsafeCastDOMTopLevelTypeToString(topLevelType) {
    return topLevelType;
  }

  /**
   * Generate a mapping of standard vendor prefixes using the defined style property and event name.
   *
   * @param {string} styleProp
   * @param {string} eventName
   * @returns {object}
   */

  function makePrefixMap(styleProp, eventName) {
    const prefixes = {};

    prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
    prefixes['Webkit' + styleProp] = 'webkit' + eventName;
    prefixes['Moz' + styleProp] = 'moz' + eventName;

    return prefixes;
  }

  /**
   * A list of event names to a configurable list of vendor prefixes.
   */

  const vendorPrefixes = {
    animationend: makePrefixMap('Animation', 'AnimationEnd'),
    animationiteration: makePrefixMap('Animation', 'AnimationIteration'),
    animationstart: makePrefixMap('Animation', 'AnimationStart'),
    transitionend: makePrefixMap('Transition', 'TransitionEnd'),
  };
  /**
   * Event names that have already been detected and prefixed (if applicable).
   */
  const prefixedEventNames = {};
  /**
   * Element to check for prefixes on.
   */
  let style = {};
  /**
   * Bootstrap if a DOM exists.
   */

  if (canUseDOM) {
    style = document.createElement('div').style; // On some platforms, in particular some releases of Android 4.x,
    // the un-prefixed "animation" and "transition" properties are defined on the
    // style object but the events that fire will still be prefixed, so we need
    // to check if the un-prefixed events are usable, and if not remove them from the map.

    if (!('AnimationEvent' in window)) {
      delete vendorPrefixes.animationend.animation;
      delete vendorPrefixes.animationiteration.animation;
      delete vendorPrefixes.animationstart.animation;
    } // Same as above

    if (!('TransitionEvent' in window)) {
      delete vendorPrefixes.transitionend.transition;
    }
  }

  /**
   * Attempts to determine the correct vendor prefixed event name.
   *
   * @param {string} eventName
   * @returns {string}
   */

  function getVendorPrefixedEventName(eventName) {
    if (prefixedEventNames[eventName]) {
      return prefixedEventNames[eventName];
    } else if (!vendorPrefixes[eventName]) {
      return eventName;
    }

    const prefixMap = vendorPrefixes[eventName];

    for (const styleProp in prefixMap) {
      if (prefixMap.hasOwnProperty(styleProp) && styleProp in style) {
        return (prefixedEventNames[eventName] = prefixMap[styleProp]);
      }
    }

    return eventName;
  }

  /**
   * To identify top level events in ReactDOM, we use constants defined by this
   * module. This is the only module that uses the unsafe* methods to express
   * that the constants actually correspond to the browser event names. This lets
   * us save some bundle size by avoiding a top level type -> event name map.
   * The rest of ReactDOM code should import top level types from this file.
   */

  const TOP_ABORT = unsafeCastStringToDOMTopLevelType('abort');
  const TOP_BLUR = unsafeCastStringToDOMTopLevelType('blur');
  const TOP_CAN_PLAY = unsafeCastStringToDOMTopLevelType('canplay');
  const TOP_CAN_PLAY_THROUGH = unsafeCastStringToDOMTopLevelType(
    'canplaythrough',
  );
  const TOP_CANCEL = unsafeCastStringToDOMTopLevelType('cancel');
  const TOP_CHANGE = unsafeCastStringToDOMTopLevelType('change');
  const TOP_CLICK = unsafeCastStringToDOMTopLevelType('click');
  const TOP_CLOSE = unsafeCastStringToDOMTopLevelType('close');
  const TOP_COMPOSITION_END = unsafeCastStringToDOMTopLevelType(
    'compositionend',
  );
  const TOP_COMPOSITION_START = unsafeCastStringToDOMTopLevelType(
    'compositionstart',
  );
  const TOP_COMPOSITION_UPDATE = unsafeCastStringToDOMTopLevelType(
    'compositionupdate',
  );
  const TOP_CONTEXT_MENU = unsafeCastStringToDOMTopLevelType('contextmenu');
  const TOP_COPY = unsafeCastStringToDOMTopLevelType('copy');
  const TOP_CUT = unsafeCastStringToDOMTopLevelType('cut');
  const TOP_DOUBLE_CLICK = unsafeCastStringToDOMTopLevelType('dblclick');
  const TOP_AUX_CLICK = unsafeCastStringToDOMTopLevelType('auxclick');
  const TOP_DRAG_END = unsafeCastStringToDOMTopLevelType('dragend');
  const TOP_DRAG_ENTER = unsafeCastStringToDOMTopLevelType('dragenter');
  const TOP_DRAG_LEAVE = unsafeCastStringToDOMTopLevelType('dragleave');
  const TOP_DRAG_START = unsafeCastStringToDOMTopLevelType('dragstart');
  const TOP_DROP = unsafeCastStringToDOMTopLevelType('drop');
  const TOP_DURATION_CHANGE = unsafeCastStringToDOMTopLevelType(
    'durationchange',
  );
  const TOP_EMPTIED = unsafeCastStringToDOMTopLevelType('emptied');
  const TOP_ENCRYPTED = unsafeCastStringToDOMTopLevelType('encrypted');
  const TOP_ENDED = unsafeCastStringToDOMTopLevelType('ended');
  const TOP_ERROR = unsafeCastStringToDOMTopLevelType('error');
  const TOP_FOCUS = unsafeCastStringToDOMTopLevelType('focus');
  const TOP_GOT_POINTER_CAPTURE = unsafeCastStringToDOMTopLevelType(
    'gotpointercapture',
  );
  const TOP_INPUT = unsafeCastStringToDOMTopLevelType('input');
  const TOP_INVALID = unsafeCastStringToDOMTopLevelType('invalid');
  const TOP_KEY_DOWN = unsafeCastStringToDOMTopLevelType('keydown');
  const TOP_KEY_PRESS = unsafeCastStringToDOMTopLevelType('keypress');
  const TOP_KEY_UP = unsafeCastStringToDOMTopLevelType('keyup');
  const TOP_LOAD = unsafeCastStringToDOMTopLevelType('load');
  const TOP_LOAD_START = unsafeCastStringToDOMTopLevelType('loadstart');
  const TOP_LOADED_DATA = unsafeCastStringToDOMTopLevelType('loadeddata');
  const TOP_LOADED_METADATA = unsafeCastStringToDOMTopLevelType(
    'loadedmetadata',
  );
  const TOP_LOST_POINTER_CAPTURE = unsafeCastStringToDOMTopLevelType(
    'lostpointercapture',
  );
  const TOP_MOUSE_DOWN = unsafeCastStringToDOMTopLevelType('mousedown');
  const TOP_MOUSE_OUT = unsafeCastStringToDOMTopLevelType('mouseout');
  const TOP_MOUSE_OVER = unsafeCastStringToDOMTopLevelType('mouseover');
  const TOP_MOUSE_UP = unsafeCastStringToDOMTopLevelType('mouseup');
  const TOP_PASTE = unsafeCastStringToDOMTopLevelType('paste');
  const TOP_PAUSE = unsafeCastStringToDOMTopLevelType('pause');
  const TOP_PLAY = unsafeCastStringToDOMTopLevelType('play');
  const TOP_PLAYING = unsafeCastStringToDOMTopLevelType('playing');
  const TOP_POINTER_CANCEL = unsafeCastStringToDOMTopLevelType('pointercancel');
  const TOP_POINTER_DOWN = unsafeCastStringToDOMTopLevelType('pointerdown');
  const TOP_POINTER_OUT = unsafeCastStringToDOMTopLevelType('pointerout');
  const TOP_POINTER_OVER = unsafeCastStringToDOMTopLevelType('pointerover');
  const TOP_POINTER_UP = unsafeCastStringToDOMTopLevelType('pointerup');
  const TOP_PROGRESS = unsafeCastStringToDOMTopLevelType('progress');
  const TOP_RATE_CHANGE = unsafeCastStringToDOMTopLevelType('ratechange');
  const TOP_RESET = unsafeCastStringToDOMTopLevelType('reset');
  const TOP_SEEKED = unsafeCastStringToDOMTopLevelType('seeked');
  const TOP_SEEKING = unsafeCastStringToDOMTopLevelType('seeking');
  const TOP_SELECTION_CHANGE = unsafeCastStringToDOMTopLevelType(
    'selectionchange',
  );
  const TOP_STALLED = unsafeCastStringToDOMTopLevelType('stalled');
  const TOP_SUBMIT = unsafeCastStringToDOMTopLevelType('submit');
  const TOP_SUSPEND = unsafeCastStringToDOMTopLevelType('suspend');
  const TOP_TEXT_INPUT = unsafeCastStringToDOMTopLevelType('textInput');
  const TOP_TIME_UPDATE = unsafeCastStringToDOMTopLevelType('timeupdate');
  const TOP_TOGGLE = unsafeCastStringToDOMTopLevelType('toggle');
  const TOP_TOUCH_CANCEL = unsafeCastStringToDOMTopLevelType('touchcancel');
  const TOP_TOUCH_END = unsafeCastStringToDOMTopLevelType('touchend');
  const TOP_TOUCH_START = unsafeCastStringToDOMTopLevelType('touchstart');
  const TOP_VOLUME_CHANGE = unsafeCastStringToDOMTopLevelType('volumechange');
  const TOP_WAITING = unsafeCastStringToDOMTopLevelType('waiting');
  const mediaEventTypes = [
    TOP_ABORT,
    TOP_CAN_PLAY,
    TOP_CAN_PLAY_THROUGH,
    TOP_DURATION_CHANGE,
    TOP_EMPTIED,
    TOP_ENCRYPTED,
    TOP_ENDED,
    TOP_ERROR,
    TOP_LOADED_DATA,
    TOP_LOADED_METADATA,
    TOP_LOAD_START,
    TOP_PAUSE,
    TOP_PLAY,
    TOP_PLAYING,
    TOP_PROGRESS,
    TOP_RATE_CHANGE,
    TOP_SEEKED,
    TOP_SEEKING,
    TOP_STALLED,
    TOP_SUSPEND,
    TOP_TIME_UPDATE,
    TOP_VOLUME_CHANGE,
    TOP_WAITING,
  ];

  const PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map; // prettier-ignore
  const elementListenerMap = new PossiblyWeakMap();

  function getListenerMapForElement(element) {
    let listenerMap = elementListenerMap.get(element);

    if (listenerMap === undefined) {
      listenerMap = new Map();
      elementListenerMap.set(element, listenerMap);
    }

    return listenerMap;
  }

  // Don't change these two values. They're used by React Dev Tools.
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

  function getNearestMountedFiber(fiber) {
    let node = fiber;
    let nearestMounted = fiber;

    if (!fiber.alternate) {
      // If there is no alternate, this might be a new tree that isn't inserted
      // yet. If it is, then it will have a pending insertion effect on it.
      let nextNode = node;

      do {
        node = nextNode;

        if ((node.effectTag & (Placement | Hydrating)) !== NoEffect) {
          // This is an insertion or in-progress hydration. The nearest possible
          // mounted fiber is the parent but we need to continue to figure out
          // if that one is still mounted.
          nearestMounted = node.return;
        }

        nextNode = node.return;
      } while (nextNode);
    } else {
      while (node.return) {
        node = node.return;
      }
    }

    if (node.tag === HostRoot) {
      // TODO: Check if this was a nested HostRoot when used with
      // renderContainerIntoSubtree.
      return nearestMounted;
    } // If we didn't hit the root, that means that we're in an disconnected tree
    // that has been unmounted.

    return null;
  }

  /**
   * Accumulates items that must not be null or undefined into the first one. This
   * is used to conserve memory by avoiding array allocations, and thus sacrifices
   * API cleanness. Since `current` can be null before being passed in and not
   * null after this function, make sure to assign it back to `current`:
   *
   * `a = accumulateInto(a, b);`
   *
   * This API should be sparingly used. Try `accumulate` for something cleaner.
   *
   * @return {*|array<*>} An accumulation of items.
   */

  function accumulateInto(current, next) {
    if (!(next != null)) {
      {
        throw Error(
          'accumulateInto(...): Accumulated items must not be null or undefined.',
        );
      }
    }

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

  /**
   * @param {array} arr an "accumulation" of items which is either an Array or
   * a single item. Useful when paired with the `accumulate` module. This is a
   * simple utility that allows us to reason about a collection of items, but
   * handling the case when there is exactly one item (and we do not need to
   * allocate an array).
   * @param {function} cb Callback invoked with each element or a collection.
   * @param {?} [scope] Scope used as `this` in a callback.
   */
  function forEachAccumulated(arr, cb, scope) {
    cb(arr);
  }

  /**
   * Internal queue of events that have accumulated their dispatches and are
   * waiting to have their dispatches executed.
   */

  let eventQueue = null;
  /**
   * Dispatches an event and releases it back into the pool, unless persistent.
   *
   * @param {?object} event Synthetic event to be dispatched.
   * @private
   */
  const executeDispatchesAndRelease = function (event) {
    if (event) {
      executeDispatchesInOrder(event);

      if (!event.isPersistent()) {
        event.constructor.release(event);
      }
    }
  };
  const executeDispatchesAndReleaseTopLevel = function (e) {
    return executeDispatchesAndRelease(e);
  };

  function runEventsInBatch(events) {
    console.log(['test'])
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

  /**
   * Gets the target node from a native browser event by accounting for
   * inconsistencies in browser DOM APIs.
   *
   * @param {object} nativeEvent Native browser event.
   * @return {DOMEventTarget} Target node.
   */

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

  /**
   * Checks if an event is supported in the current execution environment.
   *
   * NOTE: This will not work correctly for non-generic events such as `change`,
   * `reset`, `load`, `error`, and `select`.
   *
   * Borrows from Modernizr.
   *
   * @param {string} eventNameSuffix Event name, e.g. "click".
   * @return {boolean} True if the event is supported.
   * @internal
   * @license Modernizr 3.0.0pre (Custom Build) | MIT
   */

  function isEventSupported(eventNameSuffix) {
    if (!canUseDOM) {
      return false;
    }

    const eventName = 'on' + eventNameSuffix;
    let isSupported = eventName in document;

    if (!isSupported) {
      const element = document.createElement('div');

      element.setAttribute(eventName, 'return;');
      isSupported = typeof element[eventName] === 'function';
    }

    return isSupported;
  }

  /**
   * Summary of `DOMEventPluginSystem` event handling:
   *
   *  - Top-level delegation is used to trap most native browser events. This
   *    may only occur in the main thread and is the responsibility of
   *    ReactDOMEventListener, which is injected and can therefore support
   *    pluggable event sources. This is the only work that occurs in the main
   *    thread.
   *
   *  - We normalize and de-duplicate events to account for browser quirks. This
   *    may be done in the worker thread.
   *
   *  - Forward these native events (with the associated top-level type used to
   *    trap it) to `EventPluginRegistry`, which in turn will ask plugins if they want
   *    to extract any synthetic events.
   *
   *  - The `EventPluginRegistry` will then process each event by annotating them with
   *    "dispatches", a sequence of listeners and IDs that care about that event.
   *
   *  - The `EventPluginRegistry` then dispatches the events.
   *
   * Overview of React and the event system:
   *
   * +------------+    .
   * |    DOM     |    .
   * +------------+    .
   *       |           .
   *       v           .
   * +------------+    .
   * | ReactEvent |    .
   * |  Listener  |    .
   * +------------+    .                         +-----------+
   *       |           .               +--------+|SimpleEvent|
   *       |           .               |         |Plugin     |
   * +-----|------+    .               v         +-----------+
   * |     |      |    .    +--------------+                    +------------+
   * |     +-----------.--->|PluginRegistry|                    |    Event   |
   * |            |    .    |              |     +-----------+  | Propagators|
   * | ReactEvent |    .    |              |     |TapEvent   |  |------------|
   * |  Emitter   |    .    |              |<---+|Plugin     |  |other plugin|
   * |            |    .    |              |     +-----------+  |  utilities |
   * |     +-----------.--->|              |                    +------------+
   * |     |      |    .    +--------------+
   * +-----|------+    .                ^        +-----------+
   *       |           .                |        |Enter/Leave|
   *       +           .                +-------+|Plugin     |
   * +-------------+   .                         +-----------+
   * | application |   .
   * |-------------|   .
   * |             |   .
   * |             |   .
   * +-------------+   .
   *                   .
   *    React Core     .  General Purpose Event Plugin System
   */

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
  } // Used to store ancestor hierarchy in top level callback

  function getTopLevelCallbackBookKeeping(
    topLevelType,
    nativeEvent,
    targetInst,
    eventSystemFlags,
  ) {
    if (callbackBookkeepingPool.length) {
      const instance = callbackBookkeepingPool.pop();

      instance.topLevelType = topLevelType;
      instance.eventSystemFlags = eventSystemFlags;
      instance.nativeEvent = nativeEvent;
      instance.targetInst = targetInst;

      return instance;
    }

    return {
      topLevelType: topLevelType,
      eventSystemFlags: eventSystemFlags,
      nativeEvent: nativeEvent,
      targetInst: targetInst,
      ancestors: [],
    };
  }

  /**
   * Find the deepest React component completely containing the root of the
   * passed-in instance (for use when entire React trees are nested within each
   * other). If React trees are not nested, returns null.
   */

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

  /**
   * Allows registered plugins an opportunity to extract events from top-level
   * native browser events.
   *
   * @return {*} An accumulation of synthetic events.
   * @internal
   */

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

  /**
   * We listen for bubbled touch events on the document object.
   *
   * Firefox v8.01 (and possibly others) exhibited strange behavior when
   * mounting `onmousemove` events at some node that was not the document
   * element. The symptoms were that if your mouse is not moving over something
   * contained within that mount point (for example on the background) the
   * top-level listeners for `onmousemove` won't be called. However, if you
   * register the `mousemove` on the document object, then it will of course
   * catch all `mousemove`s. This along with iOS quirks, justifies restricting
   * top-level listeners to the document object only, at least for these
   * movement types of events and possibly all events.
   *
   * @see http://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
   *
   * Also, `keyup`/`keypress`/`keydown` do not bubble to the window on IE, but
   * they bubble to document.
   *
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   * @param {object} mountAt Container where to mount the listener
   */

  function legacyListenToEvent(registrationName, mountAt) {
    console.log(['legacyListenToEvent'], { registrationName, mountAt })
    const listenerMap = getListenerMapForElement(mountAt);
    const dependencies = registrationNameDependencies[registrationName];

    for (let i = 0; i < dependencies.length; i++) {
      const dependency = dependencies[i];

      legacyListenToTopLevelEvent(dependency, mountAt, listenerMap);
    }
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

  function isListeningToAllDependencies(registrationName, mountAt) {
    const listenerMap = getListenerMapForElement(mountAt);
    const dependencies = registrationNameDependencies[registrationName];

    for (let i = 0; i < dependencies.length; i++) {
      const dependency = dependencies[i];

      if (!listenerMap.has(dependency)) {
        return false;
      }
    }

    return true;
  }

  function addEventBubbleListener(element, eventType, listener) {
    element.addEventListener(eventType, listener, false);
  }

  // do it in two places, which duplicates logic
  // and increases the bundle size, we do it all
  // here once. If we remove or refactor the
  // SimpleEventPlugin, we should also remove or
  // update the below line.

  const simpleEventPluginEventTypes = {};
  const topLevelEventsToDispatchConfig = new Map();
  const eventPriorities = new Map(); // We store most of the events in this module in pairs of two strings so we can re-use
  // the code required to apply the same logic for event prioritization and that of the
  // SimpleEventPlugin. This complicates things slightly, but the aim is to reduce code
  // duplication (for which there would be quite a bit). For the events that are not needed
  // for the SimpleEventPlugin (otherDiscreteEvents) we process them separately as an
  // array of top level events.
  // Lastly, we ignore prettier so we can keep the formatting sane.
  // prettier-ignore
  const discreteEventPairsForSimpleEventPlugin = [TOP_CLICK, 'click'];
  const otherDiscreteEvents = [TOP_CHANGE, TOP_SELECTION_CHANGE, TOP_TEXT_INPUT, TOP_COMPOSITION_START, TOP_COMPOSITION_END, TOP_COMPOSITION_UPDATE]; // prettier-ignore

  /**
   * Turns
   * ['abort', ...]
   * into
   * eventTypes = {
   *   'abort': {
   *     phasedRegistrationNames: {
   *       bubbled: 'onAbort',
   *       captured: 'onAbortCapture',
   *     },
   *     dependencies: [TOP_ABORT],
   *   },
   *   ...
   * };
   * topLevelEventsToDispatchConfig = new Map([
   *   [TOP_ABORT, { sameConfig }],
   * ]);
   */

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

  function processTopEventPairsByPriority(eventTypes, priority) {
    for (let i = 0; i < eventTypes.length; i++) {
      eventPriorities.set(eventTypes[i], priority);
    }
  } // SimpleEventPlugin

  processSimpleEventPluginPairsByPriority(
    discreteEventPairsForSimpleEventPlugin,
    DiscreteEvent,
  );

  processTopEventPairsByPriority(otherDiscreteEvents, DiscreteEvent);

  // Intentionally not named imports because Rollup would use dynamic dispatch for
  const UserBlockingPriority = unstable_UserBlockingPriority,
    runWithPriority = unstable_runWithPriority; // TODO: can we stop exporting these?
  let _enabled = true;

  function setEnabled(enabled) {
    _enabled = !!enabled;
  }

  function isEnabled() {
    return _enabled;
  }

  function trapBubbledEvent(topLevelType, element) {
    trapEventForPluginEventSystem(element, topLevelType, false);
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
  } // Attempt dispatching an event. Returns a SuspenseInstance or Container if it's blocked.

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

  // List derived from Gecko source code:
  // https://github.com/mozilla/gecko-dev/blob/4e638efc71/layout/style/test/property_database.js
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

  /**
   * @param {string} prefix vendor-specific prefix, eg: Webkit
   * @param {string} key style name, eg: transitionDuration
   * @return {string} style name prefixed with `prefix`, properly camelCased, eg:
   * WebkitTransitionDuration
   */

  function prefixKey(prefix, key) {
    return prefix + key.charAt(0).toUpperCase() + key.substring(1);
  }

  /**
   * Support style names that may come passed in prefixed by adding permutations
   * of vendor prefixes.
   */

  const prefixes = ['Webkit', 'ms', 'Moz', 'O']; // Using Object.keys here, or else the vanilla for-in loop makes IE8 go into an
  // infinite loop, because it iterates over the newly added props too.

  Object.keys(isUnitlessNumber).forEach(function (prop) {
    prefixes.forEach(function (prefix) {
      isUnitlessNumber[prefixKey(prefix, prop)] = isUnitlessNumber[prop];
    });
  });

  /**
   * Convert a value into the proper css writable value. The style name `name`
   * should be logical (no hyphens), as specified
   * in `CSSProperty.isUnitlessNumber`.
   *
   * @param {string} name CSS property name such as `topMargin`.
   * @param {*} value CSS property value such as `10px`.
   * @return {string} Normalized style value with dimensions applied.
   */

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

  const warnValidStyle = function () {};
  const warnValidStyle$1 = warnValidStyle;

  function setValueForStyles(node, styles) {
    const style = node.style;

    for (let styleName in styles) {
      if (!styles.hasOwnProperty(styleName)) {
        continue;
      }

      const isCustomProperty = styleName.indexOf('--') === 0;

      {
        if (!isCustomProperty) {
          warnValidStyle$1(styleName, styles[styleName]);
        }
      }

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

  const DANGEROUSLY_SET_INNER_HTML = 'dangerouslySetInnerHTML';
  const SUPPRESS_CONTENT_EDITABLE_WARNING = 'suppressContentEditableWarning';
  const SUPPRESS_HYDRATION_WARNING = 'suppressHydrationWarning';
  const AUTOFOCUS = 'autoFocus';
  const CHILDREN = 'children';
  const STYLE = 'style';
  const HTML$1 = '__html';
  const HTML_NAMESPACE$1 = Namespaces.html;
  let warnForInvalidEventListener;

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

  function getOwnerDocumentFromRootContainer(rootContainerElement) {
    return rootContainerElement.nodeType === DOCUMENT_NODE
      ? rootContainerElement
      : rootContainerElement.ownerDocument;
  }

  function noop() {}

  function trapClickOnNonInteractiveElement(node) {
    // Mobile Safari does not fire properly bubble click events on
    // non-interactive elements, which means delegated click listeners do not
    // fire. The workaround for this bug involves attaching an empty click
    // listener on the target node.
    // http://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
    // Just set it using the onclick property so that we don't have to manage any
    // bookkeeping for it. Not sure if we need to clear it when the listener is
    // removed.
    // TODO: Only do this for the relevant Safaris maybe?
    node.onclick = noop;
  }

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
      } else if (
        propKey === SUPPRESS_CONTENT_EDITABLE_WARNING ||
        propKey === SUPPRESS_HYDRATION_WARNING
      );
      else if (propKey === AUTOFOCUS);
      else if (registrationNameModules.hasOwnProperty(propKey)) {
        if (nextProp != null) {
          if (typeof nextProp !== 'function') {
            warnForInvalidEventListener(propKey, nextProp);
          }

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
        setValueForProperty(
          domElement,
          propKey,
          propValue,
          isCustomComponentTag,
        );
      }
    }
  }

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

  function setInitialProperties(
    domElement,
    tag,
    rawProps,
    rootContainerElement,
  ) {
    const isCustomComponentTag = isCustomComponent(tag, rawProps);
    let props;

    switch (tag) {
      case 'iframe':
      case 'object':
      case 'embed':
        trapBubbledEvent(TOP_LOAD, domElement);
        props = rawProps;

        break;
      case 'video':
      case 'audio':
        // Create listener for each media event
        for (let i = 0; i < mediaEventTypes.length; i++) {
          trapBubbledEvent(mediaEventTypes[i], domElement);
        }

        props = rawProps;

        break;
      case 'source':
        trapBubbledEvent(TOP_ERROR, domElement);
        props = rawProps;

        break;
      case 'img':
      case 'image':
      case 'link':
        trapBubbledEvent(TOP_ERROR, domElement);
        trapBubbledEvent(TOP_LOAD, domElement);
        props = rawProps;

        break;
      case 'form':
        trapBubbledEvent(TOP_RESET, domElement);
        trapBubbledEvent(TOP_SUBMIT, domElement);
        props = rawProps;

        break;
      case 'details':
        trapBubbledEvent(TOP_TOGGLE, domElement);
        props = rawProps;

        break;
      case 'input':
        initWrapperState(domElement, rawProps);
        props = getHostProps(domElement, rawProps);
        trapBubbledEvent(TOP_INVALID, domElement); // For controlled components we always need to ensure we're listening
        // to onChange. Even if there is no listener.

        ensureListeningTo(rootContainerElement, 'onChange');

        break;
      case 'option':
        props = getHostProps$1(domElement, rawProps);

        break;
      case 'select':
        // initWrapperState$1(domElement, rawProps);
        props = getHostProps$2(domElement, rawProps);
        trapBubbledEvent(TOP_INVALID, domElement); // For controlled components we always need to ensure we're listening
        // to onChange. Even if there is no listener.

        ensureListeningTo(rootContainerElement, 'onChange');

        break;
      case 'textarea':
        initWrapperState$2(domElement, rawProps);
        props = getHostProps$3(domElement, rawProps);
        trapBubbledEvent(TOP_INVALID, domElement); // For controlled components we always need to ensure we're listening
        // to onChange. Even if there is no listener.

        ensureListeningTo(rootContainerElement, 'onChange');

        break;
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

    switch (tag) {
      case 'input':
        // TODO: Make sure we check if this is still unmounted or do any clean
        // up necessary since we never stop tracking anymore.
        track(domElement);
        postMountWrapper(domElement, rawProps, false);

        break;
      case 'textarea':
        // TODO: Make sure we check if this is still unmounted or do any clean
        // up necessary since we never stop tracking anymore.
        track(domElement);
        postMountWrapper$3(domElement);

        break;
      case 'option':
        postMountWrapper$1(domElement, rawProps);

        break;
      case 'select':
        postMountWrapper$2(domElement, rawProps);

        break;
      default:
        if (typeof props.onClick === 'function') {
          // TODO: This cast may not be sound for SVG, MathML or custom elements.
          trapClickOnNonInteractiveElement(domElement);
        }

        break;
    }
  }

  // Calculate the diff between the two objects.
  function diffProperties(
    domElement,
    tag,
    lastRawProps,
    nextRawProps,
    rootContainerElement,
  ) {
    console.log(['diffProperties'], { domElement,
      tag,
      lastRawProps,
      nextRawProps,
      rootContainerElement, })
    let updatePayload = null;
    let lastProps;
    let nextProps;

    lastProps = lastRawProps;
    nextProps = nextRawProps;

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
          // We eagerly listen to this even though we haven't committed yet.
          if (typeof nextProp !== 'function') {
            warnForInvalidEventListener(propKey, nextProp);
          }

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
  } // Apply the diff.

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

  function getActiveElement(doc) {
    doc = doc || (typeof document !== 'undefined' ? document : undefined);

    if (typeof doc === 'undefined') {
      return null;
    }

    try {
      return doc.activeElement || doc.body;
    } catch (e) {
      return doc.body;
    }
  }

  /**
   * Given any node return the first leaf node without children.
   *
   * @param {DOMElement|DOMTextNode} node
   * @return {DOMElement|DOMTextNode}
   */

  function getLeafNode(node) {
    while (node && node.firstChild) {
      node = node.firstChild;
    }

    return node;
  }

  /**
   * Get the next sibling within a container. This will walk up the
   * DOM if a node's siblings have been exhausted.
   *
   * @param {DOMElement|DOMTextNode} node
   * @return {?DOMElement|DOMTextNode}
   */

  function getSiblingNode(node) {
    while (node) {
      if (node.nextSibling) {
        return node.nextSibling;
      }

      node = node.parentNode;
    }
  }

  /**
   * Get object describing the nodes which contain characters at offset.
   *
   * @param {DOMElement|DOMTextNode} root
   * @param {number} offset
   * @return {?object}
   */

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

  /**
   * @param {DOMElement} outerNode
   * @return {?object}
   */

  /**
   * Returns {start, end} where `start` is the character/codepoint index of
   * (anchorNode, anchorOffset) within the textContent of `outerNode`, and
   * `end` is the index of (focusNode, focusOffset).
   *
   * Returns null if you pass in garbage input but we should probably just crash.
   *
   * Exported only for testing.
   */

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
      start: start,
      end: end,
    };
  }

  /**
   * In modern non-IE browsers, we can support both forward and backward
   * selections.
   *
   * Note: IE10+ supports the Selection object, but it does not support
   * the `extend` method, which means that even in modern IE, it's not possible
   * to programmatically create a backward selection. Thus, for all IE
   * versions, we use the old IE API to create our selections.
   *
   * @param {DOMElement|DOMTextNode} node
   * @param {object} offsets
   */

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

  function isSameOriginFrame(iframe) {
    try {
      // Accessing the contentDocument of a HTMLIframeElement can cause the browser
      // to throw, e.g. if it has a cross-origin src attribute.
      // Safari will show an error in the console when the access results in "Blocked a frame with origin". e.g:
      // iframe.contentDocument.defaultView;
      // A safety way is to access one of the cross origin properties: Window or Location
      // Which might result in "SecurityError" DOM Exception and it is compatible to Safari.
      // https://html.spec.whatwg.org/multipage/browsers.html#integration-with-idl
      return typeof iframe.contentWindow.location.href === 'string';
    } catch (err) {
      return false;
    }
  }

  function getActiveElementDeep() {
    let win = window;
    let element = getActiveElement();

    while (element instanceof win.HTMLIFrameElement) {
      if (isSameOriginFrame(element)) {
        win = element.contentWindow;
      } else {
        return element;
      }

      element = getActiveElement(win.document);
    }

    return element;
  }

  /**
   * @ReactInputSelection: React input selection module. Based on Selection.js,
   * but modified to be suitable for react and has a couple of bug fixes (doesn't
   * assume buttons have range selections allowed).
   * Input selection module for React.
   */

  /**
   * @hasSelectionCapabilities: we get the element types that support selection
   * from https://html.spec.whatwg.org/#do-not-apply, looking at `selectionStart`
   * and `selectionEnd` rows.
   */

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

  function getSelectionInformation() {
    const focusedElem = getActiveElementDeep();

    return {
      // Used by Flare
      activeElementDetached: null,
      focusedElem: focusedElem,
      selectionRange: null,
    };
  }

  /**
   * @restoreSelection: If any selection information was potentially lost,
   * restore it. This is useful when performing operations that could remove dom
   * nodes and place them back in, resulting in focus being lost.
   */

  function restoreSelection(priorSelectionInformation) {
    const curFocusedElem = getActiveElementDeep();
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

  const updatedAncestorInfo = function () {};
  let eventsEnabled = null;
  let selectionInformation = null;

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

    {
      const validatedTag = type.toLowerCase();
      const ancestorInfo = updatedAncestorInfo(null, validatedTag);

      return {
        namespace: namespace,
        ancestorInfo: ancestorInfo,
      };
    }
  }

  function prepareForCommit(containerInfo) {
    eventsEnabled = isEnabled();
    selectionInformation = getSelectionInformation();
    setEnabled(false);
  }

  function resetAfterCommit(containerInfo) {
    restoreSelection(selectionInformation);
    setEnabled(eventsEnabled);
    eventsEnabled = null;

    selectionInformation = null;
  }

  function createInstance(
    type,
    props,
    rootContainerInstance,
    hostContext,
    internalInstanceHandle,
  ) {
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

  function appendInitialChild(parentInstance, child) {
    parentInstance.appendChild(child);
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

  function resetTextContent(domElement) {
    setTextContent(domElement, '');
  }

  function appendChild(parentInstance, child) {
    parentInstance.appendChild(child);
  }

  function insertBefore(parentInstance, child, beforeChild) {
    parentInstance.insertBefore(child, beforeChild);
  }

  function removeChild(parentInstance, child) {
    parentInstance.removeChild(child);
  }

  function removeChildFromContainer(container, child) {
    if (container.nodeType === COMMENT_NODE) {
      container.parentNode.removeChild(child);
    } else {
      container.removeChild(child);
    }
  }

  const randomKey = Math.random().toString(36).slice(2);
  const internalInstanceKey = '__reactInternalInstance$' + randomKey;
  const internalEventHandlersKey = '__reactEventHandlers$' + randomKey;
  const internalContainerInstanceKey = '__reactContainere$' + randomKey;

  function precacheFiberNode(hostInst, node) {
    node[internalInstanceKey] = hostInst;
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

  function updateFiberProps(node, props) {
    console.log(['updateFiberProps'], { node, props });
    node[internalEventHandlersKey] = props;
  }

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

  /**
   * Return the lowest common ancestor of A and B, or null if they are in
   * different trees.
   */

  function getLowestCommonAncestor(instA, instB) {
    let depthA = 0;

    for (let tempA = instA; tempA; tempA = getParent(tempA)) {
      depthA++;
    }

    let depthB = 0;

    for (let tempB = instB; tempB; tempB = getParent(tempB)) {
      depthB++;
    } // If A is deeper, crawl up.

    while (depthA - depthB > 0) {
      instA = getParent(instA);
      depthA--;
    } // If B is deeper, crawl up.

    while (depthB - depthA > 0) {
      instB = getParent(instB);
      depthB--;
    } // Walk in lockstep until we find a match.

    let depth = depthA;

    while (depth--) {
      if (instA === instB || instA === instB.alternate) {
        return instA;
      }

      instA = getParent(instA);
      instB = getParent(instB);
    }

    return null;
  }

  /**
   * Simulates the traversal of a two-phase, capture/bubble event dispatch.
   */

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

  /**
   * Traverses the ID hierarchy and invokes the supplied `cb` on any IDs that
   * should would receive a `mouseEnter` or `mouseLeave` event.
   *
   * Does not invoke the callback on the nearest common ancestor because nothing
   * "entered" or "left" that element.
   */

  function traverseEnterLeave(from, to, fn, argFrom, argTo) {
    const common = from && to ? getLowestCommonAncestor(from, to) : null;
    const pathFrom = [];

    while (true) {
      if (!from) {
        break;
      }

      if (from === common) {
        break;
      }

      const alternate = from.alternate;

      if (alternate !== null && alternate === common) {
        break;
      }

      pathFrom.push(from);
      from = getParent(from);
    }

    const pathTo = [];

    while (true) {
      if (!to) {
        break;
      }

      if (to === common) {
        break;
      }

      const _alternate = to.alternate;

      if (_alternate !== null && _alternate === common) {
        break;
      }

      pathTo.push(to);
      to = getParent(to);
    }

    for (let i = 0; i < pathFrom.length; i++) {
      fn(pathFrom[i], 'bubbled', argFrom);
    }

    for (let _i = pathTo.length; _i-- > 0; ) {
      fn(pathTo[_i], 'captured', argTo);
    }
  }

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

  /**
   * Accumulates without regard to direction, does not look for phased
   * registration names. Same as `accumulateDirectDispatchesSingle` but without
   * requiring that the `dispatchMarker` be the same as the dispatched ID.
   */

  function accumulateDispatches(inst, ignoredDirection, event) {
    console.log(['accumulateDispatches'])
    if (inst && event && event.dispatchConfig.registrationName) {
      const registrationName = event.dispatchConfig.registrationName;
      const listener = getListener(inst, registrationName);

      if (listener) {
        event._dispatchListeners = accumulateInto(
          event._dispatchListeners,
          listener,
        );
        event._dispatchInstances = accumulateInto(
          event._dispatchInstances,
          inst,
        );
      }
    }
  }

  /**
   * Accumulates dispatches on an `SyntheticEvent`, but only for the
   * `dispatchMarker`.
   * @param {SyntheticEvent} event
   */

  function accumulateTwoPhaseDispatches(events) {
    console.log(['accumulateTwoPhaseDispatches'], { events })
    forEachAccumulated(events, accumulateTwoPhaseDispatchesSingle);
  }

  function accumulateEnterLeaveDispatches(leave, enter, from, to) {
    traverseEnterLeave(from, to, accumulateDispatches, leave, enter);
  }

  /**
   * These variables store information about text content of a target node,
   * allowing comparison of content before and after a given event.
   *
   * Identify the node where selection currently begins, then observe
   * both its text content and its current position in the DOM. Since the
   * browser may natively replace the target node during composition, we can
   * use its position to find its replacement.
   *
   *
   */
  let root = null;
  let startText = null;
  let fallbackText = null;

  function initialize(nativeEventTarget) {
    root = nativeEventTarget;
    startText = getText();

    return true;
  }

  function reset() {
    root = null;
    startText = null;
    fallbackText = null;
  }

  function getData() {
    if (fallbackText) {
      return fallbackText;
    }

    let start;
    const startValue = startText;
    const startLength = startValue.length;
    let end;
    const endValue = getText();
    const endLength = endValue.length;

    for (start = 0; start < startLength; start++) {
      if (startValue[start] !== endValue[start]) {
        break;
      }
    }

    const minEnd = startLength - start;

    for (end = 1; end <= minEnd; end++) {
      if (startValue[startLength - end] !== endValue[endLength - end]) {
        break;
      }
    }

    const sliceTail = end > 1 ? 1 - end : undefined;

    fallbackText = endValue.slice(start, sliceTail);

    return fallbackText;
  }

  function getText() {
    if ('value' in root) {
      return root.value;
    }

    return root.textContent;
  }

  const EVENT_POOL_SIZE = 10;
  /**
   * @interface Event
   * @see http://www.w3.org/TR/DOM-Level-3-Events/
   */
  const EventInterface = {
    type: null,
    target: null,
    // currentTarget is set when dispatching; no use in copying it here
    currentTarget: function () {
      return null;
    },
    eventPhase: null,
    bubbles: null,
    cancelable: null,
    timeStamp: function (event) {
      return event.timeStamp || Date.now();
    },
    defaultPrevented: null,
    isTrusted: null,
  };

  function functionThatReturnsTrue() {
    return true;
  }

  function functionThatReturnsFalse() {
    return false;
  }

  /**
   * Synthetic events are dispatched by event plugins, typically in response to a
   * top-level event delegation handler.
   *
   * These systems should generally use pooling to reduce the frequency of garbage
   * collection. The system should check `isPersistent` to determine whether the
   * event should be released into the pool after being dispatched. Users that
   * need a persisted event should invoke `persist`.
   *
   * Synthetic events (and subclasses) implement the DOM Level 3 Events API by
   * normalizing browser quirks. Subclasses do not necessarily have to implement a
   * DOM interface; custom application-specific events can also subclass this.
   *
   * @param {object} dispatchConfig Configuration used to dispatch this event.
   * @param {*} targetInst Marker identifying the event target.
   * @param {object} nativeEvent Native browser event.
   * @param {DOMEventTarget} nativeEventTarget Target node.
   */

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

  _assign(SyntheticEvent.prototype, {
    preventDefault: function () {
      this.defaultPrevented = true;

      const event = this.nativeEvent;

      if (!event) {
        return;
      }

      if (event.preventDefault) {
        event.preventDefault();
      } else if (typeof event.returnValue !== 'unknown') {
        event.returnValue = false;
      }

      this.isDefaultPrevented = functionThatReturnsTrue;
    },
    stopPropagation: function () {
      const event = this.nativeEvent;

      if (!event) {
        return;
      }

      if (event.stopPropagation) {
        event.stopPropagation();
      } else if (typeof event.cancelBubble !== 'unknown') {
        // The ChangeEventPlugin registers a "propertychange" event for
        // IE. This event does not support bubbling or cancelling, and
        // any references to cancelBubble throw "Member not found".  A
        // typeof check of "unknown" circumvents this issue (and is also
        // IE specific).
        event.cancelBubble = true;
      }

      this.isPropagationStopped = functionThatReturnsTrue;
    },

    /**
     * We release all dispatched `SyntheticEvent`s after each event loop, adding
     * them back into the pool. This allows a way to hold onto a reference that
     * won't be added back into the pool.
     */
    persist: function () {
      this.isPersistent = functionThatReturnsTrue;
    },

    /**
     * Checks if this event should be released back into the pool.
     *
     * @return {boolean} True if this should not be released, false otherwise.
     */
    isPersistent: functionThatReturnsFalse,

    /**
     * `PooledClass` looks for `destructor` on each instance it releases.
     */
    destructor: function () {
      const Interface = this.constructor.Interface;

      for (const propName in Interface) {
        {
          Object.defineProperty(
            this,
            propName,
            getPooledWarningPropertyDefinition(propName, Interface[propName]),
          );
        }
      }

      this.dispatchConfig = null;
      this._targetInst = null;
      this.nativeEvent = null;
      this.isDefaultPrevented = functionThatReturnsFalse;
      this.isPropagationStopped = functionThatReturnsFalse;
      this._dispatchListeners = null;
      this._dispatchInstances = null;

      {
        Object.defineProperty(
          this,
          'nativeEvent',
          getPooledWarningPropertyDefinition('nativeEvent', null),
        );
        Object.defineProperty(
          this,
          'isDefaultPrevented',
          getPooledWarningPropertyDefinition(
            'isDefaultPrevented',
            functionThatReturnsFalse,
          ),
        );
        Object.defineProperty(
          this,
          'isPropagationStopped',
          getPooledWarningPropertyDefinition(
            'isPropagationStopped',
            functionThatReturnsFalse,
          ),
        );
        Object.defineProperty(
          this,
          'preventDefault',
          getPooledWarningPropertyDefinition('preventDefault', function () {}),
        );
        Object.defineProperty(
          this,
          'stopPropagation',
          getPooledWarningPropertyDefinition('stopPropagation', function () {}),
        );
      }
    },
  });

  SyntheticEvent.Interface = EventInterface;
  /**
   * Helper to reduce boilerplate when creating subclasses.
   */

  SyntheticEvent.extend = function (Interface) {
    const Super = this;
    const E = function () {};

    E.prototype = Super.prototype;

    const prototype = new E();

    function Class() {
      return Super.apply(this, arguments);
    }

    _assign(prototype, Class.prototype);

    Class.prototype = prototype;
    Class.prototype.constructor = Class;
    Class.Interface = _assign({}, Super.Interface, Interface);
    Class.extend = Super.extend;
    addEventPoolingTo(Class);

    return Class;
  };

  addEventPoolingTo(SyntheticEvent);

  /**
   * Helper to nullify syntheticEvent instance properties when destructing
   *
   * @param {String} propName
   * @param {?object} getVal
   * @return {object} defineProperty object
   */

  function getPooledWarningPropertyDefinition(propName, getVal) {
    const isFunction = typeof getVal === 'function';

    return {
      configurable: true,
      set: set,
      get: get,
    };

    function set(val) {
      const action = isFunction ? 'setting the method' : 'setting the property';

      warn(action, 'This is effectively a no-op');

      return val;
    }

    function get() {
      const action = isFunction
        ? 'accessing the method'
        : 'accessing the property';
      const result = isFunction
        ? 'This is a no-op function'
        : 'This is set to null';

      warn(action, result);

      return getVal;
    }

    function warn(action, result) {
      {
        error(
          "This synthetic event is reused for performance reasons. If you're seeing this, " +
            "you're %s `%s` on a released/nullified synthetic event. %s. " +
            'If you must keep the original synthetic event around, use event.persist(). ' +
            'See https://fb.me/react-event-pooling for more information.',
          action,
          propName,
          result,
        );
      }
    }
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

  /**
   * @interface Event
   * @see http://www.w3.org/TR/DOM-Level-3-Events/#events-compositionevents
   */

  const SyntheticCompositionEvent = SyntheticEvent.extend({
    data: null,
  });

  /**
   * @interface Event
   * @see http://www.w3.org/TR/2013/WD-DOM-Level-3-Events-20131105
   *      /#events-inputevents
   */

  const SyntheticInputEvent = SyntheticEvent.extend({
    data: null,
  });
  const END_KEYCODES = [9, 13, 27, 32]; // Tab, Return, Esc, Space
  const START_KEYCODE = 229;
  const canUseCompositionEvent = canUseDOM && 'CompositionEvent' in window;
  let documentMode = null;

  if (canUseDOM && 'documentMode' in document) {
    documentMode = document.documentMode;
  } // Webkit offers a very useful `textInput` event that can be used to
  // directly represent `beforeInput`. The IE `textinput` event is not as
  // useful, so we don't use it.

  const canUseTextInputEvent =
    canUseDOM && 'TextEvent' in window && !documentMode; // In IE9+, we have access to composition events, but the data supplied
  // by the native compositionend event may be incorrect. Japanese ideographic
  // spaces, for instance (\u3000) are not recorded correctly.
  const useFallbackCompositionData =
    canUseDOM &&
    (!canUseCompositionEvent ||
      (documentMode && documentMode > 8 && documentMode <= 11));
  const SPACEBAR_CODE = 32;
  const SPACEBAR_CHAR = String.fromCharCode(SPACEBAR_CODE); // Events and their corresponding property names.
  const eventTypes = {
    beforeInput: {
      phasedRegistrationNames: {
        bubbled: 'onBeforeInput',
        captured: 'onBeforeInputCapture',
      },
      dependencies: [
        TOP_COMPOSITION_END,
        TOP_KEY_PRESS,
        TOP_TEXT_INPUT,
        TOP_PASTE,
      ],
    },
    compositionEnd: {
      phasedRegistrationNames: {
        bubbled: 'onCompositionEnd',
        captured: 'onCompositionEndCapture',
      },
      dependencies: [
        TOP_BLUR,
        TOP_COMPOSITION_END,
        TOP_KEY_DOWN,
        TOP_KEY_PRESS,
        TOP_KEY_UP,
        TOP_MOUSE_DOWN,
      ],
    },
    compositionStart: {
      phasedRegistrationNames: {
        bubbled: 'onCompositionStart',
        captured: 'onCompositionStartCapture',
      },
      dependencies: [
        TOP_BLUR,
        TOP_COMPOSITION_START,
        TOP_KEY_DOWN,
        TOP_KEY_PRESS,
        TOP_KEY_UP,
        TOP_MOUSE_DOWN,
      ],
    },
    compositionUpdate: {
      phasedRegistrationNames: {
        bubbled: 'onCompositionUpdate',
        captured: 'onCompositionUpdateCapture',
      },
      dependencies: [
        TOP_BLUR,
        TOP_COMPOSITION_UPDATE,
        TOP_KEY_DOWN,
        TOP_KEY_PRESS,
        TOP_KEY_UP,
        TOP_MOUSE_DOWN,
      ],
    },
  }; // Track whether we've ever handled a keypress on the space key.
  let hasSpaceKeypress = false;

  /**
   * Return whether a native keypress event is assumed to be a command.
   * This is required because Firefox fires `keypress` events for key commands
   * (cut, copy, select-all, etc.) even though no character is inserted.
   */

  function isKeypressCommand(nativeEvent) {
    return (
      (nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) && // ctrlKey && altKey is equivalent to AltGr, and is not a command.
      !(nativeEvent.ctrlKey && nativeEvent.altKey)
    );
  }

  /**
   * Translate native top level events into event types.
   *
   * @param {string} topLevelType
   * @return {object}
   */

  function getCompositionEventType(topLevelType) {
    switch (topLevelType) {
      case TOP_COMPOSITION_START:
        return eventTypes.compositionStart;
      case TOP_COMPOSITION_END:
        return eventTypes.compositionEnd;
      case TOP_COMPOSITION_UPDATE:
        return eventTypes.compositionUpdate;
    }
  }

  /**
   * Does our fallback best-guess model think this event signifies that
   * composition has begun?
   *
   * @param {string} topLevelType
   * @param {object} nativeEvent
   * @return {boolean}
   */

  function isFallbackCompositionStart(topLevelType, nativeEvent) {
    return (
      topLevelType === TOP_KEY_DOWN && nativeEvent.keyCode === START_KEYCODE
    );
  }

  /**
   * Does our fallback mode think that this event is the end of composition?
   *
   * @param {string} topLevelType
   * @param {object} nativeEvent
   * @return {boolean}
   */

  function isFallbackCompositionEnd(topLevelType, nativeEvent) {
    switch (topLevelType) {
      case TOP_KEY_UP:
        // Command keys insert or clear IME input.
        return END_KEYCODES.indexOf(nativeEvent.keyCode) !== -1;
      case TOP_KEY_DOWN:
        // Expect IME keyCode on each keydown. If we get any other
        // code we must have exited earlier.
        return nativeEvent.keyCode !== START_KEYCODE;
      case TOP_KEY_PRESS:
      case TOP_MOUSE_DOWN:
      case TOP_BLUR:
        // Events are not possible without cancelling IME.
        return true;
      default:
        return false;
    }
  }

  /**
   * Google Input Tools provides composition data via a CustomEvent,
   * with the `data` property populated in the `detail` object. If this
   * is available on the event object, use it. If not, this is a plain
   * composition event and we have nothing special to extract.
   *
   * @param {object} nativeEvent
   * @return {?string}
   */

  function getDataFromCustomEvent(nativeEvent) {
    const detail = nativeEvent.detail;

    if (typeof detail === 'object' && 'data' in detail) {
      return detail.data;
    }

    return null;
  }

  /**
   * Check if a composition event was triggered by Korean IME.
   * Our fallback mode does not work well with IE's Korean IME,
   * so just use native composition events when Korean IME is used.
   * Although CompositionEvent.locale property is deprecated,
   * it is available in IE, where our fallback mode is enabled.
   *
   * @param {object} nativeEvent
   * @return {boolean}
   */

  function isUsingKoreanIME(nativeEvent) {
    return nativeEvent.locale === 'ko';
  } // Track the current IME composition status, if any.

  let isComposing = false;

  /**
   * @return {?object} A SyntheticCompositionEvent.
   */

  function extractCompositionEvent(
    topLevelType,
    targetInst,
    nativeEvent,
    nativeEventTarget,
  ) {
    let eventType;
    let fallbackData;

    if (canUseCompositionEvent) {
      eventType = getCompositionEventType(topLevelType);
    } else if (!isComposing) {
      if (isFallbackCompositionStart(topLevelType, nativeEvent)) {
        eventType = eventTypes.compositionStart;
      }
    } else if (isFallbackCompositionEnd(topLevelType, nativeEvent)) {
      eventType = eventTypes.compositionEnd;
    }

    if (!eventType) {
      return null;
    }

    if (useFallbackCompositionData) {
      // The current composition is stored statically and must not be
      // overwritten while composition continues.
      if (!isComposing && eventType === eventTypes.compositionStart) {
        isComposing = initialize(nativeEventTarget);
      } else if (eventType === eventTypes.compositionEnd) {
        if (isComposing) {
          fallbackData = getData();
        }
      }
    }

    const event = SyntheticCompositionEvent.getPooled(
      eventType,
      targetInst,
      nativeEvent,
      nativeEventTarget,
    );

    if (fallbackData) {
      // Inject data generated from fallback path into the synthetic event.
      // This matches the property of native CompositionEventInterface.
      event.data = fallbackData;
    } else {
      const customData = getDataFromCustomEvent(nativeEvent);

      if (customData !== null) {
        event.data = customData;
      }
    }

    return event;
  }

  /**
   * @param {TopLevelType} topLevelType Number from `TopLevelType`.
   * @param {object} nativeEvent Native browser event.
   * @return {?string} The string corresponding to this `beforeInput` event.
   */

  function getNativeBeforeInputChars(topLevelType, nativeEvent) {
    switch (topLevelType) {
      case TOP_COMPOSITION_END:
        return getDataFromCustomEvent(nativeEvent);
      case TOP_KEY_PRESS:
        /**
         * If native `textInput` events are available, our goal is to make
         * use of them. However, there is a special case: the spacebar key.
         * In Webkit, preventing default on a spacebar `textInput` event
         * cancels character insertion, but it *also* causes the browser
         * to fall back to its default spacebar behavior of scrolling the
         * page.
         *
         * Tracking at:
         * https://code.google.com/p/chromium/issues/detail?id=355103
         *
         * To avoid this issue, use the keypress event as if no `textInput`
         * event is available.
         */
        var which = nativeEvent.which;

        if (which !== SPACEBAR_CODE) {
          return null;
        }

        hasSpaceKeypress = true;

        return SPACEBAR_CHAR;
      case TOP_TEXT_INPUT:
        // Record the characters to be added to the DOM.
        var chars = nativeEvent.data; // If it's a spacebar character, assume that we have already handled
        // it at the keypress level and bail immediately. Android Chrome
        // doesn't give us keycodes, so we need to ignore it.

        if (chars === SPACEBAR_CHAR && hasSpaceKeypress) {
          return null;
        }

        return chars;
      default:
        // For other native event types, do nothing.
        return null;
    }
  }

  /**
   * For browsers that do not provide the `textInput` event, extract the
   * appropriate string to use for SyntheticInputEvent.
   *
   * @param {number} topLevelType Number from `TopLevelEventTypes`.
   * @param {object} nativeEvent Native browser event.
   * @return {?string} The fallback string for this `beforeInput` event.
   */

  function getFallbackBeforeInputChars(topLevelType, nativeEvent) {
    // If we are currently composing (IME) and using a fallback to do so,
    // try to extract the composed characters from the fallback object.
    // If composition event is available, we extract a string only at
    // compositionevent, otherwise extract it at fallback events.
    if (isComposing) {
      if (
        topLevelType === TOP_COMPOSITION_END ||
        (!canUseCompositionEvent &&
          isFallbackCompositionEnd(topLevelType, nativeEvent))
      ) {
        const chars = getData();

        reset();
        isComposing = false;

        return chars;
      }

      return null;
    }

    switch (topLevelType) {
      case TOP_PASTE:
        // If a paste event occurs after a keypress, throw out the input
        // chars. Paste events should not lead to BeforeInput events.
        return null;
      case TOP_KEY_PRESS:
        /**
         * As of v27, Firefox may fire keypress events even when no character
         * will be inserted. A few possibilities:
         *
         * - `which` is `0`. Arrow keys, Esc key, etc.
         *
         * - `which` is the pressed key code, but no char is available.
         *   Ex: 'AltGr + d` in Polish. There is no modified character for
         *   this key combination and no character is inserted into the
         *   document, but FF fires the keypress for char code `100` anyway.
         *   No `input` event will occur.
         *
         * - `which` is the pressed key code, but a command combination is
         *   being used. Ex: `Cmd+C`. No character is inserted, and no
         *   `input` event will occur.
         */
        if (!isKeypressCommand(nativeEvent)) {
          // IE fires the `keypress` event when a user types an emoji via
          // Touch keyboard of Windows.  In such a case, the `char` property
          // holds an emoji character like `\uD83D\uDE0A`.  Because its length
          // is 2, the property `which` does not represent an emoji correctly.
          // In such a case, we directly return the `char` property instead of
          // using `which`.
          if (nativeEvent.char && nativeEvent.char.length > 1) {
            return nativeEvent.char;
          } else if (nativeEvent.which) {
            return String.fromCharCode(nativeEvent.which);
          }
        }

        return null;
      case TOP_COMPOSITION_END:
        return useFallbackCompositionData && !isUsingKoreanIME(nativeEvent)
          ? null
          : nativeEvent.data;
      default:
        return null;
    }
  }

  /**
   * Extract a SyntheticInputEvent for `beforeInput`, based on either native
   * `textInput` or fallback behavior.
   *
   * @return {?object} A SyntheticInputEvent.
   */

  function extractBeforeInputEvent(
    topLevelType,
    targetInst,
    nativeEvent,
    nativeEventTarget,
  ) {
    let chars;

    if (canUseTextInputEvent) {
      chars = getNativeBeforeInputChars(topLevelType, nativeEvent);
    } else {
      chars = getFallbackBeforeInputChars(topLevelType, nativeEvent);
    } // If no characters are being inserted, no BeforeInput event should
    // be fired.

    if (!chars) {
      return null;
    }

    const event = SyntheticInputEvent.getPooled(
      eventTypes.beforeInput,
      targetInst,
      nativeEvent,
      nativeEventTarget,
    );

    event.data = chars;
    accumulateTwoPhaseDispatches(event);

    return event;
  }

  /**
   * Create an `onBeforeInput` event to match
   * http://www.w3.org/TR/2013/WD-DOM-Level-3-Events-20131105/#events-inputevents.
   *
   * This event plugin is based on the native `textInput` event
   * available in Chrome, Safari, Opera, and IE. This event fires after
   * `onKeyPress` and `onCompositionEnd`, but before `onInput`.
   *
   * `beforeInput` is spec'd but not implemented in any browsers, and
   * the `input` event does not provide any useful information about what has
   * actually been added, contrary to the spec. Thus, `textInput` is the best
   * available event to identify the characters that have actually been inserted
   * into the target node.
   *
   * This plugin is also responsible for emitting `composition` events, thus
   * allowing us to share composition fallback code for both `beforeInput` and
   * `composition` event types.
   */

  /**
   * @see http://www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#input-type-attr-summary
   */
  const supportedInputTypes = {
    color: true,
    date: true,
    datetime: true,
    'datetime-local': true,
    email: true,
    month: true,
    number: true,
    password: true,
    range: true,
    search: true,
    tel: true,
    text: true,
    time: true,
    url: true,
    week: true,
  };

  function isTextInputElement(elem) {
    const nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();

    if (nodeName === 'input') {
      return !!supportedInputTypes[elem.type];
    }

    if (nodeName === 'textarea') {
      return true;
    }

    return false;
  }

  const eventTypes$1 = {
    change: {
      phasedRegistrationNames: {
        bubbled: 'onChange',
        captured: 'onChangeCapture',
      },
      dependencies: [
        TOP_BLUR,
        TOP_CHANGE,
        TOP_CLICK,
        TOP_FOCUS,
        TOP_INPUT,
        TOP_KEY_DOWN,
        TOP_KEY_UP,
        TOP_SELECTION_CHANGE,
      ],
    },
  };

  function createAndAccumulateChangeEvent(inst, nativeEvent, target) {
    const event = SyntheticEvent.getPooled(
      eventTypes$1.change,
      inst,
      nativeEvent,
      target,
    );

    event.type = 'change'; // Flag this event loop as needing state restore.

    enqueueStateRestore(target);
    accumulateTwoPhaseDispatches(event);

    return event;
  }

  /**
   * For IE shims
   */

  let activeElement = null;
  let activeElementInst = null;

  /**
   * SECTION: handle `change` event
   */

  function manualDispatchChangeEvent(nativeEvent) {
    const event = createAndAccumulateChangeEvent(
      activeElementInst,
      nativeEvent,
      getEventTarget(nativeEvent),
    ); // If change and propertychange bubbled, we'd just bind to it like all the
    // other events and have it go through ReactBrowserEventEmitter. Since it
    // doesn't, we manually listen for the events and so we have to enqueue and
    // process the abstract event manually.
    //
    // Batching is necessary here in order to ensure that all event handlers run
    // before the next rerender (including event handlers attached to ancestor
    // elements instead of directly on the input). Without this, controlled
    // components don't work properly in conjunction with event bubbling because
    // the component is rerendered and the value reverted before all the event
    // handlers can run. See https://github.com/facebook/react/issues/708.

    batchedUpdates(runEventInBatch, event);
  }

  function runEventInBatch(event) {
    runEventsInBatch(event);
  }

  function getInstIfValueChanged(targetInst) {
    const targetNode = getNodeFromInstance$1(targetInst);

    if (updateValueIfChanged(targetNode)) {
      return targetInst;
    }
  }

  /**
   * SECTION: handle `input` event
   */

  let isInputEventSupported = false;

  if (canUseDOM) {
    // IE9 claims to support the input event but fails to trigger it when
    // deleting text, so we ignore its input events.
    isInputEventSupported =
      isEventSupported('input') &&
      (!document.documentMode || document.documentMode > 9);
  }

  /**
   * (For IE <=9) Starts tracking propertychange events on the passed-in element
   * and override the value property so that we can distinguish user events from
   * value changes in JS.
   */

  function startWatchingForValueChange(target, targetInst) {
    activeElement = target;
    activeElementInst = targetInst;
    activeElement.attachEvent('onpropertychange', handlePropertyChange);
  }

  /**
   * (For IE <=9) Removes the event listeners from the currently-tracked element,
   * if any exists.
   */

  function stopWatchingForValueChange() {
    if (!activeElement) {
      return;
    }

    activeElement.detachEvent('onpropertychange', handlePropertyChange);
    activeElement = null;
    activeElementInst = null;
  }

  /**
   * (For IE <=9) Handles a propertychange event, sending a `change` event if
   * the value of the active element has changed.
   */

  function handlePropertyChange(nativeEvent) {
    if (nativeEvent.propertyName !== 'value') {
      return;
    }

    if (getInstIfValueChanged(activeElementInst)) {
      manualDispatchChangeEvent(nativeEvent);
    }
  }

  function handleEventsForInputEventPolyfill(topLevelType, target, targetInst) {
    if (topLevelType === TOP_FOCUS) {
      // In IE9, propertychange fires for most input events but is buggy and
      // doesn't fire when text is deleted, but conveniently, selectionchange
      // appears to fire in all of the remaining cases so we catch those and
      // forward the event if the value has changed
      // In either case, we don't want to call the event handler if the value
      // is changed from JS so we redefine a setter for `.value` that updates
      // our activeElementValue variable, allowing us to ignore those changes
      //
      // stopWatching() should be a noop here but we call it just in case we
      // missed a blur event somehow.
      stopWatchingForValueChange();
      startWatchingForValueChange(target, targetInst);
    } else if (topLevelType === TOP_BLUR) {
      stopWatchingForValueChange();
    }
  } // For IE8 and IE9.

  function getTargetInstForInputEventPolyfill(topLevelType, targetInst) {
    if (
      topLevelType === TOP_SELECTION_CHANGE ||
      topLevelType === TOP_KEY_UP ||
      topLevelType === TOP_KEY_DOWN
    ) {
      // On the selectionchange event, the target is just document which isn't
      // helpful for us so just check activeElement instead.
      //
      // 99% of the time, keydown and keyup aren't necessary. IE8 fails to fire
      // propertychange on the first input event after setting `value` from a
      // script and fires only keydown, keypress, keyup. Catching keyup usually
      // gets it and catching keydown lets us fire an event for the first
      // keystroke if user does a key repeat (it'll be a little delayed: right
      // before the second keystroke). Other input methods (e.g., paste) seem to
      // fire selectionchange normally.
      return getInstIfValueChanged(activeElementInst);
    }
  }

  /**
   * SECTION: handle `click` event
   */

  function shouldUseClickEvent(elem) {
    // Use the `click` event to detect changes to checkbox and radio inputs.
    // This approach works across all browsers, whereas `change` does not fire
    // until `blur` in IE8.
    const nodeName = elem.nodeName;

    return (
      nodeName &&
      nodeName.toLowerCase() === 'input' &&
      (elem.type === 'checkbox' || elem.type === 'radio')
    );
  }

  function getTargetInstForClickEvent(topLevelType, targetInst) {
    if (topLevelType === TOP_CLICK) {
      return getInstIfValueChanged(targetInst);
    }
  }

  function getTargetInstForInputOrChangeEvent(topLevelType, targetInst) {
    if (topLevelType === TOP_INPUT || topLevelType === TOP_CHANGE) {
      return getInstIfValueChanged(targetInst);
    }
  }

  /**
   * This plugin creates an `onChange` event that normalizes change events
   * across form elements. This event fires at a time when it's possible to
   * change the element's value without seeing a flicker.
   *
   * Supported elements are:
   * - input (see `isTextInputElement`)
   * - textarea
   * - select
   */

  const SyntheticUIEvent = SyntheticEvent.extend({
    view: null,
    detail: null,
  });
  /**
   * Translation from modifier key to the associated property in the event.
   * @see http://www.w3.org/TR/DOM-Level-3-Events/#keys-Modifiers
   */
  const modifierKeyToProp = {
    Alt: 'altKey',
    Control: 'ctrlKey',
    Meta: 'metaKey',
    Shift: 'shiftKey',
  }; // Older browsers (Safari <= 10, iOS Safari <= 10.2) do not support
  // getModifierState. If getModifierState is not supported, we map it to a set of
  // modifier keys exposed by the event. In this case, Lock-keys are not supported.

  function modifierStateGetter(keyArg) {
    const syntheticEvent = this;
    const nativeEvent = syntheticEvent.nativeEvent;

    if (nativeEvent.getModifierState) {
      return nativeEvent.getModifierState(keyArg);
    }

    const keyProp = modifierKeyToProp[keyArg];

    return keyProp ? !!nativeEvent[keyProp] : false;
  }

  function getEventModifierState(nativeEvent) {
    return modifierStateGetter;
  }

  /**
   * @interface MouseEvent
   * @see http://www.w3.org/TR/DOM-Level-3-Events/
   */
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

  function getEventCharCode(nativeEvent) {
    let charCode;
    const keyCode = nativeEvent.keyCode;

    if ('charCode' in nativeEvent) {
      charCode = nativeEvent.charCode; // FF does not set `charCode` for the Enter-key, check against `keyCode`.

      if (charCode === 0 && keyCode === 13) {
        charCode = 13;
      }
    } else {
      // IE8 does not implement `charCode`, but `keyCode` has the correct value.
      charCode = keyCode;
    } // IE and Edge (on Windows) and Chrome / Safari (on Windows and Linux)
    // report Enter as charCode 10 when ctrl is pressed.

    if (charCode === 10) {
      charCode = 13;
    } // Some non-printable keys are reported in `charCode`/`keyCode`, discard them.
    // Must not discard the (non-)printable Enter-key.

    if (charCode >= 32 || charCode === 13) {
      return charCode;
    }

    return 0;
  }

  /**
   * Normalization of deprecated HTML5 `key` values
   * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#Key_names
   */

  const SimpleEventPlugin = {
    // simpleEventPluginEventTypes gets populated from
    // the DOMEventProperties module.
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
  /**
   * Inject modules for resolving DOM hierarchy and plugin ordering.
   */

  injectEventPluginOrder(DOMEventPluginOrder);
  setComponentTree(
    getFiberCurrentPropsFromNode$1,
    getInstanceFromNode$1,
    getNodeFromInstance$1,
  );
  /**
   * Some important event plugins included by default (without having to require
   * them).
   */

  injectEventPluginsByName({
    SimpleEventPlugin: SimpleEventPlugin,
    // EnterLeaveEventPlugin: EnterLeaveEventPlugin,
    // ChangeEventPlugin: ChangeEventPlugin,
    // SelectEventPlugin: SelectEventPlugin,
    // BeforeInputEventPlugin: BeforeInputEventPlugin,
  });

  // Prefix measurements so that it's possible to filter them.
  // Longer prefixes are hard to read in DevTools.
  const reactEmoji = '\u269B';
  const isCommitting = false;
  let effectCountInCurrentCommit = 0;
  // to avoid stretch the commit phase with measurement overhead.
  const labelsInCurrentCommit = new Set();
  const formatMarkName = function (markName) {
    return reactEmoji + ' ' + markName;
  };
  const beginMark = function (markName) {
    performance.mark(formatMarkName(markName));
  };
  const getFiberMarkName = function (label, debugID) {
    return label + ' (#' + debugID + ')';
  };
  const getFiberLabel = function (componentName, isMounted, phase) {
    if (phase === null) {
      // These are composite component total time measurements.
      return componentName + ' [' + (isMounted ? 'update' : 'mount') + ']';
    } else {
      // Composite component methods.
      return componentName + '.' + phase;
    }
  };
  const beginFiberMark = function (fiber, phase) {
    const componentName = getComponentName(fiber.type) || 'Unknown';
    const debugID = fiber._debugID;
    const isMounted = fiber.alternate !== null;
    const label = getFiberLabel(componentName, isMounted, phase);

    if (isCommitting && labelsInCurrentCommit.has(label)) {
      // During the commit phase, we don't show duplicate labels because
      // there is a fixed overhead for every measurement, and we don't
      // want to stretch the commit phase beyond necessary.
      return false;
    }

    labelsInCurrentCommit.add(label);

    const markName = getFiberMarkName(label, debugID);

    beginMark(markName);

    return true;
  };

  var resumeTimersRecursively = function (fiber) {
    if (fiber.return !== null) {
      resumeTimersRecursively(fiber.return);
    }

    if (fiber._debugIsCurrentlyTiming) {
      beginFiberMark(fiber, null);
    }
  };

  function recordEffect() {
    {
      effectCountInCurrentCommit++;
    }
  }

  const valueStack = [];
  const fiberStack = [];
  let index = -1;

  function createCursor(defaultValue) {
    return {
      current: defaultValue,
    };
  }

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

  const LegacyRoot = 0;
  const Scheduler_runWithPriority = unstable_runWithPriority,
    Scheduler_scheduleCallback = unstable_scheduleCallback,
    Scheduler_ImmediatePriority = unstable_ImmediatePriority,
    Scheduler_UserBlockingPriority = unstable_UserBlockingPriority,
    Scheduler_NormalPriority = unstable_NormalPriority,
    Scheduler_LowPriority = unstable_LowPriority,
    Scheduler_IdlePriority = unstable_IdlePriority;
  const fakeCallbackNode = {}; // Except for NoPriority, these correspond to Scheduler priorities. We use
  // ascending numbers so we can compare them like numbers. They start at 90 to
  // avoid clashing with Scheduler's priorities.
  const ImmediatePriority = 99;
  const UserBlockingPriority$1 = 98;
  const NormalPriority = 97;
  const LowPriority = 96;
  const IdlePriority = 95; // NoPriority is the absence of priority. Also React-only.
  const NoPriority = 90;
  let syncQueue = null;
  let immediateQueueCallbackNode = null;
  let isFlushingSyncQueue = false;

  function reactPriorityToSchedulerPriority(reactPriorityLevel) {
    switch (reactPriorityLevel) {
      case ImmediatePriority:
        return Scheduler_ImmediatePriority;
      case UserBlockingPriority$1:
        return Scheduler_UserBlockingPriority;
      case NormalPriority:
        return Scheduler_NormalPriority;
      case LowPriority:
        return Scheduler_LowPriority;
      case IdlePriority:
        return Scheduler_IdlePriority;
      default: {
        {
          throw Error('Unknown priority level.');
        }
      }
    }
  }

  function runWithPriority$1(reactPriorityLevel, fn) {
    const priorityLevel = reactPriorityToSchedulerPriority(reactPriorityLevel);

    return Scheduler_runWithPriority(priorityLevel, fn);
  }

  function scheduleSyncCallback(callback) {
    // Push this callback into an internal queue. We'll flush these either in
    // the next tick, or earlier if something calls `flushSyncCallbackQueue`.
    if (syncQueue === null) {
      syncQueue = [callback]; // Flush the queue in the next tick, at the earliest.

      immediateQueueCallbackNode = Scheduler_scheduleCallback(
        Scheduler_ImmediatePriority,
        flushSyncCallbackQueueImpl,
      );
    } else {
      // Push onto existing queue. Don't need to schedule a callback because
      // we already scheduled one when we created the queue.
      syncQueue.push(callback);
    }

    return fakeCallbackNode;
  }

  function flushSyncCallbackQueue() {
    console.log(['flushSyncCallbackQueue'])

    immediateQueueCallbackNode = null;

    flushSyncCallbackQueueImpl();
  }

  function flushSyncCallbackQueueImpl() {
    if (!isFlushingSyncQueue && syncQueue !== null) {
      // Prevent re-entrancy.
      isFlushingSyncQueue = true;

      let i = 0;

      try {
        const _isSync = true;
        const queue = syncQueue;

        runWithPriority$1(ImmediatePriority, function () {
          for (; i < queue.length; i++) {
            let callback = queue[i];

            do {
              callback = callback(_isSync);
            } while (callback !== null);
          }
        });
        syncQueue = null;
      } catch (error) {
        // If something throws, leave the remaining callbacks on the queue.
        if (syncQueue !== null) {
          syncQueue = syncQueue.slice(i + 1);
        } // Resume flushing in the next tick

        Scheduler_scheduleCallback(
          Scheduler_ImmediatePriority,
          flushSyncCallbackQueue,
        );

        throw error;
      } finally {
        isFlushingSyncQueue = false;
      }
    }
  }

  const StrictMode = 1; // TODO: Remove BlockingMode and ConcurrentMode by reading from the root
  // tag instead
  const BlockingMode = 2;
  // Max 31 bit integer. The max integer size in V8 for 32-bit systems.
  // Math.pow(2, 30) - 1
  // 0b111111111111111111111111111111
  const MAX_SIGNED_31_BIT_INT = 1073741823;
  const NoWork = 0; // TODO: Think of a better name for Never. The key difference with Idle is that
  // Never work can be committed in an inconsistent state without tearing the UI.
  // The main example is offscreen content, like a hidden subtree. So one possible
  // name is Offscreen. However, it also includes dehydrated Suspense boundaries,
  // which are inconsistent in the sense that they haven't finished yet, but
  // aren't visibly inconsistent because the server rendered HTML matches what the
  // hydrated tree would look like.
  const Sync = MAX_SIGNED_31_BIT_INT;

  function resolveDefaultProps(Component, baseProps) {
    if (Component && Component.defaultProps) {
      // Resolve default props. Taken from ReactElement
      const props = _assign({}, baseProps);
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

  const UpdateState = 0;
  const ReplaceState = 1;
  const ForceUpdate = 2;
  const CaptureUpdate = 3; // Global state that is reset at the beginning of calling `processUpdateQueue`.
  // It should only be read right after calling `processUpdateQueue`, via
  // `checkHasForceUpdateAfterProcessing`.
  let hasForceUpdate = false;
  let currentlyProcessingQueue;

  {
    currentlyProcessingQueue = null;
  }

  function initializeUpdateQueue(fiber) {
    const queue = {
      baseState: fiber.memoizedState,
      baseQueue: null,
      shared: {
        pending: null,
      },
      effects: null,
    };

    fiber.updateQueue = queue;
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

  function createUpdate() {
    console.log(['createUpdate']);

    const update = {
      expirationTime: Sync,
      suspenseConfig: null,
      tag: UpdateState,
      payload: null,
      callback: null,
      next: null,
    };

    update.next = update;

    return update;
  }

  function enqueueUpdate(fiber, update) {
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
            if (workInProgress.mode & StrictMode) {
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
            if (workInProgress.mode & StrictMode) {
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

        return _assign({}, prevState, partialState);
      }
      case ForceUpdate: {
        hasForceUpdate = true;

        return prevState;
      }
    }

    return prevState;
  }

  function processUpdateQueue(
    workInProgress,
    props,
    instance,
  ) {
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
      let newExpirationTime = NoWork;
      let newBaseState = null;
      let newBaseQueueFirst = null;
      let newBaseQueueLast = null;

      if (first !== null) {
        let update = first;

        do {
          const updateExpirationTime = update.expirationTime;

          if (updateExpirationTime < Sync) {
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

            if (updateExpirationTime > newExpirationTime) {
              newExpirationTime = updateExpirationTime;
            }
          } else {
            // This update does have sufficient priority.
            if (newBaseQueueLast !== null) {
              const _clone = {
                expirationTime: Sync,
                // This update is going to be committed so we never want uncommit it.
                suspenseConfig: update.suspenseConfig,
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

      workInProgress.expirationTime = newExpirationTime;
      
      workInProgress.memoizedState = newState;
    }

    {
      currentlyProcessingQueue = null;
    }
  }

  const isArray$1 = Array.isArray;

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

    function updateTextNode(returnFiber, current, textContent, expirationTime) {
      if (current === null || current.tag !== HostText) {
        // Insert
        const created = createFiberFromText(
          textContent,
          returnFiber.mode,
          expirationTime,
        );

        
        created.return = returnFiber;

        return created;
      } else {
        // Update
        const existing = useFiber(current, textContent);

        
        existing.return = returnFiber;

        return existing;
      }
    }

    function updateElement(returnFiber, current, element, expirationTime) {
      if (current !== null) {
        if (current.elementType === element.type) {
          // Move based on index
          const existing = useFiber(current, element.props);

          existing.ref = null;
          
          existing.return = returnFiber;

          {
            existing._debugSource = element._source;
            existing._debugOwner = element._owner;
          }

          return existing;
        }
      } // Insert

      const created = createFiberFromElement(
        element,
        returnFiber.mode,
        expirationTime,
      );

      created.ref = null;
      
      created.return = returnFiber;

      return created;
    }

    function updateSlot(returnFiber, oldFiber, newChild, expirationTime) {
      console.log(['updateSlot'], {
        returnFiber,
        oldFiber,
        newChild,
        expirationTime,
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

        return updateTextNode(
          returnFiber,
          oldFiber,
          '' + newChild,
          expirationTime,
        );
      }

      if (typeof newChild === 'object' && newChild !== null) {
        switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE: {
            if (newChild.key === key) {
              return updateElement(
                returnFiber,
                oldFiber,
                newChild,
                expirationTime,
              );
            } else {
              return null;
            }
          }
        }
      }

      return null;
    }

    function updateFromMap(
      existingChildren,
      returnFiber,
      newIdx,
      newChild,
      expirationTime,
    ) {
      console.log(['updateFromMap'], {
        existingChildren,
        returnFiber,
        newIdx,
        newChild,
        expirationTime,
      });

      if (typeof newChild === 'string' || typeof newChild === 'number') {
        // Text nodes don't have keys, so we neither have to check the old nor
        // new node for the key. If both are text nodes, they match.
        const matchedFiber = existingChildren.get(newIdx) || null;

        return updateTextNode(
          returnFiber,
          matchedFiber,
          '' + newChild,
          expirationTime,
        );
      }

      if (typeof newChild === 'object' && newChild !== null) {
        switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE: {
            const _matchedFiber =
              existingChildren.get(
                newChild.key === null ? newIdx : newChild.key,
              ) || null;

            return updateElement(
              returnFiber,
              _matchedFiber,
              newChild,
              expirationTime,
            );
          }
        }
      }

      return null;
    }

    function reconcileChildrenArray(
      returnFiber,
      currentFirstChild,
      newChildren,
      expirationTime,
    ) {
      console.log(['reconcileChildrenArray'], {
        returnFiber,
        currentFirstChild,
        newChildren,
        expirationTime,
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

        const newFiber = updateSlot(
          returnFiber,
          oldFiber,
          newChildren[newIdx],
          expirationTime,
        );

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
          expirationTime,
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

    function reconcileSingleElement(
      returnFiber,
      currentFirstChild,
      element,
      expirationTime,
    ) {
      console.log(['reconcileSingleElement'], {
        returnFiber,
        currentFirstChild,
        element,
        expirationTime,
      });

      const key = element.key;
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

      const _created4 = createFiberFromElement(
        element,
        returnFiber.mode,
        expirationTime,
      );

      _created4.ref = null;
      
      _created4.return = returnFiber;

      return _created4;
    }

    function reconcileChildFibers(
      returnFiber,
      currentFirstChild,
      newChild,
      expirationTime,
    ) {
      console.log(['reconcileChildFibers'], {
        returnFiber,
        currentFirstChild,
        newChild,
        expirationTime,
      });

      const isObject = typeof newChild === 'object' && newChild !== null;

      if (isObject) {
        switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE:
            return placeSingleChild(
              reconcileSingleElement(
                returnFiber,
                currentFirstChild,
                newChild,
                expirationTime,
              ),
            );
        }
      }

      if (isArray$1(newChild)) {
        return reconcileChildrenArray(
          returnFiber,
          currentFirstChild,
          newChild,
          expirationTime,
        );
      }

      return deleteRemainingChildren(returnFiber, currentFirstChild);
    }

    return reconcileChildFibers;
  }

  const reconcileChildFibers = ChildReconciler(true);
  const mountChildFibers = ChildReconciler(false);
  const NO_CONTEXT = {};
  const contextStackCursor$1 = createCursor(NO_CONTEXT);
  const rootInstanceStackCursor = createCursor(NO_CONTEXT);

  function requiredContext(c) {
    return c;
  }

  function getRootHostContainer() {
    return rootInstanceStackCursor.current;
  }

  function pushHostContainer(fiber, nextRootInstance) {
    // Push current root instance onto the stack;
    // This allows us to reset root when portals are popped.
    push(rootInstanceStackCursor, nextRootInstance, fiber); // Track the context and the Fiber that provided it.

    const nextRootContext = getRootHostContext(nextRootInstance); // Now that we know this function doesn't throw, replace it.

    pop(contextStackCursor$1, fiber);
    push(contextStackCursor$1, nextRootContext, fiber);
  }

  const ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
  // These are set right before calling the component.
  let currentlyRenderingFiber$1 = null; // Hooks are stored as a linked list on the fiber's memoizedState field. The
  // current hook list is the list that belongs to the current fiber. The
  // work-in-progress hook list is a new list that will be added to the
  // work-in-progress fiber.
  let currentHook = null;
  let workInProgressHook = null; // Whether an update was scheduled at any point during the render phase. This
  // does not get reset if we do another render pass; only when we're completely
  // finished evaluating this component. This is an optimization so we know
  // whether we need to clear render phase updates after a throw.
  let currentHookNameInDev = null; // In DEV, this list ensures that hooks are called in the same order between renders.
  // The list stores the order of hooks used during the initial render (mount).
  // Subsequent renders (updates) reference this list.
  const ignorePreviousDependencies = false;

  function renderWithHooks(
    current,
    workInProgress,
    Component,
    props,
    secondArg,
  ) {
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
    workInProgress.expirationTime = NoWork; // The following should have already been reset
    // currentHook = null;
    // workInProgressHook = null;
    // didScheduleRenderPhaseUpdate = false;
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

    const children = Component(props, secondArg); // Check if there was a render phase update

    ReactCurrentDispatcher.current = ContextOnlyDispatcher;

    currentlyRenderingFiber$1 = null;
    currentHook = null;
    workInProgressHook = null;

    {
      currentHookNameInDev = null;
    }

    return children;
  }

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

  function basicStateReducer(state, action) {
    return typeof action === 'function' ? action(state) : action;
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

  function updateState() {
    return updateReducer(basicStateReducer);
  }

  function dispatchAction(fiber, queue, action) {
    console.log(['dispatchAction'], { fiber, queue, action });

    const update = {
      expirationTime: Sync,
      suspenseConfig: null,
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

  var ContextOnlyDispatcher = {
    useState: null,
  };
  var HooksDispatcherOnMountInDEV = null;
  var HooksDispatcherOnUpdateInDEV = null;

  const InvalidNestedHooksDispatcherOnMountInDEV = null;
  var InvalidNestedHooksDispatcherOnUpdateInDEV = null;

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
          return updateState();
        } finally {
          ReactCurrentDispatcher.current = prevDispatcher;
        }
      },
    };
  }

  const ReactCurrentOwner$1 = ReactSharedInternals.ReactCurrentOwner;

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
      workInProgress.child = mountChildFibers(
        workInProgress,
        null,
        nextChildren,
        Sync,
      );
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
        Sync,
      );
    }
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
      ReactCurrentOwner$1.current = workInProgress;
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

  function updateHostRoot(current, workInProgress) {
    console.log(['updateHostRoot'], {
      current,
      workInProgress,
    });
    pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);

    const nextProps = workInProgress.pendingProps;

    cloneUpdateQueue(current, workInProgress);
    processUpdateQueue(workInProgress, nextProps, null, Sync);

    const nextState = workInProgress.memoizedState; // Caution: React DevTools currently depends on this property
    // being called "element".
    const nextChildren = nextState.element;

    reconcileChildren(
      current,
      workInProgress,
      nextChildren,
      Sync,
    );

    return workInProgress.child;
  }

  function updateHostComponent(current, workInProgress) {
    console.log(['updateHostComponent'], { current, workInProgress });
    reconcileChildren(
      current,
      workInProgress,
      workInProgress.pendingProps.children,
      Sync,
    );

    return workInProgress.child;
  }

  function mountIndeterminateComponent(
    _current,
    workInProgress,
    Component,
  ) {
    console.log(['mountIndeterminateComponent'], {
      _current,
      workInProgress,
      Component,
    });

    const props = workInProgress.pendingProps;
    let value;

    {
      // setIsRendering(true);
      ReactCurrentOwner$1.current = workInProgress;
      value = renderWithHooks(
        null,
        workInProgress,
        Component,
        props,
        {},
        Sync,
      );
      // setIsRendering(false);
    } // React DevTools reads this flag.

    // workInProgress.effectTag |= PerformedWork;

    // Proceed under the assumption that this is a function component
    workInProgress.tag = FunctionComponent;

    reconcileChildren(null, workInProgress, value, Sync);

    return workInProgress.child;
  }

  function beginWork(current, workInProgress) {
    console.log(['beginWork'], { current, workInProgress })
    switch (workInProgress.tag) {
      case IndeterminateComponent: {
        return mountIndeterminateComponent(
          current,
          workInProgress,
          workInProgress.type,
          Sync,
        );
      }
      case FunctionComponent: {
        console.log(['beginWork.FunctionComponent'])
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
          Sync,
        );
      }
      case HostRoot:
        return updateHostRoot(current, workInProgress, Sync);
      case HostComponent:
        return updateHostComponent(
          current,
          workInProgress,
          Sync,
        );
    }
  }

  function markUpdate(workInProgress) {
    // Tag the fiber with an update effect. This turns a Placement into
    // a PlacementAndUpdate.
    workInProgress.effectTag |= Update;
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

  function commitDetachRef(current) {
    const currentRef = current.ref;

    if (currentRef !== null) {
      if (typeof currentRef === 'function') {
        currentRef(null);
      } else {
        currentRef.current = null;
      }
    }
  } // User-originating errors (lifecycles and refs) should not interrupt
  // deletion, so don't let them throw. Host-originating errors should
  // interrupt deletion, so it's okay

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

  function getHostParentFiber(fiber) {
    let parent = fiber.return;

    while (parent !== null) {
      if (isHostParent(parent)) {
        return parent;
      }

      parent = parent.return;
    }

    {
      {
        throw Error(
          'Expected to find a host parent. This error is likely caused by a bug in React. Please file an issue.',
        );
      }
    }
  }

  function isHostParent(fiber) {
    return fiber.tag === HostComponent || fiber.tag === HostRoot;
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

    if (parentFiber.effectTag & ContentReset) {
      // Reset the text content of the parent before doing any insertions
      resetTextContent(parent); // Clear ContentReset from the effect tag

      parentFiber.effectTag &= ~ContentReset;
    }

    const before = getHostSibling(finishedWork); // We only have the top Fiber that was inserted but we need to recurse down its
    // children to find all the terminal nodes.

    if (isContainer) {
      insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
    } else {
      insertOrAppendPlacementNode(finishedWork, before, parent);
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

    if (isHost || enableFundamentalAPI) {
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

  function insertOrAppendPlacementNode(node, before, parent) {
    const tag = node.tag;
    const isHost = tag === HostComponent || tag === HostText;

    if (isHost || enableFundamentalAPI) {
      const stateNode = isHost ? node.stateNode : node.stateNode.instance;

      if (before) {
        insertBefore(parent, stateNode, before);
      } else {
        appendChild(parent, stateNode);
      }
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

  function commitResetTextContent(current) {
    resetTextContent(current.stateNode);
  }

  const ReactCurrentOwner$2 = ReactSharedInternals.ReactCurrentOwner;
  const NoContext =
    /*                    */
    0;
  let executionContext = NoContext; // The root we're working on
  let workInProgressRoot = null; // The fiber we're working on
  let workInProgress = null; // The expiration time we're rendering
  let renderExpirationTime$1 = NoWork; // Whether to root completed, errored, suspended, etc.
  let nextEffect = null;

  function scheduleUpdateOnFiber(fiber) {
    console.log(['scheduleUpdateOnFiber'], { fiber });

    const root = markUpdateTimeFromFiberToRoot(fiber);

    if (root === null) {
      return;
    }

    ensureRootIsScheduled(root);

    console.log(['executionContext === NoContext'], executionContext === NoContext)

    flushSyncCallbackQueue();
  }

  var scheduleWork = scheduleUpdateOnFiber; // This is split into a separate function so we can mark a fiber with pending
  // work without treating it as a typical update that originates from an event;
  // e.g. retrying a Suspense boundary isn't an update, but it does schedule work
  // on a fiber.

  function markUpdateTimeFromFiberToRoot(fiber) {
    // Update the source fiber's expiration time
    fiber.expirationTime = Sync;

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

  function ensureRootIsScheduled(root) {
    console.log(['ensureRootIsScheduled'], { root });

    root.callbackPriority = ImmediatePriority;

    let callbackNode;

    callbackNode = scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));

    root.callbackNode = callbackNode;
  } // This is the entry point for every concurrent task, i.e. anything that
  // goes through Scheduler.

  function performSyncWorkOnRoot(root) {
    console.log(['performSyncWorkOnRoot'], root);

    // Check if there's expired work on this root. Otherwise, render at Sync.
    if (
      root !== workInProgressRoot
    ) {
      prepareFreshStack(root);
    } // If we have a work-in-progress fiber, it means there's still work to do
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

  function finishSyncRender(root) {
    // Set this to null to indicate there's no in-progress render.
    workInProgressRoot = null;
    commitRoot(root);
  }

  function prepareFreshStack(root) {
    console.log(['prepareFreshStack'], { root });
    root.finishedWork = null;

    workInProgressRoot = root;
    workInProgress = createWorkInProgress(root.current, null);
  }

  function workLoopSync() {
    // Already timed out, so perform work without checking if we need to yield.
    while (workInProgress !== null) {
      const work = performUnitOfWork(workInProgress);
      workInProgress = work;
    }
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


    if (next === null) {
      // If this doesn't spawn new work, complete the current work.
      next = completeUnitOfWork(unitOfWork);
    }

    ReactCurrentOwner$2.current = null;

    return next;
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

      workInProgress.childExpirationTime = NoWork;

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

  function commitRoot(root) {
    console.log(['commitRootImpl']);

    const finishedWork = root.finishedWork;

    if (finishedWork === null) {
      return null;
    }

    root.finishedWork = null;
    root.callbackNode = null;
    root.callbackPriority = NoPriority;
    root.nextKnownPendingLevel = NoWork;

    if (root === workInProgressRoot) {
      // We can reset these now that they are finished.
      workInProgressRoot = null;
      workInProgress = null;
      renderExpirationTime$1 = NoWork;
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

    ReactCurrentOwner$2.current = null; // The commit phase is broken into several sub-phases. We do a separate pass
    // of the effect list for each phase: all mutation effects come before all
    // layout effects, and so on.
    // The first phase a "before mutation" phase. We use this phase to read the
    // state of the host tree right before we mutate it. This is where
    // getSnapshotBeforeUpdate is called.

    prepareForCommit(root.containerInfo);
    nextEffect = firstEffect;

    nextEffect = firstEffect;

    do {
      commitMutationEffects(root);
    } while (nextEffect !== null);

    resetAfterCommit(root.containerInfo); // The work-in-progress tree is now the current tree. This must come after
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

  function FiberNode(tag, pendingProps, key, mode) {
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
    this.ref = null;
    this.pendingProps = pendingProps;
    this.memoizedProps = null;
    this.updateQueue = null;
    this.memoizedState = null;
    this.dependencies = null;
    this.mode = mode; // Effects

    this.effectTag = NoEffect;
    this.nextEffect = null;
    this.firstEffect = null;
    this.lastEffect = null;
    this.expirationTime = Sync;
    this.alternate = null;
  }

  const createFiber = function (tag, pendingProps, key, mode) {
    return new FiberNode(tag, pendingProps, key, mode);
  };

  function createWorkInProgress(current, pendingProps) {
    console.log(['createWorkInProgress'], { current, pendingProps });

    let workInProgress = current.alternate;

    if (workInProgress === null) {
      // We use a double buffering pooling technique because we know that we'll
      // only ever need at most two versions of a tree. We pool the "other" unused
      // node that we're free to reuse. This is lazily created to avoid allocating
      // extra objects for things that are never updated. It also allow us to
      // reclaim the extra memory if needed.
      workInProgress = createFiber(
        current.tag,
        pendingProps,
        current.key,
        current.mode,
      );
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

    workInProgress.childExpirationTime = Sync;
    workInProgress.expirationTime = Sync;
    workInProgress.child = current.child;
    workInProgress.memoizedProps = current.memoizedProps;
    
    workInProgress.memoizedState = current.memoizedState;
    workInProgress.updateQueue = current.updateQueue;
    workInProgress.sibling = current.sibling;
    workInProgress.index = current.index;
    workInProgress.ref = current.ref;

    return workInProgress;
  } // Used to reuse a Fiber for a second pass.

  function createHostRootFiber() {
    return createFiber(HostRoot, null, null, BlockingMode);
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
    fiber.expirationTime = Sync;

    return fiber;
  }

  function createFiberFromElement(element, mode, expirationTime) {
    console.log(['createFiberFromElement'], { element, mode, expirationTime });

    const type = element.type;
    const key = element.key;
    const pendingProps = element.props;

    return createFiberFromTypeAndProps(type, key, pendingProps, null, mode);

    return fiber;
  }

  function createFiberFromText(content, mode, expirationTime) {
    const fiber = createFiber(HostText, content, null, mode);

    fiber.expirationTime = expirationTime;

    return fiber;
  }

  function FiberRootNode(containerInfo, tag) {
    console.log(['FiberRootNode'], { containerInfo, tag });
    this.tag = LegacyRoot;
    this.current = null;
    this.containerInfo = containerInfo;
    this.finishedExpirationTime = NoWork;
    this.finishedWork = null;
    this.context = null;
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

  function updateContainer(element, container, parentComponent) {
    console.log(['updateContainer'], { element, container, parentComponent });

    const current$1 = container.current;
    const update = createUpdate(); // Caution: React DevTools currently depends on this property
    // being called "element".

    update.payload = {
      element: element,
    };

    enqueueUpdate(current$1, update);
    scheduleWork(current$1);

    return Sync;
  }

  function render(element, container) {
    console.log(['render'], element, container);

    const fiberRoot = createFiberRoot(container);

    updateContainer(element, fiberRoot, null);

    return null;
  }

  exports.render = render;
});
