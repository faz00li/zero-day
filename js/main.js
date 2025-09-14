// Entry point, initializes everything
import { initHeader } from './sections/0_header.js';
import { initStatus } from './sections/1_status.js';
// import { initEditableFields } from './components/editableField.js';
// import { initModal } from './components/modal.js';
// import { initMetaSection } from './sections/meta.js';
// import { initCriteriaSection } from './sections/criteria.js';
// import { initAssessmentSection } from './sections/assessment.js';

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initStatus();
    // initEditableFields();
    // initModal();
    // initMetaSection();
    // initCriteriaSection();
    // initAssessmentSection();
});
