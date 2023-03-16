<template>
    <v-main class="pt-4">
        <div v-if="loading" class="text-center">
            <v-progress-circular
                indeterminate
                color="primary"
            ></v-progress-circular>
        </div>
        <div v-else>
            <template>
                <validation-observer ref="observer" v-slot="{ invalid }">
                    <v-layout align-center justify-center>
                        <form @submit.prevent="submit">
                            <validation-provider
                                v-slot="{ errors }"
                                name="Topic"
                                :rules="{
                                    required: true,
                                    min: 2,
                                    max: 255,
                                }"
                            >
                                <v-text-field
                                    v-model="report.topic"
                                    :error-messages="errors"
                                    label="Topic *"
                                ></v-text-field>
                            </validation-provider>
                            <v-menu
                                ref="startTimeMenu"
                                v-model="startTimeMenu"
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
                                            :error-messages="
                                                apiErrors.start_time
                                            "
                                            @change="apiErrors.start_time = ''"
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
                                        ref="start"
                                        v-model="timeStart"
                                        min="08:00"
                                        max="19:59"
                                        :error-messages="errors"
                                        format="24hr"
                                        scrollable
                                        @click:minute="
                                            startTimeMenu = false
                                            setStartOnHours()
                                        "
                                    ></v-time-picker>
                                </validation-provider>
                            </v-menu>
                            <v-menu
                                ref="endTimeMenu"
                                v-model="endTimeMenu"
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
                                            @change="apiErrors.end_time = ''"
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
                                        ref="end"
                                        v-model="timeEnd"
                                        :min="getTime(1)"
                                        :max="getTime(60)"
                                        :error-messages="errors"
                                        format="24hr"
                                        scrollable
                                        @click:minute="
                                            endTimeMenu = false
                                            setEndOnHours()
                                        "
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
                                    @change="
                                        validate
                                        presentation = true
                                    "
                                ></v-file-input>
                            </validation-provider>
                            <div v-if="!presentation">
                                <a
                                    class="text-decoration-underline"
                                    @click="downloadFile()"
                                    download
                                    >{{ report.presentation }}</a
                                >
                            </div>
                            <div v-if="conference.category_id">
                                <v-text-field
                                    v-if="currentCategory"
                                    readonly
                                    label="Category"
                                    v-model="currentCategory.name"
                                ></v-text-field>
                                <p>
                                    Select category or
                                    <a
                                        @click="
                                            currentCategory = null
                                            selected = []
                                        "
                                        >clean active category</a
                                    >:
                                </p>
                                <v-treeview
                                    activatable
                                    hoverable
                                    :active="selected"
                                    :items="category"
                                    @update:active="getActiveValue"
                                    class="mb-4"
                                ></v-treeview>
                            </div>
                            <div v-if="!online">
                                <v-checkbox
                                    v-model="report.online"
                                    class="mb-3"
                                    label="Create zoom meeting"
                                ></v-checkbox>
                                <div
                                    v-if="report.online"
                                    :class="
                                        apiErrors.zoom
                                            ? 'mb-5 grey--text'
                                            : 'mb-10 grey--text'
                                    "
                                >
                                    *10 minutes before the start of the report,
                                    there will be a zoom meeting start link on
                                    the report page
                                </div>
                            </div>
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
                                        @click="cancelErrorSnackbar = false"
                                    >
                                        Close
                                    </v-btn>
                                </template>
                            </v-snackbar>
                            <v-btn
                                class="mr-1 mt-1"
                                type="submit"
                                color="primary"
                                :disabled="invalid"
                            >
                                Save
                            </v-btn>
                            <v-btn
                                class="mr-1 mt-1"
                                color="error"
                                @click.prevent="deleteReport(report.id)"
                            >
                                Cancel participation
                            </v-btn>
                            <v-btn
                                class="mr-1 mt-1 white--text"
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
import { mapActions } from 'vuex'
import '@/js/validationRules'
import { ValidationObserver, ValidationProvider } from 'vee-validate'

export default {
    name: 'EditReport',
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
        },
        categories() {
            return this.$store.state.categories.categories
        },
        category() {
            return this.categories.filter(
                (category) => category.id === this.conference.category_id
            )
        },
        online() {
            return this.report.meeting
        },
    },
    data: () => ({
        startTimeMenu: false,
        endTimeMenu: false,
        timeStart: '',
        timeEnd: '',
        presentation: false,
        loading: true,
        apiErrors: {},
        selected: [],
        currentCategory: null,
        cancelErrorSnackbar: '',
    }),

    methods: {
        ...mapActions([
            'UpdateReport',
            'GetConference',
            'GetReport',
            'DownloadFile',
            'DeleteReport',
            'CancelParticipation',
            'GetCategories',
        ]),
        async submit() {
            this.cancelErrorSnackbar = false
            this.$refs.observer.validate().then((result) => {
                if (result) {
                    let confDate = new Date(this.conference.conf_date)
                    let confYearMonthDay = `${confDate.getFullYear()}-${
                        confDate.getMonth() + 1
                    }-${confDate.getDate()}`
                    this.report.start_time =
                        confYearMonthDay + ' ' + this.timeStart + ':00'
                    this.report.end_time =
                        confYearMonthDay + ' ' + this.timeEnd + ':00'
                    const input = document.getElementById('presentation')
                    if (input.files[0]) {
                        this.report.presentation = input.files[0]
                    } else {
                        this.report.presentation = ''
                    }

                    if (this.selected.length > 0) {
                        this.report.category_id = this.selected[0]
                    } else {
                        this.report.category_id = ''
                    }

                    const fd = new FormData()
                    fd.append('id', this.report.id)
                    fd.append(
                        'online',
                        this.report.online ? this.report.online : 'false'
                    )
                    fd.append('presentation', this.report.presentation)
                    fd.append('topic', this.report.topic)
                    fd.append('start_time', this.report.start_time)
                    fd.append('end_time', this.report.end_time)
                    fd.append(
                        'description',
                        this.report.description ? this.report.description : ''
                    )
                    fd.append('user_id', this.report.user_id)
                    fd.append('conference_id', this.report.conference_id)
                    fd.append('category_id', this.report.category_id)
                    fd.append('_method', 'PATCH')

                    this.UpdateReport({
                        form: fd,
                        reportId: this.report.id,
                    })
                        .then(() => this.$router.push({ name: 'Reports' }))
                        .catch((error) => {
                            if (error.response.data.errors) {
                                this.apiErrors = error.response.data.errors
                            }
                            if (error.response.data.errors.zoom) {
                                this.cancelErrorSnackbar = true
                            }
                        })
                }
            })
        },
        goBack() {
            this.$router.go(-1)
        },
        getTime(addMin) {
            let clockTime = this.timeStart.split(':')
            let newMinutes = parseInt(clockTime[1]) + addMin
            let minutes =
                newMinutes === 60
                    ? 0
                    : newMinutes > 60
                    ? newMinutes - 60
                    : newMinutes
            let hours =
                newMinutes >= 60
                    ? parseInt(clockTime[0]) + 1
                    : parseInt(clockTime[0])
            return hours.toString() + ':' + minutes.toString()
        },
        downloadFile() {
            this.DownloadFile(this.report.id)
        },
        deleteReport(reportId) {
            this.loading = true
            let conferenceId = this.report.conference_id
            this.DeleteReport(reportId)
                .then(() => this.CancelParticipation(conferenceId))
                .then(() => this.$router.push({ name: 'Conferences' }))
        },
        getActiveValue(value) {
            this.selected = value
            this.currentCategory = this.categories.filter(
                (category) => category.id === value[0]
            )[0]
        },
        setStartOnHours() {
            this.$nextTick(() => {
                this.$refs.start.selectingHour = true
            })
        },
        setEndOnHours() {
            this.$nextTick(() => {
                this.$refs.end.selectingHour = true
            })
        },
    },
    created() {
        this.GetReport(this.$route.params.id).then(() => {
            this.timeStart = this.report.start_time.slice(11, 16)
            this.timeEnd = this.report.end_time.slice(11, 16)
            if (this.report.category) {
                this.selected.push(this.report.category.id)
                this.currentCategory = this.report.category
            }
        })
        this.GetConference(this.report.conference_id)
            .then(() => this.GetCategories())
            .then(() => (this.loading = false))
    },
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

@media (max-width: 600px) {
    form {
        width: 100%;
        padding-left: 16px;
        padding-right: 16px;
    }
}

@media (min-width: 600px) {
    form {
        width: 75%;
    }
}

:deep(.v-treeview) {
    width: 100%;
    height: 100%;
    border: 1px rgb(133, 133, 133) solid;
}
</style>
