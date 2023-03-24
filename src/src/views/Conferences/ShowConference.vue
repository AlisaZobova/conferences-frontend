<template>
    <v-app>
        <v-main class="pt-2">
            <div v-if="loading" class="text-center mt-2">
                <v-progress-circular indeterminate color="primary" />
            </div>
            <div v-else>
                <v-breadcrumbs :items="items"></v-breadcrumbs>
                <v-simple-table>
                    <template v-slot:default>
                        <thead>
                            <tr>
                                <th class="text-left">Title</th>
                                <th class="text-left">Date</th>
                                <th v-if="conference.country" class="text-left">
                                    Country
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{{ conference.title }}</td>
                                <td>{{ conference.conf_date.slice(0, 10) }}</td>
                                <td v-if="conference.country">
                                    {{ conference.country.name }}
                                </td>
                            </tr>
                        </tbody>
                    </template>
                </v-simple-table>
                <GmapMap
                    v-if="conference.latitude && conference.longitude"
                    :center="{
                        lat: conference.latitude,
                        lng: conference.longitude,
                    }"
                    :zoom="10"
                    map-type-id="terrain"
                    style="width: 100%; height: 500px"
                >
                    <GmapMarker
                        :position="{
                            lat: conference.latitude,
                            lng: conference.longitude,
                        }"
                        :clickable="false"
                        :draggable="false"
                    />
                </GmapMap>

                <v-dialog v-model="dialogDelete" max-width="500px">
                    <v-card>
                        <v-card-title class="text-h5"
                            >Are you sure you want to delete this
                            conference?</v-card-title
                        >
                        <v-card-actions>
                            <v-spacer />
                            <v-btn
                                color="blue darken-1"
                                text
                                @click="closeDelete"
                                >Cancel</v-btn
                            >
                            <v-btn
                                color="blue darken-1"
                                text
                                @click="deleteItemConfirm"
                                >OK</v-btn
                            >
                            <v-spacer />
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <v-snackbar
                    v-model="cancelErrorSnackbar"
                    timeout="10000"
                    color="error"
                    :text="true"
                    right
                    bottom
                >
                    {{ apiErrors.zoom }}

                    <template v-slot:action="{ attrs }">
                        <v-btn
                            color="error"
                            text
                            v-bind="attrs"
                            @click="cancelErrorSnackbar = false"
                        >
                            Close
                        </v-btn>
                    </template>
                </v-snackbar>
                <div class="mt-2">
                    <v-btn
                        class="mr-1 mb-1 mt-1 white--text"
                        depressed
                        color="grey"
                        @click="goBack"
                    >
                        Back
                    </v-btn>
                    <v-btn
                        v-if="
                            isAuthenticated &&
                            isConferenceCreator(conference.id) &&
                            isAnnouncer
                        "
                        depressed
                        color="cyan darken-1"
                        class="white--text mr-1 mb-1 mt-1"
                        @click="editItem(conference)"
                    >
                        Edit
                    </v-btn>
                    <v-btn
                        v-if="
                            isAuthenticated &&
                            isConferenceCreator(conference.id) &&
                            isAnnouncer
                        "
                        depressed
                        color="error"
                        class="mr-1 mb-1 mt-1"
                        @click="deleteItem(conference)"
                    >
                        Delete
                    </v-btn>
                    <v-btn
                        v-if="
                            isAuthenticated &&
                            !isConferenceJoined(conference.id) &&
                            (!isAnnouncer || conference.available) &&
                            isConfNew(conference)
                        "
                        depressed
                        class="mr-1 mb-1 mt-1"
                        color="warning"
                        :disabled="processing"
                        @click="joinConference(conference.id)"
                    >
                        Join
                    </v-btn>
                    <div
                        class="d-inline red--text"
                        v-if="isAnnouncer && !conference.available"
                    >
                        Registration is not possible
                    </div>
                    <div
                        class="d-inline"
                        v-if="
                            isAuthenticated && isConferenceJoined(conference.id)
                        "
                    >
                        <v-btn
                            depressed
                            class="mr-1 mb-1 mt-1"
                            outlined
                            color="cyan darken-1"
                            target="_blank"
                            :href="
                                'https://twitter.com/intent/tweet?text=' +
                                getShareText() +
                                '&url=' +
                                getPath()
                            "
                        >
                            TW
                        </v-btn>
                        <v-btn
                            depressed
                            outlined
                            color="cyan darken-1"
                            target="_blank"
                            :href="
                                'https://www.facebook.com/share.php?u=' +
                                getPath()
                            "
                            class="mb-1 mt-1 mr-1"
                        >
                            FB
                        </v-btn>
                        <v-btn
                            depressed
                            color="red lighten-2"
                            class="mr-1 mb-1 mt-1 white--text"
                            :disabled="processing"
                            @click="cancelParticipation()"
                        >
                            Cancel participation
                        </v-btn>
                    </div>
                </div>
            </div>
        </v-main>
    </v-app>
</template>

<script>
import { mapActions } from 'vuex'
import { buttonActionsMixin } from '@/mixins/buttonActionsMixin'

export default {
    name: 'ShowConference',
    mixins: [buttonActionsMixin],
    data() {
        return {
            loading: true,
            dialogDelete: false,
            categoryName: '',
            categoryPath: '',
            apiErrors: {},
            cancelErrorSnackbar: false,
            items: [
                {
                    text: '',
                },
                {
                    text: 'conferences',
                    disabled: false,
                    // exact: true,
                    // to: {name: 'Conferences'},
                },
            ],
        }
    },
    computed: {
        conference() {
            return this.$store.state.conferences.conference
        },
    },
    watch: {
        dialogDelete(val) {
            val || this.closeDelete()
        },
    },
    methods: {
        ...mapActions(['GetConference', 'DeleteConference', 'DeleteReport']),
        deleteItem() {
            this.dialogDelete = true
        },
        async deleteItemConfirm() {
            this.loading = true
            this.DeleteConference(this.conference.id).then(() =>
                this.$router.push({ name: 'Conferences' })
            )
        },
        closeDelete() {
            this.dialogDelete = false
        },
        goBack() {
            this.$router.go(-1)
        },
        cancelParticipation() {
            this.cancelErrorSnackbar = false
            this.processing = true
            if (this.isAnnouncer) {
                const report = this.conference.reports.filter(
                    (report) => report.conference_id === this.conference.id
                )[0]
                this.CancelParticipation(this.conference.id)
                    .then(() => {
                        this.DeleteReport(report.id).catch((error) => {
                            if (error.response.data.errors) {
                                this.apiErrors = error.response.data.errors
                            }
                            if (error.response.data.errors.zoom) {
                                this.cancelErrorSnackbar = true
                            }
                        })
                    })
                    .finally(() => {
                        this.processing = false
                    })
            } else {
                this.CancelParticipation(this.conference.id).finally(() => {
                    this.processing = false
                })
            }
        },
    },

    created() {
        this.GetConference(this.$route.params.id).then(() => {
            if (this.conference.category) {
                this.categoryPath = this.conference.category.path
                for (let i in this.categoryPath) {
                    this.items.push({
                        text: this.categoryPath[i],
                        disabled: false,
                    })
                }
            }
            this.items.push({
                text: this.conference.title,
                disabled: false,
            })
            this.loading = false
        })
    },
}
</script>

<style scoped>
:deep(.v-breadcrumbs) {
    padding-left: 14px;
}
</style>
