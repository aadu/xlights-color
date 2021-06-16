import {createApp} from 'vue';
import App from '/@/App.vue';
import router from '/@/router';
import PrimeVue from 'primevue/config';
import Button from 'primevue/button';
import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import { store, key } from './store'

createApp(App)
  .use(router)
  .use(PrimeVue, {ripple: true})
  .use(store, key)
  .component('p-btn', Button)
  .mount('#app');
