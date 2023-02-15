<template>
    <v-main>
        <div v-if="loading" class="text-center">
            <v-progress-circular
                indeterminate
                color="primary"
            ></v-progress-circular>
        </div>
        <div v-else>
            <v-card class="flex-grow-1">
                <v-card-title class="teal--text">
                    {{ category.name }}
                </v-card-title>

                <v-card-subtitle class="mt-2">
                    <b>Conferences:</b> {{ category.conferences.length }}
                    <br />
                    <b>Reports:</b> {{ category.reports.length }} <br />
                </v-card-subtitle>

                <v-card-actions>
                    <v-btn
                        outlined
                        class="ml-2 mr-2 mb-2"
                        color="grey"
                        @click="goBack"
                        >Back</v-btn
                    >
                    <v-btn
                        outlined
                        class="mr-2 mb-2"
                        color="primary"
                        :to="{ name: 'EditCategory' }"
                        >Edit</v-btn
                    >
                    <v-dialog v-model="dialog" width="500">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                color="error"
                                outlined
                                v-bind="attrs"
                                v-on="on"
                                class="mb-2 ml-2"
                            >
                                Delete
                            </v-btn>
                        </template>

                        <v-card>
                            <v-card-title class="text-h6 text-center"
                                >Are you sure you want to delete this category?
                            </v-card-title>

                            <v-divider></v-divider>

                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                    color="blue darken-1"
                                    text
                                    @click="dialog = false"
                                    >Cancel
                                </v-btn>
                                <v-btn
                                    color="blue darken-1"
                                    text
                                    @click="deleteCategory"
                                    >OK
                                </v-btn>
                                <v-spacer></v-spacer>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-card-actions>
            </v-card>
        </div>
    </v-main>
</template>

<script>
import { mapActions } from 'vuex'

export default {
    name: 'ShowCategory',
    computed: {
        category() {
            return this.$store.state.categories.category
        },
    },
    data() {
        return {
            loading: true,
            dialog: false,
        }
    },
    methods: {
        ...mapActions(['GetCategory', 'DeleteCategory']),
        goBack() {
            this.$router.go(-1)
        },
        deleteCategory() {
            this.loading = true
            this.DeleteCategory(this.category.id).then(() =>
                this.$router.push({ name: 'Categories' })
            )
        },
    },
    created() {
        this.GetCategory(this.$route.params.id).then(
            () => (this.loading = false)
        )
    },
}
</script>

<style scoped>
:deep(.v-treeview) {
    width: 95%;
}
</style>
