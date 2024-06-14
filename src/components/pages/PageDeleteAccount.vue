<template>
  <div class="delete-account-container">
    <h1>Delete Account</h1>
    <p>Are you sure you want to delete your account? This action cannot be undone.</p>
    <button class="confirm-button" @click="deleteAccount">Delete Account</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'PageDeleteAccount',
  props: ['userId'],
  methods: {
    async deleteAccount() {
      if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        try {
          const response = await axios.delete(`https://localhost:7170/User/${this.userId}`);
          if (response.status === 200) {
            alert('Your account has been deleted.');
            this.clearInputs();
            this.$store.dispatch('logout');
            this.$router.push({ name: 'Home' });
          } else {
            alert('Failed to delete account.');
          }
        } catch (error) {
          console.error('Error deleting account:', error);
          if (error.response && error.response.data && error.response.data.error) {
            alert(`Error: ${error.response.data.error}`);
          } else {
            alert('There was an error deleting your account.');
          }
        }
      }
    },
    clearInputs() {
      // Clear the username and password inputs
      this.$emit('clear-credentials');
    }
  }
};
</script>

<style scoped>
.delete-account-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 60px;
  background-color: #f8f8f8;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h1 {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

p {
  font-size: 16px;
  color: #555;
  margin-bottom: 40px;
}

.confirm-button {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
}

.confirm-button:hover {
  background-color: #c82333;
}
</style>
