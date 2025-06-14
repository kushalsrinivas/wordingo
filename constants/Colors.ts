/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Minimalistic Black & White Color Scheme with Glassmorphism
 * Pure black and white theme with subtle transparent variations for glassmorphism effects
 */

export const Colors = {
  light: {
    text: '#000000',
    background: '#FFFFFF',
    tint: '#000000',
    icon: '#000000',
    tabIconDefault: '#000000',
    tabIconSelected: '#000000',
    // Glassmorphism colors
    glassBackground: 'rgba(255, 255, 255, 0.1)',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
    glassShadow: 'rgba(0, 0, 0, 0.05)',
    // Subtle variations
    textSecondary: 'rgba(0, 0, 0, 0.7)',
    textTertiary: 'rgba(0, 0, 0, 0.5)',
    border: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.02)',
    highlight: '#FFEB3B',
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    tint: '#FFFFFF',
    icon: '#FFFFFF',
    tabIconDefault: '#FFFFFF',
    tabIconSelected: '#FFFFFF',
    // Glassmorphism colors for dark mode
    glassBackground: 'rgba(0, 0, 0, 0.1)',
    glassBorder: 'rgba(0, 0, 0, 0.2)',
    glassShadow: 'rgba(255, 255, 255, 0.05)',
    // Subtle variations
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textTertiary: 'rgba(255, 255, 255, 0.5)',
    border: 'rgba(255, 255, 255, 0.1)',
    overlay: 'rgba(255, 255, 255, 0.02)',
    highlight: '#FFEB3B',
  },
};
