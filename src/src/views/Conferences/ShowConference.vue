<template>
  <v-app>
    <v-main>
      <div v-if="loading">
      Loading...
      </div>
      <div v-else>
      <v-simple-table>
        <template v-slot:default>
          <thead>
          <tr>
            <th class="text-left">
              Title
            </th>
            <th class="text-left">
              Date
            </th>
            <th class="text-left">
              Country
            </th>
            <th class="text-left">
              Actions
            </th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>{{ conference.title }}</td>
            <td>{{ conference.conf_date }}</td>
            <td>{{ country }}</td>
            <td>
              <v-dialog v-model="dialogDelete" max-width="500px">
                <v-card>
                  <v-card-title class="text-h5">Are you sure you want to delete this conference?</v-card-title>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
                    <v-spacer></v-spacer>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-btn
                  class="mr-4"
                  @click="goBack"
              >
                Back
              </v-btn>
              <v-btn v-if="isAuthenticated && (isAdmin || (isConferenceCreator(conference.id) && isAnnouncer))" depressed color="primary" class="mr-1" @click="editItem(conference)">
                Edit
              </v-btn>
              <v-btn v-if="isAuthenticated && (isAdmin || (isConferenceCreator(conference.id) && isAnnouncer))" depressed color="error" class="mr-1" @click="deleteItem(conference)">
                Delete
              </v-btn>
              <v-btn v-if="isAuthenticated && !isConferenceJoined(conference.id) && !isAdmin" depressed class="mr-1" color="warning" @click="joinConference(conference.id)">
                Join
              </v-btn>
              <div class="d-inline" v-if="isAuthenticated && isConferenceJoined(conference.id) && !isAdmin">
                <v-btn depressed class="mr-1" @click="cancelParticipation(conference.id)">
                  Cancel participation
                </v-btn>
                <v-btn depressed class="mr-1" outlined color="primary" :href="'https://twitter.com/intent/tweet?text=' + getShareText() + '&url=' + getPath() ">
                  TW
                </v-btn>
                <v-btn depressed outlined color="primary" :href="'https://www.facebook.com/share.php?u=' + getPath()">
                  FB
                </v-btn>
              </div>
            </td>
          </tr>
          </tbody>
        </template>

      </v-simple-table>
        <GmapMap
            v-if="conference.latitude && conference.longitude"
            :center="{lat:conference.latitude, lng:conference.longitude}"
            :zoom="10"
            map-type-id="terrain"
            style="width: 100%; height: 500px"
        >
          <GmapMarker
              :position="{lat:conference.latitude, lng:conference.longitude}"
              :clickable="false"
              :draggable="false"
          />
        </GmapMap>
      </div>
    </v-main>
  </v-app>
</template>

<script>
import {mapActions} from "vuex";

import { share } from "../../../share.config"

export default {
  name: "ShowConference",
  data () {
    return {
      loading: true,
      dialogDelete: false,
    }
    },
  computed: {
    conference () {
      return this.$store.state.conferences.conference
    },
    country () {
      let searchId = this.conference.country_id
      if (searchId) {
        let countryItem = this.$store.state.countries.countries.filter(function (item) {
          return item.id === searchId
        })
        return countryItem[0].name
      }
      return null
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
  watch: {
    dialogDelete (val) {
      val || this.closeDelete()
    },
  },
  methods: {
    ...mapActions(["GetConference", "JoinConference", "CancelParticipation", "DeleteConference"]),
    editItem () {
      this.$router.push('/conferences/' + this.conference.id + '/edit').catch(() => {});
    },
    deleteItem () {
      this.dialogDelete = true
    },

    async deleteItemConfirm () {
      this.loading = true
      this.DeleteConference(this.conference.id).then(() => this.$router.push('/conferences/')).catch(() => {})
    },
    closeDelete () {
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
    getPath() {
      return process.env.VUE_APP_AXIOS_BASE_URL + this.$router.resolve({
        name: share.pathName,
        params: { id: this.$route.params.id },
      }).href;
    },
    getShareText () {
      return share.text
    },
    goBack () {
      this.$router.go(-1)
    }
  },

  created () {
    this.GetConference(this.$route.params.id).then(() => {
      this.loading = false;
    });
  },
}

</script>

<style scoped>

</style>