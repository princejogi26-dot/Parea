import {ArrowLeft, Clock, Heart, Minus, Plus, Search, ShoppingBag, Star} from 'lucide-react';
import {useMemo, useState} from 'react';
import {CartItem, CyprusArea, MenuItem, Vendor} from '../types/delivery';
import {ResilientImage} from './ResilientImage';

interface RestaurantMenuViewProps {
  vendor: Vendor;
  selectedArea: CyprusArea;
  cartItems: CartItem[];
  cartVendorId: string | null;
  isFavorite: boolean;
  onToggleFavorite: (vendorId: string) => void;
  onBack: () => void;
  onQuickAdd: (vendor: Vendor, item: MenuItem) => void;
  onCustomizeItem: (vendor: Vendor, item: MenuItem) => void;
  onUpdateQuantity: (cartLineId: string, delta: number) => void;
  onOpenCart: () => void;
}

export function RestaurantMenuView({
  vendor,
  selectedArea,
  cartItems,
  cartVendorId,
  isFavorite,
  onToggleFavorite,
  onBack,
  onQuickAdd,
  onCustomizeItem,
  onUpdateQuantity,
  onOpenCart,
}: RestaurantMenuViewProps) {
  const [menuSearch, setMenuSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const unique = Array.from(new Set(vendor.items.map((m) => m.category)));
    return ['All', ...unique];
  }, [vendor.items]);

  const filteredItems = useMemo(() => {
    const q = menuSearch.trim().toLowerCase();
    return vendor.items.filter((item) => {
      const catMatch = activeCategory === 'All' || item.category === activeCategory;
      const queryMatch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return catMatch && queryMatch;
    });
  }, [vendor.items, activeCategory, menuSearch]);

  const groupedCategories = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    filteredItems.forEach((item) => {
      const list = map.get(item.category) || [];
      list.push(item);
      map.set(item.category, list);
    });
    return Array.from(map.entries());
  }, [filteredItems]);

  const minEta = vendor.deliveryMinMinutes + selectedArea.etaBoostMinutes;
  const maxEta = vendor.deliveryMaxMinutes + selectedArea.etaBoostMinutes;

  const isCurrentVendorCart = cartVendorId === vendor.id;
  const vendorSubtotal = isCurrentVendorCart
    ? cartItems.reduce(
        (sum, line) =>
          sum +
          (line.unitBasePriceEur +
            line.selectedOptions.reduce((s, o) => s + o.priceDelta, 0)) *
            line.quantity,
        0
      )
    : 0;
  const vendorItemCount = isCurrentVendorCart
    ? cartItems.reduce((sum, line) => sum + line.quantity, 0)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Cyprus venues
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-12 items-stretch">
              <div className="sm:col-span-5 aspect-[4/3] sm:aspect-auto sm:min-h-[210px] bg-stone-100">
                <ResilientImage
                  src={vendor.image}
                  alt={vendor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="sm:col-span-7 p-6 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <p className="text-xs font-medium text-zinc-500">
                      {vendor.category} · {vendor.neighborhoodTag}
                    </p>
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(vendor.id)}
                      aria-label={isFavorite ? 'Remove from saved' : 'Save venue'}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-[#FF5E1A] cursor-pointer"
                    >
                      <Heart
                        className={`w-4 h-4 ${isFavorite ? 'fill-[#FF5E1A] text-[#FF5E1A]' : ''}`}
                      />
                      {isFavorite ? 'Saved' : 'Save'}
                    </button>
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight mb-2">
                    {vendor.name}
                  </h1>
                  <p className="text-sm text-zinc-600 tabular-nums">
                    <span className="inline-flex items-center gap-1 font-semibold text-zinc-900">
                      <Star className="w-3.5 h-3.5 fill-[#FF5E1A] text-[#FF5E1A]" />
                      {vendor.rating.toFixed(1)}
                    </span>{' '}
                    ({vendor.reviewCount.toLocaleString()} ratings)
                    <span aria-hidden="true"> · </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      {minEta}–{maxEta} min to {selectedArea.name}
                    </span>
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600 tabular-nums">
                  <span>
                    Delivery:{' '}
                    <strong className="text-zinc-900 font-semibold">
                      {vendor.deliveryFeeEur === 0 ? 'Free' : `€${vendor.deliveryFeeEur.toFixed(2)}`}
                    </strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Min. order:{' '}
                    <strong className="text-zinc-900 font-semibold">€{vendor.minOrderEur.toFixed(2)}</strong>
                  </span>
                  {vendor.freeDeliveryOverEur && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#FF5E1A] font-medium">
                        Free delivery over €{vendor.freeDeliveryOverEur.toFixed(0)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => {
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      active
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="relative sm:w-64 shrink-0">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <label htmlFor="menu-search" className="sr-only">
                Search items
              </label>
              <input
                id="menu-search"
                type="text"
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder={vendor.vertical === 'shop' ? 'Search products...' : 'Search this menu...'}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#FF5E1A] focus:outline-none"
              />
            </div>
          </div>

          {groupedCategories.length === 0 ? (
            <div className="border border-zinc-200 rounded-xl p-10 text-center text-sm text-zinc-600">
              No items match "{menuSearch}".
            </div>
          ) : (
            <div className="space-y-8">
              {groupedCategories.map(([categoryName, items]) => (
                <section key={categoryName}>
                  <h2 className="font-display text-xl font-bold text-zinc-900 mb-4">
                    {categoryName}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item) => {
                      const hasOptions = Boolean(item.optionGroups && item.optionGroups.length > 0);
                      const simpleLine = !hasOptions
                        ? cartItems.find(
                            (l) =>
                              l.vendorId === vendor.id &&
                              l.itemId === item.id &&
                              l.selectedOptions.length === 0 &&
                              !l.specialInstructions
                          )
                        : undefined;

                      return (
                        <div
                          key={item.id}
                          className="bg-white border border-zinc-200 rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-zinc-300 transition-colors"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-3 mb-1.5">
                              <h3 className="font-semibold text-base text-zinc-900">{item.name}</h3>
                              <span className="font-semibold text-sm text-zinc-900 tabular-nums whitespace-nowrap shrink-0">
                                €{item.priceEur.toFixed(2)}
                              </span>
                            </div>

                            {(item.popular || item.dietaryNote || item.unitInfo) && (
                              <p className="text-xs text-zinc-500 mb-2 tabular-nums">
                                {[
                                  item.popular ? 'Popular' : null,
                                  item.dietaryNote || null,
                                  item.unitInfo || null,
                                ]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </p>
                            )}

                            <p className="text-sm text-zinc-600 leading-relaxed">
                              {item.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-end pt-2">
                            {simpleLine ? (
                              <div className="inline-flex items-center border border-[#FF5E1A] rounded-lg bg-[#FF5E1A]/5">
                                <button
                                  type="button"
                                  onClick={() => onUpdateQuantity(simpleLine.cartLineId, -1)}
                                  aria-label={`Remove one ${item.name}`}
                                  className="p-2 text-[#FF5E1A] hover:bg-[#FF5E1A]/10 cursor-pointer"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="px-3 text-sm font-semibold text-zinc-900 tabular-nums">
                                  {simpleLine.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onUpdateQuantity(simpleLine.cartLineId, 1)}
                                  aria-label={`Add one more ${item.name}`}
                                  className="p-2 text-[#FF5E1A] hover:bg-[#FF5E1A]/10 cursor-pointer"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            ) : hasOptions ? (
                              <button
                                type="button"
                                onClick={() => onCustomizeItem(vendor, item)}
                                className="px-4 py-2 rounded-lg border border-zinc-200 hover:border-[#FF5E1A] text-sm font-semibold text-zinc-900 hover:text-[#FF5E1A] transition-colors whitespace-nowrap cursor-pointer"
                              >
                                Customize
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onQuickAdd(vendor, item)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-[#FF5E1A] text-white text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
                              >
                                <Plus className="w-4 h-4" />
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        <aside className="hidden lg:block lg:col-span-4 sticky top-24">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6">
            <h2 className="font-display text-lg font-bold text-zinc-900 mb-4 flex items-center justify-between">
              <span>Your Basket</span>
              {vendorItemCount > 0 && (
                <span className="text-sm font-medium text-zinc-500 tabular-nums">
                  {vendorItemCount} {vendorItemCount === 1 ? 'item' : 'items'}
                </span>
              )}
            </h2>

            {!isCurrentVendorCart || cartItems.length === 0 ? (
              <div className="py-8 text-center">
                <ShoppingBag className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                <p className="text-sm text-zinc-600">
                  Add items from {vendor.name} to start your order.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="divide-y divide-zinc-100 max-h-72 overflow-y-auto pr-1">
                  {cartItems.map((line) => {
                    const lineUnit =
                      line.unitBasePriceEur +
                      line.selectedOptions.reduce((s, o) => s + o.priceDelta, 0);
                    return (
                      <div key={line.cartLineId} className="py-3 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-900 truncate">{line.name}</p>
                          {line.selectedOptions.length > 0 && (
                            <p className="text-xs text-zinc-500 mt-0.5">
                              {line.selectedOptions.map((o) => o.label).join(', ')}
                            </p>
                          )}
                          <p className="text-xs font-semibold text-zinc-800 mt-1 tabular-nums">
                            €{(lineUnit * line.quantity).toFixed(2)}
                          </p>
                        </div>

                        <div className="inline-flex items-center border border-zinc-200 rounded-lg shrink-0">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(line.cartLineId, -1)}
                            aria-label={`Decrease quantity of ${line.name}`}
                            className="p-1.5 text-zinc-600 hover:text-zinc-900 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-zinc-900 tabular-nums">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(line.cartLineId, 1)}
                            aria-label={`Increase quantity of ${line.name}`}
                            className="p-1.5 text-zinc-600 hover:text-zinc-900 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {vendor.freeDeliveryOverEur && vendorSubtotal < vendor.freeDeliveryOverEur && (
                  <p className="text-xs text-zinc-600 bg-stone-50 border border-zinc-200 rounded-lg p-3 tabular-nums">
                    Add <strong className="text-zinc-900">€{(vendor.freeDeliveryOverEur - vendorSubtotal).toFixed(2)}</strong> more for free delivery.
                  </p>
                )}

                <div className="pt-3 border-t border-zinc-200 flex items-center justify-between text-sm font-semibold text-zinc-900 tabular-nums">
                  <span>Subtotal</span>
                  <span>€{vendorSubtotal.toFixed(2)}</span>
                </div>

                {vendorSubtotal < vendor.minOrderEur && (
                  <p className="text-xs text-amber-700 tabular-nums">
                    Minimum order is €{vendor.minOrderEur.toFixed(2)} (add €{(vendor.minOrderEur - vendorSubtotal).toFixed(2)} more).
                  </p>
                )}

                <button
                  type="button"
                  disabled={vendorSubtotal < vendor.minOrderEur}
                  onClick={onOpenCart}
                  className="w-full py-3 px-4 rounded-xl bg-[#FF5E1A] hover:bg-[#E54B0B] disabled:bg-zinc-300 text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  Review Basket & Checkout
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
