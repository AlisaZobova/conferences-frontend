<template>
    <div v-if="loading" class="text-center mt-4">
        <v-progress-circular
            indeterminate
            color="primary"
        ></v-progress-circular>
    </div>
    <div v-else>
        <v-layout class="align-center justify-center mt-4">
            <v-form @submit.prevent="submit" v-model="isFormValid">
                <v-text-field
                    v-model="user.email"
                    type="email"
                    name="email"
                    label="Email"
                    :error-messages="emailError"
                    :rules="[rules.required]"
                    @input="
                        showError = false
                        emailError = ''
                    "
                ></v-text-field>

                <v-text-field
                    v-model="password"
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
                    v-model="password_confirmation"
                    :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
                    :rules="[rules.required, rules.min, rules.match]"
                    :type="show2 ? 'text' : 'password'"
                    hint="At least 8 characters"
                    class="input-group--focused mb-1"
                    @click:append="show2 = !show2"
                    name="password_confirmation"
                    id="password_confirmation"
                    label="Confirm password"
                    required
                ></v-text-field>

                <v-text-field
                    v-model="user.firstname"
                    name="firstname"
                    label="Firstname"
                    class="mt-0"
                    :rules="[rules.required]"
                ></v-text-field>

                <v-text-field
                    v-model="user.lastname"
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
                            v-model="user.birthdate"
                            label="Birthdate"
                            persistent-hint
                            prepend-icon="mdi-calendar"
                            v-bind="attrs"
                            v-on="on"
                            :rules="[rules.required]"
                        ></v-text-field>
                    </template>
                    <v-date-picker
                        :max="nowDate"
                        v-model="user.birthdate"
                        no-title
                        @input="menu1 = false"
                    ></v-date-picker>
                </v-menu>
                <vue-tel-input
                    valid-characters-only
                    mode="international"
                    v-model="phone"
                    @validate="phoneValidate"
                    @input="setNumber"
                ></vue-tel-input>
                <v-text-field
                    class="phone-input"
                    flat
                    solo
                    v-model="user.phone"
                    :rules="[rules.required, rules.phone]"
                    hidden
                ></v-text-field>
                <v-select
                    class="country-select"
                    v-model="user.country_id"
                    :items="countries"
                    item-text="name"
                    item-value="id"
                    label="Country"
                    :rules="[rules.required]"
                ></v-select>

                <p class="text-center" v-if="showErrorCountry">
                    Failed to get list of countries
                </p>

                <v-btn :disabled="!isFormValid" type="submit" color="primary">
                    Save
                </v-btn>
                <v-btn outlined class="ml-2" color="grey" @click="goBack"
                    >Back</v-btn
                >
            </v-form>
        </v-layout>
    </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
    name: 'EditProfile',
    computed: {
        countries() {
            return this.$store.state.countries.countries
        },
        user() {
            return this.$store.state.auth.user
        },
    },
    data() {
        return {
            show1: false,
            show2: false,
            menu1: false,
            phone: null,
            loading: true,
            nowDate: new Date().toISOString().slice(0, 10),
            isFormValid: false,
            isPhoneValid: true,
            password: '',
            password_confirmation: '',
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
        }
    },
    methods: {
        ...mapActions(['UpdateProfile', 'GetCountries', 'GetUser']),
        async submit() {
            this.user.password = this.password
            this.user.password_confirmation = this.password_confirmation
            this.UpdateProfile(this.user)
                .then(() => this.$router.push({ name: 'Conferences' }))
                .catch(() => {
                    this.showError = true
                    this.emailError = 'Email already exists'
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
            if (this.phone) {
                this.user.phone = this.phone
            }
        },
        goBack() {
            this.$router.go(-1)
        },
    },
    created() {
        this.GetUser()
            .then(() => {
              this.phone = this.user.phone
              this.getCountries()
            })
            .then(() => (this.loading = false))
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
:deep(.vue-tel-input:focus-within) {
    box-shadow: none;
    border-bottom-width: 2px;
    border-color: #1976d2;
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

form {
    width: 75%;
}
</style>