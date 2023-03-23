<template>
    <v-app>
        <v-main class="pt-2">
            <v-layout>
                <v-navigation-drawer v-model="openFilters" absolute temporary>
                    <ConferencesFilters
                        :disabled="loading || processing"
                        v-if="isAuthenticated"
                        @updateFilters="filters = $event"
                        @applyFilters="getFilteredData"
                    />
                </v-navigation-drawer>
                <v-slide-x-transition>
                    <v-container v-if="loading || processing" fluid>
                        <v-layout align-center class="table-heading-skeleton">
                            <v-skeleton-loader
                                type="text"
                                width="112"
                                class="d-inline-block"
                            />
                            <v-divider class="mx-4" inset vertical></v-divider>
                            <v-spacer />
                            <div v-if="isAuthenticated">
                                <span class="hidden-sm-and-down">
                                    <v-skeleton-loader
                                        type="button"
                                        width="117"
                                        class="full-btn d-inline-block mr-2"
                                    />
                                </span>
                                <span class="hidden-md-and-up">
                                    <v-skeleton-loader
                                        type="avatar"
                                        class="mr-4 d-inline-block"
                                    />
                                </span>
                                <span v-if="isAnnouncer">
                                    <span class="hidden-xs-only">
                                        <v-skeleton-loader
                                            type="button"
                                            width="172"
                                            class="full-btn d-inline-block"
                                        />
                                    </span>

                                    <span class="hidden-sm-and-up">
                                        <v-skeleton-loader
                                            type="avatar"
                                            class="d-inline-block"
                                        />
                                    </span>
                                </span>
                            </div>
                        </v-layout>

                        <div class="hidden-xs-only">
                            <v-skeleton-loader
                                class="table-thead-skeleton"
                                type="heading@3"
                            />
                            <v-skeleton-loader type="divider" />
                            <v-skeleton-loader
                                v-for="n in 15"
                                :key="n"
                                type="table-cell@2, button@2, divider"
                                class="table-skeleton"
                            />
                        </div>

                        <div class="hidden-sm-and-up" v-for="n in 5" :key="n">
                            <v-layout
                                justify-space-between
                                align-center
                                v-for="n in 2"
                                :key="n"
                            >
                                <v-skeleton-loader type="heading" width="20%" />
                                <v-skeleton-loader
                                    type="table-cell"
                                    width="45%"
                                />
                            </v-layout>
                            <v-layout justify-space-between align-center>
                                <v-skeleton-loader type="heading" width="20%">
                                </v-skeleton-loader>
                                <v-skeleton-loader
                                    type="button@2"
                                    class="d-inline-flex"
                                />
                            </v-layout>
                            <v-skeleton-loader type="divider" />
                        </div>
                    </v-container>
                    <v-container
                        v-if="!loading && !processing && totalConferences > 0"
                        fluid
                    >
                        <v-data-table
                            :headers="headers"
                            :items="conferences"
                            :page="page"
                            :server-items-length="totalConferences"
                            :items-per-page="perPage"
                            hide-default-footer
                            class="elevation-1"
                        >
                            <template v-slot:[`item.conf_date`]="{ item }">
                                {{ item.conf_date.slice(0, 10) }}
                            </template>

                            <template v-slot:top>
                                <v-toolbar flat>
                                    <v-toolbar-title
                                        >Conferences</v-toolbar-title
                                    >
                                    <v-divider class="mx-4" inset vertical />
                                    <v-spacer />
                                    <div class="text-end">
                                        <v-btn
                                            v-if="isAuthenticated"
                                            class="mr-2 mb-2 hidden-sm-and-down"
                                            text
                                            color="grey"
                                            @click="openFilters = !openFilters"
                                        >
                                            <v-icon color="primary">
                                                mdi-filter
                                            </v-icon>
                                            Filters
                                        </v-btn>
                                        <v-icon
                                            color="grey darken-2"
                                            v-if="isAuthenticated"
                                            class="mr-4 hidden-md-and-up"
                                            @click="openFilters = !openFilters"
                                        >
                                            mdi-filter
                                        </v-icon>
                                        <v-dialog
                                            v-if="
                                                isAuthenticated && isAnnouncer
                                            "
                                            max-width="500px"
                                        >
                                            <template
                                                v-slot:activator="{ on, attrs }"
                                            >
                                                <v-btn
                                                    color="primary"
                                                    dark
                                                    class="mb-2 hidden-xs-only"
                                                    v-bind="attrs"
                                                    v-on="on"
                                                    @click="createItem"
                                                >
                                                    New Conference
                                                </v-btn>
                                                <v-icon
                                                    color="success"
                                                    class="hidden-sm-and-up"
                                                    v-bind="attrs"
                                                    v-on="on"
                                                    @click="createItem"
                                                >
                                                    mdi-plus-thick
                                                </v-icon>
                                            </template>
                                        </v-dialog>
                                        <v-dialog
                                            v-model="dialogDelete"
                                            max-width="500px"
                                        >
                                            <v-card>
                                                <v-card-title class="text-h5"
                                                    >Are you sure you want to
                                                    delete this
                                                    item?</v-card-title
                                                >
                                                <v-card-actions>
                                                    <v-spacer />
                                                    <v-btn
                                                        color="blue darken-1"
                                                        text
                                                        @click="
                                                            dialogDelete = false
                                                        "
                                                        >Cancel</v-btn
                                                    >
                                                    <v-btn
                                                        color="blue darken-1"
                                                        text
                                                        @click="
                                                            deleteItemConfirm
                                                        "
                                                        >OK</v-btn
                                                    >
                                                    <v-spacer />
                                                </v-card-actions>
                                            </v-card>
                                        </v-dialog>
                                    </div>
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
                                        isConferenceCreator(item.id) &&
                                        isAnnouncer
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
                                        isConferenceCreator(item.id) &&
                                        isAnnouncer
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
                                        isConferenceJoined(item.id)
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
                                        class="mr-1 mb-1 mt-1 white--text hidden-xs-only"
                                        @click="cancelParticipation(item)"
                                    >
                                        Cancel participation
                                    </v-btn>
                                    <v-btn
                                        depressed
                                        color="red lighten-2"
                                        class="mr-1 mb-1 mt-1 white--text hidden-sm-and-up"
                                        @click="cancelParticipation(item)"
                                    >
                                        Leave
                                    </v-btn>
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
                                                @click="
                                                    cancelErrorSnackbar = false
                                                "
                                            >
                                                Close
                                            </v-btn>
                                        </template>
                                    </v-snackbar>
                                </div>
                            </template>
                            <template v-slot:no-data>
                                <v-btn color="primary" @click="getConferences">
                                    Reset
                                </v-btn>
                            </template>
                        </v-data-table>
                    </v-container>
                </v-slide-x-transition>
                <v-layout
                    v-if="!loading && !processing && totalConferences === 0"
                    class="align-center justify-center"
                >
                    <div class="d-inline-block teal--text text-h6 pl-4">
                        Unfortunately, there are no records matching your
                        request.
                    </div>
                </v-layout>
            </v-layout>
            <div
                class="text-center pt-2"
                v-if="!loading && !processing && totalConferences > 0"
            >
                <v-pagination v-model="page" :length="pageCount" />
            </div>
        </v-main>
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
            apiErrors: {},
            cancelErrorSnackbar: false,
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
        page() {
            this.loading = true
            this.getConferences()
        },
        dialogDelete(newVal) {
            if (!newVal) {
                this.selectedItem = null
            }
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
        deleteItemConfirm() {
            this.loading = true
            this.DeleteConference(this.selectedItem.id).then(() => {
                this.$router.go(0)
            })
        },
        cancelParticipation(item) {
            this.cancelErrorSnackbar = false
            this.loading = true
            if (this.isAnnouncer) {
                const report = item.reports.filter(
                    (report) => report.conference_id === item.id
                )[0]
                this.CancelParticipation(item.id)
                    .then(() => {
                        this.DeleteReport(report.id).catch((error) => {
                            if (error.response.data.errors) {
                                this.apiErrors = error.response.data.errors
                            }
                            if (error.response.data.errors.zoom) {
                                this.cancelErrorSnackbar = true
                            }
                        })
                    })
                    .finally(() => {
                        this.loading = false
                    })
            } else {
                this.CancelParticipation(item.id).finally(() => {
                    this.loading = false
                })
            }
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
@media (max-width: 600px) {
    :deep(.v-skeleton-loader__heading) {
        width: 100%;
        display: block;
        margin-top: 8px;
        margin-bottom: 4px;
    }

    :deep(.v-skeleton-loader__table-cell) {
        width: 100%;
        display: flex;
        margin-top: 4px;
        height: 20px;
    }

    :deep(.v-skeleton-loader__button) {
        margin-left: 4px;
        margin-bottom: 4px;
    }
}

@media (min-width: 600px) {
    :deep(.table-skeleton .v-skeleton-loader__button) {
        width: 96px;
        display: inline-block;
        margin-right: 4px;
        margin-top: 6px;
        height: 30px;
    }

    :deep(.v-skeleton-loader__heading) {
        width: 10%;
        display: inline-block;
        margin-right: 15.3%;
    }

    :deep(.v-skeleton-loader__table-cell) {
        width: 12%;
        display: inline-block;
        margin-right: 13.3%;
        margin-top: 10px;
        height: 20px;
    }
}

:deep(.full-btn .v-skeleton-loader__button) {
    width: 100%;
}

:deep(.v-skeleton-loader__avatar) {
    height: 36px;
    width: 36px;
}

.table-heading-skeleton {
    height: 64px;
}

.table-thead-skeleton {
    padding-top: 10px;
    height: 48px;
}
</style>
