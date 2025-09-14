// Format date to YYYY-MM-DD HH:00 format
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:00`;
}

document.addEventListener('DOMContentLoaded', function() {
    // Set creation date
    const createdDateSpan = document.getElementById('created-date');
    if (createdDateSpan) {
        createdDateSpan.textContent = formatDate(new Date());
    }

    // Get all status buttons and status display element
    const statusButtons = document.querySelectorAll('.status-button');
    const statusDisplay = document.getElementById('current-status-display');
    const currentStatusInput = document.getElementById('current-status');

    // Status colors mapping
    const statusColors = {
        'triage': '#FFD700',          // bright yellow (Gold)
        'monitor': '#FF9800',         // orange
        'de-escalated': '#7CB342',    // light green
        'de-escalated-critical': '#9C27B0', // purple
        'remediate-now': '#F44336',   // red
        'remediated': '#2E7D32',      // darker green
        'closed': '#4B515D'           // gray (unchanged)
    };

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
            statusDisplay.style.backgroundColor = statusColors[newStatus];
            statusDisplay.style.color = '#ffffff';
            
            // Update the current status input in the form
            if (currentStatusInput) {
                currentStatusInput.value = displayText;
            }
        });
    });
});
