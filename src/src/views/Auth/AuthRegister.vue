<template>
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

                      <v-form @submit.prevent="submitAd" v-model="isFormAdValid">

                        <v-text-field
                            v-model="formAd.firstname"
                            name="firstname"
                            label="Firstname"
                            class="mt-0"
                            :rules="[rules.required]"
                        ></v-text-field>

                        <v-text-field
                            v-model="formAd.lastname"
                            name="lastname"
                            label="Lastname"
                            :rules="[rules.required]"
                        ></v-text-field>

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
                                v-model="formAd.birthdate"
                                label="Birthdate"
                                persistent-hint
                                prepend-icon="mdi-calendar"
                                v-bind="attrs"
                                v-on="on"
                                :rules="[rules.required]"
                            ></v-text-field>
                          </template>
                          <v-date-picker
                              :max='nowDate'
                              v-model="formAd.birthdate"
                              no-title
                              @input="menu1 = false"
                          ></v-date-picker>
                        </v-menu>
                        <vue-tel-input :validCharactersOnly=true mode="international" v-model="phone" @validate="phoneValidate" @input="setNumber"></vue-tel-input>
                        <v-text-field class="phone-input" flat solo v-model="formAd.phone" :rules="[rules.required, rules.phone]" hidden></v-text-field>
                        <v-select
                            class="country-select"
                            v-model="formAd.country"
                            :items="countries"
                            item-text="name"
                            item-value="id"
                            label="Country"
                            :rules="[rules.required]"
                        ></v-select>

                        <p class="text-center" v-if="showErrorCountry">Failed to get list of countries</p>


<!--                    <v-btn-->
<!--                        color="grey lighten-1"-->
<!--                        @click="e1 = 1"-->
<!--                        class="mr-4"-->
<!--                    >-->
<!--                      Back-->
<!--                    </v-btn>-->
                    <v-btn
                        :disabled="!isFormAdValid"
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
</template>

<script>
import { mapActions} from "vuex";

export default {
  name: "AuthRegister",
  computed: {
    countries () {
      return this.$store.state.countries.countries
    },
  },
  data() {
    return {
      e1: 1,
      show1: false,
      show2: false,
      menu1: false,
      phone: null,
      nowDate: new Date().toISOString().slice(0,10),
      isFormValid: false,
      isFormAdValid: false,
      isPhoneValid: false,
      rules: {
        required: value => !!value || 'Required.',
        min: v => v.length >= 8 || 'Min 8 characters',
        match: () => (this.form.password === this.form.password_confirmation) ||
            'Password confirmation does not match',
        phone: () => (this.isPhoneValid) || 'Invalid phone number'
      },
      types: ["Listener", "Announcer"],
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
    ...mapActions(["Register", "RegisterAdditional", "GetCountries"]),
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
        await this.$router.push("/conferences").catch(() => {});
        this.showError = false
      } catch (error) {
        this.showError = true
      }
    },
    async getCountries() {
      try {
        await this.GetCountries()
        this.showErrorCountry = false
      } catch (error) {
        this.showErrorCountry = true
      }
    },
    async phoneValidate(data) {
        this.isPhoneValid = data.valid
    },
    async setNumber() {
      if (this.phone) {
        this.formAd.phone = this.phone
      }
    }
  },
};
</script>

<style scoped>

#error {
  color: red;
}

:deep(.vue-tel-input) {
  display: flex;
  border: none;
  border-bottom: 1px rgb(133, 133, 133) solid;
  border-radius: 0;
  text-align: left;
  padding-top: 12px;
}
:deep(.vue-tel-input:focus-within) {
  box-shadow: none;
  border-bottom-width: 2px;
  border-color: #1976D2;
}

.phone-input:deep(.v-input__slot) {
  min-height: 0;
}

.phone-input:deep(.v-input__control) {
  min-height: 0;
}

.phone-input:deep(.v-text-field__details) {
  min-height: 0;
  margin: 0;
}

</style>
