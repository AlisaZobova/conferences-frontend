import Vuex from 'vuex'
import Vue from 'vue'
import createPersistedState from 'vuex-persistedstate'
import auth from './modules/auth'
import conferences from './modules/conferences'
import countries from './modules/countries'
import reports from '@/store/modules/reports'
import comments from '@/store/modules/comments'
import categories from '@/store/modules/categories'
import stripe from '@/store/modules/stripe'

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        auth,
        conferences,
        countries,
        reports,
        comments,
        categories,
        stripe,
    },
    plugins: [createPersistedState()],
})
