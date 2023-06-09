<template>
    <v-combobox
        :disabled="disabled || loading"
        :loading="loading"
        class="pt-0"
        :color="color"
        :items="items"
        item-text="name"
        v-model="selected"
        @change="toggle"
        label="Choose categories"
        multiple
        :menu-props="{ maxWidth: '278' }"
    >
        <template v-slot:append-item>
            <v-divider class="mt-2" />
            <v-treeview
                :items="rootCategories"
                v-model="category"
                @input="updateSelected"
                selectable
                selection-type="independent"
            />
        </template>
    </v-combobox>
</template>

<script>
import { mapActions } from 'vuex'

export default {
    name: 'CategoriesFilterSelect',
    props: {
        color: {
            type: String,
            default: 'primary',
        },
        disabled: Boolean,
        clear: Boolean,
    },
    data() {
        return {
            loading: true,
            category: [],
            items: [{ name: 'All categories' }],
            selected: [],
        }
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
            if (this.category.length === this.categoriesIds.length) {
                this.category = []
                this.selected = []
            } else {
                this.category = this.categoriesIds
                this.selected = this.categories
            }
            this.$emit('updateCategory', this.category)
        },
        updateSelected(value) {
            this.selected = this.categories.filter((category) =>
                value.includes(category.id)
            )
            this.$emit('updateCategory', this.category)
        },
    },
    watch: {
        clear(newValue) {
            if (newValue) {
                this.category = []
                this.selected = []
            }
        },
    },
    created() {
        this.GetCategories().then(() => (this.loading = false))
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

:deep(.v-select__selections) {
    max-width: 250px;
}
</style>
