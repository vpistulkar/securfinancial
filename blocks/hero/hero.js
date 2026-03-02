import { getMetadata } from '../../scripts/aem.js';
import { isAuthorEnvironment, moveInstrumentation } from '../../scripts/scripts.js';
import { readBlockConfig } from '../../scripts/aem.js';

/**
 *
 * @param {Element} block
 */
export default function decorate(block) {
  const config = readBlockConfig(block) || {};

  const enableUnderline = (config.enableunderline ?? block.querySelector(':scope div:nth-child(3) > div')?.textContent?.trim() ?? 'true').toString();
  const layoutStyle = config.herolayout ?? block.querySelector(':scope div:nth-child(4) > div')?.textContent?.trim() ?? 'overlay';
  const ctaStyle = config.ctastyle ?? block.querySelector(':scope div:nth-child(5) > div')?.textContent?.trim() ?? 'default';
  const backgroundStyle = config.backgroundstyle ?? block.querySelector(':scope div:nth-child(6) > div')?.textContent?.trim() ?? 'default';

  if (layoutStyle) {
    block.classList.add(`${layoutStyle}`);
  }

  if (backgroundStyle) {
    block.classList.add(`${backgroundStyle}`);
  }

  if (enableUnderline.toLowerCase() === 'false') {
    block.classList.add('removeunderline');
  }

  const buttonContainer = block.querySelector('p.button-container');
  if (buttonContainer) {
    buttonContainer.classList.add(`cta-${ctaStyle || 'default'}`);
  }

  const ctaStyleParagraph = block.querySelector('p[data-aue-prop="ctastyle"]');
  if (ctaStyleParagraph) {
    ctaStyleParagraph.style.display = 'none';
  }

  const underlineDiv = block.querySelector(':scope > div:nth-child(3)');
  if (underlineDiv) underlineDiv.style.display = 'none';
  const layoutStyleDiv = block.querySelector(':scope > div:nth-child(4)');
  if (layoutStyleDiv) layoutStyleDiv.style.display = 'none';
  const ctaStyleDiv = block.querySelector(':scope > div:nth-child(5)');
  if (ctaStyleDiv) ctaStyleDiv.style.display = 'none';
  const backgroundStyleDiv = block.querySelector(':scope > div:nth-child(6)');
  if (backgroundStyleDiv) backgroundStyleDiv.style.display = 'none';

  /* Hide remaining config rows (alignment, verticalalignment, isfullwidth, height, color, link, button actions) on live */
  [...block.children].forEach((row, index) => {
    if (index >= 7) row.style.display = 'none';
  });

  /* Banner-like: alignment, vertical alignment, full width – from config or UE (data-aue-prop) */
  const ue = (name) => block.querySelector(`[data-aue-prop="${name}"]`)?.textContent?.trim();
  const alignment = (config.alignment ?? ue('alignment') ?? 'center').toString().toLowerCase();
  const verticalAlignment = (config.verticalalignment ?? config['vertical-alignment'] ?? ue('verticalalignment') ?? 'middle').toString().toLowerCase();
  block.classList.add(`hero--alignment-${alignment}`);
  block.classList.add(`hero--verticalalignment-${verticalAlignment}`);
  const isFullWidth = config.isfullwidth === 'true' || config.isfullwidth === true || config['full-width'] === 'true'
    || (ue('isfullwidth') ?? '').toLowerCase() === 'true';
  if (isFullWidth) {
    block.classList.add('hero--fullwidth');
  }

  let heightVal = (config.height ?? ue('height'))?.toString?.()?.trim();
  if (heightVal) {
    if (/^\d+$/.test(heightVal)) heightVal = `${heightVal}px`;
    block.style.height = heightVal;
  }
  const textWrapper = block.querySelector(':scope > div:nth-child(2)') || block;
  const textColor = (config.color ?? config['text-color'] ?? ue('color') ?? ue('textColor'))?.toString?.()?.trim();
  if (textColor) {
    block.classList.add('hero--custom-text-color');
    block.style.setProperty('--hero-text-color', textColor);
  }

  if (config.link && String(config.link).trim()) {
    block.dataset.sectionLink = String(config.link).trim();
  }

  const ctaLink = block.querySelector('p.button-container a, .button-container a');
  if (ctaLink) {
    const eventType = config.buttoneventtype ?? config['button-event-type'];
    if (eventType && String(eventType).trim()) ctaLink.dataset.buttonEventType = String(eventType).trim();
    const webhookUrl = config.buttonwebhookurl ?? config['button-webhook-url'];
    if (webhookUrl && String(webhookUrl).trim()) ctaLink.dataset.buttonWebhookUrl = String(webhookUrl).trim();
    const formId = config.buttonformid ?? config['button-form-id'];
    if (formId && String(formId).trim()) ctaLink.dataset.buttonFormId = String(formId).trim();
    const buttonData = config.buttondata ?? config['button-data'];
    if (buttonData && String(buttonData).trim()) ctaLink.dataset.buttonData = String(buttonData).trim();
  }
}
