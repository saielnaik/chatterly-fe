// src/app/layout.js
import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
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