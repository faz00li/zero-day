// Header functionality for editing submission title
// Handles the header edit icon and title updates

let headerModalOverlay = null;
let currentHeaderTarget = null;

// Create header modal HTML
function createHeaderModal() {
    if (!document.querySelector('.header-popup-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'header-popup-overlay popup-overlay';
        overlay.innerHTML = `
            <div class="popup-form">
                <h3 id="header-modal-title">Edit Submission Title</h3>
                <input type="text" id="header-modal-input" placeholder="Enter submission title">
                <div class="popup-buttons">
                    <button class="header-cancel-btn cancel-btn">Cancel</button>
                    <button class="header-update-btn update-btn">Update</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        headerModalOverlay = overlay;
        
        // Add event listeners
        setupHeaderModalListeners();
    } else {
        headerModalOverlay = document.querySelector('.header-popup-overlay');
    }
}

function setupHeaderModalListeners() {
    // Listen for modal close events
    headerModalOverlay.addEventListener('click', function(e) {
        if (e.target === headerModalOverlay) {
            closeHeaderModal();
        }
    });

    // Cancel button
    headerModalOverlay.querySelector('.header-cancel-btn').addEventListener('click', function() {
        closeHeaderModal();
    });

    // Update button
    headerModalOverlay.querySelector('.header-update-btn').addEventListener('click', function() {
        updateHeaderValue();
    });

    // Enter key to submit
    headerModalOverlay.querySelector('#header-modal-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            updateHeaderValue();
        }
    });

    // Ctrl+C key to close
    document.addEventListener('keydown', function(e) {
        if ((e.key === 'c' && e.ctrlKey) && headerModalOverlay.style.display === 'flex') {
            closeHeaderModal();
        }
    });
}

// Open header modal
function openHeaderModal(target) {
    currentHeaderTarget = target;
    const currentValue = getHeaderCurrentValue(target);

    // Set modal content
    headerModalOverlay.querySelector('#header-modal-input').value = currentValue;

    // Show modal
    headerModalOverlay.style.display = 'flex';
    
    // Focus input and select text
    setTimeout(() => {
        const input = headerModalOverlay.querySelector('#header-modal-input');
        input.focus();
        input.select();
    }, 100);
}

// Close header modal
function closeHeaderModal() {
    headerModalOverlay.style.display = 'none';
    currentHeaderTarget = null;
}

// Get current header value
function getHeaderCurrentValue(target) {
    const placeholder = target.closest('h1')?.querySelector('.placeholder');
    return placeholder ? placeholder.textContent.trim() : '';
}

// Update header value
function updateHeaderValue() {
    const newValue = headerModalOverlay.querySelector('#header-modal-input').value.trim();
    
    if (!newValue) {
        alert('Please enter a submission title');
        return;
    }

    // Find the placeholder span and update it
    const placeholder = currentHeaderTarget.closest('h1')?.querySelector('.placeholder');
    if (placeholder) {
        placeholder.textContent = newValue;
        // Also update page title
        document.title = newValue;
    }

    closeHeaderModal();
}

// Initialize header functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Create header modal
    createHeaderModal();
    
    // Listen for clicks on header edit icons
    document.addEventListener('click', function(e) {
        if (e.target.matches('.header-edit-icon')) {
            e.preventDefault();
            openHeaderModal(e.target);
        }
    });
    
    console.log('Header functionality initialized');
});
