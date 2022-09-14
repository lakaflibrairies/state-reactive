function clone(obj) {
    return JSON.parse(JSON.stringify({ obj })).obj;
}

function Reactive(initialValue) {
    let s = clone(initialValue);
    let registeredActions = {};

    Object.defineProperty(this, "state", {
        get() {
            return s;
        },
        set(value){
            console.log("Cannot set state. Instead, use setState method.");
        },
    });

    this.register = function(cb) {
        if (typeof cb !== "function") {
            throw Error("Listen callback must be a function.");
        }

        const key = Object.keys(registeredActions).length;
        registeredActions["_" + key] = cb;

        return {
            unregister: () => {
                registeredActions['_' + key] = null;
                cb = null;
            },
            callHandler: () => !cb ? () => {} : cb(s),
        };
    };

    runListeners = function() {
        if (Object.keys(registeredActions).length !== 0) {
            for (const key in registeredActions) {
                if (Object.prototype.hasOwnProperty.call(registeredActions, key)) {
                    if (typeof registeredActions[key] === "function") {
                        registeredActions[key](s);
                    }
                }
            }
        }
    };

    this.setState = function(value) {
        s = value;
        runListeners();
    };

    this.resetState = function() {
        s = clone(initialValue);
        runListeners();
    };
}

function Store(config) {
    let s = new Reactive(config.state);
    let mutations = config.mutations;
    let actions = config.actions;

    Object.defineProperty(this, "state", {
        get() {
            return s;
        },
        set(value) {
            console.log("Cannot set state. Instead, create action in store configuration, and dispatch it with the data you would update the state of store.");
        },
    });

    commit = function(commitName, commitPayload) {
        if (!mutations[commitName]) {
            throw Error("Cannot find mutation " + commitName);
        }
        return new Promise((resolve, reject) => {
            s.setState(mutations[commitName](s.state, commitPayload));
            resolve();
        });
    }

    this.dispatch = function(actionName, payload) {
        if (!actions[actionName]) {
            throw Error("Cannot dispatch action " + actionName);
        }
        return actions[actionName]({ commit, state: s }, payload);
    }
}

exports.Reactive = Reactive;
exports.Store = Store;
