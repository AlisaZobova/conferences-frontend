<template>
    <v-app>
        <v-app-bar app>
            <div class="hidden-sm-and-down">
                <span v-if="isLoggedIn">
                    <v-btn :to="{ name: 'Reports' }" class="mr-2 primary--text">
                        Reports
                    </v-btn>
                </span>
                <v-btn :to="{ name: 'Conferences' }" class="mr-2 primary--text">
                    Home
                </v-btn>
            </div>

            <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                    <v-app-bar-nav-icon
                        class="mr-2 hidden-md-and-up"
                        v-bind="attrs"
                        v-on="on"
                    ></v-app-bar-nav-icon>
                </template>
                <v-list class="primary--text hidden-md-and-up">
                    <span v-if="isLoggedIn">
                        <v-list-item :to="{ name: 'Reports' }">
                            <v-list-item-title> Reports </v-list-item-title>
                        </v-list-item>
                    </span>
                    <v-list-item :to="{ name: 'Conferences' }">
                        <v-list-item-title> Home </v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>

            <v-layout class="d-flex justify-end align-center">
                <ReportsConferencesSearch
                    v-if="isLoggedIn"
                    class="mr-2"
                ></ReportsConferencesSearch>
                <span v-if="isLoggedIn">
                    <v-badge
                        class="mr-5"
                        v-if="favCount > 0"
                        :content="favCount"
                        color="error"
                    >
                        <v-icon @click="goToFav" :color="iconColor"
                            >mdi-heart</v-icon
                        >
                    </v-badge>
                    <v-icon
                        class="mr-5"
                        v-if="favCount === 0"
                        :color="iconColor"
                        >mdi-heart</v-icon
                    >
                </span>
                <v-menu offset-y v-if="isLoggedIn">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn class="primary--text" v-on="on" v-bind="attrs">
                            <v-icon aria-hidden="false"> mdi-account </v-icon
                            >&nbsp; Profile
                        </v-btn>
                    </template>
                    <v-list class="primary--text">
                        <v-list-item :to="{ name: 'Profile' }">
                            <v-list-item-title>My profile</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="logout">
                            <v-list-item-title>Logout</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
                <v-menu v-if="!isLoggedIn">
                    <template v-slot:activator="{}">
                        <v-btn
                            v-if="!isLoggedIn"
                            :to="{ name: 'Login' }"
                            class="primary--text"
                        >
                            Login
                        </v-btn>
                    </template>
                </v-menu>
            </v-layout>
        </v-app-bar>

        <v-main>
            <v-container fluid>
                <router-view></router-view>
                <v-snackbar
                    v-model="$root.planErrorSnackbar"
                    timeout="10000"
                    color="error"
                    :text="true"
                    right
                    bottom
                >
                    You have reached your plan join limit this month. Choose a
                    different plan to have a higher limit.

                    <template v-slot:action="{ attrs }">
                        <v-btn
                            color="error"
                            text
                            v-bind="attrs"
                            @click="$root.planErrorSnackbar = false"
                        >
                            Close
                        </v-btn>
                    </template>
                </v-snackbar>
            </v-container>
        </v-main>
    </v-app>
</template>
<script>
import { mapActions } from 'vuex'
import ReportsConferencesSearch from '@/views/Search/ReportsConferencesSearch'

export default {
    name: 'App',
    components: { ReportsConferencesSearch },
    computed: {
        isLoggedIn() {
            return this.$store.getters.isAuthenticated
        },
        iconColor() {
            return this.$store.state.auth.user.favorites.length > 0
                ? 'red'
                : 'grey'
        },
        favCount() {
            let favoritesCount = this.$store.state.auth.user.favorites.length
            return favoritesCount > 99 ? '99+' : favoritesCount
        },
    },
    methods: {
        ...mapActions(['LogOut']),
        async logout() {
            this.LogOut().then(() => {
                if (this.$route.name === 'Conferences') {
                    this.$router.go(0)
                }
            })
        },
        goToFav() {
            this.$router.push({ name: 'Favorites' })
        },
    },
}
</script>
<style scoped>
.v-list-item {
    text-align: center;
}

.v-list {
    padding: 0;
}
</style>
