import Vue from 'vue'
import VueRouter from 'vue-router'
import store from "@/store";
import Register from '../views/Register'
import Login from '../views/Login'
import Conferences from '../views/Conferences/Conferences'
import ShowConference from "../views/Conferences/ShowConference";
import EditConference from "../views/Conferences/EditConference";
import CreateConference from "@/views/Conferences/CreateConference";
import ForbiddenError from "@/views/ForbiddenError";

Vue.use(VueRouter)
const routes = [
  {
    path: '/conferences',
    name: "Conferences",
    component: Conferences
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
    component: Register,
    meta: { guest: true },
  },
  {
    path: '/login',
    name: "Login",
    component: Login,
    meta: { guest: true },
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: ForbiddenError,
    meta: { noAccess: true },
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

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresCreatePermissions)) {
    if (store.getters.isAuthenticated && (store.getters.isAdmin || store.getters.isAnnouncer)) {
      next();
      return
    }
    next('/403');
  } else {
    next();
  }
});

export default router
