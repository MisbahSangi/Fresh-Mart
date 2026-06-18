import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🛒</span>
              <span className="text-white text-xl font-bold">
                Fresh<span className="text-yellow-300">Mart</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Your trusted local grocery store in Sahiwal.
              Fresh products delivered to your doorstep daily.
            </p>
            {/* Store Hours */}
            <div className="bg-gray-800 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <FiClock className="text-primary" size={14} />
                <span className="text-xs font-semibold text-white">
                  Store Hours
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Monday – Sunday
              </p>
              <p className="text-xs text-primary font-medium">
                8:00 AM – 11:00 PM
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-primary transition flex items-center gap-2">
                  🏠 Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-primary transition flex items-center gap-2">
                  📦 Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-primary transition flex items-center gap-2">
                  🛒 Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-primary transition flex items-center gap-2">
                  📋 My Orders
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-primary transition flex items-center gap-2">
                  👤 My Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <FiPhone className="text-primary flex-shrink-0" />
                <a href="tel:03346461739" className="hover:text-primary transition">
                  0334-6461739
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FiMail className="text-primary flex-shrink-0" />
                <a href="mailto:freshmart@gmail.com" className="hover:text-primary transition">
                  freshmart@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <FiMapPin className="text-primary flex-shrink-0 mt-0.5" />
                <span>Main Bazar, Sahiwal,<br />Punjab, Pakistan</span>
              </li>
            </ul>

            {/* Payment Badges */}
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">We Accept:</p>
              <div className="flex flex-wrap gap-2">
                {['VISA', 'MC', 'COD', 'EP', 'JC'].map(p => (
                  <span key={p} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded font-mono font-bold border border-gray-700">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Google Map */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <FiMapPin className="text-primary" /> Find Us
            </h3>
            <div className="rounded-xl overflow-hidden border border-gray-700 shadow-lg">
              <iframe
                title="FreshMart Location"
                src="https://maps.google.com/maps?q=Sahiwal+Punjab+Pakistan&t=&z=13&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="180"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            
            {/* Added the missing `<a` tag here and properly escaped the arrow */}
            <a
              href="https://maps.google.com/?q=Sahiwal+Punjab+Pakistan"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary hover:underline mt-2 flex items-center gap-1"
            >
              <FiMapPin size={11} /> Open in Google Maps &rarr;
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © 2026 FreshMart Sahiwal. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              Payments secured by
            </span>
            <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded font-bold">
              🔒 Stripe
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;