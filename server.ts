import express from 'express';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {
  CYPRUS_AREAS,
  CYPRUS_PROMOS,
  CYPRUS_VENDORS,
  DEFAULT_USER_PROFILE,
} from './src/data/cyprusCatalog.ts';
import type {
  OrderRecord,
  OrderStage,
  SupportTicket,
  UserProfile,
} from './src/types/delivery.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

interface StoreState {
  profile: UserProfile;
  orders: OrderRecord[];
  tickets: SupportTicket[];
}

const STAGE_SEQUENCE: OrderStage[] = ['confirmed', 'preparing', 'on_the_way', 'delivered'];

function getInitialStore(): StoreState {
  return {
    profile: DEFAULT_USER_PROFILE,
    orders: [],
    tickets: [
      {
        ticketId: 'SUP-4019',
        topic: 'Delivery coverage & hours',
        status: 'resolved',
        createdAtIso: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAtIso: new Date(Date.now() - 86400000 * 2).toISOString(),
        messages: [
          {
            id: 'msg-1',
            sender: 'customer',
            authorName: 'Andreas Georgiou',
            body: 'Do Periptero 24/7 kiosks deliver late at night in Limassol Marina?',
            createdAtIso: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
          {
            id: 'msg-2',
            sender: 'agent',
            authorName: 'Elena · Parea Cyprus Support',
            body: 'Yes! Periptero 24/7 Kiosk and Pandora Bakery Café deliver 24 hours a day across Limassol Marina, Engomi, Finikoudes, Kato Paphos, and Ayia Napa.',
            createdAtIso: new Date(Date.now() - 86400000 * 2 + 120000).toISOString(),
          },
        ],
      },
    ],
  };
}

function readStore(): StoreState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, {recursive: true});
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialStore();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as StoreState;
  } catch {
    return getInitialStore();
  }
}

function writeStore(next: StoreState): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, {recursive: true});
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(next, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist store:', err);
  }
}

function buildAgentAutoReply(topic: string, orderNumber?: string): string {
  const ref = orderNumber ? ` for order #${orderNumber}` : '';
  switch (topic) {
    case 'Order is delayed':
      return `Thank you for reaching out${ref}. I have pinged the Cyprus dispatch hub and asked the courier for a priority update. If your delivery arrives more than 15 minutes late, a €3.00 credit will be added to your Parea Wallet automatically.`;
    case 'Missing or wrong item':
      return `We are sorry about the missing or incorrect item${ref}. Our Nicosia support team has logged this for immediate verification and will issue an instant refund or wallet credit for the affected item.`;
    case 'Promo code not applying':
      return `Please double-check the minimum order threshold (for example, CYPRUS20 requires €20+ and HALLOUMI5 requires €25+). You can also apply WELCOME15 with zero minimum spend!`;
    case 'Update delivery address':
      return `Got it! We have forwarded your updated building/street notes${ref} directly to your assigned rider.`;
    case 'Refund request':
      return `Your refund inquiry${ref} has been received. Approved card refunds settle within 2–3 business days, while Parea Wallet credits appear immediately.`;
    default:
      return `Thanks for contacting Parea Cyprus Support${ref}. A local support specialist in Nicosia has picked up your request and will follow up shortly.`;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ok: true});
  });

  app.get('/api/bootstrap', (_req, res) => {
    const store = readStore();
    res.json({
      areas: CYPRUS_AREAS,
      vendors: CYPRUS_VENDORS,
      promos: CYPRUS_PROMOS,
      profile: store.profile,
      orders: store.orders,
      tickets: store.tickets,
    });
  });

  app.get('/api/vendors', (req, res) => {
    const city = typeof req.query.city === 'string' ? req.query.city : '';
    const vertical = typeof req.query.vertical === 'string' ? req.query.vertical : 'all';
    const filtered = CYPRUS_VENDORS.filter((v) => {
      if (city && !v.citiesServed.includes(city as never)) return false;
      if (vertical !== 'all' && v.vertical !== vertical) return false;
      return true;
    });
    res.json({vendors: filtered});
  });

  app.post('/api/promos/validate', (req, res) => {
    const code = String(req.body?.code || '').trim().toUpperCase();
    const subtotalEur = Number(req.body?.subtotalEur || 0);
    const promo = CYPRUS_PROMOS.find((p) => p.code === code);
    if (!promo) {
      res.status(404).json({valid: false, error: 'Promo code not found. Try CYPRUS20, FREEDEL, HALLOUMI5, or WELCOME15.'});
      return;
    }
    if (subtotalEur < promo.minOrderEur) {
      res.status(400).json({
        valid: false,
        error: `${promo.code} requires a minimum subtotal of €${promo.minOrderEur.toFixed(2)}.`,
      });
      return;
    }
    res.json({valid: true, promo});
  });

  app.put('/api/profile', (req, res) => {
    const store = readStore();
    const incoming = req.body as Partial<UserProfile>;
    store.profile = {
      ...store.profile,
      ...incoming,
      addresses: Array.isArray(incoming.addresses) ? incoming.addresses : store.profile.addresses,
      favoriteVendorIds: Array.isArray(incoming.favoriteVendorIds)
        ? incoming.favoriteVendorIds
        : store.profile.favoriteVendorIds,
    };
    writeStore(store);
    res.json({profile: store.profile});
  });

  app.post('/api/orders', (req, res) => {
    const store = readStore();
    const payload = req.body as Omit<OrderRecord, 'orderNumber' | 'createdAtIso' | 'stage'>;
    if (!payload || !Array.isArray(payload.items) || payload.items.length === 0) {
      res.status(400).json({error: 'Order must include at least one item.'});
      return;
    }

    if (payload.paymentMethod === 'wallet') {
      if (store.profile.walletBalanceEur < payload.totalEur) {
        res.status(400).json({error: 'Insufficient Parea Wallet balance.'});
        return;
      }
      store.profile.walletBalanceEur = Number(
        (store.profile.walletBalanceEur - payload.totalEur).toFixed(2)
      );
    }

    const orderNumber = `CYP-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: OrderRecord = {
      ...payload,
      orderNumber,
      createdAtIso: new Date().toISOString(),
      stage: 'confirmed',
    };

    store.orders = [newOrder, ...store.orders];
    writeStore(store);
    res.status(201).json({order: newOrder, profile: store.profile});
  });

  app.post('/api/orders/:orderNumber/advance', (req, res) => {
    const store = readStore();
    const {orderNumber} = req.params;
    let updatedOrder: OrderRecord | null = null;
    store.orders = store.orders.map((order) => {
      if (order.orderNumber !== orderNumber) return order;
      const idx = STAGE_SEQUENCE.indexOf(order.stage);
      const nextStage = STAGE_SEQUENCE[Math.min(STAGE_SEQUENCE.length - 1, idx + 1)];
      updatedOrder = {...order, stage: nextStage};
      return updatedOrder;
    });
    if (!updatedOrder) {
      res.status(404).json({error: 'Order not found'});
      return;
    }
    writeStore(store);
    res.json({order: updatedOrder});
  });

  app.post('/api/support', (req, res) => {
    const store = readStore();
    const topic = String(req.body?.topic || 'General inquiry').trim();
    const message = String(req.body?.message || '').trim();
    const orderNumber = req.body?.orderNumber ? String(req.body.orderNumber).trim() : undefined;

    if (!message) {
      res.status(400).json({error: 'Please enter a message for support.'});
      return;
    }

    const now = new Date().toISOString();
    const ticket: SupportTicket = {
      ticketId: `SUP-${Math.floor(1000 + Math.random() * 9000)}`,
      topic,
      orderNumber: orderNumber || undefined,
      status: 'open',
      createdAtIso: now,
      updatedAtIso: now,
      messages: [
        {
          id: `msg-${Date.now()}-c`,
          sender: 'customer',
          authorName: store.profile.fullName || 'Customer',
          body: message,
          createdAtIso: now,
        },
        {
          id: `msg-${Date.now()}-a`,
          sender: 'agent',
          authorName: 'Elena · Parea Cyprus Support',
          body: buildAgentAutoReply(topic, orderNumber),
          createdAtIso: new Date(Date.now() + 1000).toISOString(),
        },
      ],
    };

    store.tickets = [ticket, ...store.tickets];
    writeStore(store);
    res.status(201).json({ticket});
  });

  app.post('/api/support/:ticketId/reply', (req, res) => {
    const store = readStore();
    const {ticketId} = req.params;
    const message = String(req.body?.message || '').trim();
    const resolve = Boolean(req.body?.resolve);

    let updated: SupportTicket | null = null;
    store.tickets = store.tickets.map((t) => {
      if (t.ticketId !== ticketId) return t;
      const now = new Date().toISOString();
      const messages = [...t.messages];
      if (message) {
        messages.push({
          id: `msg-${Date.now()}-c`,
          sender: 'customer',
          authorName: store.profile.fullName || 'Customer',
          body: message,
          createdAtIso: now,
        });
        if (!resolve) {
          messages.push({
            id: `msg-${Date.now()}-a`,
            sender: 'agent',
            authorName: 'Elena · Parea Cyprus Support',
            body: 'Received — we have added your note to this case and are handling it now.',
            createdAtIso: new Date(Date.now() + 500).toISOString(),
          });
        }
      }
      updated = {
        ...t,
        status: resolve ? 'resolved' : t.status,
        updatedAtIso: now,
        messages,
      };
      return updated;
    });

    if (!updated) {
      res.status(404).json({error: 'Ticket not found'});
      return;
    }
    writeStore(store);
    res.json({ticket: updated});
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const {createServer: createViteServer} = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Parea Cyprus server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
