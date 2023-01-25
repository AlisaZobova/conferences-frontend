import axios from 'axios';

const state = {
    conferences: [],
    conference: null,
};

const getToken = async () => {
    await axios.get('/sanctum/csrf-cookie');
}

const actions = {
    async GetConferences({commit}, page) {
        let response = await axios.get('conferences?page=' + page)
        await commit("setConferences", response.data)
        await commit("setConference", null)
    },
    async GetConference({commit}, conferenceId) {
        let response = await axios.get('conferences/' + conferenceId)
        await commit("setConference", response.data)
    },
    async DeleteConference({commit, rootState}, conferenceId) {
        await getToken()
        await axios.delete('conferences/' + conferenceId)
        await commit("setConference", null)
        axios.get('user/' + rootState.auth.user.id).then((response) => {
            commit('setUser', response.data, { root: true })
        })
    },
    async UpdateConference({commit}, {form, conferenceId}) {
        await getToken()
        let response = await axios.patch('conferences/' + conferenceId, form)
        await commit("setConference", response.data)
    },
    async CreateConference({commit, rootState}, form) {
        await getToken()
        let response = await axios.post('conferences', form)
        await commit("setConference", response.data)
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
