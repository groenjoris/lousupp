import '@/ds/styles.css';

export const metadata = {
  title: 'Lousupp — wireframe',
  description: 'A scroll-narrative landing page, drawn in pencil.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
