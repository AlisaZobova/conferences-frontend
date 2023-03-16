import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'
import AuthRegister from '@/views/Auth/AuthRegister'
import AuthLogin from '@/views/Auth/AuthLogin'
import ConferencesIndex from '@/views/Conferences/ConferencesIndex'
import ShowConference from '@/views/Conferences/ShowConference'
import EditConference from '@/views/Conferences/EditConference'
import CreateConference from '@/views/Conferences/CreateConference'
import ReportsIndex from '@/views/Reports/ReportsIndex'
import ShowReport from '@/views/Reports/ShowReport'
import EditReport from '@/views/Reports/EditReport'
import CreateReport from '@/views/Reports/CreateReport'
import ForbiddenError from '@/views/Errors/ForbiddenError'
import NotFoundError from '@/views/Errors/NotFoundError'
import EditProfile from '@/views/Auth/EditProfile'
import ReportsFavorites from '@/views/Reports/ReportsFavorites'

Vue.use(VueRouter)
const routes = [
    {
        path: '/',
        name: 'Home',
        component: ConferencesIndex,
    },
    {
        path: '/conferences',
        name: 'Conferences',
        component: ConferencesIndex,
    },
    {
        path: '/conferences/create',
        name: 'CreateConference',
        component: CreateConference,
        meta: { requiresCreatePermissions: true },
    },
    {
        path: '/conferences/:id',
        name: 'ShowConference',
        component: ShowConference,
        meta: { requiresAuth: true },
    },
    {
        path: '/conferences/:id/edit',
        name: 'EditConference',
        component: EditConference,
        meta: { requiresEditPermissions: true },
    },
    {
        path: '/conferences/:id/reports/create',
        name: 'CreateReport',
        component: CreateReport,
        meta: {
            requiresAuth: true,
            requiresPublishPermissions: true,
        },
    },
    {
        path: '/reports',
        name: 'Reports',
        component: ReportsIndex,
        meta: { requiresAuth: true },
    },
    {
        path: '/reports/favorites',
        name: 'Favorites',
        component: ReportsFavorites,
        meta: { requiresAuth: true },
    },
    {
        path: '/reports/:id',
        name: 'ShowReport',
        component: ShowReport,
        meta: { requiresAuth: true },
    },
    {
        path: '/reports/:id/edit',
        name: 'EditReport',
        component: EditReport,
        meta: {
            requiresAuth: true,
            requiresEditPublishPermissions: true,
        },
    },
    {
        path: '/register',
        name: 'Register',
        component: AuthRegister,
        meta: { guest: true },
    },
    {
        path: '/login',
        name: 'Login',
        component: AuthLogin,
        meta: { guest: true },
    },
    {
        path: '/profile',
        name: 'Profile',
        component: EditProfile,
        meta: { requiresAuth: true },
    },
    {
        path: '/403',
        name: 'Forbidden',
        component: ForbiddenError,
    },
    {
        path: '*',
        name: 'Not Found',
        component: NotFoundError,
    },
]
const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
})

router.beforeEach((to, from, next) => {
    if (to.matched.some((record) => record.meta.requiresAuth)) {
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
            next('/conferences')
            return
        }
        next()
    } else {
        next()
    }
})

router.beforeEach((to, from, next) => {
    if (to.matched.some((record) => record.meta.requiresEditPermissions)) {
        if (
            store.getters.isAuthenticated &&
            store.getters.isCreator(to.params.id) &&
            store.getters.isAnnouncer
        ) {
            next()
            return
        }
        next('/403')
    } else {
        next()
    }
})

router.beforeEach((to, from, next) => {
    if (to.matched.some((record) => record.meta.requiresCreatePermissions)) {
        if (store.getters.isAuthenticated && store.getters.isAnnouncer) {
            next()
            return
        }
        next('/403')
    } else {
        next()
    }
})

router.beforeEach((to, from, next) => {
    if (
        to.matched.some((record) => record.meta.requiresEditPublishPermissions)
    ) {
        store.dispatch('GetReport', to.params.id).then(() => {
            if (
                store.state.reports.report.user.id ===
                    store.state.auth.user.id &&
                store.getters.isAnnouncer
            ) {
                next()
                return
            }
            next('/403')
        })
    } else {
        next()
    }
})

router.beforeEach((to, from, next) => {
    if (to.matched.some((record) => record.meta.requiresPublishPermissions)) {
        if (store.getters.isAnnouncer) {
            next()
            return
        }
        next('/403')
    } else {
        next()
    }
})

export default router
