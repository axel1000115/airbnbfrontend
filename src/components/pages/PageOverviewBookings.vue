<template>
  <div class="bookings-container">
    <h1> Your bookings</h1>
    <ul v-if="bookings.length">
      <li v-for="booking in bookings" :key="booking.bookingID" class="booking-item">
        <div class="booking-info">
          <h2 class="spot-name">{{ getCampingSpotName(booking.campingSpotID) }}</h2>
          <p><strong>Booking Date:</strong> {{ formatDateTime(booking.bookingDate) }}</p>
          <p><strong>Check-in:</strong> {{ formatDateTime(booking.checkInDate) }}</p>
          <p><strong>Check-out:</strong> {{ formatDateTime(booking.checkOutDate) }}</p>
          <p><strong>Price:</strong> ${{ booking.price }}</p>
        </div>
        <button @click="confirmRemoveBooking(booking.bookingID)" class="remove-button">Remove</button>
      </li>
    </ul>
    <p v-else>No bookings found.</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "PageOverviewBookings",
  props: ['userId'],
  data() {
    return {
      bookings: [],
      campingSpots: {},
      username: ''
    };
  },
  created() {
    this.fetchBookings();
    this.fetchCampingSpots();
    this.fetchUserData();
  },
  methods: {
    async fetchBookings() {
      try {
        const response = await axios.get('https://localhost:7170/Booking');
        this.bookings = response.data.filter(booking => booking.userID === this.userId);
      } catch (error) {
        console.error("There was an error fetching the bookings:", error);
      }
    },
    async fetchCampingSpots() {
      try {
        const response = await axios.get('https://localhost:7170/Campingspot');
        this.campingSpots = response.data.reduce((map, spot) => {
          map[spot.campingSpotID] = spot.spotName;
          return map;
        }, {});
      } catch (error) {
        console.error("There was an error fetching the camping spots:", error);
      }
    },
    async fetchUserData() {
      try {
        const response = await axios.get(`https://localhost:7170/User/${this.userId}`);
        const user = response.data;
        this.username = user.username;
      } catch (error) {
        console.error("There was an error fetching the user data:", error);
      }
    },
    getCampingSpotName(campingSpotID) {
      return this.campingSpots[campingSpotID] || 'Unknown';
    },
    formatDateTime(dateTimeString) {
      const date = new Date(dateTimeString);
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      return date.toLocaleString('en-US', options);
    },
    async confirmRemoveBooking(bookingID) {
      if (confirm("Are you sure you want to remove this booking?")) {
        this.removeBooking(bookingID);
      }
    },
    async removeBooking(bookingID) {
      try {
        const response = await axios.delete(`https://localhost:7170/Booking/${bookingID}`);
        if (response.status === 200) {
          this.bookings = this.bookings.filter(booking => booking.bookingID !== bookingID);
        } else {
          console.error(`Failed to remove booking: ${response.status}`);
        }
      } catch (error) {
        console.error("There was an error removing the booking:", error);
      }
    }
  }
}
</script>

<style scoped>
.bookings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
}

h1 {
  font-size: 2em;
  margin-bottom: 20px;
  color: #333;
}

ul {
  list-style: none;
  padding: 0;
}

.booking-item {
  background-color: #fff;
  border-radius: 10px;
  margin-bottom: 20px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.booking-item:hover {
  transform: translateY(-5px);
}

.booking-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.spot-name {
  font-size: 1.5em;
  color: #007BFF;
  margin-bottom: 10px;
}

p {
  margin: 5px 0;
  color: #555;
  display: flex;
}

p strong {
  display: inline-block;
  width: 120px; /* Fixed width for label alignment */
  color: #333;
}

.remove-button {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
}

.remove-button:hover {
  background-color: #c82333;
}
</style>
