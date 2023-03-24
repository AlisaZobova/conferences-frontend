import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import store from './store'
import './assets/js/ApiClient'
import './assets/js/pusherConnection'
import './assets/css/main.css'

import * as VueGoogleMaps from 'vue2-google-maps'

import VueTelInput from 'vue-tel-input'
import 'vue-tel-input/dist/vue-tel-input.css'

import { TiptapVuetifyPlugin } from 'tiptap-vuetify'
import 'tiptap-vuetify/dist/main.css'

Vue.use(TiptapVuetifyPlugin, {
    vuetify,
    iconsGroup: 'mdi',
})

Vue.use(VueTelInput)

Vue.use(VueGoogleMaps, {
    load: {
        libraries: 'places',
    },
})

Vue.config.productionTip = false

new Vue({
    data() {
        return {
            planErrorSnackbar: false,
        }
    },
    vuetify,
    router,
    store,
    render: (h) => h(App),
}).$mount('#app')
