<template>
    <v-main class="pt-4">
        <div v-if="loading" class="text-center">
            <v-progress-circular indeterminate color="primary" />
        </div>
        <div v-else>
            <v-container fluid>
                <v-row>
                    <v-col
                        v-for="plan in plans"
                        :key="plan.id"
                        class="d-flex"
                        style="flex-direction: column"
                        cols="12"
                        sm="6"
                        md="3"
                    >
                        <v-card
                            height="250"
                            :class="
                                currentPlan === plan.name
                                    ? 'text-center success lighten-5'
                                    : 'text-center grey lighten-5'
                            "
                        >
                            <v-card-title class="primary--text justify-center">
                                {{ plan.name.toUpperCase() }}
                            </v-card-title>

                            <v-card-subtitle class="mt-2 pb-0">
                                {{ plan.description }}<br /><br />
                                <span v-if="plan.price > 0" class="text-h5">
                                    {{ formatCurrency(plan.price) }} / month
                                    <br /><br />
                                </span>
                            </v-card-subtitle>

                            <v-card-actions
                                v-if="
                                    plan.price > 0 && currentPlan !== plan.name
                                "
                                class="justify-center"
                            >
                                <v-btn
                                    outlined
                                    color="primary"
                                    :to="{
                                        name: 'Checkout',
                                        params: { id: plan.id },
                                    }"
                                >
                                    Upgrade
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </div>
    </v-main>
</template>

<script>
import { mapActions } from 'vuex'

export default {
    name: 'StripePlans',
    computed: {
        plans() {
            return this.$store.state.stripe.plans
        },
        currentPlan() {
            return this.$store.state.auth.user.active_subscription.name
        },
    },
    data() {
        return {
            loading: true,
        }
    },
    methods: {
        ...mapActions(['getPlans']),
        formatCurrency(price) {
            return price.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            })
        },
    },
    created() {
        this.getPlans().then(() => (this.loading = false))
    },
}
</script>

<style scoped></style>
