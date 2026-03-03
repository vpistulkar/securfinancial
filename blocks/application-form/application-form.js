/**
 * Application Form block – credit card (or similar) application.
 * Built like sign-in/join-us: adaptive form definition rendered by the form module,
 * with wizard layout (Back / Next) so the form is created step-by-step per site style.
 * Steps: Personal Information → Address → Employment & Income → Disclosures → Submit.
 */

import { readBlockConfig, loadCSS } from '../../scripts/aem.js';

function applyButtonConfigToSubmitButton(block, config) {
  const submitButton = block.querySelector("form button[type='submit']");
  if (!submitButton) return;
  const eventType = config.buttoneventtype ?? config['button-event-type'];
  if (eventType && String(eventType).trim()) submitButton.dataset.buttonEventType = String(eventType).trim();
  const webhookUrl = config.buttonwebhookurl ?? config['button-webhook-url'];
  if (webhookUrl && String(webhookUrl).trim()) submitButton.dataset.buttonWebhookUrl = String(webhookUrl).trim();
  const formId = config.buttonformid ?? config['button-form-id'];
  if (formId && String(formId).trim()) submitButton.dataset.buttonFormId = String(formId).trim();
  const buttonData = config.buttondata ?? config['button-data'];
  if (buttonData && String(buttonData).trim()) submitButton.dataset.buttonData = String(buttonData).trim();
}

function buildApplicationFormDef() {
  return {
    id: 'application-form',
    fieldType: 'form',
    appliedCssClassNames: 'application-form-form application-form-wizard',
    items: [
      {
        id: 'heading-application-form',
        fieldType: 'heading',
        label: { value: 'Credit Card Application' },
        appliedCssClassNames: 'col-12 application-form-heading',
      },
      {
        id: 'description-application-form',
        fieldType: 'plain-text',
        value: 'Complete the form below to apply.',
        appliedCssClassNames: 'col-12 application-form-subtitle',
      },
      {
        id: 'panel-wizard',
        name: 'wizard',
        fieldType: 'panel',
        ':type': 'fd/panel/wizard',
        items: [
          {
            id: 'step-personal',
            name: 'personal',
            fieldType: 'panel',
            label: { value: 'Personal Information' },
            items: [
              { id: 'firstName', name: 'firstName', fieldType: 'text-input', label: { value: 'First Name' }, properties: { colspan: 12 } },
              { id: 'middleName', name: 'middleName', fieldType: 'text-input', label: { value: 'Middle Name' }, properties: { colspan: 12 } },
              { id: 'lastName', name: 'lastName', fieldType: 'text-input', label: { value: 'Last Name' }, properties: { colspan: 12 } },
              { id: 'dateOfBirth', name: 'dateOfBirth', fieldType: 'text-input', label: { value: 'Date of Birth' }, placeholder: 'MM/DD/YYYY', properties: { colspan: 12 } },
              { id: 'email', name: 'email', fieldType: 'email', label: { value: 'Email' }, properties: { colspan: 12 } },
              { id: 'phone', name: 'phone', fieldType: 'text-input', label: { value: 'Phone Number' }, properties: { colspan: 12 } },
            ],
          },
          {
            id: 'step-address',
            name: 'address',
            fieldType: 'panel',
            label: { value: 'Address' },
            items: [
              { id: 'streetAddress', name: 'streetAddress', fieldType: 'text-input', label: { value: 'Street Address' }, properties: { colspan: 12 } },
              { id: 'addressLine2', name: 'addressLine2', fieldType: 'text-input', label: { value: 'Apt / Suite' }, properties: { colspan: 12 } },
              { id: 'city', name: 'city', fieldType: 'text-input', label: { value: 'City' }, properties: { colspan: 12 } },
              { id: 'state', name: 'state', fieldType: 'text-input', label: { value: 'State / Province' }, properties: { colspan: 12 } },
              { id: 'zipCode', name: 'zipCode', fieldType: 'text-input', label: { value: 'ZIP / Postal Code' }, properties: { colspan: 12 } },
              {
                id: 'country',
                name: 'country',
                fieldType: 'drop-down',
                label: { value: 'Country' },
                enum: ['', 'US', 'CA', 'MX', 'GB', 'OTHER'],
                enumNames: ['Select', 'United States', 'Canada', 'Mexico', 'United Kingdom', 'Other'],
                properties: { colspan: 12 },
              },
            ],
          },
          {
            id: 'step-employment',
            name: 'employment',
            fieldType: 'panel',
            label: { value: 'Employment & Income' },
            items: [
              {
                id: 'employmentStatus',
                name: 'employmentStatus',
                fieldType: 'drop-down',
                label: { value: 'Employment Status' },
                enum: ['', 'employed', 'self-employed', 'retired', 'student', 'other'],
                enumNames: ['Select', 'Employed', 'Self-Employed', 'Retired', 'Student', 'Other'],
                properties: { colspan: 12 },
              },
              { id: 'employerName', name: 'employerName', fieldType: 'text-input', label: { value: 'Employer Name' }, properties: { colspan: 12 } },
              { id: 'jobTitle', name: 'jobTitle', fieldType: 'text-input', label: { value: 'Job Title / Occupation' }, properties: { colspan: 12 } },
              { id: 'annualIncome', name: 'annualIncome', fieldType: 'text-input', label: { value: 'Annual Income' }, placeholder: 'e.g. 75000', properties: { colspan: 12 } },
              { id: 'otherIncome', name: 'otherIncome', fieldType: 'text-input', label: { value: 'Other Monthly Income' }, placeholder: 'e.g. 500', properties: { colspan: 12 } },
            ],
          },
          {
            id: 'step-disclosures',
            name: 'disclosures',
            fieldType: 'panel',
            label: { value: 'Disclosures' },
            items: [
              {
                id: 'agreeTerms',
                name: 'agreeTerms',
                fieldType: 'checkbox',
                label: { value: 'I have read and agree to the Terms and Conditions and Privacy Policy' },
                enum: ['true'],
                properties: { colspan: 12 },
              },
              {
                id: 'agreeCreditCheck',
                name: 'agreeCreditCheck',
                fieldType: 'checkbox',
                label: { value: 'I authorize a credit check and verification of the information I have provided' },
                enum: ['true'],
                properties: { colspan: 12 },
              },
            ],
          },
          {
            id: 'step-submit',
            name: 'submit',
            fieldType: 'panel',
            label: { value: 'Submit' },
            items: [
              {
                id: 'submit-application-btn',
                name: 'submitApplication',
                fieldType: 'button',
                buttonType: 'submit',
                label: { value: 'Submit Application' },
                appliedCssClassNames: 'application-form-submit-btn col-12',
              },
            ],
          },
        ],
      },
    ],
  };
}

function collectApplicationFormData(form) {
  const data = {};
  form.querySelectorAll('input, select, textarea').forEach((el) => {
    const name = el.getAttribute('name');
    if (!name) return;
    if (el.type === 'checkbox') {
      data[name] = el.checked;
    } else {
      data[name] = el.value || '';
    }
  });
  return data;
}

function restrictNumericFields(form) {
  const numericNames = ['phone', 'annualIncome', 'otherIncome'];
  numericNames.forEach((name) => {
    const el = form.querySelector(`[name="${name}"]`);
    if (!el) return;
    el.addEventListener('input', () => {
      const digits = el.value.replace(/\D/g, '');
      if (el.value !== digits) el.value = digits;
    });
  });
}

function formatDateOfBirthInput(form) {
  const el = form.querySelector('[name="dateOfBirth"]');
  if (!el) return;
  el.addEventListener('input', () => {
    const digits = el.value.replace(/\D/g, '').slice(0, 8);
    let formatted = '';
    if (digits.length > 0) formatted = digits.slice(0, 2);
    if (digits.length > 2) formatted += `/${digits.slice(2, 4)}`;
    if (digits.length > 4) formatted += `/${digits.slice(4, 8)}`;
    if (el.value !== formatted) el.value = formatted;
  });
}

function attachApplicationFormSubmitHandler(block) {
  const form = block.querySelector('form');
  if (!form) return;

  const submitSection = form.querySelector('#step-submit')?.closest('fieldset') || form.querySelector('.panel-wrapper:last-of-type');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const data = collectApplicationFormData(form);
    // eslint-disable-next-line no-console
    console.log('Application form data:', data);

    const msg = block.querySelector('.application-form-success-msg');
    if (msg) msg.remove();
    const success = document.createElement('p');
    success.className = 'application-form-success-msg';
    success.textContent = 'Thank you. Your application has been submitted successfully.';
    success.setAttribute('role', 'status');
    if (submitSection) {
      submitSection.insertBefore(success, submitSection.firstChild);
    } else {
      form.insertBefore(success, form.firstChild);
    }
  });
}

export default async function decorate(block) {
  const config = readBlockConfig(block) || {};
  [...block.children].forEach((row) => { row.style.display = 'none'; });

  block.classList.add('application-form-block');

  const codeBasePath = window.hlx?.codeBasePath || '';
  await loadCSS(`${codeBasePath}/blocks/form/form.css`);

  const formDef = buildApplicationFormDef();
  const formContainer = document.createElement('div');
  formContainer.className = 'application-form-wrapper form';

  const pre = document.createElement('pre');
  const code = document.createElement('code');
  code.textContent = JSON.stringify(formDef);
  pre.append(code);
  formContainer.append(pre);
  block.append(formContainer);

  const formModule = await import('../form/form.js');
  await formModule.default(formContainer);

  setTimeout(() => {
    applyButtonConfigToSubmitButton(block, config);
    attachApplicationFormSubmitHandler(block);
    const form = block.querySelector('form');
    if (form) {
      restrictNumericFields(form);
      formatDateOfBirthInput(form);
    }
  }, 100);
}
