<template>
    <div class="mt-2">
        <div v-if="loading" class="text-center">
            <v-progress-circular
                indeterminate
                color="primary"
            ></v-progress-circular>
        </div>
        <div v-else>
            <v-breadcrumbs :items="items"></v-breadcrumbs>
            <v-card class="flex-grow-1">
                <v-card-title class="teal--text">
                    {{ report.topic }}
                </v-card-title>

                <v-card-subtitle class="mt-2">
                    <b>Date:</b> {{ report.start_time.slice(0, 10)
                    }}<br /><br />
                    <b>From:</b> {{ report.start_time.slice(10, 16) }}<br />
                    <b>To:</b> {{ report.end_time.slice(10, 16) }}
                </v-card-subtitle>

                <v-card-subtitle class="pt-0 pb-o" v-if="report.description">
                    <br />
                    <b>Description:</b> {{ report.description }}<br />
                </v-card-subtitle>

                <v-card-subtitle v-if="report.presentation">
                    <b>Presentation:</b>
                    &nbsp;
                    <a
                        class="text-decoration-underline"
                        @click="downloadFile()"
                        download
                        >{{ report.presentation }}</a
                    >
                </v-card-subtitle>

                <v-card-actions v-if="isCreator">
                    <v-btn
                        text
                        color="primary"
                        @click.prevent="editReport(report.id)"
                    >
                        Edit
                    </v-btn>
                    <v-btn
                        text
                        color="red"
                        @click.prevent="deleteReport(report.id)"
                    >
                        Cancel participation
                    </v-btn>
                    <v-btn
                        icon
                        @click="
                            color === 'grey'
                                ? addToFavorites()
                                : deleteFromFavorites()
                        "
                    >
                        <v-icon :color="color"> mdi-heart </v-icon>
                    </v-btn>
                </v-card-actions>
                <v-card-actions v-if="isAdmin">
                    <v-btn
                        text
                        color="red"
                        @click.prevent="adminDeleteReport(report.id)"
                    >
                        Delete
                    </v-btn>
                    <v-btn
                        v-if="isAdmin"
                        text
                        color="primary"
                        @click.prevent="exportComments"
                        :disabled="exportProcess"
                    >
                        Export comments
                    </v-btn>
                </v-card-actions>
            </v-card>
            <v-progress-linear
                v-if="exportProcess"
                class="mt-3"
                indeterminate
                color="teal"
            ></v-progress-linear>
            <ReportComments />
        </div>
        <a class="d-none" href="" download ref="download">Download</a>
    </div>
</template>

<script>
import { mapActions } from 'vuex'
import ReportComments from '@/views/Comments/ReportComments'
import { exportMixin } from '@/mixins/exportMixin'

export default {
    name: 'ShowReport',
    mixins: [exportMixin],
    computed: {
        report() {
            return this.$store.state.reports.report
        },
        isCreator() {
            return (
                this.$store.state.reports.report.user.id ===
                this.$store.state.auth.user.id
            )
        },
    },
    components: { ReportComments },
    data: () => ({
        show: [],
        loading: true,
        items: [
            {
                text: '',
            },
            {
                text: 'reports',
                disabled: false,
                // exact: true,
                // to: {name: 'Reports'},
            },
        ],
        color: '',
    }),
    methods: {
        ...mapActions([
            'GetReport',
            'DeleteReport',
            'CancelParticipation',
            'DownloadFile',
            'GetComments',
            'AddFavorite',
            'DeleteFavorite',
            'ExportReportComments',
        ]),
        editReport(reportId) {
            this.$router.push({ name: 'EditReport', params: { id: reportId } })
        },
        deleteReport(reportId) {
            this.DeleteReport(reportId)
            this.CancelParticipation(this.report.conference.id)
            this.$router.push({ name: 'Conferences' })
        },
        adminDeleteReport(reportId) {
            this.DeleteReport(reportId).catch(() => {})
            this.$router.push({ name: 'Reports' })
        },
        downloadFile() {
            this.DownloadFile(this.report.id)
        },
        addToFavorites() {
            this.AddFavorite(this.report.id).then(() => (this.color = 'red'))
        },
        deleteFromFavorites() {
            this.DeleteFavorite(this.report.id).then(
                () => (this.color = 'grey')
            )
        },
        setHeartColor(reportId) {
            function isInFav(element) {
                return element.id === reportId
            }
            if (
                this.$store.state.auth.user.favorites.findIndex(isInFav) !== -1
            ) {
                this.color = 'red'
            } else {
                this.color = 'grey'
            }
        },
        exportComments() {
            this.exportProcess = true
            window.Echo.channel('exportDownload').listen(
                'FinishedExport',
                (e) => {
                    this.$refs.download.href =
                        process.env.VUE_APP_AXIOS_BASE_URL.slice(0, -4) + e.path
                    window.Echo.leaveChannel('exportDownload')
                    this.$refs.download.click()
                    this.exportProcess = false
                }
            )
            this.ExportReportComments()
        },
    },
    created() {
        this.GetReport(this.$route.params.id).then(() => {
            if (this.report.category) {
                this.categoryPath = this.report.category.path
                for (let i in this.categoryPath) {
                    this.items.push({
                        text: this.categoryPath[i],
                        disabled: false,
                    })
                }
            }
            this.items.push({
                text: this.report.topic,
                disabled: false,
            })
            this.setHeartColor(this.report.id)
            this.loading = false
        })
    },
}
</script>

<style scoped>
:deep(.v-breadcrumbs) {
    padding-left: 4px;
}
</style>
