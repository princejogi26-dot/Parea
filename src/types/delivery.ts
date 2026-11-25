export type CyprusCity =
  | 'Nicosia'
  | 'Limassol'
  | 'Larnaca'
  | 'Paphos'
  | 'Famagusta';

export interface CyprusArea {
  id: string;
  name: string;
  city: CyprusCity;
  etaBoostMinutes: number;
}

export type VendorVertical = 'all' | 'restaurant' | 'shop';

export type VendorCategory =
  | 'All'
  | 'Cypriot Grill & Mezze'
  | 'Bakery & Coffee'
  | 'Burgers & Street Food'
  | 'Sushi & Asian'
  | 'Pizza & Pasta'
  | 'Desserts & Crepes'
  | 'Supermarkets'
  | 'Periptero & Kiosk'
  | 'Pharmacy & Health'
  | 'Wine & Cellar'
  | 'Flowers & Gifts';

export type SortOption = 'recommended' | 'fastest' | 'rating' | 'lowest_fee';

export type PaymentMethod = 'cod' | 'card_on_delivery' | 'online_card' | 'wallet';

export type OrderStage = 'confirmed' | 'preparing' | 'on_the_way' | 'delivered';

export interface OptionChoice {
  id: string;
  label: string;
  priceDelta: number;
}

export interface MenuOptionGroup {
  id: string;
  title: string;
  required: boolean;
  maxSelect: number;
  choices: OptionChoice[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  priceEur: number;
  category: string;
  popular?: boolean;
  dietaryNote?: string;
  unitInfo?: string;
  optionGroups?: MenuOptionGroup[];
}

export interface Vendor {
  id: string;
  name: string;
  category: Exclude<VendorCategory, 'All'>;
  vertical: 'restaurant' | 'shop';
  image: string;
  rating: number;
  reviewCount: number;
  deliveryMinMinutes: number;
  deliveryMaxMinutes: number;
  deliveryFeeEur: number;
  freeDeliveryOverEur?: number;
  minOrderEur: number;
  offerText?: string;
  citiesServed: CyprusCity[];
  neighborhoodTag: string;
  isOpen24h?: boolean;
  items: MenuItem[];
}

export interface SelectedOption {
  groupId: string;
  groupTitle: string;
  choiceId: string;
  label: string;
  priceDelta: number;
}

export interface CartItem {
  cartLineId: string;
  vendorId: string;
  vendorName: string;
  itemId: string;
  name: string;
  unitBasePriceEur: number;
  selectedOptions: SelectedOption[];
  specialInstructions: string;
  quantity: number;
}

export interface SavedAddress {
  id: string;
  label: string;
  areaId: string;
  areaLabel: string;
  building: string;
  street: string;
  apartment: string;
  notes?: string;
  isDefault: boolean;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  preferredAreaId: string;
  defaultPayment: PaymentMethod;
  walletBalanceEur: number;
  favoriteVendorIds: string[];
  addresses: SavedAddress[];
}

export interface DeliveryAddress {
  areaId: string;
  areaLabel: string;
  building: string;
  street: string;
  apartment: string;
  phone: string;
  deliveryNote: string;
}

export interface OrderRecord {
  orderNumber: string;
  createdAtIso: string;
  vendorId: string;
  vendorName: string;
  vendorImage: string;
  vendorVertical: 'restaurant' | 'shop';
  items: CartItem[];
  subtotalEur: number;
  deliveryFeeEur: number;
  discountEur: number;
  serviceFeeEur: number;
  totalEur: number;
  promoCode?: string;
  paymentMethod: PaymentMethod;
  address: DeliveryAddress;
  stage: OrderStage;
  estimatedMinutes: string;
  courierName: string;
  courierPhone: string;
  courierVehicle: string;
}

export interface PromoOffer {
  code: string;
  title: string;
  description: string;
  type: 'percent' | 'fixed' | 'free_delivery';
  value: number;
  minOrderEur: number;
  maxDiscountEur?: number;
}

export interface SupportMessage {
  id: string;
  sender: 'customer' | 'agent';
  authorName: string;
  body: string;
  createdAtIso: string;
}

export interface SupportTicket {
  ticketId: string;
  topic: string;
  orderNumber?: string;
  status: 'open' | 'resolved';
  createdAtIso: string;
  updatedAtIso: string;
  messages: SupportMessage[];
}
