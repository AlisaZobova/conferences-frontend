<template>
<v-app>
  <v-main>
    <div v-if="loading">
      Loading...
    </div>
    <div v-else>
    <template>
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
                v-model="form.title"
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
                <v-text-field
                    v-model="form.conf_date"
                    label="Date"
                    persistent-hint
                    prepend-icon="mdi-calendar"
                    v-bind="attrs"
                    v-on="on"
                ></v-text-field>
              </template>
              <validation-provider
                  v-slot="{ errors }"
                  name="Date"
                  rules="required"
              >
              <v-date-picker
                  v-model="form.conf_date"
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
                v-model="form.latitude"
                :error-messages="errors"
                label="Latitude"
            ></v-text-field>
          </validation-provider>
          <validation-provider
              v-slot="{ errors }"
              name="Longitude"
              rules="numeric|between:-90,90"
          >
            <v-text-field
                v-model="form.longitude"
                :error-messages="errors"
                label="Longitude"
            ></v-text-field>
          </validation-provider>
          <v-select
              v-model="form.country"
              :items="countries"
              item-text="name"
              item-value="id"
              label="Country"
          ></v-select>

          <v-btn
              class="mr-4"
              type="submit"
              :disabled="invalid"
          >
            Save
          </v-btn>
        </form>
      </validation-observer>
    </template>
    </div>
  </v-main>
</v-app>
</template>

<script>
import {required, max, regex, min, between, numeric} from 'vee-validate/dist/rules'
import { extend, ValidationObserver, ValidationProvider, setInteractionMode } from 'vee-validate'
import {mapActions} from "vuex";

setInteractionMode('eager')

extend('numeric', {
  ...numeric,
  message: '{_field_} needs to be numeric',
})

extend('between', {
  ...between,
  message: '{_field_} needs to be between {min} and {max}',
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
    ValidationProvider,
    ValidationObserver,
  },
  computed: {
    countries () {
      return this.$store.state.countries.countries
    },
  },
  data: () => ({
    form: {
      title: "",
      conf_date: null,
      latitude: null,
      longitude: null,
      country: "",
    },
    menu1: false,
    nowDate: new Date().toISOString().slice(0,10),
    loading: true,
  }),

  methods: {
    ...mapActions(["CreateConference", "GetCountries"]),
    async submit () {
      this.$refs.observer.validate()
      await this.CreateConference(this.form).catch(() => {})
    },
  },
  created () {
    this.GetCountries().then(() => {
      this.loading = false;
    });
  },
}

</script>

<style scoped>

</style>