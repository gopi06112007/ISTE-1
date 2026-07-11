/**
 * Builds an optimized Cloudinary URL by injecting transformation parameters.
 * Falls back to the original URL if it's not a Cloudinary URL.
 *
 * @param {string} url - The original image URL
 * @param {'profile'|'event'|'gallery'|'blog'} type - The image context
 * @returns {string} The transformed URL
 */
export const buildCloudinaryUrl = (url, type = 'gallery') => {
  if (!url) return '';

  // Only transform Cloudinary URLs
  if (!url.includes('res.cloudinary.com')) return url;

  const transformations = {
    profile: 'c_fill,g_face,w_400,h_400,q_auto,f_auto',
    event: 'c_fill,w_800,h_450,q_auto,f_auto',
    gallery: 'c_fill,w_400,h_300,q_auto,f_auto',
    blog: 'c_fill,w_1200,h_630,q_auto,f_auto',
  };

  const transform = transformations[type] || transformations.gallery;

  // Insert transformation after /upload/
  // e.g. https://res.cloudinary.com/demo/image/upload/sample.jpg
  //   -> https://res.cloudinary.com/demo/image/upload/c_fill,g_face,.../sample.jpg
  return url.replace('/upload/', `/upload/${transform}/`);
};
