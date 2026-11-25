import {CyprusCity} from '../types/delivery';
import {NavSection} from './Header';

interface FooterProps {
  onSelectCity: (city: CyprusCity) => void;
  onSelectNav: (nav: NavSection) => void;
}

const CYPRUS_CITIES: CyprusCity[] = ['Nicosia', 'Limassol', 'Larnaca', 'Paphos', 'Famagusta'];

export function Footer({onSelectCity, onSelectNav}: FooterProps) {
  return (
    <footer className="bg-[#092332] text-slate-300 mt-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <p className="font-display text-2xl font-bold text-white mb-2">parea</p>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
              Restaurants, bakeries, supermarkets, peripteros, pharmacies, and local Cyprus shops delivered to your door.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-white mb-3">Navigation</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectNav('restaurants')}
                  className="hover:text-white cursor-pointer"
                >
                  Cyprus Restaurants
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectNav('shops')}
                  className="hover:text-white cursor-pointer"
                >
                  Supermarkets & Shops
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectNav('orders')}
                  className="hover:text-white cursor-pointer"
                >
                  My Orders & Tracking
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectNav('support')}
                  className="hover:text-white cursor-pointer"
                >
                  24/7 Customer Support
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectNav('profile')}
                  className="hover:text-white cursor-pointer"
                >
                  My Profile & Promos
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-white mb-3">Cyprus Cities</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {CYPRUS_CITIES.map((city) => (
                <li key={city}>
                  <button
                    type="button"
                    onClick={() => onSelectCity(city)}
                    className="hover:text-white cursor-pointer"
                  >
                    {city === 'Famagusta' ? 'Ayia Napa & Famagusta' : city}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-white mb-3">Payment & Promos</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pay in EUR (€) via Cash on Delivery, Card on Delivery, Visa / Mastercard, Apple Pay, or Parea Wallet.
            </p>
            <p className="text-xs text-slate-400 mt-3">
              Codes: <strong className="text-amber-300">CYPRUS20</strong> ·{' '}
              <strong className="text-amber-300">FREEDEL</strong> ·{' '}
              <strong className="text-amber-300">HALLOUMI5</strong>
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Parea Cyprus Delivery. All prices in EUR (€) inclusive of VAT.</p>
          <p>Nicosia · Limassol · Larnaca · Paphos · Ayia Napa</p>
        </div>
      </div>
    </footer>
  );
}
