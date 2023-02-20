<template>
    <v-card class="filters d-inline-block mt-3">
        <v-card-subtitle class="text-center text-h6 primary--text"
            >Choose filters</v-card-subtitle
        >
        <v-card-text class="pb-0">
            <v-divider></v-divider>
            <v-menu
                ref="menu1"
                v-model="menu1"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="auto"
            >
                <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        :disabled="$props.disabled"
                        v-model="from"
                        label="From"
                        persistent-hint
                        prepend-icon="mdi-calendar"
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                </template>
                <v-date-picker
                    v-model="from"
                    :max="to ? to : ''"
                    no-title
                    @input="menu1 = false"
                ></v-date-picker>
            </v-menu>
            <v-menu
                ref="menu2"
                v-model="menu2"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="auto"
            >
                <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        :disabled="$props.disabled"
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
                    @input="menu2 = false"
                ></v-date-picker>
            </v-menu>
            <v-range-slider
                :disabled="$props.disabled"
                @change="(value) => (this.reports = value)"
                class="mt-4"
                label="Reports"
                step="1"
                thumb-label
                ticks
                min="1"
            ></v-range-slider>
            <CategoriesFilterSelect
                :clear="category.length === 0"
                :disabled="$props.disabled"
                @updateCategory="category = $event"
            />
        </v-card-text>
        <!--        <v-card-actions>-->
        <!--            <v-btn-->
        <!--                :disabled="$props.disabled"-->
        <!--                text-->
        <!--                outlined-->
        <!--                color="primary"-->
        <!--                class="apply"-->
        <!--                @click="applyFilters"-->
        <!--                >Apply</v-btn-->
        <!--            >-->
        <!--        </v-card-actions>-->
        <v-card-actions>
            <v-btn
                :disabled="$props.disabled"
                text
                outlined
                color="primary"
                class="reset"
                @click="resetFilters"
                >Reset filters</v-btn
            >
        </v-card-actions>
    </v-card>
</template>

<script>
import CategoriesFilterSelect from '@/views/Categories/CategoriesFilterSelect'
export default {
    name: 'ConferencesFilters',
    components: { CategoriesFilterSelect },
    props: {
        disabled: Boolean,
    },
    methods: {
        applyFilters() {
            this.setStrFilters()
            this.$emit('updateFilters', this.strFilters)
            this.$emit('applyFilters')
        },
        resetFilters() {
            this.filters = {}
            this.from = ''
            this.to = ''
            this.reports = ''
            this.category = []
            this.setStrFilters()
            this.$emit('updateFilters', this.strFilters)
            this.$emit('applyFilters')
        },
        setStrFilters() {
            if (Object.keys(this.filters).length === 0) {
                this.strFilters = ''
            } else {
                this.strFilters = '&'
                for (const [key, value] of Object.entries(this.filters)) {
                    this.strFilters = this.strFilters + key + '=' + value + '&'
                }
                this.strFilters = this.strFilters.slice(0, -1)
            }
        },
    },
    data() {
        return {
            menu1: false,
            menu2: false,
            from: '',
            to: '',
            reports: '',
            category: [],
            filters: {},
            strFilters: '',
        }
    },
    watch: {
        from(newValue) {
            this.from = newValue
            if (!newValue) {
                delete this.filters['from']
            } else {
                this.filters['from'] = this.from
            }
            this.applyFilters()
        },
        to(newValue) {
            this.to = newValue
            if (!newValue) {
                delete this.filters['to']
            } else {
                this.filters['to'] = this.to
            }
            this.applyFilters()
        },
        reports(newValue) {
            this.reports = newValue
            if (!newValue) {
                delete this.filters['reports']
            } else {
                this.filters['reports'] = `${newValue[0]}-${newValue[1]}`
            }
            this.applyFilters()
        },
        category(newValue) {
            this.category = newValue
            if (!newValue) {
                delete this.filters['category']
            } else {
                this.filters['category'] = this.category.toString()
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

.v-btn.reset {
    width: 100%;
}
.v-card.filters {
    width: 25%;
}
</style>
