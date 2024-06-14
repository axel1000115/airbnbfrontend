<template>
  <div class="profile-container">
    <div class="profile-title-wrapper">
      <h1 class="profile-title">Edit your information : </h1>
    </div>
    
    <div class="profile-wrapper">
      <!-- User Details (with textboxes) -->
      <div v-if="user" class="profile-details">
        <div class="profile-info">
          <p><strong>Username:</strong> <input type="text" v-model="updatedUser.username" class="text-input" /></p>
          <p><strong>First Name:</strong> <input type="text" v-model="updatedUser.firstName" class="text-input" /></p>
          <p><strong>Last Name:</strong> <input type="text" v-model="updatedUser.lastName" class="text-input" /></p>
          <p><strong>Email:</strong> <input type="text" v-model="updatedUser.email" class="text-input" /></p>
          <p><strong>Password:</strong> <input type="text" v-model="updatedUser.password" class="text-input" /></p>
          <button @click="saveChange" class="save-button">Save</button>
        </div>
      </div>
    </div>

    <!-- Success message -->
    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
  </div>
</template>

<script>
export default {
  props: ['userId'], // Receive userId as a prop
  
  data() {
    return {
      user: null, // Original user data
      updatedUser: { // Data for updating user information
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        password: ''
      },
      successMessage: '', // Success message
    };
  },
  
  methods: {
    fetchUserProfile(userId) {
      console.log('Fetching user profile for user ID:', userId); // Log the user ID being fetched
      if (!userId) return;
      fetch(`https://localhost:7170/User/${userId}`)
        .then(response => response.json())
        .then(user => {
          console.log('API response:', user); // Log the API response
          this.user = user;
          // Initialize updatedUser with the current user data
          this.updatedUser = { ...user };
        })
        .catch(error => {
          console.error('Error fetching user profile:', error);
        });
    },
    saveChange() {
      // Check if any changes have been made
      if (
        this.updatedUser.username === this.user.username &&
        this.updatedUser.firstName === this.user.firstName &&
        this.updatedUser.lastName === this.user.lastName &&
        this.updatedUser.email === this.user.email &&
        this.updatedUser.password === this.user.password
      ) {
        // No changes, return without showing any message
        return;
      }

      fetch(`https://localhost:7170/User/${this.userId}`, {
        method: 'PUT', // Use PUT to update existing user data
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.updatedUser),
      })
      .then(response => {
        if (response.ok) {
          console.log('User data updated successfully');
          // Show success message
          this.successMessage = 'Changes have been saved';
          // Emit event to notify parent component (App) about username update
          this.$emit('username-updated', this.updatedUser.username);
          // Hide success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        } else {
          console.error('Failed to update user data');
        }
      })
      .catch(error => {
        console.error('Error updating user data:', error);
      });
    }
  },
  
  mounted() {
    // Call fetchUserProfile method with the userId prop when the component is mounted
    this.fetchUserProfile(this.userId);
  }
};
</script>

<style scoped>
.profile-container {
  margin-left: 20px; /* Adjust the left margin as needed */
}

.profile-title-wrapper {
  display: flex;
  align-items: center;
}

.profile-title {
  font-size: 25px; /* Increase the font size */
  text-align: left; /* Align to the left */
  margin-left: 10%;
}

.profile-wrapper {
  display: flex; /* Use flexbox to layout the sections */
}

.profile-details {
  font-size: 20px;
  width: 30%; /* Each section takes 50% of the container */
  margin-left: 15%
}

.profile-info {
  width: 80%; /* Each section takes full width of its container */
}

.text-input {
  width: 100%; /* Adjust the width of text inputs */
  padding: 8px; /* Add padding */
  margin-top: 5px; /* Add space between inputs */
}

button {
  margin-top: 10px; /* Add space between inputs and button */
  padding: 10px 20px; /* Add padding */
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #0056b3;
}

.profile-info p {
  vertical-align: top; /* Align content at the top */
}

.success-message {
  color: green; /* Green color for success message */
  margin-top: 10px; /* Add space between message and other elements */
}
</style>
