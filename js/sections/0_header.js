export function initHeader() {
    initHeaderEditIcon();
}

function initHeaderEditIcon() {
    const editIcon = document.querySelector('.header-edit-icon');
    
    if (editIcon) {
        // Add click handler for the edit icon
        editIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            // This will be used with modal functionality later
            console.log('Header edit clicked - modal functionality coming soon');
        });
    }
}

