<template>
    <div class="mt-4">
        <v-layout>
            <v-navigation-drawer v-model="openFilters" absolute temporary>
                <ReportsFilters
                    class="mb-5"
                    :disabled="loading"
                    @updateFilters="filters = $event"
                    @applyFilters="getFilteredData"
                />
            </v-navigation-drawer>
            <v-slide-x-transition>
                <v-container v-if="loading" fluid>
                    <v-skeleton-loader
                        v-if="isAuthenticated"
                        type="button"
                        class="mb-2"
                    ></v-skeleton-loader>
                    <v-row dense>
                        <v-col
                            v-for="i in 12"
                            :key="i"
                            style="flex-direction: column"
                            cols="12"
                            sm="6"
                            md="3"
                        >
                            <v-skeleton-loader
                                class="mx-auto"
                                type="image"
                            ></v-skeleton-loader>
                        </v-col>
                    </v-row>
                </v-container>
                <v-container v-if="!loading && responseLength > 0" fluid>
                    <v-btn
                        v-if="isAuthenticated"
                        class="filter-btn mb-2"
                        text
                        color="grey"
                        @click="openFilters = !openFilters"
                    >
                        <v-icon color="teal"> mdi-filter </v-icon>
                        Filters
                    </v-btn>
                    <v-row dense>
                        <v-col
                            v-for="item in this.reports"
                            :key="item.id"
                            class="d-flex"
                            style="flex-direction: column"
                            cols="12"
                            sm="6"
                            md="3"
                        >
                            <v-card
                                class="flex-grow-1"
                                :to="{
                                    name: 'ShowReport',
                                    params: { id: item.id },
                                }"
                            >
                                <v-card-title
                                    class="teal--text d-inline-flex"
                                    @click.prevent="getReport(item.id)"
                                >
                                    {{ item.topic }}
                                </v-card-title>

                                <v-btn
                                    icon
                                    @click.prevent="
                                        isInFav(item.id)
                                            ? deleteFromFavorites(item.id)
                                            : addToFavorites(item.id)
                                    "
                                >
                                    <v-icon :color="getHeartColor(item.id)">
                                        mdi-heart
                                    </v-icon>
                                </v-btn>

                                <v-card-subtitle class="mt-2 pb-0">
                                    <b>Date:</b>
                                    {{ item.start_time.slice(0, 10)
                                    }}<br /><br />
                                    <b>From:</b>
                                    {{ item.start_time.slice(10, 16) }}<br />
                                    <b>To:</b> {{ item.end_time.slice(10, 16)
                                    }}<br /><br />
                                </v-card-subtitle>

                                <v-card-subtitle
                                    class="pt-0"
                                    v-if="item.description"
                                >
                                    <b>Description:</b>
                                    {{
                                        item.description.length >= 100
                                            ? item.description.slice(0, 100) +
                                              '...'
                                            : item.description
                                    }}
                                </v-card-subtitle>

                                <v-card-subtitle>
                                    <b>{{ item.comments.length }}</b> comment(s)
                                </v-card-subtitle>

                                <v-card-actions
                                    v-if="
                                        item.description &&
                                        item.description.length >= 100
                                    "
                                >
                                    <v-btn
                                        text
                                        color="yellow darken-1"
                                        @click.prevent="showMore(item.id)"
                                    >
                                        More
                                    </v-btn>
                                </v-card-actions>

                                <v-expand-transition>
                                    <v-card
                                        v-if="show.includes(item.id)"
                                        class="overflow-y-auto v-card--reveal"
                                        height="100%"
                                    >
                                        <v-card-subtitle class="mt-2">
                                            <b>Description:</b>
                                            {{ item.description }}
                                        </v-card-subtitle>

                                        <v-card-actions>
                                            <v-btn
                                                text
                                                color="yellow darken-1"
                                                @click.prevent="
                                                    hideMore(item.id)
                                                "
                                            >
                                                Close
                                            </v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-expand-transition>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-container>
            </v-slide-x-transition>
            <v-layout
                v-if="!loading && responseLength === 0"
                class="align-center justify-center"
            >
                <div class="d-inline-block teal--text text-h6 pl-4">
                    Unfortunately, there are no records matching your request.
                </div>
            </v-layout>
        </v-layout>
        <div class="text-center pt-2" v-if="!loading && responseLength > 0">
            <v-pagination
                v-model="page"
                :length="pageCount"
                color="teal"
            ></v-pagination>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex'
import ReportsFilters from '@/views/Reports/ReportsFilters'

export default {
    name: 'ReportsIndex',
    components: { ReportsFilters },
    computed: {
        reports() {
            return this.$store.state.reports.reports.data
        },
        pageCount() {
            return this.$store.state.reports.reports.last_page
        },
        responseLength() {
            return this.$store.state.reports.reports.total
        },
        isAuthenticated() {
            return this.$store.getters.isAuthenticated
        },
        page: {
            get() {
                return this.$store.getters['currentReportsPage']
            },
            set(newValue) {
                return this.$store.dispatch('SetReportsPage', newValue)
            },
        },
    },
    data: () => ({
        show: [],
        loading: true,
        filters: '',
        openFilters: false,
    }),
    methods: {
        ...mapActions(['GetReports', 'AddFavorite', 'DeleteFavorite']),
        getReport(reportId) {
            this.$router
                .push({ name: 'ShowReport', params: { id: reportId } })
                .catch(() => {})
        },
        showMore(reportId) {
            if (!this.show.includes(reportId)) {
                this.show.push(reportId)
            }
        },
        hideMore(reportId) {
            if (this.show.includes(reportId)) {
                const index = this.show.indexOf(reportId)
                this.show.splice(index)
            }
        },
        addToFavorites(reportId) {
            this.AddFavorite(reportId)
        },
        deleteFromFavorites(reportId) {
            this.DeleteFavorite(reportId)
        },
        isInFav(reportId) {
            return (
                this.$store.state.auth.user.favorites.findIndex(
                    (element) => element.id === reportId
                ) !== -1
            )
        },
        getHeartColor(reportId) {
            if (this.isInFav(reportId)) {
                return 'red'
            } else {
                return 'grey'
            }
        },
        getFilteredData() {
            this.loading = true
            this.page = 1
            this.GetReports({ page: this.page, filters: this.filters }).then(
                () => {
                    this.loading = false
                }
            )
        },
    },
    watch: {
        page(newValue) {
            this.loading = true
            this.GetReports({ page: newValue, filters: this.filters }).then(
                () => {
                    this.loading = false
                }
            )
        },
    },
    created() {
        this.GetReports({ page: this.page, filters: this.filters }).then(() => {
            this.loading = false
        })
    },
}
</script>

<style scoped>
.v-card--reveal {
    bottom: 0;
    opacity: 1 !important;
    position: absolute;
    width: 100%;
}

.filter-btn {
    width: auto;
}

:deep(.v-skeleton-loader__button) {
    width: 115px;
}

:deep(.v-skeleton-loader__image) {
    height: 252px;
}
</style>
