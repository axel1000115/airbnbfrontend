<template>
  <div>
    <h1>Your owned camping spots</h1>
    <div class="camping-spots-container">
      <div v-for="spot in ownedCampingSpots" :key="spot.campingSpotID" class="camping-spot">
        <h2 class="spot-name">{{ spot.spotName }}</h2>
        <p class="description">{{ spot.description }}</p>
        <p class="price">$ {{ spot.price }}</p>
        <button @click="confirmRemoveCampingSpot(spot.campingSpotID)" class="remove-button">Remove</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "PageMyProperties",
  data() {
    return {
      ownedCampingSpots: []
    };
  },
  created() {
    this.fetchOwnedCampingSpots();
  },
  methods: {
    async fetchOwnedCampingSpots() {
      try {
        const loggedInUser = this.$store.state.username;
        const ownerResponse = await axios.get('https://localhost:7170/Owner');
        const ownedSpots = ownerResponse.data.filter(owner => owner.username === loggedInUser);
        const campingSpotIds = ownedSpots.map(owner => owner.campingSpotID);
        
        const campingSpotResponse = await axios.get('https://localhost:7170/Campingspot');
        this.ownedCampingSpots = campingSpotResponse.data.filter(campingSpot => campingSpotIds.includes(campingSpot.campingSpotID));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    async confirmRemoveCampingSpot(campingSpotID) {
      if (confirm("Are you sure you want to remove this camping spot?")) {
        this.removeCampingSpot(campingSpotID);
      }
    },
    async removeCampingSpot(campingSpotID) {
      try {
        const response = await axios.delete(`https://localhost:7170/Campingspot/${campingSpotID}`);
        if (response.status === 204) {
          this.ownedCampingSpots = this.ownedCampingSpots.filter(spot => spot.campingSpotID !== campingSpotID);
        } else {
          console.error(`Failed to remove camping spot: ${response.status}`);
        }
      } catch (error) {
        console.error("There was an error removing the camping spot:", error);
      }
    }
  }
}
</script>

<style scoped>
.camping-spots-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.camping-spot {
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: calc(50% - 20px);
  transition: transform 0.2s;
}

.camping-spot:hover {
  transform: translateY(-5px);
}

.spot-name {
  font-size: 1.5em;
  color: #007BFF;
  margin-bottom: 10px;
}

.description {
  color: #555;
  margin-bottom: 10px;
}

.price {
  color: #333;
  font-weight: bold;
}

.remove-button {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

.remove-button:hover {
  background-color: #c82333;
}
</style>
