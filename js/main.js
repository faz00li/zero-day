// Entry point, initializes everything
import { initStatus } from './components/status.js';
import { initEditableFields } from './components/editableField.js';
import { initModal } from './components/modal.js';
import { initMetaSection } from './sections/meta.js';
import { initCriteriaSection } from './sections/criteria.js';
import { initAssessmentSection } from './sections/assessment.js';

document.addEventListener('DOMContentLoaded', () => {
    initStatus();
    initEditableFields();
    initModal();
    initMetaSection();
    initCriteriaSection();
    initAssessmentSection();
});
