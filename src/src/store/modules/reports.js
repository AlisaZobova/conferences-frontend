import axios from 'axios'
import { saveAs } from 'file-saver'

const state = {
    searchedReports: [],
    reports: [],
    meetings: [],
    report: null,
    page: 1,
}

const getters = {
    currentReportsPage: (state) => {
        return state.page
    },
}

const actions = {
    async GetReports({ commit }, { page, filters }) {
        let response = await axios.get('reports?page=' + page + filters)
        commit('setReports', response.data)
        commit('setReport', null)
    },
    async SearchReports({ commit }, query) {
        let response = await axios.get('reports/search' + query)
        commit('setSearchReports', response.data)
    },
    async GetReport({ commit }, reportId) {
        let response = await axios.get('reports/' + reportId)
        commit('setReport', response.data)
    },
    async DeleteReport({ commit }, reportId) {
        return new Promise((resolve, reject) => {
            axios.delete('reports/' + reportId).then(
                (response) => {
                    commit('setReport', null)
                    resolve(response)
                },
                (error) => reject(error)
            )
        })
    },
    async UpdateReport({ commit }, { form, reportId }) {
        return new Promise((resolve, reject) =>
            axios
                .post('reports/' + reportId, form, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                })
                .then(
                    (response) => {
                        commit('setReport', response.data)
                        resolve(response)
                    },
                    (error) => reject(error)
                )
        )
    },
    async CreateReport({ commit }, form) {
        return axios
            .post('reports', form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then((response) => {
                commit('setReport', response.data)
                return response
            })
            .catch((error) => {
                return Promise.reject(error)
            })
    },
    async DownloadFile({ state }, reportId) {
        axios
            .get('reports/' + reportId + '/download', {
                responseType: 'blob',
            })
            .then((response) => {
                saveAs(
                    new Blob([response.data], { type: response.data.type }),
                    state.report.presentation,
                    { autoBOM: false }
                )
            })
    },
    SetReportsPage({ commit }, newValue) {
        commit('setReportsPage', newValue)
    },
}
const mutations = {
    setReports(state, reports) {
        state.reports = reports
    },
    setSearchReports(state, reports) {
        state.searchedReports = reports
    },
    setReport(state, report) {
        state.report = report
    },
    setReportsPage(state, page) {
        state.page = page
    },
    setMeetings(state, meetings) {
        state.meetings = meetings
    },
}

export default {
    state,
    getters,
    actions,
    mutations,
}
