# YoYoz Merch App - Developer Guide

A modern e-commerce merchandise store for "Boogie & The Yo-Yoz" built with React, Vite, and Base44 backend integration.

## Project Overview

**Purpose**: Official merch store for the band "Boogie & The Yo-Yoz" with product customization, shopping cart, checkout, and order management.

**Key Technologies**:
- **Frontend**: React 18, Vite 6, React Router v6
- **UI Framework**: Radix UI components + Tailwind CSS
- **Backend Integration**: Base44 SDK (headless backend-as-a-service)
- **Payments**: Stripe integration
- **Database**: Supabase for user authentication
- **Data Fetching**: TanStack React Query v5
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS v3 with custom theme variables

## Directory Structure

```
src/
├── pages/                    # Page components (auto-registered)
│   ├── Home.jsx             # Landing page with featured products
│   ├── Shop.jsx             # Product listing with filters (gender, category, style)
│   ├── ProductDetail.jsx    # Individual product detail & customization
│   ├── Checkout.jsx         # Stripe checkout flow
│   ├── Orders.jsx           # User order history
│   ├── Notifications.jsx    # Alert/notification center
│   └── QRTools.jsx          # Admin QR code management tool
├── components/
│   ├── ui/                  # Shadcn/Radix UI component library
│   └── store/               # Feature-specific components
│       ├── CartDrawer.jsx
│       ├── ProductCard.jsx
│       ├── CustomMockupModal.jsx
│       └── [other store components]
├── lib/                     # Core utilities & configuration
│   ├── AuthContext.jsx      # Authentication & user state
│   ├── supabase.js         # Supabase client initialization
│   ├── shopifyClient.js    # Shopify integration
│   ├── stripe.js           # Stripe client setup
│   ├── app-params.js       # App configuration parameters
│   ├── query-client.js     # React Query instance
│   ├── utils.js            # General utilities
│   └── NavigationTracker.jsx
├── api/
│   └── base44Client.js     # Base44 SDK client wrapper
├── utils/                  # Utility functions and helpers
├── hooks/                  # Custom React hooks
├── assets/                 # Images, icons, static assets
├── App.jsx                 # Root component with routing
├── Layout.jsx              # Main layout wrapper (nav, footer, sidebars)
└── main.jsx                # React DOM entry point
```

## Key Concepts & Patterns

### 1. Page Routing System
- **Auto-registration**: Pages in `src/pages/` are automatically registered via `pages.config.js` (auto-generated, don't edit)
- **Configuration**: Edit only `mainPage` in `pages.config.js` to change the landing page
- **Current Landing Page**: "Home" (change via `pages.config.js` if needed)
- **Navigation**: Use `createPageUrl()` utility to generate page links (handles routing internally)

### 2. Authentication & Authorization
- **Provider**: `AuthContext.jsx` in `lib/` wraps the entire app
- **User State**: Access via `const { user, isLoadingAuth, authError, navigateToLogin } = useAuth()`
- **Admin Access**: Check `user?.role === "admin"` for admin features (e.g., QR Tools page)
- **Protected Pages**: QRTools page is only visible to admin users
- **Error Handling**: 
  - `user_not_registered`: Shows UserNotRegisteredError component
  - `auth_required`: Auto-redirects to login

### 3. Data Fetching & Caching
- **TanStack React Query**: All server data uses React Query for caching and synchronization
- **Query Keys**: Follow pattern `queryKey: ["entity-type", optional-filters]`
  - Examples: `["me"]`, `["cart-items"]`, `["products"]`, `["orders"]`
- **Refetch Events**: Custom event `window.dispatchEvent(new Event("cart-updated"))` triggers React Query refetch
- **Client Setup**: `lib/query-client.js` exports `queryClientInstance` for QueryClientProvider

### 4. Base44 Backend Integration
- **Client**: `api/base44Client.js` exports `base44` object
- **Usage**: 
  ```javascript
  import { base44 } from '@/api/base44Client';
  
  // Authentication
  const user = await base44.auth.me();
  
  // Entity operations
  const cartItems = await base44.entities.CartItem.list();
  await base44.entities.CartItem.update(id, { quantity });
  await base44.entities.CartItem.delete(id);
  
  // Custom entities available: CartItem, Product, Order, etc.
  ```
- **App Configuration**: `lib/app-params.js` contains app-specific settings from Base44

### 5. Cart Management
- **State**: Stored in Base44 via CartItem entities
- **Sync**: `useQuery` in Layout fetches cart items from Base44
- **Updates**: Dispatch `"cart-updated"` event to trigger refetch across app
- **Component**: CartDrawer slides in from right side, shows cart contents and checkout button

### 6. Product Customization
- **Custom Mockup Modal**: Located in `components/store/CustomMockupModal.jsx`
- **Available Products**: Mix of standard products and custom customizer items (Tumblers, Koozies, etc.)
- **Design Overlays**: Mockup previews show design placement options
- **Product ID Patterns**: 
  - Database products: `"4"`, `"5"`, `"6"`, etc. (integers)
  - Custom products: `"mock-*-1"` (string IDs for customizer items)

### 7. Styling & Theme
- **CSS Framework**: Tailwind CSS v3 with custom variables
- **Color Scheme**: Dark theme (black background) with red accents (#FF0000, #DC2743, etc.)
- **Theme Variables**: Defined in `Layout.jsx` `<style>` tag (dark mode only)
  - `--background`, `--foreground`, `--card`, `--primary`, etc.
- **Customization**: Tailwind config uses CSS variables for semantic colors
- **Component Library**: Shadcn UI components with Radix primitives

### 8. Form Handling
- **Library**: React Hook Form with Zod schema validation
- **Pattern**: 
  ```javascript
  import { useForm } from "react-hook-form";
  import { zodResolver } from "@hookform/resolvers/zod";
  import * as z from "zod";
  
  const schema = z.object({ /* validation rules */ });
  const form = useForm({ resolver: zodResolver(schema) });
  ```

### 9. Component Architecture
- **UI Components**: Located in `src/components/ui/` (Shadcn components)
  - Fully styled, accessible Radix primitives
  - CSS-in-JS via Tailwind
  - No external dependencies in component implementation
- **Feature Components**: In `src/components/store/`
  - ProductCard, CartDrawer, CustomMockupModal, etc.
  - Compose UI components with app logic
- **Props Pattern**: Minimal prop drilling, prefer context for global state

### 10. Layout Structure
- **Header**: Fixed top nav with logo, menu toggle, cart button
- **Main Content**: Flex layout with content area + optional sidebar
- **Sidebar** (Desktop only): 
  - Logo display
  - Social links (TikTok, Facebook, Instagram, YouTube)
  - Concert QR code card
  - Custom mockup preview
- **Footer**: Social links, band info, copyright
- **Mobile Bottom Nav**: Fixed nav bar with icon shortcuts
- **Checkout Exception**: Checkout page renders without layout wrapper (full-width view)

## Development Workflow

### Setup & Running
```bash
# Install dependencies
npm install

# Create .env.local with:
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality
```bash
# Run ESLint (checks pages and components only)
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Type checking (JSDoc/checkJs enabled)
npm run typecheck
```

### ESLint Configuration
- **Scope**: Only `src/pages/**/*.{js,jsx}`, `src/components/**/*.{js,jsx}`, `src/Layout.jsx`
- **Ignored**: `src/lib/**/*` and `src/components/ui/**/*` (library code)
- **Rules**:
  - Unused imports must be removed (`unused-imports/no-unused-imports`)
  - React hooks usage validated
  - Unused variables warned (with `_` prefix exceptions)
  - No prop-types or react-in-jsx-scope required

### Git & Deployment
- **Branch**: Develop on `claude/claude-md-docs-4j58f2` (feature branch)
- **Commits**: Write clear, descriptive messages
- **Push**: `git push -u origin <branch-name>`
- **Deployment**: Base44 auto-syncs changes on GitHub push to production

### Testing
- **Test Framework**: Not currently set up (consider adding if tests are needed)
- **Manual Testing**: Test features in browser via `npm run dev`
- **Critical Flows**: Home → Shop → ProductDetail → Checkout → Orders

## Common Tasks

### Adding a New Page
1. Create file in `src/pages/YourPage.jsx`
2. Export default React component
3. Auto-registers in `pages.config.js`
4. Set as main page by editing `mainPage` in `pages.config.js` if desired
5. Navigate via `<Link to={createPageUrl("YourPage")}>`

### Adding a New Route Filter
- **Location**: `Layout.jsx` `applyNavigationFilter()` function
- **Parameters**: `(gender, category, style)` → constructs Shop page query params
- **Example**: `applyNavigationFilter("men", "Hoodies", "half-zip")` → Shop with filters applied

### Updating Styling
1. **Tailwind**: Use existing utility classes in JSX
2. **Custom Colors**: Add to `tailwind.config.js` under `theme.extend.colors`
3. **Dark Mode**: Configured via `darkMode: ["class"]` in Tailwind config
4. **CSS Variables**: Add to `Layout.jsx` `:root` styles for dynamic theming

### Integrating with Base44
- **Entities**: Access via `base44.entities.<EntityName>.<method>()`
- **Available Methods**: `.list()`, `.get(id)`, `.create(data)`, `.update(id, data)`, `.delete(id)`
- **Querying**: Use React Query hooks for data fetching
- **Real-time Updates**: Dispatch window events to trigger refetches

### Adding a New Component
1. Create in `src/components/store/ComponentName.jsx` (feature) or `src/components/ui/` (reusable)
2. Use Tailwind for styling
3. Import Lucide icons via `lucide-react`
4. Prefer functional components with hooks
5. Keep props focused, use context for app-wide state

## Important Files Reference

| File | Purpose |
|------|---------|
| `src/App.jsx` | Root component, routing setup, provider configuration |
| `src/Layout.jsx` | Main layout wrapper with nav, footer, sidebar, cart drawer |
| `src/lib/AuthContext.jsx` | Authentication state and user management |
| `src/lib/supabase.js` | Supabase client for auth and data |
| `src/lib/query-client.js` | React Query configuration |
| `src/api/base44Client.js` | Base44 SDK client |
| `src/pages.config.js` | Auto-generated page routing (edit mainPage only) |
| `tailwind.config.js` | Tailwind theme customization |
| `vite.config.js` | Vite build configuration with Base44 plugin |
| `package.json` | Dependencies and build scripts |

## Environment Variables

Create `.env.local` in project root:

```env
VITE_BASE44_APP_ID=<your_base44_app_id>
VITE_BASE44_APP_BASE_URL=<your_base44_backend_url>
# Example:
# VITE_BASE44_APP_ID=cbef744a8545c389ef439ea6
# VITE_BASE44_APP_BASE_URL=https://my-to-do-list-81bfaad7.base44.app
```

## Product Catalog

Current merchandise inventory (see README.md for full table):

**Standard Products** (Database):
- Boogie Classic Logo Tee ($25)
- Yo-Yoz World Tour Hoodie ($55)
- BoogieMan Neon Concert Tee ($30)
- Yo-Yoz Retro Trucker Hat ($20)
- Boogie Sticker Pack ($8)
- Various Hoodies and Accessories

**Custom Customizer Items** (Mock IDs):
- Custom Concert Can Koozie ($10)
- Custom Engraved Steel Tumblers ($35-38)
- Yo-Yoz Thermo Sports Bottle ($30)
- Custom Insulated Wine Tumbler ($28)
- Various other customizable items

Categories: Shirts, Hoodies, Accessories, Stickers, Koozies, Steel Tumblers
Target Gender: Unisex, Men, Women
Styles: Normal, Half-Zip, 3/4-Zip, Custom

## Troubleshooting

**Cart not updating after item add/remove**:
- Dispatch `cart-updated` event: `window.dispatchEvent(new Event("cart-updated"))`
- Check React Query cache is invalidated

**Page not loading**:
- Verify page component exported in `src/pages/`
- Check `pages.config.js` has page registered
- Check route in `App.jsx` matches page name

**Auth errors**:
- Verify Supabase credentials in `.env.local`
- Check `AuthContext.jsx` for error type handling
- User may need to be registered in Supabase

**Styling not applying**:
- Ensure class name is in Tailwind `content` array
- Check dark mode class is applied to root element (Layout sets it)
- Verify custom colors defined in `tailwind.config.js`

**Base44 API errors**:
- Check `VITE_BASE44_APP_ID` and `VITE_BASE44_APP_BASE_URL` in `.env.local`
- Verify app is published on Base44.com
- Check entity names match Base44 schema

## Performance & Optimization Tips

- **Image Optimization**: Use WebP format, lazy load with `loading="lazy"` attribute
- **Bundle Size**: Monitor Vite build output with `npm run build`
- **React Query**: Leverage caching, avoid unnecessary refetches
- **Component Memoization**: Use `React.memo()` for expensive renders
- **Tailwind**: Only active utilities are included in production build
- **Code Splitting**: Vite auto-splits route components (lazy load pages)

## Security Considerations

- **Auth**: All user data protected by Supabase authentication
- **Admin Routes**: QRTools page requires `user.role === "admin"` check
- **API Keys**: Environment variables loaded from `.env.local` (not in repo)
- **Stripe**: Card processing handled server-side by Stripe, never exposed to client
- **User Data**: CartItem and Order entities scoped to authenticated user

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires ES2022+ JavaScript support
- CSS Grid and Flexbox support required
- No IE11 support

## Related Documentation

- [Base44 Documentation](https://docs.base44.com)
- [React Router Documentation](https://reactrouter.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Hook Form Documentation](https://react-hook-form.com)
- [TanStack React Query Documentation](https://tanstack.com/query/latest)

## Contact & Support

- **Band Social**: @boogieyoyoz (TikTok, Instagram, YouTube)
- **Support**: https://app.base44.com/support
- **GitHub Integration**: Any push to `main` auto-syncs with Base44 Builder
