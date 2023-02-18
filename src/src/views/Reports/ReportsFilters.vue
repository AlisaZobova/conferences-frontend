<template>
    <v-card class="filters d-inline-block mt-3">
        <v-card-subtitle class="text-center text-h6 teal--text"
            >Choose filters <v-icon>mdi-filter</v-icon></v-card-subtitle
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
                        prepend-icon="mdi-timer"
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                </template>
                <v-time-picker
                    v-model="from"
                    min="08:00"
                    :max="to ? to : '19:59'"
                    format="24hr"
                    scrollable
                    @input="menu1 = false"
                ></v-time-picker>
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
                        prepend-icon="mdi-timer"
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                </template>
                <v-time-picker
                    v-model="to"
                    format="24hr"
                    scrollable
                    :min="from ? from : '08:01'"
                    max="20:00"
                    @input="menu2 = false"
                ></v-time-picker>
            </v-menu>
            <v-slider
                :disabled="$props.disabled"
                @change="(value) => (this.duration = value)"
                class="mt-4"
                color="teal"
                track-color="teal"
                label="Duration"
                step="1"
                thumb-label
                ticks
                min="1"
                max="60"
            ></v-slider>
            <CategoriesFilterSelect
                :disabled="$props.disabled"
                color="teal"
                @updateCategory="category = $event"
            />
        </v-card-text>
        <v-card-actions>
            <v-btn text outlined color="teal" @click="applyFilters"
                >Apply</v-btn
            >
        </v-card-actions>
    </v-card>
</template>

<script>
import CategoriesFilterSelect from '@/views/Categories/CategoriesFilterSelect'
export default {
    name: 'ReportsFilters',
    components: { CategoriesFilterSelect },
    methods: {
        applyFilters() {
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
            duration: '',
            category: [],
            filters: {},
            strFilters: '',
        }
    },
    props: {
        disabled: Boolean,
    },
    watch: {
        from(newValue) {
            this.from = newValue
            if (!newValue) {
                delete this.filters['from']
            } else {
                this.filters['from'] = this.from + ':00'
            }
            this.applyFilters()
        },
        to(newValue) {
            this.to = newValue
            if (!newValue) {
                delete this.filters['to']
            } else {
                this.filters['to'] = this.to + ':00'
            }
            this.applyFilters()
        },
        duration(newValue) {
            this.duration = newValue
            if (!newValue) {
                delete this.filters['duration']
            } else {
                this.filters['duration'] = newValue
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
:deep(.v-btn) {
    width: 100%;
}
.v-card.filters {
    width: 25%;
}

:deep(.v-picker__title) {
    height: 60px;
}

:deep(.v-picker__title__btn, .v-time-picker-title__time) {
    height: 28px;
    font-size: 28px;
}

:deep(.v-time-picker-title__time span) {
    height: 28px;
    font-size: 28px;
}
</style>
