/**
 * @template T
 * @param { T } obj
 * @returns { T }
 */
function clone(obj) {
  return JSON.parse(JSON.stringify({ obj })).obj;
}

function Reactive(initialValue) {
  let s = clone(initialValue);
  let registeredActions = {};

  Object.defineProperty(this, "state", {
    get() {
      return clone(s);
    },
    set(value) {
      console.log("Cannot set state. Instead, use setState method.");
    },
  });

  const runListeners = function () {
    if (Object.keys(registeredActions).length !== 0) {
      for (const key in registeredActions) {
        if (Object.prototype.hasOwnProperty.call(registeredActions, key)) {
          if (typeof registeredActions[key] === "function") {
            registeredActions[key](clone(s));
          }
        }
      }
    }
  };

  const removeNulledCallbackActions = function () {
    const keys = Object.keys(registeredActions).filter(
      (k) => !registeredActions[k]
    );

    for (const val of keys) {
      delete registeredActions[val];
    }
  };

  this.register = function (cb) {
    if (typeof cb !== "function") {
      throw Error("Listen callback must be a function.");
    }

    const key = Object.keys(registeredActions).length;
    registeredActions["_" + key] = cb;

    return {
      unregister: () => {
        registeredActions["_" + key] = null;
        cb = null;

        removeNulledCallbackActions();
      },
      callHandler: () =>
        !cb || !registeredActions["_" + key]
          ? () => {}
          : registeredActions["_" + key](clone(s)),
    };
  };

  this.setState = function (value) {
    s = clone({ ...s, ...value });
    runListeners();
  };

  this.resetState = function () {
    s = clone(initialValue);
    runListeners();
  };

  this.reachValueOf = function (key) {
    if (typeof key !== "string" || key.length === 0) {
      throw new Error("parameter key must be a not empty string.");
    }

    try {
      return key.split(".").reduce((acc, curr, currentIndex) => {
        if (currentIndex === 0) {
          return s[curr];
        }
        return acc[curr];
      }, null);
    } catch (error) {
      throw new Error("Can not read property " + key + " in state.");
    }
  };
}

function Store(config) {
  let s = new Reactive(config.state);
  let mutations = config.mutations;
  let emptyActions = [];
  let actions = config.actions;
  let actionListeners = {};
  let eventNames = new Reactive({});
  let emitted = new Reactive({ value: null });

  for (let key in actions) {
    actionListeners[key] = {};
  }
  if (Array.isArray(config.empty)) {
    for (const ea of config.empty) {
      if (typeof ea === "string") {
        emptyActions.push(ea);
        actionListeners[ea] = {};
      }
    }
  }

  Object.defineProperty(this, "state", {
    get() {
      return clone(s);
    },
    set(value) {
      console.log(
        "Cannot set state. Instead, create action in store configuration, and dispatch it with the data you would update the state of store."
      );
    },
  });

  Object.defineProperty(this, "snapshot", {
    get() {
      return s.state;
    },
    set(value) {
      console.log(
        "Cannot set state. Instead, create action in store configuration, and dispatch it with the data you would update the state of store."
      );
    },
  });

  const runActionListeners = function (actionName) {
    const listeners = actionListeners[actionName];
    if (!listeners) {
      return;
    }
    const keys = Object.keys(listeners);
    keys.forEach((key) => {
      if (!listeners[key]) {
        // console.log(`Action listener ${key} not found or null.`);
        return;
      }
      listeners[key]({ state: s.state });
    });
  };

  const commit = function (commitName, commitPayload) {
    if (!mutations[commitName]) {
      throw Error("Cannot find mutation " + commitName);
    }
    return new Promise((resolve, reject) => {
      s.setState(mutations[commitName](s.state, commitPayload));
      resolve();
    });
  };

  this.dispatch = function (actionName, payload) {
    if (emptyActions.includes(actionName)) {
      runActionListeners(actionName);
      return Promise.resolve();
    }
    if (!actions[actionName]) {
      throw Error("Cannot dispatch action " + actionName);
    }
    const p = actions[actionName]({ commit, state: s.state }, payload);
    runActionListeners(actionName);
    return p;
  };

  this.addActionListener = function (actionName, cb, options = undefined) {
    const listeners = actionListeners[actionName];
    if (!listeners) {
      throw Error("Cannot listen action " + actionName);
    }

    const keysLength = Object.keys(listeners).length;
    actionListeners[actionName]["_" + keysLength] = (...args) => {
      cb(...args);
      const { once = false } = options || {};
      if (once) {
        actionListeners[actionName]["_" + keysLength] = null;
      }
    };

    return { addActionListener: this.addActionListener };
  };

  this.emit = function (eventName, payload) {
    if (typeof eventName !== "string" || eventName.length === 0) {
      return;
    }
    const newVal = {};
    newVal[eventName] = payload || null;
    eventNames.setState(newVal);
    emitted.setState({ value: eventName });
  };

  this.listenAction = function (eventName, cb) {
    if (
      typeof cb !== "function" &&
      (typeof eventName !== "string" || eventName.length === 0)
    ) {
      throw new Error(
        "cb must be a function and eventName must be a not empty string."
      );
    }
    emitted.register((s) => {
      if (s.value === eventName) {
        cb(eventNames.state[eventName]);
      }
      return;
    });
    return { listenAction: this.listenAction };
  };
}

exports.Reactive = Reactive;
exports.Store = Store;
