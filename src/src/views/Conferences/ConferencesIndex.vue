<template>
  <v-app>
  <v-main>
    <v-data-table
        :headers="headers"
        :items="conferences"
        :options.sync="options"
        :server-items-length="totalConferences"
        :loading="loading"
        :items-per-page="perPage"
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
          <v-dialog v-if="isAuthenticated && (isAdmin || isAnnouncer)"
              max-width="500px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                  color="primary"
                  dark
                  class="mb-2"
                  v-bind="attrs"
                  v-on="on"
                  @click="createItem"
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
        <v-btn v-if="isAuthenticated && (isAdmin || (isConferenceCreator(item.id) && isAnnouncer))" depressed color="primary" class="mr-1" @click="editItem(item)">
          Edit
        </v-btn>
        <v-btn v-if="isAuthenticated && (isAdmin || (isConferenceCreator(item.id) && isAnnouncer))" depressed color="error" class="mr-1" @click="deleteItem(item)">
          Delete
        </v-btn>
        <v-btn v-if="isAuthenticated && !isConferenceJoined(item.id) && !isAdmin" depressed class="mr-1" color="warning" @click="joinConference(item.id)">
          Join
        </v-btn>
        <div class="d-inline" v-if="isAuthenticated && isConferenceJoined(item.id) && !isAdmin">
        <v-btn depressed class="mr-1" @click="cancelParticipation(item.id)">
          Cancel participation
        </v-btn>
        <v-btn depressed class="mr-1" outlined color="primary">
          TW
        </v-btn>
        <v-btn depressed outlined color="primary">
          FB
        </v-btn>
        </div>
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
import {mapActions, mapGetters} from "vuex";

export default {
  name: "ConferencesIndex",
  computed: {
    conferences () {
      return this.$store.state.conferences.conferences.data
    },
    totalConferences () {
      return this.$store.state.conferences.conferences.total
    },
    perPage () {
      return this.$store.state.conferences.conferences.per_page
    },
    isAdmin () {
      return this.$store.getters.isAdmin
    },
    isAnnouncer () {
      return this.$store.getters.isAnnouncer
    },
    isAuthenticated () {
      return this.$store.getters.isAuthenticated
    },
  },
  data () {
    return {
      selectedItem: null,
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
    dialogDelete (val) {
      val || this.closeDelete()
    },
  },
  methods: {
    ...mapActions(["GetConferences", "DeleteConference",
      "JoinConference", "CancelParticipation"]),
    ...mapGetters(['isCreator', 'isJoined']),
    getConferences () {
      this.loading = true
      const {page} = this.options
      this.GetConferences(page).then(() => {
        this.loading = false
      })
    },
    createItem () {
      this.$router.push('/conferences/create').catch(() => {});
    },
    editItem (item) {
      this.$router.push('/conferences/' + item.id + '/edit').catch(() => {});
    },
    showItem (item) {
      this.$router.push('/conferences/' + item.id).catch(() => {});
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
    joinConference (conferenceId) {
      this.JoinConference(conferenceId)
      this.$router.push('/conferences').catch(() => {});
    },
    cancelParticipation (conferenceId) {
      this.CancelParticipation(conferenceId)
      this.$router.push('/conferences').catch(() => {});
    },
    isConferenceCreator (conferenceId) {
      return this.$store.getters.isCreator(conferenceId)
    },
    isConferenceJoined (conferenceId) {
      return this.$store.getters.isJoined(conferenceId)
    },
  },
}
</script>

<style scoped>
</style>

