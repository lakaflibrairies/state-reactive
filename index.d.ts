export type Actions<T> = {
  [action: string]: (
    context: {
      commit: (commitName: string, commitPayload?: any) => void;
      state?: T;
    },
    payload?: any
  ) => Promise<any | void>;
};

export type EventAction<T> = { (event: { state?: T }): void };

export type ActionListeners<T> = {
  [key: keyof Actions<T>]: {
    [member: string]: EventAction<T>;
  };
};

export type Mutations<T> = {
  [mutation: string]: (state: T, payload?: any) => T;
};

export interface InitialConfig<T> {
  state: T;
  mutations: Mutations<T>;
  actions: Actions<T>;
  empty: string[];
}

/**
 * @interface ReactiveUnregistration
 * @description When you register to watch any change on the state using register method, it returns data (a registration) which can be used to unregister or call registration callback anywhere.
 * @use
 * ```js
 * const registration = reactiveEl.register((state) => {
 *   // your code here.
 * });
 *
 * console.log(registration);
 *
 * // Logged in the console
 * {
 *   unregister: [Function: unregister],
 *   callHandler: [Function: callHandler]
 * }
 * ```
 */
export interface ReactiveUnregistration {
  /**
   * @key unregister
   * @type {{ () => void }}
   * @description It's used to unregister
   */
  unregister: () => void;
  /**
   * @key callHandler
   * @type {{ () => void }}
   * @description It's used to call registration callback anywhere
   */
  callHandler: () => void;
}

export type AddActionListener<T> = {
  (
    actionName: keyof ActionListeners<T>,
    cb: EventAction<T>,
    options?: { once: boolean }
  ): {
    addActionListener: AddActionListener<T>;
  };
};

export type ListenActionType = { listenAction: ListenAction };

export type ListenAction = { (eventName: string, cb: { (payload: any): void } ): ListenActionType };

export declare class Reactive<T> {
  private initialValue: T;
  private s: T;
  private registeredActions: { [key: string]: (value: T) => void };

  /**
   * @class Reactive
   * @contructor
   * @description It's used to contruct object based on Reactive class
   * 
   * @param { T } initialValue
   * @description Represents the configuration of the state of Reactive object
   */
  constructor(initialValue: T);

  /**
   * @method state
   * @getter
   * @description It's used to get the current value of the state. Update this value don't update the original state.
   * @returns { T }
   */
  get state(): T;

  /**
   * @method removeNulledCallbackActions
   * @private
   * @description This is method is called when unregister method of registration object is called. It's useful for remove all nulled registration action.
   */
  private removeNulledCallbackActions(): void;

  /**
   * @method register
   * @description This method is used to react on changing of state of Reactive object
   * @use
   * ```js
   * const initialValue = { foo: "bar", toto: "tata" };
   * const reactiveEl = new Reactive(initialValue);
   *
   * // register method allows you to react when state of your reactive 
   * // element changes by using callback function as parameter. The current 
   * // state is provided in the callback parameter.
   *
   * reactiveEl.register((state) => {
   * // your code here.
   * });
   * ```
   * @returns { ReactiveUnregistration }
   */
  register(cb: (value: T) => void): ReactiveUnregistration;

  /**
   * @method setState
   * @setter
   * @description This method is used to update the state of Reactive object.
   * @note Make sure that the value with which you upate the state is a JSON with all (or some) properties of the initial state.
   * @param { T } value
   * 
   * @return { void }
   */
  setState(value: T): void;

  /**
   * @method resetState
   * @description This method is used to restore the initial value of the state.
   * 
   * @returns { void }
   */
  resetState(): void;

  /**
   * @method reachValueOf
   * @description This method is used to reach the value of a key at a specific position in the state tree, based on key paramater.
   * @note If key parameter points on not reachable value, an error will be triggered or undefined will be returned instead.
   * 
   * @use 
   * ```js
   * const initialValue = {
   *   foo: "bar", 
   *   toto: "tata", 
   *   big: {
   *     foo: "sub-bar",
   *     sub: {
   *       titi: 421,
   *       town: "Douala"
   *     }
   *   }
   * };
   * const reactiveEl = new Reactive(initialValue);
   * 
   * console.log(reactiveEl.reachValueOf("big.sub.town"));
   * // Log in console
   * // Douala
   * ```
   * 
   * @param { string } key
   * @description Represents a specific point in the state tree.
   * 
   * @returns { any } The value of the key.
   */
  reachValueOf(key: string): any;
}

export declare class Store<T> {
  private s: Reactive<T>;
  private mutations: Mutations<T>;
  private actions: Actions<T>;
  private emptyActions: string[];
  private actionListeners: ActionListeners<T>;
  private eventNames: Reactive<Record<string, any>>;
  private emitted: Reactive<{ value: string }>;

  constructor(config: InitialConfig<T>);

  /**
   * @method state
   * @getter
   * @description It's used to get the state in Reactive form.
   * @returns { Reactive<T> }
   */
  get state(): Reactive<T>;

  /**
   * @method snapshot
   * @getter
   * @description It's used to get the value of state when this method is called.
   * 
   * @returns { T }
   */
  get snapshot(): T;

  private commit(
    commitName: keyof Mutations<T>,
    commitPayload?: any
  ): Promise<void>;

  private runActionListeners(actionName: keyof Actions<T>): void;

  /**
   * @method dispatch
   * @description It's used to call an action provided in store configuration with the associated payload (optional). This method may be used to updated the state value.
   * @use 
   * ```js
   * const store = new Store({ // configration here... })
   * store.dispatch("action-name", "payload value (optional)").then(() => {
   *     // your code here
   * }).catch(e => {
   *     console.log(e);
   * });
   * ```
   * @returns { Promise<any> }
   */
  dispatch(actionName: keyof Actions<T>, payload?: any): Promise<any>;

  /**
   * @method addActionListener
   * @description This method is used to register a listener of an action that will executed when action will be dispatched. It means that addActionListener allows to register a listener before it's called. 
   * @use
   * ```js
   * store.addActionListener("setFirstName", ({ state }) => {
   *   // your code here...
   * }, { once: true });
   * ```
   * @param { string } actionName
   * @param { EventAction<T> } cb - callback parameter
   * @param {{ once: boolean }} options - optional parameter
   */
  addActionListener: AddActionListener<T>;

  /**
   * @method emit
   * @description This method is used to trigger an action at a specific moment by providing a payload.
   * @use
   * ```js
   * store.emit("action-name", { foo: "bar" });
   * ```
   * @param { string } eventName
   * @param { any } payload
   */
  emit(eventName, payload): void

  /**
   * @method listenAction
   * @description This method is used to listen to an emitted action. It means that the provided callback cb will not be registered in the store actions and be executed when action will be called.
   * @use
   * ```js
   * store
   *   .listenAction("action-name", (payload) => {
   *     // code here...
   *   })
   *   .ilstenAction("new-action", (payload) => {
   *     // code here...
   *   });
   * ```
   * @param { string } eventName
   * @param { any } payload - it's the provided payload when this action was emitted.
   * @returns { ListenActionType }
   */
  listenAction(eventName, cb): ListenActionType;
}
