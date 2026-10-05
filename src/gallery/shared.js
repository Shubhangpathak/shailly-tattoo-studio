export const TAGS = { minimal: 'Minimal', portraits: 'Portraits', traditional: 'Traditional', colour: 'Colour' };

export function element(tag, attributes = {}, text) {
  const node = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
  if (text !== undefined) node.textContent = text;
  return node;
}

export function validateItems(items) {
  if (!Array.isArray(items)) throw new Error('The gallery returned an invalid collection.');
  return items.map(item => {
    if (!item || typeof item.id !== 'string' || typeof item.title !== 'string' || typeof item.alt !== 'string' ||
        !Array.isArray(item.tags) || item.tags.some(tag => !Object.hasOwn(TAGS, tag)) ||
        ![item.src, item.thumbnail].every(url => typeof url === 'string' && /^\/(?:images|uploads\/gallery\/managed)\/[a-zA-Z0-9_.-]+\.(?:webp|png|jpe?g)$/.test(url)) ||
        !Number.isFinite(item.width) || !Number.isFinite(item.height) || item.width <= 0 || item.height <= 0) {
      throw new Error('The gallery returned invalid photo information.');
    }
    return item;
  });
}
