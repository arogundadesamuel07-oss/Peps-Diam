/**
 * Pep's Diamond Empire - Main JavaScript
 * High performance, accessible, responsive interactivity
 */

// --- Toast Notification Utility ---
const showToast = (message, icon = 'fas fa-check-circle') => {
  // Remove existing toasts to avoid stacking clutter
  const existingToasts = document.querySelectorAll('.toast-notification');
  existingToasts.forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `<i class="${icon}"></i><span>${message}</span>`;
  document.body.appendChild(toast);

  // Trigger smooth slide/fade in
  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 3000);
};

document.addEventListener('DOMContentLoaded', () => {
  // --- WhatsApp Configuration ---
  const WHATSAPP_NUMBER = '2348165312235'; // Owner's WhatsApp number

  // --- Preloader with Fail-Safe Timeout ---
  const loader = document.getElementById('loader');
  if (loader) {
    const hideLoader = () => {
      loader.classList.add('loader-hidden');
    };

    if (document.readyState === 'complete') {
      hideLoader();
    } else {
      window.addEventListener('load', hideLoader);
      // Fail-safe: ensure preloader never gets stuck on slow network assets
      setTimeout(hideLoader, 2000);
    }
  }

  // --- Mobile Navigation Drawer & Overlay ---
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.getElementById('nav-links');
  const pageOverlay = document.getElementById('page-overlay');
  const navCloseBtn = document.getElementById('nav-close-btn');
  const navLinkItems = document.querySelectorAll('.nav-links li a');
  const siteHeader = document.querySelector('.site-header');

  const openMenu = () => {
    if (navLinks) navLinks.classList.add('active');
    if (pageOverlay) pageOverlay.classList.add('active');
    if (siteHeader) siteHeader.classList.add('menu-open');
    document.body.style.overflow = 'hidden'; // Lock background scroll
  };

  const closeMenu = () => {
    if (navLinks) navLinks.classList.remove('active');
    if (pageOverlay) pageOverlay.classList.remove('active');
    if (siteHeader) siteHeader.classList.remove('menu-open');
    document.body.style.overflow = ''; // Unlock background scroll
  };

  if (mobileMenu) mobileMenu.addEventListener('click', openMenu);
  if (navCloseBtn) navCloseBtn.addEventListener('click', closeMenu);
  if (pageOverlay) pageOverlay.addEventListener('click', closeMenu);

  navLinkItems.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close navigation on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });

  // --- Scroll to Top Button ---
  const scrollTopBtn = document.getElementById('scrollTop');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 350) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    scrollTopBtn.addEventListener('click', (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Intersection Observer for Scroll Fade-In & Stats ---
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
        if (entry.target.classList.contains('animated-stats')) {
          startCounters(entry.target);
        }
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-in').forEach((section) => {
    observer.observe(section);
  });

  // --- Newsletter Form Submission ---
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      newsletterForm.reset();
      showToast('Thank you for subscribing to Pep\'s Diamond Empire!', 'fas fa-envelope-open-text');
    });
  }

  // --- WhatsApp Inquiry Button Handler ---
  const setupInquireButtons = (container = document) => {
    const inquireButtons = container.querySelectorAll('.inquire-btn');
    inquireButtons.forEach((button) => {
      // Remove any existing click listener to prevent duplicates
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);

      newButton.addEventListener('click', (e) => {
        e.preventDefault();
        const product = newButton.getAttribute('data-product') || 'this item';
        const message = encodeURIComponent(`Hello Pep's Diamond Empire! I am interested in inquiring about:\n\n*${product}*\n\nPlease let me know if it is available and how to proceed.`);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      });
    });
  };

  // --- Wishlist Management ---
  let wishlist = {};
  try {
    wishlist = JSON.parse(localStorage.getItem('wishlistV2')) || {};
  } catch (err) {
    wishlist = {};
  }

  const getProductId = (productCard) => {
    return productCard.dataset.productId || productCard.querySelector('img')?.getAttribute('src') || productCard.querySelector('h3')?.textContent.trim();
  };

  const updateWishlistCounter = () => {
    const counters = document.querySelectorAll('.wishlist-counter');
    const count = Object.keys(wishlist).length;
    counters.forEach(counter => {
      counter.textContent = count;
      counter.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  };

  const updateWishlistButton = (button, productId) => {
    if (wishlist[productId]) {
      button.classList.add('active');
      button.title = 'Remove from Wishlist';
      button.setAttribute('aria-label', 'Remove from Wishlist');
    } else {
      button.classList.remove('active');
      button.title = 'Add to Wishlist';
      button.setAttribute('aria-label', 'Add to Wishlist');
    }
  };

  const handleWishlistButtonClick = (button, productCard, productId) => {
    const isSaved = !!wishlist[productId];
    const productName = productCard.querySelector('h3')?.textContent.trim() || 'Product';

    if (isSaved) {
      delete wishlist[productId];
      try {
        localStorage.setItem('wishlistV2', JSON.stringify(wishlist));
      } catch (e) {}

      updateWishlistButton(button, productId);
      updateWishlistCounter();
      showToast(`${productName} removed from Wishlist`, 'fas fa-heart-crack');

      // If we are currently on the wishlist page, smoothly animate removal
      const wishlistGrid = document.getElementById('wishlist-grid');
      if (wishlistGrid && productCard.closest('#wishlist-grid')) {
        productCard.style.transition = 'all 0.35s ease';
        productCard.style.opacity = '0';
        productCard.style.transform = 'scale(0.9)';
        setTimeout(() => {
          productCard.remove();
          if (Object.keys(wishlist).length === 0) {
            const emptyMessage = document.getElementById('empty-wishlist-message');
            if (emptyMessage) emptyMessage.style.display = 'block';
          }
        }, 350);
      }
    } else {
      // Save item HTML and details to wishlist
      wishlist[productId] = {
        id: productId,
        html: productCard.outerHTML,
        title: productName,
        category: productCard.dataset.category || 'all',
        timeAdded: Date.now()
      };
      try {
        localStorage.setItem('wishlistV2', JSON.stringify(wishlist));
      } catch (e) {}

      updateWishlistButton(button, productId);
      updateWishlistCounter();
      showToast(`${productName} added to Wishlist!`, 'fas fa-heart');

      // Heart burst animation
      button.classList.add('heart-burst');
      setTimeout(() => button.classList.remove('heart-burst'), 600);
    }
  };

  const initializeWishlistButtons = (container = document) => {
    const buttons = container.querySelectorAll('.wishlist');
    buttons.forEach(button => {
      const productCard = button.closest('.product-card');
      if (!productCard) return;

      const productId = getProductId(productCard);
      if (!productId) return;

      updateWishlistButton(button, productId);

      // Clone and replace to prevent duplicate listeners
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      updateWishlistButton(newButton, productId);

      newButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleWishlistButtonClick(newButton, productCard, productId);
      });
    });
  };

  // --- Shop Page Filtering, Search, and Layout Switcher ---
  const shopProductGrid = document.querySelector('.shop-product-grid');
  if (shopProductGrid) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('searchInput');
    const products = Array.from(shopProductGrid.querySelectorAll('.product-card'));
    const productCountText = document.getElementById('visible-count');
    const activeLayoutText = document.getElementById('active-layout');
    const noProductsMsg = document.getElementById('no-products-message');

    // Search form

    let matches = [];
    let currentIndex = -1;

    function findText() {
      clearHighlights();
      const query = document.getElementById('searchInput').value.trim();
      if (!query) return;

      matches = []
    }

    // Restore saved layout preference (1, 2, or 3 columns)
    const savedLayout = localStorage.getItem('peps_shop_layout') || '2';
    const layoutControls = document.querySelector('.layout-controls');
    if (layoutControls) {
      const layoutButtons = layoutControls.querySelectorAll('.layout-btn');
      layoutButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.columns === savedLayout);
      });
      shopProductGrid.classList.remove('grid-cols-1', 'grid-cols-2', 'grid-cols-3');
      shopProductGrid.classList.add(`grid-cols-${savedLayout}`);
    }

    const filterAndSearchProducts = () => {
      const activeFilterButton = document.querySelector('.filter-btn.active');
      const activeFilter = activeFilterButton ? activeFilterButton.dataset.filter : 'all';
      const searchTerm = (searchInput ? searchInput.value : '').toLowerCase().trim();

      const activeLayoutBtn = document.querySelector('.layout-btn.active');
      const layoutColumns = activeLayoutBtn ? activeLayoutBtn.dataset.columns : '2';

      let visibleCount = 0;
      products.forEach(product => {
        const category = (product.dataset.category || '').toLowerCase();
        const productName = (product.querySelector('h3')?.textContent || '').toLowerCase();
        const productDetails = (product.querySelector('.product-details')?.textContent || '').toLowerCase();
        const productPrice = (product.querySelector('.price')?.textContent || '').toLowerCase();

        const matchesCategory = (activeFilter === 'all' || category === activeFilter);
        const matchesSearch = !searchTerm || productName.includes(searchTerm) || productDetails.includes(searchTerm) || productPrice.includes(searchTerm);

        const shouldBeVisible = matchesCategory && matchesSearch;

        if (shouldBeVisible) {
          visibleCount++;
          product.style.display = '';
          requestAnimationFrame(() => product.classList.remove('hide'));
        } else {
          product.classList.add('hide');
          setTimeout(() => {
            if (product.classList.contains('hide')) {
              product.style.display = 'none';
            }
          }, 300);
        }
      });

      if (productCountText) productCountText.textContent = visibleCount;
      if (activeLayoutText) activeLayoutText.textContent = `${layoutColumns}-column`;

      if (noProductsMsg) {
        noProductsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    };

    // Category button clicks
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        filterAndSearchProducts();
      });
    });

    // Debounced search input
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(filterAndSearchProducts, 150);
      });
    }

    // URL parameter filtering (e.g., ?category=women)
    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('category');
    if (initialCategory) {
      filterButtons.forEach(btn => {
        if (btn.dataset.filter === initialCategory) {
          filterButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        }
      });
    }

    // Layout control buttons
    if (layoutControls) {
      const layoutButtons = layoutControls.querySelectorAll('.layout-btn');
      layoutButtons.forEach(button => {
        button.addEventListener('click', () => {
          const columns = button.dataset.columns;
          layoutButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');

          shopProductGrid.classList.remove('grid-cols-1', 'grid-cols-2', 'grid-cols-3');
          shopProductGrid.classList.add(`grid-cols-${columns}`);

          try {
            localStorage.setItem('peps_shop_layout', columns);
          } catch (e) {}

          filterAndSearchProducts();
        });
      });
    }

    // Initial filter run
    filterAndSearchProducts();
  }

  // --- Wishlist Page Population ---
  const wishlistGrid = document.getElementById('wishlist-grid');
  if (wishlistGrid) {
    const emptyMessage = document.getElementById('empty-wishlist-message');
    const wishlistItems = Object.values(wishlist);

    if (wishlistItems.length > 0) {
      wishlistGrid.innerHTML = '';
      if (emptyMessage) emptyMessage.style.display = 'none';

      wishlistItems.forEach(item => {
        if (item && item.html) {
          wishlistGrid.insertAdjacentHTML('beforeend', item.html);
        }
      });

      // Initialize wishlist buttons and inquiry buttons on newly inserted cards
      initializeWishlistButtons(wishlistGrid);
      setupInquireButtons(wishlistGrid);
    } else {
      if (emptyMessage) emptyMessage.style.display = 'block';
    }
  }

  // --- FAQ Accordion ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionButton = item.querySelector('.faq-question');
    if (questionButton) {
      questionButton.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // Close other items for accordion behavior
        faqItems.forEach(i => i.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });

  // --- Mobile Footer Accordion ---
  const footerHeadings = document.querySelectorAll('.footer-heading');
  if (window.innerWidth <= 860) {
    footerHeadings.forEach(heading => {
      heading.addEventListener('click', () => {
        const parentColumn = heading.parentElement;
        if (parentColumn) parentColumn.classList.toggle('open');
      });
    });
  }

  // --- Animated Stats Counter Function ---
  const animatedStatsContainer = document.querySelector('.animated-stats');
  if (animatedStatsContainer) {
    observer.observe(animatedStatsContainer);
  }

  function startCounters(container) {
    const counters = container.querySelectorAll('.stat-number');
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target') || 0;
      let current = 0;
      const duration = 1800; // 1.8 seconds
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out quadratic
        const easeProgress = 1 - (1 - progress) * (1 - progress);
        current = Math.floor(easeProgress * target);
        counter.innerText = current + '+';

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          counter.innerText = target + '+';
        }
      };

      requestAnimationFrame(animate);
    });
  }

  // --- Global Initializations ---
  initializeWishlistButtons(document.body);
  setupInquireButtons(document.body);
  updateWishlistCounter();
});
