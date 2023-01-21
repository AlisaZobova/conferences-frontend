import axios from 'axios';

const state = {
    user: null,
    userId: null
};

const getters = {
    isAuthenticated: state => !!state.user,
    isAdmin: state => state.user.roles[0].name === 'Admin',
    isAnnouncer: state => state.user.roles[0].name === 'Announcer',
    isCreator: state => conferenceId => {
        let conferencesList = state.user.conferences.filter(function (item) {
            return item.id === conferenceId
    })
        return conferencesList.length > 0
    },
    isJoined: state => conferenceId => {
        let conferencesList = state.user.joined_conferences.filter(function (item) {
            return item.id === conferenceId
        })
        return conferencesList.length > 0
    },
};

const getToken = async () => {
  await axios.get('/sanctum/csrf-cookie');
}

const actions = {
    async Register({commit}, form) {
        await getToken()
        let response = await axios.post('register', form)
        await commit("setUserId", response.data.id)
    },
    async RegisterAdditional({state, commit}, form) {
        await getToken()
        let response = await axios.post('register/' + encodeURIComponent(state.userId), form)
        await commit("setUser", response.data)
        await commit("setUserId", null)
    },

    async LogIn({commit}, User) {
        await getToken()
        let response = await axios.post('login', User)
        await commit('setUser', response.data)
    },
    async LogOut({commit}){
        await getToken()
        commit('LogOut')
        await axios.post('logout')
    },
    async JoinConference({commit}, conferenceId) {
        await getToken()
        axios.post('conferences/' + conferenceId + '/join').then((response) => {
            commit("setUser", response.data)
        })
    },
    async CancelParticipation({commit}, conferenceId) {
        await getToken()
        axios.post('conferences/' + conferenceId + '/cancel').then((response) => {
            commit("setUser", response.data)
        })
    },
};
const mutations = {
    setUser(state, user){
        state.user = user
    },
    setUserId(state, userId){
        state.userId = userId
    },
    LogOut(state){
        state.user = null
        state.userId = null
    },
};
export default {
    state,
    getters,
    actions,
    mutations
};
