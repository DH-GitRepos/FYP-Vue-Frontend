import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router/index.js'
import store from '@/state/store.js'; // Import the store
import { VueMasonryPlugin } from 'vue-masonry'; // npm install vue-masonry --save

let loggingEnabled = true;

function logger(view_name, data_val) {
  if (loggingEnabled) {
    if (typeof data_val === 'object') {
      console.log(`${view_name}:\n${JSON.stringify(data_val, null, 2)}`);
    } else {
      console.log(`${view_name}:\n${data_val}`);
    }
  }
}

const app = createApp(App)
app.provide('logger', logger); // Provide the log function
app.use(store).use(router).use(VueMasonryPlugin).mount('#app');

// createApp(App)
//   .use(router)
//   .use(store)
//   .use(VueMasonryPlugin)
//   .mount('#app');

import './index.css';
