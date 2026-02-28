import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-blue-950 text-blue-200 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col sm:flex-row items-start justify-between gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md">
              <span className="text-white font-extrabold text-sm leading-none">
                NV
              </span>
            </div>
            <span className="text-white font-extrabold text-base tracking-tight">
              NepalVoice
            </span>
          </div>
          <p className="text-sm text-blue-300 max-w-xs leading-relaxed">
            A civic petition platform for the 2026 Nepalese House of
            Representatives elections. Every voice counts.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-14">
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="hover:text-white transition-colors duration-150"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/petitions"
                  className="hover:text-white transition-colors duration-150"
                >
                  View Petitions
                </Link>
              </li>
              <li>
                <Link
                  href="/petition/new"
                  className="hover:text-white transition-colors duration-150"
                >
                  Start a Petition
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors duration-150"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
              Account
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/auth?mode=login"
                  className="hover:text-white transition-colors duration-150"
                >
                  Log In
                </Link>
              </li>
              <li>
                <Link
                  href="/auth?mode=signup"
                  className="hover:text-white transition-colors duration-150"
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-blue-500">
        © 2026 NepalVoice. Built for civic engagement.
      </div>
    </footer>
  );
}
