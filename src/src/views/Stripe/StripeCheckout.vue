<template>
    <main class="pt-4">
        <div v-show="loading" class="text-center">
            <v-progress-circular indeterminate color="primary" />
        </div>
        <div v-show="!loading">
            <div class="mb-4"><b>Total:</b>&nbsp;{{ formatCurrency() }}</div>
            <v-divider />
            <div id="card-element" class="pa-8 mt-4 grey lighten-4"></div>
            <v-btn
                outlined
                color="primary"
                @click="processPayment"
                class="mt-4"
                :disabled="paymentProcessing"
                v-text="paymentProcessing ? 'Processing' : 'Pay now'"
            ></v-btn>
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
            timeout="5000"
            color="error"
            :text="true"
            right
            bottom
        >
            An error occurred while updating the subscription. Please try again
            later.
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
    },
    data() {
        return {
            loading: true,
            stripe: {},
            cardElement: {},
            paymentProcessing: false,
            successSubscription: false,
            errorSubscription: false,
        }
    },
    methods: {
        ...mapActions(['subscribeUser', 'getPlan']),

        async processPayment() {
            this.paymentProcessing = true

            const { paymentMethod, error } =
                await this.stripe.createPaymentMethod('card', this.cardElement)

            if (error) {
                this.paymentProcessing = false
                alert(error)
            } else {
                this.subscribeUser({
                    paymentMethodId: paymentMethod.id,
                    plan: this.plan,
                })
                    .then(() => {
                        this.paymentProcessing = false
                        this.successSubscription = true
                    })
                    .catch(() => {
                        this.paymentProcessing = false
                        this.errorSubscription = true
                    })
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

<style scoped></style>
