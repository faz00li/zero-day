// Format date to YYYY-MM-DD HH:00 format
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:00`;
}

// Time estimation modal functionality - REMOVED
// Now handled by the configurable slider system in slider.js

// Initialize timestamps when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Set creation date
    const createdDateSpan = document.getElementById('created-date');
    if (createdDateSpan) {
        createdDateSpan.textContent = formatDate(new Date());
    }
    
    // Note: Estimated time editing now handled by slider system in slider.js
    
    console.log('Timestamp functionality initialized');
});
