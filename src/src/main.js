import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import store from './store'
import axios from 'axios';

import 'vue-phone-number-input/dist/vue-phone-number-input.css';
import VuePhoneNumberInput from 'vue-phone-number-input';

import * as VueGoogleMaps from 'vue2-google-maps'

Vue.component('vue-phone-number-input', VuePhoneNumberInput);

Vue.use(VueGoogleMaps, {
  load: {
    libraries: 'places',
  },
})

axios.defaults.withCredentials = true
axios.defaults.baseURL = process.env.VUE_APP_AXIOS_BASE_URL;
axios.defaults.headers.common['Accept'] =`application/json`;

axios.interceptors.response.use(undefined, function (error) {
  if (error) {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      store.dispatch('LogOut').then(() => router.push('/login'))
    }
  }
})

Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
