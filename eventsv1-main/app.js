

const glow = document.querySelector(".background-glow");
const cards = document.querySelectorAll(".card");

if (glow) {
  document.addEventListener("mousemove", (e) => {
    const cursorX = e.clientX;
    const cursorY = e.clientY;

    glow.style.left = cursorX + "px";
    glow.style.top = cursorY + "px";

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;

      const distanceX = cursorX - cardCenterX;
      const distanceY = cursorY - cardCenterY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      const maxDistance = 350;
      const intensity = Math.max(0, 1 - distance / maxDistance);

      if (intensity > 0.1) {
        const length = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        const dirX = (distanceX / length) * intensity;
        const dirY = (distanceY / length) * intensity;

        card.style.setProperty("--glow-x", `${dirX * 15}px`);
        card.style.setProperty("--glow-y", `${dirY * 15}px`);
        card.style.setProperty("--glow-intensity", intensity * 0.4);
        card.classList.add("card-glow-active");
      } else {
        card.classList.remove("card-glow-active");
      }
    });
  });
}

// ----------------------------------------
// Slider Animation and Interaction Logic
// ----------------------------------------
const slider = document.querySelector(".slider");
const sliderPrevBtn = document.getElementById("sliderPrevBtn");
const sliderNextBtn = document.getElementById("sliderNextBtn");
const banner = document.querySelector(".banner");
const modalElement = document.getElementById("modal");

let currentRotation = 0;
let targetRotation = 0;
let isHovering = false;
let autoRotateSpeed = 0.2; // Degrees per frame (slower)
let autoRotateEnabled = true; // turns false when user intervenes (wheel / buttons)
let animationFrameId;
let inactivityTimer = null; // re-enable auto-rotate after timeout
let snapTimer = null; // delayed snap to nearest card

let isDragging = false;
let startX = 0;

// Update rotation smoothly
function animateSlider() {
  const isModalOpen = modalElement && modalElement.style.display !== "none" && modalElement.classList.contains("show");

  if (!isModalOpen) {
    if (autoRotateEnabled && !isHovering && !isDragging) {
      targetRotation += autoRotateSpeed;
    }
    
    // Smoothly interpolate currentRotation towards targetRotation
    currentRotation += (targetRotation - currentRotation) * 0.1;
    
    if (slider) {
      slider.style.setProperty("--rotation", `${currentRotation}deg`);
      
      const centerBanner = document.querySelector(".center-banner");
      if (centerBanner) {
        // Counter-rotate to negate the slider's rotation
        centerBanner.style.transform = `translate(-50%, -50%) rotateY(${-currentRotation}deg) rotateX(16deg)`;
      }
    }
  }
  
  animationFrameId = requestAnimationFrame(animateSlider);
}

if (slider) {
  // Start animation loop
  animateSlider();

  // Hover detection: pause only when hovering an individual card
  const items = document.querySelectorAll('.item');
  items.forEach(it => {
    it.addEventListener('mouseenter', () => { isHovering = true; });
    it.addEventListener('mouseleave', () => { isHovering = false; });
  });

  
  // Scroll logic (work anywhere on the page)
  function userInteracted() {
    // disable auto-rotation and reset inactivity timer
    autoRotateEnabled = false;
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      autoRotateEnabled = true;
    }, 10000); // 10s
    // schedule snap after short gap
    if (snapTimer) clearTimeout(snapTimer);
    snapTimer = setTimeout(() => snapToNearest(), 300);
  }

  document.addEventListener("wheel", (e) => {
    const isModalOpen = modalElement && modalElement.style.display !== "none" && modalElement.classList.contains("show");
    if (isModalOpen) return;

    // prevent page scroll while interacting with slider
    e.preventDefault();
    targetRotation += e.deltaY * 0.08; // Adjust sensitivity
    userInteracted();
  }, { passive: false });

  // Touch & Drag logic for swiping
  banner.addEventListener("mousedown", (e) => {
    const isModalOpen = modalElement && modalElement.style.display !== "none" && modalElement.classList.contains("show");
    if (isModalOpen) return;
    isDragging = true;
    window.isDraggingSlider = false;
    startX = e.clientX;
    banner.style.cursor = "grabbing";
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
    banner.style.cursor = "default";
    setTimeout(() => { window.isDraggingSlider = false; }, 50);
    // schedule snap and mark interaction
    userInteracted();
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    if (Math.abs(deltaX) > 5) {
        window.isDraggingSlider = true;
    }
    targetRotation += deltaX * 0.5; // Adjust swipe sensitivity
    startX = e.clientX;
    // while dragging, keep auto-rotation disabled and postpone snap
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (snapTimer) clearTimeout(snapTimer);
  });

  banner.addEventListener("touchstart", (e) => {
    const isModalOpen = modalElement && modalElement.style.display !== "none" && modalElement.classList.contains("show");
    if (isModalOpen) return;
    isDragging = true;
    window.isDraggingSlider = false;
    startX = e.touches[0].clientX;
  });

  window.addEventListener("touchend", () => {
    isDragging = false;
    setTimeout(() => { window.isDraggingSlider = false; }, 50);
    // schedule snap and mark interaction
    userInteracted();
  });

  banner.addEventListener("touchmove", (e) => {
    const isModalOpen = modalElement && modalElement.style.display !== "none" && modalElement.classList.contains("show");
    if (isModalOpen) return;
    if (!isDragging) return;
    e.preventDefault();
    const deltaX = e.touches[0].clientX - startX;
    if (Math.abs(deltaX) > 5) {
        window.isDraggingSlider = true;
    }
    targetRotation += deltaX * 0.5; // Adjust swipe sensitivity
    startX = e.touches[0].clientX;
  }, { passive: false });

  function snapToNearest() {
    if (!slider) return;
    const quantity = parseInt(getComputedStyle(slider).getPropertyValue('--quantity')) || 7;
    const step = 360 / quantity;
    // snap based on currentRotation (use currentRotation for visual reference)
    const nearest = Math.round(currentRotation / step) * step;
    targetRotation = nearest;
  }

  // Button handlers
  if (sliderPrevBtn) {
    sliderPrevBtn.addEventListener("click", () => {
      // stop auto-rotation when user uses controls
      autoRotateEnabled = false;
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => { autoRotateEnabled = true; }, 10000);
      const quantity = parseInt(getComputedStyle(slider).getPropertyValue('--quantity')) || 7;
      const step = 360 / quantity;
      const currentSnap = Math.round(targetRotation / step) * step;
      targetRotation = currentSnap + step; // Move to the previous card (adds rotation)
    });
  }

  if (sliderNextBtn) {
    sliderNextBtn.addEventListener("click", () => {
      // stop auto-rotation when user uses controls
      autoRotateEnabled = false;
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => { autoRotateEnabled = true; }, 10000);
      const quantity = parseInt(getComputedStyle(slider).getPropertyValue('--quantity')) || 7;
      const step = 360 / quantity;
      const currentSnap = Math.round(targetRotation / step) * step;
      targetRotation = currentSnap - step; // Move to the next card (subtracts rotation)
    });
  }
}
