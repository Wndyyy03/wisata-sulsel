import Link from "next/link";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="brand">
          <span className="brand-mark" />
          Wisata Sulsel
        </Link>
        <nav className="nav-links">
          <Link href="/">Destinasi</Link>
          <Link href="/rekomendasi">Rekomendasi Area</Link>
          <Link href="/asisten-ai">Asisten AI</Link>
        </nav>
      </div>
    </header>
  );
}
