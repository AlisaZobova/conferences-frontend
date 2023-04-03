<template>
    <main class="pt-4">
        <div v-show="loading" class="text-center">
            <v-progress-circular indeterminate color="primary" />
        </div>
        <div v-show="!loading && plan.name !== currentPlan">
            <div class="mb-4">
                <b>Total:</b>&nbsp;{{ !loading ? formatCurrency() : '' }}
            </div>
            <v-divider />
            <div
                v-show="changeCard"
                id="card-element"
                class="pa-8 mt-4 grey lighten-4"
            />
            <div v-show="!changeCard" class="mt-4 grey lighten-4 card-number">
                **** **** **** {{ card }}
            </div>
            <v-slide-x-transition>
                <v-btn
                    v-if="card"
                    class="mt-4 mr-4"
                    outlined
                    color="success"
                    :disabled="paymentProcessing"
                    @click="changeCard = !changeCard"
                >
                    {{ changeCard ? 'Use an existing card' : 'Use new card' }}
                </v-btn>
            </v-slide-x-transition>
            <v-btn
                outlined
                color="primary"
                @click="processPayment"
                class="mt-4"
                :disabled="paymentProcessing"
                v-text="paymentProcessing ? 'Processing' : 'Confirm and Pay'"
            />
        </div>
        <div
            v-show="!loading && plan.name === currentPlan"
            class="text-center mt-4"
        >
            <p>
                Your plan has been successfully updated to {{ currentPlan }}!
                Click the button below to go to the main page.
            </p>
            <v-btn outlined color="primary" :to="{ name: 'Conferences' }">
                Go home
            </v-btn>
        </div>
        <v-snackbar
            v-model="successSubscription"
            timeout="10000"
            color="success"
            :text="true"
            right
            bottom
        >
            Payment was successful. You've been upgraded to a new plan!
            <template v-slot:action="{ attrs }">
                <v-btn
                    color="grey"
                    text
                    v-bind="attrs"
                    @click="successSubscription = false"
                >
                    Close
                </v-btn>
            </template>
        </v-snackbar>
        <v-snackbar
            v-model="errorSubscription"
            timeout="10000"
            color="error"
            :text="true"
            right
            bottom
        >
            An error occurred while updating the subscription.
            {{ errorMessage }} Please try again later.
            <template v-slot:action="{ attrs }">
                <v-btn
                    color="error"
                    text
                    v-bind="attrs"
                    @click="errorSubscription = false"
                >
                    Close
                </v-btn>
            </template>
        </v-snackbar>
    </main>
</template>

<script>
import { loadStripe } from '@stripe/stripe-js'
import { mapActions } from 'vuex'

export default {
    name: 'StripeCheckout',
    computed: {
        plan() {
            return this.$store.state.stripe.plan
        },
        card() {
            return this.$store.state.auth.user.pm_last_four
        },
        currentPlan() {
            return this.$store.state.auth.user.active_subscription.name
        },
    },
    data() {
        return {
            loading: true,
            stripe: {},
            cardElement: {},
            paymentProcessing: false,
            successSubscription: false,
            errorSubscription: false,
            changeCard: true,
            errorMessage: '',
        }
    },
    methods: {
        ...mapActions(['subscribeUser', 'getPlan']),

        async processPayment() {
            if (!this.changeCard) {
                this.paymentProcessing = true

                this.subscribeUser({
                    paymentMethodId: null,
                    plan: this.plan,
                })
                    .then(() => {
                        this.paymentProcessing = false
                        this.successSubscription = true
                    })
                    .catch((error) => {
                        this.paymentProcessing = false
                        this.errorMessage = error.response.data.message
                        this.errorSubscription = true
                    })
            } else {
                const { paymentMethod, error } =
                    await this.stripe.createPaymentMethod(
                        'card',
                        this.cardElement
                    )

                if (!error) {
                    this.paymentProcessing = true
                    this.subscribeUser({
                        paymentMethodId: paymentMethod.id,
                        plan: this.plan,
                    })
                        .then(() => {
                            this.paymentProcessing = false
                            this.successSubscription = true
                        })
                        .catch((error) => {
                            this.paymentProcessing = false
                            this.errorMessage = error.response.data.message
                            this.errorSubscription = true
                        })
                }
            }
        },
        formatCurrency() {
            return this.plan.price.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            })
        },
    },
    async mounted() {
        this.stripe = await loadStripe(process.env.VUE_APP_STRIPE_KEY)

        const elements = this.stripe.elements({
            locale: 'en',
        })
        this.cardElement = elements.create('card')

        this.cardElement.mount('#card-element')
    },
    created() {
        this.getPlan(this.$route.params.id).then(() => (this.loading = false))
    },
}
</script>

<style scoped>
.card-number {
    font-size: 14px;
    padding: 30px 32px;
    color: grey;
}
</style>
