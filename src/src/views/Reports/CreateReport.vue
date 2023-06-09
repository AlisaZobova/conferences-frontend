<template>
    <v-main class="pt-4">
        <div v-if="loading" class="text-center">
            <v-progress-circular indeterminate color="primary" />
        </div>
        <div v-else>
            <template>
                <validation-observer ref="observer" v-slot="{ invalid }">
                    <v-layout align-center justify-center>
                        <form @submit.prevent="submit" class="create-form">
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
                                    v-model="form.topic"
                                    :error-messages="errors"
                                    label="Topic *"
                                />
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
                                        />
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
                                    />
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
                                        />
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
                                    />
                                </validation-provider>
                            </v-menu>
                            <v-text-field
                                type="text"
                                v-model="form.description"
                                label="Description"
                            />
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
                                />
                            </validation-provider>
                            <v-tree-select
                                v-if="confCategory.length > 0"
                                v-model="reportCategory"
                                :items="confCategory"
                                item-text="name"
                                label="Category"
                                selection-type="independent"
                                allow-select-parents
                                show-full-path
                            />
                            <v-checkbox
                                v-model="form.online"
                                class="mb-3"
                                label="Online"
                            />
                            <div
                                v-if="form.online"
                                :class="
                                    apiErrors.zoom
                                        ? 'mb-5 grey--text'
                                        : 'mb-10 grey--text'
                                "
                            >
                                *10 minutes before the start of the report,
                                there will be a zoom meeting start link on the
                                report page
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
                                class="mr-4"
                                type="submit"
                                color="primary"
                                :disabled="invalid"
                            >
                                Save
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
import { mapActions } from 'vuex'
import '@/assets/js/validationRules'
import { ValidationObserver, ValidationProvider } from 'vee-validate'

export default {
    name: 'CreateReport',
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
    },
    data: () => ({
        form: {
            topic: '',
            start_time: null,
            end_time: null,
            description: '',
            presentation: '',
            user_id: null,
            conference_id: null,
            category_id: null,
            online: false,
        },
        cancelErrorSnackbar: false,
        startTimeMenu: false,
        endTimeMenu: false,
        timeStart: '',
        timeEnd: '',
        loading: true,
        apiErrors: {},
        reportCategory: [],
        confCategory: [],
    }),

    methods: {
        ...mapActions([
            'CreateReport',
            'JoinConference',
            'GetConference',
            'GetCategory',
            'GetCategories',
            'DeleteReport',
        ]),
        async submit() {
            this.cancelErrorSnackbar = false
            this.$refs.observer.validate().then((result) => {
                if (result) {
                    let confDate = new Date(this.conference.conf_date)
                    let confYearMonthDay = `${confDate.getFullYear()}-${
                        confDate.getMonth() + 1
                    }-${confDate.getDate()}`
                    this.form.start_time =
                        confYearMonthDay + ' ' + this.timeStart + ':00'
                    this.form.end_time =
                        confYearMonthDay + ' ' + this.timeEnd + ':00'
                    this.form.user_id = this.user.id
                    this.form.conference_id = this.conference.id
                    if (this.reportCategory.length > 0) {
                        this.form.category_id = this.reportCategory[0].id
                    } else {
                        this.form.category_id = ''
                    }
                    const input = document.getElementById('presentation')
                    if (input.files[0]) {
                        this.form.presentation = input.files[0]
                    }
                    this.loading = true

                    this.CreateReport(this.form)
                        .then(() => {
                            this.JoinConference(this.$route.params.id)
                                .then(() =>
                                    this.$router.push({ name: 'Conferences' })
                                )
                                .finally(() => (this.loading = false))
                        })
                        .catch((error) => {
                            if (error.response.data.errors) {
                                this.apiErrors = error.response.data.errors

                                if (error.response.data.errors.zoom) {
                                    this.cancelErrorSnackbar = true
                                }
                            }
                            this.loading = false
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
        this.GetConference(this.$route.params.id)
            .then(() => this.GetCategories())
            .then(() => {
                if (this.conference.category) {
                    this.confCategory.push(
                        this.$store.state.categories.categories.filter(
                            (category) =>
                                category.id === this.conference.category_id
                        )[0]
                    )
                }
            })
            .finally(() => (this.loading = false))
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
</style>
