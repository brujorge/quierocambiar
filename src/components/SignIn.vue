<template>
    <v-layout row wrap>
      <v-flex xs12 class="text-xs-center" mt-5>
        <h1>Sign in</h1>
      </v-flex>
      <v-flex xs12 sm6 offset-sm3 mt-3>
        <form @submit.prevent="userSignIn">
          <v-layout column>
            <v-flex xs12>
              <v-alert type="error" dissmissable v-model="alert">
                {{error}}
              </v-alert>
            </v-flex>
            <v-flex>
              <v-text-field
                v-model="user.email"
                name="email"
                label="Email"
                type="text"
                id="email"
                required
              ></v-text-field>
            </v-flex>
            <v-flex>
              <v-text-field
                v-model="user.password"
                name="password"
                label="Password"
                type="password"
                id="password"
                required
              ></v-text-field>
            </v-flex>
            <v-flex class="text-xs-center" mt-5>
              <v-btn color="primary" type="submit" :disabled="loading">Sign In</v-btn>
            </v-flex>
          </v-layout>
        </form>
      </v-flex>
    </v-layout>
</template>

<script>
export default {
    name: 'sign-in',
    data() {
        return {
          user: {
            email: '',
            password: ''
          },
          alert: false
        }
    },
    computed: {
      loading(){
        return this.$store.state.loading
      },
      error(){
        return this.$store.state.error
      }
    },
    methods: {
      userSignIn(){
        this.$store.dispatch('userSignIn', this.user)
      }
    },
    watch: {
      error(value){
        if(value){
          this.alert = true
        }
      },
      alert(value){
        if(!value){
          this.$store.commit('SET_ERROR', null)
        }
      }
    }
}
</script>


