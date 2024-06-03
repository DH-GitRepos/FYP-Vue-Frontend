<script setup>
import { onMounted, ref, inject } from 'vue';

const props = defineProps({
  PageName: {
    type: String,
    required: true
  }
});

const getViewLink = (str) => {
  const url = new URL(str);
  const filenameWithExtension = url.pathname.split('/').pop();
  const filenameWithoutExtension = filenameWithExtension.split('.').slice(0, -1).join('.');
  const newpathstr = `image/${filenameWithoutExtension}`;
  return newpathstr;
};

const images = ref([]);  // reactive property to hold the image URLs
const logger = inject('logger'); // Inject the log function from the main.js setup
const v = 'AllImagesView'; // Define the page name
const log = (log_val) => logger(v, log_val); // Create a log function with the page name

onMounted(async () => {

  const requestPayload = {
    "req_type": "get_all_images"
  };

  const JSONPayload = JSON.stringify(requestPayload);

  log("CLIENT REQUEST (Initialise->API Parameters):");
  log(JSONPayload);

  const response = await fetch('http://127.0.0.1:5000/library', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSONPayload,
  });

  if (response.ok) {
    const data = await response.json();
    log("SERVER RESPONSE (Images found):")
    log(data); // Output the server response to the console
    images.value = data.content; // Update the images data with the content property of the response data
  } else {
    // error_message = 'HTTP-Error: ' + response.status;
    console.error('HTTP-Error: ' + response.status);
  }

});
</script>

<template>

  <div>
    <h1 class="font-bold text-[2em]">Home</h1>
    <p>Image library</p>
  </div>

  <section id="errorMessage"></section>

  <section id="allImages" class="masonry-container mx-4 my-8">
    <div v-for="(image, index) in images" class="masonry-item">
      <a :href="getViewLink(image)">
        <img :key="index" :src="image" alt="Library image" class="w-full h-auto object-cover rounded-3xl drop-shadow-xl cursor-pointer">
      </a>
    </div>
  </section>
  
</template>

<style scoped>
.masonry-container {
  column-count: 4;
  column-gap: 1em;
}
.masonry-item {
  break-inside: avoid;
  margin-bottom: 1em;
}
</style>