// Details functionality for inline fields (CVSS, Slack, Jira, SIR)
// Handles URL storage, display, and click functionality

let detailsModalOverlay = null;
let currentDetailsTarget = null;

// URL field identifiers for Slack, Jira, SIR
const URL_FIELDS = ['slack-value', 'jira-value', 'sir-value'];

// Storage for full URLs
const urlStorage = {};

// Create details modal HTML
function createDetailsModal() {
    if (!document.querySelector('.details-popup-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'details-popup-overlay popup-overlay';
        overlay.innerHTML = `
            <div class="popup-form">
                <h3 id="details-modal-title">Edit Field</h3>
                <input type="text" id="details-modal-input" placeholder="Enter value">
                <div id="cvss-range-container" style="display: none;">
                    <label for="cvss-range">CVSS Score (0–10, step 0.1):</label>
                    <input type="range" id="cvss-range" name="cvss-range"
                           min="0" max="10" step="0.1" value="0.0">
                    <output id="rangeOutput">0.0</output>
                </div>
                <div class="popup-buttons">
                    <button class="details-cancel-btn cancel-btn">Cancel</button>
                    <button class="details-update-btn update-btn">Update</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        detailsModalOverlay = overlay;
        
        // Add event listeners
        setupDetailsModalListeners();
    } else {
        detailsModalOverlay = document.querySelector('.details-popup-overlay');
    }
}

function setupDetailsModalListeners() {
    // Listen for modal close events - only close when clicking the overlay background, not the modal content
    detailsModalOverlay.addEventListener('click', function(e) {
        // Only close if clicking the overlay itself, not any child elements (like the modal form or slider)
        if (e.target === detailsModalOverlay) {
            closeDetailsModal();
        }
    });

    // Cancel button
    detailsModalOverlay.querySelector('.details-cancel-btn').addEventListener('click', function() {
        closeDetailsModal();
    });

    // Update button
    detailsModalOverlay.querySelector('.details-update-btn').addEventListener('click', function() {
        updateDetailsValue();
    });

    // Enter key to submit (text input only)
    detailsModalOverlay.querySelector('#details-modal-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            updateDetailsValue();
        }
    });
    
    // Range input change listener
    const rangeInput = detailsModalOverlay.querySelector('#cvss-range');
    const rangeOutput = detailsModalOverlay.querySelector('#rangeOutput');
    
    rangeInput.addEventListener('input', function(e) {
        const value = parseFloat(e.target.value);
        rangeOutput.textContent = value.toString();
        updateRangeColor(rangeInput, value);
        
        // Auto-update CVSS value without closing modal
        updateCvssValueOnly();
    });
    
    // Add mouse wheel support for CVSS range slider - attach to modal overlay to capture all wheel events
    detailsModalOverlay.addEventListener('wheel', function(e) {
        // Only handle wheel events when CVSS range container is visible
        const rangeContainer = detailsModalOverlay.querySelector('#cvss-range-container');
        if (rangeContainer.style.display === 'none') return;
        
        e.preventDefault(); // Prevent page scroll
        e.stopPropagation(); // Prevent event bubbling
        
        const rangeSlider = detailsModalOverlay.querySelector('#cvss-range');
        const rangeOutput = detailsModalOverlay.querySelector('#rangeOutput');
        const currentValue = parseFloat(rangeSlider.value);
        
        // Adaptive step size based on scroll intensity for smoother experience
        let step;
        const scrollIntensity = Math.abs(e.deltaY);
        
        if (scrollIntensity > 100) {
            step = 1.0; // Large jumps for fast scrolling
        } else if (scrollIntensity > 50) {
            step = 0.5; // Medium jumps for normal scrolling
        } else {
            step = 0.1; // Fine adjustments for gentle scrolling
        }
        
        let newValue;
        
        // Scroll up increases value, scroll down decreases value
        if (e.deltaY < 0) {
            newValue = Math.min(10, currentValue + step);
        } else {
            newValue = Math.max(0, currentValue - step);
        }
        
        // Round to 1 decimal place to avoid floating point precision issues
        newValue = Math.round(newValue * 10) / 10;
        
        rangeSlider.value = newValue;
        rangeOutput.textContent = newValue.toString();
        updateRangeColor(rangeSlider, newValue);
        
        // Auto-update CVSS value without closing modal
        updateCvssValueOnly();
    }, { passive: false }); // passive: false allows preventDefault to work

    // Ctrl+C key to close
    document.addEventListener('keydown', function(e) {
        if ((e.key === 'c' && e.ctrlKey) && detailsModalOverlay.style.display === 'flex') {
            closeDetailsModal();
        }
    });
}

// Check if field is a CVSS field
function isCvssField(fieldId) {
    return fieldId === 'cvss-value';
}

// Check if field is a URL field
function isUrlField(fieldId) {
    return URL_FIELDS.includes(fieldId);
}

// Strip https:// from URL for display
function stripProtocol(url) {
    return url.replace(/^https?:\/\//, '');
}

// Truncate URL to 16 characters for display
function truncateForDisplay(url) {
    const stripped = stripProtocol(url);
    return stripped.length > 16 ? stripped.substring(0, 16) + '...' : stripped;
}

// Normalize URL (add https:// if missing)
function normalizeUrl(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return 'https://' + url;
    }
    return url;
}

// Open details modal
function openDetailsModal(target) {
    currentDetailsTarget = target;
    const title = target.getAttribute('title') || 'Edit Field';
    const currentValue = getDetailsCurrentValue(target);
    
    // Determine field type
    const fieldGroup = target.closest('.field-group');
    const valueElement = fieldGroup?.querySelector('.field-value');
    const fieldId = valueElement?.id;
    
    const isCvss = isCvssField(fieldId);
    
    // Set modal content
    detailsModalOverlay.querySelector('#details-modal-title').textContent = title;
    
    // Show/hide appropriate input controls
    const textInput = detailsModalOverlay.querySelector('#details-modal-input');
    const rangeContainer = detailsModalOverlay.querySelector('#cvss-range-container');
    const rangeInput = detailsModalOverlay.querySelector('#cvss-range');
    const rangeOutput = detailsModalOverlay.querySelector('#rangeOutput');
    const updateBtn = detailsModalOverlay.querySelector('.details-update-btn');
    
    if (isCvss) {
        // CVSS field - show range slider
        textInput.style.display = 'none';
        rangeContainer.style.display = 'block';
        updateBtn.style.display = 'none'; // No submit button needed
        
        // Hide cancel button for CVSS since clicking overlay closes modal
        const cancelBtn = detailsModalOverlay.querySelector('.details-cancel-btn');
        cancelBtn.style.display = 'none';
        
        // Set current value
        const numericValue = parseFloat(currentValue) || 0.0;
        rangeInput.value = numericValue;
        rangeOutput.textContent = numericValue.toString();
        
        // Update color based on value
        updateRangeColor(rangeInput, numericValue);
    } else {
        // Other fields - show text input
        textInput.style.display = 'block';
        rangeContainer.style.display = 'none';
        updateBtn.style.display = 'block';
        
        // Show cancel button for other fields
        const cancelBtn = detailsModalOverlay.querySelector('.details-cancel-btn');
        cancelBtn.style.display = 'block';
        
        textInput.value = currentValue;
    }

    // Show modal
    detailsModalOverlay.style.display = 'flex';
    
    // Focus appropriate input
    setTimeout(() => {
        if (isCvss) {
            rangeInput.focus();
        } else {
            textInput.focus();
            textInput.select();
        }
    }, 100);
}

// Close details modal
function closeDetailsModal() {
    detailsModalOverlay.style.display = 'none';
    currentDetailsTarget = null;
}

// Get current details value
function getDetailsCurrentValue(target) {
    const fieldGroup = target.closest('.field-group');
    if (!fieldGroup) return '';
    
    const valueElement = fieldGroup.querySelector('.field-value');
    if (!valueElement) return '';
    
    const fieldId = valueElement.id;
    
    // For URL fields, return full URL if stored
    if (isUrlField(fieldId) && urlStorage[fieldId]) {
        return urlStorage[fieldId];
    }
    
    // Otherwise return placeholder text
    const placeholder = valueElement.querySelector('.placeholder');
    return placeholder ? placeholder.textContent.trim() : '';
}

// Update range slider color based on value
function updateRangeColor(rangeInput, value) {
    // Calculate percentage (0-1)
    const percentage = value / 10;
    
    let thumbColor;
    
    if (value === 0) {
        // Gray at zero
        thumbColor = 'rgb(128, 128, 128)';
    } else {
        // Calculate thumb color based on position
        if (percentage <= 0.25) {
            // Gray to Blue transition (0-2.5)
            const localPercentage = percentage / 0.25;
            const red = Math.round(128 - (128 * localPercentage));
            const green = Math.round(128 - (26 * localPercentage)); 
            const blue = Math.round(128 + (127 * localPercentage));
            thumbColor = `rgb(${red}, ${green}, ${blue})`;
        } else if (percentage <= 0.5) {
            // Blue to Purple transition (2.5-5.0)
            const localPercentage = (percentage - 0.25) / 0.25;
            const red = Math.round(0 + (128 * localPercentage));
            const green = Math.round(102 - (102 * localPercentage));
            const blue = Math.round(255);
            thumbColor = `rgb(${red}, ${green}, ${blue})`;
        } else if (percentage <= 0.75) {
            // Purple to Pink-Red transition (5.0-7.5)
            const localPercentage = (percentage - 0.5) / 0.25;
            const red = Math.round(128 + (127 * localPercentage));
            const green = Math.round(0 + (102 * localPercentage));
            const blue = Math.round(255 - (153 * localPercentage));
            thumbColor = `rgb(${red}, ${green}, ${blue})`;
        } else {
            // Pink-Red to Red transition (7.5-10.0)
            const localPercentage = (percentage - 0.75) / 0.25;
            const red = 255;
            const green = Math.round(102 - (102 * localPercentage));
            const blue = Math.round(102 - (102 * localPercentage));
            thumbColor = `rgb(${red}, ${green}, ${blue})`;
        }
    }
    
    // Apply color to the range input
    // For WebKit browsers, the box-shadow technique handles the track
    // For Firefox, we still need to set the track background
    rangeInput.style.setProperty('--range-color', thumbColor);
    rangeInput.style.setProperty('--track-background', thumbColor);
}

// Update CVSS value only (for live slider updates without closing modal)
function updateCvssValueOnly() {
    const fieldGroup = currentDetailsTarget.closest('.field-group');
    if (!fieldGroup) return;
    
    const valueElement = fieldGroup.querySelector('.field-value');
    const placeholder = valueElement?.querySelector('.placeholder');
    
    if (!placeholder) return;

    const fieldId = valueElement.id;
    
    // Only update if it's a CVSS field
    if (isCvssField(fieldId)) {
        const rangeInput = detailsModalOverlay.querySelector('#cvss-range');
        const newValue = rangeInput.value;
        placeholder.textContent = newValue;
    }
}

// Update details value
function updateDetailsValue() {
    const fieldGroup = currentDetailsTarget.closest('.field-group');
    if (!fieldGroup) {
        closeDetailsModal();
        return;
    }
    
    const valueElement = fieldGroup.querySelector('.field-value');
    const placeholder = valueElement?.querySelector('.placeholder');
    
    if (!placeholder) {
        closeDetailsModal();
        return;
    }

    const fieldId = valueElement.id;
    let newValue;
    
    // Handle CVSS field
    if (isCvssField(fieldId)) {
        const rangeInput = detailsModalOverlay.querySelector('#cvss-range');
        newValue = rangeInput.value;
    } else {
        // Handle other fields
        newValue = detailsModalOverlay.querySelector('#details-modal-input').value.trim();
        
        if (!newValue) {
            alert('Please enter a value');
            return;
        }
    }
    
    // Handle URL fields (Slack, Jira, SIR)
    if (isUrlField(fieldId)) {
        const normalizedUrl = normalizeUrl(newValue);
        
        // Store full URL
        urlStorage[fieldId] = normalizedUrl;
        
        // Display truncated version
        const displayText = truncateForDisplay(normalizedUrl);
        placeholder.textContent = displayText;
        
        // Add data attribute for full URL and styling
        placeholder.setAttribute('data-full-url', normalizedUrl);
    } else {
        // Handle non-URL fields (like CVSS)
        placeholder.textContent = newValue;
    }

    closeDetailsModal();
}

// Handle URL placeholder clicks
function handleUrlClick(fieldId) {
    const fullUrl = urlStorage[fieldId];
    if (fullUrl) {
        alert(`Placeholder: navigation to ${fullUrl}`);
    }
}

// Initialize details functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Create details modal
    createDetailsModal();
    
    // Listen for clicks on inline field edit icons
    document.addEventListener('click', function(e) {
        if (e.target.matches('.inline-fields-container .edit-icon')) {
            e.preventDefault();
            openDetailsModal(e.target);
        }
    });
    
    // Listen for clicks on URL placeholders
    document.addEventListener('click', function(e) {
        if (e.target.matches('.placeholder[data-full-url]')) {
            e.preventDefault();
            const fieldValue = e.target.closest('.field-value');
            if (fieldValue && fieldValue.id) {
                handleUrlClick(fieldValue.id);
            }
        }
    });
    
    console.log('Details functionality initialized');
});
