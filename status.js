

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
