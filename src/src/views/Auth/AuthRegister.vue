<template>
    <v-main>
        <v-container fluid fill-height>
            <v-layout align-center justify-center>
                <v-flex xs12 sm8 md4>
                    <v-stepper v-model="step">
                        <v-stepper-header>
                            <v-stepper-step :complete="step > 1" step="1">
                            </v-stepper-step>

                            <v-divider />

                            <v-stepper-step :complete="step > 2" step="2">
                            </v-stepper-step>
                        </v-stepper-header>
                        <v-stepper-items>
                            <v-stepper-content step="1">
                                <v-card>
                                    <v-form
                                        @submit.prevent="submit"
                                        v-model="isFormValid"
                                    >
                                        <v-select
                                            v-model="form.type"
                                            :items="types"
                                            label="Type"
                                            class="mt-0"
                                        />

                                        <v-text-field
                                            v-model="form.email"
                                            type="email"
                                            name="email"
                                            label="Email"
                                            :error-messages="emailError"
                                            :rules="[rules.required]"
                                            @input="
                                                showError = false
                                                emailError = ''
                                            "
                                        />

                                        <v-text-field
                                            v-model="form.password"
                                            :append-icon="
                                                isPasswordVisible
                                                    ? 'mdi-eye'
                                                    : 'mdi-eye-off'
                                            "
                                            :rules="[rules.required, rules.min]"
                                            :type="
                                                isPasswordVisible
                                                    ? 'text'
                                                    : 'password'
                                            "
                                            hint="At least 8 characters"
                                            counter
                                            @click:append="
                                                isPasswordVisible =
                                                    !isPasswordVisible
                                            "
                                            name="password"
                                            id="password"
                                            label="Password"
                                            required
                                        />

                                        <v-text-field
                                            v-model="form.password_confirmation"
                                            :append-icon="
                                                isConfirmationVisible
                                                    ? 'mdi-eye'
                                                    : 'mdi-eye-off'
                                            "
                                            :rules="[
                                                rules.required,
                                                rules.min,
                                                rules.match,
                                            ]"
                                            :type="
                                                isConfirmationVisible
                                                    ? 'text'
                                                    : 'password'
                                            "
                                            hint="At least 8 characters"
                                            class="input-group--focused mb-1"
                                            @click:append="
                                                isConfirmationVisible =
                                                    !isConfirmationVisible
                                            "
                                            name="password_confirmation"
                                            id="password_confirmation"
                                            label="Confirm password"
                                            required
                                        />

                                        <v-btn
                                            :disabled="!isFormValid || loading"
                                            color="primary"
                                            type="submit"
                                        >
                                            Continue
                                        </v-btn>
                                        <div class="mt-3">
                                            <a>
                                                <router-link
                                                    :to="{ name: 'Login' }"
                                                    >Already have an account?
                                                    Login</router-link
                                                >
                                            </a>
                                        </div>
                                    </v-form>
                                </v-card>
                            </v-stepper-content>

                            <v-stepper-content step="2">
                                <v-card>
                                    <v-form
                                        @submit.prevent="submitAd"
                                        v-model="isFormAdValid"
                                    >
                                        <v-text-field
                                            v-model="formAd.firstname"
                                            name="firstname"
                                            label="Firstname"
                                            class="mt-0"
                                            :rules="[rules.required]"
                                        />

                                        <v-text-field
                                            v-model="formAd.lastname"
                                            name="lastname"
                                            label="Lastname"
                                            :rules="[rules.required]"
                                        />

                                        <v-menu
                                            ref="birthdateMenu"
                                            v-model="birthdateMenu"
                                            :close-on-content-click="false"
                                            transition="scale-transition"
                                            offset-y
                                            max-width="290px"
                                            min-width="auto"
                                        >
                                            <template
                                                v-slot:activator="{ on, attrs }"
                                            >
                                                <v-text-field
                                                    v-model="formAd.birthdate"
                                                    label="Birthdate"
                                                    persistent-hint
                                                    prepend-icon="mdi-calendar"
                                                    v-bind="attrs"
                                                    v-on="on"
                                                    :rules="[rules.required]"
                                                />
                                            </template>
                                            <v-date-picker
                                                :max="nowDate"
                                                v-model="formAd.birthdate"
                                                no-title
                                                @input="birthdateMenu = false"
                                            />
                                        </v-menu>
                                        <vue-tel-input
                                            valid-characters-only
                                            mode="international"
                                            v-model="phone"
                                            @validate="phoneValidate"
                                            @input="setNumber"
                                        />
                                        <v-text-field
                                            class="phone-input"
                                            flat
                                            solo
                                            v-model="formAd.phone"
                                            :rules="[
                                                rules.required,
                                                rules.phone,
                                            ]"
                                            hidden
                                        />
                                        <v-select
                                            class="country-select"
                                            v-model="formAd.country"
                                            :items="countries"
                                            item-text="name"
                                            item-value="id"
                                            label="Country"
                                            :rules="[rules.required]"
                                        />

                                        <p
                                            class="text-center"
                                            v-if="showErrorCountry"
                                        >
                                            Failed to get list of countries
                                        </p>

                                        <!--                    <v-btn-->
                                        <!--                        color="grey lighten-1"-->
                                        <!--                        @click="step = 1"-->
                                        <!--                        class="mr-4"-->
                                        <!--                    >-->
                                        <!--                      Back-->
                                        <!--                    </v-btn>-->
                                        <v-btn
                                            :disabled="
                                                !isFormAdValid || loading
                                            "
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
import { mapActions } from 'vuex'

export default {
    name: 'AuthRegister',
    computed: {
        countries() {
            return this.$store.state.countries.countries
        },
    },
    data() {
        return {
            step: 1,
            isPasswordVisible: false,
            isConfirmationVisible: false,
            birthdateMenu: false,
            phone: null,
            nowDate: new Date().toISOString().slice(0, 10),
            isFormValid: false,
            isFormAdValid: false,
            isPhoneValid: false,
            rules: {
                required: (value) => !!value || 'Required.',
                min: (v) => v.length >= 8 || 'Min 8 characters',
                match: () =>
                    this.form.password === this.form.password_confirmation ||
                    'Password confirmation does not match',
                phone: () => this.isPhoneValid || 'Invalid phone number',
            },
            types: ['Listener', 'Announcer'],
            defaultType: 'Listener',
            form: {
                type: 'Listener',
                email: '',
                password: '',
                password_confirmation: '',
            },
            formAd: {
                firstname: null,
                lastname: null,
                birthdate: null,
                phone: null,
                country: null,
            },
            showError: false,
            emailError: '',
            showErrorCountry: false,
            loading: false,
        }
    },
    methods: {
        ...mapActions(['Register', 'RegisterAdditional', 'GetCountries']),
        async submit() {
            this.loading = true
            this.Register(this.form)
                .then(() => {
                    this.step = 2
                    this.getCountries()
                })
                .catch(() => {
                    this.showError = true
                    this.emailError = 'Email already exists'
                })
                .finally(() => (this.loading = false))
        },
        async submitAd() {
            try {
                this.loading = true
                await this.RegisterAdditional(this.formAd)
                await this.$router.push({ name: 'Conferences' })
                this.showError = false
            } catch (error) {
                this.showError = true
                this.loading = false
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
        },
    },
}
</script>

<style scoped>
:deep(.vue-tel-input) {
    display: flex;
    border: none;
    border-bottom: 1px rgb(133, 133, 133) solid;
    border-radius: 0;
    text-align: left;
    padding-top: 12px;
}
:deep(.vue-tel-input:hover) {
    border-bottom-color: black;
}

:deep(.vue-tel-input:focus-within) {
    box-shadow: none;
    border-bottom-width: 2px;
    border-color: #1976d2;
    transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

:deep(.vti__dropdown) {
    position: inherit;
}

:deep(.vti__dropdown-list) {
    max-height: 200px;
    padding-left: 0;
}

:deep(ul.vti__dropdown-list.below) {
    width: 100% !important;
}

:deep(strong) {
    font-weight: 400;
}

:deep(.v-application ul, .v-application ol) {
    padding-left: 0;
    width: 100%;
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
