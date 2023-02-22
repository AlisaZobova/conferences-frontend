import axios from 'axios'

const state = {
    user: null,
    userId: null,
}

const getters = {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user.roles[0].name === 'Admin',
    isAnnouncer: (state) => state.user.roles[0].name === 'Announcer',
    isCreator: (state) => (conferenceId) => {
        conferenceId = parseInt(conferenceId)
        function isInConf(element) {
            return element.id === conferenceId
        }
        return state.user.conferences.findIndex(isInConf) !== -1
    },
    isJoined: (state) => (conferenceId) => {
        conferenceId = parseInt(conferenceId)
        function isInJoined(element) {
            return element.id === conferenceId
        }
        return state.user.joined_conferences.findIndex(isInJoined) !== -1
    },
}

const actions = {
    async Register({ commit }, form) {
        let response = await axios.post('register', form)
        commit('setUserId', response.data.id)
    },
    async RegisterAdditional({ state, commit }, form) {
        let response = await axios.post('register/' + state.userId, form)
        commit('setUser', response.data)
        commit('setUserId', null)
    },
    async UpdateProfile({ commit }, form) {
        let response = await axios.post('profile', form)
        commit('setUser', response.data)
    },
    async GetUser({ commit, state }) {
        axios.get('user/' + state.user.id).then((response) => {
            commit('setUser', response.data)
        })
    },
    async LogIn({ commit }, User) {
        let response = await axios.post('login', User)
        commit('setUser', response.data)
    },
    async LogOut({ commit }) {
        commit('LogOut')
        await axios.post('logout').then(() => {
            if (
                ![
                    process.env.VUE_APP_URL,
                    process.env.VUE_APP_URL + '/conferences',
                ].includes(window.location.href)
            ) {
                window.location.href = process.env.VUE_APP_URL + '/login'
            }
        })
    },
    async JoinConference({ dispatch }, conferenceId) {
        axios
            .post('conferences/' + conferenceId + '/join')
            .then(() => dispatch('GetUser'))
    },
    async CancelParticipation({ dispatch }, conferenceId) {
        axios
            .post('conferences/' + conferenceId + '/cancel')
            .then(() => dispatch('GetUser'))
    },
    async AddFavorite({ dispatch }, reportId) {
        await axios
            .post('reports/' + reportId + '/add-favorite')
            .then(() => dispatch('GetUser'))
    },
    async DeleteFavorite({ dispatch }, reportId) {
        axios
            .post('reports/' + reportId + '/delete-favorite')
            .then(() => dispatch('GetUser'))
    },
}
const mutations = {
    setUser(state, user) {
        state.user = user
    },
    setUserId(state, userId) {
        state.userId = userId
    },
    LogOut(state) {
        state.user = null
        state.userId = null
    },
}
export default {
    state,
    getters,
    actions,
    mutations,
}
