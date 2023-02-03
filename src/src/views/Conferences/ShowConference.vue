<template>
  <v-app>
    <v-main>
      <div v-if="loading" class="text-center">
        <v-progress-circular
            indeterminate
            color="primary"
        ></v-progress-circular>
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
            <th v-if="conference.country" class="text-left">
              Country
            </th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>{{ conference.title }}</td>
            <td>{{ conference.conf_date }}</td>
            <td v-if="conference.country">{{ conference.country.name }}</td>
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
        <div class="mt-2">
          <v-btn
              class="mr-1 mb-1 mt-1 white--text"
              depressed
              color="grey"
              @click="goBack"
          >
            Back
          </v-btn>
          <v-btn v-if="isAuthenticated && (isAdmin || (isConferenceCreator(conference.id) && isAnnouncer))" depressed color="cyan darken-1" class="white--text mr-1 mb-1 mt-1" @click="editItem(conference)">
            Edit
          </v-btn>
          <v-btn v-if="isAuthenticated && (isAdmin || (isConferenceCreator(conference.id) && isAnnouncer))" depressed color="error" class="mr-1 mb-1 mt-1" @click="deleteItem(conference)">
            Delete
          </v-btn>
          <v-btn v-if="isAuthenticated && !isConferenceJoined(conference.id) && !isAdmin" depressed class="mr-1 mb-1 mt-1" color="warning" @click="joinConference(conference.id)">
            Join
          </v-btn>
          <div class="d-inline" v-if="isAuthenticated && isConferenceJoined(conference.id) && !isAdmin">
            <v-btn depressed class="mr-1 mb-1 mt-1" outlined color="cyan darken-1" :href="'https://twitter.com/intent/tweet?text=' + getShareText() + '&url=' + getPath() ">
              TW
            </v-btn>
            <v-btn depressed outlined color="cyan darken-1" :href="'https://www.facebook.com/share.php?u=' + getPath()" class="mb-1 mt-1 mr-1">
              FB
            </v-btn>
            <v-btn depressed color="red lighten-2" class="mr-1 mb-1 mt-1 white--text" @click="cancelParticipation(conference.id)">
              Cancel participation
            </v-btn>
          </div>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script>
import {mapActions} from "vuex";
import { buttonActionsMixin } from "@/mixins/buttonActionsMixin";


export default {
  name: "ShowConference",
  mixins: [buttonActionsMixin],
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
  },
  watch: {
    dialogDelete (val) {
      val || this.closeDelete()
    },
  },
  methods: {
    ...mapActions(["GetConference", "DeleteConference"]),
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