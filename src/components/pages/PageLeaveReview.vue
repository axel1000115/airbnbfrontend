<template>
  <div class="leave-review-container">
    <h1>Leave a Review for {{ spotName }}</h1>
    
    <div class="rating-container">
      <span 
        v-for="star in 5" 
        :key="star" 
        class="star"
        :class="{ 'selected': star <= rating }"
        @click="setRating(star)"
      >
        <i class="fas fa-star"></i>
      </span>
    </div>

    <textarea v-model="reviewText" placeholder="Write your review here..." class="review-textarea"></textarea>
    <button @click="submitReview" class="submit-button">Send</button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'PageLeaveReview',
  props: ['campingSpotID'],
  data() {
    return {
      spotName: '',
      reviewText: '',
      rating: 0,  // New data property for rating
    };
  },
  computed: {
    ...mapGetters(['getUserID', 'isAuthenticated']),
  },
  created() {
    this.fetchCampingSpotDetails();
  },
  methods: {
    setRating(star) {
      this.rating = star;
    },
    async fetchCampingSpotDetails() {
      const url = `https://localhost:7170/Campingspot/${this.campingSpotID}`;
      try {
        const response = await fetch(url);
        if (response.ok) {
          const spot = await response.json();
          this.spotName = spot.spotName;
        } else {
          const errorMessage = await response.text();
          console.error('Error fetching camping spot details:', errorMessage);
        }
      } catch (error) {
        console.error('Error fetching camping spot details:', error);
      }
    },
    async submitReview() {
      if (!this.isAuthenticated) {
        alert('Please sign in to leave a review.');
        this.$router.push({ name: 'Home' }); // Redirect to the home page or login page
        return;
      }

      if (!this.reviewText.trim()) {
        alert('Please write a review before submitting.');
        return;
      }

      if (this.rating === 0) {
        alert('Please select a rating.');
        return;
      }

      const reviewData = {
        userID: this.getUserID,
        campingSpotID: this.campingSpotID,
        reviewText: this.reviewText,
        rating: this.rating,  // Include the rating in the review data
      };

      const url = 'https://localhost:7170/Review';
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reviewData),
        });

        if (response.ok) {
          alert('Review submitted successfully!');
          this.reviewText = '';  // Clear the textarea after successful submission
          this.rating = 0;       // Reset the rating after successful submission
        } else {
          const errorMessage = await response.text();
          console.error('Error submitting review:', errorMessage);
          alert('Error submitting review: ' + errorMessage);
        }
      } catch (error) {
        console.error('Error submitting review:', error);
        alert('Error submitting review: ' + error.message);
      }
    }
  },
};
</script>

<style scoped>
.leave-review-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
  background-color: #f8f8f8;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.rating-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.star {
  margin: 0 10px;
  font-size: 30px;
  cursor: pointer;
  color: #ccc;
  transition: color 0.3s;
}

.star.selected {
  color: #ffc107; /* Gold color for selected stars */
}

.review-textarea {
  width: 90%;
  height: 300px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  margin-bottom: 20px;
  resize: none;
}

.submit-button {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  display: block;
  margin: 0 auto;
}

.submit-button:hover {
  background-color: #218838;
}
</style>
