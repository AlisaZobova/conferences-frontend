<template>
    <v-app>
        <v-app-bar app>
            <v-menu left bottom>
                <template v-slot:activator="{}">
                    <span v-if="isLoggedIn">
                        <v-btn @click="logout" class="mr-2 primary--text"
                            >Logout</v-btn
                        >
                        <v-btn :to="{name: 'Reports'}" class="mr-2 primary--text">
                            Reports
                        </v-btn>
                        <v-btn v-if="isAdmin" :to="{name: 'Categories'}" class="mr-2 primary--text">
                            Categories
                        </v-btn>
                    </span>
                    <span v-else>
                        <v-btn :to="{name: 'Login'}" class="mr-2 primary--text">
                            Login
                        </v-btn>
                    </span>
                    <v-btn :to="{name: 'Conferences'}" class="mr-2 primary--text">
                        Home
                    </v-btn>
                </template>
            </v-menu>
        </v-app-bar>

        <v-main>
            <v-container fluid>
                <router-view></router-view>
            </v-container>
        </v-main>

        <v-footer app> </v-footer>
    </v-app>
</template>
<script>
import { mapActions } from 'vuex'

export default {
    name: 'App',
    computed: {
        isLoggedIn() {
            return this.$store.getters.isAuthenticated
        },
        isAdmin() {
          return this.$store.getters.isAdmin
      }
    },
    methods: {
        ...mapActions(['LogOut']),
        async logout() {
            await this.LogOut()
        },
    },
}
</script>
