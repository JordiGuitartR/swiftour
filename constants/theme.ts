/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';
const greenPrimary = 'rgb(185, 105, 70)'; /* 'rgb(255, 68, 16)' */
const greenPrimaryLight = 'rgb(255, 150, 120)';
const baseColor = '#1d1d1d';
const middleSection = '#0f0f0f';

export const GradientColors = {
  start: greenPrimary,
  end: greenPrimaryLight,
};

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: greenPrimary,
    icon: '#fff',
    tabIconDefault: 'rgb(241, 241, 241)',
    tabIconSelected: greenPrimary,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: greenPrimary,
    icon: '#fff',
    tabIconDefault: 'rgb(255, 255, 255)',
    tabIconSelected: greenPrimary,
    secondColor: 'rgb(185, 105, 70)',
  },
  middleSection: middleSection,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
