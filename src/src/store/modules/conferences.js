import axios from 'axios';

const state = {
    conferences: [],
    conference: null,
};

const actions = {
    async GetConferences({commit}, page) {
        let response = await axios.get('conferences?page=' + page)
        commit("setConferences", response.data)
        commit("setConference", null)
    },
    async GetConference({commit}, conferenceId) {
        let response = await axios.get('conferences/' + conferenceId)
        commit("setConference", response.data)
    },
    async DeleteConference({commit, rootState}, conferenceId) {
        await axios.delete('conferences/' + conferenceId)
        commit("setConference", null)
        axios.get('user/' + rootState.auth.user.id).then((response) => {
            commit('setUser', response.data, { root: true })
        })
    },
    async UpdateConference({commit}, {form, conferenceId}) {
        let response = await axios.patch('conferences/' + conferenceId, form)
        commit("setConference", response.data)
    },
    async CreateConference({commit, rootState}, form) {
        let response = await axios.post('conferences', form)
        commit("setConference", response.data)
        axios.get('user/' + rootState.auth.user.id).then((response) => {
            commit('setUser', response.data, { root: true })
        })
    },
};
const mutations = {
    setConferences(state, conferences){
        state.conferences = conferences
    },
    setConference(state, conference){
        state.conference = conference
    },
};
export default {
    state,
    actions,
    mutations
};
