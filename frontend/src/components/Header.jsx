import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, User, LogOut, Package, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed w-full z-50 bg-cream/90 backdrop-blur-md border-b border-khaki/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <Link to="/" className="text-2xl font-serif tracking-widest text-darkBrown uppercase">
            ISHAANI
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <NavLink to="/" className={({ isActive }) => `text-sm uppercase tracking-wide transition-colors duration-300 ${isActive ? 'text-darkBrown font-semibold' : 'text-gray-500 hover:text-darkBrown'}`}>Home</NavLink>
            <NavLink to="/shop" className={({ isActive }) => `text-sm uppercase tracking-wide transition-colors duration-300 ${isActive ? 'text-darkBrown font-semibold' : 'text-gray-500 hover:text-darkBrown'}`}>Shop</NavLink>
            <NavLink to="/about" className={({ isActive }) => `text-sm uppercase tracking-wide transition-colors duration-300 ${isActive ? 'text-darkBrown font-semibold' : 'text-gray-500 hover:text-darkBrown'}`}>About</NavLink>
            {user && <NavLink to="/myorders" className={({ isActive }) => `text-sm uppercase tracking-wide transition-colors duration-300 ${isActive ? 'text-darkBrown font-semibold' : 'text-gray-500 hover:text-darkBrown'}`}>My Orders</NavLink>}
          </nav>

          {/* Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <button className="text-darkBrown hover:text-khaki transition">
              <Search className="w-5 h-5" />
            </button>

            {user ? (
              <div className="relative group">
                <button className="text-darkBrown hover:text-khaki transition">
                  <User className="w-5 h-5" />
                </button>
                <div className="absolute right-0 top-full pt-2 w-64 hidden group-hover:block transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                  <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-khaki/20 overflow-hidden ring-1 ring-black/5">
                    <div className="px-5 py-4 bg-khaki/10 border-b border-khaki/10">
                      <p className="text-xs font-semibold text-darkBrown/60 tracking-wider uppercase">Signed in as</p>
                      <p className="text-darkBrown font-serif text-lg truncate mt-0.5">{user.name}</p>
                    </div>

                    <div className="py-2">
                      <Link to="/myorders" className="flex items-center gap-3 px-5 py-3 text-sm text-gray-600 hover:text-darkBrown hover:bg-khaki/10 transition-colors">
                        <Package className="w-4 h-4" />
                        <span>My Orders</span>
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="flex items-center gap-3 px-5 py-3 text-sm text-gray-600 hover:text-darkBrown hover:bg-khaki/10 transition-colors">
                          <Settings className="w-4 h-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      <button className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-600 hover:text-darkBrown hover:bg-khaki/10 transition-colors text-left">
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      <div className="h-px bg-khaki/10 my-1 mx-5" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors text-left">
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="text-darkBrown hover:text-khaki transition text-sm font-medium">
                LOGIN
              </Link>
            )}

            <Link to="/cart" className="relative text-darkBrown hover:text-khaki transition">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-darkBrown text-cream text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-darkBrown" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100">
          <div className="px-4 pt-2 pb-6 space-y-4">
            <Link to="/" className="block text-darkBrown font-medium">Home</Link>
            <Link to="/shop" className="block text-darkBrown font-medium">Shop</Link>
            <Link to="/about" className="block text-darkBrown font-medium">About</Link>
            {user && <Link to="/myorders" className="block text-darkBrown font-medium">My Orders</Link>}
            {user?.role === 'admin' && <Link to="/admin" className="block text-darkBrown font-medium">Admin Dashboard</Link>}

            <div className="border-t pt-4 flex gap-4">
              {user ? (
                <button onClick={handleLogout} className="text-sm font-medium text-red-600">Sign Out</button>
              ) : (
                <Link to="/login" className="text-sm font-medium text-darkBrown">Login</Link>
              )}
              <Link to="/cart" className="flex items-center gap-2 text-sm font-medium text-darkBrown">
                Cart ({cartCount})
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
