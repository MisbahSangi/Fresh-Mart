/**
 * Optimizes a Cloudinary image URL for faster delivery:
 *  - f_auto  → serves WebP to modern browsers (25-35% smaller than JPG/PNG)
 *  - q_auto  → smart compression with no visible quality loss
 *  - w_{n}   → optional: resize to target display width (saves bandwidth)
 *
 * Non-Cloudinary URLs (external links, data: URIs) are returned unchanged.
 *
 * @param {string} url    - original image URL
 * @param {number} [width] - optional target display width in pixels
 * @returns {string}
 */
export const optimizeImageUrl = (url, width) => {
  if (!url || !url.includes('cloudinary.com')) return url;

  // Build transformation string
  let transforms = 'f_auto,q_auto';
  if (width) transforms += `,w_${width}`;

  // Insert transforms after /upload/ in the URL
  return url.replace('/upload/', `/upload/${transforms}/`);
};
