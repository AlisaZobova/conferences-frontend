<template>
    <v-app>
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
                                    name="Title"
                                    :rules="{
                                        required: true,
                                        min: 2,
                                        max: 255,
                                        regex: '^[A-Z].*$',
                                    }"
                                >
                                    <v-text-field
                                        v-model="form.title"
                                        :error-messages="errors"
                                        :hint="titleInfoMsg"
                                        label="Title"
                                        required
                                    ></v-text-field>
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
                                                v-model="form.conf_date"
                                                label="Date"
                                                :error-messages="errors"
                                                persistent-hint
                                                prepend-icon="mdi-calendar"
                                                v-bind="attrs"
                                                v-on="on"
                                            ></v-text-field>
                                        </validation-provider>
                                    </template>
                                    <validation-provider
                                        v-slot="{ errors }"
                                        name="Date"
                                        rules="required|min_date_value"
                                    >
                                        <v-date-picker
                                            v-model="form.conf_date"
                                            :min="nowDate"
                                            :error-messages="errors"
                                            no-title
                                            @input="confDateMenu = false"
                                        ></v-date-picker>
                                    </validation-provider>
                                </v-menu>
                                <validation-provider
                                    v-slot="{ errors }"
                                    name="Latitude"
                                    rules="numeric|between:-90,90"
                                >
                                    <v-text-field
                                        ref="lat"
                                        v-model="form.latitude"
                                        :error-messages="errors"
                                        label="Latitude"
                                    ></v-text-field>
                                </validation-provider>
                                <validation-provider
                                    v-slot="{ errors }"
                                    name="Longitude"
                                    rules="numeric|between:-180,180"
                                >
                                    <v-text-field
                                        ref="lng"
                                        v-model="form.longitude"
                                        :error-messages="errors"
                                        label="Longitude"
                                    ></v-text-field>
                                </validation-provider>
                                <GmapMap
                                    :center="getCenter()"
                                    :zoom="10"
                                    map-type-id="terrain"
                                    style="width: 100%; height: 500px"
                                    @click="setLatLng($event.latLng)"
                                >
                                    <GmapMarker
                                        v-if="
                                            Number(form.latitude) &&
                                            Number(form.longitude)
                                        "
                                        :position="{
                                            lat: parseFloat(form.latitude),
                                            lng: parseFloat(form.longitude),
                                        }"
                                        :clickable="true"
                                        :draggable="true"
                                        @drag="setLatLng($event.latLng)"
                                    />
                                </GmapMap>
                                <v-select
                                    v-model="form.country"
                                    :items="countries"
                                    item-text="name"
                                    label="Country"
                                ></v-select>

                                <v-tree-select
                                    v-model="category"
                                    :items="categories"
                                    item-text="name"
                                    item-value="id"
                                    label="Category"
                                    selection-type="independent"
                                    allow-select-parents
                                    show-full-path
                                >
                                </v-tree-select>

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
    </v-app>
</template>

<script>
import '@/js/validationRules'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { mapActions } from 'vuex'

export default {
    name: 'CreateConference',
    components: {
        ValidationProvider,
        ValidationObserver,
    },
    computed: {
        countries() {
            return this.$store.state.countries.countries
        },
        categories() {
            return this.$store.state.categories.categories.filter(
                (category) => !category.parents
            )
        },
    },
    data: () => ({
        form: {
            title: '',
            conf_date: null,
            latitude: null,
            longitude: null,
            country: '',
            category_id: null,
        },
        confDateMenu: false,
        titleInfoMsg: 'Title must start with a capital letter',
        nowDate: new Date().toISOString().slice(0, 10),
        loading: true,
        category: [],
    }),

    methods: {
        ...mapActions(['GetCountries', 'GetCategories']),
        async submit() {
            this.$refs.observer.validate().then((result) => {
                if (result) {
                    if (this.category.length > 0) {
                        this.form.category_id = this.category[0].id
                    }
                    this.$store
                        .dispatch('CreateConference', this.form)
                        .then(() => this.$router.push({ name: 'Conferences' }))
                }
            })
        },
        setLatLng(location) {
            this.form.latitude = parseFloat(location.lat().toFixed(3))
            this.form.longitude = parseFloat(location.lng().toFixed(3))
        },
        getCenter() {
            let lat = this.form.latitude
            let lng = this.form.longitude
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
        goBack() {
            this.$router.go(-1)
        },
    },
    created() {
        this.GetCountries()
            .then(() => {
                this.GetCategories()
            })
            .then(() => (this.loading = false))
    },
}
</script>

<style scoped>
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
</style>
