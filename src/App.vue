<template>
<v-app green>
  <v-navigation-drawer v-if="isAuthenticated" app fixed absolute temporary clipped  v-model="drawer">
      <v-list dense>
        <v-list-tile to="/">
          <v-list-tile-action>
            <v-icon>home</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Dashboard</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile to="/about">
          <v-list-tile-action>
            <v-icon>help</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>About</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile to="/contact">
          <v-list-tile-action>
            <v-icon>contact_mail</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Contáctanos</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
  </v-navigation-drawer>
  <v-toolbar clipped-left app color="blue darken-3" dark>
    <v-toolbar-side-icon v-if="isAuthenticated" @click="drawer = !drawer"></v-toolbar-side-icon>
    <v-toolbar-title>tekambio</v-toolbar-title>
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
  z-index: 3
}
</style>
