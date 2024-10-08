import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <div className="container mx-auto max-w-5xl p-4">{children}</div>
      </body>
    </html>
  );
}
