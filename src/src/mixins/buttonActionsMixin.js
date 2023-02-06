import {mapActions} from "vuex";
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
        editItem (item) {
            this.$router.push({name: 'EditConference', params: {id: item.id}});
        },
        joinConference (conferenceId) {
            if (this.isAnnouncer) {
                this.$router.push({name: 'CreateReport', params: {id: conferenceId}});
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
