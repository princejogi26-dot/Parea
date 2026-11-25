import {
  ArrowLeft,
  Check,
  CreditCard,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import {useEffect, useMemo, useState} from 'react';
import {
  CartItem,
  CyprusArea,
  DeliveryAddress,
  PaymentMethod,
  PromoOffer,
  UserProfile,
  Vendor,
} from '../types/delivery';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor | null;
  cartItems: CartItem[];
  selectedArea: CyprusArea;
  profile: UserProfile;
  promos: PromoOffer[];
  onUpdateQuantity: (cartLineId: string, delta: number) => void;
  onRemoveLine: (cartLineId: string) => void;
  onClearCart: () => void;
  onPlaceOrder: (params: {
    address: DeliveryAddress;
    paymentMethod: PaymentMethod;
    promoCode?: string;
    subtotalEur: number;
    deliveryFeeEur: number;
    discountEur: number;
    serviceFeeEur: number;
    totalEur: number;
  }) => Promise<void>;
}

export function CartDrawer({
  isOpen,
  onClose,
  vendor,
  cartItems,
  selectedArea,
  profile,
  promos,
  onUpdateQuantity,
  onRemoveLine,
  onClearCart,
  onPlaceOrder,
}: CartDrawerProps) {
  const [step, setStep] = useState<'basket' | 'checkout'>('basket');
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoOffer | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

  const defaultAddr =
    profile.addresses.find((a) => a.areaId === selectedArea.id) ||
    profile.addresses.find((a) => a.isDefault) ||
    profile.addresses[0];

  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddr?.id || 'custom');
  const [building, setBuilding] = useState(defaultAddr?.building || 'Marina Residences Block A');
  const [street, setStreet] = useState(defaultAddr?.street || 'Makarios III Avenue');
  const [apartment, setApartment] = useState(defaultAddr?.apartment || 'Apt 204');
  const [phone, setPhone] = useState(profile.phone || '+357 99 482 190');
  const [deliveryNote, setDeliveryNote] = useState(defaultAddr?.notes || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(profile.defaultPayment || 'cod');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep('basket');
      setFormError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedAddressId === 'custom') return;
    const found = profile.addresses.find((a) => a.id === selectedAddressId);
    if (found) {
      setBuilding(found.building);
      setStreet(found.street);
      setApartment(found.apartment);
      setDeliveryNote(found.notes || '');
    }
  }, [selectedAddressId, profile.addresses]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const subtotalEur = useMemo(
    () =>
      cartItems.reduce(
        (sum, line) =>
          sum +
          (line.unitBasePriceEur +
            line.selectedOptions.reduce((s, o) => s + o.priceDelta, 0)) *
            line.quantity,
        0
      ),
    [cartItems]
  );

  const baseDeliveryFee = useMemo(() => {
    if (!vendor) return 0;
    if (vendor.freeDeliveryOverEur && subtotalEur >= vendor.freeDeliveryOverEur) {
      return 0;
    }
    return vendor.deliveryFeeEur;
  }, [vendor, subtotalEur]);

  const {deliveryFeeEur, discountEur} = useMemo(() => {
    if (!appliedPromo || subtotalEur < appliedPromo.minOrderEur) {
      return {deliveryFeeEur: baseDeliveryFee, discountEur: 0};
    }
    if (appliedPromo.type === 'free_delivery') {
      return {deliveryFeeEur: 0, discountEur: 0};
    }
    if (appliedPromo.type === 'fixed') {
      return {
        deliveryFeeEur: baseDeliveryFee,
        discountEur: Number(Math.min(subtotalEur, appliedPromo.value).toFixed(2)),
      };
    }
    const raw = (subtotalEur * appliedPromo.value) / 100;
    const capped = appliedPromo.maxDiscountEur ? Math.min(raw, appliedPromo.maxDiscountEur) : raw;
    return {deliveryFeeEur: baseDeliveryFee, discountEur: Number(capped.toFixed(2))};
  }, [appliedPromo, baseDeliveryFee, subtotalEur]);

  const serviceFeeEur = cartItems.length > 0 ? 0.9 : 0;
  const totalEur = Math.max(0, Number((subtotalEur + deliveryFeeEur + serviceFeeEur - discountEur).toFixed(2)));

  if (!isOpen) return null;

  const applyPromoCode = async (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) return;
    setValidatingPromo(true);
    setPromoError(null);
    try {
      const res = await fetch('/api/promos/validate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({code, subtotalEur}),
      });
      const data = (await res.json()) as {valid?: boolean; promo?: PromoOffer; error?: string};
      if (!res.ok || !data.valid || !data.promo) {
        setPromoError(data.error || 'Could not apply promo code.');
      } else {
        setAppliedPromo(data.promo);
        setPromoInput(data.promo.code);
        setPromoError(null);
      }
    } catch {
      const localPromo = promos.find((p) => p.code === code);
      if (!localPromo) {
        setPromoError('Invalid promo code. Try CYPRUS20 or FREEDEL.');
      } else if (subtotalEur < localPromo.minOrderEur) {
        setPromoError(`${localPromo.code} requires €${localPromo.minOrderEur.toFixed(2)} minimum.`);
      } else {
        setAppliedPromo(localPromo);
      }
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!building.trim() || !street.trim() || !phone.trim()) {
      setFormError('Please provide your building/house name, street, and Cyprus phone number.');
      return;
    }
    if (paymentMethod === 'wallet' && profile.walletBalanceEur < totalEur) {
      setFormError(`Insufficient Parea Wallet balance (€${profile.walletBalanceEur.toFixed(2)} available).`);
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await onPlaceOrder({
        address: {
          areaId: selectedArea.id,
          areaLabel: `${selectedArea.name}, ${selectedArea.city}`,
          building: building.trim(),
          street: street.trim(),
          apartment: apartment.trim(),
          phone: phone.trim(),
          deliveryNote: deliveryNote.trim(),
        },
        paymentMethod,
        promoCode: appliedPromo?.code,
        subtotalEur,
        deliveryFeeEur,
        discountEur,
        serviceFeeEur,
        totalEur,
      });
    } catch {
      setFormError('Unable to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const minOrderMet = !vendor || subtotalEur >= vendor.minOrderEur;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Your basket and checkout"
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl border-l border-zinc-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {step === 'checkout' && (
              <button
                type="button"
                onClick={() => setStep('basket')}
                aria-label="Back to basket"
                className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="min-w-0">
              <h2 className="font-display text-lg font-bold text-zinc-900 truncate">
                {step === 'basket' ? 'Your Basket' : 'Cyprus Checkout'}
              </h2>
              {vendor && (
                <p className="text-xs text-zinc-500 truncate">
                  {vendor.name} · {selectedArea.name}, {selectedArea.city}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close basket"
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="w-10 h-10 text-zinc-300 mb-3" />
            <h3 className="font-display text-lg font-semibold text-zinc-900 mb-1">
              Your basket is empty
            </h3>
            <p className="text-sm text-zinc-600 mb-6 max-w-xs">
              Explore Cyprus restaurants, supermarkets, pharmacies, and local shops in {selectedArea.name}.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-[#FF5E1A] hover:bg-[#E04F00] text-white text-sm font-semibold cursor-pointer"
            >
              Browse Cyprus venues
            </button>
          </div>
        ) : step === 'basket' ? (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">Order items</span>
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-xs font-medium text-zinc-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                  Clear basket
                </button>
              </div>

              <div className="divide-y divide-zinc-100">
                {cartItems.map((line) => {
                  const unitPrice =
                    line.unitBasePriceEur +
                    line.selectedOptions.reduce((s, o) => s + o.priceDelta, 0);
                  return (
                    <div key={line.cartLineId} className="py-4 first:pt-0 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-zinc-900">{line.name}</p>
                        {line.selectedOptions.length > 0 && (
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {line.selectedOptions.map((o) => o.label).join(', ')}
                          </p>
                        )}
                        {line.specialInstructions && (
                          <p className="text-xs text-zinc-500 italic mt-0.5">
                            Note: {line.specialInstructions}
                          </p>
                        )}
                        <p className="text-xs font-semibold text-zinc-800 mt-1.5 tabular-nums">
                          €{(unitPrice * line.quantity).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="inline-flex items-center border border-zinc-200 rounded-lg">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(line.cartLineId, -1)}
                            aria-label={`Decrease ${line.name}`}
                            className="p-1.5 text-zinc-600 hover:text-zinc-900 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold text-zinc-900 tabular-nums">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(line.cartLineId, 1)}
                            aria-label={`Increase ${line.name}`}
                            className="p-1.5 text-zinc-600 hover:text-zinc-900 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveLine(line.cartLineId)}
                          aria-label={`Remove ${line.name}`}
                          className="p-1.5 text-zinc-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-zinc-200 space-y-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    applyPromoCode(promoInput);
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <label htmlFor="promo-code-input" className="sr-only">
                      Promo code
                    </label>
                    <input
                      id="promo-code-input"
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Enter promo code"
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#FF5E1A] focus:outline-none uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={validatingPromo}
                    className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold cursor-pointer"
                  >
                    {validatingPromo ? 'Checking...' : 'Apply'}
                  </button>
                </form>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-zinc-500">Available:</span>
                  {promos.map((p) => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => applyPromoCode(p.code)}
                      className="font-semibold text-[#FF5E1A] hover:underline cursor-pointer"
                    >
                      {p.code}
                    </button>
                  ))}
                </div>

                {promoError && <p className="text-xs text-red-600">{promoError}</p>}
                {appliedPromo && (
                  <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Check className="w-3.5 h-3.5" />
                      {appliedPromo.code}: {appliedPromo.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedPromo(null);
                        setPromoInput('');
                      }}
                      className="text-zinc-600 hover:text-zinc-900 underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-zinc-200 space-y-2 text-sm tabular-nums">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span>€{subtotalEur.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Delivery fee</span>
                  <span>{deliveryFeeEur === 0 ? 'Free' : `€${deliveryFeeEur.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Service fee</span>
                  <span>€{serviceFeeEur.toFixed(2)}</span>
                </div>
                {discountEur > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Promo discount ({appliedPromo?.code})</span>
                    <span>-€{discountEur.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-zinc-200 flex justify-between font-bold text-base text-zinc-900">
                  <span>Total</span>
                  <span>€{totalEur.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-200 bg-stone-50 space-y-3">
              {!minOrderMet && vendor && (
                <p className="text-xs text-amber-700 tabular-nums">
                  Add €{(vendor.minOrderEur - subtotalEur).toFixed(2)} more to reach the €
                  {vendor.minOrderEur.toFixed(2)} minimum order.
                </p>
              )}
              <button
                type="button"
                disabled={!minOrderMet}
                onClick={() => setStep('checkout')}
                className="w-full py-3.5 px-5 rounded-xl bg-[#FF5E1A] hover:bg-[#E04F00] disabled:bg-zinc-300 text-white text-sm font-semibold transition-colors tabular-nums cursor-pointer"
              >
                Proceed to Checkout · €{totalEur.toFixed(2)}
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleCheckoutSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-3">
                  Saved Addresses ({selectedArea.name}, {selectedArea.city})
                </h3>
                {profile.addresses.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {profile.addresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                          selectedAddressId === addr.id
                            ? 'border-[#FF5E1A] bg-[#FF5E1A]/5 text-[#FF5E1A]'
                            : 'border-zinc-200 text-zinc-700 hover:border-zinc-300'
                        }`}
                      >
                        {addr.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedAddressId('custom')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                        selectedAddressId === 'custom'
                          ? 'border-[#FF5E1A] bg-[#FF5E1A]/5 text-[#FF5E1A]'
                          : 'border-zinc-200 text-zinc-700 hover:border-zinc-300'
                      }`}
                    >
                      Custom address
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label htmlFor="checkout-building" className="block text-xs font-medium text-zinc-600 mb-1">
                      Building or House Name *
                    </label>
                    <input
                      id="checkout-building"
                      type="text"
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 text-sm text-zinc-900 focus:border-[#FF5E1A] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="checkout-street" className="block text-xs font-medium text-zinc-600 mb-1">
                        Street *
                      </label>
                      <input
                        id="checkout-street"
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 text-sm text-zinc-900 focus:border-[#FF5E1A] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="checkout-apt" className="block text-xs font-medium text-zinc-600 mb-1">
                        Apt / Floor
                      </label>
                      <input
                        id="checkout-apt"
                        type="text"
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 text-sm text-zinc-900 focus:border-[#FF5E1A] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="checkout-phone" className="block text-xs font-medium text-zinc-600 mb-1">
                      Cyprus Mobile Number *
                    </label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 text-sm text-zinc-900 tabular-nums focus:border-[#FF5E1A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkout-note" className="block text-xs font-medium text-zinc-600 mb-1">
                      Courier instructions (optional)
                    </label>
                    <input
                      id="checkout-note"
                      type="text"
                      value={deliveryNote}
                      onChange={(e) => setDeliveryNote(e.target.value)}
                      placeholder="Ring bell or call on arrival"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#FF5E1A] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200">
                <h3 className="text-sm font-semibold text-zinc-900 mb-3">Payment Method</h3>
                <div className="space-y-2">
                  {[
                    {
                      id: 'cod' as PaymentMethod,
                      title: 'Cash on Delivery',
                      desc: 'Pay in EUR (€) when the courier arrives',
                      icon: CreditCard,
                    },
                    {
                      id: 'card_on_delivery' as PaymentMethod,
                      title: 'Card on Delivery',
                      desc: 'Contactless Visa / Mastercard terminal at your door',
                      icon: CreditCard,
                    },
                    {
                      id: 'online_card' as PaymentMethod,
                      title: 'Online Card / Apple Pay',
                      desc: 'Visa •••• 4242 instant payment',
                      icon: CreditCard,
                    },
                    {
                      id: 'wallet' as PaymentMethod,
                      title: `Parea Wallet (€${profile.walletBalanceEur.toFixed(2)} available)`,
                      desc: 'Pay using your Cyprus wallet credits',
                      icon: Wallet,
                    },
                  ].map((option) => {
                    const selected = paymentMethod === option.id;
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setPaymentMethod(option.id)}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-left transition-colors cursor-pointer ${
                          selected
                            ? 'border-[#FF5E1A] bg-[#FF5E1A]/5'
                            : 'border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-zinc-500 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-zinc-900">{option.title}</p>
                            <p className="text-xs text-zinc-500">{option.desc}</p>
                          </div>
                        </div>
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            selected ? 'border-[#FF5E1A] bg-[#FF5E1A]' : 'border-zinc-300'
                          }`}
                        >
                          {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {formError && (
                <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {formError}
                </p>
              )}
            </div>

            <div className="p-6 border-t border-zinc-200 bg-stone-50 space-y-3">
              <div className="flex items-center justify-between text-sm font-bold text-zinc-900 tabular-nums">
                <span>Total Due</span>
                <span>€{totalEur.toFixed(2)}</span>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-5 rounded-xl bg-[#FF5E1A] hover:bg-[#E04F00] disabled:bg-zinc-400 text-white text-sm font-semibold transition-colors tabular-nums cursor-pointer"
              >
                {submitting ? 'Placing order...' : `Place Order · €${totalEur.toFixed(2)}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
