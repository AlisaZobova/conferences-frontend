import axios from 'axios'

const state = {
    categories: [],
    category: null,
}

const actions = {
    async GetCategories({ commit }) {
        let response = await axios.get('categories')
        commit('setCategories', response.data)
        commit('setCategory', null)
    },
    async GetCategory({ commit }, categoryId) {
        let response = await axios.get('categories/' + categoryId)
        commit('setCategory', response.data)
    },
}
const mutations = {
    setCategories(state, categories) {
        state.categories = categories
    },
    setCategory(state, category) {
        state.category = category
    },
}

export default {
    state,
    actions,
    mutations,
}
