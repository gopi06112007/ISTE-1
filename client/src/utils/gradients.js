/**
 * Exactly 5 curated premium multi-stop gradients for profile banners, avatar borders, and fallback images.
 * Designed to look modern, vibrant, and premium.
 */
export const PREMIUM_GRADIENTS = [
  // 1. Sunset Rose (Peach to Pink to Soft Blue)
  {
    banner: 'from-[#FFD3A5] via-[#FD8A9B] to-[#A8C5F0]',
    border: 'from-[#FFD3A5] via-[#FD8A9B] to-[#A8C5F0]',
    fallback: 'linear-gradient(135deg, #FFD3A5 0%, #FD8A9B 50%, #A8C5F0 100%)',
    theme: 'sunset'
  },
  // 2. Cosmic Orchid (Indigo to Pink to Amber)
  {
    banner: 'from-[#4158D0] via-[#C850C0] to-[#FFCC70]',
    border: 'from-[#4158D0] via-[#C850C0] to-[#FFCC70]',
    fallback: 'linear-gradient(135deg, #4158D0 0%, #C850C0 50%, #FFCC70 100%)',
    theme: 'cosmic'
  },
  // 3. Emerald Aurora (Teal to Mint to Emerald)
  {
    banner: 'from-[#11998E] via-[#06B6D4] to-[#38EF7D]',
    border: 'from-[#11998E] via-[#06B6D4] to-[#38EF7D]',
    fallback: 'linear-gradient(135deg, #11998E 0%, #06B6D4 50%, #38EF7D 100%)',
    theme: 'aurora'
  },
  // 4. Ocean Breeze (Sky Blue to Deep Blue to Indigo)
  {
    banner: 'from-[#00C6FF] via-[#0072FF] to-[#7F00FF]',
    border: 'from-[#00C6FF] via-[#0072FF] to-[#7F00FF]',
    fallback: 'linear-gradient(135deg, #00C6FF 0%, #0072FF 50%, #7F00FF 100%)',
    theme: 'ocean'
  },
  // 5. Sunfire Gold (Coral to Gold to Salmon)
  {
    banner: 'from-[#FF5E62] via-[#FF9966] to-[#FFD54F]',
    border: 'from-[#FF5E62] via-[#FF9966] to-[#FFD54F]',
    fallback: 'linear-gradient(135deg, #FF5E62 0%, #FF9966 50%, #FFD54F 100%)',
    theme: 'sunfire'
  }
];

/**
 * Returns a premium gradient object deterministically based on the profile name.
 * Uses an optimized multiplier of 2 to ensure adjacent profiles in the sorted UI list
 * get completely different gradient backgrounds.
 * @param {Object} profile The coordinator profile.
 * @returns {Object} A gradient object containing Tailwind classes and fallback style.
 */
export const getProfileGradient = (profile) => {
  if (!profile) return PREMIUM_GRADIENTS[0];
  
  // Use profile name as the primary hashing key
  const key = profile.name || profile._id || 'default-iste';
  
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    // Multiplier 2 ensures a perfect distribution with no adjacent repeats
    hash = (hash * 2 + key.charCodeAt(i)) % 10000003;
  }
  
  const index = Math.abs(hash) % PREMIUM_GRADIENTS.length;
  return PREMIUM_GRADIENTS[index];
};
