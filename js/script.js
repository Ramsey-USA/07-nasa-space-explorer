// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Find the button and gallery elements
const getImagesButton = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');

// Your NASA API key
const apiKey = 'HnqknKiDoqKmVnOv1T3xLd6E0WvjjJbJn2267ecS';

// Modal elements
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalClose = document.getElementById('modalClose');

// Function to open the modal with image info
function openModal(photo) {
  modalImg.src = photo.url;
  modalImg.alt = photo.title;
  modalTitle.textContent = photo.title;
  modalDesc.textContent = photo.explanation;
  modal.style.display = 'flex';
}

// Function to close the modal
function closeModal() {
  modal.style.display = 'none';
  modalImg.src = '';
}

// Close modal when clicking the close button or outside the modal content
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

// Listen for button click to fetch images
getImagesButton.addEventListener('click', () => {
  // Get the selected start and end dates
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Show a loading message
  gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">🚀</div><p>Loading images...</p></div>`;

  // Build the NASA APOD API URL
  const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

  // Fetch data from NASA's API
  fetch(url)
    .then(response => response.json())
    .then(data => {
      // If the API returns a single object, put it in an array
      const images = Array.isArray(data) ? data : [data];

      // Filter out any results that are not images (e.g., videos)
      const photos = images.filter(item => item.media_type === 'image');

      // If there are no images, show a message
      if (photos.length === 0) {
        gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">😢</div><p>No images found for this date range.</p></div>`;
        return;
      }

      // Build the gallery HTML with images and labels (titles)
      gallery.innerHTML = photos.map((photo, idx) => `
        <div class="gallery-item">
          <img src="${photo.url}" alt="${photo.title}" data-idx="${idx}" style="cursor:pointer;" />
          <div class="image-label">${photo.title}</div>
        </div>
      `).join('');

      // Add click event to each image to open the modal
      const galleryImages = gallery.querySelectorAll('img');
      galleryImages.forEach((img, i) => {
        img.addEventListener('click', () => {
          openModal(photos[i]);
        });
      });
    })
    .catch(error => {
      // Show an error message if something goes wrong
      gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">❌</div><p>Could not load images. Please try again later.</p></div>`;
      console.error('Error fetching NASA images:', error);
    });
});
