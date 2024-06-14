<template>
    <div class="login-container">
      <h2>Login</h2>
      <div class="login-form">
        <input type="text" v-model="username" placeholder="Username" />
        <input type="password" v-model="password" placeholder="Password" />
        <button @click="login">Login</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        username: '',
        password: '',
      };
    },
    methods: {
      login() {
        // Perform login logic and redirect to home
        this.$store.dispatch('login', this.username).then(() => {
          this.$router.push({ name: 'PageHome' });
        }).catch((error) => {
          alert('Login failed: ' + error.message);
        });
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add your styles here */
  .login-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
  
  .login-form input {
    display: block;
    width: 100%;
    margin-bottom: 10px;
    padding: 8px;
    font-size: 16px;
  }
  
  .login-form button {
    display: block;
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  </style>
  