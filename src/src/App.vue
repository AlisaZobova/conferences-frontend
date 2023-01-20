<template>
  <v-app>

    <v-app-bar app>

      <v-menu
          left
          bottom
      >
        <template v-slot:activator="{}">
            <span v-if="isLoggedIn">
              <v-btn @click="logout" class="mr-2">Logout</v-btn>
            </span>
            <span v-else>
              <v-btn class="mr-2"><router-link to="/login" style="text-decoration: none;">Login</router-link></v-btn>
            </span>
            <v-btn><router-link to="/conferences" style="text-decoration: none;">Home</router-link></v-btn>
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


export default {
  name: 'App',
  computed: {
    isLoggedIn: function () {
      return this.$store.getters.isAuthenticated
    }
  },
  methods: {
    async logout() {
      await this.$store.dispatch('LogOut')
      await this.$router.push('/conferences')
    }
  }
}
</script>

