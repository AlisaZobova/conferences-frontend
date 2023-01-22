import Vue from 'vue'
import VueRouter from 'vue-router'
import store from "@/store";
import AuthRegister from '../views/Auth/AuthRegister'
import AuthLogin from '../views/Auth/AuthLogin'
import ConferencesIndex from '../views/Conferences/ConferencesIndex'
import ShowConference from "../views/Conferences/ShowConference";
import EditConference from "../views/Conferences/EditConference";
import CreateConference from "@/views/Conferences/CreateConference";

Vue.use(VueRouter)
const routes = [
  {
    path: '/',
    name: "Home",
    component: ConferencesIndex
  },
  {
    path: '/conferences',
    name: "Conferences",
    component: ConferencesIndex
  },
  {
    path: '/conferences/create',
    name: "CreateConference",
    component: CreateConference,
    meta: {requiresCreatePermissions: true},
  },
  {
    path: '/conferences/:id',
    name: "ShowConference",
    component: ShowConference,
    meta: {requiresAuth: true},
  },
  {
    path: '/conferences/:id/edit',
    name: "EditConference",
    component: EditConference,
    meta: {requiresEditPermissions: true},
  },
  {
    path: '/register',
    name: "Register",
    component: AuthRegister,
    meta: { guest: true },
  },
  {
    path: '/login',
    name: "Login",
    component: AuthLogin,
    meta: { guest: true },
  }
]
const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if(to.matched.some(record => record.meta.requiresAuth)) {
    if (store.getters.isAuthenticated) {
      next()
      return
    }
    next('/login')
  } else {
    next()
  }
})

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.guest)) {
    if (store.getters.isAuthenticated) {
      next("/conferences");
      return;
    }
    next();
  } else {
    next();
  }
});

export default router
