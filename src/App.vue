<template>
<v-app>
  <v-navigation-drawer app fixed  v-model="drawer"></v-navigation-drawer>
  <v-toolbar app>
    <v-toolbar-side-icon @click="drawer = !drawer"></v-toolbar-side-icon>
    <v-toolbar-title>quieroCambiar</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-toolbar-items>
      <template v-if="!isAuthenticated">
        <v-btn flat to="/signup">Sign up</v-btn>
        <v-btn flat to="/signin">Sign in</v-btn>
      </template>
      <template v-if="isAuthenticated">
        <v-menu offset-y>
          <v-list-tile slot="activator" avatar>
            <v-list-tile-avatar>
              <img :src="this.$store.state.currentUser.photoURL">
            </v-list-tile-avatar>
            <v-list-tile-content>
              {{this.$store.state.currentUser.username}}
            </v-list-tile-content>
          </v-list-tile>
          <v-list>
            <v-list-tile :to="'profile/'+this.$store.state.currentUser.uid">
              <v-list-tile-title >Mi perfil</v-list-tile-title>
            </v-list-tile>
            <v-list-tile @click="userSignOut">
              <v-list-tile-title >Cerrar sesion</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
      </template>
    </v-toolbar-items>
  </v-toolbar>
  <v-content app fluid>
      <router-view></router-view>
  </v-content>
</v-app>
</template>

<script>
export default {
  name: 'App',
  data(){
    return {
      drawer: false
    }
  },
  computed:{
    isAuthenticated(){
      return this.$store.state.currentUser
    }
  },
  methods: {
    userSignOut(){
      this.$store.dispatch('userSignOut')
    }
  }
}
</script>

<style>
.toolbar.toolbar--fixed {
  z-index: 999
}
</style>
