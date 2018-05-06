<template>
<v-app>
  <v-navigation-drawer app></v-navigation-drawer>
  <v-toolbar app>
    <v-toolbar-side-icon></v-toolbar-side-icon>
    <v-toolbar-title>quieroCambiar</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-toolbar-items>
      <v-btn flat>Sign up</v-btn>
      <v-btn flat>Sign in</v-btn>
      <v-btn flat @click.native="userSignOut">Sign out</v-btn>
    </v-toolbar-items>
  </v-toolbar>
  <v-content app fluid>
      <router-view></router-view>
  </v-content>
  <v-footer app></v-footer>
</v-app>
</template>

<script>
export default {
  name: 'App',
  data(){
    return {

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

</style>
