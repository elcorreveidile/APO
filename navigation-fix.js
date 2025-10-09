// SpanishFlow - Navigation and Button Interaction Fixes
// This file contains fixes for common mobile interaction issues

(function() {
    'use strict';
    
    // Prevent default touch behaviors that interfere with interactions
    document.addEventListener('touchstart', function(e) {
        // Allow interactions on specific elements
        const interactiveElements = [
            '.recording-button',
            '.level-card',
            '.subject-card',
            '.nav-item',
            '.playback-button',
            '.action-button',
            '.favorite-btn',
            '.filter-chip'
        ];
        
        const target = e.target;
        const isInteractive = interactiveElements.some(selector => 
            target.closest(selector)
        );
        
        if (!isInteractive) {
            // Prevent scrolling on non-interactive elements
            // but allow on scrollable containers
            const scrollableContainers = [
                '.splide__track',
                '.smooth-scroll'
            ];
            
            const isScrollable = scrollableContainers.some(selector => 
                target.closest(selector)
            );
            
            if (!isScrollable) {
                e.preventDefault();
            }
        }
    }, { passive: false });
    
    // Fix for 300ms delay on mobile
    document.addEventListener('touchend', function(e) {
        const target = e.target;
        
        // Handle clicks immediately for better responsiveness
        if (target.closest('button, a, .clickable, .nav-item, .level-card, .subject-card')) {
            // Prevent default to avoid double-click issues
            e.preventDefault();
            
            // Trigger click event manually
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            
            target.dispatchEvent(clickEvent);
        }
    }, { passive: false });
    
    // Enhanced button interaction handling
    function enhanceButtonInteractions() {
        // Add proper touch feedback to all buttons
        const buttons = document.querySelectorAll('button, .touch-target, .nav-item, .level-card, .subject-card, .favorite-btn');
        
        buttons.forEach(button => {
            // Remove any existing event listeners to prevent duplicates
            button.replaceWith(button.cloneNode(true));
        });
        
        // Re-add event listeners with proper handling
        document.querySelectorAll('button, .touch-target, .nav-item, .level-card, .subject-card, .favorite-btn').forEach(button => {
            
            // Touch start - add visual feedback
            button.addEventListener('touchstart', function(e) {
                this.style.transform = 'scale(0.95)';
                this.style.opacity = '0.8';
            }, { passive: true });
            
            // Touch end - remove visual feedback
            button.addEventListener('touchend', function(e) {
                setTimeout(() => {
                    this.style.transform = '';
                    this.style.opacity = '';
                }, 150);
            }, { passive: true });
            
            // Touch cancel - remove visual feedback
            button.addEventListener('touchcancel', function(e) {
                this.style.transform = '';
                this.style.opacity = '';
            }, { passive: true });
        });
    }
    
    // Fix navigation issues
    function fixNavigation() {
        // Ensure all navigation links work properly
        const navLinks = document.querySelectorAll('a[href]');
        
        navLinks.forEach(link => {
            // Skip if already handled
            if (link.dataset.navigationFixed) return;
            
            link.dataset.navigationFixed = 'true';
            
            link.addEventListener('click', function(e) {
                // Prevent default and handle navigation manually
                e.preventDefault();
                
                const href = this.getAttribute('href');
                if (href && href !== '#') {
                    // Add loading state
                    document.body.style.opacity = '0.8';
                    
                    // Navigate after a brief delay for visual feedback
                    setTimeout(() => {
                        window.location.href = href;
                    }, 100);
                }
            });
        });
    }
    
    // Fix level card interactions
    function fixLevelCards() {
        const levelCards = document.querySelectorAll('.level-card');
        
        levelCards.forEach(card => {
            if (card.dataset.levelFixed) return;
            card.dataset.levelFixed = 'true';
            
            card.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const level = this.dataset.level;
                if (level && window.spanishFlowApp && window.spanishFlowApp.switchLevel) {
                    window.spanishFlowApp.switchLevel(level);
                    
                    // Visual feedback
                    anime({
                        targets: this,
                        scale: [1, 0.95, 1],
                        duration: 200,
                        easing: 'easeInOutQuad'
                    });
                }
            });
        });
    }
    
    // Fix subject card interactions
    function fixSubjectCards() {
        const subjectCards = document.querySelectorAll('.subject-card');
        
        subjectCards.forEach(card => {
            if (card.dataset.subjectFixed) return;
            card.dataset.subjectFixed = 'true';
            
            card.addEventListener('click', function(e) {
                // Don't trigger if clicking on favorite button
                if (e.target.closest('.favorite-btn')) return;
                
                e.preventDefault();
                e.stopPropagation();
                
                const subject = this.dataset.subject;
                if (subject) {
                    localStorage.setItem('selected_subject', subject);
                    
                    // Visual feedback
                    anime({
                        targets: this,
                        scale: [1, 0.95, 1],
                        duration: 200,
                        easing: 'easeInOutQuad',
                        complete: () => {
                            window.location.href = 'index.html';
                        }
                    });
                }
            });
        });
    }
    
    // Fix favorite buttons
    function fixFavoriteButtons() {
        const favoriteButtons = document.querySelectorAll('.favorite-btn');
        
        favoriteButtons.forEach(button => {
            if (button.dataset.favoriteFixed) return;
            button.dataset.favoriteFixed = 'true';
            
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Get subject from parent card
                const card = this.closest('.subject-card');
                if (card) {
                    const subject = card.dataset.subject;
                    if (subject && typeof toggleFavorite === 'function') {
                        toggleFavorite(e, subject);
                    }
                }
            });
        });
    }
    
    // Fix filter chips
    function fixFilterChips() {
        const filterChips = document.querySelectorAll('.filter-chip');
        
        filterChips.forEach(chip => {
            if (chip.dataset.filterFixed) return;
            chip.dataset.filterFixed = 'true';
            
            chip.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all chips
                filterChips.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked chip
                this.classList.add('active');
                
                // Trigger filter if function exists
                if (typeof filterByLevel === 'function') {
                    const filter = this.dataset.filter;
                    filterByLevel(filter);
                }
            });
        });
    }
    
    // Initialize all fixes when DOM is ready
    function initializeFixes() {
        enhanceButtonInteractions();
        fixNavigation();
        fixLevelCards();
        fixSubjectCards();
        fixFavoriteButtons();
        fixFilterChips();
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFixes);
    } else {
        initializeFixes();
    }
    
    // Re-apply fixes when new content is added (for dynamic content)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                // Re-apply fixes to new elements
                setTimeout(initializeFixes, 100);
            }
        });
    });
    
    // Observe body for new elements
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Prevent zoom on double tap for iOS
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Prevent default touch behaviors that might interfere
    document.addEventListener('touchmove', function(e) {
        // Allow scrolling in scrollable containers
        const scrollableContainers = ['.splide__track', '.smooth-scroll'];
        const isScrollable = scrollableContainers.some(selector => 
            e.target.closest(selector)
        );
        
        if (!isScrollable) {
            // Prevent scrolling on non-scrollable elements
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }
    }, { passive: false });
    
    // Handle orientation changes
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            // Re-initialize any size-dependent components
            if (window.spanishFlowApp && window.spanishFlowApp.initializeWaveform) {
                window.spanishFlowApp.initializeWaveform();
            }
        }, 100);
    });
    
    console.log('SpanishFlow navigation fixes applied successfully');
})();