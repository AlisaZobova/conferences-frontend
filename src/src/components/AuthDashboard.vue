<template>
  <v-app>
    <v-list-item-subtitle v-on:click="logout">log out</v-list-item-subtitle>
  </v-app>
</template>

<script>
export default {
  methods: {
    logout() {
      this.$router.replace({name: 'login'})
    }
  }
}
</script>