// CVSS slider functionality only
// Handles the Edit CVSS modal with custom slider

let cvssModalOverlay = null;
let currentCvssTarget = null;

// Create CVSS modal with custom slider
function createCvssModal() {
    if (!document.querySelector('.cvss-modal-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'cvss-modal-overlay';
        overlay.innerHTML = `
            <div class="cvss-modal">
                <h3>Edit CVSS</h3>
                
                <!-- Custom CVSS Slider -->
                <div id="cvss-slider-container">
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
            </div>
        `;
        document.body.appendChild(overlay);
        cvssModalOverlay = overlay;
        
        setupCvssModalListeners();
    } else {
        cvssModalOverlay = document.querySelector('.cvss-modal-overlay');
    }
}

function setupCvssModalListeners() {
    // Close modal when clicking overlay
    cvssModalOverlay.addEventListener('click', function(e) {
        if (e.target === cvssModalOverlay) {
            closeCvssModal();
        }
    });

    // Ctrl + C to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'c' && e.ctrlKey && cvssModalOverlay.style.display === 'flex') {
            closeCvssModal();
        }
    });

    // Custom slider functionality
    const slider = cvssModalOverlay.querySelector('#cvss-slider');
    const thumb = cvssModalOverlay.querySelector('#slider-thumb');
    const fill = cvssModalOverlay.querySelector('#slider-fill');
    const output = cvssModalOverlay.querySelector('#cvss-output');

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
    cvssModalOverlay.addEventListener('wheel', function(e) {
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

// Open CVSS modal
function openCvssModal(target) {
    currentCvssTarget = target;
    const currentValue = getCvssCurrentValue(target);
    
    // Set current value
    const slider = cvssModalOverlay.querySelector('#cvss-slider');
    const thumb = cvssModalOverlay.querySelector('#slider-thumb');
    const fill = cvssModalOverlay.querySelector('#slider-fill');
    const output = cvssModalOverlay.querySelector('#cvss-output');
    
    const numericValue = parseFloat(currentValue) || 0.0;
    slider.value = numericValue;
    
    // Update visuals
    const percentage = numericValue / 10;
    const color = calculateSliderColor(numericValue);
    
    fill.style.width = (percentage * 100) + '%';
    fill.style.backgroundColor = color;
    thumb.style.backgroundColor = color;
    thumb.style.left = (percentage * 100) + '%';
    output.textContent = numericValue.toFixed(1);
    output.style.color = color;

    // Show modal
    cvssModalOverlay.style.display = 'flex';
    
    // Focus slider
    setTimeout(() => {
        slider.focus();
    }, 100);
}

// Close CVSS modal
function closeCvssModal() {
    cvssModalOverlay.style.display = 'none';
    currentCvssTarget = null;
}

// Get current CVSS value
function getCvssCurrentValue(target) {
    const fieldGroup = target.closest('.field-group');
    if (!fieldGroup) return '';
    
    const valueElement = fieldGroup.querySelector('.field-value');
    if (!valueElement) return '';
    
    const placeholder = valueElement.querySelector('.placeholder');
    return placeholder ? placeholder.textContent.trim() : '';
}

// Update CVSS value in real-time
function updateCvssValue(value) {
    const fieldGroup = currentCvssTarget.closest('.field-group');
    if (!fieldGroup) return;
    
    const valueElement = fieldGroup.querySelector('.field-value');
    const placeholder = valueElement?.querySelector('.placeholder');
    
    if (placeholder) {
        placeholder.textContent = value.toFixed(1);
    }
}

// Initialize CVSS functionality
document.addEventListener('DOMContentLoaded', function() {
    createCvssModal();
    
    // Add event listener specifically for CVSS edit icon
    const cvssEditIcon = document.querySelector('.edit-icon[title="Edit CVSS"]');
    if (cvssEditIcon) {
        cvssEditIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openCvssModal(this);
        });
    }
    
    console.log('CVSS functionality initialized');
});
