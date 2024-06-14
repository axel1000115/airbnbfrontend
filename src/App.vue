<template>
  <div id="app">
    <!-- Logo -->
    <a href="./components/pages/PageHome.vue">
      <img src="./assets/logo_camper.jpg" alt="Logo" class="logo-image" />
    </a>
    <!-- Title -->
    <div class="title-container">
      <h2 @click="setActivePage('Home')" class="clickable-title">Airbnb for campers</h2>
    </div>
    <!-- Navigation -->
    <nav class="nav-container">
      <ul class="nav-list">
        <li 
          v-for="page in visiblePages" 
          :key="page"
          @click="setActivePage(page)"
          :class="{ active: activePage === page }">
          {{ page }}
        </li>
      </ul>
      <div class="soft-shadow-line"></div>
    </nav>

    <!-- Content -->
    <div class="content">
      <template v-if="activePage !== 'Profile'">
        <component 
          :is="activePageComponent" 
          :user-id="userId" 
          v-if="isLoggedIn || !['My bookings', 'My reviews'].includes(activePage)"
          :campingSpotID="activePageProps.campingSpotID"
          @book-now="setActivePageWithID('PagePlaceBooking', $event)"
          @leave-review="setActivePageWithID('PageLeaveReview', $event)"
          @username-updated="updateUsername" 
        />
        <p v-else>
          Please <span class="clickable-title" @click="setActivePage('Login')">sign in</span> to view {{ activePage }}
        </p>
      </template>
    </div>

    <!-- Display username if logged in -->
    <div v-if="isLoggedIn" class="username">
      Signed in as: {{ username }}
      <button class="logout-button" @click="logout">Sign out</button>
    </div>

    <!-- Login Form -->
    <div v-if="!isLoggedIn" class="login-form">
      <input type="text" v-model="loginData.username" placeholder="Username" class="login-input">
      <input type="password" v-model="loginData.password" placeholder="Password" class="login-input">
      <button class="login-button" @click="login">Login</button>
      <button class="register-button" v-if="!isLoggedIn" @click="setActivePage('Register')">Register</button>
      <div v-if="loginStatus !== null" class="login-status">{{ loginStatus }}</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import PageSettings from './components/pages/PageSettings.vue';
import PageRegister from './components/pages/PageRegister.vue';
import PageHome from './components/pages/PageHome.vue';
import PageOverviewBookings from './components/pages/PageOverviewBookings.vue';
import PageReview from './components/pages/PageReview.vue';
import PagePlaceBooking from './components/pages/PagePlaceBooking.vue';
import PageDeleteAccount from './components/pages/PageDeleteAccount.vue';
import PageLeaveReview from './components/pages/PageLeaveReview.vue';
import PageAddBookingPlace from './components/pages/PageAddBookingPlace.vue';
import PageMyProperties from './components/pages/PageMyProperties.vue';

export default {
  name: 'App',
  components: {
    PageSettings,
    PageRegister,
    PageHome,
    PageOverviewBookings,
    PageReview,
    PagePlaceBooking,
    PageDeleteAccount, // Register the new component
    PageLeaveReview,
    PageAddBookingPlace,
    PageMyProperties,

  },
  data() {
    return {
      userPages: ["Home", "My bookings", "My reviews", "Settings", "Delete account"],
      ownerPages: ["Home"],
      guestPages: ["Home", "My bookings", "My reviews"],
      activePage: "Home",
      activePageProps: {}, // Store props for the active page
      loginData: { username: '', password: '' },
      loginStatus: null,
      userType: null // To store if the user is a regular user or an owner
    };
  },
  computed: {
    ...mapGetters(['getUserID', 'isAuthenticated', 'getUsername']),
    isLoggedIn() {
      return this.isAuthenticated;
    },
    username() {
      return this.getUsername;
    },
    userId() {
      return this.getUserID;
    },
    activePageComponent() {
      const pageMap = {
        "Home": "PageHome",
        "My bookings": "PageOverviewBookings",
        "My reviews": "PageReview",
        "Settings": "PageSettings",
        "Register": "PageRegister",
        "PagePlaceBooking": "PagePlaceBooking",
        "Delete account": "PageDeleteAccount",
        "PageLeaveReview": "PageLeaveReview", // Add the new page here
        "Add camping spot": "PageAddBookingPlace",  // Map new page
        "Overview properties": "PageMyProperties",  // Map new page
      };
      return pageMap[this.activePage] || `Page${this.activePage}`;
    },
    visiblePages() {
      if (this.userType === 'user') {
        return this.userPages;
      } else if (this.userType === 'owner') {
        return ["Home", "Add camping spot", "Overview properties"];  // Define pages for owners      } else {
        } else {
      return this.guestPages;
      }
    }
  },
  methods: {
    setActivePage(page) {
      this.activePage = page;
      this.activePageProps = {}; // Reset props when the page changes
    },
    setActivePageWithID(page, campingSpotID) {
      this.activePage = page;
      this.activePageProps = { campingSpotID };
    },
    async login() {
      try {
        const userResponse = await fetch('https://localhost:7170/User', {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${btoa(`${this.loginData.username}:${this.loginData.password}`)}`,
            'Content-Type': 'application/json'
          }
        });

        const ownerResponse = await fetch('https://localhost:7170/Owner', {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${btoa(`${this.loginData.username}:${this.loginData.password}`)}`,
            'Content-Type': 'application/json'
          }
        });

        if (userResponse.ok || ownerResponse.ok) {
          const users = userResponse.ok ? await userResponse.json() : [];
          const owners = ownerResponse.ok ? await ownerResponse.json() : [];

          const foundUser = users.find(user => 
            user.username === this.loginData.username && 
            user.password === this.loginData.password
          );

          const foundOwner = owners.find(owner => 
            owner.username === this.loginData.username && 
            owner.password === this.loginData.password
          );

          if (foundUser || foundOwner) {
            const user = foundUser || foundOwner;
            this.userType = foundUser ? 'user' : 'owner'; // Set the user type based on the login
            this.$store.dispatch('login', {
              userID: user.userID || user.ownerID,
              username: user.username,
            });
            this.setActivePage('Home');
          } else {
            this.loginStatus = "Incorrect username or password";
            setTimeout(() => {
              this.loginStatus = null;
            }, 3000);
          }
        } else {
          this.loginStatus = "Login failed";
          setTimeout(() => {
            this.loginStatus = null;
          }, 3000);
        }
      } catch (error) {
        console.error('Login failed:', error);
        this.loginStatus = "Login failed due to an error";
        setTimeout(() => {
          this.loginStatus = null;
        }, 3000);
      }
    },
    logout() {
      this.$store.dispatch('logout');
      this.userType = null; // Reset the user type on logout
      this.setActivePage('Home');
    },
    updateUsername(newUsername) {
      this.$store.commit('updateUsername', newUsername);
    },
  },
};
</script>

<style scoped>
#app {
  font-family: Arial, sans-serif;
  margin-top: 20px;
  position: relative;
  text-align: center;
}

.logo-image {
  width: 14%; /* Adjust width as needed */
  position: absolute;
  left: 70px;
  top: -70px; /* Adjust the top position to move the image just above the border */
  z-index: -1; /* Set a higher z-index to ensure the image is displayed above other elements */
}

.title-container {
  margin-top: 40px;
  text-align: center;
  font-family: 'Caveat', cursive; /* Use Caveat font for a handwritten feel */
}

.nav-container {
  position: relative;
}

.soft-shadow-line {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -16px; /* Move the shadow line down */
  height: 3px; /* Increase the height of the shadow line */
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.5); /* Darker shadow */
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-list li {
  display: inline-block;
  margin-right: 25px;
  cursor: pointer;
  font-size: 22px;
}

.nav-list li.active {
  font-weight: bold;
  color: #654321;
}

/* Hover effect for navigation list items */
.nav-list li:hover {
  color: #6c583f; /* Warm brown on hover */
}

/* Hover effect for sign-in button */
.login-button:hover {
  background-color: #0056b3; /* Darker blue on hover */
}

/* Hover effect for sign-out button */
.logout-button:hover {
  background-color: #c82333; /* Darker red on hover */
}

.content {
  margin-top: 40px;
}

h2 {
  font-size: 50px;
  margin-bottom: 20px;
  font-weight: normal;
  font-family: 'Roboto', sans-serif; /* Change font to Roboto */
}
.clickable-title {
  cursor: pointer;
}

.login-form {
  position: absolute;
  top: 20px;
  right: 20px;
}

.login-input {
  margin-right: 5px;
  padding: 4px; /* Adjusted padding */
  font-size: 13px; /* Adjusted font size */
}

.login-button {
  font-size: 18px;
  padding: 8px 15px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 3px;
  cursor: pointer;
  margin-right: 10px; /* Added margin to create space between buttons */
}

.register-button {
  font-size: 18px;
  padding: 8px 15px;
  border: none;
  background-color: #28a745;
  color: white;
  border-radius: 3px;
  cursor: pointer;
}

.logout-button {
  font-size: 20px;
  padding: 10px 20px;
  border: none;
  background-color: #dc3545;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

.username {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 18px;
}

.login-status {
  color: red;
  margin-top: 10px;
}
</style>
