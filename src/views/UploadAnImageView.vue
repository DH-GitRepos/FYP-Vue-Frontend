<script setup>
import { onMounted, ref, defineProps, inject } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex'; // npm install vuex@next --save

const logger = inject('logger'); // Inject the log function from the main.js setup
const v = 'UploadAnImageView'; // Define the page name
const log = (log_val) => logger(v, log_val); // Create a log function with the page name

const store = useStore();

// Define props
const props = defineProps({
  PageName: {
    type: String,
    required: true
  }
});

let droppedFile;
let dropZone = ref(null);
let imageUploadSelect = ref(null);
let loading = ref(false); // Add a new reactive property for loading state
let response = ref(null); // Add a new reactive property for the response
let backgroundImage = ref(''); // Add a new reactive property for the background image
const router = useRouter();
// const store = useStore();
const image = ref(null);

const uploadImage = (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onloadend = function() {
    store.dispatch('storeImage', reader.result);
  }
  reader.readAsDataURL(file);
};

onMounted(() => {
  // Add event listener for dragenter
  dropZone.value.addEventListener('dragenter', function(e) {
    e.preventDefault(); // This is necessary to allow a drop
    dropZone.value.style.borderColor = 'white'; // Change border color to white
  });

  // Add event listener for dragover
  dropZone.value.addEventListener('dragover', function(e) {
    e.preventDefault(); // This is necessary to allow a drop
    e.dataTransfer.dropEffect = 'copy'; // Visual feedback
  });

  // Add event listener for dragleave
  dropZone.value.addEventListener('dragleave', function(e) {
    e.preventDefault(); // This is necessary to allow a 
    dropZone.value.style.borderColor = ''; // Reset border color
  });
  
  // Add event listener for drop
  dropZone.value.addEventListener('drop', function(e) {
      e.preventDefault(); // This is necessary to handle the drop
      // Get the files from the event
      const files = e.dataTransfer.files;
      // Store the first dropped file in the droppedFile variable
      droppedFile = files[0];
      // Set the image in the store
      uploadImage({ target: { files: [droppedFile] } });
      // Create a new element to display the file name
      const fileNameDisplay = document.getElementById('draggedInFile');
      // Set the text content of the new element to the file name
      fileNameDisplay.textContent = 'Selected file: ' + droppedFile.name;
      // Clear the file input field
      imageUploadSelect.value.value = '';
  });

  // Form submission listener
  document.getElementById('uploadForm').addEventListener('submit', function(e) {
      e.preventDefault();
      // Create a new FormData object
      const formData = new FormData();      

      // Check if a file has been dropped
      if (droppedFile) {
        // Append the dropped file to the FormData object
        formData.append('file', droppedFile);
      } else if (imageUploadSelect.value.files.length > 0) {
        // Append the selected file to the FormData object
        formData.append('file', imageUploadSelect.value.files[0]);
      } else {
        // No file has been dropped or selected
        alert('Please drop a file or select a file.');
        return;
      }

      // Show the loading spinner
      loading.value = true;

      // Set up an an AJAX request and send the form data
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://127.0.0.1:5000/upload', true);

      xhr.onload = function() {
        // Hide the loading spinner when the request is complete
        loading.value = false;
        // Check if the response status is 200 OK
        if (xhr.status === 200) {
          // Parse the response as JSON and store it in the response variable
          response.value = JSON.parse(xhr.responseText);

          log("SERVER RESPONSE:")
          log(response.value);

          // Navigate to TagAnImageView.vue with response and image as params
          store.commit('setResponse', JSON.parse(xhr.responseText));
          // store.commit('setImage', backgroundImage.value);

          router.push({ name: 'tag' });
        } else {
          // Handle error
          console.error('(UPLOAD PAGE): An error occurred:', xhr.statusText);
        }
      };

      xhr.send(formData);
  });

  // Add event listener for the clear button
  document.getElementById('clearButton').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('processing').classList.remove('hidden'); // Hide the processing message
    // Clear the droppedFile variable
    droppedFile = null;
    // Clear the file input field
    imageUploadSelect.value.value = '';
    // Clear the file name display
    document.getElementById('draggedInFile').textContent = '';
    dropZone.value.style.borderColor = ''; // Reset border color
  });

  // Add event listener for file input change
  imageUploadSelect.value.addEventListener('change', function(e) {
    // Clear the droppedFile variable
    droppedFile = null;
    // Clear the file name display
    document.getElementById('draggedInFile').textContent = '';
  });

});
</script>

<template>

  <div>
    <h1 class="font-bold text-[2em]">Upload</h1>
    <p>Upload an image to the library</p>
  </div>

  <section id="uploadSelect" class="">

    <form id="uploadForm" class="box-border ml-auto mr-auto mt-[20px] w-[500px] p-[20px] border-solid border-black border-[2px] rounded-lg">
      
      <p class="text-center">
        <label for="image">Select an image:</label>
      </p>

      <p class="text-center">  
        <input type="file" @change="uploadImage" id="imageUploadSelect" ref="imageUploadSelect" name="image" accept="image/*" class="mt-[10px] p-[5px] bg-gray-900 text-white border-solid border-gray-700 border-[1px] rounded-md">
      </p>      

      <aside id="uploadDragAndDrop" ref="dropZone" :style="{ backgroundImage: `url(${backgroundImage})` }" class="mx-auto my-[30px] w-[95%] h-[300px] pt-[130px] border-dashed border-black border-[2px] rounded-lg">
        <p>Or drag and drop an image here</p>
        <p id="draggedInFile" class="text-green-700 font-bold"></p>
        <p id="processing" class="hidden"><strong>Processing image...</strong></p>
      </aside>
      
      <div v-if="loading" class="loader"></div> <!-- Loading spinner -->

      <p class="text-center">
        <button type="submit" class="mt-[10px] p-[5px] bg-gray-900 text-white border-solid border-gray-700 border-[1px] rounded-md">Upload</button>
        <button id="clearButton" class="mt-[10px] ml-[10px] p-[5px] bg-gray-900 text-white border-solid border-gray-700 border-[1px] rounded-md">Clear selection</button>
      </p>

    </form>   

  </section>  

  <pre v-if="response">Number of faces found: {{ response.num_faces }}</pre>

</template>

<style scoped>
.hidden {
  display: none;
}

.loader {
  border: 16px solid #f3f3f3;
  border-radius: 50%;
  border-top: 16px solid #3498db;
  width: 80px;
  height: 80px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>