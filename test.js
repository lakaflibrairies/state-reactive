const { Store } = require(".");

var user = {
    userId: 14,
    firstName: "Vaneck",
    lastName: "KAFFO",
    friendsCounter: 14568
};

const store = new Store({
    state: user,
    mutations: {
        setFirstName(state, firstName) {
            state.firstName = firstName;
            console.log("Mutation setFirstName ran.");
            return state;
        },
        setLastName(state, lastName) {
            state.lastName = lastName;
            console.log("Mutation setLastName ran.");
            return state;
        },
        increaseFriends(state) {
            state.friendsCounter++;
            console.log("Mutation increaseFriends ran.");
            return state;
        },
        decreaseFriends(state) {
            state.friendsCounter--;
            console.log("Mutation decreaseFriends ran.");
            return state;
        },
        clearUser(state) {
            state.firstName = "",
            state.lastName = "";
            state.friendsCounter = 0;
            state.userId = 0;
            console.log("Mutation clearUser ran.");
            return state;
        }
    },
    actions: {
        setFirstName({ commit }, firstName) {
            return new Promise((resolve, reject) => {
                commit("setFirstName", firstName);
                console.log("Action setFirstName dispatched.");
                resolve();
            })
        },
        setLastName({ commit }, lastName) {
            return new Promise((resolve, reject) => {
                commit("setLastName", lastName);
                console.log("Action setLastName dispatched.");
                resolve();
            })
        },
        increaseFriends({ commit }) {
            return new Promise((resolve, reject) => {
                commit("increaseFriends");
                console.log("Action increaseFriends dispatched.");
                resolve();
            })
        },
        decreaseFriends({ commit }) {
            return new Promise((resolve, reject) => {
                commit("decreaseFriends");
                console.log("Action decreaseFriends dispatched.");
                resolve();
            })
        },
        clearUser({ commit }) {
            return new Promise((resolve, reject) => {
                commit("clearUser");
                console.log("Action clearUser dispatched.");
                resolve();
            })
        },
    },
});

const registration = store.state.register((currentUser) => {
    user = currentUser;
    console.log(user);
});

// Test of Reactive
store.state.setState({ ...user, lastName: "KAFFO NGUEFFE" });
store.state.resetState();
registration.callHandler();
store.state.state = user;

// Test of Store
store.dispatch("clearUser");
store.dispatch("increaseFriends");
store.dispatch("setLastName", "KAFFO");
store.state.resetState();

registration.unregister();
store.dispatch("clearUser");
store.state.resetState();
