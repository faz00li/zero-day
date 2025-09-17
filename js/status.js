// Status functionality for updating submission status
// Handles status button clicks and status display updates

// Get CSS variable values for status colors
function getStatusColor(status) {
    return getComputedStyle(document.documentElement).getPropertyValue(`--status-${status}`).trim();
}

// Initialize status functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Get all status buttons and status display element
    const statusButtons = document.querySelectorAll('.status-button');
    const statusDisplay = document.getElementById('submission-status-display');
    const currentStatusInput = document.getElementById('current-status');

    // Set initial active state for Triage button
    const triageButton = document.querySelector('.status-button[data-status="triage"]');
    if (triageButton) {
        triageButton.classList.add('active');
    }

    // Add click event listener to each button
    statusButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            statusButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get the status from data attribute
            const newStatus = this.dataset.status;
            
            // Update the status display
            const displayText = this.textContent;
            statusDisplay.textContent = displayText;
            
            // Update the color of the status badge
            const statusColor = getStatusColor(newStatus);
            statusDisplay.style.backgroundColor = statusColor;
            statusDisplay.style.color = '#ffffff';
            
            // Update the current status input in the form (if it exists)
            if (currentStatusInput) {
                currentStatusInput.value = displayText;
            }
            
            console.log(`Status updated to: ${displayText}`);
        });
    });

    console.log('Status functionality initialized');
});