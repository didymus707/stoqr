# StoQr 📦

> Your intelligent inventory assistant — track what you have, get alerted when you're running low, and find the best prices near you.

## The Problem

Most people manage their home inventory with paper lists, mental notes, or not at all. They run out of milk mid-week, forget to buy washing powder, or overspend because they don't know which store is cheapest.

StoQr fixes that.

## Features

- **Inventory tracking** — add and manage household items with quantities and units
- **Smart alerts** — get notified when stock hits your low threshold
- **Quick updates** — tap − or + to update quantities instantly
- **Shopping list** — low stock items appear automatically, add extras manually
- **Price comparison** — see which local store has the cheapest prices, powered by community data
- **Receipt-aware** — manual items on your shopping list can be converted to inventory in one tap

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React Native + Expo (iOS, Android, Web) |
| Navigation | Expo Router (file-based) |
| Backend | Supabase (PostgreSQL + Auth) |
| Language | TypeScript |
| State | React Context + Custom Hooks |
| Notifications | Expo Notifications (local) |

## Architecture Highlights

- **Multi-tenancy from day one** — data model supports individual users and future business accounts
- **Row Level Security** — database-level security policies ensure users only ever access their own data
- **Optimistic UI updates** — quantity changes feel instant; database syncs in the background
- **Crowdsourced pricing** — price comparison aggregates data from all users, improving over time

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- Supabase account

### Installation

```bash
git clone https://github.com/didymus707/stoqr.git
cd stoqr
npm install
```

### Environment Setup

Create a `.env` file in the root:
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

### Database Setup

Run the SQL migrations in `/supabase/migrations` against your Supabase project.

### Run

```bash
npx expo start
```

Press `w` for web, scan QR for iOS/Android via Expo Go.

## Project Structure

stoqr/
├── app/                  # Screens (Expo Router file-based routing)
│   ├── (tabs)/           # Tab navigator screens
│   ├── add-item.tsx      # Add inventory item
│   ├── edit-item.tsx     # Edit inventory item
│   ├── sign-in.tsx       # Authentication
│   ├── sign-up.tsx       # Authentication
│   └── profile.tsx       # User profile
├── components/           # Reusable UI components
├── constants/            # Theme (colours, spacing, typography)
├── hooks/                # Custom React hooks
│   ├── useInventory.ts   # Inventory data + operations
│   └── useShoppingList.ts # Shopping list logic
├── lib/                  # Third party setup
│   ├── supabase.ts       # Supabase client
│   └── notifications.ts  # Push notification helpers
├── stores/               # Global state
│   └── auth.tsx          # Auth context + session management
└── types/                # TypeScript interfaces
└── database.ts       # Database type definitions

## Roadmap

- [ ] Receipt scanning (OCR)
- [ ] Consumption rate prediction
- [ ] Multiple inventories per user
- [ ] Business tier (multi-location, team roles)
- [ ] Android push notifications (development build)
- [ ] Siri / Google Assistant integration

## Contributing

This project is in active development. Issues and PRs welcome.

## License

MIT