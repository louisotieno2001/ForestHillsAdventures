document.addEventListener('DOMContentLoaded', () => {
    // 1. Enhanced Intersection Observer for cinematic reveal animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);

    // Observe all elements with reveal classes
    const revealElements = document.querySelectorAll('.reveal-on-scroll, .reveal-left, .reveal-right, .reveal-scale');
    revealElements.forEach(el => {
        observer.observe(el);
    });

    // Handle elements already in viewport on load
    revealElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
            el.classList.add('revealed');
        }
    });

    // 2. Simple Parallax & Horizontal Scroll Mapping
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        // --- Parallax BGs ---
        const parallaxBgs = document.querySelectorAll('.cinematic-bg');
        parallaxBgs.forEach(bg => {
            const parent = bg.parentElement;
            const parentOffset = parent.offsetTop;
            const parentHeight = parent.offsetHeight;
            
            if (scrolled + window.innerHeight > parentOffset && scrolled < parentOffset + parentHeight) {
                const yPos = (scrolled - parentOffset) * 0.3;
                bg.style.transform = `translateY(${yPos}px)`;
            }
        });

        // --- Horizontal Scroll Showcase ---
        const horizontalSection = document.querySelector('.horizontal-scroll-section');
        if (horizontalSection) {
            const strip = horizontalSection.querySelector('.horizontal-content-strip');
            const sectionOffset = horizontalSection.offsetTop;
            const sectionHeight = horizontalSection.offsetHeight;
            const windowHeight = window.innerHeight;
            
            // Calculate how far we've scrolled within the section (0 to 1)
            let progress = (scrolled - sectionOffset) / (sectionHeight - windowHeight);
            progress = Math.max(0, Math.min(1, progress));
            
            // Map progress to horizontal translation
            const maxTranslation = strip.scrollWidth - window.innerWidth;
            const translateX = -progress * maxTranslation;
            strip.style.transform = `translateX(${translateX}px)`;

            // Image Motion (Scaling & Subtle Rotation based on proximity to center)
            const items = horizontalSection.querySelectorAll('.horizontal-showcase-item');
            items.forEach(item => {
                const img = item.querySelector('.rounded-showcase-image');
                const rect = item.getBoundingClientRect();
                const centerOffset = (rect.left + rect.width / 2) - (window.innerWidth / 2);
                const maxOffset = window.innerWidth / 2;
                const progressToCenter = centerOffset / maxOffset;
                
                // Scale factor: closer to center = larger (1.1), farther = smaller (0.85)
                let scale = 1.1 - Math.abs(progressToCenter) * 0.25;
                scale = Math.max(0.85, Math.min(1.1, scale));
                
                // Subtle rotation: -3 to 3 degrees based on side of center
                const rotate = progressToCenter * 3;
                
                img.style.transform = `scale(${scale}) rotate(${rotate}deg)`;
                
                // Opacity shift for text focus: center is clear (1), edges are subtle (0.7)
                const text = item.querySelector('.horizontal-showcase-text');
                let opacity = 1 - Math.abs(progressToCenter) * 0.3;
                opacity = Math.max(0.7, Math.min(1, opacity));
                text.style.opacity = opacity;
            });
        }
    });
});
