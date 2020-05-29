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

  /**
   * Same as invokeGuardedCallback, but instead of returning an error, it stores
   * it in a global so it can be rethrown by `rethrowCaughtError` later.
   * TODO: See if caughtError and rethrowError can be unified.
   *
   * @param {String} name of the guard to use for logging or debugging
   * @param {Function} func The function to invoke
   * @param {*} context The context to use when calling the function
   * @param {...*} args Arguments for function
   */

  function invokeGuardedCallbackAndCatchFirstError(
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
    invokeGuardedCallback.apply(this, arguments);

    if (hasError) {
      const error = clearCaughtError();

      if (!hasRethrowError) {
        hasRethrowError = true;
        rethrowError = error;
      }
    }
  }

  /**
   * During execution of guarded functions we will capture the first error which
   * we will rethrow to be handled by the top level error handler.
   */

  function rethrowCaughtError() {
    if (hasRethrowError) {
      const error = rethrowError;

      hasRethrowError = false;
      rethrowError = null;

      throw error;
    }
  }

  function clearCaughtError() {
    if (hasError) {
      const error = caughtError;

      hasError = false;
      caughtError = null;

      return error;
    } else {
      {
        {
          throw Error(
            'clearCaughtError was called but no error was captured. This error is likely caused by a bug in React. Please file an issue.',
          );
        }
      }
    }
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

    {
      if (!getNodeFromInstance || !getInstanceFromNode) {
        error(
          'EventPluginUtils.setComponentTree(...): Injected ' +
            'module is missing getNodeFromInstance or getInstanceFromNode.',
        );
      }
    }
  }

  let validateEventDispatches;

  {
    validateEventDispatches = function (event) {
      const dispatchListeners = event._dispatchListeners;
      const dispatchInstances = event._dispatchInstances;
    };
  }

  /**
   * Dispatch the event to the listener.
   * @param {SyntheticEvent} event SyntheticEvent to handle
   * @param {function} listener Application-level callback
   * @param {*} inst Internal component instance
   */

  function executeDispatch(event, listener, inst) {
    const type = event.type || 'unknown-event';

    event.currentTarget = getNodeFromInstance(inst);
    invokeGuardedCallbackAndCatchFirstError(type, listener, undefined, event);
    event.currentTarget = null;
  }

  /**
   * Standard/simple iteration through an event's collected dispatches.
   */

  function executeDispatchesInOrder(event) {
    const dispatchListeners = event._dispatchListeners;
    const dispatchInstances = event._dispatchInstances;

    {
      validateEventDispatches(event);
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
  const Block = 22;
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
    if (!eventPluginOrder) {
      // Wait until an `eventPluginOrder` is injected.
      return;
    }

    for (const pluginName in namesToPlugins) {
      const pluginModule = namesToPlugins[pluginName];
      const pluginIndex = eventPluginOrder.indexOf(pluginName);

      if (!(pluginIndex > -1)) {
        {
          throw Error(
            'EventPluginRegistry: Cannot inject event plugins that do not exist in the plugin ordering, `' +
              pluginName +
              '`.',
          );
        }
      }

      if (plugins[pluginIndex]) {
        continue;
      }

      if (!pluginModule.extractEvents) {
        {
          throw Error(
            'EventPluginRegistry: Event plugins must implement an `extractEvents` method, but `' +
              pluginName +
              '` does not.',
          );
        }
      }

      plugins[pluginIndex] = pluginModule;

      const publishedEvents = pluginModule.eventTypes;

      for (const eventName in publishedEvents) {
        if (
          !publishEventForPlugin(
            publishedEvents[eventName],
            pluginModule,
            eventName,
          )
        ) {
          {
            throw Error(
              'EventPluginRegistry: Failed to publish event `' +
                eventName +
                '` for plugin `' +
                pluginName +
                '`.',
            );
          }
        }
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
    if (!!registrationNameModules[registrationName]) {
      {
        throw Error(
          'EventPluginRegistry: More than one plugin attempted to publish the same registration name, `' +
            registrationName +
            '`.',
        );
      }
    }

    registrationNameModules[registrationName] = pluginModule;
    registrationNameDependencies[registrationName] =
      pluginModule.eventTypes[eventName].dependencies;

    {
      const lowerCasedName = registrationName.toLowerCase();

      possibleRegistrationNames[lowerCasedName] = registrationName;

      if (registrationName === 'onDoubleClick') {
        possibleRegistrationNames.ondblclick = registrationName;
      }
    }
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

  var possibleRegistrationNames = {}; // Trust the developer to only use possibleRegistrationNames in true

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
  const IS_REPLAYED = 1 << 5;
  const IS_FIRST_ANCESTOR = 1 << 6;
  const restoreImpl = null;
  let restoreTarget = null;
  let restoreQueue = null;

  function restoreStateOfTarget(target) {
    // We perform this translation at the end of the event loop so that we
    // always receive the correct fiber here
    const internalInstance = getInstanceFromNode(target);

    if (!internalInstance) {
      // Unmounted
      return;
    }

    if (!(typeof restoreImpl === 'function')) {
      {
        throw Error(
          'setRestoreImplementation() needs to be called to handle a target for controlled events. This error is likely caused by a bug in React. Please file an issue.',
        );
      }
    }

    const stateNode = internalInstance.stateNode; // Guard against Fiber being unmounted.

    if (stateNode) {
      const _props = getFiberCurrentPropsFromNode(stateNode);

      restoreImpl(internalInstance.stateNode, internalInstance.type, _props);
    }
  }

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

  function needsStateRestore() {
    return restoreTarget !== null || restoreQueue !== null;
  }

  function restoreStateIfNeeded() {
    if (!restoreTarget) {
      return;
    }

    const target = restoreTarget;
    const queuedTargets = restoreQueue;

    restoreTarget = null;
    restoreQueue = null;
    restoreStateOfTarget(target);

    if (queuedTargets) {
      for (let i = 0; i < queuedTargets.length; i++) {
        restoreStateOfTarget(queuedTargets[i]);
      }
    }
  }

  const enableDeprecatedFlareAPI = false; // Experimental Host Component support.
  const enableFundamentalAPI = false; // Experimental Scope support.

  // the renderer. Such as when we're dispatching events or if third party
  // libraries need to call batchedUpdates. Eventually, this API will go away when
  // everything is batched by default. We'll then have a similar API to opt-out of
  // scheduled work and instead do synchronous work.
  // Defaults

  const batchedUpdatesImpl = function (fn, bookkeeping) {
    return fn(bookkeeping);
  };
  const discreteUpdatesImpl = function (fn, a, b, c, d) {
    return fn(a, b, c, d);
  };
  const flushDiscreteUpdatesImpl = function () {};
  const batchedEventUpdatesImpl = batchedUpdatesImpl;
  let isInsideEventHandler = false;
  let isBatchingEventUpdates = false;

  function finishEventHandler() {
    // Here we wait until all updates have propagated, which is important
    // when using controlled components within layers:
    // https://github.com/facebook/react/issues/1698
    // Then we restore state of any controlled component.
    const controlledComponentsHavePendingUpdates = needsStateRestore();

    if (controlledComponentsHavePendingUpdates) {
      // If a controlled event was fired, we may need to restore the state of
      // the DOM node back to the controlled value. This is necessary when React
      // bails out of the update without touching the DOM.
      flushDiscreteUpdatesImpl();
      restoreStateIfNeeded();
    }
  }

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
      finishEventHandler();
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
      finishEventHandler();
    }
  } // This is for the React Flare event system

  function discreteUpdates(fn, a, b, c, d) {
    const prevIsInsideEventHandler = isInsideEventHandler;

    isInsideEventHandler = true;

    try {
      return discreteUpdatesImpl(fn, a, b, c, d);
    } finally {
      isInsideEventHandler = prevIsInsideEventHandler;

      if (!isInsideEventHandler) {
        finishEventHandler();
      }
    }
  }

  function flushDiscreteUpdatesIfNeeded(timeStamp) {
    // event.timeStamp isn't overly reliable due to inconsistencies in
    // how different browsers have historically provided the time stamp.
    // Some browsers provide high-resolution time stamps for all events,
    // some provide low-resolution time stamps for all events. FF < 52
    // even mixes both time stamps together. Some browsers even report
    // negative time stamps or time stamps that are 0 (iOS9) in some cases.
    // Given we are only comparing two time stamps with equality (!==),
    // we are safe from the resolution differences. If the time stamp is 0
    // we bail-out of preventing the flush, which can affect semantics,
    // such as if an earlier flush removes or adds event listeners that
    // are fired in the subsequent flush. However, this is the same
    // behaviour as we had before this change, so the risks are low.
    if (!isInsideEventHandler && !enableDeprecatedFlareAPI) {
      flushDiscreteUpdatesImpl();
    }
  }

  const DiscreteEvent = 0;
  const UserBlockingEvent = 1;
  const ContinuousEvent = 2;
  const ReactInternals$1 =
    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  const _ReactInternals$Sched = ReactInternals$1.Scheduler,
    unstable_cancelCallback = _ReactInternals$Sched.unstable_cancelCallback,
    unstable_now = _ReactInternals$Sched.unstable_now,
    unstable_scheduleCallback = _ReactInternals$Sched.unstable_scheduleCallback,
    unstable_shouldYield = _ReactInternals$Sched.unstable_shouldYield,
    unstable_requestPaint = _ReactInternals$Sched.unstable_requestPaint,
    unstable_getFirstCallbackNode =
      _ReactInternals$Sched.unstable_getFirstCallbackNode,
    unstable_runWithPriority = _ReactInternals$Sched.unstable_runWithPriority,
    unstable_next = _ReactInternals$Sched.unstable_next,
    unstable_continueExecution =
      _ReactInternals$Sched.unstable_continueExecution,
    unstable_pauseExecution = _ReactInternals$Sched.unstable_pauseExecution,
    unstable_getCurrentPriorityLevel =
      _ReactInternals$Sched.unstable_getCurrentPriorityLevel,
    unstable_ImmediatePriority =
      _ReactInternals$Sched.unstable_ImmediatePriority,
    unstable_UserBlockingPriority =
      _ReactInternals$Sched.unstable_UserBlockingPriority,
    unstable_NormalPriority = _ReactInternals$Sched.unstable_NormalPriority,
    unstable_LowPriority = _ReactInternals$Sched.unstable_LowPriority,
    unstable_IdlePriority = _ReactInternals$Sched.unstable_IdlePriority,
    unstable_forceFrameRate = _ReactInternals$Sched.unstable_forceFrameRate,
    unstable_flushAllWithoutAsserting =
      _ReactInternals$Sched.unstable_flushAllWithoutAsserting;
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
  /* eslint-disable max-len */
  const ATTRIBUTE_NAME_START_CHAR =
    ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD';
  /* eslint-enable max-len */
  const ATTRIBUTE_NAME_CHAR =
    ATTRIBUTE_NAME_START_CHAR + '\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040';
  const VALID_ATTRIBUTE_NAME_REGEX = new RegExp(
    '^[' + ATTRIBUTE_NAME_START_CHAR + '][' + ATTRIBUTE_NAME_CHAR + ']*$',
  );
  const hasOwnProperty = Object.prototype.hasOwnProperty;
  const illegalAttributeNameCache = {};
  const validatedAttributeNameCache = {};

  function isAttributeNameSafe(attributeName) {
    if (hasOwnProperty.call(validatedAttributeNameCache, attributeName)) {
      return true;
    }

    if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) {
      return false;
    }

    if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) {
      validatedAttributeNameCache[attributeName] = true;

      return true;
    }

    illegalAttributeNameCache[attributeName] = true;

    {
      error('Invalid attribute name: `%s`', attributeName);
    }

    return false;
  }

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

  function shouldRemoveAttributeWithWarning(
    name,
    value,
    propertyInfo,
    isCustomComponentTag,
  ) {
    if (propertyInfo !== null && propertyInfo.type === RESERVED) {
      return false;
    }

    switch (typeof value) {
      case 'function': // $FlowIssue symbol is perfectly valid here
      case 'symbol':
        // eslint-disable-line
        return true;
      case 'boolean': {
        if (isCustomComponentTag) {
          return false;
        }

        if (propertyInfo !== null) {
          return !propertyInfo.acceptsBooleans;
        } else {
          const prefix = name.toLowerCase().slice(0, 5);

          return prefix !== 'data-' && prefix !== 'aria-';
        }
      }
      default:
        return false;
    }
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

    if (
      shouldRemoveAttributeWithWarning(
        name,
        value,
        propertyInfo,
        isCustomComponentTag,
      )
    ) {
      return true;
    }

    if (isCustomComponentTag) {
      return false;
    }

    if (propertyInfo !== null) {
      switch (propertyInfo.type) {
        case BOOLEAN:
          return !value;
        case OVERLOADED_BOOLEAN:
          return value === false;
        case NUMERIC:
          return isNaN(value);
        case POSITIVE_NUMERIC:
          return isNaN(value) || value < 1;
      }
    }

    return false;
  }

  function getPropertyInfo(name) {
    return properties.hasOwnProperty(name) ? properties[name] : null;
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
    const propertyInfo = getPropertyInfo(name);

    if (shouldIgnoreAttribute(name, propertyInfo, isCustomComponentTag)) {
      return;
    }

    if (
      shouldRemoveAttribute(name, value, propertyInfo, isCustomComponentTag)
    ) {
      value = null;
    } // If the prop isn't in the special list, treat it as a simple attribute.

    if (isCustomComponentTag || propertyInfo === null) {
      if (isAttributeNameSafe(name)) {
        const _attributeName = name;

        if (value === null) {
          node.removeAttribute(_attributeName);
        } else {
          node.setAttribute(_attributeName, '' + value);
        }
      }

      return;
    }

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

  const BEFORE_SLASH_RE = /^(.*)[\\\/]/;

  function describeComponentFrame(name, source, ownerName) {
    let sourceInfo = '';

    if (source) {
      const path = source.fileName;
      let fileName = path.replace(BEFORE_SLASH_RE, '');

      {
        // In DEV, include code for a common special case:
        // prefer "folder/index.js" instead of just "index.js".
        if (/^index\./.test(fileName)) {
          const match = path.match(BEFORE_SLASH_RE);

          if (match) {
            const pathBeforeSlash = match[1];

            if (pathBeforeSlash) {
              const folderName = pathBeforeSlash.replace(BEFORE_SLASH_RE, '');

              fileName = folderName + '/' + fileName;
            }
          }
        }
      }

      sourceInfo = ' (at ' + fileName + ':' + source.lineNumber + ')';
    } else if (ownerName) {
      sourceInfo = ' (created by ' + ownerName + ')';
    }

    return '\n    in ' + (name || 'Unknown') + sourceInfo;
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

  function describeFiber(fiber) {
    switch (fiber.tag) {
      case HostRoot:
      case HostText:
        return '';
      default:
        var owner = fiber._debugOwner;
        var source = fiber._debugSource;
        var name = getComponentName(fiber.type);
        var ownerName = null;

        if (owner) {
          ownerName = getComponentName(owner.type);
        }

        return describeComponentFrame(name, source, ownerName);
    }
  }

  function getStackByFiberInDevAndProd(workInProgress) {
    let info = '';
    let node = workInProgress;

    do {
      info += describeFiber(node);
      node = node.return;
    } while (node);

    return info;
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

  function setIsRendering(rendering) {
    {
      isRendering = rendering;
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

  const printWarning$1 = function () {};

  /**
   * Assert that the values match with the type specs.
   * Error messages are memorized and will only be shown once.
   *
   * @param {object} typeSpecs Map of name to a ReactPropType
   * @param {object} values Runtime values that need to be type-checked
   * @param {string} location e.g. "prop", "context", "child context"
   * @param {string} componentName Name of the component for error messages.
   * @param {?Function} getStack Returns the component stack.
   * @private
   */
  function checkPropTypes(
    typeSpecs,
    values,
    location,
    componentName,
    getStack,
  ) {
    {
      for (const typeSpecName in typeSpecs) {
        if (has(typeSpecs, typeSpecName)) {
          var error;
          // Prop type validation may throw. In case they do, we don't want to
          // fail the render phase where it didn't fail before. So we log it.
          // After these have been cleaned up, we'll let them throw.
          try {
            // This is intentionally an invariant that gets caught. It's the same
            // behavior as without this statement except with a better message.
            if (typeof typeSpecs[typeSpecName] !== 'function') {
              const err = Error(
                (componentName || 'React class') +
                  ': ' +
                  location +
                  ' type `' +
                  typeSpecName +
                  '` is invalid; ' +
                  'it must be a function, usually from the `prop-types` package, but received `' +
                  typeof typeSpecs[typeSpecName] +
                  '`.',
              );

              err.name = 'Invariant Violation';

              throw err;
            }

            error = typeSpecs[typeSpecName](
              values,
              typeSpecName,
              componentName,
              location,
              null,
              ReactPropTypesSecret$1,
            );
          } catch (ex) {
            error = ex;
          }

          if (error && !(error instanceof Error)) {
            printWarning$1(
              (componentName || 'React class') +
                ': type specification of ' +
                location +
                ' `' +
                typeSpecName +
                '` is invalid; the type checker ' +
                'function must return `null` or an `Error` but returned a ' +
                typeof error +
                '. ' +
                'You may have forgotten to pass an argument to the type checker ' +
                'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' +
                'shape all require an argument).',
            );
          }

          if (
            error instanceof Error &&
            !(error.message in loggedTypeFailures)
          ) {
            // Only monitor this failure once because there tends to be a lot of the
            // same error.
            loggedTypeFailures[error.message] = true;

            const stack = getStack ? getStack() : '';

            printWarning$1(
              'Failed ' +
                location +
                ' type: ' +
                error.message +
                (stack != null ? stack : ''),
            );
          }
        }
      }
    }
  }

  /**
   * Resets warning cache when testing.
   *
   * @private
   */
  checkPropTypes.resetWarningCache = function () {
    {
      loggedTypeFailures = {};
    }
  };

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

    if (isCheckable(node)) {
      value = node.checked ? 'true' : 'false';
    } else {
      value = node.value;
    }

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
  let didWarnControlledToUncontrolled = false;
  let didWarnUncontrolledToControlled = false;

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

  function updateChecked(element, props) {
    const node = element;
    const checked = props.checked;

    if (checked != null) {
      setValueForProperty(node, 'checked', checked, false);
    }
  }

  function updateWrapper(element, props) {
    const node = element;

    {
      const controlled = isControlled(props);

      if (
        !node._wrapperState.controlled &&
        controlled &&
        !didWarnUncontrolledToControlled
      ) {
        error(
          'A component is changing an uncontrolled input of type %s to be controlled. ' +
            'Input elements should not switch from uncontrolled to controlled (or vice versa). ' +
            'Decide between using a controlled or uncontrolled input ' +
            'element for the lifetime of the component. More info: https://fb.me/react-controlled-components',
          props.type,
        );

        didWarnUncontrolledToControlled = true;
      }

      if (
        node._wrapperState.controlled &&
        !controlled &&
        !didWarnControlledToUncontrolled
      ) {
        error(
          'A component is changing a controlled input of type %s to be uncontrolled. ' +
            'Input elements should not switch from controlled to uncontrolled (or vice versa). ' +
            'Decide between using a controlled or uncontrolled input ' +
            'element for the lifetime of the component. More info: https://fb.me/react-controlled-components',
          props.type,
        );

        didWarnControlledToUncontrolled = true;
      }
    }

    updateChecked(element, props);

    const value = getToStringValue(props.value);
    const type = props.type;

    if (value != null) {
      if (type === 'number') {
        if (
          (value === 0 && node.value === '') || // We explicitly want to coerce to number here if possible.
          // eslint-disable-next-line
          node.value != value) {
          node.value = toString(value);
        }
      } else if (node.value !== toString(value)) {
        node.value = toString(value);
      }
    } else if (type === 'submit' || type === 'reset') {
      // Submit/reset inputs need the attribute removed completely to avoid
      // blank-text buttons.
      node.removeAttribute('value');

      return;
    }

    {
      // When syncing the value attribute, the value comes from a cascade of
      // properties:
      //  1. The value React property
      //  2. The defaultValue React property
      //  3. Otherwise there should be no change
      if (props.hasOwnProperty('value')) {
        setDefaultValue(node, props.type, value);
      } else if (props.hasOwnProperty('defaultValue')) {
        setDefaultValue(node, props.type, getToStringValue(props.defaultValue));
      }
    }

    {
      // When syncing the checked attribute, it only changes when it needs
      // to be removed, such as transitioning from a checkbox into a text input
      if (props.checked == null && props.defaultChecked != null) {
        node.defaultChecked = !!props.defaultChecked;
      }
    }
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

  let didWarnSelectedSetOnOption = false;
  let didWarnInvalidChild = false;

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

  function validateProps(element, props) {
    {
      // This mirrors the codepath above, but runs for hydration too.
      // Warn about invalid children here so that client and hydration are consistent.
      // TODO: this seems like it could cause a DEV-only throw for hydration
      // if children contains a non-element object. We should try to avoid that.
      if (typeof props.children === 'object' && props.children !== null) {
        React.Children.forEach(props.children, function (child) {
          if (child == null) {
            return;
          }

          if (typeof child === 'string' || typeof child === 'number') {
            return;
          }

          if (typeof child.type !== 'string') {
            return;
          }

          if (!didWarnInvalidChild) {
            didWarnInvalidChild = true;

            error(
              'Only strings and numbers are supported as <option> children.',
            );
          }
        });
      } // TODO: Remove support for `selected` in <option>.

      if (props.selected != null && !didWarnSelectedSetOnOption) {
        error(
          'Use the `defaultValue` or `value` props on <select> instead of ' +
            'setting `selected` on <option>.',
        );

        didWarnSelectedSetOnOption = true;
      }
    }
  }

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

  let didWarnValueDefaultValue$1;

  function getDeclarationErrorAddendum() {
    const ownerName = getCurrentFiberOwnerNameInDevOrNull();

    if (ownerName) {
      return '\n\nCheck the render method of `' + ownerName + '`.';
    }

    return '';
  }

  const valuePropNames = ['value', 'defaultValue'];

  /**
   * Validation function for `value` and `defaultValue`.
   */

  function checkSelectPropTypes(props) {
    {
      ReactControlledValuePropTypes.checkPropTypes('select', props);

      for (let i = 0; i < valuePropNames.length; i++) {
        const propName = valuePropNames[i];

        if (props[propName] == null) {
          continue;
        }

        const isArray = Array.isArray(props[propName]);

        if (props.multiple && !isArray) {
          error(
            'The `%s` prop supplied to <select> must be an array if ' +
              '`multiple` is true.%s',
            propName,
            getDeclarationErrorAddendum(),
          );
        } else if (!props.multiple && isArray) {
          error(
            'The `%s` prop supplied to <select> must be a scalar ' +
              'value if `multiple` is false.%s',
            propName,
            getDeclarationErrorAddendum(),
          );
        }
      }
    }
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

  function initWrapperState$1(element, props) {
    const node = element;

    {
      checkSelectPropTypes(props);
    }

    node._wrapperState = {
      wasMultiple: !!props.multiple,
    };

    {
      if (
        props.value !== undefined &&
        props.defaultValue !== undefined &&
        !didWarnValueDefaultValue$1
      ) {
        error(
          'Select elements must be either controlled or uncontrolled ' +
            '(specify either the value prop, or the defaultValue prop, but not ' +
            'both). Decide between using a controlled or uncontrolled select ' +
            'element and remove one of these props. More info: ' +
            'https://fb.me/react-controlled-components',
        );

        didWarnValueDefaultValue$1 = true;
      }
    }
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

  function postUpdateWrapper(element, props) {
    const node = element;
    const wasMultiple = node._wrapperState.wasMultiple;

    node._wrapperState.wasMultiple = !!props.multiple;

    const value = props.value;

    if (value != null) {
      updateOptions(node, !!props.multiple, value, false);
    } else if (wasMultiple !== !!props.multiple) {
      // For simplicity, reapply `defaultValue` if `multiple` is toggled.
      if (props.defaultValue != null) {
        updateOptions(node, !!props.multiple, props.defaultValue, true);
      } else {
        // Revert the select back to its default unselected state.
        updateOptions(node, !!props.multiple, props.multiple ? [] : '', false);
      }
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

  function updateWrapper$1(element, props) {
    const node = element;
    const value = getToStringValue(props.value);
    const defaultValue = getToStringValue(props.defaultValue);

    if (value != null) {
      // Cast `value` to a string to ensure the value is set correctly. While
      // browsers typically do this as necessary, jsdom doesn't.
      const newValue = toString(value); // To avoid side effects (such as losing text selection), only set value if changed

      if (newValue !== node.value) {
        node.value = newValue;
      }

      if (props.defaultValue == null && node.defaultValue !== newValue) {
        node.defaultValue = newValue;
      }
    }

    if (defaultValue != null) {
      node.defaultValue = toString(defaultValue);
    }
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
  const TOP_ANIMATION_END = unsafeCastStringToDOMTopLevelType(
    getVendorPrefixedEventName('animationend'),
  );
  const TOP_ANIMATION_ITERATION = unsafeCastStringToDOMTopLevelType(
    getVendorPrefixedEventName('animationiteration'),
  );
  const TOP_ANIMATION_START = unsafeCastStringToDOMTopLevelType(
    getVendorPrefixedEventName('animationstart'),
  );
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
  const TOP_DRAG = unsafeCastStringToDOMTopLevelType('drag');
  const TOP_DRAG_END = unsafeCastStringToDOMTopLevelType('dragend');
  const TOP_DRAG_ENTER = unsafeCastStringToDOMTopLevelType('dragenter');
  const TOP_DRAG_EXIT = unsafeCastStringToDOMTopLevelType('dragexit');
  const TOP_DRAG_LEAVE = unsafeCastStringToDOMTopLevelType('dragleave');
  const TOP_DRAG_OVER = unsafeCastStringToDOMTopLevelType('dragover');
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
  const TOP_MOUSE_MOVE = unsafeCastStringToDOMTopLevelType('mousemove');
  const TOP_MOUSE_OUT = unsafeCastStringToDOMTopLevelType('mouseout');
  const TOP_MOUSE_OVER = unsafeCastStringToDOMTopLevelType('mouseover');
  const TOP_MOUSE_UP = unsafeCastStringToDOMTopLevelType('mouseup');
  const TOP_PASTE = unsafeCastStringToDOMTopLevelType('paste');
  const TOP_PAUSE = unsafeCastStringToDOMTopLevelType('pause');
  const TOP_PLAY = unsafeCastStringToDOMTopLevelType('play');
  const TOP_PLAYING = unsafeCastStringToDOMTopLevelType('playing');
  const TOP_POINTER_CANCEL = unsafeCastStringToDOMTopLevelType('pointercancel');
  const TOP_POINTER_DOWN = unsafeCastStringToDOMTopLevelType('pointerdown');
  const TOP_POINTER_MOVE = unsafeCastStringToDOMTopLevelType('pointermove');
  const TOP_POINTER_OUT = unsafeCastStringToDOMTopLevelType('pointerout');
  const TOP_POINTER_OVER = unsafeCastStringToDOMTopLevelType('pointerover');
  const TOP_POINTER_UP = unsafeCastStringToDOMTopLevelType('pointerup');
  const TOP_PROGRESS = unsafeCastStringToDOMTopLevelType('progress');
  const TOP_RATE_CHANGE = unsafeCastStringToDOMTopLevelType('ratechange');
  const TOP_RESET = unsafeCastStringToDOMTopLevelType('reset');
  const TOP_SCROLL = unsafeCastStringToDOMTopLevelType('scroll');
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
  const TOP_TOUCH_MOVE = unsafeCastStringToDOMTopLevelType('touchmove');
  const TOP_TOUCH_START = unsafeCastStringToDOMTopLevelType('touchstart');
  const TOP_TRANSITION_END = unsafeCastStringToDOMTopLevelType(
    getVendorPrefixedEventName('transitionend'),
  );
  const TOP_VOLUME_CHANGE = unsafeCastStringToDOMTopLevelType('volumechange');
  const TOP_WAITING = unsafeCastStringToDOMTopLevelType('waiting');
  const TOP_WHEEL = unsafeCastStringToDOMTopLevelType('wheel'); // List of events that need to be individually attached to media elements.
  // Note that events in this list will *not* be listened to at the top level
  // unless they're explicitly whitelisted in `ReactBrowserEventEmitter.listenTo`.
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

  function getRawEventName(topLevelType) {
    return unsafeCastDOMTopLevelTypeToString(topLevelType);
  }

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

  function getContainerFromFiber(fiber) {
    return fiber.tag === HostRoot ? fiber.stateNode.containerInfo : null;
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
    if (Array.isArray(arr)) {
      arr.forEach(cb, scope);
    } else if (arr) {
      cb.call(scope, arr);
    }
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

    if (!!eventQueue) {
      {
        throw Error(
          'processEventQueue(): Additional events were enqueued while processing an event queue. Support for this has not yet been implemented.',
        );
      }
    } // This would be a good time to rethrow if any of the event handlers threw.

    rethrowCaughtError();
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
    const listenerMap = getListenerMapForElement(mountAt);
    const dependencies = registrationNameDependencies[registrationName];

    for (let i = 0; i < dependencies.length; i++) {
      const dependency = dependencies[i];

      legacyListenToTopLevelEvent(dependency, mountAt, listenerMap);
    }
  }

  function legacyListenToTopLevelEvent(topLevelType, mountAt, listenerMap) {
    if (!listenerMap.has(topLevelType)) {
      switch (topLevelType) {
        case TOP_SCROLL:
          trapCapturedEvent(TOP_SCROLL, mountAt);

          break;
        case TOP_FOCUS:
        case TOP_BLUR:
          trapCapturedEvent(TOP_FOCUS, mountAt);
          trapCapturedEvent(TOP_BLUR, mountAt); // We set the flag for a single dependency later in this function,
          // but this ensures we mark both as attached rather than just one.

          listenerMap.set(TOP_BLUR, null);
          listenerMap.set(TOP_FOCUS, null);

          break;
        case TOP_CANCEL:
        case TOP_CLOSE:
          if (isEventSupported(getRawEventName(topLevelType))) {
            trapCapturedEvent(topLevelType, mountAt);
          }

          break;
        case TOP_INVALID:
        case TOP_SUBMIT:
        case TOP_RESET:
          // We listen to them on the target DOM elements.
          // Some of them bubble so we don't want them to fire twice.
          break;
        default:
          // By default, listen on the top level to all non-media events.
          // Media events don't bubble so adding the listener wouldn't do anything.
          var isMediaEvent = mediaEventTypes.indexOf(topLevelType) !== -1;

          if (!isMediaEvent) {
            trapBubbledEvent(topLevelType, mountAt);
          }

          break;
      }

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

  const queuedDiscreteEvents = []; // Indicates if any continuous event targets are non-null for early bailout.
  // if the last target was dehydrated.
  let queuedFocus = null;
  let queuedDrag = null;
  let queuedMouse = null; // For pointer events there can be one latest event per pointerId.
  const queuedPointers = new Map();
  const queuedPointerCaptures = new Map(); // We could consider replaying selectionchange and touchmoves too.

  function hasQueuedDiscreteEvents() {
    return queuedDiscreteEvents.length > 0;
  }

  const discreteReplayableEvents = [
    TOP_MOUSE_DOWN,
    TOP_MOUSE_UP,
    TOP_TOUCH_CANCEL,
    TOP_TOUCH_END,
    TOP_TOUCH_START,
    TOP_AUX_CLICK,
    TOP_DOUBLE_CLICK,
    TOP_POINTER_CANCEL,
    TOP_POINTER_DOWN,
    TOP_POINTER_UP,
    TOP_DRAG_END,
    TOP_DRAG_START,
    TOP_DROP,
    TOP_COMPOSITION_END,
    TOP_COMPOSITION_START,
    TOP_KEY_DOWN,
    TOP_KEY_PRESS,
    TOP_KEY_UP,
    TOP_INPUT,
    TOP_TEXT_INPUT,
    TOP_CLOSE,
    TOP_CANCEL,
    TOP_COPY,
    TOP_CUT,
    TOP_PASTE,
    TOP_CLICK,
    TOP_CHANGE,
    TOP_CONTEXT_MENU,
    TOP_RESET,
    TOP_SUBMIT,
  ];

  function isReplayableDiscreteEvent(eventType) {
    return discreteReplayableEvents.indexOf(eventType) > -1;
  }

  function createQueuedReplayableEvent(
    blockedOn,
    topLevelType,
    eventSystemFlags,
    container,
    nativeEvent,
  ) {
    return {
      blockedOn: blockedOn,
      topLevelType: topLevelType,
      eventSystemFlags: eventSystemFlags | IS_REPLAYED,
      nativeEvent: nativeEvent,
      container: container,
    };
  }

  function queueDiscreteEvent(
    blockedOn,
    topLevelType,
    eventSystemFlags,
    container,
    nativeEvent,
  ) {
    const queuedEvent = createQueuedReplayableEvent(
      blockedOn,
      topLevelType,
      eventSystemFlags,
      container,
      nativeEvent,
    );

    queuedDiscreteEvents.push(queuedEvent);
  } // Resets the replaying for this type of continuous event to no event.

  function clearIfContinuousEvent(topLevelType, nativeEvent) {
    switch (topLevelType) {
      case TOP_FOCUS:
      case TOP_BLUR:
        queuedFocus = null;

        break;
      case TOP_DRAG_ENTER:
      case TOP_DRAG_LEAVE:
        queuedDrag = null;

        break;
      case TOP_MOUSE_OVER:
      case TOP_MOUSE_OUT:
        queuedMouse = null;

        break;
      case TOP_POINTER_OVER:
      case TOP_POINTER_OUT: {
        const pointerId = nativeEvent.pointerId;

        queuedPointers.delete(pointerId);

        break;
      }
      case TOP_GOT_POINTER_CAPTURE:
      case TOP_LOST_POINTER_CAPTURE: {
        const _pointerId = nativeEvent.pointerId;

        queuedPointerCaptures.delete(_pointerId);

        break;
      }
    }
  }

  function addEventBubbleListener(element, eventType, listener) {
    element.addEventListener(eventType, listener, false);
  }

  function addEventCaptureListener(element, eventType, listener) {
    element.addEventListener(eventType, listener, true);
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
  const discreteEventPairsForSimpleEventPlugin = [TOP_BLUR, 'blur', TOP_CANCEL, 'cancel', TOP_CLICK, 'click', TOP_CLOSE, 'close', TOP_CONTEXT_MENU, 'contextMenu', TOP_COPY, 'copy', TOP_CUT, 'cut', TOP_AUX_CLICK, 'auxClick', TOP_DOUBLE_CLICK, 'doubleClick', TOP_DRAG_END, 'dragEnd', TOP_DRAG_START, 'dragStart', TOP_DROP, 'drop', TOP_FOCUS, 'focus', TOP_INPUT, 'input', TOP_INVALID, 'invalid', TOP_KEY_DOWN, 'keyDown', TOP_KEY_PRESS, 'keyPress', TOP_KEY_UP, 'keyUp', TOP_MOUSE_DOWN, 'mouseDown', TOP_MOUSE_UP, 'mouseUp', TOP_PASTE, 'paste', TOP_PAUSE, 'pause', TOP_PLAY, 'play', TOP_POINTER_CANCEL, 'pointerCancel', TOP_POINTER_DOWN, 'pointerDown', TOP_POINTER_UP, 'pointerUp', TOP_RATE_CHANGE, 'rateChange', TOP_RESET, 'reset', TOP_SEEKED, 'seeked', TOP_SUBMIT, 'submit', TOP_TOUCH_CANCEL, 'touchCancel', TOP_TOUCH_END, 'touchEnd', TOP_TOUCH_START, 'touchStart', TOP_VOLUME_CHANGE, 'volumeChange'];
  const otherDiscreteEvents = [TOP_CHANGE, TOP_SELECTION_CHANGE, TOP_TEXT_INPUT, TOP_COMPOSITION_START, TOP_COMPOSITION_END, TOP_COMPOSITION_UPDATE]; // prettier-ignore
  const userBlockingPairsForSimpleEventPlugin = [TOP_DRAG, 'drag', TOP_DRAG_ENTER, 'dragEnter', TOP_DRAG_EXIT, 'dragExit', TOP_DRAG_LEAVE, 'dragLeave', TOP_DRAG_OVER, 'dragOver', TOP_MOUSE_MOVE, 'mouseMove', TOP_MOUSE_OUT, 'mouseOut', TOP_MOUSE_OVER, 'mouseOver', TOP_POINTER_MOVE, 'pointerMove', TOP_POINTER_OUT, 'pointerOut', TOP_POINTER_OVER, 'pointerOver', TOP_SCROLL, 'scroll', TOP_TOGGLE, 'toggle', TOP_TOUCH_MOVE, 'touchMove', TOP_WHEEL, 'wheel']; // prettier-ignore
  const continuousPairsForSimpleEventPlugin = [
    TOP_ABORT,
    'abort',
    TOP_ANIMATION_END,
    'animationEnd',
    TOP_ANIMATION_ITERATION,
    'animationIteration',
    TOP_ANIMATION_START,
    'animationStart',
    TOP_CAN_PLAY,
    'canPlay',
    TOP_CAN_PLAY_THROUGH,
    'canPlayThrough',
    TOP_DURATION_CHANGE,
    'durationChange',
    TOP_EMPTIED,
    'emptied',
    TOP_ENCRYPTED,
    'encrypted',
    TOP_ENDED,
    'ended',
    TOP_ERROR,
    'error',
    TOP_GOT_POINTER_CAPTURE,
    'gotPointerCapture',
    TOP_LOAD,
    'load',
    TOP_LOADED_DATA,
    'loadedData',
    TOP_LOADED_METADATA,
    'loadedMetadata',
    TOP_LOAD_START,
    'loadStart',
    TOP_LOST_POINTER_CAPTURE,
    'lostPointerCapture',
    TOP_PLAYING,
    'playing',
    TOP_PROGRESS,
    'progress',
    TOP_SEEKING,
    'seeking',
    TOP_STALLED,
    'stalled',
    TOP_SUSPEND,
    'suspend',
    TOP_TIME_UPDATE,
    'timeUpdate',
    TOP_TRANSITION_END,
    'transitionEnd',
    TOP_WAITING,
    'waiting',
  ];

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
  processSimpleEventPluginPairsByPriority(
    userBlockingPairsForSimpleEventPlugin,
    UserBlockingEvent,
  );
  processSimpleEventPluginPairsByPriority(
    continuousPairsForSimpleEventPlugin,
    ContinuousEvent,
  ); // Not used by SimpleEventPlugin

  processTopEventPairsByPriority(otherDiscreteEvents, DiscreteEvent);

  function getEventPriorityForPluginSystem(topLevelType) {
    const priority = eventPriorities.get(topLevelType); // Default to a ContinuousEvent. Note: we might
    // want to warn if we can't detect the priority
    // for the event.

    return priority === undefined ? ContinuousEvent : priority;
  }

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

  function trapCapturedEvent(topLevelType, element) {
    trapEventForPluginEventSystem(element, topLevelType, true);
  }

  function trapEventForPluginEventSystem(container, topLevelType, capture) {
    let listener;

    switch (getEventPriorityForPluginSystem(topLevelType)) {
      case DiscreteEvent:
        listener = dispatchDiscreteEvent.bind(
          null,
          topLevelType,
          PLUGIN_EVENT_SYSTEM,
          container,
        );

        break;
      case UserBlockingEvent:
        listener = dispatchUserBlockingUpdate.bind(
          null,
          topLevelType,
          PLUGIN_EVENT_SYSTEM,
          container,
        );

        break;
      case ContinuousEvent:
      default:
        listener = dispatchEvent.bind(
          null,
          topLevelType,
          PLUGIN_EVENT_SYSTEM,
          container,
        );

        break;
    }

    const rawEventName = getRawEventName(topLevelType);

    if (capture) {
      addEventCaptureListener(container, rawEventName, listener);
    } else {
      addEventBubbleListener(container, rawEventName, listener);
    }
  }

  function dispatchDiscreteEvent(
    topLevelType,
    eventSystemFlags,
    container,
    nativeEvent,
  ) {
    flushDiscreteUpdatesIfNeeded(nativeEvent.timeStamp);
    discreteUpdates(
      dispatchEvent,
      topLevelType,
      eventSystemFlags,
      container,
      nativeEvent,
    );
  }

  function dispatchUserBlockingUpdate(
    topLevelType,
    eventSystemFlags,
    container,
    nativeEvent,
  ) {
    runWithPriority(
      UserBlockingPriority,
      dispatchEvent.bind(
        null,
        topLevelType,
        eventSystemFlags,
        container,
        nativeEvent,
      ),
    );
  }

  function dispatchEvent(
    topLevelType,
    eventSystemFlags,
    container,
    nativeEvent,
  ) {
    if (!_enabled) {
      return;
    }

    if (hasQueuedDiscreteEvents() && isReplayableDiscreteEvent(topLevelType)) {
      // If we already have a queue of discrete events, and this is another discrete
      // event, then we can't dispatch it regardless of its target, since they
      // need to dispatch in order.
      queueDiscreteEvent(
        null, // Flags that we're not actually blocked on anything as far as we know.
        topLevelType,
        eventSystemFlags,
        container,
        nativeEvent,
      );

      return;
    }

    const blockedOn = attemptToDispatchEvent(
      topLevelType,
      eventSystemFlags,
      container,
      nativeEvent,
    );

    if (blockedOn === null) {
      // We successfully dispatched this event.
      clearIfContinuousEvent(topLevelType, nativeEvent);

      return;
    }

    if (isReplayableDiscreteEvent(topLevelType)) {
      // This this to be replayed later once the target is available.
      queueDiscreteEvent(
        blockedOn,
        topLevelType,
        eventSystemFlags,
        container,
        nativeEvent,
      );

      return;
    }

    clearIfContinuousEvent(topLevelType, nativeEvent); // This is not replayable so we'll invoke it but without a target,
    // in case the event system needs to trace it.

    {
      dispatchEventForLegacyPluginEventSystem(
        topLevelType,
        eventSystemFlags,
        nativeEvent,
        null,
      );
    }
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

    if (targetInst !== null) {
      const nearestMounted = getNearestMountedFiber(targetInst);

      if (nearestMounted === null) {
        // This tree has been unmounted already. Dispatch without a target.
        targetInst = null;
      } else {
        const tag = nearestMounted.tag;

        if (tag === HostRoot) {
          const root = nearestMounted.stateNode;

          if (root.hydrate) {
            // If this happens during a replay something went wrong and it might block
            // the whole system.
            return getContainerFromFiber(nearestMounted);
          }

          targetInst = null;
        } else if (nearestMounted !== targetInst) {
          // If we get an event (ex: img onload) before committing that
          // component's mount, ignore it for now (that is, treat it as if it was an
          // event on a non-React tree). We might also consider queueing events and
          // dispatching them after the mount.
          targetInst = null;
        }
      }
    }

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
  const shorthandToLonghand = {
    animation: [
      'animationDelay',
      'animationDirection',
      'animationDuration',
      'animationFillMode',
      'animationIterationCount',
      'animationName',
      'animationPlayState',
      'animationTimingFunction',
    ],
    background: [
      'backgroundAttachment',
      'backgroundClip',
      'backgroundColor',
      'backgroundImage',
      'backgroundOrigin',
      'backgroundPositionX',
      'backgroundPositionY',
      'backgroundRepeat',
      'backgroundSize',
    ],
    backgroundPosition: ['backgroundPositionX', 'backgroundPositionY'],
    border: [
      'borderBottomColor',
      'borderBottomStyle',
      'borderBottomWidth',
      'borderImageOutset',
      'borderImageRepeat',
      'borderImageSlice',
      'borderImageSource',
      'borderImageWidth',
      'borderLeftColor',
      'borderLeftStyle',
      'borderLeftWidth',
      'borderRightColor',
      'borderRightStyle',
      'borderRightWidth',
      'borderTopColor',
      'borderTopStyle',
      'borderTopWidth',
    ],
    borderBlockEnd: [
      'borderBlockEndColor',
      'borderBlockEndStyle',
      'borderBlockEndWidth',
    ],
    borderBlockStart: [
      'borderBlockStartColor',
      'borderBlockStartStyle',
      'borderBlockStartWidth',
    ],
    borderBottom: [
      'borderBottomColor',
      'borderBottomStyle',
      'borderBottomWidth',
    ],
    borderColor: [
      'borderBottomColor',
      'borderLeftColor',
      'borderRightColor',
      'borderTopColor',
    ],
    borderImage: [
      'borderImageOutset',
      'borderImageRepeat',
      'borderImageSlice',
      'borderImageSource',
      'borderImageWidth',
    ],
    borderInlineEnd: [
      'borderInlineEndColor',
      'borderInlineEndStyle',
      'borderInlineEndWidth',
    ],
    borderInlineStart: [
      'borderInlineStartColor',
      'borderInlineStartStyle',
      'borderInlineStartWidth',
    ],
    borderLeft: ['borderLeftColor', 'borderLeftStyle', 'borderLeftWidth'],
    borderRadius: [
      'borderBottomLeftRadius',
      'borderBottomRightRadius',
      'borderTopLeftRadius',
      'borderTopRightRadius',
    ],
    borderRight: ['borderRightColor', 'borderRightStyle', 'borderRightWidth'],
    borderStyle: [
      'borderBottomStyle',
      'borderLeftStyle',
      'borderRightStyle',
      'borderTopStyle',
    ],
    borderTop: ['borderTopColor', 'borderTopStyle', 'borderTopWidth'],
    borderWidth: [
      'borderBottomWidth',
      'borderLeftWidth',
      'borderRightWidth',
      'borderTopWidth',
    ],
    columnRule: ['columnRuleColor', 'columnRuleStyle', 'columnRuleWidth'],
    columns: ['columnCount', 'columnWidth'],
    flex: ['flexBasis', 'flexGrow', 'flexShrink'],
    flexFlow: ['flexDirection', 'flexWrap'],
    font: [
      'fontFamily',
      'fontFeatureSettings',
      'fontKerning',
      'fontLanguageOverride',
      'fontSize',
      'fontSizeAdjust',
      'fontStretch',
      'fontStyle',
      'fontVariant',
      'fontVariantAlternates',
      'fontVariantCaps',
      'fontVariantEastAsian',
      'fontVariantLigatures',
      'fontVariantNumeric',
      'fontVariantPosition',
      'fontWeight',
      'lineHeight',
    ],
    fontVariant: [
      'fontVariantAlternates',
      'fontVariantCaps',
      'fontVariantEastAsian',
      'fontVariantLigatures',
      'fontVariantNumeric',
      'fontVariantPosition',
    ],
    gap: ['columnGap', 'rowGap'],
    grid: [
      'gridAutoColumns',
      'gridAutoFlow',
      'gridAutoRows',
      'gridTemplateAreas',
      'gridTemplateColumns',
      'gridTemplateRows',
    ],
    gridArea: [
      'gridColumnEnd',
      'gridColumnStart',
      'gridRowEnd',
      'gridRowStart',
    ],
    gridColumn: ['gridColumnEnd', 'gridColumnStart'],
    gridColumnGap: ['columnGap'],
    gridGap: ['columnGap', 'rowGap'],
    gridRow: ['gridRowEnd', 'gridRowStart'],
    gridRowGap: ['rowGap'],
    gridTemplate: [
      'gridTemplateAreas',
      'gridTemplateColumns',
      'gridTemplateRows',
    ],
    listStyle: ['listStyleImage', 'listStylePosition', 'listStyleType'],
    margin: ['marginBottom', 'marginLeft', 'marginRight', 'marginTop'],
    marker: ['markerEnd', 'markerMid', 'markerStart'],
    mask: [
      'maskClip',
      'maskComposite',
      'maskImage',
      'maskMode',
      'maskOrigin',
      'maskPositionX',
      'maskPositionY',
      'maskRepeat',
      'maskSize',
    ],
    maskPosition: ['maskPositionX', 'maskPositionY'],
    outline: ['outlineColor', 'outlineStyle', 'outlineWidth'],
    overflow: ['overflowX', 'overflowY'],
    padding: ['paddingBottom', 'paddingLeft', 'paddingRight', 'paddingTop'],
    placeContent: ['alignContent', 'justifyContent'],
    placeItems: ['alignItems', 'justifyItems'],
    placeSelf: ['alignSelf', 'justifySelf'],
    textDecoration: [
      'textDecorationColor',
      'textDecorationLine',
      'textDecorationStyle',
    ],
    textEmphasis: ['textEmphasisColor', 'textEmphasisStyle'],
    transition: [
      'transitionDelay',
      'transitionDuration',
      'transitionProperty',
      'transitionTimingFunction',
    ],
    wordWrap: ['overflowWrap'],
  };
  /**
   * CSS properties which accept numbers but are not in units of "px".
   */
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

  function isValueEmpty(value) {
    return value == null || typeof value === 'boolean' || value === '';
  }

  function expandShorthandMap(styles) {
    const expanded = {};

    for (const key in styles) {
      const longhands = shorthandToLonghand[key] || [key];

      for (let i = 0; i < longhands.length; i++) {
        expanded[longhands[i]] = key;
      }
    }

    return expanded;
  }

  /**
   * When mixing shorthand and longhand property names, we warn during updates if
   * we expect an incorrect result to occur. In particular, we warn for:
   *
   * Updating a shorthand property (longhand gets overwritten):
   *   {font: 'foo', fontVariant: 'bar'} -> {font: 'baz', fontVariant: 'bar'}
   *   becomes .style.font = 'baz'
   * Removing a shorthand property (longhand gets lost too):
   *   {font: 'foo', fontVariant: 'bar'} -> {fontVariant: 'bar'}
   *   becomes .style.font = ''
   * Removing a longhand property (should revert to shorthand; doesn't):
   *   {font: 'foo', fontVariant: 'bar'} -> {font: 'foo'}
   *   becomes .style.fontVariant = ''
   */

  function validateShorthandPropertyCollisionInDev(styleUpdates, nextStyles) {
    {
      if (!nextStyles) {
        return;
      }

      const expandedUpdates = expandShorthandMap(styleUpdates);
      const expandedStyles = expandShorthandMap(nextStyles);
      const warnedAbout = {};

      for (const key in expandedUpdates) {
        const originalKey = expandedUpdates[key];
        const correctOriginalKey = expandedStyles[key];

        if (correctOriginalKey && originalKey !== correctOriginalKey) {
          const warningKey = originalKey + ',' + correctOriginalKey;

          if (warnedAbout[warningKey]) {
            continue;
          }

          warnedAbout[warningKey] = true;

          error(
            '%s a style property during rerender (%s) when a ' +
              'conflicting property is set (%s) can lead to styling bugs. To ' +
              "avoid this, don't mix shorthand and non-shorthand properties " +
              'for the same value; instead, replace the shorthand with ' +
              'separate values.',
            isValueEmpty(styleUpdates[originalKey]) ? 'Removing' : 'Updating',
            originalKey,
            correctOriginalKey,
          );
        }
      }
    }
  }

  // For HTML, certain tags should omit their close tag. We keep a whitelist for
  // those special-case tags.
  const omittedCloseTags = {
    area: true,
    base: true,
    br: true,
    col: true,
    embed: true,
    hr: true,
    img: true,
    input: true,
    keygen: true,
    link: true,
    meta: true,
    param: true,
    source: true,
    track: true,
    wbr: true, // NOTE: menuitem's close tag should be omitted, but that causes problems.
  };

  // `omittedCloseTags` except that `menuitem` should still have its closing tag.

  const voidElementTags = _assign(
    {
      menuitem: true,
    },
    omittedCloseTags,
  );
  const HTML = '__html';
  const ReactDebugCurrentFrame$3 = null;

  function assertValidProps(tag, props) {
    if (!props) {
      return;
    } // Note the use of `==` which checks for null or undefined.

    if (voidElementTags[tag]) {
      if (!(props.children == null && props.dangerouslySetInnerHTML == null)) {
        {
          throw Error(
            tag +
              ' is a void element tag and must neither have `children` nor use `dangerouslySetInnerHTML`.' +
              ReactDebugCurrentFrame$3.getStackAddendum(),
          );
        }
      }
    }

    if (props.dangerouslySetInnerHTML != null) {
      if (!(props.children == null)) {
        {
          throw Error(
            'Can only set one of `children` or `props.dangerouslySetInnerHTML`.',
          );
        }
      }

      if (
        !(
          typeof props.dangerouslySetInnerHTML === 'object' &&
          HTML in props.dangerouslySetInnerHTML
        )
      ) {
        {
          throw Error(
            '`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://fb.me/react-invariant-dangerously-set-inner-html for more information.',
          );
        }
      }
    }

    {
      if (
        !props.suppressContentEditableWarning &&
        props.contentEditable &&
        props.children != null
      ) {
        error(
          'A component is `contentEditable` and contains `children` managed by ' +
            'React. It is now your responsibility to guarantee that none of ' +
            'those nodes are unexpectedly modified or duplicated. This is ' +
            'probably not intentional.',
        );
      }
    }

    if (!(props.style == null || typeof props.style === 'object')) {
      {
        throw Error(
          "The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + 'em'}} when using JSX." +
            ReactDebugCurrentFrame$3.getStackAddendum(),
        );
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

  // When adding attributes to the HTML or SVG whitelist, be sure to
  // also add them to this module to ensure casing and incorrect name
  // warnings.
  const possibleStandardNames = {
    // HTML
    accept: 'accept',
    acceptcharset: 'acceptCharset',
    'accept-charset': 'acceptCharset',
    accesskey: 'accessKey',
    action: 'action',
    allowfullscreen: 'allowFullScreen',
    alt: 'alt',
    as: 'as',
    async: 'async',
    autocapitalize: 'autoCapitalize',
    autocomplete: 'autoComplete',
    autocorrect: 'autoCorrect',
    autofocus: 'autoFocus',
    autoplay: 'autoPlay',
    autosave: 'autoSave',
    capture: 'capture',
    cellpadding: 'cellPadding',
    cellspacing: 'cellSpacing',
    challenge: 'challenge',
    charset: 'charSet',
    checked: 'checked',
    children: 'children',
    cite: 'cite',
    class: 'className',
    classid: 'classID',
    classname: 'className',
    cols: 'cols',
    colspan: 'colSpan',
    content: 'content',
    contenteditable: 'contentEditable',
    contextmenu: 'contextMenu',
    controls: 'controls',
    controlslist: 'controlsList',
    coords: 'coords',
    crossorigin: 'crossOrigin',
    dangerouslysetinnerhtml: 'dangerouslySetInnerHTML',
    data: 'data',
    datetime: 'dateTime',
    default: 'default',
    defaultchecked: 'defaultChecked',
    defaultvalue: 'defaultValue',
    defer: 'defer',
    dir: 'dir',
    disabled: 'disabled',
    disablepictureinpicture: 'disablePictureInPicture',
    download: 'download',
    draggable: 'draggable',
    enctype: 'encType',
    for: 'htmlFor',
    form: 'form',
    formmethod: 'formMethod',
    formaction: 'formAction',
    formenctype: 'formEncType',
    formnovalidate: 'formNoValidate',
    formtarget: 'formTarget',
    frameborder: 'frameBorder',
    headers: 'headers',
    height: 'height',
    hidden: 'hidden',
    high: 'high',
    href: 'href',
    hreflang: 'hrefLang',
    htmlfor: 'htmlFor',
    httpequiv: 'httpEquiv',
    'http-equiv': 'httpEquiv',
    icon: 'icon',
    id: 'id',
    innerhtml: 'innerHTML',
    inputmode: 'inputMode',
    integrity: 'integrity',
    is: 'is',
    itemid: 'itemID',
    itemprop: 'itemProp',
    itemref: 'itemRef',
    itemscope: 'itemScope',
    itemtype: 'itemType',
    keyparams: 'keyParams',
    keytype: 'keyType',
    kind: 'kind',
    label: 'label',
    lang: 'lang',
    list: 'list',
    loop: 'loop',
    low: 'low',
    manifest: 'manifest',
    marginwidth: 'marginWidth',
    marginheight: 'marginHeight',
    max: 'max',
    maxlength: 'maxLength',
    media: 'media',
    mediagroup: 'mediaGroup',
    method: 'method',
    min: 'min',
    minlength: 'minLength',
    multiple: 'multiple',
    muted: 'muted',
    name: 'name',
    nomodule: 'noModule',
    nonce: 'nonce',
    novalidate: 'noValidate',
    open: 'open',
    optimum: 'optimum',
    pattern: 'pattern',
    placeholder: 'placeholder',
    playsinline: 'playsInline',
    poster: 'poster',
    preload: 'preload',
    profile: 'profile',
    radiogroup: 'radioGroup',
    readonly: 'readOnly',
    referrerpolicy: 'referrerPolicy',
    rel: 'rel',
    required: 'required',
    reversed: 'reversed',
    role: 'role',
    rows: 'rows',
    rowspan: 'rowSpan',
    sandbox: 'sandbox',
    scope: 'scope',
    scoped: 'scoped',
    scrolling: 'scrolling',
    seamless: 'seamless',
    selected: 'selected',
    shape: 'shape',
    size: 'size',
    sizes: 'sizes',
    span: 'span',
    spellcheck: 'spellCheck',
    src: 'src',
    srcdoc: 'srcDoc',
    srclang: 'srcLang',
    srcset: 'srcSet',
    start: 'start',
    step: 'step',
    style: 'style',
    summary: 'summary',
    tabindex: 'tabIndex',
    target: 'target',
    title: 'title',
    type: 'type',
    usemap: 'useMap',
    value: 'value',
    width: 'width',
    wmode: 'wmode',
    wrap: 'wrap',
    // SVG
    about: 'about',
    accentheight: 'accentHeight',
    'accent-height': 'accentHeight',
    accumulate: 'accumulate',
    additive: 'additive',
    alignmentbaseline: 'alignmentBaseline',
    'alignment-baseline': 'alignmentBaseline',
    allowreorder: 'allowReorder',
    alphabetic: 'alphabetic',
    amplitude: 'amplitude',
    arabicform: 'arabicForm',
    'arabic-form': 'arabicForm',
    ascent: 'ascent',
    attributename: 'attributeName',
    attributetype: 'attributeType',
    autoreverse: 'autoReverse',
    azimuth: 'azimuth',
    basefrequency: 'baseFrequency',
    baselineshift: 'baselineShift',
    'baseline-shift': 'baselineShift',
    baseprofile: 'baseProfile',
    bbox: 'bbox',
    begin: 'begin',
    bias: 'bias',
    by: 'by',
    calcmode: 'calcMode',
    capheight: 'capHeight',
    'cap-height': 'capHeight',
    clip: 'clip',
    clippath: 'clipPath',
    'clip-path': 'clipPath',
    clippathunits: 'clipPathUnits',
    cliprule: 'clipRule',
    'clip-rule': 'clipRule',
    color: 'color',
    colorinterpolation: 'colorInterpolation',
    'color-interpolation': 'colorInterpolation',
    colorinterpolationfilters: 'colorInterpolationFilters',
    'color-interpolation-filters': 'colorInterpolationFilters',
    colorprofile: 'colorProfile',
    'color-profile': 'colorProfile',
    colorrendering: 'colorRendering',
    'color-rendering': 'colorRendering',
    contentscripttype: 'contentScriptType',
    contentstyletype: 'contentStyleType',
    cursor: 'cursor',
    cx: 'cx',
    cy: 'cy',
    d: 'd',
    datatype: 'datatype',
    decelerate: 'decelerate',
    descent: 'descent',
    diffuseconstant: 'diffuseConstant',
    direction: 'direction',
    display: 'display',
    divisor: 'divisor',
    dominantbaseline: 'dominantBaseline',
    'dominant-baseline': 'dominantBaseline',
    dur: 'dur',
    dx: 'dx',
    dy: 'dy',
    edgemode: 'edgeMode',
    elevation: 'elevation',
    enablebackground: 'enableBackground',
    'enable-background': 'enableBackground',
    end: 'end',
    exponent: 'exponent',
    externalresourcesrequired: 'externalResourcesRequired',
    fill: 'fill',
    fillopacity: 'fillOpacity',
    'fill-opacity': 'fillOpacity',
    fillrule: 'fillRule',
    'fill-rule': 'fillRule',
    filter: 'filter',
    filterres: 'filterRes',
    filterunits: 'filterUnits',
    floodopacity: 'floodOpacity',
    'flood-opacity': 'floodOpacity',
    floodcolor: 'floodColor',
    'flood-color': 'floodColor',
    focusable: 'focusable',
    fontfamily: 'fontFamily',
    'font-family': 'fontFamily',
    fontsize: 'fontSize',
    'font-size': 'fontSize',
    fontsizeadjust: 'fontSizeAdjust',
    'font-size-adjust': 'fontSizeAdjust',
    fontstretch: 'fontStretch',
    'font-stretch': 'fontStretch',
    fontstyle: 'fontStyle',
    'font-style': 'fontStyle',
    fontvariant: 'fontVariant',
    'font-variant': 'fontVariant',
    fontweight: 'fontWeight',
    'font-weight': 'fontWeight',
    format: 'format',
    from: 'from',
    fx: 'fx',
    fy: 'fy',
    g1: 'g1',
    g2: 'g2',
    glyphname: 'glyphName',
    'glyph-name': 'glyphName',
    glyphorientationhorizontal: 'glyphOrientationHorizontal',
    'glyph-orientation-horizontal': 'glyphOrientationHorizontal',
    glyphorientationvertical: 'glyphOrientationVertical',
    'glyph-orientation-vertical': 'glyphOrientationVertical',
    glyphref: 'glyphRef',
    gradienttransform: 'gradientTransform',
    gradientunits: 'gradientUnits',
    hanging: 'hanging',
    horizadvx: 'horizAdvX',
    'horiz-adv-x': 'horizAdvX',
    horizoriginx: 'horizOriginX',
    'horiz-origin-x': 'horizOriginX',
    ideographic: 'ideographic',
    imagerendering: 'imageRendering',
    'image-rendering': 'imageRendering',
    in2: 'in2',
    in: 'in',
    inlist: 'inlist',
    intercept: 'intercept',
    k1: 'k1',
    k2: 'k2',
    k3: 'k3',
    k4: 'k4',
    k: 'k',
    kernelmatrix: 'kernelMatrix',
    kernelunitlength: 'kernelUnitLength',
    kerning: 'kerning',
    keypoints: 'keyPoints',
    keysplines: 'keySplines',
    keytimes: 'keyTimes',
    lengthadjust: 'lengthAdjust',
    letterspacing: 'letterSpacing',
    'letter-spacing': 'letterSpacing',
    lightingcolor: 'lightingColor',
    'lighting-color': 'lightingColor',
    limitingconeangle: 'limitingConeAngle',
    local: 'local',
    markerend: 'markerEnd',
    'marker-end': 'markerEnd',
    markerheight: 'markerHeight',
    markermid: 'markerMid',
    'marker-mid': 'markerMid',
    markerstart: 'markerStart',
    'marker-start': 'markerStart',
    markerunits: 'markerUnits',
    markerwidth: 'markerWidth',
    mask: 'mask',
    maskcontentunits: 'maskContentUnits',
    maskunits: 'maskUnits',
    mathematical: 'mathematical',
    mode: 'mode',
    numoctaves: 'numOctaves',
    offset: 'offset',
    opacity: 'opacity',
    operator: 'operator',
    order: 'order',
    orient: 'orient',
    orientation: 'orientation',
    origin: 'origin',
    overflow: 'overflow',
    overlineposition: 'overlinePosition',
    'overline-position': 'overlinePosition',
    overlinethickness: 'overlineThickness',
    'overline-thickness': 'overlineThickness',
    paintorder: 'paintOrder',
    'paint-order': 'paintOrder',
    panose1: 'panose1',
    'panose-1': 'panose1',
    pathlength: 'pathLength',
    patterncontentunits: 'patternContentUnits',
    patterntransform: 'patternTransform',
    patternunits: 'patternUnits',
    pointerevents: 'pointerEvents',
    'pointer-events': 'pointerEvents',
    points: 'points',
    pointsatx: 'pointsAtX',
    pointsaty: 'pointsAtY',
    pointsatz: 'pointsAtZ',
    prefix: 'prefix',
    preservealpha: 'preserveAlpha',
    preserveaspectratio: 'preserveAspectRatio',
    primitiveunits: 'primitiveUnits',
    property: 'property',
    r: 'r',
    radius: 'radius',
    refx: 'refX',
    refy: 'refY',
    renderingintent: 'renderingIntent',
    'rendering-intent': 'renderingIntent',
    repeatcount: 'repeatCount',
    repeatdur: 'repeatDur',
    requiredextensions: 'requiredExtensions',
    requiredfeatures: 'requiredFeatures',
    resource: 'resource',
    restart: 'restart',
    result: 'result',
    results: 'results',
    rotate: 'rotate',
    rx: 'rx',
    ry: 'ry',
    scale: 'scale',
    security: 'security',
    seed: 'seed',
    shaperendering: 'shapeRendering',
    'shape-rendering': 'shapeRendering',
    slope: 'slope',
    spacing: 'spacing',
    specularconstant: 'specularConstant',
    specularexponent: 'specularExponent',
    speed: 'speed',
    spreadmethod: 'spreadMethod',
    startoffset: 'startOffset',
    stddeviation: 'stdDeviation',
    stemh: 'stemh',
    stemv: 'stemv',
    stitchtiles: 'stitchTiles',
    stopcolor: 'stopColor',
    'stop-color': 'stopColor',
    stopopacity: 'stopOpacity',
    'stop-opacity': 'stopOpacity',
    strikethroughposition: 'strikethroughPosition',
    'strikethrough-position': 'strikethroughPosition',
    strikethroughthickness: 'strikethroughThickness',
    'strikethrough-thickness': 'strikethroughThickness',
    string: 'string',
    stroke: 'stroke',
    strokedasharray: 'strokeDasharray',
    'stroke-dasharray': 'strokeDasharray',
    strokedashoffset: 'strokeDashoffset',
    'stroke-dashoffset': 'strokeDashoffset',
    strokelinecap: 'strokeLinecap',
    'stroke-linecap': 'strokeLinecap',
    strokelinejoin: 'strokeLinejoin',
    'stroke-linejoin': 'strokeLinejoin',
    strokemiterlimit: 'strokeMiterlimit',
    'stroke-miterlimit': 'strokeMiterlimit',
    strokewidth: 'strokeWidth',
    'stroke-width': 'strokeWidth',
    strokeopacity: 'strokeOpacity',
    'stroke-opacity': 'strokeOpacity',
    suppresscontenteditablewarning: 'suppressContentEditableWarning',
    suppresshydrationwarning: 'suppressHydrationWarning',
    surfacescale: 'surfaceScale',
    systemlanguage: 'systemLanguage',
    tablevalues: 'tableValues',
    targetx: 'targetX',
    targety: 'targetY',
    textanchor: 'textAnchor',
    'text-anchor': 'textAnchor',
    textdecoration: 'textDecoration',
    'text-decoration': 'textDecoration',
    textlength: 'textLength',
    textrendering: 'textRendering',
    'text-rendering': 'textRendering',
    to: 'to',
    transform: 'transform',
    typeof: 'typeof',
    u1: 'u1',
    u2: 'u2',
    underlineposition: 'underlinePosition',
    'underline-position': 'underlinePosition',
    underlinethickness: 'underlineThickness',
    'underline-thickness': 'underlineThickness',
    unicode: 'unicode',
    unicodebidi: 'unicodeBidi',
    'unicode-bidi': 'unicodeBidi',
    unicoderange: 'unicodeRange',
    'unicode-range': 'unicodeRange',
    unitsperem: 'unitsPerEm',
    'units-per-em': 'unitsPerEm',
    unselectable: 'unselectable',
    valphabetic: 'vAlphabetic',
    'v-alphabetic': 'vAlphabetic',
    values: 'values',
    vectoreffect: 'vectorEffect',
    'vector-effect': 'vectorEffect',
    version: 'version',
    vertadvy: 'vertAdvY',
    'vert-adv-y': 'vertAdvY',
    vertoriginx: 'vertOriginX',
    'vert-origin-x': 'vertOriginX',
    vertoriginy: 'vertOriginY',
    'vert-origin-y': 'vertOriginY',
    vhanging: 'vHanging',
    'v-hanging': 'vHanging',
    videographic: 'vIdeographic',
    'v-ideographic': 'vIdeographic',
    viewbox: 'viewBox',
    viewtarget: 'viewTarget',
    visibility: 'visibility',
    vmathematical: 'vMathematical',
    'v-mathematical': 'vMathematical',
    vocab: 'vocab',
    widths: 'widths',
    wordspacing: 'wordSpacing',
    'word-spacing': 'wordSpacing',
    writingmode: 'writingMode',
    'writing-mode': 'writingMode',
    x1: 'x1',
    x2: 'x2',
    x: 'x',
    xchannelselector: 'xChannelSelector',
    xheight: 'xHeight',
    'x-height': 'xHeight',
    xlinkactuate: 'xlinkActuate',
    'xlink:actuate': 'xlinkActuate',
    xlinkarcrole: 'xlinkArcrole',
    'xlink:arcrole': 'xlinkArcrole',
    xlinkhref: 'xlinkHref',
    'xlink:href': 'xlinkHref',
    xlinkrole: 'xlinkRole',
    'xlink:role': 'xlinkRole',
    xlinkshow: 'xlinkShow',
    'xlink:show': 'xlinkShow',
    xlinktitle: 'xlinkTitle',
    'xlink:title': 'xlinkTitle',
    xlinktype: 'xlinkType',
    'xlink:type': 'xlinkType',
    xmlbase: 'xmlBase',
    'xml:base': 'xmlBase',
    xmllang: 'xmlLang',
    'xml:lang': 'xmlLang',
    xmlns: 'xmlns',
    'xml:space': 'xmlSpace',
    xmlnsxlink: 'xmlnsXlink',
    'xmlns:xlink': 'xmlnsXlink',
    xmlspace: 'xmlSpace',
    y1: 'y1',
    y2: 'y2',
    y: 'y',
    ychannelselector: 'yChannelSelector',
    z: 'z',
    zoomandpan: 'zoomAndPan',
  };
  const ariaProperties = {
    'aria-current': 0,
    // state
    'aria-details': 0,
    'aria-disabled': 0,
    // state
    'aria-hidden': 0,
    // state
    'aria-invalid': 0,
    // state
    'aria-keyshortcuts': 0,
    'aria-label': 0,
    'aria-roledescription': 0,
    // Widget Attributes
    'aria-autocomplete': 0,
    'aria-checked': 0,
    'aria-expanded': 0,
    'aria-haspopup': 0,
    'aria-level': 0,
    'aria-modal': 0,
    'aria-multiline': 0,
    'aria-multiselectable': 0,
    'aria-orientation': 0,
    'aria-placeholder': 0,
    'aria-pressed': 0,
    'aria-readonly': 0,
    'aria-required': 0,
    'aria-selected': 0,
    'aria-sort': 0,
    'aria-valuemax': 0,
    'aria-valuemin': 0,
    'aria-valuenow': 0,
    'aria-valuetext': 0,
    // Live Region Attributes
    'aria-atomic': 0,
    'aria-busy': 0,
    'aria-live': 0,
    'aria-relevant': 0,
    // Drag-and-Drop Attributes
    'aria-dropeffect': 0,
    'aria-grabbed': 0,
    // Relationship Attributes
    'aria-activedescendant': 0,
    'aria-colcount': 0,
    'aria-colindex': 0,
    'aria-colspan': 0,
    'aria-controls': 0,
    'aria-describedby': 0,
    'aria-errormessage': 0,
    'aria-flowto': 0,
    'aria-labelledby': 0,
    'aria-owns': 0,
    'aria-posinset': 0,
    'aria-rowcount': 0,
    'aria-rowindex': 0,
    'aria-rowspan': 0,
    'aria-setsize': 0,
  };
  const warnedProperties = {};
  const rARIA = new RegExp('^(aria)-[' + ATTRIBUTE_NAME_CHAR + ']*$');
  const rARIACamel = new RegExp('^(aria)[A-Z][' + ATTRIBUTE_NAME_CHAR + ']*$');
  const hasOwnProperty$1 = Object.prototype.hasOwnProperty;

  function validateProperty(tagName, name) {
    {
      if (
        hasOwnProperty$1.call(warnedProperties, name) &&
        warnedProperties[name]
      ) {
        return true;
      }

      if (rARIACamel.test(name)) {
        const ariaName = 'aria-' + name.slice(4).toLowerCase();
        const correctName = ariaProperties.hasOwnProperty(ariaName)
          ? ariaName
          : null; // If this is an aria-* attribute, but is not listed in the known DOM
        // DOM properties, then it is an invalid aria-* attribute.

        if (correctName == null) {
          error(
            'Invalid ARIA attribute `%s`. ARIA attributes follow the pattern aria-* and must be lowercase.',
            name,
          );

          warnedProperties[name] = true;

          return true;
        } // aria-* attributes should be lowercase; suggest the lowercase version.

        if (name !== correctName) {
          error(
            'Invalid ARIA attribute `%s`. Did you mean `%s`?',
            name,
            correctName,
          );

          warnedProperties[name] = true;

          return true;
        }
      }

      if (rARIA.test(name)) {
        const lowerCasedName = name.toLowerCase();
        const standardName = ariaProperties.hasOwnProperty(lowerCasedName)
          ? lowerCasedName
          : null; // If this is an aria-* attribute, but is not listed in the known DOM
        // DOM properties, then it is an invalid aria-* attribute.

        if (standardName == null) {
          warnedProperties[name] = true;

          return false;
        } // aria-* attributes should be lowercase; suggest the lowercase version.

        if (name !== standardName) {
          error(
            'Unknown ARIA attribute `%s`. Did you mean `%s`?',
            name,
            standardName,
          );

          warnedProperties[name] = true;

          return true;
        }
      }
    }

    return true;
  }

  function warnInvalidARIAProps(type, props) {
    {
      const invalidProps = [];

      for (const key in props) {
        const isValid = validateProperty(type, key);

        if (!isValid) {
          invalidProps.push(key);
        }
      }

      const unknownPropString = invalidProps
        .map(function (prop) {
          return '`' + prop + '`';
        })
        .join(', ');

      if (invalidProps.length === 1) {
        error(
          'Invalid aria prop %s on <%s> tag. ' +
            'For details, see https://fb.me/invalid-aria-prop',
          unknownPropString,
          type,
        );
      } else if (invalidProps.length > 1) {
        error(
          'Invalid aria props %s on <%s> tag. ' +
            'For details, see https://fb.me/invalid-aria-prop',
          unknownPropString,
          type,
        );
      }
    }
  }

  function validateProperties(type, props) {
    if (isCustomComponent(type, props)) {
      return;
    }

    warnInvalidARIAProps(type, props);
  }

  let didWarnValueNull = false;

  function validateProperties$1(type, props) {
    {
      if (type !== 'input' && type !== 'textarea' && type !== 'select') {
        return;
      }

      if (props != null && props.value === null && !didWarnValueNull) {
        didWarnValueNull = true;

        if (type === 'select' && props.multiple) {
          error(
            '`value` prop on `%s` should not be null. ' +
              'Consider using an empty array when `multiple` is set to `true` ' +
              'to clear the component or `undefined` for uncontrolled components.',
            type,
          );
        } else {
          error(
            '`value` prop on `%s` should not be null. ' +
              'Consider using an empty string to clear the component or `undefined` ' +
              'for uncontrolled components.',
            type,
          );
        }
      }
    }
  }

  let validateProperty$1 = function () {};

  {
    const warnedProperties$1 = {};
    const _hasOwnProperty = Object.prototype.hasOwnProperty;
    const EVENT_NAME_REGEX = /^on./;
    const INVALID_EVENT_NAME_REGEX = /^on[^A-Z]/;
    const rARIA$1 = new RegExp('^(aria)-[' + ATTRIBUTE_NAME_CHAR + ']*$');
    const rARIACamel$1 = new RegExp(
      '^(aria)[A-Z][' + ATTRIBUTE_NAME_CHAR + ']*$',
    );

    validateProperty$1 = function (tagName, name, value, canUseEventSystem) {
      if (
        _hasOwnProperty.call(warnedProperties$1, name) &&
        warnedProperties$1[name]
      ) {
        return true;
      }

      const lowerCasedName = name.toLowerCase();

      if (lowerCasedName === 'onfocusin' || lowerCasedName === 'onfocusout') {
        error(
          'React uses onFocus and onBlur instead of onFocusIn and onFocusOut. ' +
            'All React events are normalized to bubble, so onFocusIn and onFocusOut ' +
            'are not needed/supported by React.',
        );

        warnedProperties$1[name] = true;

        return true;
      } // We can't rely on the event system being injected on the server.

      if (canUseEventSystem) {
        if (registrationNameModules.hasOwnProperty(name)) {
          return true;
        }

        const registrationName = possibleRegistrationNames.hasOwnProperty(
          lowerCasedName,
        )
          ? possibleRegistrationNames[lowerCasedName]
          : null;

        if (registrationName != null) {
          error(
            'Invalid event handler property `%s`. Did you mean `%s`?',
            name,
            registrationName,
          );

          warnedProperties$1[name] = true;

          return true;
        }

        if (EVENT_NAME_REGEX.test(name)) {
          error(
            'Unknown event handler property `%s`. It will be ignored.',
            name,
          );

          warnedProperties$1[name] = true;

          return true;
        }
      } else if (EVENT_NAME_REGEX.test(name)) {
        // If no event plugins have been injected, we are in a server environment.
        // So we can't tell if the event name is correct for sure, but we can filter
        // out known bad ones like `onclick`. We can't suggest a specific replacement though.
        if (INVALID_EVENT_NAME_REGEX.test(name)) {
          error(
            'Invalid event handler property `%s`. ' +
              'React events use the camelCase naming convention, for example `onClick`.',
            name,
          );
        }

        warnedProperties$1[name] = true;

        return true;
      } // Let the ARIA attribute hook validate ARIA attributes

      if (rARIA$1.test(name) || rARIACamel$1.test(name)) {
        return true;
      }

      if (lowerCasedName === 'innerhtml') {
        error(
          'Directly setting property `innerHTML` is not permitted. ' +
            'For more information, lookup documentation on `dangerouslySetInnerHTML`.',
        );

        warnedProperties$1[name] = true;

        return true;
      }

      if (lowerCasedName === 'aria') {
        error(
          'The `aria` attribute is reserved for future use in React. ' +
            'Pass individual `aria-` attributes instead.',
        );

        warnedProperties$1[name] = true;

        return true;
      }

      if (
        lowerCasedName === 'is' &&
        value !== null &&
        value !== undefined &&
        typeof value !== 'string'
      ) {
        error(
          'Received a `%s` for a string attribute `is`. If this is expected, cast ' +
            'the value to a string.',
          typeof value,
        );

        warnedProperties$1[name] = true;

        return true;
      }

      if (typeof value === 'number' && isNaN(value)) {
        error(
          'Received NaN for the `%s` attribute. If this is expected, cast ' +
            'the value to a string.',
          name,
        );

        warnedProperties$1[name] = true;

        return true;
      }

      const propertyInfo = getPropertyInfo(name);
      const isReserved =
        propertyInfo !== null && propertyInfo.type === RESERVED; // Known attributes should match the casing specified in the property config.

      if (possibleStandardNames.hasOwnProperty(lowerCasedName)) {
        const standardName = possibleStandardNames[lowerCasedName];

        if (standardName !== name) {
          error(
            'Invalid DOM property `%s`. Did you mean `%s`?',
            name,
            standardName,
          );

          warnedProperties$1[name] = true;

          return true;
        }
      } else if (!isReserved && name !== lowerCasedName) {
        // Unknown attributes should have lowercase casing since that's how they
        // will be cased anyway with server rendering.
        error(
          'React does not recognize the `%s` prop on a DOM element. If you ' +
            'intentionally want it to appear in the DOM as a custom ' +
            'attribute, spell it as lowercase `%s` instead. ' +
            'If you accidentally passed it from a parent component, remove ' +
            'it from the DOM element.',
          name,
          lowerCasedName,
        );

        warnedProperties$1[name] = true;

        return true;
      }

      if (
        typeof value === 'boolean' &&
        shouldRemoveAttributeWithWarning(name, value, propertyInfo, false)
      ) {
        if (value) {
          error(
            'Received `%s` for a non-boolean attribute `%s`.\n\n' +
              'If you want to write it to the DOM, pass a string instead: ' +
              '%s="%s" or %s={value.toString()}.',
            value,
            name,
            name,
            value,
            name,
          );
        } else {
          error(
            'Received `%s` for a non-boolean attribute `%s`.\n\n' +
              'If you want to write it to the DOM, pass a string instead: ' +
              '%s="%s" or %s={value.toString()}.\n\n' +
              'If you used to conditionally omit it with %s={condition && value}, ' +
              'pass %s={condition ? value : undefined} instead.',
            value,
            name,
            name,
            value,
            name,
            name,
            name,
          );
        }

        warnedProperties$1[name] = true;

        return true;
      } // Now that we've validated casing, do not validate
      // data types for reserved props

      if (isReserved) {
        return true;
      } // Warn when a known attribute is a bad type

      if (shouldRemoveAttributeWithWarning(name, value, propertyInfo, false)) {
        warnedProperties$1[name] = true;

        return false;
      } // Warn when passing the strings 'false' or 'true' into a boolean prop

      if (
        (value === 'false' || value === 'true') &&
        propertyInfo !== null &&
        propertyInfo.type === BOOLEAN
      ) {
        error(
          'Received the string `%s` for the boolean attribute `%s`. ' +
            '%s ' +
            'Did you mean %s={%s}?',
          value,
          name,
          value === 'false'
            ? 'The browser will interpret it as a truthy value.'
            : 'Although this works, it will not work as expected if you pass the string "false".',
          name,
          value,
        );

        warnedProperties$1[name] = true;

        return true;
      }

      return true;
    };
  }

  const warnUnknownProperties = function (type, props, canUseEventSystem) {
    {
      const unknownProps = [];

      for (const key in props) {
        const isValid = validateProperty$1(
          type,
          key,
          props[key],
          canUseEventSystem,
        );

        if (!isValid) {
          unknownProps.push(key);
        }
      }

      const unknownPropString = unknownProps
        .map(function (prop) {
          return '`' + prop + '`';
        })
        .join(', ');

      if (unknownProps.length === 1) {
        error(
          'Invalid value for prop %s on <%s> tag. Either remove it from the element, ' +
            'or pass a string or number value to keep it in the DOM. ' +
            'For details, see https://fb.me/react-attribute-behavior',
          unknownPropString,
          type,
        );
      } else if (unknownProps.length > 1) {
        error(
          'Invalid values for props %s on <%s> tag. Either remove them from the element, ' +
            'or pass a string or number value to keep them in the DOM. ' +
            'For details, see https://fb.me/react-attribute-behavior',
          unknownPropString,
          type,
        );
      }
    }
  };

  function validateProperties$2(type, props, canUseEventSystem) {
    if (isCustomComponent(type, props)) {
      return;
    }

    warnUnknownProperties(type, props, canUseEventSystem);
  }

  const DANGEROUSLY_SET_INNER_HTML = 'dangerouslySetInnerHTML';
  const SUPPRESS_CONTENT_EDITABLE_WARNING = 'suppressContentEditableWarning';
  const SUPPRESS_HYDRATION_WARNING = 'suppressHydrationWarning';
  const AUTOFOCUS = 'autoFocus';
  const CHILDREN = 'children';
  const STYLE = 'style';
  const HTML$1 = '__html';
  const HTML_NAMESPACE$1 = Namespaces.html;
  let warnedUnknownTags;
  let validatePropertiesInDevelopment;
  let warnForInvalidEventListener;

  {
    warnedUnknownTags = {
      // Chrome is the only major browser not shipping <time>. But as of July
      // 2017 it intends to ship it due to widespread usage. We intentionally
      // *don't* warn for <time> even if it's unrecognized by Chrome because
      // it soon will be, and many apps have been using it anyway.
      time: true,
      // There are working polyfills for <dialog>. Let people use it.
      dialog: true,
      // Electron ships a custom <webview> tag to display external web content in
      // an isolated frame and process.
      // This tag is not present in non Electron environments such as JSDom which
      // is often used for testing purposes.
      // @see https://electronjs.org/docs/api/webview-tag
      webview: true,
    };

    validatePropertiesInDevelopment = function (type, props) {
      validateProperties(type, props);
      validateProperties$1(type, props);
      validateProperties$2(
        type,
        props,
        /* canUseEventSystem */
        true,
      );
    }; // IE 11 parses & normalizes the style attribute as opposed to other
    // browsers. It adds spaces and sorts the properties in some
    // non-alphabetical order. Handling that would require sorting CSS
    // properties in the client & server versions or applying
    // `expectedStyle` to a temporary DOM node to read its `style` attribute
    // normalized. Since it only affects IE, we're skipping style warnings
    // in that browser completely in favor of doing all that work.
    // See https://github.com/facebook/react/issues/11807

    const NORMALIZE_NEWLINES_REGEX = /\r\n?/g;
    const NORMALIZE_NULL_AND_REPLACEMENT_REGEX = /\u0000|\uFFFD/g;

    warnForInvalidEventListener = function (registrationName, listener) {
      if (listener === false) {
        error(
          'Expected `%s` listener to be a function, instead got `false`.\n\n' +
            'If you used to conditionally omit it with %s={condition && value}, ' +
            'pass %s={condition ? value : undefined} instead.',
          registrationName,
          registrationName,
          registrationName,
        );
      } else {
        error(
          'Expected `%s` listener to be a function, instead got a value of `%s` type.',
          registrationName,
          typeof listener,
        );
      }
    }; // Parse the HTML and read it back to normalize the HTML string so that it
    // can be used for comparison.
  }

  function ensureListeningTo(rootContainerElement, registrationName) {
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
    let isCustomComponentTag; // We create tags in the namespace of their parent container, except HTML
    // tags get no namespace.
    const ownerDocument = getOwnerDocumentFromRootContainer(
      rootContainerElement,
    );
    let domElement;
    let namespaceURI = parentNamespace;

    if (namespaceURI === HTML_NAMESPACE$1) {
      namespaceURI = getIntrinsicNamespace(type);
    }

    if (namespaceURI === HTML_NAMESPACE$1) {
      {
        isCustomComponentTag = isCustomComponent(type, props); // Should this check be gated by parent namespace? Not sure we want to
        // allow <SVG> or <mATH>.

        if (!isCustomComponentTag && type !== type.toLowerCase()) {
          error(
            '<%s /> is using incorrect casing. ' +
              'Use PascalCase for React components, ' +
              'or lowercase for HTML elements.',
            type,
          );
        }
      }

      if (type === 'script') {
        // Create the script via .innerHTML so its "parser-inserted" flag is
        // set to true and it does not execute
        const div = ownerDocument.createElement('div');

        div.innerHTML = '<script><' + '/script>'; // eslint-disable-line
        // This is guaranteed to yield a script element.

        const firstChild = div.firstChild;

        domElement = div.removeChild(firstChild);
      } else if (typeof props.is === 'string') {
        // $FlowIssue `createElement` should be updated for Web Components
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

    {
      if (namespaceURI === HTML_NAMESPACE$1) {
        if (
          !isCustomComponentTag &&
          Object.prototype.toString.call(domElement) ===
            '[object HTMLUnknownElement]' &&
          !Object.prototype.hasOwnProperty.call(warnedUnknownTags, type)
        ) {
          warnedUnknownTags[type] = true;

          error(
            'The tag <%s> is unrecognized in this browser. ' +
              'If you meant to render a React component, start its name with ' +
              'an uppercase letter.',
            type,
          );
        }
      }
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

    {
      validatePropertiesInDevelopment(tag, rawProps);
    } // TODO: Make sure that we check isMounted before firing any of these events.

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
        validateProps(domElement, rawProps);
        props = getHostProps$1(domElement, rawProps);

        break;
      case 'select':
        initWrapperState$1(domElement, rawProps);
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

    assertValidProps(tag, props);
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
  } // Calculate the diff between the two objects.

  function diffProperties(
    domElement,
    tag,
    lastRawProps,
    nextRawProps,
    rootContainerElement,
  ) {
    {
      validatePropertiesInDevelopment(tag, nextRawProps);
    }

    let updatePayload = null;
    let lastProps;
    let nextProps;

    switch (tag) {
      case 'input':
        lastProps = getHostProps(domElement, lastRawProps);
        nextProps = getHostProps(domElement, nextRawProps);
        updatePayload = [];

        break;
      case 'option':
        lastProps = getHostProps$1(domElement, lastRawProps);
        nextProps = getHostProps$1(domElement, nextRawProps);
        updatePayload = [];

        break;
      case 'select':
        lastProps = getHostProps$2(domElement, lastRawProps);
        nextProps = getHostProps$2(domElement, nextRawProps);
        updatePayload = [];

        break;
      case 'textarea':
        lastProps = getHostProps$3(domElement, lastRawProps);
        nextProps = getHostProps$3(domElement, nextRawProps);
        updatePayload = [];

        break;
      default:
        lastProps = lastRawProps;
        nextProps = nextRawProps;

        if (
          typeof lastProps.onClick !== 'function' &&
          typeof nextProps.onClick === 'function'
        ) {
          // TODO: This cast may not be sound for SVG, MathML or custom elements.
          trapClickOnNonInteractiveElement(domElement);
        }

        break;
    }

    assertValidProps(tag, nextProps);

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
      } else if (
        propKey === DANGEROUSLY_SET_INNER_HTML ||
        propKey === CHILDREN
      );
      else if (
        propKey === SUPPRESS_CONTENT_EDITABLE_WARNING ||
        propKey === SUPPRESS_HYDRATION_WARNING
      );
      else if (propKey === AUTOFOCUS);
      else if (registrationNameModules.hasOwnProperty(propKey)) {
        // This is a special case. If any listener updates we need to ensure
        // that the "current" fiber pointer gets updated so we need a commit
        // to update this element.
        if (!updatePayload) {
          updatePayload = [];
        }
      } else {
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
      } else if (
        propKey === SUPPRESS_CONTENT_EDITABLE_WARNING ||
        propKey === SUPPRESS_HYDRATION_WARNING
      );
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
      {
        validateShorthandPropertyCollisionInDev(styleUpdates, nextProps[STYLE]);
      }

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

    // Update checked *before* name.
    // In the middle of an update, it is possible to have multiple checked.
    // When a checked radio tries to change name, browser makes another radio's checked false.
    if (
      tag === 'input' &&
      nextRawProps.type === 'radio' &&
      nextRawProps.name != null
    ) {
      updateChecked(domElement, nextRawProps);
    }

    const wasCustomComponentTag = isCustomComponent(tag, lastRawProps);
    const isCustomComponentTag = isCustomComponent(tag, nextRawProps); // Apply the diff.

    updateDOMProperties(
      domElement,
      updatePayload,
      wasCustomComponentTag,
      isCustomComponentTag,
    ); // TODO: Ensure that an update gets scheduled if any of the special props
    // changed.

    switch (tag) {
      case 'input':
        // Update the wrapper around inputs *after* updating props. This has to
        // happen after `updateDOMProperties`. Otherwise HTML5 input validations
        // raise warnings and prevent the new value from being assigned.
        updateWrapper(domElement, nextRawProps);

        break;
      case 'textarea':
        updateWrapper$1(domElement, nextRawProps);

        break;
      case 'select':
        // <select> value update needs to occur after <option> children
        // reconciliation
        postUpdateWrapper(domElement, nextRawProps);

        break;
    }
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

  function getOffsets(outerNode) {
    const ownerDocument = outerNode.ownerDocument;
    const win = (ownerDocument && ownerDocument.defaultView) || window;
    const selection = win.getSelection && win.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return null;
    }

    const anchorNode = selection.anchorNode,
      anchorOffset = selection.anchorOffset,
      focusNode = selection.focusNode,
      focusOffset = selection.focusOffset; // In Firefox, anchorNode and focusNode can be "anonymous divs", e.g. the
    // up/down buttons on an <input type="number">. Anonymous divs do not seem to
    // expose properties, triggering a "Permission denied error" if any of its
    // properties are accessed. The only seemingly possible way to avoid erroring
    // is to access a property that typically works for non-anonymous divs and
    // catch any error that may otherwise arise. See
    // https://bugzilla.mozilla.org/show_bug.cgi?id=208427

    try {
      /* eslint-disable no-unused-expressions */
      anchorNode.nodeType;
      focusNode.nodeType;
      /* eslint-enable no-unused-expressions */
    } catch (e) {
      return null;
    }

    return getModernOffsetsFromPoints(
      outerNode,
      anchorNode,
      anchorOffset,
      focusNode,
      focusOffset,
    );
  }

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
      selectionRange: hasSelectionCapabilities(focusedElem)
        ? getSelection(focusedElem)
        : null,
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

  /**
   * @getSelection: Gets the selection bounds of a focused textarea, input or
   * contentEditable node.
   * -@input: Look up selection bounds of this input
   * -@return {start: selectionStart, end: selectionEnd}
   */

  function getSelection(input) {
    let selection;

    if ('selectionStart' in input) {
      // Modern browser with input or textarea.
      selection = {
        start: input.selectionStart,
        end: input.selectionEnd,
      };
    } else {
      // Content editable or old IE textarea.
      selection = getOffsets(input);
    }

    return (
      selection || {
        start: 0,
        end: 0,
      }
    );
  }

  /**
   * @setSelection: Sets the selection bounds of a textarea or input and focuses
   * the input.
   * -@input     Set selection bounds of this input or textarea
   * -@offsets   Object of same form that is returned from get*
   */

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

  const validateDOMNesting = function () {};
  const updatedAncestorInfo = function () {};
  const SUSPENSE_START_DATA = '$';
  const SUSPENSE_END_DATA = '/$';
  const SUSPENSE_PENDING_START_DATA = '$?';
  const SUSPENSE_FALLBACK_START_DATA = '$!';
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

  function getChildHostContext(parentHostContext, type, rootContainerInstance) {
    {
      const parentHostContextDev = parentHostContext;
      const namespace = getChildNamespace(parentHostContextDev.namespace, type);
      const ancestorInfo = updatedAncestorInfo(
        parentHostContextDev.ancestorInfo,
        type,
      );

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

      validateDOMNesting(type, null, hostContextDev.ancestorInfo);

      if (
        typeof props.children === 'string' ||
        typeof props.children === 'number'
      ) {
        const string = '' + props.children;
        const ownAncestorInfo = updatedAncestorInfo(
          hostContextDev.ancestorInfo,
          type,
        );

        validateDOMNesting(null, string, ownAncestorInfo);
      }

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
    hostContext,
  ) {
    {
      const hostContextDev = hostContext;

      if (
        typeof newProps.children !== typeof oldProps.children &&
        (typeof newProps.children === 'string' ||
          typeof newProps.children === 'number')
      ) {
        const string = '' + newProps.children;
        const ownAncestorInfo = updatedAncestorInfo(
          hostContextDev.ancestorInfo,
          type,
        );

        validateDOMNesting(null, string, ownAncestorInfo);
      }
    }

    return diffProperties(
      domElement,
      type,
      oldProps,
      newProps,
      rootContainerInstance,
    );
  }

  function shouldSetTextContent(type, props) {
    return (
      type === 'textarea' ||
      type === 'option' ||
      type === 'noscript' ||
      typeof props.children === 'string' ||
      typeof props.children === 'number' ||
      (typeof props.dangerouslySetInnerHTML === 'object' &&
        props.dangerouslySetInnerHTML !== null &&
        props.dangerouslySetInnerHTML.__html != null)
    );
  }

  function shouldDeprioritizeSubtree(type, props) {
    return !!props.hidden;
  }

  // if a component just imports ReactDOM (e.g. for findDOMNode).
  // Some environments might not have setTimeout or clearTimeout.

  const cancelTimeout =
    typeof clearTimeout === 'function' ? clearTimeout : undefined;
  const noTimeout = -1; // -------------------

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

  function appendChildToContainer(container, child) {
    let parentNode;

    if (container.nodeType === COMMENT_NODE) {
      parentNode = container.parentNode;
      parentNode.insertBefore(child, container);
    } else {
      parentNode = container;
      parentNode.appendChild(child);
    } // This container might be used for a portal.
    // If something inside a portal is clicked, that click should bubble
    // through the React tree. However, on Mobile Safari the click would
    // never bubble through the *DOM* tree unless an ancestor with onclick
    // event exists. So we wouldn't see it and dispatch it.
    // This is why we ensure that non React root containers have inline onclick
    // defined.
    // https://github.com/facebook/react/issues/11918

    const reactRootContainer = container._reactRootContainer;

    if (
      (reactRootContainer === null || reactRootContainer === undefined) &&
      parentNode.onclick === null
    ) {
      // TODO: This cast may not be sound for SVG, MathML or custom elements.
      trapClickOnNonInteractiveElement(parentNode);
    }
  }

  function insertBefore(parentInstance, child, beforeChild) {
    parentInstance.insertBefore(child, beforeChild);
  }

  function insertInContainerBefore(container, child, beforeChild) {
    if (container.nodeType === COMMENT_NODE) {
      container.parentNode.insertBefore(child, beforeChild);
    } else {
      container.insertBefore(child, beforeChild);
    }
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

  function getParentSuspenseInstance(targetInstance) {
    let node = targetInstance.previousSibling; // Skip past all nodes within this suspense boundary.
    // There might be nested nodes so we need to keep track of how
    // deep we are and only break out when we're back on top.
    let depth = 0;

    while (node) {
      if (node.nodeType === COMMENT_NODE) {
        const data = node.data;

        if (
          data === SUSPENSE_START_DATA ||
          data === SUSPENSE_FALLBACK_START_DATA ||
          data === SUSPENSE_PENDING_START_DATA
        ) {
          if (depth === 0) {
            return node;
          } else {
            depth--;
          }
        } else if (data === SUSPENSE_END_DATA) {
          depth++;
        }
      }

      node = node.previousSibling;
    }

    return null;
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
        parentNode[internalContainerInstanceKey] ||
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
        const alternate = targetInst.alternate;

        if (
          targetInst.child !== null ||
          (alternate !== null && alternate.child !== null)
        ) {
          // Next we need to figure out if the node that skipped past is
          // nested within a dehydrated boundary and if so, which one.
          let suspenseInstance = getParentSuspenseInstance(targetNode);

          while (suspenseInstance !== null) {
            // We found a suspense instance. That means that we haven't
            // hydrated it yet. Even though we leave the comments in the
            // DOM after hydrating, and there are boundaries in the DOM
            // that could already be hydrated, we wouldn't have found them
            // through this pass since if the target is hydrated it would
            // have had an internalInstanceKey on it.
            // Let's get the fiber associated with the SuspenseComponent
            // as the deepest instance.
            const targetSuspenseInst = suspenseInstance[internalInstanceKey];

            if (targetSuspenseInst) {
              return targetSuspenseInst;
            } // If we don't find a Fiber on the comment, it might be because
            // we haven't gotten to hydrate it yet. There might still be a
            // parent boundary that hasn't above this one so we need to find
            // the outer most that is known.

            suspenseInstance = getParentSuspenseInstance(suspenseInstance); // If we don't find one, then that should mean that the parent
            // host component also hasn't hydrated yet. We can return it
            // below since it will bail out on the isMounted check later.
          }
        }

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
    } // Without this first invariant, passing a non-DOM-component triggers the next
    // invariant for a missing parent, which is super confusing.

    {
      {
        throw Error('getNodeFromInstance: Invalid argument.');
      }
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

  function isInteractive(tag) {
    return (
      tag === 'button' ||
      tag === 'input' ||
      tag === 'select' ||
      tag === 'textarea'
    );
  }

  function shouldPreventMouseEvent(name, type, props) {
    switch (name) {
      case 'onClick':
      case 'onClickCapture':
      case 'onDoubleClick':
      case 'onDoubleClickCapture':
      case 'onMouseDown':
      case 'onMouseDownCapture':
      case 'onMouseMove':
      case 'onMouseMoveCapture':
      case 'onMouseUp':
      case 'onMouseUpCapture':
      case 'onMouseEnter':
        return !!(props.disabled && isInteractive(type));
      default:
        return false;
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

    if (shouldPreventMouseEvent(registrationName, inst.type, props)) {
      return null;
    }

    if (!(!listener || typeof listener === 'function')) {
      {
        throw Error(
          'Expected `' +
            registrationName +
            '` listener to be a function, instead got a value of `' +
            typeof listener +
            '` type.',
        );
      }
    }

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
    {
      if (!inst) {
        error('Dispatching inst must not be null');
      }
    }

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

    const defaultPrevented =
      nativeEvent.defaultPrevented != null
        ? nativeEvent.defaultPrevented
        : nativeEvent.returnValue === false;

    if (defaultPrevented) {
      this.isDefaultPrevented = functionThatReturnsTrue;
    } else {
      this.isDefaultPrevented = functionThatReturnsFalse;
    }

    this.isPropagationStopped = functionThatReturnsFalse;

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

    if (!(event instanceof EventConstructor)) {
      {
        throw Error(
          'Trying to release an event instance into a pool of a different type.',
        );
      }
    }

    event.destructor();

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

    if (useFallbackCompositionData && !isUsingKoreanIME(nativeEvent)) {
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

    accumulateTwoPhaseDispatches(event);

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

  const BeforeInputEventPlugin = {
    eventTypes: eventTypes,
    extractEvents: function (
      topLevelType,
      targetInst,
      nativeEvent,
      nativeEventTarget,
      eventSystemFlags,
    ) {
      const composition = extractCompositionEvent(
        topLevelType,
        targetInst,
        nativeEvent,
        nativeEventTarget,
      );
      const beforeInput = extractBeforeInputEvent(
        topLevelType,
        targetInst,
        nativeEvent,
        nativeEventTarget,
      );

      if (composition === null) {
        return beforeInput;
      }

      if (beforeInput === null) {
        return composition;
      }

      return [composition, beforeInput];
    },
  };
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

  function shouldUseChangeEvent(elem) {
    const nodeName = elem.nodeName && elem.nodeName.toLowerCase();

    return (
      nodeName === 'select' || (nodeName === 'input' && elem.type === 'file')
    );
  }

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

  function getTargetInstForChangeEvent(topLevelType, targetInst) {
    if (topLevelType === TOP_CHANGE) {
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

  function handleControlledInputBlur(node) {
    const state = node._wrapperState;

    if (!state || !state.controlled || node.type !== 'number') {
      return;
    }

    {
      // If controlled, assign the value attribute to the current value on blur
      setDefaultValue(node, 'number', node.value);
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

  const ChangeEventPlugin = {
    eventTypes: eventTypes$1,
    _isInputEventSupported: isInputEventSupported,
    extractEvents: function (
      topLevelType,
      targetInst,
      nativeEvent,
      nativeEventTarget,
      eventSystemFlags,
    ) {
      const targetNode = targetInst
        ? getNodeFromInstance$1(targetInst)
        : window;
      let getTargetInstFunc, handleEventFunc;

      if (shouldUseChangeEvent(targetNode)) {
        getTargetInstFunc = getTargetInstForChangeEvent;
      } else if (isTextInputElement(targetNode)) {
        if (isInputEventSupported) {
          getTargetInstFunc = getTargetInstForInputOrChangeEvent;
        } else {
          getTargetInstFunc = getTargetInstForInputEventPolyfill;
          handleEventFunc = handleEventsForInputEventPolyfill;
        }
      } else if (shouldUseClickEvent(targetNode)) {
        getTargetInstFunc = getTargetInstForClickEvent;
      }

      if (getTargetInstFunc) {
        const inst = getTargetInstFunc(topLevelType, targetInst);

        if (inst) {
          const event = createAndAccumulateChangeEvent(
            inst,
            nativeEvent,
            nativeEventTarget,
          );

          return event;
        }
      }

      if (handleEventFunc) {
        handleEventFunc(topLevelType, targetNode, targetInst);
      } // When blurring, set the value attribute for number inputs

      if (topLevelType === TOP_BLUR) {
        handleControlledInputBlur(targetNode);
      }
    },
  };
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

  let previousScreenX = 0;
  let previousScreenY = 0; // Use flags to signal movementX/Y has already been set
  let isMovementXSet = false;
  let isMovementYSet = false;
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
    getModifierState: getEventModifierState,
    button: null,
    buttons: null,
    relatedTarget: function (event) {
      return (
        event.relatedTarget ||
        (event.fromElement === event.srcElement
          ? event.toElement
          : event.fromElement)
      );
    },
    movementX: function (event) {
      if ('movementX' in event) {
        return event.movementX;
      }

      const screenX = previousScreenX;

      previousScreenX = event.screenX;

      if (!isMovementXSet) {
        isMovementXSet = true;

        return 0;
      }

      return event.type === 'mousemove' ? event.screenX - screenX : 0;
    },
    movementY: function (event) {
      if ('movementY' in event) {
        return event.movementY;
      }

      const screenY = previousScreenY;

      previousScreenY = event.screenY;

      if (!isMovementYSet) {
        isMovementYSet = true;

        return 0;
      }

      return event.type === 'mousemove' ? event.screenY - screenY : 0;
    },
  });

  /**
   * @interface PointerEvent
   * @see http://www.w3.org/TR/pointerevents/
   */

  const SyntheticPointerEvent = SyntheticMouseEvent.extend({
    pointerId: null,
    width: null,
    height: null,
    pressure: null,
    tangentialPressure: null,
    tiltX: null,
    tiltY: null,
    twist: null,
    pointerType: null,
    isPrimary: null,
  });
  const eventTypes$2 = {
    mouseEnter: {
      registrationName: 'onMouseEnter',
      dependencies: [TOP_MOUSE_OUT, TOP_MOUSE_OVER],
    },
    mouseLeave: {
      registrationName: 'onMouseLeave',
      dependencies: [TOP_MOUSE_OUT, TOP_MOUSE_OVER],
    },
    pointerEnter: {
      registrationName: 'onPointerEnter',
      dependencies: [TOP_POINTER_OUT, TOP_POINTER_OVER],
    },
    pointerLeave: {
      registrationName: 'onPointerLeave',
      dependencies: [TOP_POINTER_OUT, TOP_POINTER_OVER],
    },
  };
  const EnterLeaveEventPlugin = {
    eventTypes: eventTypes$2,

    /**
     * For almost every interaction we care about, there will be both a top-level
     * `mouseover` and `mouseout` event that occurs. Only use `mouseout` so that
     * we do not extract duplicate events. However, moving the mouse into the
     * browser from outside will not fire a `mouseout` event. In this case, we use
     * the `mouseover` top-level event.
     */
    extractEvents: function (
      topLevelType,
      targetInst,
      nativeEvent,
      nativeEventTarget,
      eventSystemFlags,
    ) {
      const isOverEvent =
        topLevelType === TOP_MOUSE_OVER || topLevelType === TOP_POINTER_OVER;
      const isOutEvent =
        topLevelType === TOP_MOUSE_OUT || topLevelType === TOP_POINTER_OUT;

      if (
        isOverEvent &&
        (eventSystemFlags & IS_REPLAYED) === 0 &&
        (nativeEvent.relatedTarget || nativeEvent.fromElement)
      ) {
        // If this is an over event with a target, then we've already dispatched
        // the event in the out event of the other target. If this is replayed,
        // then it's because we couldn't dispatch against this target previously
        // so we have to do it now instead.
        return null;
      }

      if (!isOutEvent && !isOverEvent) {
        // Must not be a mouse or pointer in or out - ignoring.
        return null;
      }

      let win;

      if (nativeEventTarget.window === nativeEventTarget) {
        // `nativeEventTarget` is probably a window object.
        win = nativeEventTarget;
      } else {
        // TODO: Figure out why `ownerDocument` is sometimes undefined in IE8.
        const doc = nativeEventTarget.ownerDocument;

        if (doc) {
          win = doc.defaultView || doc.parentWindow;
        } else {
          win = window;
        }
      }

      let from;
      let to;

      if (isOutEvent) {
        from = targetInst;

        const related = nativeEvent.relatedTarget || nativeEvent.toElement;

        to = related ? getClosestInstanceFromNode(related) : null;

        if (to !== null) {
          const nearestMounted = getNearestMountedFiber(to);

          if (
            to !== nearestMounted ||
            (to.tag !== HostComponent && to.tag !== HostText)
          ) {
            to = null;
          }
        }
      } else {
        // Moving to a node from outside the window.
        from = null;
        to = targetInst;
      }

      if (from === to) {
        // Nothing pertains to our managed components.
        return null;
      }

      let eventInterface, leaveEventType, enterEventType, eventTypePrefix;

      if (topLevelType === TOP_MOUSE_OUT || topLevelType === TOP_MOUSE_OVER) {
        eventInterface = SyntheticMouseEvent;
        leaveEventType = eventTypes$2.mouseLeave;
        enterEventType = eventTypes$2.mouseEnter;
        eventTypePrefix = 'mouse';
      } else if (
        topLevelType === TOP_POINTER_OUT ||
        topLevelType === TOP_POINTER_OVER
      ) {
        eventInterface = SyntheticPointerEvent;
        leaveEventType = eventTypes$2.pointerLeave;
        enterEventType = eventTypes$2.pointerEnter;
        eventTypePrefix = 'pointer';
      }

      const fromNode = from == null ? win : getNodeFromInstance$1(from);
      const toNode = to == null ? win : getNodeFromInstance$1(to);
      const leave = eventInterface.getPooled(
        leaveEventType,
        from,
        nativeEvent,
        nativeEventTarget,
      );

      leave.type = eventTypePrefix + 'leave';
      leave.target = fromNode;
      leave.relatedTarget = toNode;

      const enter = eventInterface.getPooled(
        enterEventType,
        to,
        nativeEvent,
        nativeEventTarget,
      );

      enter.type = eventTypePrefix + 'enter';
      enter.target = toNode;
      enter.relatedTarget = fromNode;
      accumulateEnterLeaveDispatches(leave, enter, from, to); // If we are not processing the first ancestor, then we
      // should not process the same nativeEvent again, as we
      // will have already processed it in the first ancestor.

      if ((eventSystemFlags & IS_FIRST_ANCESTOR) === 0) {
        return [leave];
      }

      return [leave, enter];
    },
  };

  /**
   * inlined Object.is polyfill to avoid requiring consumers ship their own
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
   */
  function is(x, y) {
    return (
      (x === y && (x !== 0 || 1 / x === 1 / y)) || (x !== x && y !== y) // eslint-disable-line no-self-compare
    );
  }

  const objectIs = typeof Object.is === 'function' ? Object.is : is;
  const hasOwnProperty$2 = Object.prototype.hasOwnProperty;

  /**
   * Performs equality by iterating through keys on an object and returning false
   * when any key has values which are not strictly equal between the arguments.
   * Returns true when the values of all keys are strictly equal.
   */

  function shallowEqual(objA, objB) {
    if (objectIs(objA, objB)) {
      return true;
    }

    if (
      typeof objA !== 'object' ||
      objA === null ||
      typeof objB !== 'object' ||
      objB === null
    ) {
      return false;
    }

    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
      return false;
    } // Test for A's keys different from B.

    for (let i = 0; i < keysA.length; i++) {
      if (
        !hasOwnProperty$2.call(objB, keysA[i]) ||
        !objectIs(objA[keysA[i]], objB[keysA[i]])
      ) {
        return false;
      }
    }

    return true;
  }

  const skipSelectionChangeEvent =
    canUseDOM && 'documentMode' in document && document.documentMode <= 11;
  const eventTypes$3 = {
    select: {
      phasedRegistrationNames: {
        bubbled: 'onSelect',
        captured: 'onSelectCapture',
      },
      dependencies: [
        TOP_BLUR,
        TOP_CONTEXT_MENU,
        TOP_DRAG_END,
        TOP_FOCUS,
        TOP_KEY_DOWN,
        TOP_KEY_UP,
        TOP_MOUSE_DOWN,
        TOP_MOUSE_UP,
        TOP_SELECTION_CHANGE,
      ],
    },
  };
  let activeElement$1 = null;
  let activeElementInst$1 = null;
  let lastSelection = null;
  let mouseDown = false;

  /**
   * Get an object which is a unique representation of the current selection.
   *
   * The return value will not be consistent across nodes or browsers, but
   * two identical selections on the same node will return identical objects.
   *
   * @param {DOMElement} node
   * @return {object}
   */

  function getSelection$1(node) {
    if ('selectionStart' in node && hasSelectionCapabilities(node)) {
      return {
        start: node.selectionStart,
        end: node.selectionEnd,
      };
    } else {
      const win =
        (node.ownerDocument && node.ownerDocument.defaultView) || window;
      const selection = win.getSelection();

      return {
        anchorNode: selection.anchorNode,
        anchorOffset: selection.anchorOffset,
        focusNode: selection.focusNode,
        focusOffset: selection.focusOffset,
      };
    }
  }

  /**
   * Get document associated with the event target.
   *
   * @param {object} nativeEventTarget
   * @return {Document}
   */

  function getEventTargetDocument(eventTarget) {
    return eventTarget.window === eventTarget
      ? eventTarget.document
      : eventTarget.nodeType === DOCUMENT_NODE
      ? eventTarget
      : eventTarget.ownerDocument;
  }

  /**
   * Poll selection to see whether it's changed.
   *
   * @param {object} nativeEvent
   * @param {object} nativeEventTarget
   * @return {?SyntheticEvent}
   */

  function constructSelectEvent(nativeEvent, nativeEventTarget) {
    // Ensure we have the right element, and that the user is not dragging a
    // selection (this matches native `select` event behavior). In HTML5, select
    // fires only on input and textarea thus if there's no focused element we
    // won't dispatch.
    const doc = getEventTargetDocument(nativeEventTarget);

    if (
      mouseDown ||
      activeElement$1 == null ||
      activeElement$1 !== getActiveElement(doc)
    ) {
      return null;
    } // Only fire when selection has actually changed.

    const currentSelection = getSelection$1(activeElement$1);

    if (!lastSelection || !shallowEqual(lastSelection, currentSelection)) {
      lastSelection = currentSelection;

      const syntheticEvent = SyntheticEvent.getPooled(
        eventTypes$3.select,
        activeElementInst$1,
        nativeEvent,
        nativeEventTarget,
      );

      syntheticEvent.type = 'select';
      syntheticEvent.target = activeElement$1;
      accumulateTwoPhaseDispatches(syntheticEvent);

      return syntheticEvent;
    }

    return null;
  }

  /**
   * This plugin creates an `onSelect` event that normalizes select events
   * across form elements.
   *
   * Supported elements are:
   * - input (see `isTextInputElement`)
   * - textarea
   * - contentEditable
   *
   * This differs from native browser implementations in the following ways:
   * - Fires on contentEditable fields as well as inputs.
   * - Fires for collapsed selection.
   * - Fires after user input.
   */

  const SelectEventPlugin = {
    eventTypes: eventTypes$3,
    extractEvents: function (
      topLevelType,
      targetInst,
      nativeEvent,
      nativeEventTarget,
      eventSystemFlags,
      container,
    ) {
      const containerOrDoc =
        container || getEventTargetDocument(nativeEventTarget); // Track whether all listeners exists for this plugin. If none exist, we do
      // not extract events. See #3639.

      if (
        !containerOrDoc ||
        !isListeningToAllDependencies('onSelect', containerOrDoc)
      ) {
        return null;
      }

      const targetNode = targetInst
        ? getNodeFromInstance$1(targetInst)
        : window;

      switch (topLevelType) {
        // Track the input node that has focus.
        case TOP_FOCUS:
          if (
            isTextInputElement(targetNode) ||
            targetNode.contentEditable === 'true'
          ) {
            activeElement$1 = targetNode;
            activeElementInst$1 = targetInst;
            lastSelection = null;
          }

          break;
        case TOP_BLUR:
          activeElement$1 = null;
          activeElementInst$1 = null;
          lastSelection = null;

          break;
        // Don't fire the event while the user is dragging. This matches the
        // semantics of the native select event.
        case TOP_MOUSE_DOWN:
          mouseDown = true;

          break;
        case TOP_CONTEXT_MENU:
        case TOP_MOUSE_UP:
        case TOP_DRAG_END:
          mouseDown = false;

          return constructSelectEvent(nativeEvent, nativeEventTarget);
        // Chrome and IE fire non-standard event when selection is changed (and
        // sometimes when it hasn't). IE's event fires out of order with respect
        // to key and input events on deletion, so we discard it.
        //
        // Firefox doesn't support selectionchange, so check selection status
        // after each key entry. The selection changes after keydown and before
        // keyup, but we check on keydown as well in the case of holding down a
        // key, when multiple keydown events are fired but only one keyup is.
        // This is also our approach for IE handling, for the reason above.
        case TOP_SELECTION_CHANGE:
          if (skipSelectionChangeEvent) {
            break;
          }

        // falls through

        case TOP_KEY_DOWN:
        case TOP_KEY_UP:
          return constructSelectEvent(nativeEvent, nativeEventTarget);
      }

      return null;
    },
  };

  /**
   * @interface Event
   * @see http://www.w3.org/TR/css3-animations/#AnimationEvent-interface
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AnimationEvent
   */

  const SyntheticAnimationEvent = SyntheticEvent.extend({
    animationName: null,
    elapsedTime: null,
    pseudoElement: null,
  });

  /**
   * @interface Event
   * @see http://www.w3.org/TR/clipboard-apis/
   */

  const SyntheticClipboardEvent = SyntheticEvent.extend({
    clipboardData: function (event) {
      return 'clipboardData' in event
        ? event.clipboardData
        : window.clipboardData;
    },
  });

  /**
   * @interface FocusEvent
   * @see http://www.w3.org/TR/DOM-Level-3-Events/
   */

  const SyntheticFocusEvent = SyntheticUIEvent.extend({
    relatedTarget: null,
  });

  /**
   * `charCode` represents the actual "character code" and is safe to use with
   * `String.fromCharCode`. As such, only keys that correspond to printable
   * characters produce a valid `charCode`, the only exception to this is Enter.
   * The Tab-key is considered non-printable and does not have a `charCode`,
   * presumably because it does not produce a tab-character in browsers.
   *
   * @param {object} nativeEvent Native browser event.
   * @return {number} Normalized `charCode` property.
   */
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

  const normalizeKey = {
    Esc: 'Escape',
    Spacebar: ' ',
    Left: 'ArrowLeft',
    Up: 'ArrowUp',
    Right: 'ArrowRight',
    Down: 'ArrowDown',
    Del: 'Delete',
    Win: 'OS',
    Menu: 'ContextMenu',
    Apps: 'ContextMenu',
    Scroll: 'ScrollLock',
    MozPrintableKey: 'Unidentified',
  };
  /**
   * Translation from legacy `keyCode` to HTML5 `key`
   * Only special keys supported, all others depend on keyboard layout or browser
   * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#Key_names
   */
  const translateToKey = {
    '8': 'Backspace',
    '9': 'Tab',
    '12': 'Clear',
    '13': 'Enter',
    '16': 'Shift',
    '17': 'Control',
    '18': 'Alt',
    '19': 'Pause',
    '20': 'CapsLock',
    '27': 'Escape',
    '32': ' ',
    '33': 'PageUp',
    '34': 'PageDown',
    '35': 'End',
    '36': 'Home',
    '37': 'ArrowLeft',
    '38': 'ArrowUp',
    '39': 'ArrowRight',
    '40': 'ArrowDown',
    '45': 'Insert',
    '46': 'Delete',
    '112': 'F1',
    '113': 'F2',
    '114': 'F3',
    '115': 'F4',
    '116': 'F5',
    '117': 'F6',
    '118': 'F7',
    '119': 'F8',
    '120': 'F9',
    '121': 'F10',
    '122': 'F11',
    '123': 'F12',
    '144': 'NumLock',
    '145': 'ScrollLock',
    '224': 'Meta',
  };

  /**
   * @param {object} nativeEvent Native browser event.
   * @return {string} Normalized `key` property.
   */

  function getEventKey(nativeEvent) {
    if (nativeEvent.key) {
      // Normalize inconsistent values reported by browsers due to
      // implementations of a working draft specification.
      // FireFox implements `key` but returns `MozPrintableKey` for all
      // printable characters (normalized to `Unidentified`), ignore it.
      const key = normalizeKey[nativeEvent.key] || nativeEvent.key;

      if (key !== 'Unidentified') {
        return key;
      }
    } // Browser does not implement `key`, polyfill as much of it as we can.

    if (nativeEvent.type === 'keypress') {
      const charCode = getEventCharCode(nativeEvent); // The enter-key is technically both printable and non-printable and can
      // thus be captured by `keypress`, no other non-printable key should.

      return charCode === 13 ? 'Enter' : String.fromCharCode(charCode);
    }

    if (nativeEvent.type === 'keydown' || nativeEvent.type === 'keyup') {
      // While user keyboard layout determines the actual meaning of each
      // `keyCode` value, almost all function keys have a universal value.
      return translateToKey[nativeEvent.keyCode] || 'Unidentified';
    }

    return '';
  }

  /**
   * @interface KeyboardEvent
   * @see http://www.w3.org/TR/DOM-Level-3-Events/
   */

  const SyntheticKeyboardEvent = SyntheticUIEvent.extend({
    key: getEventKey,
    location: null,
    ctrlKey: null,
    shiftKey: null,
    altKey: null,
    metaKey: null,
    repeat: null,
    locale: null,
    getModifierState: getEventModifierState,
    // Legacy Interface
    charCode: function (event) {
      // `charCode` is the result of a KeyPress event and represents the value of
      // the actual printable character.
      // KeyPress is deprecated, but its replacement is not yet final and not
      // implemented in any major browser. Only KeyPress has charCode.
      if (event.type === 'keypress') {
        return getEventCharCode(event);
      }

      return 0;
    },
    keyCode: function (event) {
      // `keyCode` is the result of a KeyDown/Up event and represents the value of
      // physical keyboard key.
      // The actual meaning of the value depends on the users' keyboard layout
      // which cannot be detected. Assuming that it is a US keyboard layout
      // provides a surprisingly accurate mapping for US and European users.
      // Due to this, it is left to the user to implement at this time.
      if (event.type === 'keydown' || event.type === 'keyup') {
        return event.keyCode;
      }

      return 0;
    },
    which: function (event) {
      // `which` is an alias for either `keyCode` or `charCode` depending on the
      // type of the event.
      if (event.type === 'keypress') {
        return getEventCharCode(event);
      }

      if (event.type === 'keydown' || event.type === 'keyup') {
        return event.keyCode;
      }

      return 0;
    },
  });

  /**
   * @interface DragEvent
   * @see http://www.w3.org/TR/DOM-Level-3-Events/
   */

  const SyntheticDragEvent = SyntheticMouseEvent.extend({
    dataTransfer: null,
  });

  /**
   * @interface TouchEvent
   * @see http://www.w3.org/TR/touch-events/
   */

  const SyntheticTouchEvent = SyntheticUIEvent.extend({
    touches: null,
    targetTouches: null,
    changedTouches: null,
    altKey: null,
    metaKey: null,
    ctrlKey: null,
    shiftKey: null,
    getModifierState: getEventModifierState,
  });

  /**
   * @interface Event
   * @see http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-events-
   * @see https://developer.mozilla.org/en-US/docs/Web/API/TransitionEvent
   */

  const SyntheticTransitionEvent = SyntheticEvent.extend({
    propertyName: null,
    elapsedTime: null,
    pseudoElement: null,
  });

  /**
   * @interface WheelEvent
   * @see http://www.w3.org/TR/DOM-Level-3-Events/
   */

  const SyntheticWheelEvent = SyntheticMouseEvent.extend({
    deltaX: function (event) {
      return 'deltaX' in event
        ? event.deltaX // Fallback to `wheelDeltaX` for Webkit and normalize (right is positive).
        : 'wheelDeltaX' in event
        ? -event.wheelDeltaX
        : 0;
    },
    deltaY: function (event) {
      return 'deltaY' in event
        ? event.deltaY // Fallback to `wheelDeltaY` for Webkit and normalize (down is positive).
        : 'wheelDeltaY' in event
        ? -event.wheelDeltaY // Fallback to `wheelDelta` for IE<9 and normalize (down is positive).
        : 'wheelDelta' in event
        ? -event.wheelDelta
        : 0;
    },
    deltaZ: null,
    // Browsers without "deltaMode" is reporting in raw wheel delta where one
    // notch on the scroll is always +/- 120, roughly equivalent to pixels.
    // A good approximation of DOM_DELTA_LINE (1) is 5% of viewport size or
    // ~40 pixels, for DOM_DELTA_SCREEN (2) it is 87.5% of viewport size.
    deltaMode: null,
  });
  const knownHTMLTopLevelTypes = [
    TOP_ABORT,
    TOP_CANCEL,
    TOP_CAN_PLAY,
    TOP_CAN_PLAY_THROUGH,
    TOP_CLOSE,
    TOP_DURATION_CHANGE,
    TOP_EMPTIED,
    TOP_ENCRYPTED,
    TOP_ENDED,
    TOP_ERROR,
    TOP_INPUT,
    TOP_INVALID,
    TOP_LOAD,
    TOP_LOADED_DATA,
    TOP_LOADED_METADATA,
    TOP_LOAD_START,
    TOP_PAUSE,
    TOP_PLAY,
    TOP_PLAYING,
    TOP_PROGRESS,
    TOP_RATE_CHANGE,
    TOP_RESET,
    TOP_SEEKED,
    TOP_SEEKING,
    TOP_STALLED,
    TOP_SUBMIT,
    TOP_SUSPEND,
    TOP_TIME_UPDATE,
    TOP_TOGGLE,
    TOP_VOLUME_CHANGE,
    TOP_WAITING,
  ];
  const SimpleEventPlugin = {
    // simpleEventPluginEventTypes gets populated from
    // the DOMEventProperties module.
    eventTypes: simpleEventPluginEventTypes,
    extractEvents: function (
      topLevelType,
      targetInst,
      nativeEvent,
      nativeEventTarget,
      eventSystemFlags,
    ) {
      const dispatchConfig = topLevelEventsToDispatchConfig.get(topLevelType);

      if (!dispatchConfig) {
        return null;
      }

      let EventConstructor;

      switch (topLevelType) {
        case TOP_KEY_PRESS:
          // Firefox creates a keypress event for function keys too. This removes
          // the unwanted keypress events. Enter is however both printable and
          // non-printable. One would expect Tab to be as well (but it isn't).
          if (getEventCharCode(nativeEvent) === 0) {
            return null;
          }

        /* falls through */

        case TOP_KEY_DOWN:
        case TOP_KEY_UP:
          EventConstructor = SyntheticKeyboardEvent;

          break;
        case TOP_BLUR:
        case TOP_FOCUS:
          EventConstructor = SyntheticFocusEvent;

          break;
        case TOP_CLICK:
          // Firefox creates a click event on right mouse clicks. This removes the
          // unwanted click events.
          if (nativeEvent.button === 2) {
            return null;
          }

        /* falls through */

        case TOP_AUX_CLICK:
        case TOP_DOUBLE_CLICK:
        case TOP_MOUSE_DOWN:
        case TOP_MOUSE_MOVE:
        case TOP_MOUSE_UP: // TODO: Disabled elements should not respond to mouse events

        /* falls through */

        case TOP_MOUSE_OUT:
        case TOP_MOUSE_OVER:
        case TOP_CONTEXT_MENU:
          EventConstructor = SyntheticMouseEvent;

          break;
        case TOP_DRAG:
        case TOP_DRAG_END:
        case TOP_DRAG_ENTER:
        case TOP_DRAG_EXIT:
        case TOP_DRAG_LEAVE:
        case TOP_DRAG_OVER:
        case TOP_DRAG_START:
        case TOP_DROP:
          EventConstructor = SyntheticDragEvent;

          break;
        case TOP_TOUCH_CANCEL:
        case TOP_TOUCH_END:
        case TOP_TOUCH_MOVE:
        case TOP_TOUCH_START:
          EventConstructor = SyntheticTouchEvent;

          break;
        case TOP_ANIMATION_END:
        case TOP_ANIMATION_ITERATION:
        case TOP_ANIMATION_START:
          EventConstructor = SyntheticAnimationEvent;

          break;
        case TOP_TRANSITION_END:
          EventConstructor = SyntheticTransitionEvent;

          break;
        case TOP_SCROLL:
          EventConstructor = SyntheticUIEvent;

          break;
        case TOP_WHEEL:
          EventConstructor = SyntheticWheelEvent;

          break;
        case TOP_COPY:
        case TOP_CUT:
        case TOP_PASTE:
          EventConstructor = SyntheticClipboardEvent;

          break;
        case TOP_GOT_POINTER_CAPTURE:
        case TOP_LOST_POINTER_CAPTURE:
        case TOP_POINTER_CANCEL:
        case TOP_POINTER_DOWN:
        case TOP_POINTER_MOVE:
        case TOP_POINTER_OUT:
        case TOP_POINTER_OVER:
        case TOP_POINTER_UP:
          EventConstructor = SyntheticPointerEvent;

          break;
        default:
          {
            if (knownHTMLTopLevelTypes.indexOf(topLevelType) === -1) {
              error(
                'SimpleEventPlugin: Unhandled event type, `%s`. This warning ' +
                  'is likely caused by a bug in React. Please file an issue.',
                topLevelType,
              );
            }
          } // HTML Events
          // @see http://www.w3.org/TR/html5/index.html#events-0

          EventConstructor = SyntheticEvent;

          break;
      }

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
    'ResponderEventPlugin',
    'SimpleEventPlugin',
    'EnterLeaveEventPlugin',
    'ChangeEventPlugin',
    'SelectEventPlugin',
    'BeforeInputEventPlugin',
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
    EnterLeaveEventPlugin: EnterLeaveEventPlugin,
    ChangeEventPlugin: ChangeEventPlugin,
    SelectEventPlugin: SelectEventPlugin,
    BeforeInputEventPlugin: BeforeInputEventPlugin,
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

  const emptyContextObject = {};
  const contextStackCursor = createCursor(emptyContextObject); // A cursor to a boolean indicating whether the context has changed.
  const didPerformWorkStackCursor = createCursor(false); // Keep track of the previous context object that was on the stack.
  // We use this to get access to the parent context after we have already
  // pushed the next context provider, and now need to merge their contexts.

  function popTopLevelContextObject(fiber) {
    {
      pop(didPerformWorkStackCursor, fiber);
      pop(contextStackCursor, fiber);
    }
  }

  const LegacyRoot = 0;
  const BlockingRoot = 1;
  const ConcurrentRoot = 2;
  const ReactInternals$2 =
    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  const _ReactInternals$Sched$1 = ReactInternals$2.SchedulerTracing,
    __interactionsRef = _ReactInternals$Sched$1.__interactionsRef,
    __subscriberRef = _ReactInternals$Sched$1.__subscriberRef,
    unstable_clear = _ReactInternals$Sched$1.unstable_clear,
    unstable_getCurrent = _ReactInternals$Sched$1.unstable_getCurrent,
    unstable_getThreadID = _ReactInternals$Sched$1.unstable_getThreadID,
    unstable_subscribe = _ReactInternals$Sched$1.unstable_subscribe,
    unstable_trace = _ReactInternals$Sched$1.unstable_trace,
    unstable_unsubscribe = _ReactInternals$Sched$1.unstable_unsubscribe,
    unstable_wrap = _ReactInternals$Sched$1.unstable_wrap;
  const Scheduler_runWithPriority = unstable_runWithPriority,
    Scheduler_scheduleCallback = unstable_scheduleCallback,
    Scheduler_cancelCallback = unstable_cancelCallback,
    Scheduler_shouldYield = unstable_shouldYield,
    Scheduler_requestPaint = unstable_requestPaint,
    Scheduler_now = unstable_now,
    Scheduler_getCurrentPriorityLevel = unstable_getCurrentPriorityLevel,
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
  const requestPaint = // Fall back gracefully if we're running an older version of Scheduler.
    Scheduler_requestPaint !== undefined
      ? Scheduler_requestPaint
      : function () {};
  let syncQueue = null;
  let immediateQueueCallbackNode = null;
  let isFlushingSyncQueue = false;
  const initialTimeMs = Scheduler_now(); // If the initial timestamp is reasonably small, use Scheduler's `now` directly.
  // This will be the case for modern browsers that support `performance.now`. In
  // older browsers, Scheduler falls back to `Date.now`, which returns a Unix
  // timestamp. In that case, subtract the module initialization time to simulate
  // the behavior of performance.now and keep our times small enough to fit
  // within 32 bits.
  // TODO: Consider lifting this into Scheduler.
  const now =
    initialTimeMs < 10000
      ? Scheduler_now
      : function () {
          return Scheduler_now() - initialTimeMs;
        };

  function getCurrentPriorityLevel() {
    switch (Scheduler_getCurrentPriorityLevel()) {
      case Scheduler_ImmediatePriority:
        return ImmediatePriority;
      case Scheduler_UserBlockingPriority:
        return UserBlockingPriority$1;
      case Scheduler_NormalPriority:
        return NormalPriority;
      case Scheduler_LowPriority:
        return LowPriority;
      case Scheduler_IdlePriority:
        return IdlePriority;
      default: {
        {
          throw Error('Unknown priority level.');
        }
      }
    }
  }

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

  function cancelCallback(callbackNode) {
    if (callbackNode !== fakeCallbackNode) {
      Scheduler_cancelCallback(callbackNode);
    }
  }

  function flushSyncCallbackQueue() {
    if (immediateQueueCallbackNode !== null) {
      const node = immediateQueueCallbackNode;

      immediateQueueCallbackNode = null;
      Scheduler_cancelCallback(node);
    }

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

  const NoMode = 0;
  const StrictMode = 1; // TODO: Remove BlockingMode and ConcurrentMode by reading from the root
  // tag instead
  const BlockingMode = 2;
  const ConcurrentMode = 4;
  const ProfileMode = 8;
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
  const Never = 1; // Idle is slightly higher priority than Never. It must completely finish in
  // order to be consistent.
  const Idle = 2; // Continuous Hydration is slightly higher than Idle and is used to increase
  // priority of hover targets.
  const Sync = MAX_SIGNED_31_BIT_INT;
  const Batched = Sync - 1;
  const UNIT_SIZE = 10;
  const MAGIC_NUMBER_OFFSET = Batched - 1; // 1 unit of expiration time represents 10ms.

  function msToExpirationTime(ms) {
    // Always subtract from the offset so that we don't clash with the magic number for NoWork.
    return MAGIC_NUMBER_OFFSET - ((ms / UNIT_SIZE) | 0);
  }

  function expirationTimeToMs(expirationTime) {
    return (MAGIC_NUMBER_OFFSET - expirationTime) * UNIT_SIZE;
  }

  function ceiling(num, precision) {
    return (((num / precision) | 0) + 1) * precision;
  }

  function computeExpirationBucket(currentTime, expirationInMs, bucketSizeMs) {
    return (
      MAGIC_NUMBER_OFFSET -
      ceiling(
        MAGIC_NUMBER_OFFSET - currentTime + expirationInMs / UNIT_SIZE,
        bucketSizeMs / UNIT_SIZE,
      )
    );
  } // TODO: This corresponds to Scheduler's NormalPriority, not LowPriority. Update
  // the names to reflect.

  const LOW_PRIORITY_EXPIRATION = 5000;
  const LOW_PRIORITY_BATCH_SIZE = 250;

  function computeAsyncExpiration(currentTime) {
    return computeExpirationBucket(
      currentTime,
      LOW_PRIORITY_EXPIRATION,
      LOW_PRIORITY_BATCH_SIZE,
    );
  }

  function computeSuspenseExpiration(currentTime, timeoutMs) {
    // TODO: Should we warn if timeoutMs is lower than the normal pri expiration time?
    return computeExpirationBucket(
      currentTime,
      timeoutMs,
      LOW_PRIORITY_BATCH_SIZE,
    );
  } // We intentionally set a higher expiration time for interactive updates in
  // dev than in production.
  //
  // If the main thread is being blocked so long that you hit the expiration,
  // it's a problem that could be solved with better scheduling.
  //
  // People will be more likely to notice this and fix it with the long
  // expiration time in development.
  //
  // In production we opt for better UX at the risk of masking scheduling
  // problems, by expiring fast.

  const HIGH_PRIORITY_EXPIRATION = 500;
  const HIGH_PRIORITY_BATCH_SIZE = 100;

  function computeInteractiveExpiration(currentTime) {
    return computeExpirationBucket(
      currentTime,
      HIGH_PRIORITY_EXPIRATION,
      HIGH_PRIORITY_BATCH_SIZE,
    );
  }

  function inferPriorityFromExpirationTime(currentTime, expirationTime) {
    if (expirationTime === Sync) {
      return ImmediatePriority;
    }

    if (expirationTime === Never || expirationTime === Idle) {
      return IdlePriority;
    }

    const msUntil =
      expirationTimeToMs(expirationTime) - expirationTimeToMs(currentTime);

    if (msUntil <= 0) {
      return ImmediatePriority;
    }

    if (msUntil <= HIGH_PRIORITY_EXPIRATION + HIGH_PRIORITY_BATCH_SIZE) {
      return UserBlockingPriority$1;
    }

    if (msUntil <= LOW_PRIORITY_EXPIRATION + LOW_PRIORITY_BATCH_SIZE) {
      return NormalPriority;
    } // TODO: Handle LowPriority
    // Assume anything lower has idle priority

    return IdlePriority;
  }

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
  let didWarnUpdateInsideUpdate;
  let currentlyProcessingQueue;

  {
    didWarnUpdateInsideUpdate = false;
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

  function createUpdate(expirationTime, suspenseConfig) {
    console.log(['createUpdate'], expirationTime, suspenseConfig);

    const update = {
      expirationTime: expirationTime,
      suspenseConfig: suspenseConfig,
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

    {
      if (
        currentlyProcessingQueue === sharedQueue &&
        !didWarnUpdateInsideUpdate
      ) {
        error(
          'An update (setState, replaceState, or forceUpdate) was scheduled ' +
            'from inside an update function. Update functions should be pure, ' +
            'with zero side-effects. Consider using componentDidUpdate or a ' +
            'callback.',
        );

        didWarnUpdateInsideUpdate = true;
      }
    }
  }

  function getStateFromUpdate(
    workInProgress,
    queue,
    update,
    prevState,
    nextProps,
    instance,
  ) {
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
    renderExpirationTime,
  ) {
    // This is always non-null on a ClassComponent or HostRoot
    const queue = workInProgress.updateQueue;

    hasForceUpdate = false;

    {
      currentlyProcessingQueue = queue.shared;
    } // The last rebase update that is NOT part of the base state.

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

          if (updateExpirationTime < renderExpirationTime) {
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

            markRenderEventTimeAndConfig(
              updateExpirationTime,
              update.suspenseConfig,
            ); // Process this update.

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

      markUnprocessedUpdateTime(newExpirationTime);
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
        console.log(['test'], child.key === key);

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
  const contextFiberStackCursor = createCursor(NO_CONTEXT);
  const rootInstanceStackCursor = createCursor(NO_CONTEXT);

  function requiredContext(c) {
    if (!(c !== NO_CONTEXT)) {
      {
        throw Error(
          'Expected host context to exist. This error is likely caused by a bug in React. Please file an issue.',
        );
      }
    }

    return c;
  }

  function getRootHostContainer() {
    const rootInstance = requiredContext(rootInstanceStackCursor.current);

    return rootInstance;
  }

  function pushHostContainer(fiber, nextRootInstance) {
    // Push current root instance onto the stack;
    // This allows us to reset root when portals are popped.
    push(rootInstanceStackCursor, nextRootInstance, fiber); // Track the context and the Fiber that provided it.

    const nextRootContext = getRootHostContext(nextRootInstance); // Now that we know this function doesn't throw, replace it.

    pop(contextStackCursor$1, fiber);
    push(contextStackCursor$1, nextRootContext, fiber);
  }

  function popHostContainer(fiber) {
    pop(contextStackCursor$1, fiber);
    pop(contextFiberStackCursor, fiber);
    pop(rootInstanceStackCursor, fiber);
  }

  function getHostContext() {
    const context = requiredContext(contextStackCursor$1.current);

    return context;
  }

  function pushHostContext(fiber) {
    const rootInstance = requiredContext(rootInstanceStackCursor.current);
    const context = requiredContext(contextStackCursor$1.current);
    const nextContext = getChildHostContext(context, fiber.type); // Don't push this Fiber's context unless it's unique.

    if (context === nextContext) {
      return;
    } // Track the context and the Fiber that provided it.
    // This enables us to pop only Fibers that provide unique contexts.

    push(contextFiberStackCursor, fiber, fiber);
    push(contextStackCursor$1, nextContext, fiber);
  }

  const ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
  // These are set right before calling the component.
  let renderExpirationTime = NoWork; // The work-in-progress fiber. I've named it differently to distinguish it from
  // the work-in-progress hook.
  let currentlyRenderingFiber$1 = null; // Hooks are stored as a linked list on the fiber's memoizedState field. The
  // current hook list is the list that belongs to the current fiber. The
  // work-in-progress hook list is a new list that will be added to the
  // work-in-progress fiber.
  let currentHook = null;
  let workInProgressHook = null; // Whether an update was scheduled at any point during the render phase. This
  // does not get reset if we do another render pass; only when we're completely
  // finished evaluating this component. This is an optimization so we know
  // whether we need to clear render phase updates after a throw.
  let didScheduleRenderPhaseUpdate = false;
  let currentHookNameInDev = null; // In DEV, this list ensures that hooks are called in the same order between renders.
  // The list stores the order of hooks used during the initial render (mount).
  // Subsequent renders (updates) reference this list.
  let hookTypesDev = null;
  let hookTypesUpdateIndexDev = -1; // In DEV, this tracks whether currently rendering component needs to ignore
  // the dependencies for Hooks that need them (e.g. useEffect or useMemo).
  // When true, such Hooks will always be "remounted". Only used during hot reload.
  const ignorePreviousDependencies = false;

  function renderWithHooks(
    current,
    workInProgress,
    Component,
    props,
    secondArg,
    nextRenderExpirationTime,
  ) {
    console.log(['renderWithHooks'], {
      current,
      workInProgress,
      Component,
      props,
      secondArg,
      nextRenderExpirationTime,
    });
    renderExpirationTime = nextRenderExpirationTime;
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

    renderExpirationTime = NoWork;
    currentlyRenderingFiber$1 = null;
    currentHook = null;
    workInProgressHook = null;

    {
      currentHookNameInDev = null;
      hookTypesDev = null;
      hookTypesUpdateIndexDev = -1;
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
      nextWorkInProgressHook = workInProgressHook.next;
      currentHook = nextCurrentHook;
    } else {
      // Clone from the current hook.
      if (!(nextCurrentHook !== null)) {
        {
          throw Error('Rendered more hooks than during the previous render.');
        }
      }

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

  function updateReducer(reducer, initialArg, init) {
    const hook = updateWorkInProgressHook();
    const queue = hook.queue;

    if (!(queue !== null)) {
      {
        throw Error(
          'Should have a queue. This is likely a bug in React. Please file an issue.',
        );
      }
    }

    queue.lastRenderedReducer = reducer;

    const current = currentHook; // The last rebase update that is NOT part of the base state.
    let baseQueue = current.baseQueue; // The last pending update that hasn't been processed yet.
    const pendingQueue = queue.pending;

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

      current.baseQueue = baseQueue = pendingQueue;
      queue.pending = null;
    }

    if (baseQueue !== null) {
      // We have a queue to process.
      const first = baseQueue.next;
      let newState = current.baseState;
      let newBaseState = null;
      let newBaseQueueFirst = null;
      let newBaseQueueLast = null;
      let update = first;

      do {
        const updateExpirationTime = update.expirationTime;

        if (updateExpirationTime < renderExpirationTime) {
          // Priority is insufficient. Skip this update. If this is the first
          // skipped update, the previous update/state is the new base
          // update/state.
          const clone = {
            expirationTime: update.expirationTime,
            suspenseConfig: update.suspenseConfig,
            action: update.action,
            eagerReducer: update.eagerReducer,
            eagerState: update.eagerState,
            next: null,
          };

          if (newBaseQueueLast === null) {
            newBaseQueueFirst = newBaseQueueLast = clone;
            newBaseState = newState;
          } else {
            newBaseQueueLast = newBaseQueueLast.next = clone;
          } // Update the remaining priority in the queue.

          if (updateExpirationTime > currentlyRenderingFiber$1.expirationTime) {
            currentlyRenderingFiber$1.expirationTime = updateExpirationTime;
            markUnprocessedUpdateTime(updateExpirationTime);
          }
        } else {
          // This update does have sufficient priority.
          if (newBaseQueueLast !== null) {
            const _clone = {
              expirationTime: Sync,
              // This update is going to be committed so we never want uncommit it.
              suspenseConfig: update.suspenseConfig,
              action: update.action,
              eagerReducer: update.eagerReducer,
              eagerState: update.eagerState,
              next: null,
            };

            newBaseQueueLast = newBaseQueueLast.next = _clone;
          } // Mark the event time of this update as relevant to this render pass.
          // TODO: This should ideally use the true event time of this update rather than
          // its priority which is a derived and not reverseable value.
          // TODO: We should skip this update if it was already committed but currently
          // we have no way of detecting the difference between a committed and suspended
          // update here.

          markRenderEventTimeAndConfig(
            updateExpirationTime,
            update.suspenseConfig,
          ); // Process this update.

          if (update.eagerReducer === reducer) {
            // If this update was processed eagerly, and its reducer matches the
            // current reducer, we can use the eagerly computed state.
            newState = update.eagerState;
          } else {
            const action = update.action;

            newState = reducer(newState, action);
          }
        }

        update = update.next;
      } while (update !== null && update !== first);

      if (newBaseQueueLast === null) {
        newBaseState = newState;
      } else {
        newBaseQueueLast.next = newBaseQueueFirst;
      } // Mark that the fiber performed work, but only if the new state is
      // different from the current state.

      if (!objectIs(newState, hook.memoizedState)) {
        markWorkInProgressReceivedUpdate();
      }

      hook.memoizedState = newState;
      hook.baseState = newBaseState;
      hook.baseQueue = newBaseQueueLast;
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

  function updateState(initialState) {
    return updateReducer(basicStateReducer);
  }

  function dispatchAction(fiber, queue, action) {
    console.log(['dispatchAction'], { fiber, queue, action });

    const currentTime = requestCurrentTimeForUpdate();
    const suspenseConfig = null;
    const expirationTime = computeExpirationForFiber(
      currentTime,
      fiber,
      suspenseConfig,
    );
    const update = {
      expirationTime: expirationTime,
      suspenseConfig: suspenseConfig,
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

    const alternate = fiber.alternate;

    if (
      fiber === currentlyRenderingFiber$1 ||
      (alternate !== null && alternate === currentlyRenderingFiber$1)
    ) {
      // This is a render phase update. Stash it in a lazily-created map of
      // queue -> linked list of updates. After this render pass, we'll restart
      // and apply the stashed updates on top of the work-in-progress hook.
      didScheduleRenderPhaseUpdate = true;
      update.expirationTime = renderExpirationTime;
      currentlyRenderingFiber$1.expirationTime = renderExpirationTime;
    } else {
      if (
        fiber.expirationTime === NoWork &&
        (alternate === null || alternate.expirationTime === NoWork)
      ) {
        // The queue is currently empty, which means we can eagerly compute the
        // next state before entering the render phase. If the new state is the
        // same as the current state, we may be able to bail out entirely.
        const lastRenderedReducer = queue.lastRenderedReducer;

        if (lastRenderedReducer !== null) {
          let prevDispatcher;

          {
            prevDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
          }

          ReactCurrentDispatcher.current = prevDispatcher;
        }
      }

      scheduleWork(fiber, expirationTime);
    }
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
        console.log(['test 1']);
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
        console.log(['test 3']);
        currentHookNameInDev = 'useState';

        const prevDispatcher = ReactCurrentDispatcher.current;

        ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnUpdateInDEV;

        try {
          return updateState(initialState);
        } finally {
          ReactCurrentDispatcher.current = prevDispatcher;
        }
      },
    };
  }

  const ReactCurrentOwner$1 = ReactSharedInternals.ReactCurrentOwner;
  let didReceiveUpdate = false;

  function reconcileChildren(
    current,
    workInProgress,
    nextChildren,
    renderExpirationTime,
  ) {
    if (current === null) {
      // If this is a fresh new component that hasn't been rendered yet, we
      // won't update its child set by applying minimal side-effects. Instead,
      // we will add them all to the child before it gets rendered. That means
      // we can optimize this reconciliation pass by not tracking side-effects.
      workInProgress.child = mountChildFibers(
        workInProgress,
        null,
        nextChildren,
        renderExpirationTime,
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
        renderExpirationTime,
      );
    }
  }

  function markRef(current, workInProgress) {
    const ref = workInProgress.ref;

    if (
      (current === null && ref !== null) ||
      (current !== null && current.ref !== ref)
    ) {
      // Schedule a Ref effect
      workInProgress.effectTag |= Ref;
    }
  }

  function updateFunctionComponent(
    current,
    workInProgress,
    Component,
    nextProps,
    renderExpirationTime,
  ) {
    let context;
    let nextChildren;

    {
      ReactCurrentOwner$1.current = workInProgress;
      setIsRendering(true);
      nextChildren = renderWithHooks(
        current,
        workInProgress,
        Component,
        nextProps,
        context,
        renderExpirationTime,
      );

      setIsRendering(false);
    }

    workInProgress.effectTag |= PerformedWork;
    reconcileChildren(
      current,
      workInProgress,
      nextChildren,
      renderExpirationTime,
    );

    return workInProgress.child;
  }

  function updateHostRoot(current, workInProgress, renderExpirationTime) {
    console.log(['updateHostRoot'], {
      current,
      workInProgress,
      renderExpirationTime,
    });
    pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);

    const nextProps = workInProgress.pendingProps;

    cloneUpdateQueue(current, workInProgress);
    processUpdateQueue(workInProgress, nextProps, null, renderExpirationTime);

    const nextState = workInProgress.memoizedState; // Caution: React DevTools currently depends on this property
    // being called "element".
    const nextChildren = nextState.element;

    reconcileChildren(
      current,
      workInProgress,
      nextChildren,
      renderExpirationTime,
    );

    return workInProgress.child;
  }

  function updateHostComponent(current, workInProgress, renderExpirationTime) {
    pushHostContext(workInProgress);

    const type = workInProgress.type;
    const nextProps = workInProgress.pendingProps;
    const prevProps = current !== null ? current.memoizedProps : null;
    let nextChildren = nextProps.children;
    const isDirectTextChild = shouldSetTextContent(type, nextProps);

    if (isDirectTextChild) {
      // We special case a direct text child of a host node. This is a common
      // case. We won't handle it as a reified child. We will instead handle
      // this in the host environment that also has access to this prop. That
      // avoids allocating another HostText fiber and traversing it.
      nextChildren = null;
    } else if (prevProps !== null && shouldSetTextContent(type, prevProps)) {
      // If we're switching from a direct text child to a normal child, or to
      // empty, we need to schedule the text content to be reset.
      workInProgress.effectTag |= ContentReset;
    }

    markRef(current, workInProgress); // Check the host config to see if the children are offscreen/hidden.

    if (
      workInProgress.mode & ConcurrentMode &&
      renderExpirationTime !== Never &&
      shouldDeprioritizeSubtree(type, nextProps)
    ) {
      {
        markSpawnedWork(Never);
      } // Schedule this fiber to re-render at offscreen priority. Then bailout.

      workInProgress.expirationTime = workInProgress.childExpirationTime = Never;

      return null;
    }

    reconcileChildren(
      current,
      workInProgress,
      nextChildren,
      renderExpirationTime,
    );

    return workInProgress.child;
  }

  function mountIndeterminateComponent(
    _current,
    workInProgress,
    Component,
    renderExpirationTime,
  ) {
    console.log(['mountIndeterminateComponent'], {
      _current,
      workInProgress,
      Component,
      renderExpirationTime,
    });

    const props = workInProgress.pendingProps;
    let value;

    {
      setIsRendering(true);
      ReactCurrentOwner$1.current = workInProgress;
      value = renderWithHooks(
        null,
        workInProgress,
        Component,
        props,
        {},
        renderExpirationTime,
      );
      setIsRendering(false);
    } // React DevTools reads this flag.

    workInProgress.effectTag |= PerformedWork;

    // Proceed under the assumption that this is a function component
    workInProgress.tag = FunctionComponent;

    reconcileChildren(null, workInProgress, value, renderExpirationTime);

    return workInProgress.child;
  }

  function markWorkInProgressReceivedUpdate() {
    didReceiveUpdate = true;
  }

  function beginWork(current, workInProgress, renderExpirationTime) {
    workInProgress.expirationTime = NoWork;

    switch (workInProgress.tag) {
      case IndeterminateComponent: {
        return mountIndeterminateComponent(
          current,
          workInProgress,
          workInProgress.type,
          renderExpirationTime,
        );
      }
      case FunctionComponent: {
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
          renderExpirationTime,
        );
      }
      case HostRoot:
        return updateHostRoot(current, workInProgress, renderExpirationTime);
      case HostComponent:
        return updateHostComponent(
          current,
          workInProgress,
          renderExpirationTime,
        );
    }

    {
      {
        throw Error('Unknown unit of work tag.');
      }
    }
  }

  function markUpdate(workInProgress) {
    // Tag the fiber with an update effect. This turns a Placement into
    // a PlacementAndUpdate.
    workInProgress.effectTag |= Update;
  }

  let appendAllChildren;
  let updateHostContainer;
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

    updateHostContainer = function (workInProgress) {
      // Noop
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
      const currentHostContext = getHostContext(); // TODO: Experiencing an error where oldProps is null. Suggests a host
      // component is hitting the resume path. Figure out why. Possibly
      // related to `hidden`.
      const updatePayload = prepareUpdate(
        instance,
        type,
        oldProps,
        newProps,
        rootContainerInstance,
        currentHostContext,
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
        return null;
      case HostRoot: {
        popHostContainer(workInProgress);
        popTopLevelContextObject(workInProgress);

        const fiberRoot = workInProgress.stateNode;

        if (fiberRoot.pendingContext) {
          fiberRoot.context = fiberRoot.pendingContext;
          fiberRoot.pendingContext = null;
        }

        if (current === null || current.child === null) {
          // If we hydrated, pop so that we can delete any remaining children
          // that weren't hydrated.
          markUpdate(workInProgress);
        }

        updateHostContainer(workInProgress);

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
            if (!(workInProgress.stateNode !== null)) {
              {
                throw Error(
                  'We must have new props for new mounts. This error is likely caused by a bug in React. Please file an issue.',
                );
              }
            } // This can happen when we abort work.

            return null;
          }

          const currentHostContext = getHostContext(); // TODO: Move createInstance to beginWork and keep it on a context
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

  function safelyDetachRef(current) {
    const ref = current.ref;

    if (ref !== null) {
      if (typeof ref === 'function') {
        {
          invokeGuardedCallback(null, ref, null, null);
        }
      } else {
        ref.current = null;
      }
    }
  }

  function safelyCallDestroy(current, destroy) {
    {
      invokeGuardedCallback(null, destroy, null);
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

  function commitUnmount(finishedRoot, current, renderPriorityLevel) {
    console.log(['commitUnmount'], {
      finishedRoot,
      current,
      renderPriorityLevel,
    });
    onCommitUnmount(current);

    switch (current.tag) {
      case FunctionComponent: {
        const updateQueue = current.updateQueue;

        if (updateQueue !== null) {
          const lastEffect = updateQueue.lastEffect;

          if (lastEffect !== null) {
            const firstEffect = lastEffect.next;

            {
              // When the owner fiber is deleted, the destroy function of a passive
              // effect hook is called during the synchronous commit phase. This is
              // a concession to implementation complexity. Calling it in the
              // passive effect phase (like they usually are, when dependencies
              // change during an update) would require either traversing the
              // children of the deleted fiber again, or including unmount effects
              // as part of the fiber effect list.
              //
              // Because this is during the sync commit phase, we need to change
              // the priority.
              //
              // TODO: Reconsider this implementation trade off.
              const priorityLevel =
                renderPriorityLevel > NormalPriority
                  ? NormalPriority
                  : renderPriorityLevel;

              runWithPriority$1(priorityLevel, function () {
                let effect = firstEffect;

                do {
                  const _destroy = effect.destroy;

                  if (_destroy !== undefined) {
                    safelyCallDestroy(current, _destroy);
                  }

                  effect = effect.next;
                } while (effect !== firstEffect);
              });
            }
          }
        }

        return;
      }
      case HostComponent: {
        safelyDetachRef(current);

        return;
      }
    }
  }

  function commitNestedUnmounts(finishedRoot, root, renderPriorityLevel) {
    console.log(['commitNestedUnmounts'], {
      finishedRoot,
      root,
      renderPriorityLevel,
    });

    // While we're inside a removed host node we don't want to call
    // removeChild on the inner nodes because they're removed by the top
    // call anyway. We also want to call componentWillUnmount on all
    // composites before this host node is removed from the tree. Therefore
    // we do an inner loop while we're still inside the host node.
    let node = root;

    while (true) {
      commitUnmount(finishedRoot, node, renderPriorityLevel); // Visit children because they may contain more composite or host nodes.
      // Skip portals because commitUnmount() currently visits them recursively.

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

      if (before) {
        insertInContainerBefore(parent, stateNode, before);
      } else {
        appendChildToContainer(parent, stateNode);
      }
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

  function unmountHostComponents(finishedRoot, current, renderPriorityLevel) {
    console.log(['unmountHostComponents'], {
      finishedRoot,
      current,
      renderPriorityLevel,
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
          if (!(parent !== null)) {
            {
              throw Error(
                'Expected to find a host parent. This error is likely caused by a bug in React. Please file an issue.',
              );
            }
          }

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

      if (node.tag === HostComponent || node.tag === HostText) {
        commitNestedUnmounts(finishedRoot, node, renderPriorityLevel); // After all the children have unmounted, it is now safe to remove the
        // node from the tree.

        if (currentParentIsContainer) {
          removeChildFromContainer(currentParent, node.stateNode);
        } else {
          removeChild(currentParent, node.stateNode);
        } // Don't visit children because we already visited them.
      } else {
        commitUnmount(finishedRoot, node, renderPriorityLevel); // Visit children because we may find more host components below.

        if (node.child !== null) {
          node.child.return = node;
          node = node.child;

          continue;
        }
      }

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

  function commitDeletion(finishedRoot, current, renderPriorityLevel) {
    console.log(['commitDeletion'], {
      finishedRoot,
      current,
      renderPriorityLevel,
    });

    {
      // Recursively delete all host nodes from the parent.
      // Detach refs and call componentWillUnmount() on the whole subtree.
      unmountHostComponents(finishedRoot, current, renderPriorityLevel);
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
  const DiscreteEventContext =
    /*         */
    4;
  const LegacyUnbatchedContext =
    /*       */
    8;
  const RenderContext =
    /*                */
    16;
  const CommitContext =
    /*                */
    32;
  const RootIncomplete = 0;
  const RootSuspendedWithDelay = 4;
  // Describes where we are in the React execution stack
  let executionContext = NoContext; // The root we're working on
  let workInProgressRoot = null; // The fiber we're working on
  let workInProgress = null; // The expiration time we're rendering
  let renderExpirationTime$1 = NoWork; // Whether to root completed, errored, suspended, etc.
  let workInProgressRootExitStatus = RootIncomplete; // A fatal error, if one is thrown
  let workInProgressRootFatalError = null; // Most recent event time among processed updates during this render.
  // This is conceptually a time stamp but expressed in terms of an ExpirationTime
  // because we deal mostly with expiration times in the hot path, so this avoids
  // the conversion happening in the hot path.
  let workInProgressRootLatestProcessedExpirationTime = Sync;
  let workInProgressRootLatestSuspenseTimeout = Sync;
  let workInProgressRootCanSuspendUsingConfig = null; // The work left over by components that were visited during this render. Only
  // includes unprocessed updates, not work in bailed out children.
  let workInProgressRootNextUnprocessedUpdateTime = NoWork; // If we're pinged while rendering we don't always restart immediately.
  // This flag determines if it might be worthwhile to restart if an opportunity
  // happens latere.
  let workInProgressRootHasPendingPing = false; // The most recent time we committed a fallback. This lets us ensure a train
  // model where we don't commit new loading states in too quick succession.
  let nextEffect = null;
  let legacyErrorBoundariesThatAlreadyFailed = null;
  let rootDoesHavePassiveEffects = false;
  let rootWithPendingPassiveEffects = null;
  let pendingPassiveEffectsRenderPriority = NoPriority;
  let pendingPassiveEffectsExpirationTime = NoWork;
  let rootsWithPendingDiscreteUpdates = null; // Use these to prevent an infinite loop of nested updates
  let nestedUpdateCount = 0;
  let rootWithNestedUpdates = null;
  let spawnedWorkDuringRender = null; // Expiration times are computed by adding to the current time (the start
  // time). However, if two updates are scheduled within the same event, we
  // should treat their start times as simultaneous, even if the actual clock
  // time has advanced between the first and second call.
  // In other words, because expiration times determine how updates are batched,
  // we want all updates of like priority that occur within the same event to
  // receive the same expiration time. Otherwise we get tearing.
  let currentEventTime = NoWork;

  function requestCurrentTimeForUpdate() {
    if ((executionContext & (RenderContext | CommitContext)) !== NoContext) {
      // We're inside React, so it's fine to read the actual time.
      return msToExpirationTime(now());
    } // We're not inside React, so we may be in the middle of a browser event.

    if (currentEventTime !== NoWork) {
      // Use the same start time for all updates until we enter React again.
      return currentEventTime;
    } // This is the first update since React yielded. Compute a new start time.

    currentEventTime = msToExpirationTime(now());

    return currentEventTime;
  }

  function computeExpirationForFiber(currentTime, fiber, suspenseConfig) {
    const mode = fiber.mode;

    if ((mode & BlockingMode) === NoMode) {
      return Sync;
    }

    const priorityLevel = getCurrentPriorityLevel();

    if ((mode & ConcurrentMode) === NoMode) {
      return priorityLevel === ImmediatePriority ? Sync : Batched;
    }

    if ((executionContext & RenderContext) !== NoContext) {
      // Use whatever time we're already rendering
      // TODO: Should there be a way to opt out, like with `runWithPriority`?
      return renderExpirationTime$1;
    }

    let expirationTime;

    if (suspenseConfig !== null) {
      // Compute an expiration time based on the Suspense timeout.
      expirationTime = computeSuspenseExpiration(
        currentTime,
        suspenseConfig.timeoutMs | 0 || LOW_PRIORITY_EXPIRATION,
      );
    } else {
      // Compute an expiration time based on the Scheduler priority.
      switch (priorityLevel) {
        case ImmediatePriority:
          expirationTime = Sync;

          break;
        case UserBlockingPriority$1:
          // TODO: Rename this to computeUserBlockingExpiration
          expirationTime = computeInteractiveExpiration(currentTime);

          break;
        case NormalPriority:
        case LowPriority:
          // TODO: Handle LowPriority
          // TODO: Rename this to... something better.
          expirationTime = computeAsyncExpiration(currentTime);

          break;
        case IdlePriority:
          expirationTime = Idle;

          break;
        default: {
          {
            throw Error('Expected a valid priority level');
          }
        }
      }
    } // If we're in the middle of rendering a tree, do not update at the same
    // expiration time that is already rendering.
    // TODO: We shouldn't have to do this if the update is on a different root.
    // Refactor computeExpirationForFiber + scheduleUpdate so we have access to
    // the root when we check for this condition.

    if (
      workInProgressRoot !== null &&
      expirationTime === renderExpirationTime$1
    ) {
      // This is a trick to move this update into a separate batch
      expirationTime -= 1;
    }

    return expirationTime;
  }

  function scheduleUpdateOnFiber(fiber, expirationTime) {
    const root = markUpdateTimeFromFiberToRoot(fiber, expirationTime);

    if (root === null) {
      return;
    }

    // checkForInterruption(fiber, expirationTime);
    // recordScheduleUpdate(); // TODO: computeExpirationForFiber also reads the priority. Pass the
    // priority as an argument to that function and this one.

    const priorityLevel = getCurrentPriorityLevel();

    if (expirationTime === Sync) {
      if (
        // Check if we're inside unbatchedUpdates
        (executionContext & LegacyUnbatchedContext) !== NoContext && // Check if we're not already rendering
        (executionContext & (RenderContext | CommitContext)) === NoContext
      ) {
        // Register pending interactions on the root to avoid losing traced interaction data.
        schedulePendingInteractions(root, expirationTime); // This is a legacy edge case. The initial mount of a ReactDOM.render-ed
        // root inside of batchedUpdates should be synchronous, but layout updates
        // should be deferred until the end of the batch.

        performSyncWorkOnRoot(root);
      } else {
        ensureRootIsScheduled(root);
        schedulePendingInteractions(root, expirationTime);

        if (executionContext === NoContext) {
          // Flush the synchronous work now, unless we're already working or inside
          // a batch. This is intentionally inside scheduleUpdateOnFiber instead of
          // scheduleCallbackForFiber to preserve the ability to schedule a callback
          // without immediately flushing it. We only do this for user-initiated
          // updates, to preserve historical behavior of legacy mode.
          flushSyncCallbackQueue();
        }
      }
    } else {
      ensureRootIsScheduled(root);
      schedulePendingInteractions(root, expirationTime);
    }

    if (
      (executionContext & DiscreteEventContext) !== NoContext && // Only updates at user-blocking priority or greater are considered
      // discrete, even inside a discrete event.
      (priorityLevel === UserBlockingPriority$1 ||
        priorityLevel === ImmediatePriority)
    ) {
      // This is the result of a discrete event. Track the lowest priority
      // discrete update per root so we can flush them early, if needed.
      if (rootsWithPendingDiscreteUpdates === null) {
        rootsWithPendingDiscreteUpdates = new Map([[root, expirationTime]]);
      } else {
        const lastDiscreteTime = rootsWithPendingDiscreteUpdates.get(root);

        if (
          lastDiscreteTime === undefined ||
          lastDiscreteTime > expirationTime
        ) {
          rootsWithPendingDiscreteUpdates.set(root, expirationTime);
        }
      }
    }
  }

  var scheduleWork = scheduleUpdateOnFiber; // This is split into a separate function so we can mark a fiber with pending
  // work without treating it as a typical update that originates from an event;
  // e.g. retrying a Suspense boundary isn't an update, but it does schedule work
  // on a fiber.

  function markUpdateTimeFromFiberToRoot(fiber, expirationTime) {
    // Update the source fiber's expiration time
    if (fiber.expirationTime < expirationTime) {
      fiber.expirationTime = expirationTime;
    }

    let alternate = fiber.alternate;

    if (alternate !== null && alternate.expirationTime < expirationTime) {
      alternate.expirationTime = expirationTime;
    } // Walk the parent path to the root and update the child expiration time.

    let node = fiber.return;
    let root = null;

    if (node === null && fiber.tag === HostRoot) {
      root = fiber.stateNode;
    } else {
      while (node !== null) {
        alternate = node.alternate;

        if (node.childExpirationTime < expirationTime) {
          node.childExpirationTime = expirationTime;

          if (
            alternate !== null &&
            alternate.childExpirationTime < expirationTime
          ) {
            alternate.childExpirationTime = expirationTime;
          }
        } else if (
          alternate !== null &&
          alternate.childExpirationTime < expirationTime
        ) {
          alternate.childExpirationTime = expirationTime;
        }

        if (node.return === null && node.tag === HostRoot) {
          root = node.stateNode;

          break;
        }

        node = node.return;
      }
    }

    if (root !== null) {
      if (workInProgressRoot === root) {
        // Received an update to a tree that's in the middle of rendering. Mark
        // that's unprocessed work on this root.
        markUnprocessedUpdateTime(expirationTime);

        if (workInProgressRootExitStatus === RootSuspendedWithDelay) {
          // The root already suspended with a delay, which means this render
          // definitely won't finish. Since we have a new update, let's mark it as
          // suspended now, right before marking the incoming update. This has the
          // effect of interrupting the current render and switching to the update.
          // TODO: This happens to work when receiving an update during the render
          // phase, because of the trick inside computeExpirationForFiber to
          // subtract 1 from `renderExpirationTime` to move it into a
          // separate bucket. But we should probably model it with an exception,
          // using the same mechanism we use to force hydration of a subtree.
          // TODO: This does not account for low pri updates that were already
          // scheduled before the root started rendering. Need to track the next
          // pending expiration time (perhaps by backtracking the return path) and
          // then trigger a restart in the `renderDidSuspendDelayIfPossible` path.
          markRootSuspendedAtTime(root, renderExpirationTime$1);
        }
      } // Mark that the root has a pending update.

      markRootUpdatedAtTime(root, expirationTime);
    }

    return root;
  }

  function getNextRootExpirationTimeToWorkOn(root) {
    // Determines the next expiration time that the root should render, taking
    // into account levels that may be suspended, or levels that may have
    // received a ping.
    const lastExpiredTime = root.lastExpiredTime;

    if (lastExpiredTime !== NoWork) {
      return lastExpiredTime;
    } // "Pending" refers to any update that hasn't committed yet, including if it
    // suspended. The "suspended" range is therefore a subset.

    const firstPendingTime = root.firstPendingTime;

    if (!isRootSuspendedAtTime(root, firstPendingTime)) {
      // The highest priority pending time is not suspended. Let's work on that.
      return firstPendingTime;
    } // If the first pending time is suspended, check if there's a lower priority
    // pending level that we know about. Or check if we received a ping. Work
    // on whichever is higher priority.

    const lastPingedTime = root.lastPingedTime;
    const nextKnownPendingLevel = root.nextKnownPendingLevel;
    const nextLevel =
      lastPingedTime > nextKnownPendingLevel
        ? lastPingedTime
        : nextKnownPendingLevel;

    if (nextLevel <= Idle && firstPendingTime !== nextLevel) {
      // Don't work on Idle/Never priority unless everything else is committed.
      return NoWork;
    }

    return nextLevel;
  } // Use this function to schedule a task for a root. There's only one task per
  // root; if a task was already scheduled, we'll check to make sure the
  // expiration time of the existing task is the same as the expiration time of
  // the next level that the root has work on. This function is called on every
  // update, and right before exiting a task.

  function ensureRootIsScheduled(root) {
    console.log(['ensureRootIsScheduled'], { root });

    const lastExpiredTime = root.lastExpiredTime;

    if (lastExpiredTime !== NoWork) {
      // Special case: Expired work should flush synchronously.
      root.callbackExpirationTime = Sync;
      root.callbackPriority = ImmediatePriority;
      root.callbackNode = scheduleSyncCallback(
        performSyncWorkOnRoot.bind(null, root),
      );

      return;
    }

    const expirationTime = getNextRootExpirationTimeToWorkOn(root);
    const existingCallbackNode = root.callbackNode;

    if (expirationTime === NoWork) {
      // There's nothing to work on.
      if (existingCallbackNode !== null) {
        root.callbackNode = null;
        root.callbackExpirationTime = NoWork;
        root.callbackPriority = NoPriority;
      }

      return;
    } // TODO: If this is an update, we already read the current time. Pass the
    // time as an argument.

    const currentTime = requestCurrentTimeForUpdate();
    const priorityLevel = inferPriorityFromExpirationTime(
      currentTime,
      expirationTime,
    ); // If there's an existing render task, confirm it has the correct priority and
    // expiration time. Otherwise, we'll cancel it and schedule a new one.

    if (existingCallbackNode !== null) {
      const existingCallbackPriority = root.callbackPriority;
      const existingCallbackExpirationTime = root.callbackExpirationTime;

      if (
        // Callback must have the exact same expiration time.
        existingCallbackExpirationTime === expirationTime && // Callback must have greater or equal priority.
        existingCallbackPriority >= priorityLevel
      ) {
        // Existing callback is sufficient.
        return;
      } // Need to schedule a new task.
      // TODO: Instead of scheduling a new task, we should be able to change the
      // priority of the existing one.

      cancelCallback(existingCallbackNode);
    }

    root.callbackExpirationTime = expirationTime;
    root.callbackPriority = priorityLevel;

    let callbackNode;

    callbackNode = scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));

    root.callbackNode = callbackNode;
  } // This is the entry point for every concurrent task, i.e. anything that
  // goes through Scheduler.

  function performSyncWorkOnRoot(root) {
    console.log(['performSyncWorkOnRoot'], root);

    // Check if there's expired work on this root. Otherwise, render at Sync.
    const lastExpiredTime = root.lastExpiredTime;
    const expirationTime = lastExpiredTime !== NoWork ? lastExpiredTime : Sync;

    if (
      root !== workInProgressRoot ||
      expirationTime !== renderExpirationTime$1
    ) {
      prepareFreshStack(root, expirationTime);
    } // If we have a work-in-progress fiber, it means there's still work to do
    // in this root.

    if (workInProgress !== null) {
      const prevExecutionContext = executionContext;

      executionContext |= RenderContext;

      workLoopSync();

      executionContext = prevExecutionContext;

      root.finishedWork = root.current.alternate;
      finishSyncRender(root);
    }

    return null;
  }

  function finishSyncRender(root) {
    // Set this to null to indicate there's no in-progress render.
    workInProgressRoot = null;
    commitRoot(root);
  }

  function prepareFreshStack(root, expirationTime) {
    root.finishedWork = null;
    root.finishedExpirationTime = NoWork;

    const timeoutHandle = root.timeoutHandle;

    if (timeoutHandle !== noTimeout) {
      // The root previous suspended and scheduled a timeout to commit a fallback
      // state. Now that we have additional work, cancel the timeout.
      root.timeoutHandle = noTimeout; // $FlowFixMe Complains noTimeout is not a TimeoutID, despite the check above

      cancelTimeout(timeoutHandle);
    }

    workInProgressRoot = root;
    workInProgress = createWorkInProgress(root.current, null);
    renderExpirationTime$1 = expirationTime;
    workInProgressRootExitStatus = RootIncomplete;
    workInProgressRootFatalError = null;
    workInProgressRootLatestProcessedExpirationTime = Sync;
    workInProgressRootLatestSuspenseTimeout = Sync;
    workInProgressRootCanSuspendUsingConfig = null;
    workInProgressRootNextUnprocessedUpdateTime = NoWork;
    workInProgressRootHasPendingPing = false;

    {
      spawnedWorkDuringRender = null;
    }
  }

  function markRenderEventTimeAndConfig(expirationTime, suspenseConfig) {
    if (
      expirationTime < workInProgressRootLatestProcessedExpirationTime &&
      expirationTime > Idle
    ) {
      workInProgressRootLatestProcessedExpirationTime = expirationTime;
    }

    if (suspenseConfig !== null) {
      if (
        expirationTime < workInProgressRootLatestSuspenseTimeout &&
        expirationTime > Idle
      ) {
        workInProgressRootLatestSuspenseTimeout = expirationTime; // Most of the time we only have one config and getting wrong is not bad.

        workInProgressRootCanSuspendUsingConfig = suspenseConfig;
      }
    }
  }

  function markUnprocessedUpdateTime(expirationTime) {
    if (expirationTime > workInProgressRootNextUnprocessedUpdateTime) {
      workInProgressRootNextUnprocessedUpdateTime = expirationTime;
    }
  }

  function workLoopSync() {
    // Already timed out, so perform work without checking if we need to yield.
    while (workInProgress !== null) {
      workInProgress = performUnitOfWork(workInProgress);
    }
  }

  function performUnitOfWork(unitOfWork) {
    // The current, flushed, state of this fiber is the alternate. Ideally
    // nothing should rely on this, but relying on it here means that we don't
    // need an additional field on the work in progress.
    const current = unitOfWork.alternate;

    setCurrentFiber(unitOfWork);

    let next;

    next = beginWork(current, unitOfWork, renderExpirationTime$1);

    resetCurrentFiber();
    unitOfWork.memoizedProps = unitOfWork.pendingProps;

    if (next === null) {
      // If this doesn't spawn new work, complete the current work.
      next = completeUnitOfWork(unitOfWork);
    }

    ReactCurrentOwner$2.current = null;

    return next;
  }

  function completeUnitOfWork(unitOfWork) {
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
    console.log(['commitRoot']);

    const renderPriorityLevel = getCurrentPriorityLevel();

    commitRootImpl(root, renderPriorityLevel);

    return null;
  }

  function commitRootImpl(root, renderPriorityLevel) {
    console.log(['commitRootImpl']);

    if (!((executionContext & (RenderContext | CommitContext)) === NoContext)) {
      {
        throw Error('Should not already be working.');
      }
    }

    const finishedWork = root.finishedWork;
    const expirationTime = root.finishedExpirationTime;

    if (finishedWork === null) {
      return null;
    }

    root.finishedWork = null;
    root.finishedExpirationTime = NoWork;
    root.callbackNode = null;
    root.callbackExpirationTime = NoWork;
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

    const prevExecutionContext = executionContext;

    executionContext |= CommitContext;

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
      commitMutationEffects(root, renderPriorityLevel);
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

    executionContext = prevExecutionContext;

    if (rootDoesHavePassiveEffects) {
      // This commit has passive effects. Stash a reference to them. But don't
      // schedule a callback until after flushing layout work.
      rootDoesHavePassiveEffects = false;
      rootWithPendingPassiveEffects = root;
      pendingPassiveEffectsExpirationTime = expirationTime;
      pendingPassiveEffectsRenderPriority = renderPriorityLevel;
    } else {
      // We are done with the effect chain at this point so let's clear the
      // nextEffect pointers to assist with GC. If we have passive effects, we'll
      // clear this in flushPassiveEffects.
      nextEffect = firstEffect;

      while (nextEffect !== null) {
        const nextNextEffect = nextEffect.nextEffect;

        nextEffect.nextEffect = null;
        nextEffect = nextNextEffect;
      }
    } // Check if there's remaining work on this root

    const remainingExpirationTime = root.firstPendingTime;

    if (remainingExpirationTime !== NoWork) {
      {
        if (spawnedWorkDuringRender !== null) {
          const expirationTimes = spawnedWorkDuringRender;

          spawnedWorkDuringRender = null;

          for (let i = 0; i < expirationTimes.length; i++) {
            scheduleInteractions(
              root,
              expirationTimes[i],
              root.memoizedInteractions,
            );
          }
        }

        schedulePendingInteractions(root, remainingExpirationTime);
      }
    } else {
      // If there's no remaining work, we can clear the set of already failed
      // error boundaries.
      legacyErrorBoundariesThatAlreadyFailed = null;
    }

    if (remainingExpirationTime === Sync) {
      // Count the number of times the root synchronously re-renders without
      // finishing. If there are too many, it indicates an infinite update loop.
      if (root === rootWithNestedUpdates) {
        nestedUpdateCount++;
      } else {
        nestedUpdateCount = 0;
        rootWithNestedUpdates = root;
      }
    } else {
      nestedUpdateCount = 0;
    }

    return null;
  }

  function commitMutationEffects(root, renderPriorityLevel) {
    console.log(['commitMutationEffects'], { root, renderPriorityLevel });

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
          commitDeletion(root, nextEffect, renderPriorityLevel);

          break;
        }
      } // TODO: Only record a mutation effect if primaryEffectTag is non-zero.

      recordEffect();
      resetCurrentFiber();
      nextEffect = nextEffect.nextEffect;
    }
  }

  function computeThreadID(root, expirationTime) {
    // Interaction threads are unique per root and expiration time.
    return expirationTime * 1000 + root.interactionThreadID;
  }

  function markSpawnedWork(expirationTime) {
    if (spawnedWorkDuringRender === null) {
      spawnedWorkDuringRender = [expirationTime];
    } else {
      spawnedWorkDuringRender.push(expirationTime);
    }
  }

  function scheduleInteractions(root, expirationTime, interactions) {
    if (interactions.size > 0) {
      const pendingInteractionMap = root.pendingInteractionMap;
      const pendingInteractions = pendingInteractionMap.get(expirationTime);

      if (pendingInteractions != null) {
        interactions.forEach(function (interaction) {
          if (!pendingInteractions.has(interaction)) {
            // Update the pending async work count for previously unscheduled interaction.
            interaction.__count++;
          }

          pendingInteractions.add(interaction);
        });
      } else {
        pendingInteractionMap.set(expirationTime, new Set(interactions)); // Update the pending async work count for the current interactions.

        interactions.forEach(function (interaction) {
          interaction.__count++;
        });
      }

      const subscriber = __subscriberRef.current;

      if (subscriber !== null) {
        const threadID = computeThreadID(root, expirationTime);

        subscriber.onWorkScheduled(interactions, threadID);
      }
    }
  }

  function schedulePendingInteractions(root, expirationTime) {
    scheduleInteractions(root, expirationTime, __interactionsRef.current);
  }

  const onCommitFiberUnmount = null;
  const isDevToolsPresent =
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined';

  function onCommitUnmount(fiber) {
    if (typeof onCommitFiberUnmount === 'function') {
      onCommitFiberUnmount(fiber);
    }
  }

  let hasBadMapPolyfill;
  let debugCounter = 1;

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
    this.expirationTime = NoWork;
    this.childExpirationTime = NoWork;
    this.alternate = null;

    {
      // Note: The following is done to avoid a v8 performance cliff.
      //
      // Initializing the fields below to smis and later updating them with
      // double values will cause Fibers to end up having separate shapes.
      // This behavior/bug has something to do with Object.preventExtension().
      // Fortunately this only impacts DEV builds.
      // Unfortunately it makes React unusably slow for some applications.
      // To work around this, initialize the fields below with doubles.
      //
      // Learn more about this here:
      // https://github.com/facebook/react/issues/14365
      // https://bugs.chromium.org/p/v8/issues/detail?id=8538
      this.actualDuration = Number.NaN;
      this.actualStartTime = Number.NaN;
      this.selfBaseDuration = Number.NaN;
      this.treeBaseDuration = Number.NaN; // It's okay to replace the initial doubles with smis after initialization.
      // This won't trigger the performance cliff mentioned above,
      // and it simplifies other profiler code (including DevTools).

      this.actualDuration = 0;
      this.actualStartTime = -1;
      this.selfBaseDuration = 0;
      this.treeBaseDuration = 0;
    } // This is normally DEV-only except www when it adds listeners.
    // TODO: remove the User Timing integration in favor of Root Events.

    {
      this._debugID = debugCounter++;
      this._debugIsCurrentlyTiming = false;
    }

    {
      this._debugSource = null;
      this._debugOwner = null;
      this._debugNeedsRemount = false;
      this._debugHookTypes = null;

      if (
        !hasBadMapPolyfill &&
        typeof Object.preventExtensions === 'function'
      ) {
        Object.preventExtensions(this);
      }
    }
  } // This is a constructor function, rather than a POJO constructor, still
  // please ensure we do the following:
  // 1) Nobody should add any instance methods on this. Instance methods can be
  //    more difficult to predict when they get optimized and they are almost
  //    never inlined properly in static compilers.
  // 2) Nobody should rely on `instanceof Fiber` for type testing. We should
  //    always know when it is a fiber.
  // 3) We might want to experiment with using numeric keys since they are easier
  //    to optimize in a non-JIT environment.
  // 4) We can easily go from a constructor to a createFiber object literal if that
  //    is faster.
  // 5) It should be easy to port this to a C struct and keep a C implementation
  //    compatible.

  const createFiber = function (tag, pendingProps, key, mode) {
    // $FlowFixMe: the shapes are exact here but Flow doesn't like constructors
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

      {
        // DEV-only fields
        {
          workInProgress._debugID = current._debugID;
        }

        workInProgress._debugSource = current._debugSource;
        workInProgress._debugOwner = current._debugOwner;
        workInProgress._debugHookTypes = current._debugHookTypes;
      }

      workInProgress.alternate = current;
      current.alternate = workInProgress;
    } else {
      workInProgress.pendingProps = pendingProps; // We already have an alternate.
      // Reset the effect tag.

      workInProgress.effectTag = NoEffect; // The effect list is no longer valid.

      workInProgress.nextEffect = null;
      workInProgress.firstEffect = null;
      workInProgress.lastEffect = null;

      {
        // We intentionally reset, rather than copy, actualDuration & actualStartTime.
        // This prevents time from endlessly accumulating in new commits.
        // This has the downside of resetting values for different priority renders,
        // But works for yielding (the common case) and should support resuming.
        workInProgress.actualDuration = 0;
        workInProgress.actualStartTime = -1;
      }
    }

    workInProgress.childExpirationTime = current.childExpirationTime;
    workInProgress.expirationTime = current.expirationTime;
    workInProgress.child = current.child;
    workInProgress.memoizedProps = current.memoizedProps;
    workInProgress.memoizedState = current.memoizedState;
    workInProgress.updateQueue = current.updateQueue; // Clone the dependencies object. This is mutated during the render phase, so
    // it cannot be shared with the current fiber.

    const currentDependencies = current.dependencies;

    workInProgress.dependencies =
      currentDependencies === null
        ? null
        : {
            expirationTime: currentDependencies.expirationTime,
            firstContext: currentDependencies.firstContext,
            responders: currentDependencies.responders,
          }; // These will be overridden during the parent's reconciliation

    workInProgress.sibling = current.sibling;
    workInProgress.index = current.index;
    workInProgress.ref = current.ref;

    return workInProgress;
  } // Used to reuse a Fiber for a second pass.

  function createHostRootFiber(tag) {
    let mode;

    if (tag === ConcurrentRoot) {
      mode = ConcurrentMode | BlockingMode | StrictMode;
    } else if (tag === BlockingRoot) {
      mode = BlockingMode | StrictMode;
    } else {
      mode = NoMode;
    }

    if (isDevToolsPresent) {
      // Always collect profile timings when DevTools are present.
      // This enables DevTools to start capturing timing at any point–
      // Without some nodes in the tree having empty base times.
      mode |= ProfileMode;
    }

    return createFiber(HostRoot, null, null, mode);
  }

  function createFiberFromTypeAndProps(
    type,
    key,
    pendingProps,
    owner,
    mode,
    expirationTime,
  ) {
    console.log(['createFiberFromTypeAndProps'], {
      type,
      key,
      pendingProps,
      owner,
      mode,
      expirationTime,
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
    fiber.expirationTime = expirationTime;

    return fiber;
  }

  function createFiberFromElement(element, mode, expirationTime) {
    console.log(['createFiberFromElement'], { element, mode, expirationTime });

    const type = element.type;
    const key = element.key;
    const pendingProps = element.props;
    const fiber = createFiberFromTypeAndProps(
      type,
      key,
      pendingProps,
      null,
      mode,
      expirationTime,
    );

    return fiber;
  }

  function createFiberFromText(content, mode, expirationTime) {
    const fiber = createFiber(HostText, content, null, mode);

    fiber.expirationTime = expirationTime;

    return fiber;
  }

  function FiberRootNode(containerInfo, tag) {
    this.tag = tag;
    this.current = null;
    this.containerInfo = containerInfo;
    this.pendingChildren = null;
    this.pingCache = null;
    this.finishedExpirationTime = NoWork;
    this.finishedWork = null;
    this.timeoutHandle = noTimeout;
    this.context = null;
    this.pendingContext = null;
    this.hydrate = false; // wywalic
    this.callbackNode = null;
    this.callbackPriority = NoPriority;
    this.firstPendingTime = NoWork;
    this.firstSuspendedTime = NoWork;
    this.lastSuspendedTime = NoWork;
    this.nextKnownPendingLevel = NoWork;
    this.lastPingedTime = NoWork;
    this.lastExpiredTime = NoWork;

    {
      this.interactionThreadID = unstable_getThreadID();
      this.memoizedInteractions = new Set();
      this.pendingInteractionMap = new Map();
    }
  }

  function createFiberRoot(containerInfo, tag) {
    const root = new FiberRootNode(containerInfo, tag);
    // stateNode is any.
    const uninitializedFiber = createHostRootFiber(tag);

    root.current = uninitializedFiber;
    uninitializedFiber.stateNode = root;
    initializeUpdateQueue(uninitializedFiber);

    return root;
  }

  function isRootSuspendedAtTime(root, expirationTime) {
    const firstSuspendedTime = root.firstSuspendedTime;
    const lastSuspendedTime = root.lastSuspendedTime;

    return (
      firstSuspendedTime !== NoWork &&
      firstSuspendedTime >= expirationTime &&
      lastSuspendedTime <= expirationTime
    );
  }

  function markRootSuspendedAtTime(root, expirationTime) {
    const firstSuspendedTime = root.firstSuspendedTime;
    const lastSuspendedTime = root.lastSuspendedTime;

    if (firstSuspendedTime < expirationTime) {
      root.firstSuspendedTime = expirationTime;
    }

    if (lastSuspendedTime > expirationTime || firstSuspendedTime === NoWork) {
      root.lastSuspendedTime = expirationTime;
    }

    if (expirationTime <= root.lastPingedTime) {
      root.lastPingedTime = NoWork;
    }

    if (expirationTime <= root.lastExpiredTime) {
      root.lastExpiredTime = NoWork;
    }
  }

  function markRootUpdatedAtTime(root, expirationTime) {
    // Update the range of pending times
    const firstPendingTime = root.firstPendingTime;

    if (expirationTime > firstPendingTime) {
      root.firstPendingTime = expirationTime;
    } // Update the range of suspended times. Treat everything lower priority or
    // equal to this update as unsuspended.

    const firstSuspendedTime = root.firstSuspendedTime;

    if (firstSuspendedTime !== NoWork) {
      if (expirationTime >= firstSuspendedTime) {
        // The entire suspended range is now unsuspended.
        root.firstSuspendedTime = root.lastSuspendedTime = root.nextKnownPendingLevel = NoWork;
      } else if (expirationTime >= root.lastSuspendedTime) {
        root.lastSuspendedTime = expirationTime + 1;
      } // This is a pending level. Check if it's higher priority than the next
      // known pending level.

      if (expirationTime > root.nextKnownPendingLevel) {
        root.nextKnownPendingLevel = expirationTime;
      }
    }
  }

  function createContainer(containerInfo, tag) {
    return createFiberRoot(containerInfo, tag);
  }

  function updateContainer(element, container, parentComponent) {
    console.log(['updateContainer'], { element, container, parentComponent });

    const current$1 = container.current;
    const currentTime = requestCurrentTimeForUpdate();
    const suspenseConfig = null;
    const expirationTime = computeExpirationForFiber(
      currentTime,
      current$1,
      suspenseConfig,
    );
    const context = null;

    if (container.context === null) {
      container.context = context;
    } else {
      container.pendingContext = context;
    }

    const update = createUpdate(expirationTime, suspenseConfig); // Caution: React DevTools currently depends on this property
    // being called "element".

    update.payload = {
      element: element,
    };

    enqueueUpdate(current$1, update);
    scheduleWork(current$1, expirationTime);

    return expirationTime;
  }

  function ReactDOMRoot(container, options) {
    this._internalRoot = createRootImpl(container, ConcurrentRoot, options);
  }

  function ReactDOMBlockingRoot(container, tag) {
    this._internalRoot = createRootImpl(container, tag);
  }

  ReactDOMRoot.prototype.render = ReactDOMBlockingRoot.prototype.render = function (
    children,
  ) {
    const root = this._internalRoot;

    {
      if (typeof arguments[1] === 'function') {
        error(
          'render(...): does not support the second callback argument. ' +
            'To execute a side effect after rendering, declare it in a component body with useEffect().',
        );
      }
    }

    updateContainer(children, root, null, null);
  };

  function createRootImpl(container, tag) {
    // Tag is either LegacyRoot or Concurrent Root
    const root = createContainer(container, tag);

    return root;
  }

  function createLegacyRoot(container) {
    return new ReactDOMBlockingRoot(container, LegacyRoot);
  }

  function legacyRenderSubtreeIntoContainer(children, container) {
    console.log(['legacyRenderSubtreeIntoContainer'], { children, container });

    let root = container._reactRootContainer;
    let fiberRoot;

    root = container._reactRootContainer = createLegacyRoot(container);
    fiberRoot = root._internalRoot;

    updateContainer(children, fiberRoot, null);

    return null;
  }

  function render(element, container) {
    console.log(['render'], element, container);

    return legacyRenderSubtreeIntoContainer(element, container);
  }

  exports.render = render;
});
