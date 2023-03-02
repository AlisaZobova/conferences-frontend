export const exportMixin = {
    computed: {
        isAdmin() {
            return this.$store.getters.isAdmin
        },
    },
    data() {
        return {
            exportProcess: false,
        }
    },
}
