/**
 * templates.js
 * Realistic template presets designed to feel production-ready.
 * Preserves the existing component schema and pipeline contract.
 */

const STYLE = {
  buttonPrimary: { fill: '#2563eb', text: '#ffffff', border: '#1d4ed8', radius: 12, shadow: true },
  buttonGhost: { fill: '#ffffff', text: '#1d4ed8', border: '#93c5fd', radius: 12, shadow: false },
  cardLight: { fill: '#ffffff', text: '#0f172a', border: '#e2e8f0', radius: 16, shadow: true },
  cardSoft: { fill: '#f8fafc', text: '#0f172a', border: '#dbe4f0', radius: 14, shadow: false },
  cardDark: { fill: '#0f172a', text: '#e2e8f0', border: '#1e293b', radius: 16, shadow: true },
  slider: { fill: '#e0f2fe', text: '#075985', border: '#0284c7', radius: 10, shadow: false },
  input: { fill: '#f8fafc', text: '#334155', border: '#cbd5e1', radius: 12, shadow: false },
  badgeBlue: { fill: '#eff6ff', text: '#1e3a8a', border: '#93c5fd', radius: 999, shadow: false },
  badgeGreen: { fill: '#ecfdf5', text: '#166534', border: '#86efac', radius: 999, shadow: false },
  divider: { fill: 'transparent', text: '#94a3b8', border: '#e2e8f0', radius: 0, shadow: false },
}

function t(id, type, x, y, width, height, styleKey, props) {
  return {
    id,
    type,
    x,
    y,
    width,
    height,
    style: STYLE[styleKey] ?? STYLE.buttonPrimary,
    props,
    sourceShape: `template_${type.toLowerCase()}`,
    source: 'template',
  }
}

const BLANK = []

const LANDING_SAAS = [
  t('saas-nav', 'Card', 20, 18, 720, 58, 'cardLight', { title: 'Lume Studio', body: 'Product • Pricing • Docs • Login' }),
  t('saas-badge', 'Badge', 38, 34, 74, 28, 'badgeBlue', { label: 'NEW' }),
  t('saas-hero', 'Card', 20, 90, 720, 148, 'cardLight', { title: 'Build fast, ship polished UI', body: 'Go from rough sketch to real React components with realistic styling, spacing, and hierarchy.' }),
  t('saas-input', 'Input', 44, 256, 430, 46, 'input', { placeholder: 'Your work email' }),
  t('saas-cta', 'Button', 492, 256, 224, 46, 'buttonPrimary', { label: 'Start free trial' }),
  t('saas-divider', 'Divider', 20, 322, 720, 2, 'divider', { label: '' }),
  t('saas-f1', 'Card', 20, 342, 230, 118, 'cardSoft', { title: 'Auto Layout', body: 'Intentional spacing and structure.' }),
  t('saas-f2', 'Card', 265, 342, 230, 118, 'cardSoft', { title: 'Theme Vibes', body: 'One-click polished style profiles.' }),
  t('saas-f3', 'Card', 510, 342, 230, 118, 'cardSoft', { title: 'Export Ready', body: 'Component code that feels shippable.' }),
]

const ECOMMERCE_HOME = [
  t('eco-nav', 'Card', 20, 16, 720, 60, 'cardLight', { title: 'Atelier Commerce', body: 'Women • Men • Home • Accessories • Cart' }),
  t('eco-hero', 'Card', 20, 92, 720, 188, 'cardDark', { title: 'Style, refined for every season', body: 'Discover best-sellers, curated drops, and premium essentials.' }),
  t('eco-hero-btn-a', 'Button', 42, 226, 148, 40, 'buttonPrimary', { label: 'Shop now' }),
  t('eco-hero-btn-b', 'Button', 202, 226, 148, 40, 'buttonGhost', { label: 'View lookbook' }),
  t('eco-divider', 'Divider', 20, 298, 720, 2, 'divider', { label: '' }),
  t('eco-c1', 'Card', 20, 318, 230, 142, 'cardLight', { title: 'New Arrivals', body: 'Fresh essentials added this week.' }),
  t('eco-c2', 'Card', 265, 318, 230, 142, 'cardLight', { title: 'Editor Picks', body: 'Curated combinations for daily wear.' }),
  t('eco-c3', 'Card', 510, 318, 230, 142, 'cardLight', { title: 'Sale 30%', body: 'Limited offer on selected pieces.' }),
]

const PORTFOLIO_STUDIO = [
  t('port-nav', 'Card', 20, 18, 720, 58, 'cardLight', { title: 'Nadine Hoch', body: 'Work • About • Contact' }),
  t('port-hero', 'Card', 20, 92, 470, 210, 'cardDark', { title: 'Interior Designer', body: 'Elegant interiors for thoughtful living.' }),
  t('port-side', 'Card', 510, 92, 230, 210, 'cardLight', { title: 'Selected Projects', body: 'Residential • Hospitality • Retail' }),
  t('port-badge', 'Badge', 42, 112, 120, 30, 'badgeGreen', { label: 'Available now' }),
  t('port-divider', 'Divider', 20, 320, 720, 2, 'divider', { label: '' }),
  t('port-grid-a', 'Card', 20, 338, 230, 122, 'cardLight', { title: 'Kitchen Redesign', body: 'Warm oak + deep green accents.' }),
  t('port-grid-b', 'Card', 265, 338, 230, 122, 'cardLight', { title: 'Loft Concept', body: 'Soft textures, balanced neutrals.' }),
  t('port-grid-c', 'Card', 510, 338, 230, 122, 'cardLight', { title: 'Studio Workspace', body: 'Focused zones and display areas.' }),
]

const BUSINESS_SITE = [
  t('biz-nav', 'Card', 20, 16, 720, 58, 'cardLight', { title: 'GMCT', body: 'About • Solutions • Insights • Contact' }),
  t('biz-hero', 'Card', 20, 88, 720, 178, 'cardLight', { title: 'Build your best business yet', body: 'Strategy, planning, and execution support for growing teams.' }),
  t('biz-hero-badge', 'Badge', 44, 106, 92, 28, 'badgeBlue', { label: 'Top Rated' }),
  t('biz-btn-a', 'Button', 44, 220, 150, 40, 'buttonPrimary', { label: 'Book consult' }),
  t('biz-btn-b', 'Button', 206, 220, 150, 40, 'buttonGhost', { label: 'Case studies' }),
  t('biz-divider', 'Divider', 20, 280, 720, 2, 'divider', { label: '' }),
  t('biz-col-a', 'Card', 20, 302, 350, 158, 'cardSoft', { title: 'Industries We Accelerate', body: 'Healthcare, Financial Services, and Technology.' }),
  t('biz-col-b', 'Card', 390, 302, 350, 158, 'cardSoft', { title: 'Proven Process', body: 'Discovery → Strategy → Delivery with measurable KPIs.' }),
]

const APP_ANALYTICS = [
  t('app-head', 'Card', 0, 0, 760, 62, 'cardLight', { title: 'Revenue Dashboard', body: '' }),
  t('app-div-top', 'Divider', 0, 62, 760, 2, 'divider', { label: '' }),
  t('app-mrr', 'Card', 20, 82, 230, 118, 'cardLight', { title: 'MRR', body: '$192,430' }),
  t('app-users', 'Card', 265, 82, 230, 118, 'cardLight', { title: 'Active Users', body: '18,204' }),
  t('app-growth', 'Card', 510, 82, 230, 118, 'cardLight', { title: 'Growth', body: '+12.4%' }),
  t('app-slider', 'Slider', 20, 220, 474, 44, 'slider', { label: 'Pipeline health', value: 78, min: 0, max: 100 }),
  t('app-input', 'Input', 20, 286, 474, 46, 'input', { placeholder: 'Search reports or teams…' }),
  t('app-cta', 'Button', 510, 286, 230, 46, 'buttonPrimary', { label: '+ New report' }),
  t('app-feed', 'Card', 20, 350, 720, 110, 'cardSoft', { title: 'Recent activity', body: '8 updates from sales and marketing in the last 2 hours.' }),
]

const BOOKING_FLOW = [
  t('book-wrap', 'Card', 130, 20, 500, 440, 'cardLight', { title: 'Book your consultation', body: 'Complete your details and secure a slot in under a minute.' }),
  t('book-step', 'Badge', 154, 50, 86, 28, 'badgeBlue', { label: 'Step 2/3' }),
  t('book-name', 'Input', 154, 106, 452, 44, 'input', { placeholder: 'Full name' }),
  t('book-email', 'Input', 154, 162, 452, 44, 'input', { placeholder: 'Work email' }),
  t('book-date', 'Input', 154, 218, 222, 44, 'input', { placeholder: 'Preferred date' }),
  t('book-time', 'Input', 384, 218, 222, 44, 'input', { placeholder: 'Preferred time' }),
  t('book-slider', 'Slider', 154, 274, 452, 40, 'slider', { label: 'Project readiness', value: 55, min: 0, max: 100 }),
  t('book-cta', 'Button', 154, 332, 452, 46, 'buttonPrimary', { label: 'Confirm booking' }),
]

const SURVEY_QUIZ = [
  t('surv-shell', 'Card', 40, 20, 680, 440, 'cardLight', { title: 'Product Experience Survey', body: 'Help us improve by sharing your feedback below.' }),
  t('surv-name', 'Input', 76, 96, 608, 44, 'input', { placeholder: 'Name' }),
  t('surv-email', 'Input', 76, 148, 608, 44, 'input', { placeholder: 'Email address' }),
  t('surv-divider', 'Divider', 76, 204, 608, 2, 'divider', { label: '' }),
  t('surv-rating', 'Slider', 76, 224, 608, 42, 'slider', { label: 'How satisfied are you?', value: 72, min: 0, max: 100 }),
  t('surv-feedback', 'Input', 76, 280, 608, 44, 'input', { placeholder: 'What should we improve next?' }),
  t('surv-tag', 'Badge', 76, 340, 110, 30, 'badgeGreen', { label: '2 min form' }),
  t('surv-submit', 'Button', 532, 336, 152, 44, 'buttonPrimary', { label: 'Submit' }),
]

export const TEMPLATES = [
  {
    id: 'blank',
    label: 'Blank Canvas',
    icon: '⬜',
    description: 'Start from scratch with a clean board and full drawing freedom.',
    components: BLANK,
  },
  {
    id: 'landing-saas',
    label: 'SaaS Landing',
    icon: '🚀',
    description: 'Hero section, email capture, CTA, and value props.',
    components: LANDING_SAAS,
  },
  {
    id: 'ecommerce-home',
    label: 'eCommerce Home',
    icon: '🛍️',
    description: 'Shopfront hero with promotional cards and catalog highlights.',
    components: ECOMMERCE_HOME,
  },
  {
    id: 'portfolio-studio',
    label: 'Portfolio Studio',
    icon: '🖼️',
    description: 'Creative portfolio with hero work area and featured projects.',
    components: PORTFOLIO_STUDIO,
  },
  {
    id: 'business-site',
    label: 'Business Site',
    icon: '💼',
    description: 'Consulting-style landing with services and conversion actions.',
    components: BUSINESS_SITE,
  },
  {
    id: 'app-analytics',
    label: 'Analytics App',
    icon: '📊',
    description: 'Dashboard shell with KPI cards, controls, and activity feed.',
    components: APP_ANALYTICS,
  },
  {
    id: 'booking-flow',
    label: 'Booking Flow',
    icon: '🗓️',
    description: 'Single-page booking experience with form fields and confidence slider.',
    components: BOOKING_FLOW,
  },
  {
    id: 'survey-quiz',
    label: 'Survey Form',
    icon: '🧾',
    description: 'Structured feedback form with progress and submit action.',
    components: SURVEY_QUIZ,
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
