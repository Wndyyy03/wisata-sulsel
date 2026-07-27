import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Wisata Sulsel — Jelajah Sulawesi Selatan",
  description:
    "Temukan destinasi wisata Sulawesi Selatan lengkap dengan penginapan, resto/cafe terdekat, spot foto favorit, dan asisten AI perjalanan.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Work+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <footer className="site-footer">
          <div className="karst-divider" aria-hidden="true" />
          <p>Wisata Sulsel — dibangun untuk mengangkat pariwisata Sulawesi Selatan.</p>
        </footer>
      </body>
    </html>
  );
}
