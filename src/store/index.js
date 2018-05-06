import config from '../config'
import Vue from 'vue'
import Vuex from 'vuex'
import firebase from 'firebase'
import router from '@/router'
import 'firebase/firestore'
firebase.initializeApp(config)

Vue.use(Vuex)
const state = {
  db: firebase.firestore(),
  currentUser: null,
  loading: null,
  error: null,
  ubicacion: null,
  cambistas: []
}
const mutations = {
  SET_USER(state, payload){
    state.currentUser = payload
  },
  SET_ERROR(state, payload){
    state.error = payload
  },
  SET_LOADING(state, payload){
    state.loading = payload
  },
  SET_UBICACION(state, payload){
    state.ubicacion = payload
  },
  SET_CAMBISTAS(state, payload){
    state.cambistas = payload
  }
}
const actions = {
  userSignIn({commit, rootState},payload){
    commit('SET_LOADING', true)
    firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
    .then(firebaseUser => {
      commit('SET_USER',{email: firebaseUser.email, uid:firebaseUser.uid})
      router.push({path:'/'})
      commit('SET_LOADING', false)
    })
    .catch(error => {
      console.log(error.message);
      commit('SET_ERROR', error.message)
      commit('SET_LOADING', false)
    })
  },
  userSignOut({commit, rootState}, payload){
    firebase.auth().signOut()
    commit('SET_USER', null)
    router.push('/signin')
  },
  getCambistas({commit, rootState}, payload){
    return new Promise((resolve, reject) => {
      const cambistas = {
        type: 'FeatureCollection',
        features: []
      }
      const colRef = rootState.db.collection('cambistas').get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
          doc.data().id = doc.id
          let cambista = doc.data()
          cambistas.features.push({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: cambista.ubicacion
            },
            properties: {
              name: cambista.name,
              estado: cambista.estado,
              compra: cambista.compra,
              venta: cambista.venta,
              icon: 'monument',
            }
          })
        })
      })
      resolve(commit('SET_CAMBISTAS', cambistas))
    })
  },
  getPosition({commit, rootState}, payload){
    commit('SET_UBICACION', payload)
  }
}
const getters = {
  isAuthenticated(state){ 
    return state.currentUser !== null && state.currentUser !== undefined
  }
}

export default new Vuex.Store({
  state,
  actions,
  mutations,
})