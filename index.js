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
      },
      callHandler: () =>
        !cb || !registeredActions["_" + key]
          ? () => {}
          : registeredActions["_" + key](clone(s)),
    };
  };

  runListeners = function () {
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

  this.setState = function (value) {
    s = clone({ ...s, ...value });
    runListeners();
  };

  this.resetState = function () {
    s = clone(initialValue);
    runListeners();
  };
}

function Store(config) {
  let s = new Reactive(config.state);
  let mutations = config.mutations;
  let actions = config.actions;
  let actionListeners = {};

  for (let key in actions) {
    actionListeners[key] = {};
  }

  Object.defineProperty(this, "state", {
    get() {
      return s;
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
}

exports.Reactive = Reactive;
exports.Store = Store;
