import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import store from './store'
import axios from 'axios';
import Cookies from 'js-cookie';

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
        if (error.response.status === 401) {
            store.dispatch('LogOut').then(() => router.push('/login'))
        }
    }
})

const onRequest = (config) => {
  if ((
          config.method === 'post' ||
          config.method === 'put' ||
          config.method === 'delete'
      ) &&
      !Cookies.get('XSRF-TOKEN')) {
    return setCSRFToken().then(() => { return config });
  }
  return config;
}

const setCSRFToken = () => {
  return axios.get('/sanctum/csrf-cookie');
}

axios.interceptors.request.use(onRequest, null);

Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
