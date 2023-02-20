import axios from 'axios'
import { saveAs } from 'file-saver'

const state = {
    searchedReports: [],
    reports: [],
    report: null,
}

const actions = {
    async GetReports({ commit }, {page, filters}) {
        let response = await axios.get('reports?page=' + page + filters)
        commit('setReports', response.data)
        commit('setReport', null)
    },
    async SearchReports({ commit }, query) {
        let response = await axios.get('reports/search' + query)
        commit('setSearchReports', response.data)
        commit('setReport', null)
    },
    async GetReport({ commit }, reportId) {
        let response = await axios.get('reports/' + reportId)
        commit('setReport', response.data)
    },
    async DeleteReport({ commit }, reportId) {
        await axios.delete('reports/' + reportId)
        commit('setReport', null)
    },
    async UpdateReport({ commit }, { form, reportId }) {
        let response = await axios.post('reports/' + reportId, form, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        })
        commit('setReport', response.data)
    },
    async CreateReport({ commit }, form) {
        let response = await axios.post('reports', form, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        commit('setReport', response.data)
    },
    async DownloadFile({ state }, reportId) {
        axios
            .get('/reports/' + reportId + '/download', {
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
}

export default {
    state,
    actions,
    mutations,
}
