<template>
    <v-app>
        <v-app-bar app>
            <div class="hidden-sm-and-down">
                <span v-if="isLoggedIn">
                    <v-btn :to="{ name: 'Reports' }" class="mr-2 primary--text">
                        Reports
                    </v-btn>
                    <v-btn
                        v-if="isAdmin"
                        :to="{ name: 'Categories' }"
                        class="mr-2 primary--text"
                    >
                        Categories
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
                <v-list>
                    <span v-if="isLoggedIn">
                        <v-list-item>
                            <v-list-item-title>
                                <router-link
                                    :to="{ name: 'Reports' }"
                                    class="primary--text text-decoration-none"
                                >
                                    Reports
                                </router-link>
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item>
                            <v-list-item-title>
                                <router-link
                                    v-if="isAdmin"
                                    :to="{ name: 'Categories' }"
                                    class="primary--text text-decoration-none"
                                >
                                    Categories
                                </router-link>
                            </v-list-item-title>
                        </v-list-item>
                    </span>
                    <v-list-item>
                        <v-list-item-title>
                            <router-link
                                :to="{ name: 'Conferences' }"
                                class="primary--text text-decoration-none"
                            >
                                Home
                            </router-link>
                        </v-list-item-title>
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
                    <template v-slot:activator="{ on }">
                        <v-btn class="primary--text" v-on="on">
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
        isAdmin() {
            return this.$store.getters.isAdmin
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
</style>
