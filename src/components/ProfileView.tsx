import {
  Check,
  Copy,
  Heart,
  MapPin,
  Plus,
  Tag,
  Trash2,
  User,
  Wallet,
} from 'lucide-react';
import {useState} from 'react';
import {
  CyprusArea,
  OrderRecord,
  PaymentMethod,
  PromoOffer,
  SavedAddress,
  UserProfile,
  Vendor,
} from '../types/delivery';
import {ResilientImage} from './ResilientImage';

interface ProfileViewProps {
  profile: UserProfile;
  areas: CyprusArea[];
  vendors: Vendor[];
  promos: PromoOffer[];
  orders: OrderRecord[];
  onSaveProfile: (updated: UserProfile) => Promise<void>;
  onSelectVendor: (vendor: Vendor) => void;
  onToggleFavorite: (vendorId: string) => void;
  onViewOrders: () => void;
}

export function ProfileView({
  profile,
  areas,
  vendors,
  promos,
  orders,
  onSaveProfile,
  onSelectVendor,
  onToggleFavorite,
  onViewOrders,
}: ProfileViewProps) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [preferredAreaId, setPreferredAreaId] = useState(profile.preferredAreaId);
  const [defaultPayment, setDefaultPayment] = useState<PaymentMethod>(profile.defaultPayment);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addrLabel, setAddrLabel] = useState('Beach Villa');
  const [addrAreaId, setAddrAreaId] = useState(areas[0]?.id || 'lim-marina');
  const [addrBuilding, setAddrBuilding] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrApt, setAddrApt] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const favoriteVendors = vendors.filter((v) => profile.favoriteVendorIds.includes(v.id));

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveProfile({
        ...profile,
        fullName: fullName.trim() || profile.fullName,
        email: email.trim() || profile.email,
        phone: phone.trim() || profile.phone,
        preferredAreaId,
        defaultPayment,
      });
      setSavedNotice(true);
      window.setTimeout(() => setSavedNotice(false), 2200);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrBuilding.trim() || !addrStreet.trim()) return;
    const areaObj = areas.find((a) => a.id === addrAreaId) || areas[0];
    const newAddr: SavedAddress = {
      id: `addr-${Date.now()}`,
      label: addrLabel.trim() || 'Saved Place',
      areaId: areaObj.id,
      areaLabel: `${areaObj.name}, ${areaObj.city}`,
      building: addrBuilding.trim(),
      street: addrStreet.trim(),
      apartment: addrApt.trim(),
      isDefault: profile.addresses.length === 0,
    };
    await onSaveProfile({
      ...profile,
      addresses: [...profile.addresses, newAddr],
    });
    setAddrBuilding('');
    setAddrStreet('');
    setAddrApt('');
    setShowAddAddress(false);
  };

  const handleSetDefaultAddress = async (id: string) => {
    await onSaveProfile({
      ...profile,
      addresses: profile.addresses.map((a) => ({...a, isDefault: a.id === id})),
    });
  };

  const handleDeleteAddress = async (id: string) => {
    const remaining = profile.addresses.filter((a) => a.id !== id);
    if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
      remaining[0] = {...remaining[0], isDefault: true};
    }
    await onSaveProfile({
      ...profile,
      addresses: remaining,
    });
  };

  const handleCopyCode = (code: string) => {
    try {
      navigator.clipboard?.writeText(code);
    } catch {
      // ignore clipboard error
    }
    setCopiedCode(code);
    window.setTimeout(() => setCopiedCode(null), 1800);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-10">
      <div className="bg-[#092332] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <p className="text-xs font-medium text-amber-300 mb-1">My Account · Cyprus</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">
            {profile.fullName}
          </h1>
          <p className="text-sm text-slate-200 mt-1 tabular-nums">
            {profile.email} · {profile.phone}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 text-xs tabular-nums">
            <span className="text-slate-300">Parea Wallet: </span>
            <strong className="text-sm font-bold text-white inline-flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-[#FF5E1A]" />€{profile.walletBalanceEur.toFixed(2)}
            </strong>
          </div>
          <button
            type="button"
            onClick={onViewOrders}
            className="px-4 py-2.5 rounded-xl bg-[#FF5E1A] hover:bg-[#E54B0B] text-xs font-semibold text-white cursor-pointer tabular-nums"
          >
            Orders ({orders.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form
          onSubmit={handleSaveDetails}
          className="lg:col-span-5 bg-white border border-zinc-200 rounded-2xl p-6 space-y-4"
        >
          <h2 className="font-display text-lg font-bold text-zinc-900 flex items-center gap-2">
            <User className="w-4 h-4 text-[#FF5E1A]" />
            Personal Details
          </h2>

          <div>
            <label htmlFor="profile-name" className="block text-xs font-medium text-zinc-700 mb-1">
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 text-sm text-zinc-900 focus:border-[#FF5E1A] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="profile-email" className="block text-xs font-medium text-zinc-700 mb-1">
              Email Address
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 text-sm text-zinc-900 focus:border-[#FF5E1A] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="profile-phone" className="block text-xs font-medium text-zinc-700 mb-1">
              Cyprus Mobile (+357)
            </label>
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 text-sm text-zinc-900 tabular-nums focus:border-[#FF5E1A] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="profile-area" className="block text-xs font-medium text-zinc-700 mb-1">
                Default Cyprus Area
              </label>
              <select
                id="profile-area"
                value={preferredAreaId}
                onChange={(e) => setPreferredAreaId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 text-sm text-zinc-900 bg-white focus:border-[#FF5E1A] focus:outline-none cursor-pointer"
              >
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}, {a.city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="profile-payment" className="block text-xs font-medium text-zinc-700 mb-1">
                Default Payment
              </label>
              <select
                id="profile-payment"
                value={defaultPayment}
                onChange={(e) => setDefaultPayment(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 text-sm text-zinc-900 bg-white focus:border-[#FF5E1A] focus:outline-none cursor-pointer"
              >
                <option value="cod">Cash on Delivery</option>
                <option value="card_on_delivery">Card on Delivery</option>
                <option value="online_card">Online Card / Apple Pay</option>
                <option value="wallet">Parea Wallet</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[#FF5E1A] hover:bg-[#E04F00] text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {savedNotice && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                <Check className="w-3.5 h-3.5" />
                Saved to profile
              </span>
            )}
          </div>
        </form>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-zinc-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF5E1A]" />
                Saved Cyprus Addresses
              </h2>
              <button
                type="button"
                onClick={() => setShowAddAddress((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF5E1A] hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {showAddAddress ? 'Cancel' : 'Add address'}
              </button>
            </div>

            {showAddAddress && (
              <form
                onSubmit={handleAddAddress}
                className="p-4 rounded-xl bg-stone-50 border border-zinc-200 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Label (e.g., Home, Villa)"
                    value={addrLabel}
                    onChange={(e) => setAddrLabel(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-zinc-200 bg-white text-sm"
                  />
                  <select
                    value={addrAreaId}
                    onChange={(e) => setAddrAreaId(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-zinc-200 bg-white text-sm cursor-pointer"
                  >
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}, {a.city}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Building / House *"
                    value={addrBuilding}
                    onChange={(e) => setAddrBuilding(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-zinc-200 bg-white text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Street *"
                    value={addrStreet}
                    onChange={(e) => setAddrStreet(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-zinc-200 bg-white text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Apt / Floor"
                    value={addrApt}
                    onChange={(e) => setAddrApt(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-zinc-200 bg-white text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-[#FF5E1A] text-white text-xs font-semibold cursor-pointer"
                >
                  Save Address
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-4 rounded-xl border ${
                    addr.isDefault ? 'border-[#FF5E1A] bg-[#FF5E1A]/5' : 'border-zinc-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-zinc-900">
                      {addr.label}
                      {addr.isDefault && (
                        <span className="text-xs font-medium text-[#FF5E1A] ml-2">Default</span>
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      aria-label={`Delete ${addr.label}`}
                      className="text-zinc-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    {addr.building}
                    {addr.apartment ? `, ${addr.apartment}` : ''}
                    <br />
                    {addr.street}, {addr.areaLabel}
                  </p>
                  {!addr.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefaultAddress(addr.id)}
                      className="mt-2 text-xs font-medium text-zinc-700 hover:text-[#FF5E1A] underline cursor-pointer"
                    >
                      Set as default
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#FF5E1A]" />
              Available Cyprus Promo Codes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {promos.map((promo) => (
                <div
                  key={promo.code}
                  className="p-4 rounded-xl border border-zinc-200 bg-stone-50 flex items-start justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{promo.code}</p>
                    <p className="text-xs font-medium text-zinc-700 mt-0.5">{promo.title}</p>
                    <p className="text-xs text-zinc-500 mt-1">{promo.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(promo.code)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-semibold text-zinc-800 hover:border-[#FF5E1A] shrink-0 cursor-pointer"
                  >
                    {copiedCode === promo.code ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-xl font-bold text-zinc-900 flex items-center gap-2">
          <Heart className="w-4 h-4 text-[#FF5E1A] fill-[#FF5E1A]" />
          Saved Restaurants & Shops ({favoriteVendors.length})
        </h2>

        {favoriteVendors.length === 0 ? (
          <p className="text-sm text-zinc-600 border border-zinc-200 rounded-xl p-6 bg-stone-50">
            Tap the heart icon on any Cyprus restaurant or shop to save it here for quick reordering.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {favoriteVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="border border-zinc-200 rounded-xl overflow-hidden bg-white flex items-center gap-4 p-3"
              >
                <div className="w-20 h-16 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                  <ResilientImage
                    src={vendor.image}
                    alt={vendor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onSelectVendor(vendor)}
                    className="text-sm font-semibold text-zinc-900 hover:text-[#FF5E1A] truncate block text-left w-full cursor-pointer"
                  >
                    {vendor.name}
                  </button>
                  <p className="text-xs text-zinc-500 truncate">{vendor.category}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleFavorite(vendor.id)}
                  aria-label={`Remove ${vendor.name} from saved`}
                  className="p-2 text-[#FF5E1A] hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-[#FF5E1A]" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
