/*
import { patternDecorate } from '../../scripts/blockTemplate.js';

export default async function decorate(block) {
  patternDecorate(block);
}
*/

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    
    // Read card style from the third div (index 2)
    const styleDiv = row.children[2];
    const styleParagraph = styleDiv?.querySelector('p');
    const cardStyle = styleParagraph?.textContent?.trim() || 'default';
    if (cardStyle && cardStyle !== 'default') {
      li.className = cardStyle;
    }

    // Read CTA style by attribute so it works regardless of column order (AEM authoring)
    const ctaStyleEl = row.querySelector('p[data-aue-prop="ctastyle"]') || row.querySelector('[data-aue-prop="ctastyle"]');
    const ctaStyle = ctaStyleEl?.textContent?.trim() || 'default';
    
    // Read image style by attribute so it works regardless of column order (AEM authoring)
    const imageStyleParagraph = row.querySelector('p[data-aue-prop="imagestyle"]') || row.querySelector('[data-aue-prop="imagestyle"]');
    const imageStyle = imageStyleParagraph?.textContent?.trim() || '';

    const getCell = (idx) => (row.children[idx]?.querySelector?.('p')?.textContent?.trim()
      || row.children[idx]?.textContent?.trim() || '').toString();
    const link = getCell(5);
    const selectable = getCell(6);
    const alignment = (getCell(7) || 'left').toLowerCase();
    const verticalAlignment = (getCell(8) || 'middle').toLowerCase();
    const buttonEventType = getCell(9);
    const buttonWebhookUrl = getCell(10);
    const buttonFormId = getCell(11);
    const buttonData = getCell(12);
    const customStyles = getCell(13);

    if (customStyles && String(customStyles).trim()) {
      li.classList.add(String(customStyles).trim());
    }

    li.classList.add(`cards-card--alignment-${alignment}`, `cards-card--verticalalignment-${verticalAlignment}`);
    if (selectable.toLowerCase() === 'true') li.classList.add('cards-card--selectable');
    if (link) li.dataset.sectionLink = link;

    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    
    // Process the li children to identify and style them correctly
    let imageContainerDiv = null;
    [...li.children].forEach((div, index) => {
      // First div (index 0) - Image
      if (index === 0) {
        div.className = 'cards-card-image';
        imageContainerDiv = div; // Store reference for later
      }
      // Second div (index 1) - Content with button
      else if (index === 1) {
        div.className = 'cards-card-body';
      }
      // Third div (index 2) - Card style configuration
      else if (index === 2) {
        div.className = 'cards-config';
        const p = div.querySelector('p');
        if (p) {
          p.style.display = 'none'; // Hide the configuration text
        }
      }
      // Fourth div (index 3) - CTA style configuration
      else if (index === 3) {
        div.className = 'cards-config';
        const p = div.querySelector('p');
        if (p) {
          p.style.display = 'none'; // Hide the configuration text
        }
      }
      // Fifth div (index 4) - Image style configuration
      else if (index === 4) {
        div.className = 'cards-config';
        const p = div.querySelector('p');
        if (p) p.style.display = 'none';
      }
      // Indices 5-12 - Card link, selectable, alignment, verticalalignment, button actions
      else if (index >= 5 && index <= 12) {
        div.className = 'cards-config';
        const p = div.querySelector('p');
        if (p) p.style.display = 'none';
      }
      // Any other divs
      else {
        div.className = 'cards-card-body';
      }
    });
    
    // First, remove compact-style from ALL elements to prevent it from being on wrong elements
    li.querySelectorAll('*').forEach(el => {
      if (el.classList.contains('compact-style')) {
        el.classList.remove('compact-style');
      }
    });
    
    // Apply image style ONLY to the image container (Cover = default, no class needed)
    const imageStyleClass = (imageStyle || '').trim().toLowerCase();
    if (imageContainerDiv && imageStyleClass && imageStyleClass !== 'default') {
      imageContainerDiv.classList.add(imageStyleClass);
    }
    
    // Apply CTA styles to button containers
    const buttonContainers = li.querySelectorAll('p.button-container');
    buttonContainers.forEach(buttonContainer => {
      // Remove any existing CTA classes and ensure compact-style is NOT on button containers
      buttonContainer.classList.remove('default', 'cta-button', 'cta-button-secondary', 'cta-button-dark', 'cta-default', 'compact-style');
      // Add the correct CTA class
      buttonContainer.classList.add(ctaStyle);
    });

    const ctaLink = li.querySelector('p.button-container a, .button-container a');
    if (ctaLink) {
      if (buttonEventType) ctaLink.dataset.buttonEventType = buttonEventType;
      if (buttonWebhookUrl) ctaLink.dataset.buttonWebhookUrl = buttonWebhookUrl;
      if (buttonFormId) ctaLink.dataset.buttonFormId = buttonFormId;
      if (buttonData) ctaLink.dataset.buttonData = buttonData;
    }

    // Final cleanup: ensure compact-style is ONLY on the image container
    if (imageStyle && imageStyle === 'compact-style') {
      li.querySelectorAll('*').forEach(el => {
        if (el !== imageContainerDiv && el.classList.contains('compact-style')) {
          el.classList.remove('compact-style');
        }
      });
      // Re-apply to image container if it was removed
      if (imageContainerDiv && !imageContainerDiv.classList.contains('compact-style')) {
        imageContainerDiv.classList.add('compact-style');
      }
    }
    
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  
  // Final cleanup after image optimization: ensure compact-style is only on image containers
  ul.querySelectorAll('li').forEach((li) => {
    const imageContainer = li.querySelector('.cards-card-image');
    const buttonContainers = li.querySelectorAll('p.button-container');
    
    // Remove compact-style from button containers
    buttonContainers.forEach(buttonContainer => {
      if (buttonContainer.classList.contains('compact-style')) {
        buttonContainer.classList.remove('compact-style');
      }
    });
    
    // Ensure compact-style is on image container if it should be
    // Check if there's an image style config div with compact-style
    const imageStyleConfig = Array.from(li.querySelectorAll('.cards-config')).find(div => {
      const p = div.querySelector('p[data-aue-prop="imagestyle"]');
      return p && p.textContent.trim() === 'compact-style';
    });
    
    if (imageStyleConfig && imageContainer) {
      imageContainer.classList.add('compact-style');
    }
  });
 
  block.textContent = '';
  block.append(ul);
}
