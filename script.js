document.addEventListener('DOMContentLoaded', () => {
    
    // 0. Scroll Effects (Nav background & Hero Logos fade)
    const nav = document.querySelector('.liquid-nav');
    const heroLogos = document.getElementById('hero-logos');
    
    window.addEventListener('scroll', () => {
        // Nav blur
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        
        // Hero logos fade out (fades entirely out within 100px)
        if (heroLogos) {
            const opacity = 1 - window.scrollY / 100; // faster fade
            heroLogos.style.opacity = Math.max(0, opacity);
            heroLogos.style.pointerEvents = opacity <= 0 ? 'none' : 'auto';
        }

        // Background glows: fade out when #work section or footer is in view
        const bgGlow = document.getElementById('bg-glow-container');
        const workSection = document.getElementById('work');
        const footer = document.querySelector('footer');
        if (bgGlow && workSection && footer) {
            const viewH = window.innerHeight;
            const scrollY = window.scrollY;
            const workTop = workSection.offsetTop;
            const workBottom = workTop + workSection.offsetHeight;
            const footerTop = footer.offsetTop;
            const footerBottom = footerTop + footer.offsetHeight;

            // Current viewport range
            const vpTop = scrollY;
            const vpBottom = scrollY + viewH;

            // Check overlap with work section
            const workOverlap = Math.max(0, Math.min(vpBottom, workBottom) - Math.max(vpTop, workTop));
            const workRatio = Math.min(1, workOverlap / (viewH * 0.5));

            // Check overlap with footer
            const footerOverlap = Math.max(0, Math.min(vpBottom, footerBottom) - Math.max(vpTop, footerTop));
            const footerRatio = Math.min(1, footerOverlap / (viewH * 0.5));

            // Take the max fade-out factor
            const fadeOut = Math.max(workRatio, footerRatio);
            bgGlow.style.opacity = Math.max(0, 1 - fadeOut);
        }

        // Footer gradient: fade in during last viewport of scroll, max 0.8
        const footerGradient = document.getElementById('footer-gradient');
        if (footerGradient) {
            const docHeight = document.documentElement.scrollHeight;
            const viewH = window.innerHeight;
            const maxScroll = docHeight - viewH;
            // "Last screen" starts at maxScroll - viewH
            const fadeStart = maxScroll - viewH;
            if (window.scrollY <= fadeStart) {
                footerGradient.style.opacity = 0;
            } else if (window.scrollY >= maxScroll) {
                footerGradient.style.opacity = 0.8;
            } else {
                const progress = (window.scrollY - fadeStart) / (maxScroll - fadeStart);
                footerGradient.style.opacity = (progress * 0.8).toFixed(3);
            }
        }
    });
    
    // 1. Scroll Fade-In Animation (Intersection Observer)
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Trigger only once
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));

    // 2. Expand Work Experience Details (Click entire item)
    const workItems = document.querySelectorAll('.work-item');
    workItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const fullDetails = this.querySelector('.work-full-details');
            const topBtn = this.querySelector('.expand-btn');
            if (!fullDetails) return;

            // Determine what was clicked
            const isClickInsideDetails = fullDetails.contains(e.target);
            const isClickOnBottomBtn = e.target.closest('.expand-btn-bottom');
            
            // If clicking inside details (e.g. copying text), do not toggle, UNLESS clicking the bottom close btn
            if (isClickInsideDetails && !isClickOnBottomBtn) {
                return;
            }

            const isOpen = fullDetails.classList.contains('open');
            const headerOffset = 100;
            
            if (!isOpen) {
                // Accordion behavior: Close all OTHER open details
                // Calculate how much height will be lost ABOVE us before we scroll
                let heightLostAbove = 0;
                const thisTop = this.getBoundingClientRect().top;

                document.querySelectorAll('.work-full-details.open').forEach(otherDetail => {
                    const otherTop = otherDetail.getBoundingClientRect().top;
                    // If the open item is physically above the clicked item, its collapse will shift us up
                    if (otherTop < thisTop) {
                        heightLostAbove += otherDetail.getBoundingClientRect().height;
                    }

                    otherDetail.classList.remove('open');
                    const workItemParent = otherDetail.closest('.work-item');
                    if (workItemParent) workItemParent.classList.remove('is-open');
                    const otherTopBtn = otherDetail.closest('.work-item').querySelector('.expand-btn');
                    if (otherTopBtn) {
                        otherTopBtn.innerHTML = '展开详情';
                        otherTopBtn.classList.remove('active');
                    }
                });

                // Open current
                fullDetails.classList.add('open');
                this.classList.add('is-open');
                if (topBtn) {
                    topBtn.innerHTML = '收起';
                    topBtn.classList.add('active');
                }
                
                // Track where it WILL be after the things above it shrink
                const elementPosition = this.getBoundingClientRect().top - heightLostAbove;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({
                     top: offsetPosition,
                     behavior: 'smooth'
                });

            } else {
                // Close
                fullDetails.classList.remove('open');
                this.classList.remove('is-open');
                if (topBtn) {
                    topBtn.innerHTML = '展开详情';
                    topBtn.classList.remove('active');
                }
                
                // If closing from the bottom button, scroll back up to the card top slightly
                if (isClickOnBottomBtn) {
                    const elementPosition = this.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                         top: offsetPosition,
                         behavior: 'smooth'
                    });
                }
            }
        });
    });

    // 3. AI Chat Widget Toggle (Morph Animation)
    const aiToggleBtn = document.getElementById('ai-toggle-btn');
    const aiCloseBtn = document.getElementById('ai-close-btn');
    const aiMorphContainer = document.getElementById('ai-morph-container');
    
    function toggleChat() {
        if (aiMorphContainer.classList.contains('open')) {
            aiMorphContainer.classList.remove('open');
        } else {
            aiMorphContainer.classList.add('open');
        }
    }

    aiToggleBtn.addEventListener('click', toggleChat);
    aiCloseBtn.addEventListener('click', toggleChat);
    
    // Close when clicking outside of the floating widget
    document.addEventListener('click', (event) => {
        const widgetContainer = document.getElementById('ai-widget-container');
        if (!widgetContainer.contains(event.target) && aiMorphContainer.classList.contains('open')) {
            toggleChat();
        }
    });

    // 4. Smooth scrolling for anchor links (Nav & CTA)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 100;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Check if target is a work item, and open its details Automatically
                if (targetElement.classList.contains('work-item')) {
                    const fullDetails = targetElement.querySelector('.work-full-details');
                    const topBtn = targetElement.querySelector('.expand-btn');
                    
                    // Same offset logic when navigated via anchor link
                    let heightLostAbove = 0;
                    const thisTop = targetElement.getBoundingClientRect().top;

                    // Collapse others
                    document.querySelectorAll('.work-full-details.open').forEach(otherDetail => {
                        if (otherDetail !== fullDetails) {
                            const otherTop = otherDetail.getBoundingClientRect().top;
                            // If the open item is physically above the target item, its collapse will shift target up
                            if (otherTop < thisTop) {
                                heightLostAbove += otherDetail.getBoundingClientRect().height;
                            }

                            otherDetail.classList.remove('open');
                            const otherWorkItem = otherDetail.closest('.work-item');
                            if (otherWorkItem) otherWorkItem.classList.remove('is-open');
                            const otherTopBtn = otherDetail.closest('.work-item').querySelector('.expand-btn');
                            if (otherTopBtn) {
                                otherTopBtn.innerHTML = '展开详情';
                                otherTopBtn.classList.remove('active');
                            }
                        }
                    });

                    // Recalculate where it WILL be after things above it shrink, then update scroll mid-flight
                    if (heightLostAbove > 0) {
                         const correctedOffsetPosition = offsetPosition - heightLostAbove;
                         window.scrollTo({
                             top: correctedOffsetPosition,
                             behavior: 'smooth'
                         });
                    }

                    if (fullDetails && !fullDetails.classList.contains('open')) {
                        // trigger synchronously
                        fullDetails.classList.add('open');
                        targetElement.classList.add('is-open');
                        if (topBtn) {
                            topBtn.innerHTML = '收起';
                            topBtn.classList.add('active');
                        }
                    }
                }
            }
        });
    });

    // 5. Background Glow Mouse Interaction (magnetic repulsion)
    const glowRed = document.querySelector('.glow-red');
    const glowBlue = document.querySelector('.glow-blue');

    if (glowRed && glowBlue) {
        let mouseX = -9999, mouseY = -9999;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Leave mouse far away when it leaves the window
        document.addEventListener('mouseleave', () => {
            mouseX = -9999;
            mouseY = -9999;
        });

        const glows = [
            { el: glowRed, ox: 0, oy: 0, vx: 0, vy: 0 },
            { el: glowBlue, ox: 0, oy: 0, vx: 0, vy: 0 }
        ];

        function animateGlows() {
            const mouseRepelRadius = 400;
            const mouseRepelForce = 12;
            const glowRepelRadius = 500;
            const glowRepelForce = 8;
            const springForce = 0.012;
            const damping = 0.93;

            // Get current visual centers
            const centers = glows.map(g => {
                const r = g.el.getBoundingClientRect();
                return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
            });

            for (let i = 0; i < glows.length; i++) {
                const g = glows[i];
                const c = centers[i];
                let fx = 0, fy = 0;

                // Mouse repulsion
                const dmx = c.x - mouseX;
                const dmy = c.y - mouseY;
                const distM = Math.sqrt(dmx * dmx + dmy * dmy);
                if (distM < mouseRepelRadius && distM > 1) {
                    const strength = ((mouseRepelRadius - distM) / mouseRepelRadius);
                    fx += (dmx / distM) * strength * mouseRepelForce;
                    fy += (dmy / distM) * strength * mouseRepelForce;
                }

                // Glow-glow repulsion (prevent overlap)
                for (let j = 0; j < glows.length; j++) {
                    if (i === j) continue;
                    const oc = centers[j];
                    const dgx = c.x - oc.x;
                    const dgy = c.y - oc.y;
                    const distG = Math.sqrt(dgx * dgx + dgy * dgy);
                    if (distG < glowRepelRadius && distG > 1) {
                        const strength = ((glowRepelRadius - distG) / glowRepelRadius);
                        fx += (dgx / distG) * strength * glowRepelForce;
                        fy += (dgy / distG) * strength * glowRepelForce;
                    }
                }

                // Spring back to home position (ox=0, oy=0)
                fx -= g.ox * springForce;
                fy -= g.oy * springForce;

                // Integrate velocity + damping
                g.vx = (g.vx + fx) * damping;
                g.vy = (g.vy + fy) * damping;
                g.ox += g.vx;
                g.oy += g.vy;

                g.el.style.transform = `translate(${g.ox}px, ${g.oy}px)`;
            }

            requestAnimationFrame(animateGlows);
        }

        animateGlows();
    }
});
