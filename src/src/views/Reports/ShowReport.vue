<template>
        <div v-if="loading" class="text-center">
            <v-progress-circular
                indeterminate
                color="primary"
            ></v-progress-circular>
        </div>
        <div v-else>
          <v-breadcrumbs :items="items"></v-breadcrumbs>
            <v-card class="flex-grow-1">
                <v-card-title class="teal--text">
                    {{ report.topic }}
                </v-card-title>

                <v-card-subtitle class="mt-2">
                    <b>Date:</b> {{ report.start_time.slice(0, 10)
                    }}<br /><br />
                    <b>From:</b> {{ report.start_time.slice(10, 16) }}<br />
                    <b>To:</b> {{ report.end_time.slice(10, 16) }}
                </v-card-subtitle>

                <v-card-subtitle class="pt-0 pb-o" v-if="report.description">
                  <br />
                  <b>Description:</b> {{ report.description }}<br />
                </v-card-subtitle>

                <v-card-subtitle v-if="report.presentation">
                    <b>Presentation:</b>
                    &nbsp;
                    <a
                        class="text-decoration-underline"
                        @click="downloadFile()"
                        download
                        >{{ report.presentation }}</a
                    >
                </v-card-subtitle>

                <v-card-actions v-if="isCreator">
                    <v-btn
                        text
                        color="primary"
                        @click.prevent="editReport(report.id)"
                    >
                        Edit
                    </v-btn>
                    <v-btn
                        text
                        color="red"
                        @click.prevent="deleteReport(report.id)"
                    >
                        Cancel participation
                    </v-btn>
                </v-card-actions>
            </v-card>
            <ReportComments></ReportComments>
        </div>
</template>

<script>
import { mapActions } from 'vuex'
import ReportComments from '@/views/Comments/ReportComments'

export default {
    name: 'ShowReport',
    computed: {
        report() {
            return this.$store.state.reports.report
        },
        isCreator() {
            return (
                this.$store.state.reports.report.user.id ===
                this.$store.state.auth.user.id
            )
        },
    },
    components: { ReportComments },
    data: () => ({
        show: [],
        loading: true,
        items: [
          {
            text: '',
          },
          {
            text: 'reports',
            disabled: false,
            // exact: true,
            // to: {name: 'Reports'},
          },
        ],
    }),
    methods: {
        ...mapActions([
            'GetReport',
            'DeleteReport',
            'CancelParticipation',
            'DownloadFile',
            'GetComments',
        ]),
        editReport(reportId) {
            this.$router
                .push({ name: 'EditReport', params: { id: reportId } })
                .catch(() => {})
        },
        deleteReport(reportId) {
            this.DeleteReport(reportId).catch(() => {})
            this.CancelParticipation(this.report.conference.id).catch(() => {})
            this.$router.push({ name: 'Conferences' }).catch(() => {})
        },
        downloadFile() {
            this.DownloadFile(this.report.id)
        },
    },
    created() {
      this.GetReport(this.$route.params.id).then(
          () => {
            if (this.report.category) {
              this.categoryPath = this.report.category.path
              for (let i in this.categoryPath) {
                this.items.push(
                    {
                      text: this.categoryPath[i],
                      disabled: false,
                    },
                )
              }
            }
            this.items.push(
                {
                  text: this.report.topic,
                  disabled: false,
                },
            )
            this.loading = false
          }
      )
    },
}
</script>

<style scoped>
:deep(.v-breadcrumbs) {
  padding-left: 4px;
}
</style>
