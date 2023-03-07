import axios from 'axios'

const state = {
    conferences: [],
    searchedConferences: [],
    conference: null,
    page: 1,
}

const getters = {
    currentConferencesPage: (state) => {
        return state.page
    },
}

const actions = {
    async GetConferences({ commit }, { page, filters }) {
        let response = await axios.get('conferences?page=' + page + filters)
        commit('setConferences', response.data)
        commit('setConference', null)
    },
    async SearchConferences({ commit }, query) {
        let response = await axios.get('conferences/search' + query)
        commit('setSearchedConferences', response.data)
    },
    async GetConference({ commit }, conferenceId) {
        let response = await axios.get('conferences/' + conferenceId)
        commit('setConference', response.data)
    },
    async GetUser({ commit, rootState }) {
        axios.get('user/' + rootState.auth.user.id).then((response) => {
            commit('setUser', response.data, { root: true })
        })
    },

    async DeleteConference({ commit, dispatch }, conferenceId) {
        await axios.delete('conferences/' + conferenceId)
        commit('setConference', null)
        dispatch('GetUser')
    },
    async UpdateConference({ commit }, { form, conferenceId }) {
        let response = await axios.patch('conferences/' + conferenceId, form)
        commit('setConference', response.data)
    },
    async CreateConference({ commit, dispatch }, form) {
        return new Promise((resolve) =>
            axios.post('conferences', form).then((response) => {
                commit('setConference', response.data)
                dispatch('GetUser')
                resolve(response)
            })
        )
    },
    SetConferencesPage({ commit }, newValue) {
        commit('setConferencesPage', newValue)
    },
    async ExportConferences(context, filters) {
        await axios.get('conferences/export' + filters)
    },
    async ExportConferenceListeners({ state }) {
        await axios.get(
            'conferences/' + state.conference.id + '/export-listeners'
        )
    },
}
const mutations = {
    setConferences(state, conferences) {
        state.conferences = conferences
    },
    setSearchedConferences(state, conferences) {
        state.searchedConferences = conferences
    },
    setConference(state, conference) {
        state.conference = conference
    },
    setConferencesPage(state, page) {
        state.page = page
    },
}
export default {
    state,
    getters,
    actions,
    mutations,
}
