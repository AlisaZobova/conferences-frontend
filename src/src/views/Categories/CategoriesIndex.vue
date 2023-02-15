<template>
    <v-main>
        <div v-if="loading" class="text-center">
            <v-progress-circular
                indeterminate
                color="primary"
            ></v-progress-circular>
        </div>
        <div v-else>
            <v-layout class="justify-start align-start">
                <v-btn :to="{ name: 'CreateCategory' }" color="primary"
                    >Create Category</v-btn
                >
            </v-layout>
            <v-layout
                class="justify-center align-center mt-4 blue lighten-5 rounded"
            >
                <v-treeview :items="categories" activatable hoverable>
                    <template #label="{ item }">
                        <router-link
                            class="d-block text-decoration-none"
                            :to="{
                                name: 'ShowCategory',
                                params: { id: item.id },
                            }"
                        >
                            {{ item.name }}
                        </router-link>
                    </template>
                </v-treeview>
            </v-layout>
        </div>
    </v-main>
</template>

<script>
import { mapActions } from 'vuex'

export default {
    name: 'CategoriesIndex',
    computed: {
        categories() {
            return this.$store.state.categories.categories.filter(
                (category) => !category.parents
            )
        },
    },
    data() {
        return {
            loading: true,
        }
    },
    methods: {
        ...mapActions(['GetCategories']),
    },
    created() {
        this.GetCategories().then(() => (this.loading = false))
    },
}
</script>

<style scoped>
:deep(.v-treeview) {
    width: 100%;
}
</style>
