// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import Vuetify from 'vuetify'
import router from './router'
import store from './store'
import firebase from 'firebase'
import 'vuetify/dist/vuetify.min.css'

Vue.config.productionTip = false

Vue.use(Vuetify)
/* eslint-disable no-new */
const unsubscribe = firebase.auth()
.onAuthStateChanged(firebaseUser => {
  new Vue({
    el: '#app',
    store,
    router,
    components: { App },
    template: '<App/>',
    created(){
      if(firebaseUser){
        store.dispatch('autoSignIn', firebaseUser)
      }
    }
  })
  unsubscribe()
})
