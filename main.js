import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

/* ==========================================================================
   CONFIG & STATE PARAMETERS
   ========================================================================== */
const totalFrames = 193;
const imagesArray = [];
let loadedCount = 0;
let activeStepIndex = null;
let activeDropdownOpen = false;

// Check mobile layout boundary
const isMobile = window.innerWidth <= 768;

//  frame assets hosting URL (Supports frames-desk and frames-mob)
const frameBaseUrl = "https://raptee-media-development.zohostratus.in/Website/";
const frameFolder = isMobile ? "frames-mob" : "frames-desk";
const getFrameUrl = (index) => `${frameBaseUrl}${frameFolder}/${index.toString().padStart(3, "0")}.webp`;

// Safety overlay segments data (Matching live site specifications)
const safetySteps = [
  {
    start: 0,
    end: 6,
    heading: "Safety.HV",
    subHeading: "With great power comes great safety",
    description: "Peel back the engineering layers of India's first high-voltage motorcycle. Scroll down to start your custom visual breakdown.",
    dotIndex: 0
  },
  {
    start: 11,
    end: 32,
    heading: "Brake Discs",
    subHeading: "Stop the bike, free your mind",
    description: "Ultra-ventilated responsive brake discs designed to dissipate heat rapidly and bring you to a halt instantly, with absolute precision.",
    dotIndex: 1
  },
  {
    start: 34,
    end: 58,
    heading: "Radial Tubeless Tyres",
    subHeading: "Smoother rides, enhanced traction",
    description: "Technical radial tubeless compounds engineered to provide superior high-speed cornering grip, damp road feedback, and improve straightline handling.",
    dotIndex: 2
  },
  {
    start: 69,
    end: 93,
    heading: "Dual Channel ABS",
    subHeading: "Ready for any roads, even no roads",
    description: "Advanced anti-lock braking sensors monitor wheel speed actively to prevent locked skids across wet patches, loose gravel, and sudden obstacles.",
    dotIndex: 3
  },
  {
    start: 100,
    end: 124,
    heading: "IP67 Protection",
    subHeading: "Tested and sealed for life",
    description: "Every electrical terminal, copper harness, and power block is meticulously sealed against heavy rain, flash floods, and fine dust particulates.",
    dotIndex: 4
  },
  {
    start: 130,
    end: 150,
    heading: "Battery Management",
    subHeading: "24/7 Watch - Re-imagined",
    description: "Always monitoring, whether you ride, charge or idle. Deep hardware security details are shown below.",
    dotIndex: 5,
    showDropdown: true,
    dropdownTitle: "Battery Management System (BMS)",
    dropdownDesc: "Forget basic thresholds. Our proprietary BMS continuously tracks over 100 high-accuracy sensors in real-time, validating temperatures, voltage differentials, and state of charge across every individual cell."
  },
  {
    start: 159,
    end: 176,
    heading: "Power Distribution",
    subHeading: "Precision power distribution",
    description: "Engineered to deliver high-current throughput with isolated line insulation. Technical specifications are below.",
    dotIndex: 6,
    showDropdown: true,
    dropdownTitle: "Power Distribution Unit (PDU)",
    dropdownDesc: "Managing high-voltage car DNA requires rigorous architecture. The PDU isolates high-voltage loops dynamically, preventing surges, ground leaks, and short-circuits across the vehicle frame."
  }
];

/* ==========================================================================
   DOM SELECTORS
   ========================================================================== */
const canvas = document.getElementById("frame");
const ctx = canvas.getContext("2d");

const preloader = document.getElementById("preloader");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");

const detailsCard = document.getElementById("details-card");
const cardHeading = document.getElementById("card-heading");
const cardSubheading = document.getElementById("card-subheading");
const cardDescription = document.getElementById("card-description");

const dropdownContainer = document.getElementById("interactive-dropdown-container");
const btnToggleDropdown = document.getElementById("btn-toggle-dropdown");
const dropdownContent = document.getElementById("dropdown-content");
const dropdownTitle = document.getElementById("dropdown-title");
const dropdownDesc = document.getElementById("dropdown-description");

const progressDots = document.querySelectorAll(".dot");
const customCursor = document.getElementById("custom-cursor");

/* ==========================================================================
   INTERACTIVE PREMIUM CUSTOM CURSOR
   ========================================================================== */
window.addEventListener("mousemove", (e) => {
  gsap.to(customCursor, {
    x: e.clientX,
    y: e.clientY,
    duration: 0.1,
    ease: "power2.out"
  });
});

// Interactive hover scaling for cursor
const hoverElements = document.querySelectorAll("a, button, .spec-item, .dot");
hoverElements.forEach((el) => {
  el.addEventListener("mouseenter", () => customCursor.classList.add("hovered"));
  el.addEventListener("mouseleave", () => customCursor.classList.remove("hovered"));
});

/* ==========================================================================
   ASYNCHRONOUS IMAGES PRELOADER
   ========================================================================== */
const preloadFrames = async () => {
  for (let i = 1; i <= totalFrames; i++) {
    const img = new Image();
    img.src = getFrameUrl(i);

    img.onload = () => {
      loadedCount++;
      const progressPercent = Math.round((loadedCount / totalFrames) * 100);
      progressBar.style.width = `${progressPercent}%`;
      progressText.textContent = `${progressPercent}%`;

      if (loadedCount === 1) {
        // Draw the very first frame immediately as soon as it arrives
        drawCanvasFrame(1);
      }

      if (loadedCount === totalFrames) {
        // Loading complete! Animate preloader away
        setTimeout(() => {
          preloader.classList.add("fade-out");
          // Reveal the card content gracefully
          setTimeout(() => {
            detailsCard.classList.add("visible");
          }, 800);
        }, 500);
      }
    };

    img.onerror = () => {
      // Fallback handling if a frame URL load fails
      loadedCount++;
    };

    imagesArray.push(img);
  }
};

/* ==========================================================================
   RESPONSIVE ASPECT-RATIO CANVAS DRAWER (COVER SCALE)
   ========================================================================== */
const drawCanvasFrame = (frameIndex) => {
  const img = imagesArray[frameIndex - 1];
  if (!img || !img.complete) return;

  // Set dimensions based on viewport
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Aspect-ratio covering arithmetic
  const scaleX = canvas.width / img.width;
  const scaleY = canvas.height / img.height;
  const minScale = Math.min(scaleX, scaleY); // Maintain centered aspect ratio

  const width = img.width * minScale;
  const height = img.height * minScale;
  const x = (canvas.width - width) / 2;
  const y = (canvas.height - height) / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, x, y, width, height);
};

/* ==========================================================================
   CARD TRANSITION ENGINE
   ========================================================================== */
const updateDetailsCard = (stepIndex) => {
  if (stepIndex === activeStepIndex) return; // Skip if no change
  activeStepIndex = stepIndex;

  // Close dropdown if switching steps
  if (activeDropdownOpen) {
    toggleDropdown(false);
  }

  // 1. Animate card fade-out using GSAP
  gsap.to(detailsCard, {
    opacity: 0,
    y: 20,
    duration: 0.25,
    ease: "power2.out",
    onComplete: () => {
      if (stepIndex === -1) {
        // Hide card if between zones
        detailsCard.classList.remove("visible");
        return;
      }

      // Reveal details card again
      detailsCard.classList.add("visible");

      const stepData = safetySteps[stepIndex];

      // Update typography elements
      cardHeading.textContent = stepData.heading;
      cardSubheading.textContent = stepData.subHeading;
      cardDescription.textContent = stepData.description;

      // Manage dropdown states
      if (stepData.showDropdown) {
        dropdownContainer.classList.remove("hidden");
        dropdownTitle.textContent = stepData.dropdownTitle;
        dropdownDesc.textContent = stepData.dropdownDesc;
      } else {
        dropdownContainer.classList.add("hidden");
      }

      // Manage progress dots indicator
      progressDots.forEach((dot, idx) => {
        if (idx === stepData.dotIndex) {
          dot.classList.add("active");
        } else {
          dot.classList.remove("active");
        }
      });

      // 2. Animate card fade-in
      gsap.to(detailsCard, {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: "power2.out"
      });
    }
  });
};

/* ==========================================================================
   INTERACTIVE DROPDOWN ANIMATOR
   ========================================================================== */
const toggleDropdown = (open) => {
  activeDropdownOpen = open === undefined ? !activeDropdownOpen : open;

  if (activeDropdownOpen) {
    btnToggleDropdown.classList.add("active");
    // Scroll height calculations
    const innerHeight = dropdownContent.querySelector(".dropdown-content-inner").scrollHeight;
    gsap.to(dropdownContent, {
      height: innerHeight,
      duration: 0.4,
      ease: "power3.out"
    });
  } else {
    btnToggleDropdown.classList.remove("active");
    gsap.to(dropdownContent, {
      height: 0,
      duration: 0.3,
      ease: "power3.in"
    });
  }
};

btnToggleDropdown.addEventListener("click", () => toggleDropdown());

/* ==========================================================================
   GSAP SCROLLTRIGGER ENGINE (FRAME SCRUBBING)
   ========================================================================== */
const initScrollytelling = () => {
  const animTarget = { currentIndex: 1 };

  // Create ScrollTrigger to scrub frames array index
  gsap.to(animTarget, {
    currentIndex: totalFrames - 1,
    ease: "none",
    scrollTrigger: {
      trigger: "#safety",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: () => {
        const frameIndex = Math.floor(animTarget.currentIndex);

        // Render Canvas Frame
        drawCanvasFrame(frameIndex);

        // Identify which segment covers the current frameIndex
        const matchedIndex = safetySteps.findIndex(
          (step) => frameIndex >= step.start && frameIndex <= step.end
        );

        // Update specs info card
        updateDetailsCard(matchedIndex);
      }
    }
  });
};

/* ==========================================================================
   WINDOW RESIZE HANDLER (KEEP DRAWING CRISP)
   ========================================================================== */
window.addEventListener("resize", () => {
  // Recalculate and redraw current canvas size on window resize
  const frameIndex = Math.floor(loadedCount > 0 ? (loadedCount / totalFrames) * 10 : 1);
  drawCanvasFrame(frameIndex);
  ScrollTrigger.refresh();
});

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
preloadFrames();
initScrollytelling();
