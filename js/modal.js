let modalOverlay = null;
let currentTarget = null;

// Create modal HTML
function createModal() {
    if (!document.querySelector('.popup-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay';
        overlay.innerHTML = `
            <div class="popup-form">
                <h3 id="modal-title">Edit Field</h3>
                <input type="text" id="modal-input" placeholder="Enter new value">
                <div class="popup-buttons">
                    <button class="cancel-btn">Cancel</button>
                    <button class="update-btn">Update</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        modalOverlay = overlay;
    } else {
        modalOverlay = document.querySelector('.popup-overlay');
    }
}

// Open modal
function openModal(target) {
    currentTarget = target;
    const title = target.getAttribute('title') || 'Edit Field';
    const currentValue = getCurrentValue(target);

    // Set modal content
    modalOverlay.querySelector('#modal-title').textContent = title;
    modalOverlay.querySelector('#modal-input').value = currentValue;

    // Show modal
    modalOverlay.style.display = 'flex';
    
    // Focus input and select text
    setTimeout(() => {
        const input = modalOverlay.querySelector('#modal-input');
        input.focus();
        input.select();
    }, 100);
}

// Close modal
function closeModal() {
    modalOverlay.style.display = 'none';
    currentTarget = null;
}

// Get current value from target element
function getCurrentValue(target) {
    // Check if we're editing a textarea
    const textarea = target.closest('.form-group')?.querySelector('textarea');
    if (textarea) {
        return textarea.value.trim();
    }
    
    // Find the closest placeholder span - works for all editable fields
    const placeholder = target.closest('.field-group, .timestamp-group, h1')?.querySelector('.placeholder');
    return placeholder ? placeholder.textContent.trim() : '';
}

// Update value
function updateValue() {
    const newValue = modalOverlay.querySelector('#modal-input').value.trim();
    
    if (!newValue) {
        alert('Please enter a value');
        return;
    }

    // Check if we're updating a textarea
    const textarea = currentTarget.closest('.form-group')?.querySelector('textarea');
    if (textarea) {
        textarea.value = newValue;
        closeModal();
        return;
    }

    // Find the placeholder span and update it
    const placeholder = currentTarget.closest('.field-group, .timestamp-group, h1')?.querySelector('.placeholder');
    if (placeholder) {
        placeholder.textContent = newValue;
        
        // If it's the header title, also update page title
        if (currentTarget.classList.contains('header-edit-icon')) {
            document.title = newValue;
        }
    }

    closeModal();
}

// Initialize modal when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Create modal
    createModal();
    
    // Listen for clicks on edit icons
    document.addEventListener('click', function(e) {
        if (e.target.matches('.edit-icon, .header-edit-icon')) {
            e.preventDefault();
            openModal(e.target);
        }
    });

    // Listen for modal close events
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Cancel button
    modalOverlay.querySelector('.cancel-btn').addEventListener('click', function() {
        closeModal();
    });

    // Update button
    modalOverlay.querySelector('.update-btn').addEventListener('click', function() {
        updateValue();
    });

    // Enter key to submit
    modalOverlay.querySelector('#modal-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            updateValue();
        }
    });

    // Escape key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalOverlay.style.display === 'flex') {
            closeModal();
        }
    });

    console.log('Modal functionality initialized');
});
