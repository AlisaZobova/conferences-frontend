<template>
  <v-app>

    <v-app-bar app>

      <v-menu
          left
          bottom
      >
        <template v-slot:activator="{}">
            <span v-if="isLoggedIn">
              <v-btn @click="logout" class="mr-2 primary--text">Logout</v-btn>
              <v-btn
                  to="/reports"
                  class="mr-2 primary--text"
              >
              Reports
            </v-btn>
            </span>
          <span v-else>
              <v-btn
                  to="/login"
                  class="mr-2 primary--text"
              >
                Login
              </v-btn>
            </span>
          <v-btn
              to="/conferences"
              class="mr-2 primary--text"
          >
            Home
          </v-btn>
        </template>

      </v-menu>

      <v-toolbar-title></v-toolbar-title>

    </v-app-bar>

    <v-main>

      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>

    <v-footer app>
    </v-footer>
  </v-app>
</template>
<script>


import {mapActions} from "vuex";

export default {
  name: 'App',
  computed: {
    isLoggedIn: function () {
      return this.$store.getters.isAuthenticated
    },
  },
  methods: {
    ...mapActions(["LogOut"]),
    async logout() {
      await this.LogOut()
    }
  }
}
</script>

