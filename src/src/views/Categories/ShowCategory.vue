<template>
  <v-main>
    <div v-if="loading" class="text-center">
      <v-progress-circular
          indeterminate
          color="primary"
      ></v-progress-circular>
    </div>
    <div v-else>
      <p class="ml-4">Category: <b>{{ category.name }}</b></p>
      <div class="d-block">
        <p class="ml-4">Conferences: {{ category.conferences.length }}</p>
        <p class="ml-4">Reports: {{ category.reports.length }}</p>
        <div class="d-inline-block">
          <v-btn outlined class="ml-4 mr-2" color="grey" @click="goBack">Back</v-btn>
          <v-dialog
              v-model="dialog"
              width="500"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                  color="error"
                  outlined
                  v-bind="attrs"
                  v-on="on"
              >
                Delete
              </v-btn>
            </template>

            <v-card>
              <v-card-title class="text-h5"
              >Are you sure you want to delete this
                category?
              </v-card-title
              >

              <v-divider></v-divider>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="blue darken-1"
                    text
                    @click="dialog = false"
                >Cancel
                </v-btn
                >
                <v-btn
                    color="blue darken-1"
                    text
                    @click="deleteCategory"
                >OK
                </v-btn
                >
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>
      </div>
    </div>
  </v-main>
</template>

<script>
import {mapActions} from "vuex";

export default {
  name: "ShowCategory",
  computed: {
    category() {
      return this.$store.state.categories.category
    }
  },
  data() {
    return {
      loading: true,
      dialog: false
    }
  },
  methods: {
    ...mapActions(['GetCategory', 'DeleteCategory']),
    goBack() {
      this.$router.go(-1)
    },
    deleteCategory() {
      this.loading = true
      this.DeleteCategory(this.category.id).then(() => this.$router.push({name: 'Categories'}))
    }
  },
  created() {
    this.GetCategory(this.$route.params.id).then(() => this.loading = false)
  }
}
</script>

<style scoped>
:deep(.v-treeview) {
  width: 95%;
}
</style>