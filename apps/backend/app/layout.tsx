export const metadata = {
  title: 'RunLogger Backend API',
  description: 'Backend API for the RunLogger application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}