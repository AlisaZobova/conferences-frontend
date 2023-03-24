import { mapActions } from 'vuex'
import { share } from '../../share.config'

export const buttonActionsMixin = {
    data() {
        return {
            processing: false,
        }
    },
    computed: {
        isAnnouncer() {
            return this.$store.getters.isAnnouncer
        },
        isAuthenticated() {
            return this.$store.getters.isAuthenticated
        },
    },
    methods: {
        ...mapActions([
            'DeleteConference',
            'JoinConference',
            'CancelParticipation',
        ]),
        editItem(item) {
            this.$router.push({
                name: 'EditConference',
                params: { id: item.id },
            })
        },
        joinConference(conferenceId) {
            if (this.isAnnouncer) {
                this.$router.push({
                    name: 'CreateReport',
                    params: { id: conferenceId },
                })
            } else {
                this.processing = true
                this.JoinConference(conferenceId)
                    .catch((error) => {
                        if (
                            error.response.data.errors &&
                            error.response.data.errors.plan
                        ) {
                            this.$router.push(
                                { name: 'Plans' },
                                () => (this.$root.planErrorSnackbar = true)
                            )
                        }
                    })
                    .finally(() => (this.processing = false))
            }
        },
        isConferenceCreator(conferenceId) {
            return this.$store.getters.isCreator(conferenceId)
        },
        isConferenceJoined(conferenceId) {
            return this.$store.getters.isJoined(conferenceId)
        },
        getPath() {
            return share.pathName
        },
        getShareText() {
            return share.text
        },
        isConfNew(item) {
            let nowDate = new Date()
            let year = nowDate.getFullYear()
            let month = nowDate.getMonth() + 1
            month = month > 9 ? month : '0' + month
            let day = nowDate.getDate()
            nowDate = year + '-' + month + '-' + day
            return item.conf_date.slice(0, 10) >= nowDate
        },
    },
}
