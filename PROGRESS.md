## Session 3 — Apr 22, 2026
### Completed
- Supabase setup (London region)
- Database schema — profiles, inventories, items
- Row Level Security policies
- TypeScript database types
- Auth screens — sign up, sign in
- Session management via AuthProvider
- Full auth flow working end to end
- 4 PRs merged into development

### Next session
- Connect dashboard to real Supabase data
- Add logout button
- Build add item screen
- Start bottom tab navigation

### Branches merged
- feature/project-setup-v2
- feature/welcome-screen  
- feature/supabase-setup
- feature/auth-screens

## Session 4 — Apr 23, 2026
### Completed
- Bottom tab navigation (Home, Inventory, Scan, Compare)
- Responsive tab bar using useWindowDimensions
- SafeAreaProvider setup
- Placeholder screens for Inventory, Scan, Compare

### Next session
- Connect dashboard to real Supabase data
- Add logout button
- Build add item screen
- Replace hardcoded dashboard data with real queries

### Current branch
- feature/navigation-and-real-data (in progress, not merged yet)

## Product Backlog

### Shopping List
- Auto-populate from low stock alerts
- Manual add extra items
- Tick off items at the shop
- Auto-restock ticked items

### Consumption Tracking
- Estimated depletion engine (set usage rate per item)
- Quick status update UI — Full / Half / Low / Empty
- Receipt scanning (Phase 2)

### Post-Purchase Reconciliation
- After shopping, check missed items
- Alert user about unpurchased low stock items

## Session 4 — Apr 23, 2026
### Completed
- Bottom tab navigation (Home, Inventory, Scan, Compare)
- Responsive tab bar using useWindowDimensions
- SafeAreaProvider setup
- useInventory custom hook with real Supabase queries
- Dashboard connected to real data
- Skeleton loading screen
- Empty state when no items
- signOut added to AuthProvider
- Action sheet on avatar tap

### In Progress
- Sign out redirect broken — route ambiguity between
  app/index.tsx and app/(tabs)/index.tsx
- Fix: rename app/index.tsx to app/welcome.tsx
  and update all route references

### Next session
- Fix sign out redirect
- Build add item screen
- Test full flow — add item → appears on dashboard

### Current branch
- feature/navigation-and-real-data (not merged yet)