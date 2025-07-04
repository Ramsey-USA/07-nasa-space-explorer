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

// Function to open the modal with image or video info
function openModal(photo) {
  // Remove any previous video or link
  const oldVideo = document.getElementById('modalVideo');
  if (oldVideo) oldVideo.remove();
  const oldLink = document.getElementById('modalVideoLink');
  if (oldLink) oldLink.remove();

  if (photo.media_type === 'image') {
    modalImg.style.display = '';
    modalImg.src = photo.url;
    modalImg.alt = photo.title;
  } else if (photo.media_type === 'video') {
    modalImg.style.display = 'none';
    // Try to embed video if it's from YouTube or Vimeo
    let embedUrl = '';
    if (photo.url.includes('youtube.com') || photo.url.includes('youtu.be')) {
      // Convert to embed URL
      const videoId = photo.url.split('v=')[1]?.split('&')[0] || photo.url.split('youtu.be/')[1];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (photo.url.includes('vimeo.com')) {
      const videoId = photo.url.split('vimeo.com/')[1];
      embedUrl = `https://player.vimeo.com/video/${videoId}`;
    }
    if (embedUrl) {
      const iframe = document.createElement('iframe');
      iframe.id = 'modalVideo';
      iframe.src = embedUrl;
      iframe.width = '100%';
      iframe.height = '360';
      iframe.style.maxWidth = '700px';
      iframe.style.maxHeight = '60vh';
      iframe.style.border = 'none';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      modalImg.insertAdjacentElement('beforebegin', iframe);
    } else {
      // If not embeddable, show a link
      const link = document.createElement('a');
      link.id = 'modalVideoLink';
      link.href = photo.url;
      link.target = '_blank';
      link.textContent = 'Watch Video';
      link.style.display = 'block';
      link.style.fontSize = '1.2rem';
      link.style.color = '#0b3d91';
      link.style.margin = '20px 0';
      link.style.fontWeight = 'bold';
      modalImg.insertAdjacentElement('beforebegin', link);
    }
  }
  modalTitle.textContent = photo.title;
  // Add the date below the title in the modal
  if (!document.getElementById('modalDate')) {
    const dateElem = document.createElement('div');
    dateElem.id = 'modalDate';
    dateElem.style.fontFamily = 'Inter, Public Sans, Source Sans Pro, Helvetica, Arial, Verdana, sans-serif';
    dateElem.style.fontWeight = 'bold';
    dateElem.style.fontSize = '1.1rem';
    dateElem.style.color = '#fc3d21';
    dateElem.style.marginBottom = '10px';
    dateElem.style.letterSpacing = '1px';
    modalTitle.insertAdjacentElement('afterend', dateElem);
  }
  document.getElementById('modalDate').textContent = photo.date;
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
      const items = Array.isArray(data) ? data : [data];

      // If there are no items, show a message
      if (!items.length) {
        gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">😢</div><p>No images found for this date range.</p></div>`;
        return;
      }

      // Build the gallery HTML with images and videos
      gallery.innerHTML = items.map((photo, idx) => {
        if (photo.media_type === 'image') {
          return `
            <div class="gallery-item">
              <img src="${photo.url}" alt="${photo.title}" data-idx="${idx}" style="cursor:pointer;" />
              <div class="image-label">
                <div>${photo.title}</div>
                <div style="font-size: 0.95em; font-weight: normal; opacity: 0.85; margin-top: 2px;">${photo.date}</div>
              </div>
            </div>
          `;
        } else if (photo.media_type === 'video') {
          const thumb = photo.thumbnail_url || 'https://upload.wikimedia.org/wikipedia/commons/7/75/Video-Icon.png';
          return `
            <div class="gallery-item">
              <div style="position:relative;">
                <img src="${thumb}" alt="Video: ${photo.title}" data-idx="${idx}" style="cursor:pointer; filter:brightness(0.7);" />
                <span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:48px;color:#fc3d21;pointer-events:none;">▶</span>
              </div>
              <div class="image-label">
                <div>${photo.title} <span style="font-size:0.9em; color:#fc3d21;">[Video]</span></div>
                <div style="font-size: 0.95em; font-weight: normal; opacity: 0.85; margin-top: 2px;">${photo.date}</div>
              </div>
            </div>
          `;
        }
      }).join('');

      // Add click event to each image or video to open the modal
      const galleryImages = gallery.querySelectorAll('img');
      galleryImages.forEach((img, i) => {
        img.addEventListener('click', () => {
          openModal(items[i]);
        });
      });
    })
    .catch(error => {
      // Show an error message if something goes wrong
      gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">❌</div><p>Could not load images. Please try again later.</p></div>`;
      console.error('Error fetching NASA images:', error);
    });
});

// Show a random "Did You Know?" NASA fact on page load
const facts = [
  "NASA was established in 1958 as the United States' space agency.",
  "The Hubble Space Telescope has been orbiting Earth since 1990.",
  "The first human on the Moon was Neil Armstrong in 1969.",
  "NASA's Mars rovers have discovered evidence of ancient water on Mars.",
  "The International Space Station orbits Earth about every 90 minutes.",
  "NASA's Voyager 1 is the farthest human-made object from Earth.",
  "The James Webb Space Telescope can see galaxies over 13 billion light-years away.",
  "NASA's logo is nicknamed the 'meatball' and the 'worm'.",
  "The Apollo missions brought back 842 pounds of Moon rocks.",
  "NASA's Perseverance rover landed on Mars in 2021."
];

const factBox = document.getElementById('fact');
if (factBox) {
  const randomFact = facts[Math.floor(Math.random() * facts.length)];
  factBox.textContent = randomFact;
}
