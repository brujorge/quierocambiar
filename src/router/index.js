import Vue from 'vue'
import Router from 'vue-router'
import firebase from 'firebase'
Vue.use(Router)

const routerOptions = [
  {path: '/signin', name: 'sign-in', component: 'SignIn'},
  {path: '/signup', name: 'sign-up', component: 'SignUp'},
  {path: '/', name: 'Dashboard', component: 'Dashboard'},
]

const routes = routerOptions.map(route => {
  return {
    ...route,
    component: () => import(`@/components/${route.component}.vue`)
  }
})

const router = new Router({
  mode: 'history',
  routes
})

export default router