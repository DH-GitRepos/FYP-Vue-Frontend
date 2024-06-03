<script setup>
import { ref, onMounted, inject } from 'vue';

const logger = inject('logger'); // Inject the log function from the main.js setup
const v = 'SearchForAPersonView'; // Define the page name
const log = (log_val) => logger(v, log_val); // Create a log function with the page name

// Define props
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

// Define a reactive variable for the people data
const people = ref([]);
const images = ref([]);
const selectedPerson = ref(null);
let req_object = ref(null);
let api_param = {
  "req_type": "init",
  "uid": ""
};

// Fetch people data on component mount
onMounted(async () => {
  api_param["req_type"] = "init";
  log("CLIENT REQUEST (Initialise->API Parameters):");
  log(api_param);
  const response = await fetch('http://127.0.0.1:5000/find', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(api_param)
  });

  if (response.ok) {
    const data = await response.json();
    log("SERVER RESPONSE (People found):")
    log(data); // Output the server response to the console
    people.value = data.content; // Update the people data with the content property of the response data
  } else {
    console.error('HTTP-Error: ' + response.status);
  }
});

// Method to handle form submission
const getImages = async () => {
  api_param['req_type'] = 'req';
  api_param['uid'] = selectedPerson.value.uid;

  log("CLIENT REQUEST (API Parameters):");
  log(api_param);

  const response = await fetch('http://127.0.0.1:5000/find', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(api_param)
  });

  if (response.ok) {
    const data = await response.json();
    log("SERVER RESPONSE (Images found):")
    log(data); // Output the server response to the console
    images.value = data.content; // Update the images data with the content property of the response data
    //log("Images:");
    //log(images.value)
  } else {
    console.error('HTTP-Error: ' + response.status);
  }
};
</script>

<template>

  <div>
      <h1 class="font-bold text-[2em]">Search</h1>
      <p>Find images containing a specific person.</p>
  </div>

  <section id="getPersonImages" class="">

    <form id="getPersonImagesForm" class="box-border ml-auto mr-auto mt-[20px] w-[500px] p-[20px] border-solid border-black border-[2px] rounded-lg">
      
      <section id="selectPerson">        

        <aside class="flex flex-row justify-between items-center mb-[10px]">
          
          <label for="people" class="text-2xl font-bold">Find a person:</label>
          
          <select name="people" id="people" v-model="selectedPerson" class="mt-[10px] p-[5px] bg-gray-700 text-white border-solid border-gray-700 border-[1px] rounded-md">
            <option v-for="(person, index) in people" :key="index" :value="person">{{ person.name }}</option>
          </select>
        
        </aside>

      </section>
      
      <p class="text-center">
        <button @click.prevent="getImages" type="submit" id="button_getImages" class="mt-[10px] p-[5px] bg-gray-900 text-white border-solid border-gray-700 border-[1px] rounded-md">Get images</button>
      </p>      

    </form>   

  </section>

  <section id="allImages" class="masonry-container mx-4 my-8">
    <div v-for="(image, index) in images" class="masonry-item">
      <a :href="getViewLink(image)">
        <img :key="index" :src="image" alt="Person image" class="w-full h-auto object-cover rounded-3xl drop-shadow-xl cursor-pointer">
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