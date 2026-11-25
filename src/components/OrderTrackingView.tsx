import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Headphones,
  MapPin,
  Phone,
  RefreshCw,
  Truck,
} from 'lucide-react';
import {OrderRecord, OrderStage} from '../types/delivery';
import {ResilientImage} from './ResilientImage';

interface OrderTrackingViewProps {
  orders: OrderRecord[];
  activeOrderNumber: string | null;
  onSelectOrder: (orderNumber: string) => void;
  onAdvanceStage: (orderNumber: string) => void;
  onReorder: (order: OrderRecord) => void;
  onGetHelp: (orderNumber: string) => void;
  onBackToBrowse: () => void;
}

const STAGES: {id: OrderStage; label: string; detail: string}[] = [
  {id: 'confirmed', label: 'Order Confirmed', detail: 'Venue received your order'},
  {id: 'preparing', label: 'Preparing Order', detail: 'Items are freshly packed'},
  {id: 'on_the_way', label: 'Courier on the Way', detail: 'Heading to your Cyprus address'},
  {id: 'delivered', label: 'Delivered', detail: 'Completed — thank you for ordering'},
];

export function OrderTrackingView({
  orders,
  activeOrderNumber,
  onSelectOrder,
  onAdvanceStage,
  onReorder,
  onGetHelp,
  onBackToBrowse,
}: OrderTrackingViewProps) {
  const currentOrder =
    orders.find((o) => o.orderNumber === activeOrderNumber) || orders[0] || null;

  const paymentLabel = (method: OrderRecord['paymentMethod']) => {
    if (method === 'cod') return 'Cash on Delivery';
    if (method === 'card_on_delivery') return 'Card on Delivery';
    if (method === 'wallet') return 'Parea Wallet';
    return 'Paid Online';
  };

  if (!currentOrder) {
    return (
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Truck className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
        <h1 className="font-display text-2xl font-bold text-zinc-900 mb-2">
          No orders placed yet
        </h1>
        <p className="text-sm text-zinc-600 mb-6 max-w-md mx-auto">
          Place an order from any Cyprus restaurant, supermarket, periptero, or pharmacy to follow live courier tracking here.
        </p>
        <button
          type="button"
          onClick={onBackToBrowse}
          className="px-5 py-2.5 rounded-lg bg-[#FF5E1A] hover:bg-[#E04F00] text-white text-sm font-semibold cursor-pointer"
        >
          Browse Cyprus venues
        </button>
      </section>
    );
  }

  const stageIndex = STAGES.findIndex((s) => s.id === currentOrder.stage);

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          type="button"
          onClick={onBackToBrowse}
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cyprus venues
        </button>

        {orders.length > 1 && (
          <div className="flex items-center gap-2">
            <label htmlFor="order-history-select" className="text-xs font-medium text-zinc-500">
              Order history:
            </label>
            <select
              id="order-history-select"
              value={currentOrder.orderNumber}
              onChange={(e) => onSelectOrder(e.target.value)}
              className="text-xs font-semibold text-zinc-900 border border-zinc-200 rounded-lg px-3 py-1.5 bg-white cursor-pointer"
            >
              {orders.map((o) => (
                <option key={o.orderNumber} value={o.orderNumber}>
                  #{o.orderNumber} · {o.vendorName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 sm:p-8 border-b border-white/10 bg-[#092332] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-amber-300 tabular-nums">
              Order #{currentOrder.orderNumber} · {currentOrder.address.areaLabel}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
              {STAGES[stageIndex]?.label}
            </h1>
            <p className="text-sm text-slate-200 mt-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#FF5E1A]" />
              {currentOrder.stage === 'delivered'
                ? 'Delivered to your doorstep'
                : `Estimated arrival: ${currentOrder.estimatedMinutes}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {currentOrder.stage !== 'delivered' && (
              <button
                type="button"
                onClick={() => onAdvanceStage(currentOrder.orderNumber)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Advance step
              </button>
            )}
            <button
              type="button"
              onClick={() => onGetHelp(currentOrder.orderNumber)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <Headphones className="w-3.5 h-3.5" />
              Need help
            </button>
            <button
              type="button"
              onClick={() => onReorder(currentOrder)}
              className="px-4 py-2.5 rounded-lg bg-[#FF5E1A] hover:bg-[#E54B0B] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Order again
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 border-b border-zinc-200">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {STAGES.map((stage, idx) => {
              const completed = idx <= stageIndex;
              const current = idx === stageIndex;
              return (
                <div
                  key={stage.id}
                  className={`p-4 rounded-xl border transition-colors ${
                    current
                      ? 'border-[#FF5E1A] bg-[#FF5E1A]/5'
                      : completed
                        ? 'border-zinc-200 bg-stone-50'
                        : 'border-zinc-100 bg-white opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-zinc-500 tabular-nums">
                      0{idx + 1}
                    </span>
                    {completed && (
                      <CheckCircle2
                        className={`w-4 h-4 ${current ? 'text-[#FF5E1A]' : 'text-emerald-600'}`}
                      />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-zinc-900">{stage.label}</p>
                  <p className="text-xs text-zinc-500 mt-1">{stage.detail}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-7 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                <ResilientImage
                  src={currentOrder.vendorImage}
                  alt={currentOrder.vendorName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-zinc-900">
                  {currentOrder.vendorName}
                </h2>
                <p className="text-xs text-zinc-500 tabular-nums">
                  {currentOrder.items.reduce((s, i) => s + i.quantity, 0)} items ·{' '}
                  {paymentLabel(currentOrder.paymentMethod)}
                </p>
              </div>
            </div>

            <div className="divide-y divide-zinc-100 border-t border-b border-zinc-200">
              {currentOrder.items.map((line) => {
                const lineUnit =
                  line.unitBasePriceEur +
                  line.selectedOptions.reduce((s, o) => s + o.priceDelta, 0);
                return (
                  <div key={line.cartLineId} className="py-3 flex justify-between gap-4 text-sm">
                    <div>
                      <p className="font-medium text-zinc-900">
                        <span className="tabular-nums font-semibold">{line.quantity}×</span>{' '}
                        {line.name}
                      </p>
                      {line.selectedOptions.length > 0 && (
                        <p className="text-xs text-zinc-500">
                          {line.selectedOptions.map((o) => o.label).join(', ')}
                        </p>
                      )}
                    </div>
                    <span className="font-medium text-zinc-900 tabular-nums shrink-0">
                      €{(lineUnit * line.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-1.5 text-sm tabular-nums">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span>€{currentOrder.subtotalEur.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Delivery fee</span>
                <span>
                  {currentOrder.deliveryFeeEur === 0
                    ? 'Free'
                    : `€${currentOrder.deliveryFeeEur.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Service fee</span>
                <span>€{currentOrder.serviceFeeEur.toFixed(2)}</span>
              </div>
              {currentOrder.discountEur > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Promo ({currentOrder.promoCode})</span>
                  <span>-€{currentOrder.discountEur.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-zinc-200 flex justify-between font-bold text-zinc-900">
                <span>Total</span>
                <span>€{currentOrder.totalEur.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 space-y-4">
            <div className="border border-zinc-200 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF5E1A]" />
                Delivery Details
              </h3>
              <p className="text-sm text-zinc-700 leading-relaxed">
                {currentOrder.address.building}
                {currentOrder.address.apartment ? `, ${currentOrder.address.apartment}` : ''}
                <br />
                {currentOrder.address.street}, {currentOrder.address.areaLabel}
              </p>
              <p className="text-xs text-zinc-500 tabular-nums">{currentOrder.address.phone}</p>
              {currentOrder.address.deliveryNote && (
                <p className="text-xs text-zinc-600 pt-2 border-t border-zinc-100">
                  Note: {currentOrder.address.deliveryNote}
                </p>
              )}
            </div>

            <div className="border border-zinc-200 rounded-xl p-5 space-y-2">
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#FF5E1A]" />
                Assigned Cyprus Courier
              </h3>
              <p className="text-sm font-medium text-zinc-900">{currentOrder.courierName}</p>
              <p className="text-xs text-zinc-500">{currentOrder.courierVehicle}</p>
              <p className="text-xs text-zinc-700 inline-flex items-center gap-1.5 pt-1 tabular-nums">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                {currentOrder.courierPhone}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
