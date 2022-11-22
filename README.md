# State-reactive

A small library for managing state and reactive elements in JS application using registrations and action listeners.

## Getting started
### Installation
`npm i -S state-reactive` or `npm install -save state-reactive`

### Demo
**Here is sample code showing to use state-reactive.**

    const { Reactive } = require("state-reactive");
    const reactive = new Reactive({ foo: "bar" });
    
    const registration = reactive.register((state) => {
	  // each time the state will change, the new state will le logged in the console.
	  console.log(state);
    });
    
    reactive.setState({ foo: "new bar" });

## How it works ?
**state-reactive** provides you with two classes: ***Reactive*** and ***Store***. 
**Store** includes **Reactive** and other features for creating ``mutations``, ``actions`` using them, dispatching (via ``dispatch``) to trigger a specific action, and adding action listeners (via ``addActionListener``).

### Reactive
Creating a reactive object using Reactive class is quite simple.

    const { Reactive } = require("state-reactive");
    const initialValue = { foo: "bar", toto: "tata" };
    const reactiveEl = new Reactive(initialValue);
    
    // Note: We recommand to initialize Reactive object with a JSON value as in the example above.

#### 1 - Register method
To react when state of reactive object change, use the code below.

    const initialValue = { foo: "bar", toto: "tata" };
    const reactiveEl = new Reactive(initialValue);

    // register method allows you to react when state of your reactive 
    // element changes by using callback function as parameter. The current 
    // state is provided in the callback parameter.

    reactiveEl.register((state) => {
        // your code here.
    });

#### 2 - Registration
When you register to watch any change on the state using register method, it returns an object (a registration) which can be used to unregister or call registration callback anywhere.

    const registration = reactiveEl.register((state) => {
        // your code here.
    });

    console.log(registration);

    /*
    // Logged in the console
    {
      unregister: [Function: unregister],
      callHandler: [Function: callHandler]
    }
    */

#### 3 - Remove registration
To remove registration, use unregsiter method provides on registration object.

    const registration = reactiveEl.register((state) => {
        // your code here.
    });

    registration.unregister();

#### 4 - Registration callback
This is how you can call your registration callback anywhere in your code.

    registration.callHander();

*``Note``*: ``registration.callHandler`` must be called before ``register.unregister``, otherwise nothing will happen.

    registration = reactiveEl.register(...);

    registration.callHandler(); // Registration callback will be called.
    registration.unregsiter(); // Registration callback will be removed.
    registration.callHandler(); // Nothing will happen.

#### 5 - Get state of reactive element
Reactive class provides a property call ``state`` to get the value of the current state.

    console.log(reactiveEl.state);
    
    /* Logged in console
    { foo: "bar", toto: "tata" }
    */

#### 6 - Set state of reactive element
State of Reactive object can't be updated using setter ``state``. Instead, you can use ``setState`` method.

    reactiveEl.setState(value);

    // Make sure that the value with which we update the state is a JSON
    // with all (or some) properties of the initial state.

#### 7 - Reset state
To reset state of your reactive element, your can simply set state with the initial value, if this initial value has been store in a variable or a constant.

    reactiveEl.setState(initialValue); // This will set state with the initial value.

Or, you can use to ``resetState`` method provided.

    reactiveEl.resetState();

#### 8 - Reach value of specific key
This method is used to reach the value of specific point in state tree based on the key parameter.

*``note``* : If the key parameter points on unreachable value, then an error will be triggered or undefined will be returned instead.

    const initialValue = {
      foo: "bar", 
      toto: "tata", 
      big: {
        foo: "sub-bar",
        sub: {
          titi: 421,
          town: "Douala"
        }
      }
    };
    const reactiveEl = new Reactive(initialValue);

    console.log(reactiveEl.reachValueOf("big.sub.town"));
    // Log in console
    // Douala

### Store
Creating a store object using Store class.

    const store = new Store(config);

#### ``config``
``config`` value is a JSON that contains configuration of your store. ``config`` must contain exactly 3 properties and 1 optional.

- ``state`` : must be a JSON like the initial value in the Reactive object.
- ``mutations`` : must be a JSON which contains functions as properties. Each function must have two parameters. The first current state provided and the second (optional) is value to use to update state. Mutation must ever return the new state to update.
- ``actions`` : must be a JSON which contains functions as properties. Each function must have two parameters. The first ``context`` provided and the second (optional) is value to use to update state, using ``commit``. Action must ever return a Promise.
- ``empty`` (optional) : must be an array of string that represents a list of actions that can be dispatched without payload and not required any configuration in actions and mutations blocs.

*``Note``* : ``context`` is an object provided in all action function, which contains to properties : ``commit`` and ``state``.
*``Note``* : ``commit`` is a way to call mutation for update state. ``commit`` takes two parameters (one is optional). First is mutation name and second id payload that mutation will used to update state.
*``Note``* : ``commit.state`` contains the previous version of state before commit new state.

#### ``state``
Go to ***Reactive*** section for more informations.

#### ``snapshot``
``store.snapshot`` represents the value of your state at a specific time.

#### ``addActionListener``
Somewhere in your code, you can add action listener like this.

    // addActionListener takes 3 parameters (the last is optional).
    store.addActionListener(...);
    // The first is the action name
    // The second is the callback to provide when action will be dispatched. This callback may have one object as parameter, which contains one property (``state``) that represents the value of the state after action being ran.
    // The last (optional) is the configuration (JSON object) of your listener which contains one property (once equals to false by default) that specify if listener will be called one time only.

This is sample code of addActionListener

    store.addActionListener("setFirstName", ({ state }) => {
        // your code here...
    }, { once: true });

#### ``dispatch``
dispatch method is a way you can update the state of your store anywhere in your code. Executing dispatch triggers the execution of all action listeners associated with the dispatched action. dispatch ever returns a Promise and takes two parameters depending on the implementation of the associated action.

> First parameter is the action name provided in the store configuration on the action scope.
> Second parameter is the payload, depending on the payload of the implementation of the associated action.

This is sample code of dispatch

    store.dispatch("setLastName", "NEW LAST NAME").then(() => {
        // your code here
    }).catch(e => {
        console.log(e);
    });

You can listen empty action by dispatching it without payload.

