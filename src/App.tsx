import {Check} from 'lucide-react';
import {useEffect, useMemo, useState} from 'react';
import {CartDrawer} from './components/CartDrawer';
import {Footer} from './components/Footer';
import {Header, NavSection} from './components/Header';
import {HeroSection} from './components/HeroSection';
import {ItemCustomizationModal} from './components/ItemCustomizationModal';
import {OrderTrackingView} from './components/OrderTrackingView';
import {ProfileView} from './components/ProfileView';
import {RestaurantMenuView} from './components/RestaurantMenuView';
import {SupportView} from './components/SupportView';
import {VendorGrid} from './components/VendorGrid';
import {
  CYPRUS_AREAS,
  CYPRUS_PROMOS,
  CYPRUS_VENDORS,
  DEFAULT_USER_PROFILE,
} from './data/cyprusCatalog';
import {
  CartItem,
  CyprusArea,
  CyprusCity,
  DeliveryAddress,
  MenuItem,
  OrderRecord,
  OrderStage,
  PaymentMethod,
  PromoOffer,
  SelectedOption,
  SortOption,
  SupportTicket,
  UserProfile,
  Vendor,
  VendorCategory,
  VendorVertical,
} from './types/delivery';

interface PendingCartAddition {
  vendor: Vendor;
  item: MenuItem;
  selectedOptions: SelectedOption[];
  specialInstructions: string;
  quantity: number;
}

const STAGE_SEQUENCE: OrderStage[] = ['confirmed', 'preparing', 'on_the_way', 'delivered'];

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [areas, setAreas] = useState<CyprusArea[]>(CYPRUS_AREAS);
  const [vendors, setVendors] = useState<Vendor[]>(CYPRUS_VENDORS);
  const [promos, setPromos] = useState<PromoOffer[]>(CYPRUS_PROMOS);
  const [profile, setProfile] = useState<UserProfile>(() =>
    loadJson<UserProfile>('parea_cy_profile', DEFAULT_USER_PROFILE)
  );
  const [orders, setOrders] = useState<OrderRecord[]>(() =>
    loadJson<OrderRecord[]>('parea_cy_orders', [])
  );
  const [tickets, setTickets] = useState<SupportTicket[]>(() =>
    loadJson<SupportTicket[]>('parea_cy_tickets', [])
  );

  const [selectedAreaId, setSelectedAreaId] = useState<string>(() =>
    loadJson('parea_cy_area_id', 'lim-marina')
  );
  const [activeNav, setActiveNav] = useState<NavSection>('restaurants');
  const [vertical, setVertical] = useState<VendorVertical>('all');
  const [selectedCategory, setSelectedCategory] = useState<VendorCategory>('All');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState(false);
  const [offersOnly, setOffersOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [activeVendorId, setActiveVendorId] = useState<string | null>(null);
  const [customizingTarget, setCustomizingTarget] = useState<{
    vendor: Vendor;
    item: MenuItem;
  } | null>(null);

  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    loadJson<CartItem[]>('parea_cy_cart', [])
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState<PendingCartAddition | null>(null);

  const [activeOrderNumber, setActiveOrderNumber] = useState<string | null>(null);
  const [supportOrderRef, setSupportOrderRef] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/bootstrap')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!mounted || !data) return;
        if (Array.isArray(data.areas)) setAreas(data.areas);
        if (Array.isArray(data.vendors)) setVendors(data.vendors);
        if (Array.isArray(data.promos)) setPromos(data.promos);
        if (data.profile) setProfile(data.profile);
        if (Array.isArray(data.orders) && data.orders.length > 0) setOrders(data.orders);
        if (Array.isArray(data.tickets) && data.tickets.length > 0) setTickets(data.tickets);
      })
      .catch(() => {
        // Static hosting (e.g. Cloudflare Pages) uses localStorage + cyprusCatalog
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('parea_cy_area_id', JSON.stringify(selectedAreaId));
    } catch {
      // ignore storage errors
    }
  }, [selectedAreaId]);

  useEffect(() => {
    try {
      localStorage.setItem('parea_cy_profile', JSON.stringify(profile));
    } catch {
      // ignore storage errors
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem('parea_cy_orders', JSON.stringify(orders));
    } catch {
      // ignore storage errors
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('parea_cy_tickets', JSON.stringify(tickets));
    } catch {
      // ignore storage errors
    }
  }, [tickets]);

  useEffect(() => {
    try {
      localStorage.setItem('parea_cy_cart', JSON.stringify(cartItems));
    } catch {
      // ignore storage errors
    }
  }, [cartItems]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const selectedArea = useMemo(
    () => areas.find((a) => a.id === selectedAreaId) || areas[0],
    [areas, selectedAreaId]
  );

  const activeVendor = useMemo(
    () => vendors.find((v) => v.id === activeVendorId) || null,
    [vendors, activeVendorId]
  );

  const cartVendorId = cartItems.length > 0 ? cartItems[0].vendorId : null;
  const cartVendor = useMemo(
    () => (cartVendorId ? vendors.find((v) => v.id === cartVendorId) || null : null),
    [vendors, cartVendorId]
  );

  const cartCount = useMemo(
    () => cartItems.reduce((sum, line) => sum + line.quantity, 0),
    [cartItems]
  );

  const cartSubtotalEur = useMemo(
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

  const filteredVendors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const list = vendors.filter((vendor) => {
      if (!vendor.citiesServed.includes(selectedArea.city)) return false;
      if (vertical !== 'all' && vendor.vertical !== vertical) return false;
      if (selectedCategory !== 'All' && vendor.category !== selectedCategory) return false;
      if (freeDeliveryOnly && vendor.deliveryFeeEur > 0) return false;
      if (offersOnly && !vendor.offerText) return false;
      if (favoritesOnly && !profile.favoriteVendorIds.includes(vendor.id)) return false;
      if (query) {
        const matchesVendor =
          vendor.name.toLowerCase().includes(query) ||
          vendor.category.toLowerCase().includes(query);
        const matchesItems = vendor.items.some(
          (m) =>
            m.name.toLowerCase().includes(query) ||
            m.description.toLowerCase().includes(query)
        );
        if (!matchesVendor && !matchesItems) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'fastest') return a.deliveryMinMinutes - b.deliveryMinMinutes;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'lowest_fee') return a.deliveryFeeEur - b.deliveryFeeEur;
      return b.reviewCount - a.reviewCount;
    });
  }, [
    vendors,
    selectedArea.city,
    vertical,
    selectedCategory,
    freeDeliveryOnly,
    offersOnly,
    favoritesOnly,
    profile.favoriteVendorIds,
    searchQuery,
    sortBy,
  ]);

  const commitAddition = (addition: PendingCartAddition, replaceCart: boolean) => {
    const {vendor, item, selectedOptions, specialInstructions, quantity} = addition;
    const optionKey = selectedOptions
      .map((o) => `${o.groupId}:${o.choiceId}`)
      .sort()
      .join('|');
    const lineId = `${vendor.id}__${item.id}__${optionKey}__${specialInstructions}`;

    setCartItems((prev) => {
      const base = replaceCart ? [] : prev;
      const existing = base.find((l) => l.cartLineId === lineId);
      if (existing) {
        return base.map((l) =>
          l.cartLineId === lineId ? {...l, quantity: l.quantity + quantity} : l
        );
      }
      const newLine: CartItem = {
        cartLineId: lineId,
        vendorId: vendor.id,
        vendorName: vendor.name,
        itemId: item.id,
        name: item.name,
        unitBasePriceEur: item.priceEur,
        selectedOptions,
        specialInstructions,
        quantity,
      };
      return [...base, newLine];
    });

    setCustomizingTarget(null);
    setPendingSwitch(null);
    setToastMessage(`Added ${item.name} to basket`);
  };

  const handleAddToCart = (
    vendor: Vendor,
    item: MenuItem,
    selectedOptions: SelectedOption[] = [],
    specialInstructions = '',
    quantity = 1
  ) => {
    const addition: PendingCartAddition = {
      vendor,
      item,
      selectedOptions,
      specialInstructions,
      quantity,
    };

    if (cartVendorId && cartVendorId !== vendor.id) {
      setPendingSwitch(addition);
      return;
    }

    commitAddition(addition, false);
  };

  const handleUpdateQuantity = (cartLineId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((line) =>
          line.cartLineId === cartLineId
            ? {...line, quantity: line.quantity + delta}
            : line
        )
        .filter((line) => line.quantity > 0)
    );
  };

  const handleRemoveLine = (cartLineId: string) => {
    setCartItems((prev) => prev.filter((line) => line.cartLineId !== cartLineId));
  };

  const handleSaveProfile = async (updated: UserProfile) => {
    setProfile(updated);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data = (await res.json()) as {profile: UserProfile};
        setProfile(data.profile);
      }
    } catch {
      // optimistic state kept
    }
    setToastMessage('Profile updated');
  };

  const handleToggleFavorite = async (vendorId: string) => {
    const exists = profile.favoriteVendorIds.includes(vendorId);
    const nextFavs = exists
      ? profile.favoriteVendorIds.filter((id) => id !== vendorId)
      : [...profile.favoriteVendorIds, vendorId];
    const nextProfile = {...profile, favoriteVendorIds: nextFavs};
    setProfile(nextProfile);
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({favoriteVendorIds: nextFavs}),
      });
    } catch {
      // ignore network error
    }
  };

  const handleNavSelect = (nav: NavSection) => {
    setActiveNav(nav);
    setActiveVendorId(null);

    if (nav === 'restaurants') {
      setVertical('all');
      setSelectedCategory('All');
    } else if (nav === 'shops') {
      setVertical('shop');
      setSelectedCategory('All');
    }

    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleSelectCity = (city: CyprusCity) => {
    const firstArea = areas.find((a) => a.city === city);
    if (firstArea) {
      setSelectedAreaId(firstArea.id);
      setActiveNav('restaurants');
      setActiveVendorId(null);
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  };

  const handlePlaceOrder = async (params: {
    address: DeliveryAddress;
    paymentMethod: PaymentMethod;
    promoCode?: string;
    subtotalEur: number;
    deliveryFeeEur: number;
    discountEur: number;
    serviceFeeEur: number;
    totalEur: number;
  }) => {
    if (!cartVendor || cartItems.length === 0) return;

    const minEta = cartVendor.deliveryMinMinutes + selectedArea.etaBoostMinutes;
    const maxEta = cartVendor.deliveryMaxMinutes + selectedArea.etaBoostMinutes;

    const payload = {
      vendorId: cartVendor.id,
      vendorName: cartVendor.name,
      vendorImage: cartVendor.image,
      vendorVertical: cartVendor.vertical,
      items: cartItems,
      subtotalEur: params.subtotalEur,
      deliveryFeeEur: params.deliveryFeeEur,
      discountEur: params.discountEur,
      serviceFeeEur: params.serviceFeeEur,
      totalEur: params.totalEur,
      promoCode: params.promoCode,
      paymentMethod: params.paymentMethod,
      address: params.address,
      estimatedMinutes: `${minEta}–${maxEta} min`,
      courierName: 'Marios Christodoulou',
      courierPhone: '+357 96 512 804',
      courierVehicle: 'Scooter · Cyprus Plate KYP 482',
    };

    let createdOrder: OrderRecord;
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Order failed');
      const data = (await res.json()) as {order: OrderRecord; profile: UserProfile};
      createdOrder = data.order;
      if (data.profile) setProfile(data.profile);
    } catch {
      createdOrder = {
        ...payload,
        orderNumber: `CYP-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAtIso: new Date().toISOString(),
        stage: 'confirmed',
      };
    }

    setOrders((prev) => [createdOrder, ...prev]);
    setActiveOrderNumber(createdOrder.orderNumber);
    setCartItems([]);
    setIsCartOpen(false);
    setActiveVendorId(null);
    setActiveNav('orders');
    setToastMessage(`Order #${createdOrder.orderNumber} confirmed`);
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleAdvanceOrderStage = async (orderNumber: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.orderNumber !== orderNumber) return order;
        const idx = STAGE_SEQUENCE.indexOf(order.stage);
        const nextStage = STAGE_SEQUENCE[Math.min(STAGE_SEQUENCE.length - 1, idx + 1)];
        return {...order, stage: nextStage};
      })
    );
    try {
      await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/advance`, {
        method: 'POST',
      });
    } catch {
      // optimistic state kept
    }
  };

  const handleReorder = (order: OrderRecord) => {
    setCartItems(order.items);
    setActiveNav('restaurants');
    setActiveVendorId(order.vendorId);
    setIsCartOpen(true);
  };

  const handleCreateSupportTicket = async (params: {
    topic: string;
    orderNumber?: string;
    message: string;
  }): Promise<SupportTicket | null> => {
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error('Failed');
      const data = (await res.json()) as {ticket: SupportTicket};
      setTickets((prev) => [data.ticket, ...prev]);
      setToastMessage(`Support ticket ${data.ticket.ticketId} created`);
      return data.ticket;
    } catch {
      const now = new Date().toISOString();
      const ref = params.orderNumber ? ` for order #${params.orderNumber}` : '';
      const localTicket: SupportTicket = {
        ticketId: `SUP-${Math.floor(1000 + Math.random() * 9000)}`,
        topic: params.topic,
        orderNumber: params.orderNumber,
        status: 'open',
        createdAtIso: now,
        updatedAtIso: now,
        messages: [
          {
            id: `msg-${Date.now()}-c`,
            sender: 'customer',
            authorName: profile.fullName || 'Customer',
            body: params.message,
            createdAtIso: now,
          },
          {
            id: `msg-${Date.now()}-a`,
            sender: 'agent',
            authorName: 'Elena · Parea Cyprus Support',
            body: `Thank you for contacting Parea Cyprus Support${ref}. Our Nicosia team has logged your request (${params.topic}) and is reviewing it now.`,
            createdAtIso: new Date(Date.now() + 800).toISOString(),
          },
        ],
      };
      setTickets((prev) => [localTicket, ...prev]);
      setToastMessage(`Support ticket ${localTicket.ticketId} created`);
      return localTicket;
    }
  };

  const handleReplySupportTicket = async (
    ticketId: string,
    message: string,
    resolve = false
  ) => {
    try {
      const res = await fetch(`/api/support/${encodeURIComponent(ticketId)}/reply`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message, resolve}),
      });
      if (!res.ok) throw new Error('Failed');
      const data = (await res.json()) as {ticket: SupportTicket};
      setTickets((prev) =>
        prev.map((t) => (t.ticketId === ticketId ? data.ticket : t))
      );
      if (resolve) setToastMessage(`Ticket ${ticketId} marked resolved`);
    } catch {
      const now = new Date().toISOString();
      setTickets((prev) =>
        prev.map((t) => {
          if (t.ticketId !== ticketId) return t;
          const nextMsgs = [...t.messages];
          if (message.trim()) {
            nextMsgs.push({
              id: `msg-${Date.now()}-c`,
              sender: 'customer',
              authorName: profile.fullName || 'Customer',
              body: message.trim(),
              createdAtIso: now,
            });
            if (!resolve) {
              nextMsgs.push({
                id: `msg-${Date.now()}-a`,
                sender: 'agent',
                authorName: 'Elena · Parea Cyprus Support',
                body: 'Received — we have added your update to this case.',
                createdAtIso: new Date(Date.now() + 500).toISOString(),
              });
            }
          }
          return {
            ...t,
            status: resolve ? 'resolved' : t.status,
            updatedAtIso: now,
            messages: nextMsgs,
          };
        })
      );
      if (resolve) setToastMessage(`Ticket ${ticketId} marked resolved`);
    }
  };

  const isCatalogView = activeNav === 'restaurants' || activeNav === 'shops';

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8F9] text-[#092332]">
      <Header
        activeNav={activeNav}
        onSelectNav={handleNavSelect}
        onGoHome={() => {
          setActiveNav('restaurants');
          setActiveVendorId(null);
          setVertical('all');
          setSelectedCategory('All');
          setOffersOnly(false);
          setFreeDeliveryOnly(false);
          setFavoritesOnly(false);
          setSearchQuery('');
        }}
        cartCount={cartCount}
        cartSubtotalEur={cartSubtotalEur}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <div className="md:hidden border-b border-white/10 bg-[#0D2E41] px-4 py-2 flex items-center gap-5 overflow-x-auto">
        {(
          [
            {id: 'restaurants', label: 'Restaurants'},
            {id: 'shops', label: 'Shops'},
            {id: 'orders', label: 'Orders'},
            {id: 'support', label: 'Support'},
            {id: 'profile', label: 'Profile'},
          ] as {id: NavSection; label: string}[]
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleNavSelect(item.id)}
            className={`text-xs font-semibold whitespace-nowrap shrink-0 py-1 ${
              activeNav === item.id ? 'text-[#FF5E1A]' : 'text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <main className="flex-1">
        {activeNav === 'orders' ? (
          <OrderTrackingView
            orders={orders}
            activeOrderNumber={activeOrderNumber}
            onSelectOrder={(num) => setActiveOrderNumber(num)}
            onAdvanceStage={handleAdvanceOrderStage}
            onReorder={handleReorder}
            onGetHelp={(orderNum) => {
              setSupportOrderRef(orderNum);
              setActiveNav('support');
              window.scrollTo({top: 0, behavior: 'smooth'});
            }}
            onBackToBrowse={() => handleNavSelect('restaurants')}
          />
        ) : activeNav === 'support' ? (
          <SupportView
            tickets={tickets}
            orders={orders}
            preselectedOrderNumber={supportOrderRef}
            onCreateTicket={handleCreateSupportTicket}
            onReplyTicket={handleReplySupportTicket}
          />
        ) : activeNav === 'profile' ? (
          <ProfileView
            profile={profile}
            areas={areas}
            vendors={vendors}
            promos={promos}
            orders={orders}
            onSaveProfile={handleSaveProfile}
            onSelectVendor={(vendor) => {
              setActiveVendorId(vendor.id);
              setActiveNav('restaurants');
              window.scrollTo({top: 0, behavior: 'smooth'});
            }}
            onToggleFavorite={handleToggleFavorite}
            onViewOrders={() => handleNavSelect('orders')}
          />
        ) : activeVendor && isCatalogView ? (
          <RestaurantMenuView
            vendor={activeVendor}
            selectedArea={selectedArea}
            cartItems={cartItems}
            cartVendorId={cartVendorId}
            isFavorite={profile.favoriteVendorIds.includes(activeVendor.id)}
            onToggleFavorite={handleToggleFavorite}
            onBack={() => setActiveVendorId(null)}
            onQuickAdd={(vendor, item) => handleAddToCart(vendor, item)}
            onCustomizeItem={(vendor, item) => setCustomizingTarget({vendor, item})}
            onUpdateQuantity={handleUpdateQuantity}
            onOpenCart={() => setIsCartOpen(true)}
          />
        ) : (
          <>
            <HeroSection
              areas={areas}
              selectedArea={selectedArea}
              onSelectArea={(id) => setSelectedAreaId(id)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSubmitSearch={() => {
                const el = document.getElementById('catalog-section');
                el?.scrollIntoView({behavior: 'smooth'});
              }}
              onQuickSwitchVertical={(v) => {
                setVertical(v);
                setSelectedCategory('All');
                setActiveNav(v === 'shop' ? 'shops' : 'restaurants');
                const el = document.getElementById('catalog-section');
                el?.scrollIntoView({behavior: 'smooth'});
              }}
            />

            <VendorGrid
              vendors={filteredVendors}
              selectedArea={selectedArea}
              vertical={vertical}
              onSelectVertical={(v) => {
                setVertical(v);
                setSelectedCategory('All');
              }}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              sortBy={sortBy}
              onSortChange={setSortBy}
              freeDeliveryOnly={freeDeliveryOnly}
              onToggleFreeDelivery={() => setFreeDeliveryOnly((v) => !v)}
              offersOnly={offersOnly}
              onToggleOffersOnly={() => setOffersOnly((v) => !v)}
              favoritesOnly={favoritesOnly}
              onToggleFavoritesOnly={() => setFavoritesOnly((v) => !v)}
              favoriteIds={profile.favoriteVendorIds}
              onToggleFavorite={handleToggleFavorite}
              searchQuery={searchQuery}
              onClearFilters={() => {
                setVertical('all');
                setSelectedCategory('All');
                setFreeDeliveryOnly(false);
                setOffersOnly(false);
                setFavoritesOnly(false);
                setSearchQuery('');
                setSortBy('recommended');
              }}
              onSelectVendor={(vendor) => {
                setActiveVendorId(vendor.id);
                window.scrollTo({top: 0, behavior: 'smooth'});
              }}
            />
          </>
        )}
      </main>

      <Footer onSelectCity={handleSelectCity} onSelectNav={handleNavSelect} />

      {customizingTarget && (
        <ItemCustomizationModal
          vendor={customizingTarget.vendor}
          item={customizingTarget.item}
          onClose={() => setCustomizingTarget(null)}
          onAddToCart={(item, selectedOptions, instructions, qty) =>
            handleAddToCart(
              customizingTarget.vendor,
              item,
              selectedOptions,
              instructions,
              qty
            )
          }
        />
      )}

      {pendingSwitch && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="switch-restaurant-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
          onClick={() => setPendingSwitch(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl border border-zinc-200 shadow-xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="switch-restaurant-title" className="font-display text-lg font-bold text-zinc-900">
              Start a new basket?
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Your basket currently contains items from{' '}
              <strong className="text-zinc-900">{cartVendor?.name}</strong>. Adding from{' '}
              <strong className="text-zinc-900">{pendingSwitch.vendor.name}</strong> will clear your current basket.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPendingSwitch(null)}
                className="px-4 py-2 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer"
              >
                Keep existing
              </button>
              <button
                type="button"
                onClick={() => commitAddition(pendingSwitch, true)}
                className="px-4 py-2 rounded-lg bg-[#FF5E1A] hover:bg-[#E54B0B] text-white text-sm font-semibold cursor-pointer"
              >
                Start fresh
              </button>
            </div>
          </div>
        </div>
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        vendor={cartVendor}
        cartItems={cartItems}
        selectedArea={selectedArea}
        profile={profile}
        promos={promos}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveLine={handleRemoveLine}
        onClearCart={() => setCartItems([])}
        onPlaceOrder={handlePlaceOrder}
      />

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#092332] text-white text-xs font-medium shadow-lg border border-white/10"
        >
          <Check className="w-4 h-4 text-[#FF5E1A]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
