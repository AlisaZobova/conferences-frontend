<template>
    <v-combobox
        :loading="loading"
        :items="items"
        item-text="name"
        v-model="selectedArray"
        @change="toggle"
        :label="label"
        multiple
    >
        <template v-slot:append-item>
            <v-divider class="mt-2"></v-divider>
            <v-treeview
                v-if="!allowSelectAll"
                :items="rootCategories"
                activatable
                hoverable
                :active="categoryArray"
                @update:active="updateSelected"
            >
            </v-treeview>
            <v-treeview
                v-if="allowSelectAll"
                :items="rootCategories"
                v-model="categoryArray"
                @input="updateSelected"
                selectable
                selection-type="independent"
            >
            </v-treeview>
        </template>
    </v-combobox>
</template>

<script>
import { mapActions } from 'vuex'

export default {
    name: 'CategoriesSelect',
    data() {
        return {
            loading: true,
            items: [],
            label: '',
            selectedArray: this.selected,
            categoryArray: this.category,
        }
    },
    props: {
        allowSelectAll: {
            type: Boolean,
            default: false,
        },
        category: Array,
        selected: Array,
    },
    computed: {
        categories() {
            return this.$store.state.categories.categories
        },
        rootCategories() {
            return this.categories.filter((category) => !category.parents)
        },
        categoriesIds() {
            return this.categories.map((category) => category.id)
        },
    },
    methods: {
        ...mapActions(['GetCategories']),
        toggle() {
            if (
                this.categoryArray.length === this.categoriesIds.length ||
                !this.$props.allowSelectAll
            ) {
                this.categoryArray = []
                this.selectedArray = []
            } else {
                this.categoryArray = this.categoriesIds
                this.selectedArray = this.categories
            }
        },
        updateSelected(value) {
            this.selectedArray = this.categories.filter((category) =>
                value.includes(category.id)
            )
        },
    },
    created() {
        this.GetCategories().then(() => {
            if (this.$props.allowSelectAll) {
                this.items = [{ name: 'All categories' }]
                this.label = 'Choose categories'
            } else {
                this.items = [{ name: 'No parent' }]
                this.label = 'Choose parent category or leave empty'
            }
            this.loading = false
        })
    },
}
</script>

<style scoped>
:deep(.v-list-item__action) {
    display: none;
}

:deep(.v-list-item--link:before) {
    background-color: white;
}

:deep(.v-list-item--link:hover) {
    background-color: #eeeeee;
}
</style>
