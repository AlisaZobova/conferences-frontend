import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import store from './store'
import axios from 'axios';
import Cookies from 'js-cookie';

import VueTelInput from 'vue-tel-input'
import 'vue-tel-input/dist/vue-tel-input.css';

Vue.use(VueTelInput)

import * as VueGoogleMaps from 'vue2-google-maps'

Vue.use(VueGoogleMaps, {
  load: {
    libraries: 'places',
  },
})

axios.defaults.withCredentials = true
axios.defaults.baseURL = process.env.VUE_APP_AXIOS_BASE_URL;
axios.defaults.headers.common['Accept'] =`application/json`;

axios.interceptors.response.use(function (response) {
    return response
}, async function (error) {
    if (error.response) {
        if (error.response.status === 401) {
            setCSRFToken();
            store.state.auth.user = null;
            return router.push('/login');
        }}
    if (error.response.status === 404) {
        return router.push('/404').catch(() => {});
    }
    return Promise.reject(error)
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
