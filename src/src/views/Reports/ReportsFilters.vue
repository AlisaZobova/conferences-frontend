<template>
    <div>
        <v-card-subtitle class="text-center text-h6 teal--text"
            >Choose filters</v-card-subtitle
        >
        <v-card-text class="pb-0">
            <v-divider></v-divider>
            <v-menu
                ref="timeFromMenu"
                v-model="timeFromMenu"
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
                        prepend-icon="mdi-timer"
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                </template>
                <v-time-picker
                    ref="from"
                    v-model="from"
                    min="08:00"
                    :max="to ? to : '19:59'"
                    format="24hr"
                    scrollable
                    @change="
                        timeFromMenu = false
                        applyFilters()
                        setFromOnHours()
                    "
                ></v-time-picker>
            </v-menu>
            <v-menu
                ref="timeToMenu"
                v-model="timeToMenu"
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
                        prepend-icon="mdi-timer"
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                </template>
                <v-time-picker
                    ref="to"
                    v-model="to"
                    format="24hr"
                    scrollable
                    :min="from ? from : '08:01'"
                    max="20:00"
                    @change="
                        timeToMenu = false
                        applyFilters()
                        setToOnHours()
                    "
                ></v-time-picker>
            </v-menu>
            <v-range-slider
                :disabled="disabled"
                @end="(value) => (this.duration = value)"
                class="mt-4"
                color="teal"
                track-color="teal"
                label="Duration"
                step="1"
                thumb-label
                ticks
                min="1"
                max="60"
                ref="duration"
            ></v-range-slider>
            <CategoriesFilterSelect
                :clear="category.length === 0"
                :disabled="disabled"
                color="teal"
                @updateCategory="category = $event"
            />
        </v-card-text>
        <!--        <v-card-actions>-->
        <!--            <v-btn text outlined color="teal" :disabled="disabled" @click="applyFilters"-->
        <!--                >Apply</v-btn-->
        <!--            >-->
        <!--        </v-card-actions>-->
        <v-card-actions class="d-block">
            <v-btn
                text
                outlined
                color="teal"
                :disabled="disabled"
                @click="resetFilters"
                >Reset filters
            </v-btn>
        </v-card-actions>
    </div>
</template>

<script>
import CategoriesFilterSelect from '@/views/Categories/CategoriesFilterSelect'

export default {
    name: 'ReportsFilters',
    components: { CategoriesFilterSelect },
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
            this.duration = ''
            this.category = []
            this.$emit('updateFilters', this.strFilters)
            this.$emit('applyFilters')
        },

        setFromOnHours() {
            this.$nextTick(() => {
                this.$refs.from.selectingHour = true
            })
        },
        setToOnHours() {
            this.$nextTick(() => {
                this.$refs.to.selectingHour = true
            })
        },
    },
    data() {
        return {
            timeFromMenu: false,
            timeToMenu: false,
            from: '',
            to: '',
            duration: '',
            category: [],
            filters: {},
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
                this.$set(this.filters, 'from', this.from + ':00')
            }
        },
        to(newValue) {
            this.to = newValue
            if (!newValue) {
                delete this.filters['to']
            } else {
                this.$set(this.filters, 'to', this.to + ':00')
            }
        },
        duration(newValue) {
            this.duration = newValue
            if (!newValue) {
                delete this.filters['duration']
                this.$refs.duration.value = [1, 1]
            } else {
                this.$set(
                    this.filters,
                    'duration',
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
:deep(.v-btn) {
    width: 100%;
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
