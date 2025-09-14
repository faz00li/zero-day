
document.addEventListener('DOMContentLoaded', function() {
    // Set creation date
    const createdDateSpan = document.getElementById('created-date');
    if (createdDateSpan) {
        createdDateSpan.textContent = formatDate(new Date());
    }
