<template>
    <v-main>
        <v-container fluid>
            <v-row dense>
                <v-col
                    v-for="item in user.favorites"
                    :key="item.id"
                    class="d-flex"
                    style="flex-direction: column"
                    cols="4"
                >
                    <v-card
                        max-width="344"
                        class="flex-grow-1"
                        :to="{
                            name: 'ShowReport',
                            params: { id: item.id },
                        }"
                    >
                        <v-card-title
                            class="teal--text d-inline-flex"
                            @click.prevent="getReport(item.id)"
                        >
                            {{ item.topic }}
                        </v-card-title>

                        <v-btn
                            icon
                            @click.prevent="
                                getHeartColor(item.id) === 'grey'
                                    ? addToFavorites(item.id)
                                    : deleteFromFavorites(item.id)
                            "
                        >
                            <v-icon :color="getHeartColor(item.id)">
                                mdi-heart
                            </v-icon>
                        </v-btn>

                        <v-card-subtitle class="mt-2 pb-0">
                            <b>Date:</b> {{ item.start_time.slice(0, 10)
                            }}<br /><br />
                            <b>From:</b> {{ item.start_time.slice(10, 16)
                            }}<br />
                            <b>To:</b> {{ item.end_time.slice(10, 16)
                            }}<br /><br />
                        </v-card-subtitle>

                        <v-card-subtitle class="pt-0" v-if="item.description">
                            <b>Description:</b>
                            {{
                                item.description.length >= 100
                                    ? item.description.slice(0, 100) + '...'
                                    : item.description
                            }}
                        </v-card-subtitle>

                        <v-card-actions
                            v-if="
                                item.description &&
                                item.description.length >= 100
                            "
                        >
                            <v-btn
                                text
                                color="yellow darken-1"
                                @click.prevent="showMore(item.id)"
                            >
                                More
                            </v-btn>
                        </v-card-actions>

                        <v-expand-transition>
                            <v-card
                                v-if="show.includes(item.id)"
                                class="transition-fast-in-fast-out v-card--reveal"
                                style="height: 100%"
                            >
                                <v-card-subtitle class="mt-2">
                                    <b>Description:</b>
                                    {{ item.description }}
                                </v-card-subtitle>

                                <v-card-actions>
                                    <v-btn
                                        text
                                        color="yellow darken-1"
                                        @click.prevent="hideMore(item.id)"
                                    >
                                        Close
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-expand-transition>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </v-main>
</template>

<script>
import { mapActions } from 'vuex'

export default {
    name: 'ReportsFavorites',
    data() {
        return {
            show: [],
        }
    },
    computed: {
        user() {
            return this.$store.state.auth.user
        },
    },
    methods: {
        ...mapActions(['GetReports', 'AddFavorite', 'DeleteFavorite']),
        getReport(reportId) {
            this.$router
                .push({ name: 'ShowReport', params: { id: reportId } })
                .catch(() => {})
        },
        showMore(reportId) {
            if (!this.show.includes(reportId)) {
                this.show.push(reportId)
            }
        },
        hideMore(reportId) {
            if (this.show.includes(reportId)) {
                const index = this.show.indexOf(reportId)
                this.show.splice(index)
            }
        },
        addToFavorites(reportId) {
            this.AddFavorite(reportId)
        },
        deleteFromFavorites(reportId) {
            this.DeleteFavorite(reportId)
        },
        getHeartColor(reportId) {
            function isInFav(element) {
                return element.id === reportId
            }
            if (
                this.$store.state.auth.user.favorites.findIndex(isInFav) !== -1
            ) {
                return 'red'
            } else {
                return 'grey'
            }
        },
    },
}
</script>

<style scoped>
.v-card--reveal {
    bottom: 0;
    opacity: 1 !important;
    position: absolute;
    width: 100%;
}

:deep(.col) {
    max-width: 25%;
    margin-bottom: 1%;
}
</style>
