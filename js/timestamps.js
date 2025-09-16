// Format date to YYYY-MM-DD HH:00 format
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:00`;
}

// Time estimation modal functionality
let timestampModal = null;

function createTimestampModal() {
    if (!document.querySelector('.timestamp-modal-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'timestamp-modal-overlay';
        overlay.innerHTML = `
            <div class="timestamp-modal">
                <h3>Estimate Time to Complete Triage</h3>
                <form id="time-estimate-form">
                    <label for="hours">Time To Triage (hours):</label>
                    <input type="number" id="hours" name="hours" min="0" step="1" required>
                    <div class="timestamp-modal-buttons">
                        <button type="button" class="cancel-timestamp-btn">Cancel</button>
                        <button type="submit">Submit</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);
        timestampModal = overlay;
        
        // Add event listeners
        setupTimestampModalListeners();
    } else {
        timestampModal = document.querySelector('.timestamp-modal-overlay');
    }
}

function setupTimestampModalListeners() {
    // Close modal when clicking overlay
    timestampModal.addEventListener('click', function(e) {
        if (e.target === timestampModal) {
            closeTimestampModal();
        }
    });

    // Cancel button
    timestampModal.querySelector('.cancel-timestamp-btn').addEventListener('click', function() {
        closeTimestampModal();
    });

    // Ctrl + C to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'c' && e.ctrlKey && timestampModal.style.display === 'flex') {
            closeTimestampModal();
        }
    });

    // Form submission
    timestampModal.querySelector('#time-estimate-form').addEventListener('submit', function(e) {
        e.preventDefault();
        handleTimeEstimateSubmit();
    });
}

function openTimestampModal() {
    const estimatedTimeElement = document.querySelector('#estimated-time .placeholder');
    const currentValue = estimatedTimeElement ? estimatedTimeElement.textContent.trim() : '';
    const currentHours = currentValue ? parseInt(currentValue) : '';
    timestampModal.querySelector('#hours').value = currentHours;
    timestampModal.style.display = 'flex';
    setTimeout(() => {
        const input = timestampModal.querySelector('#hours');
        input.focus();
        input.select();
    }, 100);
}

function closeTimestampModal() {
    timestampModal.style.display = 'none';
}

function handleTimeEstimateSubmit() {
    const hoursInput = timestampModal.querySelector('#hours');
    const hours = parseInt(hoursInput.value);
    
    if (isNaN(hours) || hours < 0) {
        alert('Please enter a valid number of hours');
        return;
    }
    
    // Update the display
    const estimatedTimeElement = document.querySelector('#estimated-time .placeholder');
    if (estimatedTimeElement) {
        const displayText = hours === 1 ? '1 hour' : `${hours} hours`;
        estimatedTimeElement.textContent = displayText;
    }
    
    closeTimestampModal();
}

// Initialize timestamps when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Set creation date
    const createdDateSpan = document.getElementById('created-date');
    if (createdDateSpan) {
        createdDateSpan.textContent = formatDate(new Date());
    }
    
    // Create timestamp modal
    createTimestampModal();
    
    // Add event listener for estimated time edit icon
    const estimatedTimeEditIcon = document.querySelector('.edit-time-stamp[title="Edit Estimated Time"]');
    if (estimatedTimeEditIcon) {
        estimatedTimeEditIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent other modal handlers from firing
            openTimestampModal();
        });
    }
    
    console.log('Timestamp functionality initialized');
});
