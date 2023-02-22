<template>
    <v-app>
        <v-layout>
            <ConferencesFilters
                :disabled="loading"
                v-if="isAuthenticated && openFilters"
                @updateFilters="filters = $event"
                @applyFilters="getFilteredData"
            />
            <v-container
                v-if="loading"
                :class="
                    isAuthenticated && openFilters
                        ? 'with-filters d-inline-block'
                        : ''
                "
                :fluid="!isAuthenticated || !openFilters"
            >
                <v-layout align-center class="table-heading-skeleton">
                    <v-skeleton-loader
                        type="text"
                        width="112"
                        class="d-inline-block"
                    ></v-skeleton-loader>
                    <v-divider class="mx-4" inset vertical></v-divider>
                    <v-spacer></v-spacer>
                    <v-skeleton-loader
                        v-if="isAuthenticated"
                        type="button"
                        width="117"
                        class="full-btn d-inline-block mr-2"
                    ></v-skeleton-loader>
                    <v-skeleton-loader
                        v-if="isAuthenticated"
                        type="button"
                        width="172"
                        class="full-btn d-inline-block"
                    ></v-skeleton-loader>
                </v-layout>
                <v-skeleton-loader
                    class="table-thead-skeleton"
                    type="heading@3"
                ></v-skeleton-loader>
                <v-skeleton-loader type="divider"></v-skeleton-loader>
                <v-skeleton-loader
                    v-for="n in 15"
                    :key="n"
                    type="table-cell@2, button@2, divider"
                    class="table-skeleton"
                ></v-skeleton-loader>
            </v-container>
            <v-container
                v-if="!loading && totalConferences > 0"
                :class="isAuthenticated && openFilters ? 'with-filters' : ''"
                :fluid="!isAuthenticated || !openFilters"
            >
                <v-data-table
                    :headers="headers"
                    :items="conferences"
                    :page="page"
                    :server-items-length="totalConferences"
                    :items-per-page="perPage"
                    hide-default-footer
                    :class="
                        isAuthenticated && openFilters
                            ? 'd-inline-block elevation-1'
                            : 'elevation-1'
                    "
                >
                    <template v-slot:top>
                        <v-toolbar flat>
                            <v-toolbar-title>Conferences</v-toolbar-title>
                            <v-divider class="mx-4" inset vertical></v-divider>
                            <v-spacer></v-spacer>
                            <v-layout class="justify-end">
                                <v-btn
                                    v-if="isAuthenticated"
                                    class="mr-2"
                                    text
                                    color="grey"
                                    @click="openFilters = !openFilters"
                                >
                                    <v-icon color="primary">
                                        mdi-filter
                                    </v-icon>
                                    Filters
                                </v-btn>
                                <v-dialog
                                    v-if="
                                        isAuthenticated &&
                                        (isAdmin || isAnnouncer)
                                    "
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
                                <v-dialog
                                    v-model="dialogDelete"
                                    max-width="500px"
                                >
                                    <v-card>
                                        <v-card-title class="text-h5"
                                            >Are you sure you want to delete
                                            this item?</v-card-title
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
                            </v-layout>
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
                                    (isConferenceCreator(item.id) &&
                                        isAnnouncer))
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
                                    (isConferenceCreator(item.id) &&
                                        isAnnouncer))
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
                            v-if="
                                isAuthenticated &&
                                isAnnouncer &&
                                !item.available
                            "
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
                    <v-pagination
                        v-model="page"
                        :length="pageCount"
                    ></v-pagination>
                </div>
            </v-container>
            <v-layout
                v-if="!loading && totalConferences === 0"
                class="align-center justify-center"
            >
                <div class="d-inline-block teal--text text-h6 pl-4">
                    Unfortunately, there are no records matching your request.
                </div>
            </v-layout>
        </v-layout>
    </v-app>
</template>

<script>
import { mapActions } from 'vuex'
import { buttonActionsMixin } from '@/mixins/buttonActionsMixin'
import ConferencesFilters from '@/views/Conferences/ConferencesFilters'

export default {
    name: 'ConferencesIndex',
    mixins: [buttonActionsMixin],
    components: { ConferencesFilters },
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
        page: {
            get() {
                return this.$store.getters['currentConferencesPage']
            },
            set(newValue) {
                return this.$store.dispatch('SetConferencesPage', newValue)
            },
        },
    },
    data() {
        return {
            selectedItem: null,
            dialogDelete: false,
            loading: true,
            filters: '',
            openFilters: false,
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
        dialogDelete(val) {
            val || this.closeDelete()
        },
        page() {
            this.loading = true
            this.getConferences()
        },
    },
    methods: {
        ...mapActions(['GetConferences', 'DeleteConference', 'DeleteReport']),
        getConferences() {
            this.GetConferences({
                page: this.page,
                filters: this.filters,
            }).then(() => {
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
        getFilteredData() {
            this.loading = true
            this.page = 1
            this.GetConferences({
                page: this.page,
                filters: this.filters,
            }).then(() => {
                this.loading = false
            })
        },
    },
    created() {
        this.getConferences()
    },
}
</script>

<style scoped>
.container.with-filters {
    max-width: 75%;
}

:deep(.full-btn .v-skeleton-loader__button) {
    width: 100%;
}

:deep(.table-skeleton .v-skeleton-loader__button) {
    width: 96px;
    display: inline-block;
    margin-right: 4px;
    margin-top: 6px;
    height: 30px;
}

:deep(.v-skeleton-loader__heading) {
    width: 6%;
    display: inline-block;
    margin-right: 19.3%;
}
:deep(.v-skeleton-loader__table-cell) {
    width: 12%;
    display: inline-block;
    margin-right: 13.3%;
    margin-top: 10px;
    height: 20px;
}

.table-heading-skeleton {
    height: 64px;
}
.table-thead-skeleton {
    padding-top: 10px;
    height: 48px;
}
</style>
