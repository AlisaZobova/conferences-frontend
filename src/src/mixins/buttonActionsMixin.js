import {mapActions, mapGetters} from "vuex";
import {share} from "../../share.config";

export const buttonActionsMixin = {
    computed: {
        isAdmin () {
            return this.$store.getters.isAdmin
        },
        isAnnouncer () {
            return this.$store.getters.isAnnouncer
        },
        isAuthenticated () {
            return this.$store.getters.isAuthenticated
        }
    },
    methods: {
        ...mapActions(["DeleteConference",
            "JoinConference", "CancelParticipation"]),
        ...mapGetters(['isCreator', 'isJoined']),
        editItem (item) {
            this.$router.push('/conferences/' + item.id + '/edit').catch(() => {});
        },
        joinConference (conferenceId) {
            if (this.isAnnouncer) {
                this.$router.push('/conferences/' + conferenceId + '/reports/create').catch(() => {});
            }
            else {
                this.JoinConference(conferenceId)
            }
        },
        isConferenceCreator (conferenceId) {
            return this.$store.getters.isCreator(conferenceId)
        },
        isConferenceJoined (conferenceId) {
            return this.$store.getters.isJoined(conferenceId)
        },
        getPath() {
            return share.pathName;
        },
        getShareText () {
            return share.text
        }
    },
}
