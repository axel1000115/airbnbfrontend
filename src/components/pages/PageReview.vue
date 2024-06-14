<template>
    <div class="reviews-container">
      <h1> Your reviews</h1>
      <ul v-if="reviews.length">
        <li v-for="review in reviews" :key="review.reviewID" class="review-item">
          <div class="review-info">
            <h2 class="spot-name">{{ getCampingSpotName(review.campingSpotID) }}</h2>
            <p class="review-text">{{ review.reviewText }}</p>
          </div>
          <button @click="confirmRemoveReview(review.reviewID)" class="remove-button">Remove</button>
        </li>
      </ul>
      <p v-else>No reviews found.</p>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: "PageReview",
    props: ['userId'],
    data() {
      return {
        reviews: [],
        campingSpots: {},
        username: ''
      };
    },
    created() {
      this.fetchReviews();
      this.fetchCampingSpots();
      this.fetchUserData();
    },
    methods: {
      async fetchReviews() {
        try {
          const response = await axios.get('https://localhost:7170/Review');
          this.reviews = response.data.filter(review => review.userID === this.userId);
        } catch (error) {
          console.error("There was an error fetching the reviews:", error);
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
      async confirmRemoveReview(reviewID) {
        if (confirm("Are you sure you want to remove this review?")) {
          this.removeReview(reviewID);
        }
      },
      async removeReview(reviewID) {
        try {
          const response = await axios.delete(`https://localhost:7170/Review/${reviewID}`);
          if (response.status === 200) {
            this.reviews = this.reviews.filter(review => review.reviewID !== reviewID);
          } else {
            console.error(`Failed to remove review: ${response.status}`);
          }
        } catch (error) {
          console.error("There was an error removing the review:", error);
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .reviews-container {
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
  
  .review-item {
    background-color: #fff;
    border-radius: 10px;
    margin-bottom: 20px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
    display: flex;
    justify-content: space-between; /* Align content and button horizontally */
    align-items: center; /* Center align the content and button vertically */
  }
  
  .review-item:hover {
    transform: translateY(-5px);
  }
  
  .review-info {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1; /* Allow review info to take up available space */
  }
  
  .spot-name {
    font-size: 1.5em;
    color: #007BFF;
    margin-bottom: 10px;
  }
  
  .review-text {
    color: #555;
  }
  
  p {
    margin: 5px 0;
    color: #555;
  }
  
  strong {
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
    background-color: #c82333; /* Darker red on hover */
  }
  </style>
  