import axios from 'axios';

const state = {
    countries: []
};

const actions = {
    async GetCountries({commit}) {
        let response = await axios.get('countries')
        commit("setCountries", response.data)
    },
};
const mutations = {
    setCountries(state, countries){
        state.countries = countries
    },
};
export default {
    state,
    actions,
    mutations
};
