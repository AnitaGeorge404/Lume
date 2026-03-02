/**
 * templates.js
 * ─────────────
 * Production-grade template presets.
 * Every template looks like a finished, shipped product.
 * NO wireframes. NO placeholders. NO skeletons.
 *
 * Templates use real component types (Nav, Hero, Section, Card, Button, etc.)
 * with rich styling, real content, and production-quality visuals.
 */

// ── Shared style palette ────────────────────────────────────────────────────────

const S = {
  // Navigation
  navDark:      { fill: '#0f172a', text: '#f1f5f9', border: '#1e293b', radius: 0, shadow: true },
  navWhite:     { fill: '#ffffff', text: '#0f172a', border: '#e2e8f0', radius: 0, shadow: true },
  navSlate:     { fill: '#1e293b', text: '#e2e8f0', border: '#334155', radius: 0, shadow: true },

  // Hero sections  (fill → gradient-start, border → gradient-end)
  heroBlue:     { fill: '#1e3a8a', text: '#ffffff', border: '#3b82f6', radius: 0, shadow: false },
  heroDark:     { fill: '#0f172a', text: '#f8fafc', border: '#334155', radius: 0, shadow: false },
  heroViolet:   { fill: '#4c1d95', text: '#f5f3ff', border: '#8b5cf6', radius: 0, shadow: false },
  heroTeal:     { fill: '#134e4a', text: '#f0fdfa', border: '#2dd4bf', radius: 0, shadow: false },
  heroWarm:     { fill: '#7c2d12', text: '#fff7ed', border: '#f97316', radius: 0, shadow: false },
  heroEmerald:  { fill: '#064e3b', text: '#ecfdf5', border: '#10b981', radius: 0, shadow: false },
  heroRose:     { fill: '#881337', text: '#fff1f2', border: '#fb7185', radius: 0, shadow: false },

  // Buttons
  btnBlue:      { fill: '#2563eb', text: '#ffffff', border: '#1d4ed8', radius: 12, shadow: true },
  btnDark:      { fill: '#0f172a', text: '#ffffff', border: '#1e293b', radius: 12, shadow: true },
  btnGhost:     { fill: '#ffffff', text: '#2563eb', border: '#bfdbfe', radius: 12, shadow: false },
  btnGhostDark: { fill: 'transparent', text: '#e2e8f0', border: '#475569', radius: 12, shadow: false },
  btnGreen:     { fill: '#059669', text: '#ffffff', border: '#047857', radius: 12, shadow: true },
  btnOrange:    { fill: '#ea580c', text: '#ffffff', border: '#c2410c', radius: 12, shadow: true },
  btnViolet:    { fill: '#7c3aed', text: '#ffffff', border: '#6d28d9', radius: 12, shadow: true },
  btnTeal:      { fill: '#0d9488', text: '#ffffff', border: '#0f766e', radius: 12, shadow: true },
  btnRose:      { fill: '#e11d48', text: '#ffffff', border: '#be123c', radius: 12, shadow: true },

  // Cards
  cardWhite:    { fill: '#ffffff', text: '#0f172a', border: '#e2e8f0', radius: 16, shadow: true },
  cardSoft:     { fill: '#f8fafc', text: '#0f172a', border: '#e2e8f0', radius: 14, shadow: false },
  cardDark:     { fill: '#1e293b', text: '#f1f5f9', border: '#334155', radius: 16, shadow: true },
  cardBlue:     { fill: '#eff6ff', text: '#1e3a8a', border: '#bfdbfe', radius: 16, shadow: false },
  cardViolet:   { fill: '#f5f3ff', text: '#5b21b6', border: '#c4b5fd', radius: 16, shadow: false },
  cardTeal:     { fill: '#f0fdfa', text: '#0f766e', border: '#99f6e4', radius: 16, shadow: false },

  // Inputs
  inputLight:   { fill: '#ffffff', text: '#334155', border: '#cbd5e1', radius: 12, shadow: false },
  inputDark:    { fill: '#1e293b', text: '#e2e8f0', border: '#475569', radius: 12, shadow: false },

  // Badges
  badgeBlue:    { fill: '#dbeafe', text: '#1e40af', border: '#93c5fd', radius: 999, shadow: false },
  badgeGreen:   { fill: '#dcfce7', text: '#166534', border: '#86efac', radius: 999, shadow: false },
  badgeViolet:  { fill: '#ede9fe', text: '#5b21b6', border: '#c4b5fd', radius: 999, shadow: false },
  badgeAmber:   { fill: '#fef3c7', text: '#92400e', border: '#fbbf24', radius: 999, shadow: false },
  badgeRose:    { fill: '#ffe4e6', text: '#9f1239', border: '#fda4af', radius: 999, shadow: false },
  badgeDark:    { fill: '#334155', text: '#e2e8f0', border: '#475569', radius: 999, shadow: false },

  // Sections
  secLight:     { fill: '#f8fafc', text: '#0f172a', border: '#e2e8f0', radius: 16, shadow: false },
  secDark:      { fill: '#1e293b', text: '#f1f5f9', border: '#334155', radius: 16, shadow: false },
  secBlue:      { fill: '#eff6ff', text: '#1e3a8a', border: '#bfdbfe', radius: 16, shadow: false },

  // Utility
  divider:      { fill: 'transparent', text: '#94a3b8', border: '#e2e8f0', radius: 0, shadow: false },
  dividerDark:  { fill: 'transparent', text: '#475569', border: '#334155', radius: 0, shadow: false },
  slider:       { fill: '#eff6ff', text: '#1e3a8a', border: '#3b82f6', radius: 10, shadow: false },
  sliderTeal:   { fill: '#f0fdfa', text: '#0f766e', border: '#14b8a6', radius: 10, shadow: false },
}

/** Create a template component entry */
function t(id, type, x, y, w, h, sk, props) {
  return {
    id, type, x, y, width: w, height: h,
    style: S[sk] ?? S.btnBlue,
    props,
    sourceShape: `template_${type.toLowerCase()}`,
    source: 'template',
  }
}

// ── Blank ────────────────────────────────────────────────────────────────────────

const BLANK = []

// ── 1. SaaS Landing ─────────────────────────────────────────────────────────────

const LANDING_SAAS = [
  t('saas-nav',   'Nav',     0,   0, 760,  52, 'navDark',    { brand: 'Lume Studio', links: ['Features', 'Pricing', 'Docs', 'Login'] }),
  t('saas-hero',  'Hero',    0,  52, 760, 178, 'heroBlue',   { headline: 'Ship beautiful UI in minutes', subhead: 'From rough sketch to production-ready React — no design degree needed.', cta: 'Start building — free' }),
  t('saas-div',   'Divider', 30, 242, 700,   2, 'divider',   { label: '' }),
  t('saas-badge', 'Badge',   30, 256, 120,  28, 'badgeBlue',  { label: '✦ Why Lume' }),
  t('saas-c1',    'Card',    30, 296, 224, 120, 'cardWhite',  { title: 'Auto Layouts', body: 'Intelligent spacing and hierarchy without manual nudging.' }),
  t('saas-c2',    'Card',   268, 296, 224, 120, 'cardWhite',  { title: 'Styled Themes', body: 'One-click polish. Choose from minimal to bold in seconds.' }),
  t('saas-c3',    'Card',   506, 296, 224, 120, 'cardWhite',  { title: 'Code Export', body: 'Ship React JSX + CSS or clean HTML instantly.' }),
  t('saas-cta',   'Button', 280, 434, 200,  40, 'btnBlue',    { label: 'Get started free →' }),
]

// ── 2. eCommerce Store ──────────────────────────────────────────────────────────

const ECOMMERCE = [
  t('eco-nav',    'Nav',     0,   0, 760,  50, 'navWhite',   { brand: 'HAUS', links: ['New In', 'Women', 'Men', 'Sale', 'Cart'] }),
  t('eco-hero',   'Hero',    0,  50, 760, 168, 'heroWarm',   { headline: 'The Summer Edit', subhead: 'Premium essentials curated with intention.', cta: 'Shop the collection' }),
  t('eco-div',    'Divider', 30, 230, 700,   2, 'divider',   { label: '' }),
  t('eco-c1',     'Card',    30, 246, 224, 130, 'cardWhite',  { title: 'New Arrivals', body: 'Fresh drops added weekly. Discover what\'s trending.' }),
  t('eco-c2',     'Card',   268, 246, 224, 130, 'cardWhite',  { title: 'Best Sellers', body: 'The pieces everyone\'s wearing right now.' }),
  t('eco-c3',     'Card',   506, 246, 224, 130, 'cardWhite',  { title: 'Sale — 40% Off', body: 'Limited time on select premium pieces.' }),
  t('eco-badge',  'Badge',   30, 392, 120,  28, 'badgeAmber',  { label: 'Free Shipping' }),
  t('eco-btn1',   'Button', 268, 394, 160,  38, 'btnOrange',  { label: 'Shop now' }),
  t('eco-btn2',   'Button', 442, 394, 160,  38, 'btnGhost',   { label: 'View lookbook' }),
]

// ── 3. Portfolio ────────────────────────────────────────────────────────────────

const PORTFOLIO = [
  t('port-nav',   'Nav',     0,   0, 760,  50, 'navWhite',   { brand: 'Nadine Hoch', links: ['Work', 'About', 'Contact'] }),
  t('port-hero',  'Hero',    0,  50, 480, 198, 'heroDark',   { headline: 'Interior Designer', subhead: 'Elegant interiors for thoughtful living.', cta: 'View portfolio' }),
  t('port-side',  'Section', 496, 50, 264, 198, 'secLight',  { heading: 'Selected Work', body: 'Residential · Hospitality · Retail · Corporate spaces.' }),
  t('port-badge', 'Badge',   30, 260, 130,  28, 'badgeGreen', { label: '● Available now' }),
  t('port-div',   'Divider', 30, 300, 700,   2, 'divider',   { label: '' }),
  t('port-c1',    'Card',    30, 316, 224, 120, 'cardWhite',  { title: 'Kitchen Redesign', body: 'Warm oak tones with deep green accents.' }),
  t('port-c2',    'Card',   268, 316, 224, 120, 'cardWhite',  { title: 'Loft Concept', body: 'Soft textures and balanced neutral palette.' }),
  t('port-c3',    'Card',   506, 316, 224, 120, 'cardWhite',  { title: 'Studio Space', body: 'Focused zones with curated display areas.' }),
  t('port-btn',   'Button', 506, 448, 224,  28, 'btnDark',    { label: 'See all projects →' }),
]

// ── 4. Analytics Dashboard ──────────────────────────────────────────────────────

const DASHBOARD = [
  t('dash-nav',    'Nav',     0,   0, 760,  50, 'navDark',     { brand: 'Metric', links: ['Dashboard', 'Reports', 'Teams', 'Settings'] }),
  t('dash-div',    'Divider', 0,  50, 760,   2, 'dividerDark', { label: '' }),
  t('dash-mrr',    'Card',   20,  68, 230, 100, 'cardWhite',   { title: 'Monthly Revenue', body: '$192,430' }),
  t('dash-users',  'Card',  262,  68, 230, 100, 'cardWhite',   { title: 'Active Users', body: '24,089' }),
  t('dash-growth', 'Card',  504,  68, 236, 100, 'cardWhite',   { title: 'Growth Rate', body: '+14.2% ↑' }),
  t('dash-slider', 'Slider', 20, 186, 480,  44, 'slider',      { label: 'Pipeline Health', value: 78, min: 0, max: 100 }),
  t('dash-input',  'Input',  20, 246, 480,  44, 'inputLight',  { placeholder: 'Search reports, teams, or metrics…' }),
  t('dash-btn',    'Button', 514, 246, 226,  44, 'btnBlue',     { label: '+ New Report' }),
  t('dash-feed',   'Section', 20, 308, 720, 148, 'secLight',   { heading: 'Recent Activity', body: '12 updates from Sales and Marketing in the last 3 hours. Revenue target hit for Q4 — team notified.' }),
]

// ── 5. Booking Flow ─────────────────────────────────────────────────────────────

const BOOKING = [
  t('book-shell',  'Card',    130,  12, 500, 456, 'cardWhite',  { title: 'Book your consultation', body: 'Secure a slot in under a minute. No commitment required.' }),
  t('book-badge',  'Badge',   156,  72, 104,  28, 'badgeBlue',  { label: 'Step 2 of 3' }),
  t('book-name',   'Input',   156, 108, 448,  44, 'inputLight', { placeholder: 'Full name' }),
  t('book-email',  'Input',   156, 164, 448,  44, 'inputLight', { placeholder: 'Work email' }),
  t('book-date',   'Input',   156, 220, 214,  44, 'inputLight', { placeholder: 'Preferred date' }),
  t('book-time',   'Input',   380, 220, 224,  44, 'inputLight', { placeholder: 'Preferred time' }),
  t('book-slider', 'Slider',  156, 278, 448,  40, 'slider',     { label: 'Project readiness', value: 65, min: 0, max: 100 }),
  t('book-div',    'Divider', 156, 334, 448,   2, 'divider',    { label: '' }),
  t('book-btn',    'Button',  156, 352, 448,  46, 'btnGreen',   { label: 'Confirm booking →' }),
  t('book-note',   'Badge',   156, 414, 180,  24, 'badgeGreen', { label: '🔒 Secure & private' }),
]

// ── 6. Pricing Page ─────────────────────────────────────────────────────────────

const PRICING = [
  t('price-nav',   'Nav',     0,   0, 760,  50, 'navWhite',    { brand: 'Acme', links: ['Product', 'Pricing', 'Docs', 'Blog'] }),
  t('price-hero',  'Hero',    0,  50, 760, 108, 'heroViolet',  { headline: 'Simple, transparent pricing', subhead: 'No hidden fees. Cancel anytime. Start free today.', cta: '' }),
  t('price-c1',    'Card',    30, 174, 224, 230, 'cardSoft',   { title: 'Starter — Free', body: 'For individuals.\n\n✓ 3 projects\n✓ Basic themes\n✓ HTML export' }),
  t('price-c2',    'Card',   268, 174, 224, 230, 'cardBlue',   { title: 'Pro — $19/mo', body: 'For teams.\n\n✓ Unlimited projects\n✓ All themes & exports\n✓ Priority support' }),
  t('price-c3',    'Card',   506, 174, 224, 230, 'cardSoft',   { title: 'Enterprise', body: 'Custom pricing.\n\n✓ Everything in Pro\n✓ SSO & SAML\n✓ Dedicated account' }),
  t('price-pop',   'Badge',  302, 178,  80,  24, 'badgeViolet', { label: '★ Popular' }),
  t('price-b1',    'Button',  62, 420, 160,  36, 'btnGhost',    { label: 'Get started' }),
  t('price-b2',    'Button', 300, 420, 160,  36, 'btnViolet',   { label: 'Start free trial' }),
  t('price-b3',    'Button', 538, 420, 160,  36, 'btnGhost',    { label: 'Contact sales' }),
]

// ── 7. Blog & Journal ───────────────────────────────────────────────────────────

const BLOG = [
  t('blog-nav',   'Nav',     0,   0, 760,  50, 'navWhite',    { brand: 'The Journal', links: ['Latest', 'Tech', 'Design', 'Culture'] }),
  t('blog-hero',  'Hero',    0,  50, 480, 196, 'heroTeal',    { headline: 'Design systems that scale', subhead: 'How top teams build and maintain UI at speed.', cta: 'Read now' }),
  t('blog-feat',  'Card',   496,  50, 264, 196, 'cardWhite',  { title: 'Featured', body: 'Why every startup needs a design system from day one.' }),
  t('blog-div',   'Divider', 30, 260, 700,   2, 'divider',    { label: '' }),
  t('blog-a1',    'Card',    30, 278, 350, 120, 'cardWhite',  { title: 'The Future of AI in Design', body: 'Exploring how AI tools are reshaping the creative workflow for teams.' }),
  t('blog-a2',    'Card',   394, 278, 336, 120, 'cardWhite',  { title: 'Color Theory for Developers', body: 'A practical guide to choosing palettes that actually work.' }),
  t('blog-badge', 'Badge',   30, 414, 100,  28, 'badgeGreen', { label: '5 min read' }),
  t('blog-btn',   'Button', 580, 416, 150,  36, 'btnTeal',    { label: 'Subscribe' }),
]

// ── Export ───────────────────────────────────────────────────────────────────────

export const TEMPLATES = [
  {
    id: 'blank',
    label: 'Blank Canvas',
    icon: '✦',
    description: 'Start from scratch with full creative freedom.',
    components: BLANK,
  },
  {
    id: 'landing-saas',
    label: 'SaaS Landing',
    icon: '🚀',
    description: 'Modern startup landing with hero, features, and CTA.',
    components: LANDING_SAAS,
  },
  {
    id: 'ecommerce',
    label: 'eCommerce Store',
    icon: '🛍️',
    description: 'Premium storefront with collection cards and promotions.',
    components: ECOMMERCE,
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    icon: '🎨',
    description: 'Creative portfolio with featured work and project grid.',
    components: PORTFOLIO,
  },
  {
    id: 'dashboard',
    label: 'Analytics Dashboard',
    icon: '📊',
    description: 'Data-driven dashboard with metrics, search, and feed.',
    components: DASHBOARD,
  },
  {
    id: 'booking',
    label: 'Booking Flow',
    icon: '📅',
    description: 'Conversion-focused booking form with step progress.',
    components: BOOKING,
  },
  {
    id: 'pricing',
    label: 'Pricing Page',
    icon: '💎',
    description: 'Tiered pricing with comparison cards and CTAs.',
    components: PRICING,
  },
  {
    id: 'blog',
    label: 'Blog & Journal',
    icon: '✍️',
    description: 'Content site with featured posts and article grid.',
    components: BLOG,
  },
]

export function cloneTemplate(templateId) {
  const template = TEMPLATES.find(item => item.id === templateId)
  if (!template) return []
  return template.components.map(component => ({
    ...component,
    style: { ...component.style },
    props: { ...component.props },
  }))
}
