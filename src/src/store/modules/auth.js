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
        let response = await axios.post('profile/', form)
        commit('setUser', response.data)
    },
    async GetUser({ commit, state }) {
        let response = await axios.get('user/' + state.user.id)
        commit('setUser', response.data)
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
    async JoinConference({ commit, state }, conferenceId) {
        await axios.post('conferences/' + conferenceId + '/join')
        axios.get('user/' + state.user.id).then((response) => {
            commit('setUser', response.data)
        })
    },
    async CancelParticipation({ commit, state }, conferenceId) {
        await axios.post('conferences/' + conferenceId + '/cancel')
        axios.get('user/' + state.user.id).then((response) => {
            commit('setUser', response.data)
        })
    },
    async AddFavorite({ commit, state }, reportId) {
        await axios.post('reports/' + reportId + '/add-favorite')
        axios.get('user/' + state.user.id).then((response) => {
            commit('setUser', response.data)
        })
    },
    async DeleteFavorite({ commit, state }, reportId) {
        await axios.post('reports/' + reportId + '/delete-favorite')
        axios.get('user/' + state.user.id).then((response) => {
            commit('setUser', response.data)
        })
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
