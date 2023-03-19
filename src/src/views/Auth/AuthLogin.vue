<template>
    <v-main>
        <v-container fluid fill-height>
            <v-layout align-center justify-center>
                <v-flex xs12 sm8 md4>
                    <v-card class="elevation-12">
                        <v-toolbar dark color="primary">
                            <v-toolbar-title>Login form</v-toolbar-title>
                        </v-toolbar>
                        <v-card-text>
                            <v-form @submit.prevent="submit">
                                <v-text-field
                                    v-model="form.email"
                                    type="email"
                                    name="email"
                                    label="Email"
                                    required
                                />

                                <v-text-field
                                    v-model="form.password"
                                    type="password"
                                    name="password"
                                    label="Password"
                                    required
                                />

                                <p
                                    class="text-center"
                                    v-if="showError"
                                    id="error"
                                >
                                    Email or Password is incorrect
                                </p>
                                <v-container class="text-right">
                                    <a class="mr-4">
                                        <router-link :to="{ name: 'Register' }"
                                            >Register</router-link
                                        >
                                    </a>
                                    <v-btn type="submit" color="primary">
                                        Login
                                    </v-btn>
                                </v-container>
                            </v-form>
                        </v-card-text>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>
    </v-main>
</template>

<script>
import { mapActions } from 'vuex'

export default {
    name: 'AuthLogin',
    components: {},
    data() {
        return {
            form: {
                email: '',
                password: '',
            },
            showError: false,
        }
    },
    methods: {
        ...mapActions(['LogIn']),
        async submit() {
            const User = new FormData()
            User.append('email', this.form.email)
            User.append('password', this.form.password)
            try {
                await this.LogIn(User)
                await this.$router.push({ name: 'Conferences' })
                this.showError = false
            } catch (error) {
                this.showError = true
            }
        },
    },
}
</script>

<style scoped>
#error {
    color: red;
}
</style>
