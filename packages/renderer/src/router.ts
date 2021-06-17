import {createRouter, createWebHashHistory} from 'vue-router';
import Palettes from './components/PaletteContainer.vue';

const routes = [
  {path: '/', name: 'Palettes', component: Palettes},
  {path: '/about', name: 'About', component: () => import('/@/components/About.vue')}, // Lazy load route component
];

export default createRouter({
  routes,
  history: createWebHashHistory(),
});
