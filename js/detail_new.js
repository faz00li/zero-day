// Details functionality for inline fields (CVSS, Slack, Jira, SIR)
// Complete re-implementation with custom slider

let detailsModalOverlay = null;
let currentDetailsTarget = null;

// URL field identifiers
const URL_FIELDS = ['slack-value', 'jira-value', 'sir-value'];
const urlStorage = {};

// Create details modal with custom slider
function createDetailsModal() {
    if (!document.querySelector('.details-modal-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'details-modal-overlay';
        overlay.innerHTML = `
            <div class="details-modal">
                <h3 id="details-modal-title">Edit Field</h3>
                
                <!-- Text input for URL fields -->
                <input type="text" id="details-modal-input" placeholder="Enter value...">
                
                <!-- Custom CVSS Slider -->
                <div id="cvss-slider-container" style="display: none;">
                    <label for="cvss-slider">CVSS Score (0–10, step 0.1):</label>
                    <div class="custom-slider">
                        <div class="slider-track">
                            <div class="slider-fill" id="slider-fill"></div>
                        </div>
                        <div class="slider-thumb" id="slider-thumb"></div>
                        <input type="range" id="cvss-slider" min="0" max="10" step="0.1" value="0">
                    </div>
                    <div id="cvss-output">0.0</div>
                </div>
                
                <!-- Buttons -->
                <div class="details-modal-buttons">
                    <button type="button" class="details-cancel-btn">Cancel</button>
                    <button type="button" class="details-update-btn">Update</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        detailsModalOverlay = overlay;
        
        setupDetailsModalListeners();
    } else {
        detailsModalOverlay = document.querySelector('.details-modal-overlay');
    }
}

function setupDetailsModalListeners() {
    // Close modal when clicking overlay
    detailsModalOverlay.addEventListener('click', function(e) {
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

    // Ctrl + C to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'c' && e.ctrlKey && detailsModalOverlay.style.display === 'flex') {
            closeDetailsModal();
        }
    });

    // Custom slider functionality
    const slider = detailsModalOverlay.querySelector('#cvss-slider');
    const thumb = detailsModalOverlay.querySelector('#slider-thumb');
    const fill = detailsModalOverlay.querySelector('#slider-fill');
    const output = detailsModalOverlay.querySelector('#cvss-output');

    // Update slider visuals
    function updateSliderVisuals(value) {
        const percentage = value / 10;
        const color = calculateSliderColor(value);
        
        // Update fill and thumb
        fill.style.width = (percentage * 100) + '%';
        fill.style.backgroundColor = color;
        thumb.style.backgroundColor = color;
        thumb.style.left = (percentage * 100) + '%';
        
        // Update output
        output.textContent = value.toFixed(1);
        output.style.color = color;
    }

    // Slider input event
    slider.addEventListener('input', function() {
        const value = parseFloat(this.value);
        updateSliderVisuals(value);
        updateCvssValue(value);
    });

    // Mouse wheel support
    detailsModalOverlay.addEventListener('wheel', function(e) {
        const sliderContainer = detailsModalOverlay.querySelector('#cvss-slider-container');
        if (sliderContainer.style.display === 'none') return;

        e.preventDefault();
        e.stopPropagation();

        const currentValue = parseFloat(slider.value);
        const delta = e.deltaY > 0 ? -1 : 1;
        
        // Adaptive step size
        let step;
        if (Math.abs(e.deltaY) > 100) {
            step = 1.0;
        } else if (Math.abs(e.deltaY) > 50) {
            step = 0.5;
        } else {
            step = 0.1;
        }

        const newValue = Math.max(0, Math.min(10, currentValue + (delta * step)));
        slider.value = newValue;
        updateSliderVisuals(newValue);
        updateCvssValue(newValue);
    }, { passive: false });
}

// Calculate color based on CVSS value
function calculateSliderColor(value) {
    if (value === 0) {
        return 'rgb(128, 128, 128)'; // Gray
    }
    
    const percentage = value / 10;
    
    if (percentage <= 0.25) {
        // Gray to Blue (0-2.5)
        const localPercentage = percentage / 0.25;
        const red = Math.round(128 - (128 * localPercentage));
        const green = Math.round(128 - (26 * localPercentage)); 
        const blue = Math.round(128 + (127 * localPercentage));
        return `rgb(${red}, ${green}, ${blue})`;
    } else if (percentage <= 0.5) {
        // Blue to Purple (2.5-5.0)
        const localPercentage = (percentage - 0.25) / 0.25;
        const red = Math.round(0 + (128 * localPercentage));
        const green = Math.round(102 - (102 * localPercentage));
        const blue = 255;
        return `rgb(${red}, ${green}, ${blue})`;
    } else if (percentage <= 0.75) {
        // Purple to Pink-Red (5.0-7.5)
        const localPercentage = (percentage - 0.5) / 0.25;
        const red = Math.round(128 + (127 * localPercentage));
        const green = Math.round(0 + (102 * localPercentage));
        const blue = Math.round(255 - (153 * localPercentage));
        return `rgb(${red}, ${green}, ${blue})`;
    } else {
        // Pink-Red to Red (7.5-10.0)
        const localPercentage = (percentage - 0.75) / 0.25;
        const red = 255;
        const green = Math.round(102 - (102 * localPercentage));
        const blue = Math.round(102 - (102 * localPercentage));
        return `rgb(${red}, ${green}, ${blue})`;
    }
}

// Check if field is CVSS field
function isCvssField(fieldId) {
    return fieldId === 'cvss-value';
}

// Check if field is URL field
function isUrlField(fieldId) {
    return URL_FIELDS.includes(fieldId);
}

// Strip protocol from URL
function stripProtocol(url) {
    return url.replace(/^https?:\/\//, '');
}

// Truncate URL for display
function truncateForDisplay(url) {
    const stripped = stripProtocol(url);
    return stripped.length > 16 ? stripped.substring(0, 16) + '...' : stripped;
}

// Normalize URL
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
    
    // Show/hide appropriate controls
    const textInput = detailsModalOverlay.querySelector('#details-modal-input');
    const sliderContainer = detailsModalOverlay.querySelector('#cvss-slider-container');
    const slider = detailsModalOverlay.querySelector('#cvss-slider');
    const updateBtn = detailsModalOverlay.querySelector('.details-update-btn');
    const cancelBtn = detailsModalOverlay.querySelector('.details-cancel-btn');
    
    if (isCvss) {
        // CVSS field - show custom slider
        textInput.style.display = 'none';
        sliderContainer.style.display = 'block';
        updateBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
        
        // Set current value
        const numericValue = parseFloat(currentValue) || 0.0;
        slider.value = numericValue;
        
        // Update visuals
        const thumb = detailsModalOverlay.querySelector('#slider-thumb');
        const fill = detailsModalOverlay.querySelector('#slider-fill');
        const output = detailsModalOverlay.querySelector('#cvss-output');
        
        const percentage = numericValue / 10;
        const color = calculateSliderColor(numericValue);
        
        fill.style.width = (percentage * 100) + '%';
        fill.style.backgroundColor = color;
        thumb.style.backgroundColor = color;
        thumb.style.left = (percentage * 100) + '%';
        output.textContent = numericValue.toFixed(1);
        output.style.color = color;
    } else {
        // URL field - show text input
        textInput.style.display = 'block';
        sliderContainer.style.display = 'none';
        updateBtn.style.display = 'block';
        cancelBtn.style.display = 'block';
        
        textInput.value = currentValue;
    }

    // Show modal
    detailsModalOverlay.style.display = 'flex';
    
    // Focus appropriate input
    setTimeout(() => {
        if (isCvss) {
            slider.focus();
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

// Update CVSS value in real-time
function updateCvssValue(value) {
    const fieldGroup = currentDetailsTarget.closest('.field-group');
    if (!fieldGroup) return;
    
    const valueElement = fieldGroup.querySelector('.field-value');
    const placeholder = valueElement?.querySelector('.placeholder');
    
    if (placeholder) {
        placeholder.textContent = value.toFixed(1);
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
    const textInput = detailsModalOverlay.querySelector('#details-modal-input');
    let newValue = textInput.value.trim();
    
    if (isUrlField(fieldId)) {
        if (newValue) {
            // Store full URL
            const normalizedUrl = normalizeUrl(newValue);
            urlStorage[fieldId] = normalizedUrl;
            
            // Display truncated version
            placeholder.textContent = truncateForDisplay(normalizedUrl);
        } else {
            // Clear stored URL
            delete urlStorage[fieldId];
            placeholder.textContent = 'Click to add';
        }
    } else {
        // Non-URL field
        placeholder.textContent = newValue || 'Click to add';
    }
    
    closeDetailsModal();
}

// Initialize details functionality
document.addEventListener('DOMContentLoaded', function() {
    createDetailsModal();
    
    // Add event listeners to all edit icons
    document.querySelectorAll('.edit-icon').forEach(icon => {
        // Skip timestamp edit icons
        if (icon.classList.contains('edit-time-stamp')) {
            return;
        }
        
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openDetailsModal(this);
        });
    });
    
    console.log('Details functionality initialized');
});
