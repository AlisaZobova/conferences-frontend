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
            this.JoinConference(conferenceId)
            this.$router.push('/conferences').catch(() => {});
        },
        cancelParticipation (conferenceId) {
            this.CancelParticipation(conferenceId)
            this.$router.push('/conferences').catch(() => {});
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
