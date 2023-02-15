<template>
  <v-layout class="mt-6" align-center justify-center>
    <v-form
        @submit.prevent="submit"
        v-model="isFormValid"
    >
      <v-tree-select
          v-model="category"
          :items="categories"
          item-text="name"
          item-value="id"
          label="Choose parent category or leave empty"
          selection-type="independent"
          allow-select-parents
          show-full-path
      >
      </v-tree-select>

      <v-text-field
          v-model="form.name"
          type="text"
          name="name"
          label="Name"
          :rules="[rules.required]"
          :error-messages="apiError"
          @click="apiError=''"
      ></v-text-field>

      <v-btn outlined class="mr-2 mt-2" color="grey" @click="goBack">Back</v-btn>

      <v-btn
          :disabled="!isFormValid"
          color="primary"
          type="submit"
          class="mt-2"
      >
        Save
      </v-btn>
    </v-form>
  </v-layout>
</template>

<script>
import {mapActions} from "vuex";

export default {
  name: "CreateCategory",
  data() {
    return {
      form: {
        name: '',
        ancestor_id: null
      },
      loading: true,
      category: [],
      rules: {
        required: (value) => !!value || 'Required.',
      },
      isFormValid: false,
      apiError: ''
    }
  },
  computed: {
    categories() {
      return this.$store.state.categories.categories.filter(
          (category) => !category.parents
      )
    }
  },
  methods: {
    ...mapActions(['GetCategories', 'CreateCategory']),
    goBack() {
      this.$router.go(-1)
    },
    async submit() {
      if (this.category.length > 0) {
        this.form.ancestor_id = this.category[0].id
      }
      this.CreateCategory(this.form).then(() =>
          this.$router.push({name: 'Categories'})).catch(() =>
          this.apiError = 'This category name already exists')
    },
  },
  created() {
    this.GetCategories().then(() =>
        this.loading = false)
  },
}
</script>

<style scoped>
form {
  width: 75%;
}
</style>