<template>
  <div class="register-form">
    <h2>Register</h2>
    <div class="form-group">
      <label for="username">Username:</label>
      <input type="text" id="username" v-model="registerData.username" placeholder="Username" class="register-input">
    </div>
    <div class="form-group">
      <label for="firstName">First Name:</label>
      <input type="text" id="firstName" v-model="registerData.firstName" placeholder="First Name" class="register-input">
    </div>
    <div class="form-group">
      <label for="lastName">Last Name:</label>
      <input type="text" id="lastName" v-model="registerData.lastName" placeholder="Last Name" class="register-input">
    </div>
    <div class="form-group">
      <label for="password">Password:</label>
      <input type="password" id="password" v-model="registerData.password" placeholder="Password" class="register-input">
    </div>
    <div class="form-group">
      <label for="email">Email:</label>
      <input type="email" id="email" v-model="registerData.email" placeholder="Email" class="register-input">
    </div>
    <button class="register-button" @click="register">Register</button>
    <div v-if="registerStatus !== null" :class="['register-status', registerStatusClass]">{{ registerStatus }}</div>
  </div>
</template>

<script>
export default {
  name: "PageRegister",
  data() {
    return {
      registerData: {
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
      },
      registerStatus: null,
      registerStatusClass: '',
    };
  },
  methods: {
    async fetchAllUsers() {
      try {
        const response = await fetch('https://localhost:7170/User');
        if (response.ok) {
          const users = await response.json();
          return users;
        } else {
          throw new Error('Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        return [];
      }
    },
    async register() {
      // Check if all fields are filled in
      if (!this.registerData.username || !this.registerData.firstName || !this.registerData.lastName || !this.registerData.email || !this.registerData.password) {
        this.registerStatus = 'All fields need to be filled in';
        this.registerStatusClass = 'failure';
        setTimeout(() => {
          this.registerStatus = null;
          this.registerStatusClass = '';
        }, 3000);
        return;
      }

      // Fetch all users and check if the username already exists
      const users = await this.fetchAllUsers();
      const usernameExists = users.some(user => user.username === this.registerData.username);
      
      if (usernameExists) {
        this.registerStatus = 'Username already exists, please choose a different username';
        this.registerStatusClass = 'failure';
        setTimeout(() => {
          this.registerStatus = null;
          this.registerStatusClass = '';
        }, 3000);
        return;
      }

      // Proceed with registration
      fetch('https://localhost:7170/User', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.registerData)
      })
      .then(response => {
        if (response.ok) {
          this.registerStatus = 'Registration successful!';
          this.registerStatusClass = 'success';
          setTimeout(() => {
            this.registerStatus = null;
            this.registerStatusClass = '';
            // Redirect to the "Home" page after successful registration
            this.$emit('register-success');
          }, 3000);
        } else {
          this.registerStatus = 'Registration failed!';
          this.registerStatusClass = 'failure';
        }
      })
      .catch(error => {
        console.error('Registration failed:', error);
        this.registerStatus = 'Registration failed!';
        this.registerStatusClass = 'failure';
      });
    }
  }
}
</script>

<style scoped>
.register-form {
  margin-top: 20px;
  text-align: left; /* Align text to the left */
  max-width: 400px; /* Set a max-width for the form */
  margin: 20px auto; /* Center the form on the page */
  margin-left: 17%;
}

.form-group {
  margin-bottom: 15px;
}

.register-input {
  display: block;
  width: 100%;
  padding: 10px;
  font-size: 16px;
  margin-top: 5px;
  box-sizing: border-box;
}

.register-button {
  margin-top: 20px; /* Add space between inputs and button */
  padding: 10px 20px;
  font-size: 18px;
  background-color: green;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.register-status {
  margin-top: 20px; /* Add space between button and status message */
}

.register-status.success {
  color: green;
}

.register-status.failure {
  color: red;
}
</style>
