<template>
  <div class="wrapper">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <div class="input-box">
        <input v-model="email" type="email" placeholder="Email" required />
      </div>
      <div class="input-box">
        <input v-model="password" type="password" placeholder="Password" required />
      </div>
      <div class="input-box button">
        <input type="submit" value="Login" />
      </div>
      <div class="text">
        <h3>Don't have an account? <router-link to="/register">Register</router-link></h3>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      email: '',
      password: '',
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    };
  },
  methods: {
    async login() {
      try {
        const res = await axios.post(this.apiBaseUrl + '/login', {
          email: this.email,
          password: this.password,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });
        localStorage.setItem('token', res.data.access_token);
        this.$router.push('/dashboard');
      } catch {
        alert('Login failed');
      }
    },
  },
};
</script>
