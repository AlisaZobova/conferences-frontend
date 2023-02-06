<template>
    <v-app>
        <v-main>
            <v-data-table
                :headers="headers"
                :items="conferences"
                :options.sync="options"
                :page="page"
                :server-items-length="totalConferences"
                :loading="loading"
                :items-per-page="perPage"
                hide-default-footer
                class="elevation-1"
            >
                <template v-slot:top>
                    <v-toolbar flat>
                        <v-toolbar-title>Conferences</v-toolbar-title>
                        <v-divider class="mx-4" inset vertical></v-divider>
                        <v-spacer></v-spacer>
                        <v-dialog
                            v-if="isAuthenticated && (isAdmin || isAnnouncer)"
                            max-width="500px"
                        >
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    color="primary"
                                    dark
                                    class="mb-2"
                                    v-bind="attrs"
                                    v-on="on"
                                    @click="createItem"
                                >
                                    New Conference
                                </v-btn>
                            </template>
                        </v-dialog>
                        <v-dialog v-model="dialogDelete" max-width="500px">
                            <v-card>
                                <v-card-title class="text-h5"
                                    >Are you sure you want to delete this
                                    item?</v-card-title
                                >
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                        color="blue darken-1"
                                        text
                                        @click="closeDelete"
                                        >Cancel</v-btn
                                    >
                                    <v-btn
                                        color="blue darken-1"
                                        text
                                        @click="deleteItemConfirm"
                                        >OK</v-btn
                                    >
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-toolbar>
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn
                        depressed
                        color="light-green"
                        class="white--text mr-1 mb-1 mt-1"
                        @click="showItem(item)"
                    >
                        Details
                    </v-btn>
                    <v-btn
                        v-if="
                            isAuthenticated &&
                            (isAdmin ||
                                (isConferenceCreator(item.id) && isAnnouncer))
                        "
                        depressed
                        color="cyan darken-1"
                        class="white--text mr-1 mb-1 mt-1"
                        @click="editItem(item)"
                    >
                        Edit
                    </v-btn>
                    <v-btn
                        v-if="
                            isAuthenticated &&
                            (isAdmin ||
                                (isConferenceCreator(item.id) && isAnnouncer))
                        "
                        depressed
                        color="error"
                        class="mr-1 mb-1 mt-1"
                        @click="deleteItem(item)"
                    >
                        Delete
                    </v-btn>
                    <v-btn
                        v-if="
                            isAuthenticated &&
                            !isConferenceJoined(item.id) &&
                            !isAdmin &&
                            (!isAnnouncer || item.available)
                        "
                        depressed
                        class="mr-1 mb-1 mt-1"
                        color="warning"
                        @click="joinConference(item.id)"
                    >
                        Join
                    </v-btn>
                    <v-btn
                        v-if="!isAuthenticated"
                        depressed
                        class="mr-1 mb-1 mt-1"
                        color="warning"
                        :to="'/login'"
                    >
                        Join
                    </v-btn>
                    <div
                        class="d-inline red--text"
                        v-if="isAuthenticated && isAnnouncer && !item.available"
                    >
                        Registration is not possible
                    </div>
                    <div
                        class="d-inline"
                        v-if="
                            isAuthenticated &&
                            isConferenceJoined(item.id) &&
                            !isAdmin
                        "
                    >
                        <v-btn
                            depressed
                            class="mr-1 mb-1 mt-1"
                            outlined
                            color="cyan darken-1"
                            target="_blank"
                            :href="
                                'https://twitter.com/intent/tweet?text=' +
                                getShareText() +
                                '&url=' +
                                getPath()
                            "
                        >
                            TW
                        </v-btn>
                        <v-btn
                            depressed
                            outlined
                            color="cyan darken-1"
                            target="_blank"
                            :href="
                                'https://www.facebook.com/share.php?u=' +
                                getPath()
                            "
                            class="mb-1 mt-1 mr-1"
                        >
                            FB
                        </v-btn>
                        <v-btn
                            depressed
                            color="red lighten-2"
                            class="mr-1 mb-1 mt-1 white--text"
                            @click="cancelParticipation(item)"
                        >
                            Cancel participation
                        </v-btn>
                    </div>
                </template>
                <template v-slot:no-data>
                    <v-btn color="primary" @click="getConferences">
                        Reset
                    </v-btn>
                </template>
            </v-data-table>
            <div class="text-center pt-2">
                <v-pagination v-model="page" :length="pageCount"></v-pagination>
            </div>
        </v-main>
    </v-app>
</template>

<script>
import { mapActions } from 'vuex'
import { buttonActionsMixin } from '@/mixins/buttonActionsMixin'

export default {
    name: 'ConferencesIndex',
    mixins: [buttonActionsMixin],
    computed: {
        conferences() {
            return this.$store.state.conferences.conferences.data
        },
        totalConferences() {
            return this.$store.state.conferences.conferences.total
        },
        perPage() {
            return this.$store.state.conferences.conferences.per_page
        },
        pageCount() {
            return this.$store.state.conferences.conferences.last_page
        },
    },
    data() {
        return {
            selectedItem: null,
            dialogDelete: false,
            loading: true,
            page: 1,
            options: {},
            headers: [
                {
                    text: 'Title',
                    align: 'start',
                    sortable: false,
                    value: 'title',
                },
                { text: 'Date', value: 'conf_date', sortable: false },
                {
                    text: 'Actions',
                    value: 'actions',
                    sortable: false,
                    width: '50%',
                },
            ],
        }
    },
    watch: {
        options: {
            handler() {
                this.getConferences()
            },
            deep: true,
        },
        dialogDelete(val) {
            val || this.closeDelete()
        },
    },
    methods: {
        ...mapActions(['GetConferences', 'DeleteConference', 'DeleteReport']),
        getConferences() {
            this.loading = true
            this.GetConferences(this.page).then(() => {
                this.loading = false
            })
        },
        createItem() {
            this.$router.push({ name: 'CreateConference' })
        },
        showItem(item) {
            this.$router.push({
                name: 'ShowConference',
                params: { id: item.id },
            })
        },
        deleteItem(item) {
            this.selectedItem = item
            this.dialogDelete = true
        },
        async deleteItemConfirm() {
            this.DeleteConference(this.selectedItem.id)
                .then(() => this.closeDelete())
                .then(() => this.$router.go(0))
        },
        closeDelete() {
            this.selectedItem = null
            this.dialogDelete = false
        },
        cancelParticipation(item) {
            if (this.isAnnouncer) {
                const report = item.reports.filter(
                    (report) => report.conference_id === item.id
                )[0]
                this.DeleteReport(report.id)
            }
            this.CancelParticipation(item.id)
        },
    },
    created() {
        this.getConferences()
    },
}
</script>

<style scoped></style>
