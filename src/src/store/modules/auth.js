import axios from 'axios';

const state = {
    user: null,
};

const getters = {
    isAuthenticated: state => !!state.user,
    StateUser: state => state.user,
};

const getToken = async () => {
  await axios.get('/sanctum/csrf-cookie');
}

const actions = {
    async Register({commit}, form) {
        await getToken()
        let response = await axios.post('register', form)
        await commit("setUser", response.data)
    },
    async RegisterAdditional({state}, form) {
        await getToken()
        await axios.post('register/' + encodeURIComponent(state.user), form)
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
