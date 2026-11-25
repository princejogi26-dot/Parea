import {ShoppingBag} from 'lucide-react';

export type NavSection = 'restaurants' | 'shops' | 'orders' | 'support' | 'profile';

interface HeaderProps {
  activeNav: NavSection;
  onSelectNav: (nav: NavSection) => void;
  onGoHome: () => void;
  cartCount: number;
  cartSubtotalEur: number;
  onOpenCart: () => void;
}

export function Header({
  activeNav,
  onSelectNav,
  onGoHome,
  cartCount,
  cartSubtotalEur,
  onOpenCart,
}: HeaderProps) {
  const navItems: {id: NavSection; label: string}[] = [
    {id: 'restaurants', label: 'Restaurants'},
    {id: 'shops', label: 'Shops'},
    {id: 'orders', label: 'Orders'},
    {id: 'support', label: 'Support'},
    {id: 'profile', label: 'Profile'},
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#092332]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={onGoHome}
          className="font-display text-2xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer"
        >
          parea
        </button>

        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-7">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectNav(item.id)}
                className={`text-sm font-medium tracking-[0.01em] whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? 'text-white border-[#FF5E1A]'
                    : 'text-slate-300 border-transparent hover:text-white hover:border-white/30'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#FF5E1A] hover:bg-[#E54B0B] text-white text-sm font-semibold shadow-sm transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer tabular-nums"
          >
            <ShoppingBag className="w-4 h-4" strokeWidth={2} />
            <span>
              {cartCount > 0
                ? `Basket (${cartCount}) · €${cartSubtotalEur.toFixed(2)}`
                : 'Basket'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
