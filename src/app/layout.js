import '@/ds/styles.css';

// Google Fonts are loaded here via a real <link> (React 19 hoists rel="stylesheet"
// to <head>). The CSS `@import` inside the design system's fonts.css is dropped by
// Turbopack, so this is the reliable way to actually fetch the families that the
// design tokens reference ('Oooh Baby', 'Caveat', 'Shantell Sans', 'IBM Plex …').
const GOOGLE_FONTS =
  'https://fonts.googleapis.com/css2?family=Oooh+Baby&family=Caveat:wght@400;500;600;700&family=Shantell+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap';

export const metadata = {
  title: 'Lousupp — wireframe',
  description: 'A scroll-narrative landing page, drawn in pencil.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={GOOGLE_FONTS} />
        {children}
      </body>
    </html>
  );
}
