// src/store/index.js
import { createStore } from 'vuex';

const store = createStore({
  state: {
    userID: null,
    username: null,
  },
  mutations: {
    setUser(state, { userID, username }) {
      state.userID = userID;
      state.username = username;
    },
    clearUser(state) {
      state.userID = null;
      state.username = null;
    },
    updateUsername(state, username) {
      state.username = username;
    },
  },
  actions: {
    login({ commit }, { userID, username }) {
      commit('setUser', { userID, username });
    },
    logout({ commit }) {
      commit('clearUser');
    }
  },
  getters: {
    isAuthenticated: state => !!state.userID,
    getUserID: state => state.userID,
    getUsername: state => state.username,
  }
});

export default store;
