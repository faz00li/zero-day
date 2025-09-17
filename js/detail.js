// Details functionality for inline fields (Slack, Jira, SIR)
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

    // Ctrl+C key to close
    document.addEventListener('keydown', function(e) {
        if ((e.key === 'c' && e.ctrlKey) && detailsModalOverlay.style.display === 'flex') {
            closeDetailsModal();
        }
    });
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
    
    // Set modal content
    detailsModalOverlay.querySelector('#details-modal-title').textContent = title;
    
    // Show text input
    const textInput = detailsModalOverlay.querySelector('#details-modal-input');
    textInput.style.display = 'block';
    textInput.value = currentValue;

    // Show modal
    detailsModalOverlay.style.display = 'flex';
    
    // Focus text input
    setTimeout(() => {
        textInput.focus();
        textInput.select();
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
    
    // Get new value from text input
    const newValue = detailsModalOverlay.querySelector('#details-modal-input').value.trim();
    
    if (!newValue) {
        alert('Please enter a value');
        return;
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
        // Handle non-URL fields
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
    
    // Listen for clicks on inline field edit icons (excluding CVSS)
    document.addEventListener('click', function(e) {
        // Check if it's an edit icon
        if (e.target.classList.contains('edit-icon')) {
            const title = e.target.getAttribute('title');
            
            // Check if it's in the inline fields container
            const inlineContainer = e.target.closest('.inline-fields-container');
            
            if (inlineContainer && title !== 'Edit CVSS') {
                e.preventDefault();
                openDetailsModal(e.target);
            }
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
