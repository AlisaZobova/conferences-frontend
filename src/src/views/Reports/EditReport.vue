<template>
  <v-main>
    <div v-if="loading" class="text-center">
      <v-progress-circular
          indeterminate
          color="primary"
      ></v-progress-circular>
    </div>
    <div v-else>
      <template>
        <validation-observer
            ref="observer"
            v-slot="{ invalid }"
        >
          <v-layout align-center justify-center>
            <form @submit.prevent="submit">
              <validation-provider
                  v-slot="{ errors }"
                  name="Topic"
                  :rules="{
                required: true,
                min:2,
                max:255
              }"
              >
                <v-text-field
                    v-model="report.topic"
                    :error-messages="errors"
                    label="Topic *"
                ></v-text-field>
              </validation-provider>
              <v-menu
                  ref="menu1"
                  v-model="menu1"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <validation-provider
                      name="Start time"
                      rules="required"
                  >
                    <v-text-field
                        v-model="timeStart"
                        label="Start time *"
                        :error-messages="apiErrors.start_time"
                        persistent-hint
                        prepend-icon="mdi-timer"
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                  </validation-provider>
                </template>
                <validation-provider
                    v-slot="{ errors }"
                    name="Start time"
                    rules="required"
                >
                  <v-time-picker
                      v-model="timeStart"
                      min='08:00'
                      max='19:59'
                      :error-messages="errors"
                      format="24hr"
                      scrollable
                      @input="menu1 = false"
                  ></v-time-picker>
                </validation-provider>
              </v-menu>
              <v-menu
                  ref="menu2"
                  v-model="menu2"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <validation-provider
                      name="End time"
                      rules="required"
                  >
                    <v-text-field
                        v-model="timeEnd"
                        label="End time *"
                        :disabled="!timeStart"
                        :error-messages="apiErrors.end_time"
                        persistent-hint
                        prepend-icon="mdi-timer"
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                  </validation-provider>
                </template>
                <validation-provider
                    v-slot="{ errors }"
                    name="End time"
                    rules="required"
                >
                  <v-time-picker
                      v-model="timeEnd"
                      :min="getTime(1)"
                      :max="getTime(60)"
                      :error-messages="errors"
                      format="24hr"
                      scrollable
                      @input="menu2 = false"
                  ></v-time-picker>
                </validation-provider>
              </v-menu>
              <v-text-field
                  type="text"
                  v-model="report.description"
                  label="Description"
              ></v-text-field>
              <validation-provider
                  v-slot="{ errors, validate }"
                  name="Presentation"
                  rules="ext:ppt,pptx|size:10"
              >
                <v-file-input
                    show-size
                    :accept="['.ppt', '.pptx']"
                    :error-messages="errors"
                    label="Presentation"
                    id="presentation"
                    @change="validate"
                ></v-file-input>
              </validation-provider>
              <div v-if="report.presentation" class="mb-6">
                <a class='text-decoration-underline' @click="downloadFile()" download>{{ report.presentation }}</a>
              </div>

              <v-btn
                  class="mr-1"
                  type="submit"
                  color="primary"
                  :disabled="invalid"
              >
                Save
              </v-btn>
              <v-btn
                  class="mr-1"
                  color="error"
                  @click.prevent="deleteReport(report.id)"
              >
                Cancel participation
              </v-btn>
              <v-btn
                  class="mr-1 white--text"
                  depressed
                  color="grey"
                  @click="goBack"
              >
                Back
              </v-btn>
            </form>
          </v-layout>
        </validation-observer>
      </template>
    </div>
  </v-main>
</template>

<script>
import {mapActions} from "vuex";
import '@/js/validationRules'
import {ValidationObserver, ValidationProvider} from 'vee-validate'

export default {
  name: "EditReport",
  components: {
    ValidationProvider,
    ValidationObserver,
  },
  computed: {
    conference() {
      return this.$store.state.conferences.conference
    },
    user() {
      return this.$store.state.auth.user
    },
    report() {
      return this.$store.state.reports.report
    }
  },
  data: () => ({
    menu1: false,
    menu2: false,
    timeStart: '',
    timeEnd: '',
    loading: true,
    presentation: null,
    apiErrors: {}
  }),

  methods: {
    ...mapActions(["UpdateReport", "GetConference", "GetReport", "DownloadFile"]),
    async submit() {
      this.$refs.observer.validate().then((result) => {
        if (result) {
          this.report.start_time = this.conference.conf_date + ' ' + this.timeStart + ':00'
          this.report.end_time = this.conference.conf_date + ' ' + this.timeEnd + ':00'
          const input = document.getElementById('presentation')
          if (input.files[0]) {
            this.report.presentation = input.files[0]
          }
          this.UpdateReport({form: this.report, reportId: this.report.id}).then(() =>
              this.$router.push('/reports')).catch((error) =>
              this.apiErrors = error.response.data.errors
          );
        }
      })
    },
    goBack() {
      this.$router.go(-1)
    },
    getTime(addMin) {
      let clockTime = this.timeStart.split(':')
      let newMinutes = parseInt(clockTime[1]) + addMin
      let minutes = newMinutes === 60 ? 0 : newMinutes > 60 ? newMinutes - 60 : newMinutes
      let hours = newMinutes >= 60 ? parseInt(clockTime[0]) + 1 : parseInt(clockTime[0])
      return hours.toString() + ':' + minutes.toString()
    },
    downloadFile() {
      this.DownloadFile(this.report.id)
    },
    deleteReport(reportId) {
      this.DeleteReport(reportId).catch(() => {
      })
      this.CancelParticipation(this.report.conference.id).catch(() => {
      })
      this.$router.push('/conferences').catch(() => {
      })
    },
  },
  created() {
    this.GetReport(this.$route.params.id).then(() => {
      this.timeStart = this.report.start_time.slice(11, 16)
      this.timeEnd = this.report.end_time.slice(11, 16)
      this.GetConference(this.report.conference_id)
    }).then(() => this.loading = false)
  }
}
</script>

<style scoped>
:deep(.v-picker__title) {
  height: 60px;
}

:deep(.v-picker__title__btn, .v-time-picker-title__time) {
  height: 28px;
  font-size: 28px;
}

:deep(.v-time-picker-title__time span) {
  height: 28px;
  font-size: 28px;
}

form {
  width: 75%;
}

</style>