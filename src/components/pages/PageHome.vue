<template>
  <div class="page-home">
    <!-- Container for the city dropdown and apply filter button -->
    <div class="filter-container">
      <select v-model="selectedCity" class="location-dropdown">
        <option value="">All Cities</option>
        <option v-for="city in uniqueCities" :key="city" :value="city">
          {{ city }}
        </option>
      </select>
      <button @click="filterLocations" class="apply-button">Apply Filter</button>
    </div>
    <!-- Container for the amenities icons -->
    <div class="amenities-container">
      <label v-for="amenity in amenities" :key="amenity.amenityID" class="amenity-item">
        <img :src="getAmenityIcon(amenity.name)" class="amenity-icon" alt="Amenity Icon">
        <p class="amenity-name">{{ amenity.name }}</p>
        <input 
          type="checkbox" 
          :value="amenity.amenityID" 
          v-model="selectedAmenities" 
          class="amenity-checkbox">
      </label>
    </div>
    <!-- Container for all camping spot sliders -->
    <div class="camping-spot-sliders">
      <!-- Image slider for each Camping Spot -->
      <div v-for="(images, campingSpotID) in filteredCampingSpotImages" :key="campingSpotID" class="camping-spot-slider slider-container">
        <div class="carousel-wrapper">
          <button @click="goToPrev(campingSpotID)" class="carousel-arrow prev-arrow">&lt;</button>
          <Carousel 
            v-if="images.length > 0" 
            :ref="carouselRefName(campingSpotID)"
            :navigation-enabled="true" 
            :pagination-enabled="false" 
            class="slider">
            <Slide v-for="image in images" :key="image.campingSpotImageID">
              <img :src="image.image" alt="Camping Spot Image" class="slider-image">
            </Slide>
          </Carousel>
          <button @click="goToNext(campingSpotID)" class="carousel-arrow next-arrow">&gt;</button>
        </div>
        <div class="spot-details">
          <h4>{{ getSpotName(campingSpotID) }}</h4>
          <p>Price: ${{ getSpotPrice(campingSpotID) }} per night</p>
          <p>Owner: {{ getOwnerName(campingSpotID) }}</p>
          <button @click="bookNow(campingSpotID)" class="book-now-button">Book Now</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Carousel, Slide } from 'vue3-carousel';
import 'vue3-carousel/dist/carousel.css';

export default {
  name: "PageHome",
  components: {
    Carousel,
    Slide
  },
  data() {
    return {
      locations: [],
      amenities: [],
      campingSpotImages: [],
      campingSpots: [],
      owners: [],
      campingspotAmenities: [],
      selectedCity: "",
      selectedAmenities: [],
      filteredCampingSpots: []
    };
  },
  computed: {
    uniqueCities() {
      const cities = [
        'San Francisco',
        'Albuquerque',
        'Napa',
        'Los Angeles',
        'Santa Barbara',
        'Las Vegas'
      ];
      return cities;
    },
    groupedCampingSpotImages() {
      return this.campingSpotImages.reduce((acc, image) => {
        if (!acc[image.campingSpotID]) {
          acc[image.campingSpotID] = [];
        }
        acc[image.campingSpotID].push(image);
        return acc;
      }, {});
    },
    filteredCampingSpotImages() {
      const filteredSpotIDs = this.filteredCampingSpots.map(spot => spot.campingSpotID);
      return Object.fromEntries(Object.entries(this.groupedCampingSpotImages).filter(([key]) => filteredSpotIDs.includes(Number(key))));
    }
  },
  methods: {
    fetchLocations() {
      fetch('https://localhost:7170/Location')
        .then(response => response.json())
        .then(data => {
          this.locations = data;
        })
        .catch(error => {
          console.error('Error fetching locations:', error);
        });
    },
    fetchAmenities() {
      fetch('https://localhost:7170/Amenities')
        .then(response => response.json())
        .then(data => {
          this.amenities = data;
        })
        .catch(error => {
          console.error('Error fetching amenities:', error);
        });
    },
    fetchCampingSpotImages() {
      fetch('https://localhost:7170/CampingspotImage')
        .then(response => response.json())
        .then(data => {
          const images = require.context('@/assets/campingspotimages', false, /\.(png|jpg|jpeg)$/);

          this.campingSpotImages = data
            .filter(image => image.image)
            .map(image => {
              const fileName = image.image.split('\\').pop();
              try {
                const img = images(`./${fileName}`);
                return {
                  ...image,
                  image: img
                };
              } catch (e) {
                console.error(`Error loading image: ${fileName}`, e);
                return null;
              }
            }).filter(image => image !== null);
        })
        .catch(error => {
          console.error('Error fetching camping spot images:', error);
        });
    },
    fetchCampingSpots() {
      fetch('https://localhost:7170/Campingspot')
        .then(response => response.json())
        .then(data => {
          this.campingSpots = data;
          this.filteredCampingSpots = data; // Show all camping spots by default
        })
        .catch(error => {
          console.error('Error fetching camping spots:', error);
        });
    },
    fetchOwners() {
      fetch('https://localhost:7170/Owner')
        .then(response => response.json())
        .then(data => {
          this.owners = data;
        })
        .catch(error => {
          console.error('Error fetching owners:', error);
        });
    },
    fetchCampingSpotAmenities() {
      fetch('https://localhost:7170/Campingspot_Amenity')
        .then(response => response.json())
        .then(data => {
          this.campingspotAmenities = data;
        })
        .catch(error => {
          console.error('Error fetching camping spot amenities:', error);
        });
    },
    filterLocations() {
      let selectedLocationIDs = [];
      if (this.selectedCity === "") {
        selectedLocationIDs = this.locations.map(location => location.locationID);
      } else {
        selectedLocationIDs = this.locations
          .filter(location => location.city === this.selectedCity)
          .map(location => location.locationID);
      }

      let filteredByCity = this.campingSpots.filter(spot => selectedLocationIDs.includes(spot.locationID));

      if (this.selectedAmenities.length > 0) {
        const filteredByAmenities = filteredByCity.filter(spot => {
          const spotAmenities = this.campingspotAmenities
            .filter(ca => ca.campingSpotID === spot.campingSpotID)
            .map(ca => ca.amenityID);
          return this.selectedAmenities.every(amenityID => spotAmenities.includes(amenityID));
        });
        this.filteredCampingSpots = filteredByAmenities;
      } else {
        this.filteredCampingSpots = filteredByCity;
      }
    },
    getSpotName(campingSpotID) {
      const spot = this.campingSpots.find(spot => spot.campingSpotID == campingSpotID);
      return spot ? spot.spotName : 'Unknown Spot';
    },
    getSpotPrice(campingSpotID) {
      const spot = this.campingSpots.find(spot => spot.campingSpotID == campingSpotID);
      return spot ? spot.price : 'Unknown Price';
    },
    getOwnerName(campingSpotID) {
      const owner = this.owners.find(owner => owner.campingSpotID == campingSpotID);
      return owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown Owner';
    },
    getAmenityIcon(name) {
      const icons = {
        'WiFi': require('@/assets/amenities/wifi.png'),
        'Fire pit': require('@/assets/amenities/firepit.png'),
        'Pet-friendly': require('@/assets/amenities/pet-friendly.png'),
        'Hiking Trails': require('@/assets/amenities/hiking-trails.png'),
        'BBQ Grill': require('@/assets/amenities/bbq.png'),
        'Parking for Camper Vans': require('@/assets/amenities/parking.png'),
        'Picnic Table': require('@/assets/amenities/picnic.png'),
        'Water Supply': require('@/assets/amenities/water-supply.png'),
        'Outdoor Kitchen': require('@/assets/amenities/outdoor-kitchen.png'),
        'Nature Viewing Area': require('@/assets/amenities/nature-viewing.png')
      };
      return icons[name] || '';
    },
    bookNow(campingSpotID) {
      this.$emit('book-now', campingSpotID);
    },
    handleBookingConfirmation() {
      this.$router.push({ name: 'Home' });
    },
    carouselRefName(campingSpotID) {
      return `carousel-${campingSpotID}`;
    },
    goToPrev(campingSpotID) {
      const carousel = this.$refs[`carousel-${campingSpotID}`][0];
      if (carousel) {
        carousel.prev();
      }
    },
    goToNext(campingSpotID) {
      const carousel = this.$refs[`carousel-${campingSpotID}`][0];
      if (carousel) {
        carousel.next();
      }
    }
  },
  created() {
    this.fetchLocations();
    this.fetchAmenities();
    this.fetchCampingSpotImages();
    this.fetchCampingSpots();
    this.fetchOwners();
    this.fetchCampingSpotAmenities();
  },
};
</script>

<style scoped>
.page-home {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  margin-top: 20px;
  min-height: 100vh;
}

.filter-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  margin-bottom: 10px;
  position: relative;
  z-index: 1;
}

.location-dropdown {
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
  margin-right: 10px;
  z-index: 2;
}

.location-dropdown option {
  color: black;
}

.apply-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
}

.apply-button:hover {
  background-color: #0056b3;
}

.amenities-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 10px 0;
  width: 100%;
  margin-top: -40px;
}

.amenity-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 10px;
  text-align: center;
  cursor: pointer;
  border: 1px solid transparent;
}

.amenity-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 5px;
}

.amenity-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
}

.amenity-checkbox {
  margin-top: 5px;
}

.camping-spot-sliders {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.camping-spot-slider {
  flex: 0 1 calc(25.33% - 20px);
  margin: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.carousel-wrapper {
  position: relative;
  width: 100%;
  height: 280px; /* Set a fixed height */
  overflow: hidden; /* Ensure overflow is hidden */
  border-radius: 8px; /* Ensure corners of the wrapper are rounded */
}

.slider {
  width: 100%;
  height: 100%; /* Ensure the slider takes up full height */
  margin: 0;
}

.slider-image {
  width: 100%;
  height: 100%; /* Ensure images fill the container */
  object-fit: cover; /* Cover the container without distortion */
  border-radius: 8px; /* Ensure corners of the images are rounded */
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 10px;
  font-size: 18px;
  cursor: pointer;
  z-index: 2;
}

.prev-arrow {
  left: 0;
}

.next-arrow {
  right: 0;
}

.spot-details {
  margin-top: 10px;
  text-align: center;
}

.book-now-button {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.book-now-button:hover {
  background-color: #218838;
}
</style>
