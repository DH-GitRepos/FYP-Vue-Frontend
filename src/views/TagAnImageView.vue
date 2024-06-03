<script setup>
import { computed, onMounted, ref, defineProps, reactive, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

const router = useRouter(); // Get the router instance

const logger = inject('logger'); // Inject the log function from the main.js setup
const v = 'TagAnImageView'; // Define the page name
const log = (log_val) => logger(v, log_val); // Create a log function with the page name

// Define props
const props = defineProps({
  PageName: {
    type: String,
    required: true
  }
});

// Get the route instance
const route = useRoute();

// Get the stored params and assign them to constants
const store = useStore();
const image = ref(store.state.image);
const response = computed(() => store.state.response);
const timestamp = computed(() => store.state.response.timestamp);
const tagData = computed(() => store.state.response.tag_data);

// Computed property that maps tag_data to an object
const tagDataMap = computed(() => {
  const map = {};
  
  tagData.value.forEach(tag => {
    map[tag.id] = {
      id: tag.id,
      name: tag.name,
      tagged: tag.tagged,
      timestamp: tag.timestamp,
      uid: tag.uid
    };
  });
  return map;
});

const canvas = ref(null); // Reference to the canvas element
const checkboxes = reactive({}); // Define checkboxes as a reactive object
const textInputs = reactive({}); // Define text inputs as a reactive object

onMounted(() => {
  // Initialise checkboxes and textInputs for each face
  response.value.faces.forEach((face, index) => {
    checkboxes[face.id] = false;
    textInputs[face.id] = getPersonNameByID(face.id) || '';
  });

  // Create a new image object
  const img = new Image();

  // Draw the image onto the canvas when it loads
  img.onload = () => {
    let imgWidth = img.naturalWidth;
    let imgHeight = img.naturalHeight;
    let canvasWidth = canvas.value.width;
    // Calculate the scale factor for width
    let scale = canvasWidth / imgWidth;
    // Calculate the scaled height
    let scaledHeight = imgHeight * scale;
    // Set the height of the canvas to the height of the scaled image
    canvas.value.height = scaledHeight;
    // Draw the image onto the canvas
    const ctx = canvas.value.getContext('2d');
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
    ctx.drawImage(img, 0, 0, imgWidth, imgHeight, 0, 0, canvasWidth, scaledHeight);
    
    // Draw the face rectangles
    response.value.faces.forEach((face) => {
      log("Face:");
      log(face);
      drawFaceOutline(scale, scale, face.pos_x, face.pos_y, face.pos_width, face.pos_height, face.id);
    });

    log("CHECKING CONTENTS OF TAGDATA ARRAY:");
    tagData.value.forEach((tag) => {
      log("Face:");
      log(tag);
    });

  };

  // Set the source of the image
  if (image.value instanceof File) {
    img.src = URL.createObjectURL(image.value);
  } else {
    img.src = image.value;
  }

  // EVENT LISTENER: Submitting the form
  document.getElementById('tagFacesForm').addEventListener('submit', function(e) {
      e.preventDefault();

      // Create a new object to store the form data
      const data = {
        tsp: timestamp.value,
        faces: []
      };

      let id = 0;
      let name = '';
      let checkbox = '';
      let tagged = '';
      let uid = '';
      
      for (let faceId in checkboxes) {
        let tag_item = {};
        
        tag_item['id'] = faceId;
        tag_item['name'] = textInputs[faceId];
        tag_item['checkbox'] = checkboxes[faceId] ? 'on' : 'off';
        tag_item['tagged'] = document.getElementById(`person-${faceId}-tagged`).value;
        tag_item['uid'] = document.getElementById(`person-${faceId}-uid`).value;
        
        data.faces.push(tag_item);
      }
      
      // Convert the object to a JSON string
      const jsonString = JSON.stringify(data);

      log("JSON String:");
      log(jsonString);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://127.0.0.1:5000/tag', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(jsonString);

      // Redirect to the image viewer page
      router.push({ name: 'image', params: { id: timestamp.value } });

  });

});

// Function to draw the face rectangles on the canvas
function drawFaceOutline(scaleX, scaleY, x, y, w, h, labelText) 
{
  // Draw the face rectangles
  const ctx = canvas.value.getContext('2d');
  ctx.strokeStyle = '#00ff00'; // Green outline
  // Draw the outline
  ctx.strokeRect(x*scaleX, y*scaleY, w*scaleX, h*scaleY); // x, y, width, height
  // Draw the label
  ctx.fillStyle = 'white';
  ctx.fillRect(x*scaleX, (y+h)*scaleY, 10, 10); // x, y, width, height
  // Draw the text
  ctx.fillStyle = 'black';
  ctx.font = '9px Arial';
  ctx.fillText(labelText, (x*scaleX)+2, ((y+h)*scaleY)+9); // text, x, y
}

// Function to get the name of a person by their id
function getPersonNameByID(id) {
  // Find the tag with the matching id
  const tag = tagData.value.find(tag => tag.id === id);
  // If a matching tag is found, return its name. Otherwise, return null.
  return tag ? tag.name : null;
}

// Function to get the tagged status of a person by their id
function getTaggedById(id) {
  return tagDataMap.value[id]?.tagged || 'false';
}

// Function to get the UID of a person by their id
function getUidById(id) {
  return tagDataMap.value[id]?.uid || 'X';
}

</script>

<template>

  <div>
    <h1 class="font-bold text-[2em]">Tag Image</h1>
    <p>Tag faces detected in the image.</p>
  </div>

  <section id="tagFaces" class="">

    <form id="tagFacesForm" class="box-border ml-auto mr-auto mt-[20px] w-[500px] p-[20px] border-solid border-black border-[2px] rounded-lg">
      
      <input type="hidden" name="tsp" :value="`${timestamp}`">

      <canvas id="displayImageToTag" ref="canvas" class="bg-gray-900 mx-auto my-[20px] w-[95%] h-[auto] border-dashed border-black border-[2px] rounded-lg"></canvas>

      <div v-if="response" class="mb-[20px]">
        <pre>Image ID: {{ response.timestamp }}<br />Number of faces found: {{ response.num_faces }}</pre>
      </div>      

      <section id="addTagsToImage">        
      <!-- ADD FIELDS FOR TAGGING FACES -->

        <aside v-for="(face, index) in response.faces"
               :key="face.id" 
               :id="`person-${face.id}-container`" 
               class="flex flex-row justify-between items-center mb-[10px]">
          
          <label :for="`person-${face.id}`">Person {{face.id}}: </label>
          <input type="text"
                 v-model="textInputs[face.id]"
                :id="`person-${face.id}`" 
                :name="`person-${face.id}-name`" 
                :placeholder="`Person ${face.id}`" 
                 class="p-[5px] bg-gray-900 text-white border-solid border-gray-700 border-[1px] rounded-md">
                    
          <label :for="`person-${face.id}-checkbox`">Tag this person: </label>
          <input type="checkbox" 
                 v-model="checkboxes[face.id]"
                :id="`person-${face.id}-checkbox`" 
                :name="`person-${face.id}-checkbox`" 
                 class="cursor-pointer">

          <input type="hidden" :id="`person-${face.id}-tagged`" :name="`person-${face.id}-tagged`" :value="getTaggedById(face.id)">
          <input type="hidden" :id="`person-${face.id}-uid`" :name="`person-${face.id}-uid`" :value="getUidById(face.id)">

        </aside>

      </section>

      
      <p class="text-center">
        <button type="submit" class="mt-[10px] p-[5px] bg-gray-900 text-white border-solid border-gray-700 border-[1px] rounded-md">Tag selected images</button>
        <!--
        <button id="clearButton" class="mt-[10px] ml-[10px] p-[5px] bg-gray-900 text-white border-solid border-gray-700 border-[1px] rounded-md">Clear selection</button>
          -->
      </p>
      

    </form>   

  </section>    

</template>

<style scoped>

</style>