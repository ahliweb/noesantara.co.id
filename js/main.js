// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Header
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close mobile menu when a link is clicked
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    // 3. Simple Scroll Animation using Intersection Observer
    // Adding fade-in animation to sections
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply animation initial state to elements we want to animate
    const animateElements = document.querySelectorAll('.pilar-card, .kandungan-card, .method-card, .gallery-item, .testimoni-card, .benefit-tier-card, .simulasi-card, .roadmap-item, .artikel-card');
    
    animateElements.forEach(el => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // 4. Dynamic Profit Calculation (Simulasi Keuntungan)
    const formatNum = (num) => num.toLocaleString('id-ID');
    const parseNum = (str) => parseInt(str.replace(/\./g, '')) || 0;

    const simulasiQty = document.getElementById('simulasi-qty');
    const totalDropshipper = document.getElementById('total-dropshipper');
    const totalReseller = document.getElementById('total-reseller');
    const totalAgen = document.getElementById('total-agen');

    const MARGIN_DROPSHIPPER = 30000;
    const MARGIN_RESELLER = 50000;
    const MARGIN_AGEN = 70000;

    function calculateTotalProfits() {
        // Automatically remove any non-numeric characters as the user types (except dots which we handle below)
        const cleanStr = simulasiQty.value.replace(/\./g, '').replace(/\D/g, '');
        const qty = parseInt(cleanStr) || 0;
        
        totalDropshipper.innerText = formatNum(qty * MARGIN_DROPSHIPPER);
        totalReseller.innerText = formatNum(qty * MARGIN_RESELLER);
        totalAgen.innerText = formatNum(qty * MARGIN_AGEN);
    }

    if (simulasiQty) {
        // Trigger calculation immediately when typing
        simulasiQty.addEventListener('input', function() {
            // Remove non-numeric chars immediately so user can't type letters
            this.value = this.value.replace(/[^0-9]/g, '');
            calculateTotalProfits();
        });
        
        simulasiQty.addEventListener('blur', () => {
            const qty = parseInt(simulasiQty.value.replace(/\D/g, '')) || 0;
            simulasiQty.value = formatNum(qty);
            calculateTotalProfits();
        });

        simulasiQty.addEventListener('focus', () => {
            // Remove dots formatting when focusing so it's easy to edit
            simulasiQty.value = simulasiQty.value.replace(/\./g, '');
        });

        simulasiQty.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                simulasiQty.blur();
            }
        });
    }
});
