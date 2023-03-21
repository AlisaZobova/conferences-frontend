import axios from 'axios'

const state = {
    plan: null,
    plans: [],
}

const actions = {
    async subscribeUser({ commit, rootState }, data) {
        return axios
            .post('/subscription', data)
            .then((response) => {
                axios.get('user/' + rootState.auth.user.id).then((response) => {
                    commit('setUser', response.data, { root: true })
                })
                return response
            })
            .catch((error) => {
                return Promise.reject(error)
            })
    },
    async unsubscribeUser({ commit, rootState }) {
        return axios
            .post('/cancel-subscription')
            .then((response) => {
                axios.get('user/' + rootState.auth.user.id).then((response) => {
                    commit('setUser', response.data, { root: true })
                })
                return response
            })
            .catch((error) => {
                return Promise.reject(error)
            })
    },
    getPlan({ commit }, planId) {
        return axios
            .get('/plans/' + planId)
            .then((response) => {
                commit('setPlan', response.data)
                return response
            })
            .catch((error) => {
                return Promise.reject(error)
            })
    },
    getPlans({ commit }) {
        return axios
            .get('/plans')
            .then((response) => {
                commit('setPlans', response.data)
                return response
            })
            .catch((error) => {
                return Promise.reject(error)
            })
    },
}
const mutations = {
    setPlan(state, plan) {
        state.plan = plan
    },
    setPlans(state, plans) {
        state.plans = plans
    },
}
export default {
    state,
    actions,
    mutations,
}
