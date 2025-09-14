document.addEventListener('DOMContentLoaded', function() {
    // Create popup elements
    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'popup-overlay';
    popupOverlay.innerHTML = `
        <div class="popup-form">
            <h3 id="popup-title">Edit Field</h3>
            <input type="text" id="popup-input">
            <div class="popup-buttons">
                <button class="cancel-btn">Cancel</button>
                <button class="update-btn">Update</button>
            </div>
        </div>
    `;
    document.body.appendChild(popupOverlay);

    // Get popup elements
    const popup = {
        overlay: popupOverlay,
        title: document.getElementById('popup-title'),
        input: document.getElementById('popup-input'),
        updateBtn: popupOverlay.querySelector('.update-btn'),
        cancelBtn: popupOverlay.querySelector('.cancel-btn')
    };

    // Current editing context
    let currentEditContext = null;

    // Add click handlers to all edit icons
    document.querySelectorAll('.edit-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            const fieldGroup = icon.closest('.field-group');
            const fieldValue = fieldGroup.querySelector('.field-value');
            const fieldLabel = fieldGroup.querySelector('.field-label').textContent;
            const currentValue = fieldValue.childNodes[0].textContent.trim();

            // Set up popup
            popup.title.textContent = `Edit ${fieldLabel}`;
            popup.input.value = currentValue === '-' ? '' : currentValue;
            popup.overlay.style.display = 'flex';

            // Store context for update
            currentEditContext = {
                fieldValue: fieldValue,
                fieldId: fieldValue.id
            };
        });
    });

    // Handle popup update
    popup.updateBtn.addEventListener('click', () => {
        if (currentEditContext) {
            const newValue = popup.input.value.trim();
            // Update the text content (first node, before the edit icon)
            currentEditContext.fieldValue.childNodes[0].textContent = newValue || '-';
            
            // Add clickable class if there's a value
            if (newValue !== '-') {
                currentEditContext.fieldValue.classList.add('clickable');
            } else {
                currentEditContext.fieldValue.classList.remove('clickable');
            }
        }
        popup.overlay.style.display = 'none';
    });

    // Handle popup cancel
    popup.cancelBtn.addEventListener('click', () => {
        popup.overlay.style.display = 'none';
    });

    // TODO: Add click handlers for navigation
    // Handle clicks on field values for Slack, Jira, and SIR
    ['slack-value', 'jira-value', 'sir-value'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', (e) => {
                // Only handle clicks on the text content, not the edit icon
                if (!e.target.classList.contains('edit-icon')) {
                    const value = element.childNodes[0].textContent.trim();
                    if (value && value !== '-') {
                        alert(`Navigating to ${value}`);
                        // TODO: Implement actual navigation logic
                    }
                }
            });
        }
    });
});