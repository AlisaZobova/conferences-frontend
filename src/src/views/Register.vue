<template>
  <v-app>
    <v-main>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4>

            <v-stepper v-model="e1">
              <v-stepper-header>
                <v-stepper-step
                    :complete="e1 > 1"
                    step="1"
                >
                </v-stepper-step>

                <v-divider></v-divider>

                <v-stepper-step
                    :complete="e1 > 2"
                    step="2"
                >
                </v-stepper-step>
              </v-stepper-header>
                <v-stepper-items>
                  <v-stepper-content step="1">
                    <v-card>

                        <v-form @submit.prevent="submit" v-model="isFormValid">
                          <v-select
                              v-model="form.type"
                              :items="types"
                              label="Type"
                              class="mt-0"
                          ></v-select>

                          <v-text-field
                              v-model="form.email"
                              type="email"
                              name="email"
                              label="Email"
                              :rules="[rules.required]"
                          ></v-text-field>

                          <v-text-field
                              v-model="form.password"
                              :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                              :rules="[rules.required, rules.min]"
                              :type="show1 ? 'text' : 'password'"
                              hint="At least 8 characters"
                              counter
                              @click:append="show1 = !show1"
                              name="password"
                              id="password"
                              label="Password"
                              required
                          ></v-text-field>

                          <v-text-field
                              v-model="form.password_confirmation"
                              :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
                              :rules="[rules.required, rules.min, rules.match]"
                              :type="show2 ? 'text' : 'password'"
                              hint="At least 8 characters"
                              class="input-group--focused"
                              @click:append="show2 = !show2"
                              name="password_confirmation"
                              id="password_confirmation"
                              label="Confirm password"
                              required
                          ></v-text-field>

                          <p class="text-center" v-if="showError" id="error">Email already exists</p>

                    <v-btn
                        :disabled="!isFormValid"
                        color="primary"
                        @click="e1 = 2; getCountries()"
                        type="submit"
                    >
                      Continue
                    </v-btn>
                    <a class="ml-4">
                      <router-link to="/login">Already have an account? Login</router-link>
                    </a>
                        </v-form>
                    </v-card>
                  </v-stepper-content>

                  <v-stepper-content step="2">
                    <v-card>

                      <v-form @submit.prevent="submitAd">

                        <v-text-field
                            v-model="formAd.firstname"
                            name="firstname"
                            label="Firstname"
                            class="mt-0"
                        ></v-text-field>

                        <v-text-field
                            v-model="formAd.lastname"
                            name="lastname"
                            label="Lastname"
                        ></v-text-field>

                        <v-select
                            v-model="formAd.country"
                            :items="countries"
                            item-text="name"
                            item-value="id"
                            label="Country"
                        ></v-select>

                        <p class="text-center" v-if="showErrorCountry">Failed to get list of countries</p>

                        <v-text-field
                            v-model="formAd.birthdate"
                            type="date"
                            name="birthdate"
                            label="Birthdate"
                        ></v-text-field>

                        <v-text-field
                            v-model="formAd.phone"
                            id="phone"
                            type="tel"
                            name="phone"
                            label="Phone"
                        >
                        </v-text-field>

                    <v-btn
                        color="grey lighten-1"
                        @click="e1 = 1"
                        class="mr-4"
                    >
                      Back
                    </v-btn>
                    <v-btn
                        type="submit"
                        color="primary"
                    >
                      Register
                    </v-btn>

                      </v-form>
                    </v-card>

                  </v-stepper-content>

                </v-stepper-items>
            </v-stepper>

          </v-flex>
        </v-layout>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { mapActions } from "vuex";
import axios from "axios";

export default {
  name: "Register",
  components: {},
  data() {
    return {
      e1: 1,
      show1: false,
      show2: false,
      isFormValid: false,
      rules: {
        required: value => !!value || 'Required.',
        min: v => v.length >= 8 || 'Min 8 characters',
        match: () => (this.form.password === this.form.password_confirmation) ||
            'Password confirmation does not match'
      },
      types: ["Listener", "Announcer"],
      countries: [],
      defaultType: "Listener",
      form: {
        type: "Listener",
        email: "",
        password: "",
        password_confirmation: ""
      },
      formAd: {
        firstname: null,
        lastname: null,
        birthdate: null,
        phone: null,
        country: null
      },
      showError: false,
      showErrorCountry: false
    };
  },
  methods: {
    ...mapActions(["Register", "RegisterAdditional"]),
    async submit() {
      try {
        await this.Register(this.form);
      } catch (error) {
        this.showError = true
        this.e1 = 1
      }
    },
    async submitAd() {
      try {
        await this.RegisterAdditional(this.formAd);
        await this.$router.push("/conferences");
        this.showError = false
      } catch (error) {
        this.showError = true
      }
    },
    async getCountries() {
      try {
        const countries = await axios.get('/register');
        this.countries = countries.data;
        this.showErrorCountry = false
      } catch (error) {
        this.showErrorCountry = true
      }
    },
  },
};
</script>

<style>

#error {
  color: red;
}
</style>
