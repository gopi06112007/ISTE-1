/**
 * Curated list of premium multi-stop gradients for profile banners, avatar borders, and fallback images.
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
  // 2. Cosmic Violet (Deep Indigo to Purple to Warm Amber)
  {
    banner: 'from-[#4158D0] via-[#C850C0] to-[#FFCC70]',
    border: 'from-[#4158D0] via-[#C850C0] to-[#FFCC70]',
    fallback: 'linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)',
    theme: 'cosmic'
  },
  // 3. Electric Ocean (Cyan to Royal Blue to Deep Indigo)
  {
    banner: 'from-[#00C6FF] via-[#0072FF] to-[#7F00FF]',
    border: 'from-[#00C6FF] via-[#0072FF] to-[#7F00FF]',
    fallback: 'linear-gradient(135deg, #00C6FF 0%, #0072FF 50%, #7F00FF 100%)',
    theme: 'ocean'
  },
  // 4. Emerald Aurora (Teal to Mint to Emerald)
  {
    banner: 'from-[#11998E] via-[#06B6D4] to-[#38EF7D]',
    border: 'from-[#11998E] via-[#06B6D4] to-[#38EF7D]',
    fallback: 'linear-gradient(135deg, #11998E 0%, #06B6D4 50%, #38EF7D 100%)',
    theme: 'aurora'
  },
  // 5. Orchid Velvet (Deep Purple to Neon Magenta to Rose)
  {
    banner: 'from-[#7F00FF] via-[#E100FF] to-[#FF5E62]',
    border: 'from-[#7F00FF] via-[#E100FF] to-[#FF5E62]',
    fallback: 'linear-gradient(135deg, #7F00FF 0%, #E100FF 50%, #FF5E62 100%)',
    theme: 'orchid'
  },
  // 6. Sweet Tangerine (Gold to Orange to Deep Coral)
  {
    banner: 'from-[#F12711] via-[#F5AF19] to-[#FFD54F]',
    border: 'from-[#F12711] via-[#F5AF19] to-[#FFD54F]',
    fallback: 'linear-gradient(135deg, #F12711 0%, #F5AF19 60%, #FFD54F 100%)',
    theme: 'tangerine'
  },
  // 7. Cyber Neon (Cyan to Bright Blue to Electric Fuchsia)
  {
    banner: 'from-[#00F2FE] via-[#4FACFE] to-[#F355DA]',
    border: 'from-[#00F2FE] via-[#4FACFE] to-[#F355DA]',
    fallback: 'linear-gradient(135deg, #00F2FE 0%, #4FACFE 50%, #F355DA 100%)',
    theme: 'cyber'
  },
  // 8. Lavender Dream (Sweet Pink to Soft Orchid to Lavender Blue)
  {
    banner: 'from-[#FBC2EB] via-[#E6B9E8] to-[#A6C1EE]',
    border: 'from-[#FBC2EB] via-[#E6B9E8] to-[#A6C1EE]',
    fallback: 'linear-gradient(135deg, #FBC2EB 0%, #E6B9E8 50%, #A6C1EE 100%)',
    theme: 'lavender'
  },
  // 9. Imperial Ruby (Deep Violet to Crimson to Bright Gold)
  {
    banner: 'from-[#800080] via-[#ff007f] to-[#ffaa00]',
    border: 'from-[#800080] via-[#ff007f] to-[#ffaa00]',
    fallback: 'linear-gradient(135deg, #800080 0%, #ff007f 50%, #ffaa00 100%)',
    theme: 'ruby'
  },
  // 10. Midnight Mint (Slate to Deep Teal to Cool Cyan)
  {
    banner: 'from-[#0f2027] via-[#203a43] to-[#2c5364]',
    border: 'from-[#0f2027] via-[#203a43] to-[#2c5364]',
    fallback: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    theme: 'mint'
  }
];

/**
 * Returns a premium gradient object deterministically based on the profile data.
 * @param {Object} profile The coordinator profile.
 * @returns {Object} A gradient object containing Tailwind classes and fallback style.
 */
export const getProfileGradient = (profile) => {
  if (!profile) return PREMIUM_GRADIENTS[0];
  
  // Use _id or name as the hashing key
  const key = profile._id || profile.name || 'default-iste';
  
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % PREMIUM_GRADIENTS.length;
  return PREMIUM_GRADIENTS[index];
};
