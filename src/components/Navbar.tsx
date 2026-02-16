import { Link, useLocation } from 'react-router';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-[#2D5016] rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">SG</span>
              </div>
              <span className="text-xl font-semibold text-[#2D5016]">St Gabriel SHG</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`${isActive('/') ? 'text-[#2D5016]' : 'text-gray-700'} hover:text-[#4A7C2C] transition-colors`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`${isActive('/about') ? 'text-[#2D5016]' : 'text-gray-700'} hover:text-[#4A7C2C] transition-colors`}
            >
              About Us
            </Link>
            <Link
              to="/gallery"
              className={`${isActive('/gallery') ? 'text-[#2D5016]' : 'text-gray-700'} hover:text-[#4A7C2C] transition-colors`}
            >
              Gallery
            </Link>
            <Link
              to="/register"
              className={`${isActive('/register') ? 'text-[#2D5016]' : 'text-gray-700'} hover:text-[#4A7C2C] transition-colors`}
            >
              Register
            </Link>
            <Link to="/apply-loan">
              <Button className="bg-[#2D5016] hover:bg-[#4A7C2C]">Apply for Loan</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-[#2D5016]"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md ${
                isActive('/') ? 'bg-gradient-to-r from-[#2D5016] to-[#4A7C2C] text-white shadow-md' : 'text-gray-700 hover:bg-gradient-to-r hover:from-[#6B9E4D]/20 hover:to-[#4A7C2C]/20'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`block px-3 py-2 rounded-md ${
                isActive('/about') ? 'bg-gradient-to-r from-[#2D5016] to-[#4A7C2C] text-white shadow-md' : 'text-gray-700 hover:bg-gradient-to-r hover:from-[#6B9E4D]/20 hover:to-[#4A7C2C]/20'
              }`}
              onClick={() => setIsOpen(false)}
            >
              About Us
            </Link>
            <Link
              to="/gallery"
              className={`block px-3 py-2 rounded-md ${
                isActive('/gallery') ? 'bg-gradient-to-r from-[#2D5016] to-[#4A7C2C] text-white shadow-md' : 'text-gray-700 hover:bg-gradient-to-r hover:from-[#6B9E4D]/20 hover:to-[#4A7C2C]/20'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Gallery
            </Link>
            <Link
              to="/register"
              className={`block px-3 py-2 rounded-md ${
                isActive('/register') ? 'bg-gradient-to-r from-[#2D5016] to-[#4A7C2C] text-white shadow-md' : 'text-gray-700 hover:bg-gradient-to-r hover:from-[#6B9E4D]/20 hover:to-[#4A7C2C]/20'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Register
            </Link>
            <Link
              to="/apply-loan"
              className="block px-3 py-2 rounded-md bg-gradient-to-r from-[#2D5016] to-[#4A7C2C] text-white hover:shadow-lg transition-all"
              onClick={() => setIsOpen(false)}
            >
              Apply for Loan
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}