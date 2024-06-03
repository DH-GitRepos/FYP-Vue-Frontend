<script setup>
import { computed, onMounted, ref, defineProps, reactive, inject, toRefs } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

// Define props
const props = defineProps({
  PageName: {
    type: String,
    required: true
  }
});

// Get the route instance
const route = useRoute();
const imageID = route.params.id; // Access the id parameter from the route
const logger = inject('logger'); // Inject the log function from the main.js setup
const v = 'ShowAnImageView'; // Define the page name
const log = (log_val) => logger(v, log_val); // Create a log function with the page name

// Get the stored params and assign them to constants
const store = useStore();
const response = computed(() => store.state.response);
let names_string = ref('');
let isOverlayVisible = ref(false);
let img_url = ref('');
let responseData = ref(null); // New ref to hold the response data

const toggleOverlay = () => {
  isOverlayVisible.value = !isOverlayVisible.value;
  if (isOverlayVisible.value) {
    document.getElementById('displayImageOverlay').src = document.getElementById('displayImage').src;
  }
  else {
    document.getElementById('displayImageOverlay').src = '';
  }
};

onMounted(async () => {

  const requestPayload = {
    "req_type": "get_image",
    "imgID": imageID
  };

  const JSONPayload = JSON.stringify(requestPayload);

  log("CLIENT REQUEST (Initialise->API Parameters):");
  log(JSONPayload);

  const response = await fetch('http://127.0.0.1:5000/image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSONPayload,
  });

  if (response.ok) {
    const data = await response.json();
    responseData.value = data; // Update responseData with the fetched data
    log("SERVER RESPONSE (Image data found):")
    log("RESPOSE DATA:"); // Output the server response to the console
    log(data); // Output the server response to the console
    
    // let img_url = data.content.img_url;
    let names = data.content.tagged_faces;
    let names_length = names.length;

    log(`NAMES FOUND: ${names_length}`);
    log(`NAMES FOUND: ${names[0]}`);

    if (names_length === 0) {
      names_string.value = "No tagged faces.";
    }
    else if (names_length === 1) {
      names_string.value = names[0];
    }
    else if (names_length === 2) {
      names_string.value = names.join(" and ");
    }
    else {
      names_string.value = names.join(", ");
    }

    // SET URL OF IMAGE TO THE img_url VALUE IN THE RETURNED DATA
    img_url.value = data.content.img_url;   

  } else {
    console.error('HTTP-Error: ' + response.status);
  }

});
</script>

<template>

  <div>
    <h1 class="font-bold text-[2em]">View Image</h1>
    <p>Display an image and its tagged data.</p>
  </div>

  <section id="tagFaces" class="">

    <img id="displayImage" :src="img_url" class="mx-auto my-[20px] max-h-80 max-w-96 rounded-lg cursor-pointer" @click="toggleOverlay">

    <div v-if="responseData" class="mb-[20px]">
      <pre>Image ID: {{ responseData.timestamp }}<br />People in this image: <br><strong>{{ names_string }}</strong></pre>
    </div>      

  </section> 
  
  <div v-show="isOverlayVisible" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center cursor-pointer" @click="toggleOverlay">
    <img id="displayImageOverlay" src="" class="p-[5%] max-h-[98%] rounded-lg">
  </div>

</template>

<style scoped>

</style>