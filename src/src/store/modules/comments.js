import axios from 'axios'

const state = {
    comments: [],
}

const actions = {
    async GetComments({ commit }, reportId) {
        let response = await axios.get('reports/' + reportId + '/comments')
        commit('setComments', response.data)
    },
    async UpdateComment(context, { form, commentId }) {
        await axios.patch('comments/' + commentId, form)
    },
    async CreateComment(context, form) {
        await axios.post('comments', form, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    },
}
const mutations = {
    setComments(state, comments) {
        state.comments = comments
    },
}

export default {
    state,
    actions,
    mutations,
}
