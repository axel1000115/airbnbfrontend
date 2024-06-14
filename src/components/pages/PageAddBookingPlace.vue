<template>
    <div class="add-camping-spot-container">
      <h1>Add a new camping spot</h1>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="spotName">Spot Name:</label>
          <input type="text" id="spotName" v-model="spotName" required>
        </div>
        <div class="form-group">
          <label for="description">Description:</label>
          <input type="text" id="description" v-model="description" required>
        </div>
        <div class="form-group">
          <label for="price">Price:</label>
          <input type="number" id="price" v-model="price" required>
        </div>
        <div class="form-group">
          <label for="longitude">Longitude:</label>
          <input type="number" step="0.0001" id="longitude" v-model="longitude" required>
        </div>
        <div class="form-group">
          <label for="latitude">Latitude:</label>
          <input type="number" step="0.0001" id="latitude" v-model="latitude" required>
        </div>
        <div class="form-group">
          <label for="country">Country:</label>
          <input type="text" id="country" v-model="country" required>
        </div>
        <div class="form-group">
          <label for="city">City:</label>
          <input type="text" id="city" v-model="city" required>
        </div>
        <div class="form-group">
          <label for="image">Image:</label>
          <input type="file" @change="onFileChange" accept="image/*" required>
        </div>
        <button type="submit" class="submit-button">Add Camping Spot</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    name: "PageAddBookingPlace",
    props: {
      userId: {
        type: Number,
        required: true
      }
    },
    data() {
      return {
        spotName: '',
        description: '',
        price: null,
        longitude: null,
        latitude: null,
        country: '',
        city: '',
        imageFile: null
      };
    },
    methods: {
      onFileChange(event) {
        this.imageFile = event.target.files[0];
      },
      async submitForm() {
        try {
          // First, add the location
          const locationResponse = await fetch('https://localhost:7170/Location', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              longitude: this.longitude,
              latitude: this.latitude,
              country: this.country,
              city: this.city
            })
          });
  
          if (!locationResponse.ok) {
            const errorText = await locationResponse.text();
            throw new Error(`Failed to add location: ${errorText}`);
          }
  
          const locationData = await locationResponse.json();
  
          // Then, add the camping spot with the location ID
          const campingSpotResponse = await fetch(`https://localhost:7170/Owner/${this.userId}/addCampingSpot`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              locationID: locationData.locationID,
              spotName: this.spotName,
              description: this.description,
              price: this.price
            })
          });
  
          if (!campingSpotResponse.ok) {
            const errorText = await campingSpotResponse.text();
            throw new Error(`Failed to add camping spot: ${errorText}`);
          }
  
          const campingSpotData = await campingSpotResponse.json();
  
          // Add the image for the camping spot
          const formData = new FormData();
          formData.append('campingSpotID', campingSpotData.campingSpotID);
          formData.append('image', this.imageFile);
  
          const imageResponse = await fetch('https://localhost:7170/Owner/addImage', {
            method: 'POST',
            body: formData
          });
  
          if (!imageResponse.ok) {
            const errorText = await imageResponse.text();
            throw new Error(`Failed to add image: ${errorText}`);
          }
  
          alert('Camping spot and image added successfully!');
        } catch (error) {
          console.error('Error:', error);
          alert(`An error occurred while adding the camping spot: ${error.message}`);
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .add-camping-spot-container {
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
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    color: #555;
  }
  
  input[type="text"],
  input[type="number"],
  input[type="file"] {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-sizing: border-box;
  }
  
  .submit-button {
    background-color: #28a745;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .submit-button:hover {
    background-color: #218838;
  }
  </style>
  