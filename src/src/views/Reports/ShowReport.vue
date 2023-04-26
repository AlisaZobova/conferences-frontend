<template>
    <main class="pt-2">
        <div v-if="loading" class="text-center mt-2">
            <v-progress-circular indeterminate color="primary" />
        </div>
        <div v-else>
            <v-breadcrumbs :items="items" />
            <v-card class="flex-grow-1">
                <v-badge
                    overlap
                    :color="badge['color']"
                    :content="badge['content']"
                    class="ml-1"
                />
                <v-card-title class="teal--text">
                    {{ report.topic }}
                </v-card-title>

                <v-card-subtitle class="mt-2">
                    <b>Date:</b> {{ report.start_time.slice(0, 10)
                    }}<br /><br />
                    <b>From:</b> {{ report.start_time.slice(11, 16) }}<br />
                    <b>To:</b> {{ report.end_time.slice(11, 16) }}
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

                <v-card-subtitle v-if="canJoin && joinIn && online">
                    <b>Will start in:</b>
                    &nbsp;{{ joinIn }}
                </v-card-subtitle>

                <v-card-subtitle
                    v-if="canJoin && !ended && !joinIn && isJoined && online"
                >
                    <a target="_blank" :href="report.meeting.join_url">
                        Join zoom meeting
                    </a>
                </v-card-subtitle>

                <v-card-subtitle
                    v-if="isAnnouncer && isCreator && startIn && online"
                >
                    <b>Will start in:</b>
                    &nbsp;{{ startIn }}
                </v-card-subtitle>

                <v-card-subtitle
                    v-if="
                        isAnnouncer && isCreator && !ended && !startIn && online
                    "
                >
                    <a target="_blank" :href="report.meeting.start_url">
                        Start zoom meeting
                    </a>
                </v-card-subtitle>
                <v-snackbar
                    v-model="cancelErrorSnackbar"
                    timeout="10000"
                    color="error"
                    :text="true"
                    right
                    bottom
                >
                    {{ apiErrors.zoom }}

                    <template v-slot:action="{ attrs }">
                        <v-btn
                            color="error"
                            text
                            v-bind="attrs"
                            @click="cancelErrorSnackbar = false"
                        >
                            Close
                        </v-btn>
                    </template>
                </v-snackbar>

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
            </v-card>
            <ReportComments />
        </div>
    </main>
</template>

<script>
import { mapActions } from 'vuex'
import ReportComments from '@/views/Comments/ReportComments'

export default {
    name: 'ShowReport',
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
            return this.report.meeting
        },
        startTime() {
            return new Date(this.report.start_time)
        },
        endTime() {
            return new Date(this.report.end_time)
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
        canJoin() {
            return this.isListener || (this.isAnnouncer && !this.isCreator)
        },
    },
    components: { ReportComments },
    data: () => ({
        show: [],
        loading: true,
        apiErrors: {},
        cancelErrorSnackbar: false,
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
        timerInterval: null,
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
        ]),
        editReport(reportId) {
            this.$router.push({ name: 'EditReport', params: { id: reportId } })
        },
        deleteReport(reportId) {
            this.cancelErrorSnackbar = false
            let conferenceId = this.report.conference_id
            this.loading = true

            this.DeleteReport(reportId)
                .then(() => {
                    this.CancelParticipation(conferenceId).then(() =>
                        this.$router.push({ name: 'Conferences' })
                    )
                })
                .catch((error) => {
                    if (error.response.data.errors) {
                        this.apiErrors = error.response.data.errors

                        if (error.response.data.errors.zoom) {
                            this.cancelErrorSnackbar = true
                        }
                    }
                    this.loading = false
                })
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

            days = days > 0 ? days + ' days' : ''
            hours = hours > 0 ? hours + ' hours' : ''
            minutes = minutes > 0 ? minutes + ' minutes' : ''
            seconds = seconds > 0 ? seconds + ' seconds' : ''

            return days + ' ' + hours + ' ' + minutes + ' ' + seconds
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
            this.timerInterval = setInterval(this.updateNowTime, 1000)
            this.loading = false
        })
    },
    beforeDestroy() {
        clearInterval(this.timerInterval)
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
