// router/index.js or similar
import { createRouter, createWebHistory } from 'vue-router';
import PageHome from '@/components/pages/PageHome.vue';
import PagePlaceBooking from '@/components/pages/PagePlaceBooking.vue';
import PageLeaveReview from '@/components/pages/PageLeaveReview.vue';
import PageAddBookingPlace from '@/components/pages/PageAddBookingPlace.vue';  // Import new page
import PageMyProperties from '@/components/pages/PageMyProperties.vue';  // Import new page

const routes = [
  { path: '/', name: 'Home', component: PageHome },
  { path: '/booking/:campingSpotID', name: 'PagePlaceBooking', component: PagePlaceBooking, props: true },
  { path: '/review/:campingSpotID', name: 'PageLeaveReview', component: PageLeaveReview, props: true },
  { path: '/add-booking-place', name: 'PageAddBookingPlace', component: PageAddBookingPlace },  // Add new route
  { path: '/overview-properties', name: 'PageMyProperties', component: PageMyProperties },  // Add new route
  // Add other routes here
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
