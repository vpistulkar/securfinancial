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
    if (index >= 6) row.style.display = 'none';
  });

  /* Value from nth row (same approach as lines 39–46): row = :scope > div:nth-child(n), value from first cell */
  const rowVal = (n) => {
    const row = block.querySelector(`:scope > div:nth-child(${n})`);
    if (!row?.children?.length) return undefined;
    const col = row.children[1] ?? row.children[0];
    if (col?.querySelector?.('a')) {
      const as = [...col.querySelectorAll('a')];
      return as.length === 1 ? as[0].href : as.map((a) => a.href);
    }
    return col?.textContent?.trim();
  };

  /* Banner-like: alignment, vertical alignment, full width – from config, row DOM, or UE (data-aue-prop) */
  const ue = (name) => block.querySelector(`[data-aue-prop="${name}"]`)?.textContent?.trim();
  const alignment = (config.alignment ?? rowVal(7) ?? ue('alignment') ?? 'center').toString().toLowerCase();
  const verticalAlignment = (config.verticalalignment ?? config['vertical-alignment'] ?? rowVal(8) ?? ue('verticalalignment') ?? 'middle').toString().toLowerCase();
  block.classList.add(`hero--alignment-${alignment}`);
  block.classList.add(`hero--verticalalignment-${verticalAlignment}`);
  const isFullWidth = config.isfullwidth === 'true' || config.isfullwidth === true || config['full-width'] === 'true'
    || (rowVal(9) ?? ue('isfullwidth') ?? '').toString().toLowerCase() === 'true';
  if (isFullWidth) {
    block.classList.add('hero--fullwidth');
  }

  let heightVal = (config.height ?? rowVal(10) ?? ue('height'))?.toString?.()?.trim();
  if (heightVal) {
    if (/^\d+$/.test(heightVal)) heightVal = `${heightVal}px`;
    block.style.height = heightVal;
  }

  const textColor = (config.color ?? config['text-color'] ?? rowVal(11) ?? ue('color') ?? ue('textColor'))?.toString?.()?.trim();
  if (textColor) {
    block.classList.add('hero--custom-text-color');
    block.style.setProperty('--hero-text-color', textColor);
  }

  const sectionLink = (config.link ?? rowVal(12)) && String(config.link ?? rowVal(12)).trim();
  if (sectionLink) {
    block.dataset.sectionLink = sectionLink;
  }

  const customStyles = (config.customStyles ?? config['custom-styles'] ?? rowVal(17)) && String(config.customStyles ?? config['custom-styles'] ?? rowVal(17)).trim();
  if (customStyles) {
    block.classList.add(customStyles);
  }

  const ctaLink = block.querySelector('p.button-container a, .button-container a');
  if (ctaLink) {
    const eventType = config.buttoneventtype ?? config['button-event-type'] ?? rowVal(13);
    if (eventType && String(eventType).trim()) ctaLink.dataset.buttonEventType = String(eventType).trim();
    const webhookUrl = config.buttonwebhookurl ?? config['button-webhook-url'] ?? rowVal(14);
    if (webhookUrl && String(webhookUrl).trim()) ctaLink.dataset.buttonWebhookUrl = String(webhookUrl).trim();
    const formId = config.buttonformid ?? config['button-form-id'] ?? rowVal(15);
    if (formId && String(formId).trim()) ctaLink.dataset.buttonFormId = String(formId).trim();
    const buttonData = config.buttondata ?? config['button-data'] ?? rowVal(16);
    if (buttonData && String(buttonData).trim()) ctaLink.dataset.buttonData = String(buttonData).trim();
  }
}
