(function() {
  'use strict';

  const CONFIG = {
    headerHeight: 80,
    scrollOffset: 20,
    scrollSpyOffset: 100,
    debounceDelay: 150,
    countUpDuration: 2000,
    formSubmitDelay: 1000,
    emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phonePattern: /^[\d\s\+\-\(\)]{10,20}$/,
    namePattern: /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/,
    messageMinLength: 10
  };

  class BurgerMenu {
    constructor() {
      this.toggle = document.querySelector('.c-nav__toggle, .navbar-toggler');
      this.nav = document.querySelector('.navbar-collapse');
      this.body = document.body;
      
      if (this.toggle && this.nav) {
        this.init();
      }
    }

    init() {
      this.toggle.addEventListener('click', () => this.toggleMenu());
      
      document.addEventListener('click', (e) => {
        if (this.nav.classList.contains('show') && 
            !this.nav.contains(e.target) && 
            !this.toggle.contains(e.target)) {
          this.closeMenu();
        }
      });

      this.nav.querySelectorAll('.c-nav__link, .nav-link').forEach(link => {
        link.addEventListener('click', () => {
          if (window.innerWidth < 768) {
            this.closeMenu();
          }
        });
      });
    }

    toggleMenu() {
      const isOpen = this.nav.classList.contains('show');
      isOpen ? this.closeMenu() : this.openMenu();
    }

    openMenu() {
      this.nav.classList.add('show');
      this.toggle.setAttribute('aria-expanded', 'true');
      this.body.classList.add('u-no-scroll');
    }

    closeMenu() {
      this.nav.classList.remove('show');
      this.toggle.setAttribute('aria-expanded', 'false');
      this.body.classList.remove('u-no-scroll');
    }
  }

  class SmoothScroll {
    constructor() {
      this.init();
    }

    init() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const href = anchor.getAttribute('href');
          if (href === '#' || href === '#!') return;
          
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            this.scrollTo(target);
          }
        });
      });
    }

    scrollTo(target) {
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = targetPosition - CONFIG.headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  class ScrollSpy {
    constructor() {
      this.sections = document.querySelectorAll('[id]');
      this.navLinks = document.querySelectorAll('.c-nav__link, .nav-link');
      
      if (this.sections.length && this.navLinks.length) {
        this.init();
      }
    }

    init() {
      window.addEventListener('scroll', this.debounce(() => this.onScroll(), CONFIG.debounceDelay));
      this.onScroll();
    }

    onScroll() {
      const scrollPos = window.pageYOffset + CONFIG.scrollSpyOffset;

      this.sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          this.navLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
            
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
              link.setAttribute('aria-current', 'page');
            }
          });
        }
      });
    }

    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
  }

  class ScrollToTop {
    constructor() {
      this.button = this.createButton();
      this.init();
    }

    createButton() {
      const btn = document.createElement('button');
      btn.className = 'c-scroll-top';
      btn.setAttribute('aria-label', 'Návrat hore');
      btn.innerHTML = '↑';
      btn.style.cssText = 'position:fixed;bottom:2rem;right:2rem;width:48px;height:48px;border-radius:50%;background:var(--color-primary);color:var(--color-white);border:none;cursor:pointer;opacity:0;visibility:hidden;transition:opacity 0.3s,visibility 0.3s;z-index:999;';
      document.body.appendChild(btn);
      return btn;
    }

    init() {
      window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
          this.button.style.opacity = '1';
          this.button.style.visibility = 'visible';
        } else {
          this.button.style.opacity = '0';
          this.button.style.visibility = 'hidden';
        }
      });

      this.button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  class CountUp {
    constructor() {
      this.stats = document.querySelectorAll('.c-stat__number');
      this.hasRun = false;
      
      if (this.stats.length) {
        this.init();
      }
    }

    init() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.hasRun) {
            this.hasRun = true;
            this.animateAll();
          }
        });
      }, { threshold: 0.5 });

      this.stats.forEach(stat => observer.observe(stat));
    }

    animateAll() {
      this.stats.forEach(stat => {
        const target = parseInt(stat.textContent.replace(/\D/g, ''));
        const suffix = stat.textContent.replace(/[0-9]/g, '');
        this.animate(stat, 0, target, suffix);
      });
    }

    animate(element, start, end, suffix) {
      const duration = CONFIG.countUpDuration;
      const startTime = performance.now();

      const step = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        
        element.textContent = current + suffix;

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    }
  }

  class FormValidator {
    constructor() {
      this.forms = document.querySelectorAll('.c-form, form[id]');
      
      if (this.forms.length) {
        this.init();
      }
    }

    init() {
      this.forms.forEach(form => {
        form.addEventListener('submit', (e) => this.handleSubmit(e, form));
      });
    }

    handleSubmit(e, form) {
      e.preventDefault();
      
      this.clearErrors(form);
      
      const isValid = this.validateForm(form);
      
      if (isValid) {
        this.submitForm(form);
      }
    }

    validateForm(form) {
      let isValid = true;

      const firstName = form.querySelector('#firstName, #first-name');
      const lastName = form.querySelector('#lastName, #last-name');
      const email = form.querySelector('#email');
      const phone = form.querySelector('#phone');
      const message = form.querySelector('#message');
      const privacy = form.querySelector('#privacy, #privacy-consent');
      const service = form.querySelector('#service');

      if (firstName && !this.validateName(firstName.value)) {
        this.showError(firstName, 'Zadajte platné meno (2-50 znakov)');
        isValid = false;
      }

      if (lastName && !this.validateName(lastName.value)) {
        this.showError(lastName, 'Zadajte platné priezvisko (2-50 znakov)');
        isValid = false;
      }

      if (email && !this.validateEmail(email.value)) {
        this.showError(email, 'Zadajte platnú emailovú adresu');
        isValid = false;
      }

      if (phone && !this.validatePhone(phone.value)) {
        this.showError(phone, 'Zadajte platné telefónne číslo (10-20 znakov)');
        isValid = false;
      }

      if (message && !this.validateMessage(message.value)) {
        this.showError(message, 'Správa musí obsahovať minimálne 10 znakov');
        isValid = false;
      }

      if (service && !service.value) {
        this.showError(service, 'Vyberte službu');
        isValid = false;
      }

      if (privacy && !privacy.checked) {
        this.showError(privacy, 'Musíte súhlasiť so spracovaním osobných údajov');
        isValid = false;
      }

      return isValid;
    }

    validateName(value) {
      return CONFIG.namePattern.test(value.trim());
    }

    validateEmail(value) {
      return CONFIG.emailPattern.test(value.trim());
    }

    validatePhone(value) {
      return CONFIG.phonePattern.test(value.trim());
    }

    validateMessage(value) {
      return value.trim().length >= CONFIG.messageMinLength;
    }

    showError(field, message) {
      field.classList.add('has-error', 'is-invalid');
      
      let errorElement = field.parentElement.querySelector('.c-form__error, .invalid-feedback');
      
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'c-form__error invalid-feedback';
        errorElement.setAttribute('role', 'alert');
        field.parentElement.appendChild(errorElement);
      }
      
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }

    clearErrors(form) {
      form.querySelectorAll('.has-error, .is-invalid').forEach(field => {
        field.classList.remove('has-error', 'is-invalid');
      });
      
      form.querySelectorAll('.c-form__error, .invalid-feedback').forEach(error => {
        error.textContent = '';
        error.style.display = 'none';
      });
    }

    submitForm(form) {
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Odosielam...';
      submitBtn.classList.add('is-disabled');

      setTimeout(() => {
        if (navigator.onLine) {
          window.location.href = 'thank_you.html';
        } else {
          alert('Chyba pripojenia. Skúste to prosím neskôr.');
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          submitBtn.classList.remove('is-disabled');
        }
      }, CONFIG.formSubmitDelay);
    }
  }

  class PortfolioFilter {
    constructor() {
      this.filterButtons = document.querySelectorAll('[data-filter]');
      this.portfolioItems = document.querySelectorAll('[data-category]');
      
      if (this.filterButtons.length && this.portfolioItems.length) {
        this.init();
      }
    }

    init() {
      this.filterButtons.forEach(button => {
        button.addEventListener('click', () => this.filter(button));
      });
    }

    filter(button) {
      const filter = button.getAttribute('data-filter');
      
      this.filterButtons.forEach(btn => btn.classList.remove('is-active'));
      button.classList.add('is-active');

      this.portfolioItems.forEach(item => {
        const category = item.getAttribute('data-category');
        
        if (filter === 'all' || category === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    }
  }

  class Accordion {
    constructor() {
      this.accordions = document.querySelectorAll('.accordion');
      
      if (this.accordions.length) {
        this.init();
      }
    }

    init() {
      this.accordions.forEach(accordion => {
        const buttons = accordion.querySelectorAll('.accordion-button');
        
        buttons.forEach(button => {
          button.addEventListener('click', () => this.toggle(button, accordion));
        });
      });
    }

    toggle(button, accordion) {
      const target = button.getAttribute('data-bs-target');
      const collapse = document.querySelector(target);
      const isExpanded = button.getAttribute('aria-expanded') === 'true';

      accordion.querySelectorAll('.accordion-collapse').forEach(item => {
        if (item !== collapse) {
          item.classList.remove('show');
          const btn = accordion.querySelector(`[data-bs-target="#${item.id}"]`);
          if (btn) {
            btn.classList.add('collapsed');
            btn.setAttribute('aria-expanded', 'false');
          }
        }
      });

      if (isExpanded) {
        collapse.classList.remove('show');
        button.classList.add('collapsed');
        button.setAttribute('aria-expanded', 'false');
      } else {
        collapse.classList.add('show');
        button.classList.remove('collapsed');
        button.setAttribute('aria-expanded', 'true');
      }
    }
  }

  class ModalHandler {
    constructor() {
      this.triggers = document.querySelectorAll('[data-modal]');
      this.modals = new Map();
      
      if (this.triggers.length) {
        this.init();
      }
    }

    init() {
      this.triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          const modalId = trigger.getAttribute('data-modal');
          this.open(modalId);
        });
      });
    }

    open(modalId) {
      if (!this.modals.has(modalId)) {
        this.createModal(modalId);
      }
      
      const modal = this.modals.get(modalId);
      modal.style.display = 'block';
      document.body.classList.add('u-no-scroll');
    }

    createModal(modalId) {
      const modal = document.createElement('div');
      modal.className = 'c-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:1000;display:none;overflow-y:auto;';
      
      const content = document.createElement('div');
      content.style.cssText = 'max-width:800px;margin:2rem auto;background:white;padding:2rem;border-radius:0.5rem;';
      
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '×';
      closeBtn.setAttribute('aria-label', 'Zavrieť');
      closeBtn.style.cssText = 'position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:2rem;cursor:pointer;';
      closeBtn.addEventListener('click', () => this.close(modalId));
      
      content.appendChild(closeBtn);
      modal.appendChild(content);
      document.body.appendChild(modal);
      
      this.modals.set(modalId, modal);
    }

    close(modalId) {
      const modal = this.modals.get(modalId);
      if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('u-no-scroll');
      }
    }
  }

  function init() {
    new BurgerMenu();
    new SmoothScroll();
    new ScrollSpy();
    new ScrollToTop();
    new CountUp();
    new FormValidator();
    new PortfolioFilter();
    new Accordion();
    new ModalHandler();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();