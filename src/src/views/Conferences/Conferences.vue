<template>
  <v-app>
  <v-main>
    <v-data-table
        :headers="headers"
        :items="conferences"
        :options.sync="options"
        :server-items-length="totalConferences"
        :loading="loading"
        :items-per-page="15"
        class="elevation-1"
    >
      <template v-slot:top>
        <v-toolbar
            flat
        >
          <v-toolbar-title>Conferences</v-toolbar-title>
          <v-divider
              class="mx-4"
              inset
              vertical
          ></v-divider>
          <v-spacer></v-spacer>
          <v-dialog
              v-model="dialog"
              max-width="500px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                  color="primary"
                  dark
                  class="mb-2"
                  v-bind="attrs"
                  v-on="on"
              >
                New Conference
              </v-btn>
            </template>
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-btn depressed color="success" class="mr-1" @click="showItem(item)">
          Details
        </v-btn>
        <v-btn depressed color="primary" class="mr-1" @click="editItem(item)">
          Edit
        </v-btn>
        <v-btn depressed color="error" class="mr-1" @click="deleteItem(item)">
          Delete
        </v-btn>
        <v-btn depressed class="mr-1" color="warning">
          Join
        </v-btn>
        <v-btn depressed class="mr-1">
          Cancel participation
        </v-btn>
        <v-btn depressed class="mr-1" outlined color="primary">
          TW
        </v-btn>
        <v-btn depressed outlined color="primary">
          FB
        </v-btn>
      </template>
      <template v-slot:no-data>
        <v-btn
            color="primary"
            @click="getConferences"
        >
          Reset
        </v-btn>
      </template>
    </v-data-table>
  </v-main>
  </v-app>
</template>

<script>
import {mapActions} from "vuex";

export default {
  name: "Conferences",
  computed: {
    conferences () {
      return this.$store.state.conferences.conferences.data
    },
    totalConferences () {
      return this.$store.state.conferences.conferences.total
    }
  },
  data () {
    return {
      selectedItem: null,
      dialog: false,
      dialogDelete: false,
      loading: true,
      options: {},
      headers: [
        {
          text: 'Title',
          align: 'start',
          sortable: false,
          value: 'title',
        },
        { text: 'Date', value: 'conf_date' },
        { text: 'Actions', value: 'actions' }
      ],
    }
  },
  watch: {
    options: {
      handler () {
        this.getConferences()
      },
      deep: true,
    },
    dialog (val) {
      val || this.close()
    },
    dialogDelete (val) {
      val || this.closeDelete()
    },
  },
  methods: {
    ...mapActions(["GetConferences", "DeleteConference"]),
    getConferences () {
      this.loading = true
      const {page} = this.options
      this.GetConferences(page).then(() => {
        this.loading = false
      })
    },
    editItem (item) {
      this.editedIndex = this.conferences.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    showItem (item) {
      this.$router.push('/conferences/' + item.id)
    },
    deleteItem (item) {
      this.selectedItem = item
      this.dialogDelete = true
    },

    deleteItemConfirm () {
      this.DeleteConference(this.selectedItem.id)
      this.closeDelete()
    },

    closeDelete () {
      this.selectedItem = null
      this.dialogDelete = false
    },
    close () {
      this.dialog = false
      }
  },
}
</script>

<style scoped>
</style>

