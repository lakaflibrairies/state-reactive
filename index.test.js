const { Reactive, Store } = require(".");

const user = {
  firstName: "First",
  lastName: "LAST",
  avatar: "avatar-link",
  username: "username",
  userId: "userId",
  friendCounter: 0,
};

const store = new Store({
  state: user,
  mutations: {
    setFirstName(state, value) {
      state.firstName = value;
      return state;
    },
    setLastName(state, value) {
      state.lastName = value;
      return state;
    },
    increaseFriendCounter(state, value) {
      state.friendCounter++;
      return state;
    },
  },
  actions: {
    setFirstName({ commit }, value) {
      return new Promise((resolve) => {
        commit("setFirstName", value);
        resolve();
      });
    },
    setLastName({ commit }, value) {
      return new Promise((resolve) => {
        commit("setLastName", value);
        resolve();
      });
    },
    increaseFriendCounter({ commit }) {
      return new Promise((resolve) => {
        commit("increaseFriendCounter");
        resolve();
      });
    },
  },
});

test("Reactive test", () => {
  const reactiveUser = new Reactive(user);
  let currentUser = null;
  const registration1 = reactiveUser.register((state) => {
    currentUser = state;
  });
  const registration2 = reactiveUser.register(() => {
    expect(reactiveUser.state).not.toStrictEqual(user);
    console.log("Test ran fron registration2");
  });

  expect(reactiveUser.state).toStrictEqual(user);
  expect(registration1).toHaveProperty("callHandler");
  expect(registration1).toHaveProperty("unregister");
  expect(typeof registration1.callHandler).toEqual("function");
  expect(typeof registration1.unregister).toEqual("function");

  reactiveUser.setState({ ...currentUser, friendCounter: 1 });
  reactiveUser.setState({
    ...currentUser,
    friendCounter: 3,
    firstName: "New First Name",
  });
  reactiveUser.setState({ ...currentUser, lastName: "NEW NAME" });
  reactiveUser.setState({ ...currentUser, username: "user2022" });
  reactiveUser.setState({ ...currentUser, avatar: "new-avatar-link" });

  registration2.unregister();

  reactiveUser.resetState();

  expect(currentUser).toStrictEqual(user);

  // Nothing will happens here, because we have unregister on the state updates.
  // Then, all tests implemented in this registration will not be ran.
  registration2.callHandler();
});

test("Store test", () => {
  store
    .addActionListener("setFirstName", ({ state }) => {
      expect(store.snapshot.firstName).not.toStrictEqual(user.firstName);
      expect(store.state.state).not.toStrictEqual(user.firstName);
      expect(state).not.toStrictEqual(user.firstName);
      console.log("SetFirstName: Tests ran");
    })
    .addActionListener("setLastName", () => {
      expect(store.snapshot.lastName).not.toStrictEqual(user.lastName);
      console.log("SetLastName: Tests ran");
    })
    .addActionListener("increaseFriendCounter", ({ state }) => {
      expect(state.friendCounter).toBeGreaterThan(user.friendCounter);
      console.log("increaseFriendCounter: Tests ran");
    }, {
      once: true, // Adding this option if we want to listen once to this action.
    });

  // Here, we dispatch action to run tests.
  store.dispatch("setFirstName", "Git");
  store.dispatch("setLastName", "JEST TESTER");
  store.dispatch("increaseFriendCounter");
});
