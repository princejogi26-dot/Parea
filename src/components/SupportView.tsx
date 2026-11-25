import {
  CheckCircle2,
  ChevronDown,
  Headphones,
  MessageSquare,
  Send,
} from 'lucide-react';
import {useState} from 'react';
import {SUPPORT_FAQS} from '../data/cyprusCatalog';
import {OrderRecord, SupportTicket} from '../types/delivery';

interface SupportViewProps {
  tickets: SupportTicket[];
  orders: OrderRecord[];
  preselectedOrderNumber?: string | null;
  onCreateTicket: (params: {
    topic: string;
    orderNumber?: string;
    message: string;
  }) => Promise<SupportTicket | null>;
  onReplyTicket: (ticketId: string, message: string, resolve?: boolean) => Promise<void>;
}

const SUPPORT_TOPICS = [
  'Order is delayed',
  'Missing or wrong item',
  'Promo code not applying',
  'Update delivery address',
  'Refund request',
  'Shop / Pharmacy inquiry',
];

export function SupportView({
  tickets,
  orders,
  preselectedOrderNumber,
  onCreateTicket,
  onReplyTicket,
}: SupportViewProps) {
  const [topic, setTopic] = useState(
    preselectedOrderNumber ? 'Order is delayed' : SUPPORT_TOPICS[0]
  );
  const [orderNumber, setOrderNumber] = useState(preselectedOrderNumber || '');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    tickets[0]?.ticketId || null
  );
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const activeTicket =
    tickets.find((t) => t.ticketId === selectedTicketId) || tickets[0] || null;

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please describe how our Cyprus support team can help.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const created = await onCreateTicket({
        topic,
        orderNumber: orderNumber || undefined,
        message: message.trim(),
      });
      setMessage('');
      if (created) {
        setSelectedTicketId(created.ticketId);
      }
    } catch {
      setError('Could not send your support request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;
    setSendingReply(true);
    try {
      await onReplyTicket(activeTicket.ticketId, replyText.trim(), false);
      setReplyText('');
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-10">
      <div className="bg-[#092332] text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div>
          <p className="text-xs font-medium text-amber-300 mb-1">
            Nicosia Support Desk · 24/7 Live Assistance
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">
            Customer Support
          </h1>
          <p className="text-sm text-slate-200 mt-1.5 max-w-2xl">
            Need help with a restaurant order, supermarket substitution, pharmacy item, or promo code? Message our local Cyprus care team directly.
          </p>
        </div>

        <div className="text-xs text-slate-200 bg-white/10 border border-white/15 rounded-xl px-5 py-3.5 tabular-nums shrink-0">
          <p className="font-semibold text-white inline-flex items-center gap-1.5">
            <Headphones className="w-4 h-4 text-[#FF5E1A]" />
            Cyprus Care Line: +357 22 009 410
          </p>
          <p className="text-slate-300 mt-0.5">Average response time under 3 minutes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-2xl p-6">
          <h2 className="font-display text-lg font-bold text-zinc-900 mb-4">
            Start a Support Request
          </h2>

          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div>
              <label htmlFor="support-topic" className="block text-xs font-medium text-zinc-700 mb-1.5">
                How can we help?
              </label>
              <select
                id="support-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 text-sm text-zinc-900 bg-white focus:border-[#FF5E1A] focus:outline-none cursor-pointer"
              >
                {SUPPORT_TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="support-order" className="block text-xs font-medium text-zinc-700 mb-1.5">
                Related Order (optional)
              </label>
              <select
                id="support-order"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 text-sm text-zinc-900 bg-white focus:border-[#FF5E1A] focus:outline-none cursor-pointer"
              >
                <option value="">General question (no specific order)</option>
                {orders.map((o) => (
                  <option key={o.orderNumber} value={o.orderNumber}>
                    #{o.orderNumber} · {o.vendorName} (€{o.totalEur.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="support-message" className="block text-xs font-medium text-zinc-700 mb-1.5">
                Message *
              </label>
              <textarea
                id="support-message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what happened so we can resolve it quickly..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#FF5E1A] focus:outline-none resize-none"
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-[#FF5E1A] hover:bg-[#E04F00] disabled:bg-zinc-300 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              {submitting ? 'Sending to Cyprus Support...' : 'Send Message'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 bg-stone-50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#FF5E1A]" />
              <h2 className="font-display text-base font-bold text-zinc-900">
                Your Support Conversations ({tickets.length})
              </h2>
            </div>

            {tickets.length > 1 && (
              <select
                aria-label="Select support ticket"
                value={activeTicket?.ticketId || ''}
                onChange={(e) => setSelectedTicketId(e.target.value)}
                className="text-xs font-medium text-zinc-900 border border-zinc-200 rounded-lg px-3 py-1.5 bg-white cursor-pointer"
              >
                {tickets.map((t) => (
                  <option key={t.ticketId} value={t.ticketId}>
                    {t.ticketId} · {t.topic} ({t.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          {!activeTicket ? (
            <div className="p-10 text-center text-sm text-zinc-600">
              No support tickets yet. Use the form on the left to message our team.
            </div>
          ) : (
            <div className="p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-100">
                <div>
                  <p className="text-xs text-zinc-500 tabular-nums">
                    {activeTicket.ticketId}
                    {activeTicket.orderNumber ? ` · Order #${activeTicket.orderNumber}` : ''}
                    <span aria-hidden="true"> · </span>
                    <span
                      className={
                        activeTicket.status === 'resolved'
                          ? 'text-emerald-700 font-semibold'
                          : 'text-[#FF5E1A] font-semibold'
                      }
                    >
                      {activeTicket.status === 'resolved' ? 'Resolved' : 'Open'}
                    </span>
                  </p>
                  <h3 className="font-semibold text-base text-zinc-900 mt-0.5">
                    {activeTicket.topic}
                  </h3>
                </div>

                {activeTicket.status === 'open' && (
                  <button
                    type="button"
                    onClick={() => onReplyTicket(activeTicket.ticketId, '', true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 hover:border-emerald-600 text-xs font-medium text-zinc-700 hover:text-emerald-700 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark resolved
                  </button>
                )}
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {activeTicket.messages.map((msg) => {
                  const isCustomer = msg.sender === 'customer';
                  return (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-xl border text-sm ${
                        isCustomer
                          ? 'bg-stone-50 border-zinc-200 ml-6'
                          : 'bg-[#FF5E1A]/5 border-[#FF5E1A]/20 mr-6'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs text-zinc-500 mb-1">
                        <span className="font-semibold text-zinc-800">{msg.authorName}</span>
                        <span className="tabular-nums">
                          {new Date(msg.createdAtIso).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-zinc-700 leading-relaxed">{msg.body}</p>
                    </div>
                  );
                })}
              </div>

              {activeTicket.status === 'open' && (
                <form onSubmit={handleSendReply} className="flex items-center gap-2 pt-2">
                  <label htmlFor="ticket-reply" className="sr-only">
                    Reply to ticket
                  </label>
                  <input
                    id="ticket-reply"
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a follow-up message..."
                    className="flex-1 px-3.5 py-2.5 rounded-lg border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#FF5E1A] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-[#FF5E1A] disabled:bg-zinc-300 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-stone-50 border border-zinc-200 rounded-2xl p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-zinc-900 mb-4">
          Frequently Asked Questions
        </h2>
        <div className="divide-y divide-zinc-200">
          {SUPPORT_FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={faq.q} className="py-3.5">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 text-left font-medium text-sm text-zinc-900 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-500 transition-transform shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="text-sm text-zinc-600 leading-relaxed mt-2 pr-6">{faq.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
