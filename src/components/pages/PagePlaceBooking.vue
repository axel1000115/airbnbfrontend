<template>
  <div class="booking-container">
    <h1 class="booking-title">Booking Details for {{ spotName }}</h1>
    <div v-if="pricePerNight !== null" class="booking-details">
      <div class="date-inputs">
        <div class="date-input">
          <label for="checkInDate">Check-in Date:</label>
          <input type="date" id="checkInDate" v-model="checkInDate" @change="calculateTotalPrice" :min="minDate" class="date-picker">
        </div>
        <div class="time-input">
          <label for="checkInTime">Check-in Time:</label>
          <input type="time" id="checkInTime" v-model="checkInTime" class="time-picker">
        </div>
        <div class="date-input">
          <label for="checkOutDate">Check-out Date:</label>
          <input type="date" id="checkOutDate" v-model="checkOutDate" @change="calculateTotalPrice" :min="checkInDate || minDate" class="date-picker">
        </div>
        <div class="time-input">
          <label for="checkOutTime">Check-out Time:</label>
          <input type="time" id="checkOutTime" v-model="checkOutTime" class="time-picker">
        </div>
      </div>
      
      <p class="price-info">Price per night: <span class="price-value">${{ pricePerNight }}</span></p>
      <p class="price-info">Total price: <span class="price-value">${{ totalPrice }}</span></p>
      <div class="button-container">
        <button class="book-now-button" @click="bookNow">Book Now</button>
        <button class="leave-review-button" @click="emitLeaveReviewEvent">Leave Review</button>
      </div>
    </div>
    <div v-else class="loading-message">
      <p>Loading booking details...</p>
    </div>
    
    <!-- Review Section -->
    <div class="review-container" v-if="reviews.length">
      <h2 class="review-title">Reviews</h2>
      <div class="review" v-for="review in reviews" :key="review.ReviewID">
        <p class="review-text">{{ review.reviewText }}</p>
        <p class="review-author">
          - {{ getAuthorName(review.userID) }} 
          <span class="review-rating">{{ review.rating }} star(s)</span>
        </p>
      </div>
    </div>
    <div v-else class="loading-message">
      <p>No reviews available.</p>
    </div>

    <!-- Map Section -->
    <div class="map-container">
      <h2 class="map-title">Where you'll be</h2>
      <p class="map-location">{{ locationCity }}, {{ locationCountry }}</p>
      <div id="map" class="map"></div>
    </div>
  </div>
</template>


<script>
import { mapGetters } from 'vuex';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default {
  name: 'PagePlaceBooking',
  props: ['campingSpotID'],
  data() {
    return {
      spotName: '',
      pricePerNight: null,
      checkInDate: null,
      checkInTime: null,
      checkOutDate: null,
      checkOutTime: null,
      totalPrice: 0,
      reviews: [],
      users: [],
      minDate: '',
      latitude: null,
      longitude: null,
      map: null,
      locationCity: '',
      locationCountry: ''
    };
  },
  computed: {
    ...mapGetters(['getUserID', 'isAuthenticated']),
  },
  created() {
    this.setMinDate();
    this.fetchCampingSpotDetails();
    this.fetchReviews();
    this.fetchUsers();
  },
  methods: {
  setMinDate() {
    const today = new Date();
    today.setHours(today.getHours() + 2); // Add 2 hours to the current time
    this.minDate = today.toISOString().split('T')[0];
  },
  async fetchCampingSpotDetails() {
    const url = `https://localhost:7170/Campingspot/${this.campingSpotID}`;
    try {
      const response = await fetch(url);
      if (response.ok) {
        const spot = await response.json();
        this.spotName = spot.spotName;
        this.pricePerNight = spot.price;
        this.fetchLocation(spot.locationID);
      } else {
        const errorMessage = await response.text();
        console.error('Error fetching camping spot details:', errorMessage);
      }
    } catch (error) {
      console.error('Error fetching camping spot details:', error);
    }
  },
  async fetchLocation(locationID) {
    const url = `https://localhost:7170/Location/${locationID}`;
    try {
      const response = await fetch(url);
      if (response.ok) {
        const location = await response.json();
        this.latitude = location.latitude;
        this.longitude = location.longitude;
        this.locationCity = location.city;
        this.locationCountry = location.country;
        this.$nextTick(this.initializeMap); // Ensure the map is initialized after DOM updates
      } else {
        const errorMessage = await response.text();
        console.error('Error fetching location details:', errorMessage);
      }
    } catch (error) {
      console.error('Error fetching location details:', error);
    }
  },
  async fetchReviews() {
    const url = `https://localhost:7170/Review`;
    try {
      const response = await fetch(url);
      if (response.ok) {
        const reviews = await response.json();
        this.reviews = reviews.filter(review => review.campingSpotID == this.campingSpotID);
      } else {
        const errorMessage = await response.text();
        console.error('Error fetching reviews:', errorMessage);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  },
  async fetchUsers() {
    const url = `https://localhost:7170/User`;
    try {
      const response = await fetch(url);
      if (response.ok) {
        const users = await response.json();
        this.users = users;
      } else {
        const errorMessage = await response.text();
        console.error('Error fetching users:', errorMessage);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  },
  getAuthorName(userID) {
    const user = this.users.find(user => user.userID === userID);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  },
  addHours(date, hours) {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  },
  calculateTotalPrice() {
    if (this.checkInDate && this.checkOutDate) {
      const checkIn = this.addHours(new Date(this.checkInDate), 2); // Add 2 hours
      const checkOut = this.addHours(new Date(this.checkOutDate), 2); // Add 2 hours

      if (!isNaN(checkIn) && !isNaN(checkOut) && checkOut > checkIn) {
        const differenceInTime = checkOut.getTime() - checkIn.getTime();
        const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
        this.totalPrice = differenceInDays * this.pricePerNight;
      } else {
        this.totalPrice = 0;
      }
    } else {
      this.totalPrice = 0;
    }
  },
  async bookNow() {
    if (!this.checkInDate || !this.checkOutDate) {
      alert('Please select both check-in and check-out dates.');
      return;
    }

    if (!this.checkInTime || !this.checkOutTime) {
      alert('Please select both check-in and check-out times.');
      return;
    }

    if (!this.isAuthenticated) {
      alert('Please sign in to make a booking.');
      this.$router.push({ name: 'Home' });
      return;
    }

    const checkInDateTime = new Date(`${this.checkInDate}T${this.checkInTime}`);
    const checkOutDateTime = new Date(`${this.checkOutDate}T${this.checkOutTime}`);

    const bookingData = {
      userID: this.getUserID,
      campingSpotID: this.campingSpotID,
      bookingDate: new Date().toISOString(),
      checkInDate: this.addHours(checkInDateTime, 2).toISOString(), // Add 2 hours
      checkOutDate: this.addHours(checkOutDateTime, 2).toISOString(), // Add 2 hours
      price: this.totalPrice,
    };

    const url = `https://localhost:7170/Booking`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        alert(`Booking confirmed for ${this.spotName} from ${this.checkInDate} ${this.checkInTime} to ${this.checkOutDate} ${this.checkOutTime}. Total price: $${this.totalPrice}`);
        this.$router.push({ name: 'Home' });
      } else {
        const errorMessage = await response.text();
        console.error('Error booking camping spot:', errorMessage);
        alert('Error booking camping spot: ' + errorMessage);
      }
    } catch (error) {
      console.error('Error booking camping spot:', error);
      alert('Error booking camping spot: ' + error.message);
    }
  },
  emitLeaveReviewEvent() {
    this.$emit('leave-review', this.campingSpotID);
  },
  initializeMap() {
    try {
      if (this.map) {
        this.map.remove();
      }

      if (this.latitude && this.longitude) {
        this.map = L.map('map', {
          zoomAnimation: false // Disable zoom animation to prevent '_map is null' error
        }).setView([this.latitude, this.longitude], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        const customIcon = L.icon({
          iconUrl: require('@/assets/icon.png'), // Path to your custom marker icon
          iconSize: [38, 38], // Size of the icon
          iconAnchor: [19, 38], // Point of the icon which will correspond to marker's location
          popupAnchor: [-3, -76] // Point from which the popup should open relative to the iconAnchor
        });

        L.marker([this.latitude, this.longitude], { icon: customIcon }).addTo(this.map)
          .bindPopup(this.spotName)
          .openPopup();
      }
    } catch (error) {
      if (error.message !== 'this._map is null') {
        console.error('Error initializing map:', error);
      }
    }
  }
}
,
};
</script>

<style scoped>
.booking-container {
  max-width: 800px; /* Increased max-width to make the map wider */
  margin: 0 auto;
  padding: 60px;
  background-color: #f8f8f8;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.booking-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.booking-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.date-inputs {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.date-input, .time-input {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}

.date-picker, .time-picker {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
}

.price-info {
  font-size: 18px;
  color: #555;
  text-align: center;
}

.price-value {
  font-weight: bold;
  color: #007bff;
}

.book-now-button, .leave-review-button {
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
}

.book-now-button {
  background-color: #28a745;
}

.book-now-button:hover {
  background-color: #218838;
}

.leave-review-button {
  background-color: #007bff;
}

.leave-review-button:hover {
  background-color: #0056b3;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 10px; /* Less space between buttons */
}

/* Place Leave Review button on the left and Book Now button on the right */
.button-container .leave-review-button {
  order: 1;
}

.button-container .book-now-button {
  order: 2;
}

.loading-message {
  text-align: center;
  font-size: 18px;
  color: #555;
}

/* Review Section Styles */
.review-container {
  margin-top: 40px;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.review-title {
  font-size: 22px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.review {
  margin-bottom: 20px;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.review-text {
  font-size: 16px;
  color: #555;
}

.review-author {
  font-size: 14px;
  color: #999;
  text-align: right;
}

.review-rating {
  font-size: 14px;
  color: #ff9900; /* Color for the star rating */
  margin-left: 10px;
}

/* Map Styles */
.map-container {
  margin-top: 40px;
}

.map-title {
  font-size: 22px;
  color: #333;
  text-align: center;
  margin-bottom: 10px;
}

.map-location {
  font-size: 16px;
  color: #555;
  text-align: center;
  margin-bottom: 10px;
}

.map {
  width: 100%;
  height: 500px;
  border-radius: 10px;
}
</style>
