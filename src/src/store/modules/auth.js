import axios from 'axios';

const state = {
    user: null,
    userId: null
};

const getters = {
    isAuthenticated: state => !!state.user,
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
        await axios.post('login', User)
        await commit('setUser', User.get('email'))
    },
    async LogOut({commit}){
        await getToken()
        commit('LogOut')
        await axios.post('logout')
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
    },
};
export default {
    state,
    getters,
    actions,
    mutations
};
