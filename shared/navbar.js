/**
 * Best Utility Apps - Shared Header & Footer System
 * Version: 2.0.0 (Production)
 * Zero external dependencies. Pure vanilla JavaScript.
 * Suitable for cPanel shared hosting under /public_html/shared/navbar.js
 */

(function () {
  'use strict';

  // Base URL for the production suite
  const HOSTNAME = 'https://bestutilityapps.com';

  // Centralized Version Tag - Change this ONE value in /shared/navbar.js to instantly bust cache
  const BUA_NAV_VERSION = '2026.11.08.4';

  // Automatically detect the folder location where navbar.js is hosted
  const ASSETS_BASE = (function () {
    const headerEl = document.getElementById('bua-header');
    if (headerEl && headerEl.getAttribute('data-bua-assets-path')) {
      let p = headerEl.getAttribute('data-bua-assets-path');
      return p.endsWith('/') ? p : p + '/';
    }

    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      const src = scripts[i].src || '';
      if (src.includes('navbar.js')) {
        const lastSlash = src.lastIndexOf('/');
        return src.substring(0, lastSlash + 1);
      }
    }

    return '/shared/';
  })();

  // Official BUA Ribbon Squircle Brand Logo with version query
  const BRAND_LOGO_SRC = `${ASSETS_BASE}brand-assets/square/bua-ribbon-square-squircle.png?v=${BUA_NAV_VERSION}`;

  /**
   * Auto-Inject and synchronize the shared stylesheet in <head>.
   * Web apps do NOT need to include <link rel="stylesheet"> in their HTML!
   * This guarantees all CSS updates are 100% controlled from /shared/.
   */
  function ensureStylesheet() {
    const cssId = 'bua-navbar-css';
    const cssUrl = `${ASSETS_BASE}navbar.css?v=${BUA_NAV_VERSION}`;
    let linkEl = document.getElementById(cssId);

    if (!linkEl) {
      const existing = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find(l => (l.href || '').includes('navbar.css'));
      if (existing) {
        existing.id = cssId;
        linkEl = existing;
      }
    }

    if (!linkEl) {
      linkEl = document.createElement('link');
      linkEl.id = cssId;
      linkEl.rel = 'stylesheet';
      linkEl.href = cssUrl;
      document.head.appendChild(linkEl);
    } else if (!linkEl.href.includes(`v=${BUA_NAV_VERSION}`)) {
      linkEl.href = cssUrl;
    }
  }

  // Immediately ensure stylesheet is injected
  ensureStylesheet();

  // Tool categories and registry
  const TOOL_CATEGORIES = [
    {
      id: 'generators',
      name: 'Generators & Codes',
      icon: `<svg viewBox="0 0 24 24"><path d="M3 4h2v16H3V4zm4 0h1v16H7V4zm3 0h2v16h-2V4zm4 0h1v16h-1V4zm3 0h3v16h-3V4zm5 0h1v16h-1V4z"/></svg>`,
      tools: [
        {
          name: 'Barcode Generator',
          path: '/barcode/',
          desc: 'Create Code128, EAN-13, UPC-A, ISBN barcodes',
          badge: 'Popular'
        },
        {
          name: 'QR Code Creator',
          path: '/qr-code/',
          desc: 'Custom colors, embedded logos & high-res vector output',
          badge: 'Hot'
        },
        {
          name: 'Invoice Generator',
          path: '/invoice/',
          desc: 'Create and download client-side PDF billing receipts'
        }
      ]
    },
    {
      id: 'graphics',
      name: 'Image & Graphics',
      icon: `<svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`,
      tools: [
        {
          name: 'Bulk Image Resizer',
          path: '/image-resizer/',
          desc: 'Batch resize JPG, PNG, and WebP in seconds'
        },
        {
          name: 'Image Converter',
          path: '/image-converter/',
          desc: 'Fast conversion across JPG, PNG, WEBP, AVIF, and BMP'
        },
        {
          name: 'WebP Converter',
          path: '/webp-converter/',
          desc: 'Convert heavy images into light WebP format'
        },
        {
          name: 'Logo Vectorizer',
          path: '/logo-vectorizer/',
          desc: 'Trace raster pixel images into clean scalable SVGs'
        }
      ]
    },
    {
      id: 'pdf',
      name: 'PDF Utilities',
      icon: `<svg viewBox="0 0 24 24"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 8.5v1h1v-1H9zm5 1.5h-1V8.5h1v1.5zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/></svg>`,
      tools: [
        {
          name: 'Super PDF Compressor',
          path: '/pdf-compressor/',
          desc: 'Shrink PDF file sizes client-side with zero data upload',
          badge: 'Fast'
        },
        {
          name: 'PDF to Image',
          path: '/pdf-to-image/',
          desc: 'Export high-definition PDF pages into PNG or JPG images'
        }
      ]
    },
    {
      id: 'design',
      name: 'Design & Dev',
      icon: `<svg viewBox="0 0 24 24"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>`,
      tools: [
        {
          name: 'CSS Studio',
          path: '/css-studio/',
          desc: 'Glassmorphism, CSS gradients, shadows & clip-path tool'
        },
        {
          name: 'Wireframe Studio',
          path: '/wireframe-studio/',
          desc: 'Instant browser UI mockup and wireframe builder'
        },
        {
          name: 'Font Pairing Tool',
          path: '/font-pairing/',
          desc: 'Explore curated Google typography pairings interactively'
        },
        {
          name: 'Color Converter',
          path: '/color-converter/',
          desc: 'HEX, RGB, HSL, CMYK, OKLCH converter & accessible palettes'
        }
      ]
    },
    {
      id: 'calculators',
      name: 'Calculators',
      icon: `<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-6 3h5v2h-5V6zm0 4h5v2h-5v-2zm-6-4h4v4H7V6zm0 6h4v4H7v-4zm11 6h-5v-2h5v2z"/></svg>`,
      tools: [
        {
          name: 'Debt Repayment Calculator',
          path: '/debt-calculator/',
          desc: 'Snowball vs. Avalanche strategy payoff timeline simulator'
        }
      ]
    }
  ];

  // Flattened array for quick lookups
  const ALL_TOOLS = TOOL_CATEGORIES.flatMap(cat => cat.tools);

  // SVG UI Icons
  const ICONS = {
    caretDown: `<svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>`,
    search: `<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`,
    sun: `<svg class="bua-icon-sun" viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>`,
    moon: `<svg class="bua-icon-moon" viewBox="0 0 24 24"><path d="M12.3 2a10 10 0 0 0-.19 19.98 10 10 0 0 0 8.79-5.18 1 1 0 0 0-.9-1.47 7.97 7.97 0 0 1-5.7-2.3 8 8 0 0 1-2.3-5.7 8 8 0 0 1 1.6-4.8 1 1 0 0 0-.8-1.53c-.16 0-.33.04-.5.1z"/></svg>`,
    shieldCheck: `<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>`,
    arrowUp: `<svg viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>`,
    bolt: `<svg viewBox="0 0 24 24"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>`,
    cpu: `<svg viewBox="0 0 24 24"><path d="M9 2v3h6V2h2v3h2a2 2 0 0 1 2 2v2h3v2h-3v6h3v2h-3v2a2 2 0 0 1-2 2h-2v3h-2v-3H9v3H7v-3H5a2 2 0 0 1-2-2v-2H0v-2h3V9H0V7h3V5a2 2 0 0 1 2-2h2V2h2zm10 5H5v10h14V7zm-4 2v6H9V9h6z"/></svg>`,
    close: `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`
  };

  /**
   * Normalize path for URL active detection
   */
  function normalizePath(path) {
    if (!path) return '';
    let p = path.toLowerCase().trim();
    p = p.split('?')[0].split('#')[0];
    p = p.replace(/\/index\.(html|htm|php)$/i, '/');
    if (!p.includes('.') && !p.endsWith('/')) {
      p += '/';
    }
    return p;
  }

  /**
   * Detect current active tool path
   */
  function getActiveToolPath() {
    const headerEl = document.getElementById('bua-header');
    if (headerEl && headerEl.getAttribute('data-bua-active')) {
      return normalizePath(headerEl.getAttribute('data-bua-active'));
    }

    if (document.body && document.body.getAttribute('data-bua-active')) {
      return normalizePath(document.body.getAttribute('data-bua-active'));
    }

    const current = normalizePath(window.location.pathname);
    if (current === '/' || current === '' || current === '/index.html') {
      return '/';
    }
    if (current.startsWith('/premium')) {
      return '/premium/';
    }
    if (current.startsWith('/pricing')) {
      return '/pricing/';
    }

    for (const tool of ALL_TOOLS) {
      const toolNorm = normalizePath(tool.path);
      if (current === toolNorm || current.startsWith(toolNorm) || (toolNorm === '/barcode/' && current.includes('barcode'))) {
        return toolNorm;
      }
    }

    return current;
  }

  /**
   * Theme Manager
   */
  const ThemeManager = {
    STORAGE_KEY: 'bua-theme',

    init() {
      const savedTheme = localStorage.getItem(this.STORAGE_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        this.apply(savedTheme, false);
      } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.apply(prefersDark ? 'dark' : 'light', false);
      }

      if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          if (!localStorage.getItem(this.STORAGE_KEY)) {
            this.apply(e.matches ? 'dark' : 'light', false);
          }
        });
      }
    },

    get() {
      return document.documentElement.getAttribute('data-theme') || 'light';
    },

    toggle() {
      const next = this.get() === 'dark' ? 'light' : 'dark';
      this.apply(next, true);
    },

    apply(theme, save = true) {
      document.documentElement.setAttribute('data-theme', theme);
      if (document.body) {
        document.body.setAttribute('data-theme', theme);
      }
      if (save) {
        localStorage.setItem(this.STORAGE_KEY, theme);
      }

      const themeButtons = document.querySelectorAll('.bua-theme-btn');
      themeButtons.forEach(btn => {
        btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
      });

      window.dispatchEvent(new CustomEvent('bua-theme-change', { detail: { theme } }));
    }
  };

  /**
   * Build Header HTML
   */
  function buildHeaderHTML(activePath) {
    const categoriesHTML = TOOL_CATEGORIES.map(category => {
      const toolsHTML = category.tools.map(tool => {
        const isActive = normalizePath(tool.path) === activePath;
        const activeClass = isActive ? ' bua-active' : '';
        const badgeHTML = tool.badge
          ? `<span class="bua-badge">${tool.badge}</span>`
          : (isActive ? `<span class="bua-badge bua-badge-active">Active</span>` : '');

        return `
          <a href="${tool.path}" class="bua-tool-link${activeClass}" data-path="${tool.path}">
            <div class="bua-tool-bullet"></div>
            <div class="bua-tool-content">
              <div class="bua-tool-header-row">
                <span class="bua-tool-name">${tool.name}</span>
                ${badgeHTML}
              </div>
              <span class="bua-tool-desc">${tool.desc}</span>
            </div>
          </a>
        `;
      }).join('');

      return `
        <div class="bua-cat-group" data-cat-id="${category.id}">
          <div class="bua-cat-title">
            <span class="bua-cat-icon">${category.icon}</span>
            <span>${category.name}</span>
          </div>
          <div class="bua-tool-list">
            ${toolsHTML}
          </div>
        </div>
      `;
    }).join('');

    // Mobile Tools List
    const mobileToolsHTML = TOOL_CATEGORIES.map(category => {
      const links = category.tools.map(tool => {
        const isActive = normalizePath(tool.path) === activePath;
        const activeClass = isActive ? ' bua-active' : '';
        return `
          <a href="${tool.path}" class="bua-mobile-link${activeClass}" data-path="${tool.path}">
            <span>${tool.name}</span>
            ${tool.badge ? `<span class="bua-badge">${tool.badge}</span>` : ''}
          </a>
        `;
      }).join('');

      return `
        <div class="bua-mobile-nav-group">
          <div class="bua-mobile-group-header">${category.name}</div>
          ${links}
        </div>
      `;
    }).join('');

    return `
      <div class="bua-root">
        <header class="bua-header-wrapper" role="banner">
          <div class="bua-header-inner">
            
            <!-- Left: Brand Logo & Title (Uses official squircle logo from brand-assets) -->
            <a href="${HOSTNAME}/" class="bua-brand" aria-label="Best Utility Apps Homepage">
              <img src="${BRAND_LOGO_SRC}" alt="Best Utility Apps" class="bua-brand-img" width="38" height="38" loading="eager" decoding="async">
              <div class="bua-brand-text">
                <span class="bua-brand-name">BEST <span class="bua-brand-highlight">UTILITY</span> APPS</span>
                <span class="bua-brand-badge">Client-Side Engine</span>
              </div>
            </a>

            <!-- Center: Navigation Links (Home, Free Tools, Premium Tools, Pricing) -->
            <nav class="bua-nav-center" aria-label="Main Navigation">
              <ul class="bua-nav-list">
                <!-- 1. Home -->
                <li class="bua-nav-item">
                  <a href="${HOSTNAME}/" class="bua-nav-link" id="bua-nav-home">Home</a>
                </li>

                <!-- 2. Free Tools Dropdown -->
                <li class="bua-nav-item" id="bua-dropdown-wrap">
                  <button type="button" class="bua-nav-link" id="bua-tools-trigger" aria-haspopup="true" aria-expanded="false">
                    <span>Free Tools</span>
                    <span class="bua-dropdown-caret">${ICONS.caretDown}</span>
                  </button>

                  <!-- Mega Dropdown Menu -->
                  <div class="bua-mega-dropdown" id="bua-tools-dropdown" role="menu" aria-label="Free Tools Directory">
                    <!-- Header with Instant Filter -->
                    <div class="bua-dropdown-header">
                      <div class="bua-search-box">
                        <span class="bua-search-icon">${ICONS.search}</span>
                        <input type="text" class="bua-search-input" id="bua-tool-search" placeholder="Quick search free tools (e.g. barcode, pdf, css)..." autocomplete="off" spellcheck="false">
                      </div>
                      <div class="bua-dropdown-info">
                        <span class="bua-privacy-pill">
                          ${ICONS.shieldCheck} In-Browser Processing
                        </span>
                      </div>
                    </div>

                    <!-- Category Grid -->
                    <div class="bua-mega-grid" id="bua-mega-grid">
                      ${categoriesHTML}
                      <div class="bua-no-results" id="bua-search-empty">
                        No matching tools found. Try searching for "barcode", "converter", or "pdf".
                      </div>
                    </div>
                  </div>
                </li>

                <!-- 3. Premium Tools -->
                <li class="bua-nav-item">
                  <a href="${HOSTNAME}/premium/" class="bua-nav-link" id="bua-nav-premium">
                    <span>Premium Tools</span>
                    <span class="bua-nav-badge-pro">PRO</span>
                  </a>
                </li>

                <!-- 4. Pricing -->
                <li class="bua-nav-item">
                  <a href="${HOSTNAME}/pricing/" class="bua-nav-link" id="bua-nav-pricing">Pricing</a>
                </li>
              </ul>
            </nav>

            <!-- Right: Actions (Theme Toggle & Mobile Trigger) -->
            <div class="bua-nav-right">
              <button type="button" class="bua-btn-icon bua-theme-btn" id="bua-theme-toggle" aria-label="Toggle dark/light theme" title="Toggle theme">
                ${ICONS.sun}
                ${ICONS.moon}
              </button>

              <button type="button" class="bua-mobile-toggle" id="bua-mobile-btn" aria-label="Toggle mobile menu" aria-expanded="false">
                <span class="bua-hamburger-line"></span>
                <span class="bua-hamburger-line"></span>
                <span class="bua-hamburger-line"></span>
              </button>
            </div>

          </div>
        </header>

        <!-- Mobile Drawer Navigation -->
        <div class="bua-mobile-overlay" id="bua-mobile-overlay"></div>
        <aside class="bua-mobile-drawer" id="bua-mobile-drawer" aria-label="Mobile Navigation">
          <div class="bua-mobile-drawer-header">
            <span class="bua-mobile-drawer-title">All Tools & Menu</span>
            <div class="bua-mobile-header-actions">
              <button type="button" class="bua-btn-icon bua-theme-btn" id="bua-theme-toggle-mobile" aria-label="Toggle theme" title="Toggle theme">
                ${ICONS.sun}
                ${ICONS.moon}
              </button>
              <button type="button" class="bua-btn-icon" id="bua-mobile-close" aria-label="Close navigation menu" title="Close menu">
                ${ICONS.close}
              </button>
            </div>
          </div>
          
          <div class="bua-mobile-drawer-body">
            <!-- Mobile Primary Links (Home, Premium Tools, Pricing) -->
            <div class="bua-mobile-primary-links">
              <a href="${HOSTNAME}/" class="bua-mobile-primary-link" id="bua-mob-home">
                <span>Home</span>
              </a>
              <a href="${HOSTNAME}/premium/" class="bua-mobile-primary-link" id="bua-mob-premium">
                <span>Premium Tools</span>
                <span class="bua-nav-badge-pro">PRO</span>
              </a>
              <a href="${HOSTNAME}/pricing/" class="bua-mobile-primary-link" id="bua-mob-pricing">
                <span>Pricing</span>
              </a>
            </div>

            <div class="bua-mobile-divider"></div>

            <div class="bua-mobile-section-title">Free Tools</div>
            <div class="bua-mobile-search">
              <span class="bua-search-icon">${ICONS.search}</span>
              <input type="text" class="bua-search-input" id="bua-mobile-search-input" placeholder="Search free tools..." autocomplete="off">
            </div>
            <div id="bua-mobile-nav-list">
              ${mobileToolsHTML}
            </div>
          </div>

          <div class="bua-mobile-drawer-footer">
            <span class="bua-privacy-pill">
              ${ICONS.shieldCheck} Local in-browser processing
            </span>
          </div>
        </aside>
      </div>
    `;
  }

  /**
   * Build Footer HTML
   */
  function buildFooterHTML(activePath) {
    const popularTools = [
      { name: 'Barcode Generator', path: '/barcode/' },
      { name: 'QR Code Creator', path: '/qr-code/' },
      { name: 'Super PDF Compressor', path: '/pdf-compressor/' },
      { name: 'Image Converter', path: '/image-converter/' },
      { name: 'Invoice Generator', path: '/invoice/' }
    ];

    const legalLinks = [
      { name: 'Privacy Policy', path: '/privacy/' },
      { name: 'Cookie Policy', path: '/cookies/' },
      { name: 'Terms of Service', path: '/terms/' },
      { name: 'Open Source Licenses', path: '/licenses/' }
    ];

    const aboutLinks = [
      { name: 'About Us', path: '/about/' },
      { name: 'Contact & Feedback', path: '/contact/' },
      { name: 'Developer API / Embed', path: '/about/#embed' }
    ];

    const makeLinks = (links) => links.map(link => {
      const isActive = normalizePath(link.path) === activePath;
      return `
        <li>
          <a href="${link.path}" class="bua-footer-link${isActive ? ' bua-active' : ''}">
            ${link.name}
          </a>
        </li>
      `;
    }).join('');

    return `
      <div class="bua-root">
        <footer class="bua-footer-wrapper" role="contentinfo">
          
          <!-- Local Processing Banner (Files stay client-side) -->
          <div class="bua-footer-banner">
            <div class="bua-footer-banner-inner">
              <div class="bua-banner-badge-group">
                <div class="bua-banner-icon">${ICONS.shieldCheck}</div>
                <div class="bua-banner-text">
                  <strong>In-Browser File Processing:</strong> Utility calculations and file conversions run locally in your browser. Your sensitive files and data are not uploaded to our backend servers.
                </div>
              </div>
              <div class="bua-banner-stats">
                <span class="bua-stat-pill">${ICONS.bolt} 20+ Free Utilities</span>
                <span class="bua-stat-pill">${ICONS.cpu} Client-Side Engine</span>
              </div>
            </div>
          </div>

          <!-- Main 4-Column Footer -->
          <div class="bua-footer-main">
            <!-- Brand & Tagline Column -->
            <div class="bua-footer-brand-col">
              <a href="${HOSTNAME}/" class="bua-brand bua-brand-footer" aria-label="Best Utility Apps Homepage">
                <img src="${BRAND_LOGO_SRC}" alt="Best Utility Apps" class="bua-brand-img bua-brand-img-footer" width="46" height="46" loading="lazy" decoding="async">
                <div class="bua-brand-text">
                  <span class="bua-brand-name">BEST <span class="bua-brand-highlight">UTILITY</span> APPS</span>
                  <span class="bua-brand-subtitle">MODERN SOFTWARE ECOSYSTEM</span>
                </div>
              </a>
              <p class="bua-footer-tagline">
                Best Utility Apps — Fast, free web tools. File conversions and calculations run client-side directly in your browser.
              </p>
              <div class="bua-footer-promise">
                ${ICONS.shieldCheck} Local file processing • Fast &amp; free
              </div>
            </div>

            <!-- Popular Tools Column -->
            <div class="bua-footer-col">
              <h3 class="bua-footer-heading">Popular Tools</h3>
              <ul class="bua-footer-links">
                ${makeLinks(popularTools)}
              </ul>
            </div>

            <!-- Legal Column (Includes Privacy & Cookies) -->
            <div class="bua-footer-col">
              <h3 class="bua-footer-heading">Legal &amp; Policies</h3>
              <ul class="bua-footer-links">
                ${makeLinks(legalLinks)}
              </ul>
            </div>

            <!-- About Column -->
            <div class="bua-footer-col">
              <h3 class="bua-footer-heading">Company &amp; Info</h3>
              <ul class="bua-footer-links">
                ${makeLinks(aboutLinks)}
              </ul>
            </div>
          </div>

          <!-- Footer Bottom Bar -->
          <div class="bua-footer-bottom">
            <div class="bua-footer-bottom-inner">
              <div class="bua-copyright">
                <span>&copy; 2026 Best Utility Apps. All rights reserved.</span>
              </div>
              <div class="bua-footer-actions">
                <button type="button" class="bua-back-to-top" id="bua-back-to-top" aria-label="Scroll back to top">
                  ${ICONS.arrowUp}
                  <span>Back to top</span>
                </button>
              </div>
            </div>
          </div>

        </footer>
      </div>
    `;
  }

  /**
   * Bind event listeners for dropdowns, search, theme toggle, mobile drawer
   */
  function bindEvents() {
    const dropdownWrap = document.getElementById('bua-dropdown-wrap');
    const toolsTrigger = document.getElementById('bua-tools-trigger');
    const searchInput = document.getElementById('bua-tool-search');
    const emptyNotice = document.getElementById('bua-search-empty');

    const mobileBtn = document.getElementById('bua-mobile-btn');
    const mobileOverlay = document.getElementById('bua-mobile-overlay');
    const mobileDrawer = document.getElementById('bua-mobile-drawer');
    const mobileCloseBtn = document.getElementById('bua-mobile-close');
    const mobileSearchInput = document.getElementById('bua-mobile-search-input');

    const themeBtn = document.getElementById('bua-theme-toggle');
    const themeBtnMobile = document.getElementById('bua-theme-toggle-mobile');
    const backToTopBtn = document.getElementById('bua-back-to-top');

    const handleThemeToggle = () => ThemeManager.toggle();
    if (themeBtn) themeBtn.addEventListener('click', handleThemeToggle);
    if (themeBtnMobile) themeBtnMobile.addEventListener('click', handleThemeToggle);

    if (dropdownWrap && toolsTrigger) {
      toolsTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdownWrap.classList.contains('bua-open');
        if (isOpen) {
          dropdownWrap.classList.remove('bua-open');
          toolsTrigger.setAttribute('aria-expanded', 'false');
        } else {
          dropdownWrap.classList.add('bua-open');
          toolsTrigger.setAttribute('aria-expanded', 'true');
          setTimeout(() => {
            if (searchInput) searchInput.focus();
          }, 100);
        }
      });

      document.addEventListener('click', (e) => {
        if (!dropdownWrap.contains(e.target)) {
          dropdownWrap.classList.remove('bua-open');
          toolsTrigger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (dropdownWrap && dropdownWrap.classList.contains('bua-open')) {
          dropdownWrap.classList.remove('bua-open');
          toolsTrigger.setAttribute('aria-expanded', 'false');
          toolsTrigger.focus();
        }
        closeMobileMenu();
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        if (dropdownWrap && searchInput) {
          e.preventDefault();
          dropdownWrap.classList.add('bua-open');
          toolsTrigger.setAttribute('aria-expanded', 'true');
          searchInput.focus();
        }
      }
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const toolLinks = document.querySelectorAll('#bua-mega-grid .bua-tool-link');
        const catGroups = document.querySelectorAll('#bua-mega-grid .bua-cat-group');
        let visibleCount = 0;

        toolLinks.forEach(link => {
          const name = link.querySelector('.bua-tool-name')?.textContent.toLowerCase() || '';
          const desc = link.querySelector('.bua-tool-desc')?.textContent.toLowerCase() || '';
          const matches = !query || name.includes(query) || desc.includes(query);

          if (matches) {
            link.classList.remove('bua-filtered-out');
            visibleCount++;
          } else {
            link.classList.add('bua-filtered-out');
          }
        });

        catGroups.forEach(group => {
          const visibleInGroup = group.querySelectorAll('.bua-tool-link:not(.bua-filtered-out)').length;
          group.style.display = visibleInGroup === 0 ? 'none' : 'flex';
        });

        if (emptyNotice) {
          if (visibleCount === 0) {
            emptyNotice.classList.add('bua-visible');
          } else {
            emptyNotice.classList.remove('bua-visible');
          }
        }
      });
    }

    function openMobileMenu() {
      document.body.classList.add('bua-mobile-open', 'bua-scroll-locked');
      if (mobileBtn) mobileBtn.setAttribute('aria-expanded', 'true');
    }

    function closeMobileMenu() {
      document.body.classList.remove('bua-mobile-open', 'bua-scroll-locked');
      if (mobileBtn) mobileBtn.setAttribute('aria-expanded', 'false');
    }

    if (mobileBtn) {
      mobileBtn.addEventListener('click', () => {
        if (document.body.classList.contains('bua-mobile-open')) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      });
    }

    if (mobileOverlay) {
      mobileOverlay.addEventListener('click', closeMobileMenu);
    }

    if (mobileCloseBtn) {
      mobileCloseBtn.addEventListener('click', closeMobileMenu);
    }

    const mobileLinks = document.querySelectorAll('#bua-mobile-drawer a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    if (mobileSearchInput) {
      mobileSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const links = document.querySelectorAll('#bua-mobile-nav-list .bua-mobile-link');
        const groups = document.querySelectorAll('#bua-mobile-nav-list .bua-mobile-nav-group');

        links.forEach(link => {
          const text = link.textContent.toLowerCase();
          const match = !query || text.includes(query);
          link.style.display = match ? 'flex' : 'none';
        });

        groups.forEach(group => {
          const visible = Array.from(group.querySelectorAll('.bua-mobile-link')).some(l => l.style.display !== 'none');
          group.style.display = visible ? 'flex' : 'none';
        });
      });
    }

    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }

    // Sticky header scroll elevation
    const headerWrapper = document.querySelector('.bua-header-wrapper');
    if (headerWrapper) {
      const handleScroll = () => {
        if (window.scrollY > 8) {
          headerWrapper.classList.add('bua-scrolled');
        } else {
          headerWrapper.classList.remove('bua-scrolled');
        }
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }
  }

  /**
   * Dynamic Active Tool Highlight Updater
   */
  function setActiveTool(toolPathOrSlug) {
    const targetPath = normalizePath(toolPathOrSlug);

    // 1. Top menu bar active states (Home, Free Tools, Premium Tools, Pricing)
    const homeLink = document.getElementById('bua-nav-home');
    const freeToolsBtn = document.getElementById('bua-tools-trigger');
    const premiumLink = document.getElementById('bua-nav-premium');
    const pricingLink = document.getElementById('bua-nav-pricing');

    const mobHome = document.getElementById('bua-mob-home');
    const mobPremium = document.getElementById('bua-mob-premium');
    const mobPricing = document.getElementById('bua-mob-pricing');

    // Reset top links
    [homeLink, freeToolsBtn, premiumLink, pricingLink, mobHome, mobPremium, mobPricing].forEach(el => {
      if (el) el.classList.remove('bua-active');
    });

    if (targetPath === '/' || targetPath === '' || targetPath === '/index.html') {
      if (homeLink) homeLink.classList.add('bua-active');
      if (mobHome) mobHome.classList.add('bua-active');
    } else if (targetPath.startsWith('/premium')) {
      if (premiumLink) premiumLink.classList.add('bua-active');
      if (mobPremium) mobPremium.classList.add('bua-active');
    } else if (targetPath.startsWith('/pricing')) {
      if (pricingLink) pricingLink.classList.add('bua-active');
      if (mobPricing) mobPricing.classList.add('bua-active');
    } else {
      // Check if it's one of the free tools
      const isFreeTool = ALL_TOOLS.some(t => {
        const p = normalizePath(t.path);
        return p === targetPath || (targetPath && p.includes(targetPath));
      });
      if (isFreeTool && freeToolsBtn) {
        freeToolsBtn.classList.add('bua-active');
      }
    }

    // 2. Dropdown links
    const desktopLinks = document.querySelectorAll('#bua-tools-dropdown .bua-tool-link');
    desktopLinks.forEach(link => {
      const linkPath = normalizePath(link.getAttribute('data-path'));
      const isMatch = linkPath === targetPath || (targetPath && linkPath.includes(targetPath));
      if (isMatch) {
        link.classList.add('bua-active');
        const headerRow = link.querySelector('.bua-tool-header-row');
        if (headerRow && !headerRow.querySelector('.bua-badge')) {
          const badge = document.createElement('span');
          badge.className = 'bua-badge bua-badge-active';
          badge.textContent = 'Active';
          headerRow.appendChild(badge);
        }
      } else {
        link.classList.remove('bua-active');
        const activeBadge = link.querySelector('.bua-badge-active');
        if (activeBadge) activeBadge.remove();
      }
    });

    // 3. Mobile drawer tool links
    const mobileLinks = document.querySelectorAll('#bua-mobile-nav-list .bua-mobile-link');
    mobileLinks.forEach(link => {
      const linkPath = normalizePath(link.getAttribute('data-path'));
      const isMatch = linkPath === targetPath || (targetPath && linkPath.includes(targetPath));
      if (isMatch) {
        link.classList.add('bua-active');
      } else {
        link.classList.remove('bua-active');
      }
    });

    // 4. Footer links
    const footerLinks = document.querySelectorAll('.bua-footer-link');
    footerLinks.forEach(link => {
      const href = normalizePath(link.getAttribute('href'));
      if (href === targetPath) {
        link.classList.add('bua-active');
      } else {
        link.classList.remove('bua-active');
      }
    });
  }

  /**
   * Main Initialization
   */
  function init() {
    ensureStylesheet();
    ThemeManager.init();

    const activePath = getActiveToolPath();

    const headerContainer = document.getElementById('bua-header');
    if (headerContainer) {
      headerContainer.innerHTML = buildHeaderHTML(activePath);
    }

    const footerContainer = document.getElementById('bua-footer');
    if (footerContainer) {
      footerContainer.innerHTML = buildFooterHTML(activePath);
    }

    bindEvents();
    setActiveTool(activePath);
  }

  // Public API attached to window for manual control & integration
  window.BUANavbar = {
    init,
    setTheme: (theme) => ThemeManager.apply(theme, true),
    getTheme: () => ThemeManager.get(),
    setActive: setActiveTool,
    tools: TOOL_CATEGORIES,
    allTools: ALL_TOOLS,
    assetsBase: ASSETS_BASE,
    logoSrc: BRAND_LOGO_SRC
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
