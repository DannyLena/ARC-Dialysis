/* ========================================
   ARC Dialysis Location Selector Popup
   Standalone JavaScript File
   ======================================== */

(function() {
    'use strict';
    
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLocationSelector);
    } else {
        initLocationSelector();
    }
    
    function initLocationSelector() {
        // Get DOM elements
        const popup = document.getElementById('locationPopup');
        const closeButton = document.getElementById('closePopup');
        
        if (!popup) {
            console.warn('Location popup element not found');
            return;
        }
        
        // Get all trigger buttons (using data attribute or specific IDs)
        const triggerButtons = document.querySelectorAll('[data-location-popup-trigger], #openLocationPopup, #openLocationPopupCTA');
        
        // Function to open popup
        function openPopup(e) {
            e.preventDefault();
            popup.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            
            // Track popup open event
            trackEvent('popup_opened', 'Location Selector', 'Popup Opened');
        }
        
        // Function to close popup
        function closePopup() {
            popup.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
            
            // Track popup close event
            trackEvent('popup_closed', 'Location Selector', 'Popup Closed');
        }
        
        // Attach event listeners to all trigger buttons
        if (triggerButtons.length > 0) {
            triggerButtons.forEach(function(button) {
                button.addEventListener('click', openPopup);
            });
            console.log('ARC Location Selector: Found ' + triggerButtons.length + ' trigger button(s)');
        } else {
            console.warn('ARC Location Selector: No trigger buttons found. Add data-location-popup-trigger attribute to your buttons.');
        }
        
        // Close popup - Close button
        if (closeButton) {
            closeButton.addEventListener('click', closePopup);
        }
        
        // Close popup when clicking outside
        popup.addEventListener('click', function(e) {
            if (e.target === popup) {
                closePopup();
            }
        });
        
        // Close popup with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && popup.classList.contains('active')) {
                closePopup();
            }
        });
        
        // Track click events on location links
        const locationLinks = document.querySelectorAll('.location-link');
        locationLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                const locationName = this.querySelector('.location-name').textContent;
                const phoneNumber = this.querySelector('.location-phone').textContent;
                
                console.log('User selected location:', locationName, phoneNumber);
                
                // Track the location selection
                trackEvent('location_selected', 'Phone Call', locationName);
            });
        });
        
        console.log('ARC Location Selector initialized successfully');
    }
    
    // Universal tracking function
    function trackEvent(eventName, category, label) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                'event_category': category,
                'event_label': label
            });
        }
        
        // Universal Analytics (legacy)
        if (typeof ga !== 'undefined') {
            ga('send', 'event', category, eventName, label);
        }
        
        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Contact', {
                content_name: eventName,
                content_category: category
            });
        }
        
        // Console log for debugging
        console.log('Event tracked:', eventName, category, label);
    }
    
})();
