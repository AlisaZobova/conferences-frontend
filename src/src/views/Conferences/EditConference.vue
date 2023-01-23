<template>
  <v-app>
    <v-main>
      <div v-if="loading">
        Loading...
      </div>
      <div v-else>
        <template v-if="isAuthenticated && (isAdmin || (isConferenceCreator(conference.id) && isAnnouncer))">
          <validation-observer
              ref="observer"
              v-slot="{ invalid }"
          >
            <form @submit.prevent="submit">
              <validation-provider
                  v-slot="{ errors }"
                  name="Title"
                  :rules="{
                required: true,
                min:2,
                max:255,
                regex:'^[A-Z][a-z]*(\\s(([A-Z][a-z]*)|([a-z]+))|(\\s[0-9]+)*)*$'
              }"
              >
                <v-text-field
                    v-model="conference.title"
                    :error-messages="errors"
                    label="Title"
                    required
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
                  ></v-text-field>
                  </validation-provider>
                </template>
                <validation-provider
                    v-slot="{ errors }"
                    name="Date"
                    rules="required|min_date_value"
                >
                  <v-date-picker
                      v-model="conference.conf_date"
                      :min='nowDate'
                      :error-messages="errors"
                      no-title
                      @input="menu1 = false"
                  ></v-date-picker>
                </validation-provider>
              </v-menu>
              <validation-provider
                  v-slot="{ errors }"
                  name="Latitude"
                  rules="numeric|between:-90,90"
              >
                <v-text-field
                    v-model="conference.latitude"
                    :error-messages="errors"
                    label="Latitude"
                    @input="setLat"
                ></v-text-field>
              </validation-provider>
              <validation-provider
                  v-slot="{ errors }"
                  name="Longitude"
                  rules="numeric|between:-90,90"
              >
                <v-text-field
                    v-model="conference.longitude"
                    :error-messages="errors"
                    label="Longitude"
                    @input="setLng"
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
                    v-if="conference.latitude && conference.longitude"
                    :position="{lat:conference.latitude, lng:conference.longitude}"
                    :clickable="true"
                    :draggable="true"
                    @drag="setLatLng($event.latLng)"
                />
              </GmapMap>
              <validation-provider
                  name="Country"
                  v-slot="{}"
              >
              <v-select
                  v-model="conference.country_id"
                  :items="countries"
                  item-text="name"
                  item-value="id"
                  label="Country"
              ></v-select>
              </validation-provider>

              <v-btn
                  class="mr-4"
                  type="submit"
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
          </validation-observer>
        </template>
        <template v-else>
          <ForbiddenError></ForbiddenError>
        </template>
      </div>
    </v-main>
  </v-app>
</template>

<script>
import {required, max, regex, min, between, min_value, numeric} from 'vee-validate/dist/rules'
import { extend, ValidationObserver, ValidationProvider, setInteractionMode } from 'vee-validate'
import {mapActions, mapGetters} from "vuex";
import ForbiddenError from "@/views/ForbiddenError";

setInteractionMode('eager')

extend('numeric', {
  ...numeric,
  message: '{_field_} needs to be a number',
  validate: value => { return typeof value === 'number'}
})

extend('between', {
  ...between,
  message: '{_field_} needs to be between {min} and {max}',
})

extend('min_date_value', {
  ...min_value,
  message: 'Date must be greater than today',
  validate: value => { return value > new Date().toISOString().slice(0,10)}
})

extend('required', {
  ...required,
  message: '{_field_} can not be empty',
})

extend('max', {
  ...max,
  message: '{_field_} may not be greater than {length} characters',
})

extend('min', {
  ...min,
  message: '{_field_} must be greater than {length} characters',
})

extend('regex', {
  ...regex,
  message: '{_field_} {_value_} is not valid',
})

export default {
  name: "CreateConference",
  components: {
    ForbiddenError,
    ValidationProvider,
    ValidationObserver,
  },
  computed: {
    countries () {
      return this.$store.state.countries.countries
    },
    conference () {
      return this.$store.state.conferences.conference
    },
    isAdmin () {
      return this.$store.getters.isAdmin
    },
    isAnnouncer () {
      return this.$store.getters.isAnnouncer
    },
    isAuthenticated () {
      return this.$store.getters.isAuthenticated
    },
  },
  data: () => ({
    menu1: false,
    nowDate: new Date().toISOString().slice(0,10),
    loading: true,
  }),

  methods: {
    ...mapActions(["UpdateConference", "GetCountries", "GetConference"]),
    ...mapGetters(['isCreator']),
    async submit () {
      this.$refs.observer.validate()
      await this.UpdateConference({form: this.conference, conferenceId: this.conference.id})
      await this.$router.push("/conferences").catch(() => {});
    },
    setLatLng (location) {
      this.conference.latitude = parseFloat(location.lat().toFixed(3));
      this.conference.longitude = parseFloat(location.lng().toFixed(3));
    },
    setLat (lat) {
      if (lat) {
        this.conference.latitude = parseFloat(lat);
      }
    },
    setLng (lng) {
      if (lng) {
        this.conference.longitude = parseFloat(lng);
      }
    },
    isConferenceCreator (conferenceId) {
      return this.$store.getters.isCreator(conferenceId)
    },
    goBack () {
      this.$router.go(-1)
    },
    getCenter () {
      if (this.conference.latitude && this.conference.longitude) {
        return {lat:parseFloat(this.conference.latitude), lng:parseFloat(this.conference.longitude)}
      } else {
        return {lat:50, lng:30}
      }
    }
  },
  created () {
    this.GetCountries()
    if (this.isAuthenticated) {
    this.GetConference(this.$route.params.id).then(() => {
      this.loading = false;
    });
    }
    else {
      this.loading = false
    }
  },
}

</script>

<style scoped>

</style>