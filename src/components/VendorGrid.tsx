import {ArrowRight, Heart, Search, SlidersHorizontal, Star} from 'lucide-react';
import {VENDOR_CATEGORIES} from '../data/cyprusCatalog';
import {
  CyprusArea,
  SortOption,
  Vendor,
  VendorCategory,
  VendorVertical,
} from '../types/delivery';
import {ResilientImage} from './ResilientImage';

interface VendorGridProps {
  vendors: Vendor[];
  selectedArea: CyprusArea;
  vertical: VendorVertical;
  onSelectVertical: (v: VendorVertical) => void;
  selectedCategory: VendorCategory;
  onSelectCategory: (cat: VendorCategory) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  freeDeliveryOnly: boolean;
  onToggleFreeDelivery: () => void;
  offersOnly: boolean;
  onToggleOffersOnly: () => void;
  favoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  favoriteIds: string[];
  onToggleFavorite: (vendorId: string) => void;
  searchQuery: string;
  onClearFilters: () => void;
  onSelectVendor: (vendor: Vendor) => void;
}

export function VendorGrid({
  vendors,
  selectedArea,
  vertical,
  onSelectVertical,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  freeDeliveryOnly,
  onToggleFreeDelivery,
  offersOnly,
  onToggleOffersOnly,
  favoritesOnly,
  onToggleFavoritesOnly,
  favoriteIds,
  onToggleFavorite,
  searchQuery,
  onClearFilters,
  onSelectVendor,
}: VendorGridProps) {
  return (
    <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center p-1 bg-slate-200/70 rounded-xl mb-3">
            {(
              [
                {id: 'all', label: 'All Places'},
                {id: 'restaurant', label: 'Restaurants'},
                {id: 'shop', label: 'Shops & Markets'},
              ] as {id: VendorVertical; label: string}[]
            ).map((tab) => {
              const active = vertical === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectVertical(tab.id)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#092332] text-white shadow-sm'
                      : 'text-slate-600 hover:text-[#092332]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#092332]">
            Delivering to {selectedArea.name}, {selectedArea.city}
          </h2>
          <p className="text-sm text-slate-600 mt-1 tabular-nums">
            {vendors.length} {vendors.length === 1 ? 'venue' : 'venues'} available right now
            {searchQuery.trim() ? ` matching "${searchQuery.trim()}"` : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleFreeDelivery}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              freeDeliveryOnly
                ? 'bg-[#092332] text-white border-[#092332]'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
            }`}
          >
            Free Delivery
          </button>

          <button
            type="button"
            onClick={onToggleOffersOnly}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              offersOnly
                ? 'bg-[#092332] text-white border-[#092332]'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
            }`}
          >
            Offers
          </button>

          <button
            type="button"
            onClick={onToggleFavoritesOnly}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              favoritesOnly
                ? 'bg-[#092332] text-white border-[#092332]'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-white' : ''}`} />
            Saved
          </button>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <label htmlFor="sort-vendors" className="sr-only">
              Sort venues
            </label>
            <select
              id="sort-vendors"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="text-xs font-medium text-[#092332] bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="fastest">Fastest Delivery</option>
              <option value="rating">Top Rated</option>
              <option value="lowest_fee">Lowest Delivery Fee</option>
            </select>
          </div>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Restaurant and shop categories"
        className="flex items-center gap-2 overflow-x-auto pb-3 mb-7 border-b border-slate-200"
      >
        {VENDOR_CATEGORIES.map((category) => {
          const active = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelectCategory(category)}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
                active
                  ? 'bg-[#FF5E1A] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:text-[#092332]'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {vendors.length === 0 ? (
        <div className="border border-slate-200 rounded-2xl bg-white p-12 text-center">
          <Search className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="font-display text-lg font-semibold text-[#092332] mb-1">
            No matching restaurants or shops
          </h3>
          <p className="text-sm text-slate-600 mb-5 max-w-md mx-auto">
            Try resetting your filters or switching to another Cyprus city like Nicosia, Limassol, Larnaca, Paphos, or Ayia Napa.
          </p>
          <button
            type="button"
            onClick={onClearFilters}
            className="px-4 py-2.5 rounded-lg bg-[#FF5E1A] hover:bg-[#E54B0B] text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => {
            const minEta = vendor.deliveryMinMinutes + selectedArea.etaBoostMinutes;
            const maxEta = vendor.deliveryMaxMinutes + selectedArea.etaBoostMinutes;
            const isFav = favoriteIds.includes(vendor.id);

            return (
              <div
                key={vendor.id}
                className="group bg-white border border-slate-200/90 rounded-2xl overflow-hidden transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(9,35,50,0.08)] flex flex-col relative"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(vendor.id);
                  }}
                  aria-label={isFav ? `Remove ${vendor.name} from favorites` : `Save ${vendor.name} to favorites`}
                  className="absolute top-3 right-3 z-10 w-9 h-9 rounded-xl bg-white/95 border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#FF5E1A] shadow-sm transition-colors cursor-pointer"
                >
                  <Heart
                    className={`w-4 h-4 ${isFav ? 'fill-[#FF5E1A] text-[#FF5E1A]' : ''}`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => onSelectVendor(vendor)}
                  className="text-left flex-1 flex flex-col cursor-pointer"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <ResilientImage
                      src={vendor.image}
                      alt={`${vendor.name} — ${vendor.category}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between gap-3 w-full">
                    <div>
                      <p className="text-xs font-medium text-[#0F766E] mb-1">
                        {vendor.vertical === 'shop' ? 'Shop' : 'Restaurant'}
                        <span aria-hidden="true"> · </span>
                        {vendor.category}
                        {vendor.isOpen24h ? ' · Open 24/7' : ''}
                      </p>

                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <h3 className="font-display text-lg font-semibold text-[#092332] group-hover:text-[#FF5E1A] transition-colors">
                          {vendor.name}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#092332] tabular-nums shrink-0">
                          <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                          {vendor.rating.toFixed(1)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 tabular-nums">
                        {minEta}–{maxEta} min
                        <span aria-hidden="true"> · </span>
                        {vendor.deliveryFeeEur === 0
                          ? 'Free delivery'
                          : `€${vendor.deliveryFeeEur.toFixed(2)} delivery`}
                        <span aria-hidden="true"> · </span>
                        Min. €{vendor.minOrderEur.toFixed(2)}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                      <span className="text-slate-600 truncate">
                        {vendor.offerText || vendor.neighborhoodTag}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-[#FF5E1A] shrink-0">
                        {vendor.vertical === 'shop' ? 'Browse shop' : 'View menu'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
