<template>
  <div class="container">
    <div class="wrapper">
      <h2>Registration</h2>
      <form @submit.prevent="register">
        <div class="input-box">
          <input v-model="form.name" type="text" placeholder="Enter your name" required />
        </div>
        <div class="input-box">
          <input v-model="form.email" type="email" placeholder="Enter your email" required />
        </div>
        <div class="input-box">
          <input v-model="form.password" type="password" placeholder="Create password" required />
        </div>
        <div class="input-box">
          <input v-model="form.password_confirmation" type="password" placeholder="Confirm password" required />
        </div>

        <div class="input-box button">
          <input type="submit" value="Register Now" />
        </div>
        <div class="text">
          <h3>Already have an account? <a href="/login">Login now</a></h3>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      form: {
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
      },
    };
  },
  methods: {
    async register() {
      try {
        axios.post("http://127.0.0.1:8000/api/register", this.form, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        this.$router.push("/login");
      } catch (error) {
        console.error(error.response?.data);
      }
    },
  },
};
</script>
