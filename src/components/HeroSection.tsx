import {Check, Copy, MapPin, Search, X} from 'lucide-react';
import {useState} from 'react';
import {CYPRUS_HERO_IMAGE} from '../data/cyprusCatalog';
import {CyprusArea, CyprusCity} from '../types/delivery';
import {ResilientImage} from './ResilientImage';

interface HeroSectionProps {
  areas: CyprusArea[];
  selectedArea: CyprusArea;
  onSelectArea: (areaId: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSubmitSearch: () => void;
  onQuickSwitchVertical: (vertical: 'restaurant' | 'shop') => void;
}

const CITIES: CyprusCity[] = ['Nicosia', 'Limassol', 'Larnaca', 'Paphos', 'Famagusta'];

export function HeroSection({
  areas,
  selectedArea,
  onSelectArea,
  searchQuery,
  onSearchChange,
  onSubmitSearch,
  onQuickSwitchVertical,
}: HeroSectionProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const quickAreas = areas.filter((a) =>
    ['nic-engomi', 'lim-marina', 'lar-finikoudes', 'paf-kato', 'fam-ayia-napa'].includes(a.id)
  );

  const handleCopyPromo = (code: string) => {
    try {
      navigator.clipboard?.writeText(code);
    } catch {
      // ignore clipboard errors
    }
    setCopiedCode(code);
    window.setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section className="bg-gradient-to-b from-[#092332] via-[#0D2E41] to-[#11394F] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 lg:pt-14 lg:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-xs font-medium tracking-[0.02em] text-amber-300/90 mb-3">
              Nicosia · Limassol · Larnaca · Paphos · Ayia Napa
            </p>
            <h1
              className="font-display font-bold tracking-tight text-white leading-[1.06] mb-4"
              style={{
                fontSize: 'clamp(2.25rem, 3.9vw, 3.5rem)',
                textWrap: 'balance',
              }}
            >
              Restaurants & local shops across Cyprus, delivered.
            </h1>
            <p className="text-base text-slate-200 leading-relaxed max-w-xl mb-7 tracking-[0.01em]">
              Charcoal souvlaki, iced freddo espresso, fresh supermarket groceries, 24/7 periptero essentials, pharmacy care, and flowers straight to your door.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmitSearch();
              }}
              className="bg-white border border-white/20 rounded-xl p-2 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              <div className="flex items-center gap-2 px-3 py-2 sm:w-56 border-b sm:border-b-0 sm:border-r border-slate-200 shrink-0">
                <MapPin className="w-4 h-4 text-[#FF5E1A] shrink-0" />
                <label htmlFor="cyprus-area-select" className="sr-only">
                  Cyprus delivery neighborhood
                </label>
                <select
                  id="cyprus-area-select"
                  value={selectedArea.id}
                  onChange={(e) => onSelectArea(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-[#092332] focus:outline-none cursor-pointer truncate"
                >
                  {CITIES.map((city) => (
                    <optgroup key={city} label={city}>
                      {areas
                        .filter((a) => a.city === city)
                        .map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.name}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="flex-1 flex items-center gap-2 px-3 py-2 min-w-0">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <label htmlFor="catalog-search-input" className="sr-only">
                  Search Cyprus restaurants, shops, or items
                </label>
                <input
                  id="catalog-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search souvlaki, halloumi, pharmacy, wine..."
                  className="w-full bg-transparent text-sm text-[#092332] placeholder:text-slate-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    aria-label="Clear search"
                    className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#FF5E1A] hover:bg-[#E54B0B] text-white text-sm font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Explore
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-300">
              <span>Quick areas:</span>
              {quickAreas.map((area) => {
                const active = area.id === selectedArea.id;
                return (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => onSelectArea(area.id)}
                    className={`font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'text-amber-300 underline underline-offset-4'
                        : 'text-slate-200 hover:text-white'
                    }`}
                  >
                    {area.name}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onQuickSwitchVertical('restaurant')}
                  className="font-semibold text-white hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Browse Restaurants →
                </button>
                <span className="text-white/25" aria-hidden="true">|</span>
                <button
                  type="button"
                  onClick={() => onQuickSwitchVertical('shop')}
                  className="font-semibold text-white hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Supermarkets & Shops →
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleCopyPromo('CYPRUS20')}
                className="inline-flex items-center gap-1.5 text-slate-200 hover:text-white cursor-pointer"
              >
                <span>
                  Promo <strong className="text-amber-300">CYPRUS20</strong> (20% off)
                </span>
                {copiedCode === 'CYPRUS20' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-300" />
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative h-64 sm:h-80 lg:h-full min-h-[330px] rounded-2xl overflow-hidden bg-[#103347] border border-white/15 shadow-xl">
              <ResilientImage
                src={CYPRUS_HERO_IMAGE}
                alt="Cyprus souvlaki, sheftalia, grilled halloumi, village salad, and iced freddo espresso overlooking the Mediterranean coast"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#092332]/95 via-[#092332]/55 to-transparent p-5 sm:p-6">
                <p className="text-xs font-medium text-amber-300 mb-1">
                  Delivering now to {selectedArea.name}, {selectedArea.city}
                </p>
                <p className="text-sm sm:text-base font-semibold text-white">
                  Hot tavernas in 20–35 min · 24/7 Periptero & Express Shops in 15 min
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            {metric: '5 Cities', label: 'Nicosia, Limassol, Larnaca, Paphos & Famagusta'},
            {metric: '15–30 min', label: 'Average island-wide courier arrival'},
            {metric: '24/7 Shops', label: 'Peripteros, bakeries, pharmacies & wine'},
            {metric: '4 Promo Codes', label: 'CYPRUS20, FREEDEL, HALLOUMI5, WELCOME15'},
          ].map((stat) => (
            <div key={stat.metric} className="bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3.5">
              <p className="font-display text-lg font-bold text-white tabular-nums">{stat.metric}</p>
              <p className="text-xs text-slate-300 mt-0.5 leading-snug">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
