<template>
<v-app>
  <v-main>
      <h1 class="text-center">Forbidden! You do not have rights to this action.</h1>
      <p class="text-center">
        <a href="/conferences">Go to the main page?</a>
      </p>
  </v-main>
</v-app>
</template>

<script>
export default {
  name: "ForbiddenError"
}
</script>

<style scoped>

h1 {
  color: darkslategrey;
  font-size: 2em;
}
</style>