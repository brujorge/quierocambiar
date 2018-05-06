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
  userSignUp({commit, rootState}, payload){
    firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
    .then((firebaseUser)=>{
      firebaseUser.updateProfile({
        photoURL: "https://i.imgur.com/n5kMEsA.png",
        displayName: payload.username
      })
      router.push('/signin')
    }).catch(error => {
      commit('SET_ERROR', error)
    })
    
  },
  userSignIn({commit, rootState},payload){
    commit('SET_LOADING', true)
    firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
    .then(firebaseUser => {
      console.log(firebaseUser);
      commit('SET_USER',{email: firebaseUser.email, uid:firebaseUser.uid, photoURL: firebaseUser.photoURL, username: firebaseUser.displayName})
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
  getPosition({commit, rootState}, payload){
    commit('SET_UBICACION', payload)
  },
  autoSignIn({commit}, firebaseUser){
    console.log(firebaseUser);
    commit('SET_USER', {email: firebaseUser.email, uid:firebaseUser.uid, photoURL: firebaseUser.photoURL, username:firebaseUser.displayName})
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