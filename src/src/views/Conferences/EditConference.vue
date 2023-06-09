<template>
    <v-app>
        <v-main class="pt-4">
            <div v-if="loading" class="text-center">
                <v-progress-circular indeterminate color="primary" />
            </div>
            <div v-else>
                <template>
                    <validation-observer ref="observer">
                        <v-layout align-center justify-center>
                            <form @submit.prevent="submit" class="edit-form">
                                <validation-provider
                                    v-slot="{ errors }"
                                    name="Title"
                                    :rules="{
                                        required: true,
                                        min: 2,
                                        max: 255,
                                        regex: '^[A-Z].*$',
                                    }"
                                >
                                    <v-text-field
                                        v-model="conference.title"
                                        :error-messages="errors"
                                        :hint="titleInfoMsg"
                                        label="Title"
                                        required
                                    />
                                </validation-provider>
                                <v-menu
                                    ref="confDateMenu"
                                    v-model="confDateMenu"
                                    :close-on-content-click="false"
                                    transition="scale-transition"
                                    offset-y
                                    max-width="290px"
                                    min-width="auto"
                                >
                                    <template v-slot:activator="{ on, attrs }">
                                        <validation-provider
                                            v-slot="{ errors }"
                                            name="Date"
                                            rules="required|min_date_value"
                                        >
                                            <v-text-field
                                                v-model="conference.conf_date"
                                                label="Date"
                                                :error-messages="errors"
                                                persistent-hint
                                                prepend-icon="mdi-calendar"
                                                v-bind="attrs"
                                                v-on="on"
                                            />
                                        </validation-provider>
                                    </template>
                                    <validation-provider
                                        v-slot="{ errors }"
                                        name="Date"
                                        rules="required|min_date_value"
                                    >
                                        <v-date-picker
                                            v-model="conference.conf_date"
                                            :min="nowDate"
                                            :error-messages="errors"
                                            no-title
                                            @input="confDateMenu = false"
                                        />
                                    </validation-provider>
                                </v-menu>
                                <validation-provider
                                    v-slot="{ errors }"
                                    name="Latitude"
                                    rules="numeric|between:-90,90"
                                >
                                    <v-text-field
                                        ref="lat"
                                        v-model="conference.latitude"
                                        :error-messages="errors"
                                        label="Latitude"
                                    />
                                </validation-provider>
                                <validation-provider
                                    v-slot="{ errors }"
                                    name="Longitude"
                                    rules="numeric|between:-180,180"
                                >
                                    <v-text-field
                                        ref="lng"
                                        v-model="conference.longitude"
                                        :error-messages="errors"
                                        label="Longitude"
                                    />
                                </validation-provider>
                                <GmapMap
                                    :center="getCenter()"
                                    :zoom="10"
                                    map-type-id="terrain"
                                    style="width: 100%; height: 400px"
                                    @click="setLatLng($event.latLng)"
                                >
                                    <GmapMarker
                                        v-if="
                                            Number(conference.latitude) &&
                                            Number(conference.longitude)
                                        "
                                        :position="{
                                            lat: parseFloat(
                                                conference.latitude
                                            ),
                                            lng: parseFloat(
                                                conference.longitude
                                            ),
                                        }"
                                        :clickable="true"
                                        :draggable="true"
                                        @drag="setLatLng($event.latLng)"
                                    />
                                </GmapMap>
                                <v-select
                                    v-model="conference.country_id"
                                    :items="countries"
                                    item-text="name"
                                    item-value="id"
                                    label="Country"
                                ></v-select>
                                <div v-if="!conference.reports.length > 0">
                                    <v-text-field
                                        v-if="currentCategory"
                                        readonly
                                        label="Category"
                                        v-model="currentCategory.name"
                                    />
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
                                        :items="rootCategories"
                                        @update:active="getActiveValue"
                                        class="mb-4"
                                    />
                                </div>
                                <v-btn
                                    class="mr-4"
                                    type="submit"
                                    color="primary"
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
    </v-app>
</template>

<script>
import '@/assets/js/validationRules'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { mapActions, mapGetters } from 'vuex'

export default {
    name: 'EditConference',
    components: {
        ValidationProvider,
        ValidationObserver,
    },
    computed: {
        countries() {
            return this.$store.state.countries.countries
        },
        conference() {
            let conference = this.$store.state.conferences.conference
            conference['conf_date'] = conference['conf_date'].slice(0, 10)
            return conference
        },
        isAuthenticated() {
            return this.$store.getters.isAuthenticated
        },
        categories() {
            return this.$store.state.categories.categories
        },
        rootCategories() {
            return this.categories.filter((category) => !category.parents)
        },
    },
    data: () => ({
        confDateMenu: false,
        nowDate: new Date().toISOString().slice(0, 10),
        loading: true,
        titleInfoMsg: 'Title must start with a capital letter',
        selected: [],
        currentCategory: null,
    }),

    methods: {
        ...mapActions([
            'UpdateConference',
            'GetCountries',
            'GetConference',
            'GetCategories',
            'GetCategory',
        ]),
        ...mapGetters(['isCreator']),
        async submit() {
            this.$refs.observer.validate().then((result) => {
                if (result) {
                    if (this.selected.length > 0) {
                        this.conference.category_id = this.selected[0]
                    } else {
                        this.conference.category_id = null
                    }
                    this.UpdateConference({
                        form: this.conference,
                        conferenceId: this.conference.id,
                    })
                    this.$router.push({ name: 'Conferences' })
                }
            })
        },
        setLatLng(location) {
            this.conference.latitude = parseFloat(location.lat().toFixed(3))
            this.conference.longitude = parseFloat(location.lng().toFixed(3))
        },
        goBack() {
            this.$router.go(-1)
        },
        getCenter() {
            let lat = this.conference.latitude
            let lng = this.conference.longitude
            if (
                lat &&
                lng &&
                Number(lat) &&
                Number(lng) &&
                lat <= 90 &&
                lat >= -90 &&
                lng <= 180 &&
                lng >= -180
            ) {
                return { lat: parseFloat(lat), lng: parseFloat(lng) }
            } else {
                return { lat: 50, lng: 30 }
            }
        },
        getActiveValue(value) {
            this.selected = value
            this.currentCategory = this.categories.filter(
                (category) => category.id === value[0]
            )[0]
        },
    },
    created() {
        this.GetCountries()
            .then(() => {
                this.GetCategories()
            })
            .then(() => {
                if (this.isAuthenticated) {
                    this.GetConference(this.$route.params.id).then(() => {
                        if (this.conference.category) {
                            this.selected.push(this.conference.category.id)
                            this.currentCategory = this.conference.category
                            this.loading = false
                        } else {
                            this.loading = false
                        }
                    })
                } else {
                    this.loading = false
                }
            })
    },
}
</script>

<style scoped>
:deep(.v-treeview) {
    width: 100%;
    height: 100%;
    border: 1px rgb(133, 133, 133) solid;
}
</style>
