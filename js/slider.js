// Configurable slider functionality
// Handles CVSS and Time Estimation modals with custom sliders

let sliderModalOverlay = null;
let currentSliderTarget = null;
let currentSliderType = null;

// Slider configurations
const sliderConfigs = {
    cvss: {
        min: 0,
        max: 10,
        step: 0.1,
        unit: '',
        format: (val) => val.toFixed(1),
        colors: 'severity', // blue-to-red progression
        title: 'Edit CVSS',
        label: 'CVSS Score (0–10, step 0.1):',
        targetTitle: 'Edit CVSS'
    },
    time: {
        min: 1,
        max: 48,
        step: 0.5,
        unit: ' hrs',
        format: (val) => `${val} hrs`,
        colors: 'duration', // green-to-orange progression  
        title: 'Edit Estimated Time',
        label: 'Estimated Time (1–48 hours, step 0.5):',
        targetTitle: 'Edit Estimated Time'
    }
};

// Create generic slider modal
function createSliderModal() {
    if (!document.querySelector('.slider-modal-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'slider-modal-overlay';
        overlay.innerHTML = `
            <div class="slider-modal">
                <h3 id="slider-modal-title">Edit Value</h3>
                
                <!-- Custom Slider -->
                <div id="slider-container">
                    <label id="slider-label" for="slider-input">Value:</label>
                    <div class="custom-slider">
                        <div class="slider-track">
                            <div class="slider-fill" id="slider-fill"></div>
                        </div>
                        <div class="slider-thumb" id="slider-thumb"></div>
                        <input type="range" id="slider-input" min="0" max="10" step="0.1" value="0">
                    </div>
                    <div id="slider-output">0.0</div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        sliderModalOverlay = overlay;
        
        setupSliderModalListeners();
    } else {
        sliderModalOverlay = document.querySelector('.slider-modal-overlay');
    }
}

function setupSliderModalListeners() {
    // Close modal when clicking overlay
    sliderModalOverlay.addEventListener('click', function(e) {
        if (e.target === sliderModalOverlay) {
            closeSliderModal();
        }
    });

    // Ctrl + C to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'c' && e.ctrlKey && sliderModalOverlay.style.display === 'flex') {
            closeSliderModal();
        }
    });

    // Custom slider functionality
    const slider = sliderModalOverlay.querySelector('#slider-input');
    const thumb = sliderModalOverlay.querySelector('#slider-thumb');
    const fill = sliderModalOverlay.querySelector('#slider-fill');
    const output = sliderModalOverlay.querySelector('#slider-output');

    // Update slider visuals
    function updateSliderVisuals(value) {
        const config = sliderConfigs[currentSliderType];
        const percentage = (value - config.min) / (config.max - config.min);
        const color = calculateSliderColor(value, currentSliderType);
        
        // Update fill and thumb
        fill.style.width = (percentage * 100) + '%';
        fill.style.backgroundColor = color;
        thumb.style.backgroundColor = color;
        thumb.style.left = (percentage * 100) + '%';
        
        // Update output
        output.textContent = config.format(value);
        output.style.color = color;
    }

    // Slider input event
    slider.addEventListener('input', function() {
        const value = parseFloat(this.value);
        updateSliderVisuals(value);
        updateSliderValue(value);
    });

    // Mouse wheel support
    sliderModalOverlay.addEventListener('wheel', function(e) {
        e.preventDefault();
        e.stopPropagation();

        const config = sliderConfigs[currentSliderType];
        const currentValue = parseFloat(slider.value);
        const delta = e.deltaY > 0 ? -1 : 1;
        
        // Adaptive step size
        let step;
        if (Math.abs(e.deltaY) > 100) {
            step = config.step * 10;
        } else if (Math.abs(e.deltaY) > 50) {
            step = config.step * 5;
        } else {
            step = config.step;
        }

        const newValue = Math.max(config.min, Math.min(config.max, currentValue + (delta * step)));
        slider.value = newValue;
        updateSliderVisuals(newValue);
        updateSliderValue(newValue);
    }, { passive: false });
}

// Calculate color based on slider type and value
function calculateSliderColor(value, sliderType) {
    const config = sliderConfigs[sliderType];
    
    if (config.colors === 'severity') {
        // CVSS severity colors: gray -> blue -> purple -> pink-red -> red
        if (value === 0) {
            return 'rgb(128, 128, 128)'; // Gray
        }
        
        const percentage = value / config.max;
        
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
    } else if (config.colors === 'duration') {
        // Time duration colors: same as severity (gray -> blue -> purple -> pink-red -> red)
        if (value <= config.min) {
            return 'rgb(128, 128, 128)'; // Gray at minimum
        }
        
        const percentage = (value - config.min) / (config.max - config.min);
        
        if (percentage <= 0.25) {
            // Gray to Blue (1-12.75 hours)
            const localPercentage = percentage / 0.25;
            const red = Math.round(128 - (128 * localPercentage));
            const green = Math.round(128 - (26 * localPercentage)); 
            const blue = Math.round(128 + (127 * localPercentage));
            return `rgb(${red}, ${green}, ${blue})`;
        } else if (percentage <= 0.5) {
            // Blue to Purple (12.75-24.5 hours)
            const localPercentage = (percentage - 0.25) / 0.25;
            const red = Math.round(0 + (128 * localPercentage));
            const green = Math.round(102 - (102 * localPercentage));
            const blue = 255;
            return `rgb(${red}, ${green}, ${blue})`;
        } else if (percentage <= 0.75) {
            // Purple to Pink-Red (24.5-36.25 hours)
            const localPercentage = (percentage - 0.5) / 0.25;
            const red = Math.round(128 + (127 * localPercentage));
            const green = Math.round(0 + (102 * localPercentage));
            const blue = Math.round(255 - (153 * localPercentage));
            return `rgb(${red}, ${green}, ${blue})`;
        } else {
            // Pink-Red to Red (36.25-48 hours)
            const localPercentage = (percentage - 0.75) / 0.25;
            const red = 255;
            const green = Math.round(102 - (102 * localPercentage));
            const blue = Math.round(102 - (102 * localPercentage));
            return `rgb(${red}, ${green}, ${blue})`;
        }
    }
    
    // Fallback gray
    return 'rgb(128, 128, 128)';
}

// Open slider modal for specified type
function openSliderModal(target, sliderType) {
    currentSliderTarget = target;
    currentSliderType = sliderType;
    const config = sliderConfigs[sliderType];
    const currentValue = getSliderCurrentValue(target);
    
    // Configure modal
    const title = sliderModalOverlay.querySelector('#slider-modal-title');
    const label = sliderModalOverlay.querySelector('#slider-label');
    const slider = sliderModalOverlay.querySelector('#slider-input');
    const thumb = sliderModalOverlay.querySelector('#slider-thumb');
    const fill = sliderModalOverlay.querySelector('#slider-fill');
    const output = sliderModalOverlay.querySelector('#slider-output');
    
    // Set modal content
    title.textContent = config.title;
    label.textContent = config.label;
    
    // Configure slider
    slider.min = config.min;
    slider.max = config.max;
    slider.step = config.step;
    
    // Set current value
    const numericValue = parseFloat(currentValue) || config.min;
    slider.value = numericValue;
    
    // Update visuals
    const percentage = (numericValue - config.min) / (config.max - config.min);
    const color = calculateSliderColor(numericValue, sliderType);
    
    fill.style.width = (percentage * 100) + '%';
    fill.style.backgroundColor = color;
    thumb.style.backgroundColor = color;
    thumb.style.left = (percentage * 100) + '%';
    output.textContent = config.format(numericValue);
    output.style.color = color;

    // Show modal
    sliderModalOverlay.style.display = 'flex';
    
    // Focus slider
    setTimeout(() => {
        slider.focus();
    }, 100);
}

// Close slider modal
function closeSliderModal() {
    sliderModalOverlay.style.display = 'none';
    currentSliderTarget = null;
    currentSliderType = null;
}

// Get current slider value
function getSliderCurrentValue(target) {
    const fieldGroup = target.closest('.field-group, .timestamp-group');
    if (!fieldGroup) return '';
    
    const valueElement = fieldGroup.querySelector('.field-value, .timestamp');
    if (!valueElement) return '';
    
    const placeholder = valueElement.querySelector('.placeholder');
    return placeholder ? placeholder.textContent.trim() : '';
}

// Update slider value in real-time
function updateSliderValue(value) {
    const fieldGroup = currentSliderTarget.closest('.field-group, .timestamp-group');
    if (!fieldGroup) return;
    
    const valueElement = fieldGroup.querySelector('.field-value, .timestamp');
    const placeholder = valueElement?.querySelector('.placeholder');
    
    if (placeholder) {
        const config = sliderConfigs[currentSliderType];
        placeholder.textContent = config.format(value);
    }
}

// Initialize slider functionality
document.addEventListener('DOMContentLoaded', function() {
    createSliderModal();
    
    // Add event listener for CVSS edit icon
    const cvssEditIcon = document.querySelector('.edit-icon[title="Edit CVSS"]');
    if (cvssEditIcon) {
        cvssEditIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openSliderModal(this, 'cvss');
        });
    }
    
    // Add event listener for time estimation edit icon
    const timeEditIcon = document.querySelector('.edit-time-stamp[title="Edit Estimated Time"]');
    if (timeEditIcon) {
        timeEditIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openSliderModal(this, 'time');
        });
    }
    
    console.log('Slider functionality initialized');
});
