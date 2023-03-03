<template>
    <v-data-table
        :headers="headers"
        :items="meetings"
        :items-per-page="15"
        :loading="loading"
        class="elevation-1"
        @click:row="goToReportPage"
    ></v-data-table>
</template>

<script>
import { mapActions } from 'vuex'

export default {
    name: 'ReportsMeetings',
    computed: {
        meetings() {
            return this.$store.state.reports.meetings
        },
    },
    data() {
        return {
            headers: [
                {
                    text: 'Report topic',
                    align: 'start',
                    sortable: false,
                    value: 'topic',
                },
                {
                    text: 'uuid',
                    sortable: false,
                    value: 'uuid',
                },
                {
                    text: 'id',
                    sortable: false,
                    value: 'id',
                },
                {
                    text: 'host_id',
                    sortable: false,
                    value: 'host_id',
                },
                {
                    text: 'topic',
                    sortable: false,
                    value: 'topic',
                },
                {
                    text: 'type',
                    sortable: false,
                    value: 'type',
                },
                {
                    text: 'start_time',
                    sortable: false,
                    value: 'start_time',
                },
                {
                    text: 'timezone',
                    sortable: false,
                    value: 'timezone',
                },
                {
                    text: 'created_at',
                    sortable: false,
                    value: 'created_at',
                },
                {
                    text: 'join_url',
                    sortable: false,
                    value: 'join_url',
                },
            ],
            loading: true,
        }
    },
    methods: {
        ...mapActions(['GetMeetings']),
        goToReportPage(item) {
            this.$router.push({
                name: 'ShowReport',
                params: { id: item.report_id },
            })
        },
    },
    created() {
        this.GetMeetings().then(() => (this.loading = false))
    },
}
</script>

<style scoped></style>
