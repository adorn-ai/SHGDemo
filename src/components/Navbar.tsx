import { Link, useLocation } from "react-router";
import { useState } from "react";
import { Button } from "./ui/button";
import shgLogo from "../assets/shg-logo.png";
import { TopBar } from "./TopBar";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isJoinActive = () =>
    ["/join", "/register", "/register-minor", "/register-corporate"].includes(location.pathname);

  return (
    <>
      <TopBar />

      {/* top-9 (36px) matches TopBar's height so the two bars stack flush with no gap
          or overlap as the page scrolls; z-40 keeps this below TopBar's z-50 */}
      <nav className="bg-[#FAF9F5] border-b border-gray-200 sticky top-9 z-40 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* No fixed h-* here on purpose - the row's height now follows the
              logo's natural size at each breakpoint (via py-*) instead of a
              hard-coded pixel height that could clip a taller logo. */}
          <div className="flex justify-between items-center py-2 md:py-3">
            <div className="flex items-center">
              <Link to="/" className="flex items-center shrink-0">
                <img
                  src={shgLogo}
                  alt="St Gabriel Catholic Church Thome Self Help Group"
                  className="h-14 sm:h-16 md:h-20 lg:h-24 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`font-bold uppercase tracking-wide border-b-2 pb-1 transition-colors ${
                  isActive("/")
                    ? "border-[#16210E] text-[#16210E]"
                    : "border-transparent text-gray-700 hover:text-[#237A17]"
                }`}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`font-bold uppercase tracking-wide border-b-2 pb-1 transition-colors ${
                  isActive("/about")
                    ? "border-[#16210E] text-[#16210E]"
                    : "border-transparent text-gray-700 hover:text-[#237A17]"
                }`}
              >
                About Us
              </Link>
              <Link
                to="/products"
                className={`font-bold uppercase tracking-wide border-b-2 pb-1 transition-colors ${
                  isActive("/products")
                    ? "border-[#16210E] text-[#16210E]"
                    : "border-transparent text-gray-700 hover:text-[#237A17]"
                }`}
              >
                Products
              </Link>
              <Link
                to="/join"
                className={`font-bold uppercase tracking-wide border-b-2 pb-1 transition-colors ${
                  isJoinActive()
                    ? "border-[#16210E] text-[#16210E]"
                    : "border-transparent text-gray-700 hover:text-[#237A17]"
                }`}
              >
                Register
              </Link>
              <Link
                to="/gallery"
                className={`font-bold uppercase tracking-wide border-b-2 pb-1 transition-colors ${
                  isActive("/gallery")
                    ? "border-[#16210E] text-[#16210E]"
                    : "border-transparent text-gray-700 hover:text-[#237A17]"
                }`}
              >
                Gallery
              </Link>
              <Link
                to="/contact"
                className={`font-bold uppercase tracking-wide border-b-2 pb-1 transition-colors ${
                  isActive("/contact")
                    ? "border-[#16210E] text-[#16210E]"
                    : "border-transparent text-gray-700 hover:text-[#237A17]"
                }`}
              >
                Contact
              </Link>

              <Link to="/apply-loan">
                <Button className="bg-[#16210E] hover:bg-[#237A17] rounded-none font-bold uppercase tracking-wide">
                  Apply for Loan
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 hover:text-[#16210E]"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 bg-[#FAF9F5]">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={`block px-3 py-2 border-l-2 font-bold uppercase tracking-wide transition-colors ${
                  isActive("/")
                    ? "border-[#16210E] bg-[#16210E]/5 text-[#16210E]"
                    : "border-transparent text-gray-700 hover:bg-[#F3F0E8]"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`block px-3 py-2 border-l-2 font-bold uppercase tracking-wide transition-colors ${
                  isActive("/about")
                    ? "border-[#16210E] bg-[#16210E]/5 text-[#16210E]"
                    : "border-transparent text-gray-700 hover:bg-[#F3F0E8]"
                }`}
                onClick={() => setIsOpen(false)}
              >
                About Us
              </Link>
              <Link
                to="/gallery"
                className={`block px-3 py-2 border-l-2 font-bold uppercase tracking-wide transition-colors ${
                  isActive("/gallery")
                    ? "border-[#16210E] bg-[#16210E]/5 text-[#16210E]"
                    : "border-transparent text-gray-700 hover:bg-[#F3F0E8]"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Gallery
              </Link>
              <Link
                to="/products"
                className={`block px-3 py-2 border-l-2 font-bold uppercase tracking-wide transition-colors ${
                  isActive("/products")
                    ? "border-[#16210E] bg-[#16210E]/5 text-[#16210E]"
                    : "border-transparent text-gray-700 hover:bg-[#F3F0E8]"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Products
              </Link>
              <Link
                to="/join"
                className={`block px-3 py-2 border-l-2 font-bold uppercase tracking-wide transition-colors ${
                  isJoinActive()
                    ? "border-[#16210E] bg-[#16210E]/5 text-[#16210E]"
                    : "border-transparent text-gray-700 hover:bg-[#F3F0E8]"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
              <Link
                to="/contact"
                className={`block px-3 py-2 border-l-2 font-bold uppercase tracking-wide transition-colors ${
                  isActive("/contact")
                    ? "border-[#16210E] bg-[#16210E]/5 text-[#16210E]"
                    : "border-transparent text-gray-700 hover:bg-[#F3F0E8]"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>

              <Link
                to="/apply-loan"
                className="block mt-2 px-3 py-2 bg-[#16210E] text-[#FAF9F5] text-center font-bold uppercase tracking-wide"
                onClick={() => setIsOpen(false)}
              >
                Apply for Loan
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}