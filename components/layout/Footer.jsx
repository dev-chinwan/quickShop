import Link from 'next/link';
import { Zap, Twitter, Instagram, Facebook, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-ui font-bold text-xl text-white">
                Quick<span className="text-green-400">Shop</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Fresh groceries delivered to your door in 10 minutes. Quality produce, everyday essentials.
            </p>
            <div className="flex gap-3">
              {[Twitter, Instagram, Facebook, Youtube].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-green-500/20 hover:text-green-400 flex items-center justify-center transition-all"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: 'Categories',
              links: ['Vegetables', 'Fruits', 'Dairy', 'Snacks', 'Beverages', 'Bakery'],
            },
            {
              title: 'Company',
              links: ['About Us', 'Careers', 'Blog', 'Press', 'Partners'],
            },
            {
              title: 'Support',
              links: ['Help Center', 'Track Order', 'Return Policy', 'Contact Us', 'Privacy Policy'],
            },
          ].map((col) => (
            <div key={col.title}>
              <h3 className="text-white font-semibold font-ui mb-4 text-sm uppercase tracking-wider">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      href={`/category?category=${link.toLowerCase()}`}
                      className="text-sm hover:text-green-400 transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">© 2025 QuickShop Inc. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 bg-gray-800 px-3 py-1.5 rounded-full">🚀 10-min delivery</span>
            <span className="text-xs text-gray-600 bg-gray-800 px-3 py-1.5 rounded-full">🌱 100% Fresh</span>
            <span className="text-xs text-gray-600 bg-gray-800 px-3 py-1.5 rounded-full">💚 Eco-friendly</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
