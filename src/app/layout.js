// src/app/layout.js
import "./globals.css";
export const metadata = {
  title: 'Chatterly',
  description: 'Your chat app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}