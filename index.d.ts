type Actions<T> = {
  [action: string]: (
    context: {
      commit: (commitName: string, commitPayload?: any) => void;
      state?: T;
    },
    payload?: any
  ) => Promise<any | void>;
};

type EventAction<T> = { (event: { state?: T }): void };

type ActionListeners<T> = {
  [key: keyof Actions<T>]: {
    [member: string]: EventAction<T>;
  };
};

type Mutations<T> = {
  [mutation: string]: (state: T, payload?: any) => T;
};

interface InitialConfig<T> {
  state: T;
  mutations: Mutations<T>;
  actions: Actions<T>;
}

interface ReactiveUnregistration {
  unregister: () => void;
  callHandler: () => void;
}

type AddActionListener<T> = {
  (
    actionName: keyof ActionListeners<T>,
    cb: EventAction<T>,
    options?: { once: boolean }
  ): {
    addActionListener: AddActionListener;
  };
};

export declare class Reactive<T> {
  private initialValue: T;
  private s: T;
  private registeredActions: { [key: string]: (value: T) => void };

  constructor(initialValue: T);

  get state(): T;

  register(cb: (value: T) => void): ReactiveUnregistration;

  setState(value: T): void;

  resetState(): void;
}

export declare class Store<T> {
  private s: Reactive<T>;
  private mutations: Mutations<T>;
  private actions: Actions<T>;
  private actionListeners: ActionListeners<T>;

  constructor(config: InitialConfig<T>);

  get state(): Reactive<T>;

  get snapshot(): T;

  private commit(
    commitName: keyof Mutations<T>,
    commitPayload?: any
  ): Promise<void>;

  private runActionListeners(actionName: keyof Actions<T>): void;

  dispatch(actionName: keyof Actions<T>, payload?: any): Promise<any>;

  /**
   * @method
   */
  addActionListener: AddActionListener<T>;
}
