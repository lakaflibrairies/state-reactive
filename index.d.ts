type Actions<T> = {
    [action: string]: (
        context: {
            commit: (commitName: string, commitPayload?: any) => void;
            state?: T;
        },
        payload?: any
    ) => Promise<any | void>;
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

export declare class Reactive<T> {
    private initialValue: T;
    private s: T;
    private registeredActions: { [key: string]: (value: T) => void };

    constructor(initialValue: T);

    get state(): T;

    register(cb: (value: T) => void): ReactiveUnregistration;

    setState(value: T): void;

    resetState(): void
}

export declare class Store<T> {
    private s: Reactive<T>;
    private mutations: Mutations<T>;
    private actions: Actions<T>;

    constructor(config: InitialConfig<T>);

    get state(): Reactive<T>;
    
    private commit(commitName: keyof Mutations<T>, commitPayload?: any): Promise<void>;

    dispatch(actionName: keyof Actions<T>, payload?: any): Promise<any>;
}

