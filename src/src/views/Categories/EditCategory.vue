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
                <v-combobox
                    v-model="name"
                    :items="categories"
                    label="Choose parent category or leave empty"
                >
                    <template v-slot:item="{ item }">
                        <v-treeview
                            v-model="parentCategory"
                            item-text="name"
                            item-value="id"
                            selection-type="independent"
                            allow-select-parents
                            hoverable
                            :items="item"
                        >
                            <template #label="{ item }">
                                <a
                                    class="d-block text-decoration-none black--text"
                                    @click.stop="parseInfo(item)"
                                >
                                    {{ item.name }}
                                </a>
                            </template>
                        </v-treeview>
                    </template>
                </v-combobox>

                <v-text-field
                    v-model="category.name"
                    type="text"
                    name="name"
                    label="Name"
                    :rules="[rules.required]"
                    :error-messages="apiError"
                    @click="apiError = ''"
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
            name: '',
        }
    },
    computed: {
        categories() {
            let categories = this.$store.state.categories.categories.filter(
                (category) => !category.parents
            )
            for (let i in categories) {
                categories[i] = [categories[i]]
            }
            return categories
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
        parseInfo(item) {
            this.parentCategory = [item.id]
            this.name = item.name
        },
    },
    created() {
        this.GetCategories()
            .then(() => this.GetCategory(this.$route.params.id))
            .then(() => {
                this.parentCategory.push(this.category.ancestor_id)
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
}

:deep(.v-list-item) {
    padding: 0;
}
</style>
