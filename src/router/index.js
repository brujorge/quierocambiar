import Vue from 'vue'
import Router from 'vue-router'
import firebase from 'firebase'
Vue.use(Router)

const routerOptions = [
  {path: '/signin', name: 'sign-in', component: 'SignIn',},
  {path: '/about', name: 'about', component: 'About',},
  {path: '/contact', name: 'contact', component: 'Contact',},
  {path: '/signup', name: 'sign-up', component: 'SignUp'},
  {path: '/', name: 'Dashboard', component: 'Dashboard', meta:{requiresAuth:true}},
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

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = firebase.auth().currentUser 
  if(requiresAuth && !isAuthenticated){
    next('/signin')
  }else {
    next()
  }
})

export default router