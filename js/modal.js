// Simple functional modal for edit icons - no modules, no OOP
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
    // For header edit icon (title editing)
    if (target.classList.contains('header-edit-icon')) {
        const h1 = target.closest('h1');
        const titleText = h1.textContent.replace('✎', '').trim();
        // Remove the status text at the end
        const statusElement = h1.querySelector('#submission-status-display');
        if (statusElement) {
            return titleText.replace(statusElement.textContent.trim(), '').trim();
        }
        return titleText;
    }

    // For field edit icons
    const fieldValue = target.closest('.field-group')?.querySelector('.field-value');
    if (fieldValue) {
        return fieldValue.textContent.replace('✎', '').trim();
    }

    return '';
}

// Update value
function updateValue() {
    const newValue = modalOverlay.querySelector('#modal-input').value.trim();
    
    if (!newValue) {
        alert('Please enter a value');
        return;
    }

    // Update the target element
    if (currentTarget.classList.contains('header-edit-icon')) {
        updateHeaderTitle(newValue);
    } else {
        updateFieldValue(newValue);
    }

    closeModal();
}

// Update header title
function updateHeaderTitle(newTitle) {
    const h1 = currentTarget.closest('h1');
    const statusElement = h1.querySelector('#submission-status-display');
    const editIcon = h1.querySelector('.header-edit-icon');
    
    // Clear h1 and rebuild with new title
    h1.innerHTML = '';
    h1.appendChild(editIcon);
    h1.appendChild(document.createTextNode(newTitle + ' '));
    h1.appendChild(statusElement);

    // Also update page title
    document.title = newTitle;
}

// Update field value
function updateFieldValue(newValue) {
    const fieldValue = currentTarget.closest('.field-group')?.querySelector('.field-value');
    if (fieldValue) {
        // Preserve the edit icon
        const editIcon = fieldValue.querySelector('.edit-icon');
        fieldValue.textContent = newValue;
        fieldValue.appendChild(editIcon);
    }
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
