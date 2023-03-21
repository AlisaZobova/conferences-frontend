<template>
    <v-main class="pt-4">
        <div v-if="loading" class="text-center">
            <v-progress-circular indeterminate color="primary" />
        </div>
        <div v-else>
            <validation-observer ref="observer" v-slot="{ invalid }">
                <v-layout class="align-center justify-center mt-4">
                    <v-form
                        @submit.prevent="submit"
                        v-model="isFormValid"
                        class="edit-form"
                    >
                        <div
                            class="grey d-flex justify-space-between align-center lighten-4 pa-4 mb-4"
                        >
                            <div>
                                <div class="mb-4">
                                    <b>Current plan:</b>&nbsp;{{
                                        user.active_subscription.name
                                    }}
                                </div>
                                <div v-if="user.credits !== 'unlimited'">
                                    <b>Available credits:</b>&nbsp;
                                    {{ user.credits }}
                                </div>
                            </div>
                            <div>
                                <v-btn
                                    outlined
                                    color="primary"
                                    v-if="
                                        user.active_subscription.name === 'Free'
                                    "
                                    :to="{ name: 'Plans' }"
                                >
                                    Upgrade subscription
                                </v-btn>
                                <v-btn
                                    v-else
                                    outlined
                                    :disabled="unsubscribeProcessing"
                                    color="error"
                                    @click="unsubscribe"
                                >
                                    {{
                                        unsubscribeProcessing
                                            ? 'Processing'
                                            : 'Cancel subscription'
                                    }}
                                </v-btn>
                            </div>
                        </div>
                        <validation-provider
                            v-slot="{ errors }"
                            name="Email"
                            rules="email"
                        >
                            <v-text-field
                                v-model="user.email"
                                type="email"
                                name="email"
                                label="Email"
                                :error-messages="
                                    errors.length > 0 ? errors : emailError
                                "
                                :rules="[rules.required]"
                                @input="
                                    showError = false
                                    emailError = ''
                                "
                            />
                        </validation-provider>
                        <v-text-field
                            v-model="user.firstname"
                            name="firstname"
                            label="Firstname"
                            class="mt-0"
                            :rules="[rules.required]"
                        />

                        <v-text-field
                            v-model="user.lastname"
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
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                    v-model="user.birthdate"
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
                                v-model="user.birthdate"
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
                            v-model="user.phone"
                            :rules="[rules.required, rules.phone]"
                            hidden
                        />
                        <v-select
                            class="country-select"
                            v-model="user.country_id"
                            :items="countries"
                            item-text="name"
                            item-value="id"
                            label="Country"
                            :rules="[rules.required]"
                        />

                        <v-text-field
                            v-model="password"
                            :append-icon="
                                isPasswordVisible ? 'mdi-eye' : 'mdi-eye-off'
                            "
                            :type="isPasswordVisible ? 'text' : 'password'"
                            hint="At least 8 characters"
                            :error-messages="passwordError"
                            @input="
                                isFormValid = true
                                passwordError = ''
                            "
                            counter
                            @click:append="
                                isPasswordVisible = !isPasswordVisible
                            "
                            name="password"
                            id="password"
                            label="Password"
                            required
                        />

                        <v-text-field
                            v-model="password_confirmation"
                            :append-icon="
                                isConfirmationVisible
                                    ? 'mdi-eye'
                                    : 'mdi-eye-off'
                            "
                            :rules="[rules.match]"
                            :type="isConfirmationVisible ? 'text' : 'password'"
                            hint="At least 8 characters"
                            class="input-group--focused mb-1"
                            @click:append="
                                isConfirmationVisible = !isConfirmationVisible
                            "
                            name="password_confirmation"
                            id="password_confirmation"
                            label="Confirm password"
                            required
                        />

                        <v-btn
                            :disabled="!isFormValid || invalid"
                            type="submit"
                            color="primary"
                        >
                            Save
                        </v-btn>
                        <v-btn
                            outlined
                            class="ml-2"
                            color="grey"
                            @click="goBack"
                            >Back</v-btn
                        >
                    </v-form>
                </v-layout>
            </validation-observer>
        </div>
        <v-snackbar
            v-model="successSnackbar"
            timeout="10000"
            color="success"
            :text="true"
            right
            bottom
        >
            You have successfully unsubscribed!
            <template v-slot:action="{ attrs }">
                <v-btn
                    color="grey"
                    text
                    v-bind="attrs"
                    @click="successSnackbar = false"
                >
                    Close
                </v-btn>
            </template>
        </v-snackbar>
        <v-snackbar
            v-model="errorSnackbar"
            timeout="5000"
            color="error"
            :text="true"
            right
            bottom
        >
            An error occurred while unsubscribing. Please try again later.
            <template v-slot:action="{ attrs }">
                <v-btn
                    color="error"
                    text
                    v-bind="attrs"
                    @click="errorSnackbar = false"
                >
                    Close
                </v-btn>
            </template>
        </v-snackbar>
    </v-main>
</template>

<script>
import { mapActions } from 'vuex'
import '@/assets/js/validationRules'
import { ValidationObserver, ValidationProvider } from 'vee-validate'

export default {
    name: 'EditProfile',
    components: {
        ValidationProvider,
        ValidationObserver,
    },
    computed: {
        countries() {
            return this.$store.state.countries.countries
        },
        user() {
            let user = this.$store.state.auth.user
            user['birthdate'] = user['birthdate'].slice(0, 10)
            return user
        },
    },
    data() {
        return {
            isPasswordVisible: false,
            isConfirmationVisible: false,
            birthdateMenu: false,
            phone: null,
            loading: true,
            nowDate: new Date().toISOString().slice(0, 10),
            isFormValid: false,
            isPhoneValid: true,
            password: '',
            password_confirmation: '',
            passwordError: '',
            rules: {
                required: (value) => !!value || 'Required.',
                min: (v) => v.length >= 8 || 'Min 8 characters',
                match: () =>
                    this.password === this.password_confirmation ||
                    'Password confirmation does not match',
                phone: () => this.isPhoneValid || 'Invalid phone number',
            },
            types: ['Listener', 'Announcer'],
            defaultType: 'Listener',
            showError: false,
            emailError: '',
            showErrorCountry: false,
            successSnackbar: false,
            errorSnackbar: false,
            unsubscribeProcessing: false,
        }
    },
    methods: {
        ...mapActions([
            'UpdateProfile',
            'GetCountries',
            'GetUser',
            'unsubscribeUser',
        ]),
        async submit() {
            if (this.password.length > 0 && this.password.length < 8) {
                this.isFormValid = false
                this.passwordError = 'Password must be at least 8 characters'
                return
            }
            this.user.password = this.password
            this.user.password_confirmation = this.password_confirmation
            this.UpdateProfile(this.user)
                .then(() => this.$router.push({ name: 'Conferences' }))
                .catch((error) => {
                    this.showError = true
                    let apiErrors = error.response.data.errors
                    this.emailError = apiErrors.email
                })
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
            this.user.phone = this.phone
        },
        async unsubscribe() {
            this.unsubscribeProcessing = true
            this.unsubscribeUser()
                .then(() => {
                    this.successSnackbar = true
                    this.unsubscribeProcessing = false
                })
                .catch(() => {
                    this.errorSnackbar = true
                    this.unsubscribeProcessing = false
                })
        },
        goBack() {
            this.$router.go(-1)
        },
    },
    created() {
        this.phone = this.user.phone
        this.getCountries().then(() => (this.loading = false))
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
    /*position: inherit;*/
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
