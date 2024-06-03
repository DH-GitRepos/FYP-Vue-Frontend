import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate'; // npm install --save vuex-persistedstate

export default createStore({
    plugins: [createPersistedState()], // used to persist state across page reloads
    state: {
        image: null,
        response: null,
      },
      mutations: {
        setImage(state, image) {
          state.image = image;
        },
        setResponse(state, response) {
            state.response = response;
        }
      },
      actions: {
        storeImage({ commit }, image) {
          commit('setImage', image);
        },
      }
});