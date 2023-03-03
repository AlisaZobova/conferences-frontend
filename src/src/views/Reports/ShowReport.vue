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
                <v-badge
                    overlap
                    :color="badge['color']"
                    :content="badge['content']"
                    class="ml-1"
                >
                </v-badge>
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

                <v-card-subtitle v-if="isListener && joinIn">
                    <b>Will start in:</b>
                    &nbsp;{{ joinIn }}
                </v-card-subtitle>

                <v-card-subtitle
                    v-if="isListener && started && isJoined && online"
                >
                    <b>Join link:</b>
                    &nbsp;<a
                        target="_blank"
                        :href="report.zoom_conference.join_url"
                        >{{ report.zoom_conference.join_url }}</a
                    >
                </v-card-subtitle>

                <v-card-subtitle v-if="isAnnouncer && startIn">
                    <b>Will start in:</b>
                    &nbsp;{{ startIn }}
                </v-card-subtitle>

                <v-card-subtitle
                    v-if="
                        isAnnouncer && isCreator && !ended && !startIn && online
                    "
                >
                    <a target="_blank" :href="report.zoom_conference.start_url">
                        Start zoom conference
                    </a>
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
        isListener() {
            return this.$store.getters.isListener
        },
        isAnnouncer() {
            return this.$store.getters.isAnnouncer
        },
        isJoined() {
            return this.$store.getters.isJoined(this.report.conference_id)
        },
        online() {
            return (
                this.report.zoom_conference.start_url &&
                this.report.zoom_conference.join_url
            )
        },
        startTime() {
            return new Date(Date.parse(this.report.start_time))
        },
        endTime() {
            return new Date(Date.parse(this.report.end_time))
        },
        joinIn() {
            let seconds = Math.floor((this.startTime - this.nowTime) / 1000)
            return this.getTimeDiff(seconds)
        },
        startIn() {
            let seconds = Math.floor(
                (this.startTime - this.nowTime - 600000) / 1000
            )
            return this.getTimeDiff(seconds)
        },
        started() {
            return (
                this.startTime.getTime() <= this.nowTime &&
                this.nowTime < this.endTime.getTime()
            )
        },
        ended() {
            return this.nowTime >= this.endTime.getTime()
        },
        badge() {
            return this.started
                ? { color: 'success', content: 'Started' }
                : this.ended
                ? { color: 'error', content: 'Ended' }
                : { color: 'primary', content: 'Waiting' }
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
        nowTime: Date.now(),
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
        updateNowTime() {
            this.nowTime = Date.now()
        },
        getTimeDiff(seconds) {
            if (seconds <= 0) {
                return ''
            }

            let minutes = Math.floor(seconds / 60)
            let hours = Math.floor(minutes / 60)
            let days = Math.floor(hours / 24)

            hours = hours - days * 24
            minutes = minutes - days * 24 * 60 - hours * 60
            seconds =
                seconds - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60

            return (
                days +
                ' days  ' +
                hours +
                ' hours ' +
                minutes +
                ' minutes ' +
                seconds +
                ' seconds'
            )
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
            setInterval(this.updateNowTime, 1000)
            this.loading = false
        })
    },
}
</script>

<style scoped>
:deep(.v-breadcrumbs) {
    padding-left: 4px;
}

.v-card__actions {
    display: block;
}
</style>
