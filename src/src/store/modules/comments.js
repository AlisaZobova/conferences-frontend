import axios from 'axios';

const state = {
    comments: [],
    comment: null,
};

const actions = {
    async GetComments({commit}, reportId) {
        let response = await axios.get('reports/' + reportId + '/comments')
        await commit("setComments", response.data)
        await commit("setComment", null)
    },
    async UpdateComment({commit}, {form, commentId}) {
        let response = await axios.patch('comments/' + commentId, form)
        await commit("setComment", response.data)
    },
    async CreateComment({commit}, form) {
        let response = await axios.post('comments', form, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        await commit("setComment", response.data)
    },
};
const mutations = {
    setComments(state, comments) {
        state.comments = comments
    },
    setComment(state, comment) {
        state.comment = comment
    },
};

export default {
    state,
    actions,
    mutations
};
