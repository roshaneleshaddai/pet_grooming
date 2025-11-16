// Initialize AOS (Animate on Scroll)
document.addEventListener("DOMContentLoaded", function () {
  AOS.init({
    duration: 1200,
    once: false, // Allow animations to trigger again when scrolling back up
    offset: 150,
    easing: "ease-out-cubic",
    delay: 0,
    mirror: true, // Animations trigger on scroll up as well
  });

  // Header scroll effect
  const header = document.querySelector("header");
  let lastScroll = 0;

  window.addEventListener("scroll", function () {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    lastScroll = currentScroll;
  });

  // Smooth scroll for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Animate numbers in stats section
  const animateValue = (element, start, end, duration) => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentValue = Math.floor(progress * (end - start) + start);

      if (element.textContent.includes("%")) {
        element.textContent = currentValue + "%";
      } else if (element.textContent.includes("+")) {
        element.textContent = currentValue.toLocaleString() + "+";
      } else if (element.textContent.includes("-")) {
        const parts = element.textContent.split("-");
        element.textContent = parts[0] + "-" + parts[1];
      }

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  };

  // Intersection Observer for stats animation
  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const statElements = entry.target.querySelectorAll(".stats h3");
          statElements.forEach((stat) => {
            const text = stat.textContent;
            if (text.includes("98%")) {
              animateValue(stat, 0, 98, 2000);
            } else if (text.includes("1,500+")) {
              animateValue(stat, 0, 1500, 2000);
            }
          });
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  const statsSection = document.querySelector(".stats");
  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  // Add parallax effect to hero image
  const heroImage = document.querySelector(".hero-image img");
  if (heroImage) {
    window.addEventListener("scroll", () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * 0.3;
      if (scrolled < window.innerHeight) {
        heroImage.style.transform = `translateY(${rate}px)`;
      }
    });
  }

  // Add hover effect to cards with tilt
  const allCards = document.querySelectorAll(".card");
  allCards.forEach((card) => {
    card.addEventListener("mousemove", function (e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-15px) scale(1.02)`;
    });

    card.addEventListener("mouseleave", function () {
      card.style.transform = "";
    });
  });

  // Hero heading animations are handled by AOS and CSS
  // No additional JavaScript needed for heading animations

  // Testimonials Carousel
  const testimonialCarousel = document.querySelector(".testimonial-cards");
  const prevBtn = document.querySelector(".carousel-btn-prev");
  const nextBtn = document.querySelector(".carousel-btn-next");
  const indicatorBtns = document.querySelectorAll(".indicator-btn");
  const testimonialCards = document.querySelectorAll(".testimonials .card");

  if (testimonialCarousel && prevBtn && nextBtn) {
    const cardWidth = 380; // Match CSS card width + gap
    const gap = 32; // 2rem = 32px
    const scrollAmount = cardWidth + gap;
    let autoScrollInterval = null;
    let isUserInteracting = false;

    // Function to scroll to specific card
    const scrollToCard = (index) => {
      const targetScroll = index * scrollAmount;
      testimonialCarousel.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    };

    // Previous button
    prevBtn.addEventListener("click", () => {
      isUserInteracting = true;
      clearInterval(autoScrollInterval);
      testimonialCarousel.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
      setTimeout(() => {
        isUserInteracting = false;
        startAutoScroll();
      }, 5000);
    });

    // Next button
    nextBtn.addEventListener("click", () => {
      isUserInteracting = true;
      clearInterval(autoScrollInterval);
      testimonialCarousel.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
      setTimeout(() => {
        isUserInteracting = false;
        startAutoScroll();
      }, 5000);
    });

    // Indicator button clicks
    indicatorBtns.forEach((btn, index) => {
      btn.addEventListener("click", () => {
        isUserInteracting = true;
        clearInterval(autoScrollInterval);
        scrollToCard(index);
        updateIndicators(index);
        setTimeout(() => {
          isUserInteracting = false;
          startAutoScroll();
        }, 5000);
      });
    });

    // Update indicators based on scroll position
    const updateIndicators = (activeIndex) => {
      indicatorBtns.forEach((btn, index) => {
        if (index === activeIndex) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    };

    // Get current active card index
    const getCurrentCardIndex = () => {
      const scrollLeft = testimonialCarousel.scrollLeft;
      return Math.round(scrollLeft / scrollAmount);
    };

    // Auto-scroll function
    const startAutoScroll = () => {
      clearInterval(autoScrollInterval);
      autoScrollInterval = setInterval(() => {
        if (!isUserInteracting && document.visibilityState === "visible") {
          const currentIndex = getCurrentCardIndex();
          const totalCards = testimonialCards.length;
          const nextIndex = (currentIndex + 1) % totalCards;

          if (nextIndex === 0) {
            // Scroll back to start
            testimonialCarousel.scrollTo({
              left: 0,
              behavior: "smooth",
            });
          } else {
            scrollToCard(nextIndex);
          }
          updateIndicators(nextIndex);
        }
      }, 1000); // Auto-scroll every 4 seconds
    };

    // Update button states based on scroll position
    const updateButtonStates = () => {
      const { scrollLeft, scrollWidth, clientWidth } = testimonialCarousel;
      const currentIndex = getCurrentCardIndex();

      // Update indicators
      updateIndicators(currentIndex);

      // Show/hide prev button
      if (scrollLeft <= 10) {
        prevBtn.style.opacity = "0.5";
        prevBtn.style.pointerEvents = "none";
      } else {
        prevBtn.style.opacity = "1";
        prevBtn.style.pointerEvents = "auto";
      }

      // Show/hide next button
      if (scrollLeft >= scrollWidth - clientWidth - 10) {
        nextBtn.style.opacity = "0.5";
        nextBtn.style.pointerEvents = "none";
      } else {
        nextBtn.style.opacity = "1";
        nextBtn.style.pointerEvents = "auto";
      }
    };

    // Pause auto-scroll on hover
    testimonialCarousel.addEventListener("mouseenter", () => {
      isUserInteracting = true;
      clearInterval(autoScrollInterval);
    });

    testimonialCarousel.addEventListener("mouseleave", () => {
      isUserInteracting = false;
      startAutoScroll();
    });

    // Pause auto-scroll when user manually scrolls
    testimonialCarousel.addEventListener("scroll", () => {
      if (!isUserInteracting) {
        updateButtonStates();
      }
    });

    // Initial state
    updateButtonStates();

    // Start auto-scroll
    startAutoScroll();

    // Update on resize
    window.addEventListener("resize", () => {
      updateButtonStates();
      clearInterval(autoScrollInterval);
      startAutoScroll();
    });

    // Pause when tab is not visible
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        startAutoScroll();
      } else {
        clearInterval(autoScrollInterval);
      }
    });
  }
});
