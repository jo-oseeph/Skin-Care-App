/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#3B2C23"; // deep brown
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#3B2C23", // deep brown
    background: "#FDE6DF", // peach
    tint: tintColorLight,
    icon: "#3B2C23",
    tabIconDefault: "#3B2C23",
    tabIconSelected: tintColorLight,
    button: "#2B211B", // almost black
    accent: "#FFFFFF", // white
  },
  dark: {
    text: "#FDE6DF", // peach
    background: "#3B2C23", // deep brown
    tint: tintColorDark,
    icon: "#FDE6DF",
    tabIconDefault: "#FDE6DF",
    tabIconSelected: tintColorDark,
    button: "#FDE6DF",
    accent: "#3B2C23",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "Playfair Display",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "'Playfair Display', Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
