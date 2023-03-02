<template>
    <div class="text-center">
        <v-menu
            offset-y
            :close-on-content-click="false"
            v-model="menu"
            min-width="300"
            transition="slide-y-transition"
        >
            <template v-slot:activator="{ on, attrs }">
                <v-text-field
                    :loading="loading"
                    :disabled="loading"
                    class="search-input hidden-sm-and-down"
                    v-model="query"
                    v-bind="attrs"
                    v-on="on"
                    @input="menu = true"
                    @change="searchWithTimeout"
                >
                    <template v-slot:prepend-inner>
                        <v-icon v-bind="attrs" v-on="on">mdi-magnify</v-icon>
                    </template>
                </v-text-field>
                <v-icon v-bind="attrs" v-on="on" class="hidden-md-and-up"
                    >mdi-magnify</v-icon
                >
            </template>
            <v-layout class="white">
                <v-text-field
                    :loading="loading"
                    :disabled="loading"
                    class="search-input hidden-md-and-up pl-4 pr-4"
                    v-model="query"
                    @input="menu = true"
                    @change="searchWithTimeout"
                >
                    <template v-slot:prepend-inner>
                        <v-icon>mdi-magnify</v-icon>
                    </template>
                </v-text-field>
            </v-layout>
            <v-layout class="white">
                <v-layout align-center justify-center v-if="loading">
                    <v-progress-circular
                        indeterminate
                        color="primary"
                    ></v-progress-circular>
                </v-layout>
                <v-layout
                    align-center
                    justify-center
                    v-if="
                        !loading &&
                        ((reports.length === 0 && conferences.length === 0) ||
                            (reports.length === 0 &&
                                searchType === 'reports') ||
                            (conferences.length === 0 &&
                                searchType === 'conferences'))
                    "
                >
                    <p>No records</p>
                </v-layout>
                <div
                    class="d-inline-block search-result"
                    v-if="
                        !loading &&
                        (((reports.length > 0 || conferences.length > 0) &&
                            !searchType) ||
                            (reports.length > 0 && searchType === 'reports') ||
                            (conferences.length > 0 &&
                                searchType === 'conferences'))
                    "
                >
                    <div
                        v-if="
                            !loading &&
                            (searchType === 'conferences' || !searchType) &&
                            conferences.length > 0
                        "
                    >
                        <v-list-item>
                            <v-list-item-title
                                class="primary--text font-weight-medium"
                                >Conferences</v-list-item-title
                            >
                        </v-list-item>
                        <v-divider></v-divider>
                    </div>
                    <v-list
                        :max-height="searchType === 'conferences' ? 400 : 200"
                        class="overflow-y-auto"
                        v-if="
                            !loading &&
                            (searchType === 'conferences' || !searchType)
                        "
                    >
                        <v-list-item
                            v-for="(item, index) in conferences"
                            :key="index"
                            :to="{
                                name: 'ShowConference',
                                params: { id: item.id },
                            }"
                            target="_blank"
                        >
                            <v-list-item-title>{{
                                item.title
                            }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                    <v-divider
                        v-if="
                            !loading &&
                            !searchType &&
                            conferences.length > 0 &&
                            reports.length > 0
                        "
                    ></v-divider>
                    <div
                        v-if="
                            !loading &&
                            (searchType === 'reports' || !searchType) &&
                            reports.length > 0
                        "
                    >
                        <v-list-item>
                            <v-list-item-title
                                class="primary--text font-weight-medium"
                                >Reports</v-list-item-title
                            >
                        </v-list-item>
                        <v-divider></v-divider>
                    </div>
                    <v-list
                        :max-height="searchType === 'reports' ? 400 : 200"
                        class="overflow-y-auto"
                        v-if="
                            !loading &&
                            (searchType === 'reports' || !searchType)
                        "
                    >
                        <v-list-item
                            v-for="(item, index) in reports"
                            :key="index"
                            :to="{
                                name: 'ShowReport',
                                params: { id: item.id },
                            }"
                            target="_blank"
                        >
                            <v-list-item-title>{{
                                item.topic
                            }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                    <v-divider
                        v-if="!loading && reports.length > 0"
                        class="mb-4"
                    ></v-divider>
                </div>

                <v-divider class="mx-2" inset vertical></v-divider>
                <v-radio-group
                    v-model="searchType"
                    label="Search by:"
                    class="radio-type-select d-inline-block"
                    @change="
                        (value) =>
                            !loading ? search() : (this.searchType = value)
                    "
                >
                    <v-radio label="Conferences" value="conferences"></v-radio>
                    <v-radio label="Reports" value="reports"></v-radio>
                    <v-radio label="All" value=""></v-radio>
                </v-radio-group>
            </v-layout>
        </v-menu>
    </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
    name: 'ReportsConferencesSearch',
    computed: {
        reports() {
            return this.$store.state.reports.searchedReports
        },
        conferences() {
            return this.$store.state.conferences.searchedConferences
        },
    },
    methods: {
        ...mapActions(['SearchConferences', 'SearchReports']),
        async search() {
            this.loading = true
            if (this.searchType === 'conferences') {
                this.SearchConferences(this.conferencesQuery).then(() => {
                    this.loading = false
                })
            } else if (this.searchType === 'reports') {
                this.SearchReports(this.reportsQuery).then(() => {
                    this.loading = false
                })
            } else {
                this.SearchConferences(this.conferencesQuery)
                    .then(() => this.SearchReports(this.reportsQuery))
                    .then(() => {
                        this.loading = false
                    })
            }
        },
        searchWithTimeout() {
            this.loading = true
            setTimeout(this.search, 2000)
        },
    },
    data: () => ({
        loading: true,
        query: '',
        conferencesQuery: '',
        reportsQuery: '',
        searchType: '',
        menu: false,
    }),
    watch: {
        query(newValue) {
            this.query = newValue
            this.conferencesQuery = `?title=${this.query}`
            this.reportsQuery = `?topic=${this.query}`
        },
    },
    created() {
        this.SearchConferences(this.conferencesQuery)
            .then(() => this.SearchReports(this.reportsQuery))
            .then(() => (this.loading = false))
    },
}
</script>

<style scoped>
.radio-type-select {
    width: 50%;
}

.search-input {
    min-width: auto;
}

:deep(.search-input .v-input__slot) {
    margin-bottom: 0;
}

:deep(.radio-type-select .v-label) {
    font-size: 14px;
}

.search-result {
    width: 50%;
}
</style>
