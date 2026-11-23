import localFont from "next/font/local";

const fredoka = localFont({
  src: "../styles/fonts/fredoka/fredoka.woff2",
  weight: "300 700",
  display: "swap",
  variable: "--font-fredoka",
  adjustFontFallback: false,
});

const sen = localFont({
  src: "../styles/fonts/sen/sen.woff2",
  weight: "400 800",
  display: "swap",
  preload: false,
  variable: "--font-sen",
  adjustFontFallback: false,
});

export const brandFontVariables = `${fredoka.variable} ${sen.variable}`;
