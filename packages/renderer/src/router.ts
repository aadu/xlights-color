import {createRouter, createWebHashHistory} from 'vue-router';
import Main from './components/Main.vue';

const routes = [
  {path: '/', name: 'Main', component: Main},
  {path: '/about', name: 'About', component: () => import('/@/components/About.vue')}, // Lazy load route component
];

export default createRouter({
  routes,
  history: createWebHashHistory(),
});
