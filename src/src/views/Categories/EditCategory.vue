<template>
    <div v-if="loading" class="text-center">
        <v-progress-circular
            indeterminate
            color="primary"
        ></v-progress-circular>
    </div>
    <div v-else>
        <v-layout class="mt-6" align-center justify-center>
            <v-form @submit.prevent="submit" v-model="isFormValid">
                <v-text-field
                    v-if="currentCategory"
                    readonly
                    label="Parent category"
                    v-model="currentCategory.name"
                ></v-text-field>
                <p>
                    Select parent category or
                    <a
                        @click="
                            currentCategory = null
                            parentCategory = []
                        "
                        >clean active category</a
                    >:
                </p>
                <v-treeview
                    activatable
                    hoverable
                    :active="parentCategory"
                    :items="rootCategories"
                    @update:active="getActiveValue"
                ></v-treeview>

                <v-text-field
                    v-model="category.name"
                    type="text"
                    name="name"
                    label="Name"
                    :rules="[rules.required]"
                    :error-messages="apiError"
                    @click="apiError = ''"
                    class="mt-4"
                ></v-text-field>

                <v-btn outlined class="mr-2 mt-2" color="grey" @click="goBack"
                    >Back</v-btn
                >

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
    </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
    name: 'EditCategory',
    data() {
        return {
            loading: true,
            rules: {
                required: (value) => !!value || 'Required.',
            },
            isFormValid: false,
            apiError: '',
            parentCategory: [],
            currentCategory: null,
        }
    },
    computed: {
        categories() {
            return this.$store.state.categories.categories
        },
        rootCategories() {
            return this.categories.filter((category) => !category.parents)
        },
        category() {
            return this.$store.state.categories.category
        },
    },
    methods: {
        ...mapActions(['GetCategories', 'GetCategory', 'UpdateCategory']),
        goBack() {
            this.$router.go(-1)
        },
        async submit() {
            if (this.parentCategory.length > 0) {
                this.category.ancestor_id = this.parentCategory[0]
            }
            this.UpdateCategory({
                form: this.category,
                categoryId: this.category.id,
            })
                .then(() => this.$router.push({ name: 'Categories' }))
                .catch(
                    () => (this.apiError = 'This category name already exists')
                )
        },
        getActiveValue(value) {
            this.parentCategory = value
            this.currentCategory = this.categories.filter(
                (category) => category.id === value[0]
            )[0]
        },
    },
    created() {
        this.GetCategories()
            .then(() => this.GetCategory(this.$route.params.id))
            .then(() => {
                this.parentCategory.push(this.category.ancestor_id)
                this.currentCategory = this.category.parent
                this.name = this.category.parent
                    ? this.category.parent.name
                    : ''
                this.loading = false
            })
    },
}
</script>

<style scoped>
form {
    width: 75%;
}
:deep(.v-treeview) {
    width: 100%;
    height: 100%;
    border: 1px rgb(133, 133, 133) solid;
}
</style>
