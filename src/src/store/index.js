import Vuex from 'vuex';
import Vue from 'vue';
import createPersistedState from "vuex-persistedstate";
import auth from './modules/auth';
import conferences from "./modules/conferences";
import countries from "./modules/countries";


Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        auth,
        conferences,
        countries
    },
    plugins: [createPersistedState()]
});
