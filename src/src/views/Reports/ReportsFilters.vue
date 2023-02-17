<template>
    <v-card class="d-inline-block mt-3">
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
                        v-model="timeStart"
                        label="From"
                        persistent-hint
                        prepend-icon="mdi-timer"
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                </template>
                <v-time-picker
                    v-model="timeStart"
                    min="08:00"
                    max="19:59"
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
                        class="mt-0"
                        v-model="timeEnd"
                        label="To"
                        persistent-hint
                        prepend-icon="mdi-timer"
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                </template>
                <v-time-picker
                    v-model="timeEnd"
                    format="24hr"
                    scrollable
                    @input="menu2 = false"
                ></v-time-picker>
            </v-menu>
            <v-slider
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
            <CategoriesFilterSelect />
        </v-card-text>
        <v-card-actions>
            <v-btn text outlined color="teal">Apply</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
import CategoriesFilterSelect from '@/views/Categories/CategoriesFilterSelect'
export default {
    name: 'ReportsFilters',
    components: { CategoriesFilterSelect },
    data() {
        return {
            menu1: false,
            menu2: false,
            timeStart: '',
            timeEnd: '',
        }
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
.v-card {
    width: 25%;
}
</style>
