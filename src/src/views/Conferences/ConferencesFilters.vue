<template>
    <div>
        <v-card-subtitle class="text-center text-h6 primary--text"
            >Choose filters</v-card-subtitle
        >
        <v-card-text class="pb-0">
            <v-divider />
            <v-menu
                ref="dateFromMenu"
                v-model="dateFromMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="auto"
            >
                <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        :disabled="disabled"
                        v-model="from"
                        label="From"
                        persistent-hint
                        prepend-icon="mdi-calendar"
                        v-bind="attrs"
                        v-on="on"
                    />
                </template>
                <v-date-picker
                    v-model="from"
                    :max="to ? to : ''"
                    no-title
                    @input="dateFromMenu = false"
                />
            </v-menu>
            <v-menu
                ref="dateToMenu"
                v-model="dateToMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="auto"
            >
                <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        :disabled="disabled"
                        class="mt-0"
                        v-model="to"
                        label="To"
                        persistent-hint
                        prepend-icon="mdi-calendar"
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                </template>
                <v-date-picker
                    v-model="to"
                    :min="from ? from : ''"
                    no-title
                    @input="dateToMenu = false"
                />
            </v-menu>
            <v-range-slider
                :disabled="disabled"
                @end="(value) => (this.reports = value)"
                class="mt-4"
                label="Reports"
                step="1"
                thumb-label
                ticks
                min="1"
                ref="reports"
            />
            <CategoriesFilterSelect
                :clear="category.length === 0"
                :disabled="disabled"
                @updateCategory="category = $event"
            />
        </v-card-text>
        <!--        <v-card-actions>-->
        <!--            <v-btn-->
        <!--                :disabled="disabled"-->
        <!--                text-->
        <!--                outlined-->
        <!--                color="primary"-->
        <!--                class="apply"-->
        <!--                @click="applyFilters"-->
        <!--                >Apply</v-btn-->
        <!--            >-->
        <!--        </v-card-actions>-->
        <v-card-actions class="d-block">
            <v-btn
                :disabled="disabled"
                text
                outlined
                color="primary"
                class="filters-actions"
                @click="resetFilters"
                >Reset filters</v-btn
            >
        </v-card-actions>
    </div>
</template>

<script>
import CategoriesFilterSelect from '@/views/Categories/CategoriesFilterSelect'

export default {
    name: 'ConferencesFilters',
    components: { CategoriesFilterSelect },
    props: {
        disabled: Boolean,
    },
    computed: {
        strFilters() {
            if (Object.keys(this.filters).length === 0) {
                return ''
            } else {
                let filters = '&'
                for (const [key, value] of Object.entries(this.filters)) {
                    filters = filters + key + '=' + value + '&'
                }
                return filters.slice(0, -1)
            }
        },
    },
    methods: {
        applyFilters() {
            this.$emit('updateFilters', this.strFilters)
            this.$emit('applyFilters')
        },
        resetFilters() {
            this.filters = {}
            this.from = ''
            this.to = ''
            this.reports = ''
            this.category = []
            this.$emit('updateFilters', this.strFilters)
            this.$emit('applyFilters')
        },
    },
    data() {
        return {
            dateFromMenu: false,
            dateToMenu: false,
            from: '',
            to: '',
            reports: '',
            category: [],
            filters: {},
        }
    },
    watch: {
        from(newValue) {
            this.from = newValue
            if (!newValue) {
                delete this.filters['from']
            } else {
                this.$set(this.filters, 'from', this.from)
            }
            this.applyFilters()
        },
        to(newValue) {
            this.to = newValue
            if (!newValue) {
                delete this.filters['to']
            } else {
                this.$set(this.filters, 'to', this.to)
            }
            this.applyFilters()
        },
        reports(newValue) {
            this.reports = newValue
            if (!newValue) {
                delete this.filters['reports']
                this.$refs.reports.value = [1, 1]
            } else {
                this.$set(
                    this.filters,
                    'reports',
                    `${newValue[0]}-${newValue[1]}`
                )
            }
            this.applyFilters()
        },
        category(newValue) {
            this.category = newValue
            if (newValue.length === 0) {
                delete this.filters['category']
            } else {
                this.$set(this.filters, 'category', this.category.toString())
            }
            this.applyFilters()
        },
    },
}
</script>

<style scoped>
:deep(.v-slider) {
    margin-right: 0;
}
/*.v-btn.apply {*/
/*    width: 100%;*/
/*}*/

.v-btn.filters-actions {
    width: 100%;
}
</style>
