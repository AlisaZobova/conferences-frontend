import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import store from './store'
import axios from 'axios';

import 'vue-phone-number-input/dist/vue-phone-number-input.css';
import VuePhoneNumberInput from 'vue-phone-number-input';

Vue.component('vue-phone-number-input', VuePhoneNumberInput);

axios.defaults.withCredentials = true
axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.headers.common['Accept'] =`application/json`;

Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
