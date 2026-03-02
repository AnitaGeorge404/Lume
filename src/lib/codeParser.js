/**
 * codeParser.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Lume Code Ingestion Engine — Iteration 1
 *
 * Accepts raw source code (HTML/CSS, React/JSX/TSX, Vue SFC, React Native,
 * Flutter) and extracts a normalized list of UIBlocks for the enhancement
 * pipeline.
 *
 * Design constraints:
 *  - No external parsing dependencies — browser-native APIs only
 *  - Produce UIBlock[] regardless of framework quality/completeness
 *  - Never throw: return best-effort result for any input
 *  - Output is framework-agnostic (only semantic roles matter)
 *
 * UIBlock schema:
 * {
 *   kind:        string    — semantic role: nav|hero|card|form|button|input|
 *                            badge|divider|slider|metric|footer|section
 *   order:       number    — document order (0 = first detected)
 *   label:       string    — primary text content (≤ 40 chars)
 *   description: string    — secondary text content (≤ 80 chars)
 *   isFullWidth: boolean   — spans full canvas width
 *   isProminent: boolean   — visually large/important element
 *   quantity:    number    — how many of this kind grouped here (e.g., 3 cards)
 *   depth:       number    — scan depth at which found (0 = top-level)
 * }
 */

// ─── Framework detection ──────────────────────────────────────────────────────

const FRAMEWORK_SIGNATURES = {
  react: [
    /import\s+React/,
    /from\s+['"]react['"]/,
    /\.(jsx|tsx)\s*$/m,
    /createRoot\s*\(/,
    /ReactDOM\.render/,
    /export\s+default\s+function\s+[A-Z]/,
    /const\s+[A-Z]\w+\s*=\s*\(\s*\)\s*=>\s*\(/,
  ],
  vue: [
    /<template[\s>]/,
    /<script\s+setup/,
    /defineComponent\s*\(/,
    /from\s+['"]vue['"]/,
    /createApp\s*\(/,
  ],
  reactNative: [
    /StyleSheet\.create\s*\(/,
    /from\s+['"]react-native['"]/,
    /\bView\b[\s,]}|import.*\bView\b/,
    /TouchableOpacity|Pressable|TouchableHighlight/,
  ],
  flutter: [
    /extends\s+StatelessWidget/,
    /extends\s+StatefulWidget/,
    /package:flutter\/material/,
    /Widget\s+build\s*\(\s*BuildContext/,
    /Scaffold\s*\(/,
  ],
}

/**
 * Detect the UI framework from source code.
 * @param {string} code
 * @returns {'react'|'vue'|'react-native'|'flutter'|'html'}
 */
export function detectFramework(code) {
  for (const [framework, patterns] of Object.entries(FRAMEWORK_SIGNATURES)) {
    if (patterns.some(re => re.test(code))) return framework
  }
  // Fallback: check for HTML-like structure
  if (/<[a-zA-Z][^>]*>/.test(code)) return 'html'
  return 'html'
}

// ─── Text utilities ───────────────────────────────────────────────────────────

function truncate(str, max) {
  const s = String(str ?? '').replace(/\s+/g, ' ').trim()
  return s.length > max ? `${s.slice(0, max - 1)}…` : s
}

function normalizeText(str) {
  return String(str ?? '').replace(/\s+/g, ' ').trim()
}

// ─── HTML/DOM parser (browser-native) ────────────────────────────────────────

const NAV_CLASSES = /\b(nav|navbar|navigation|header-nav|topnav|sidenav|menu|menubar)\b/i
const HERO_CLASSES = /\b(hero|banner|splash|jumbotron|landing|showcase|intro|lead|masthead)\b/i
const CARD_CLASSES = /\b(card|tile|panel|widget|box|item|feature|cell)\b/i
const FORM_CLASSES = /\b(form|form-group|form-wrapper|auth|login|register|signup)\b/i
const FOOTER_CLASSES = /\b(footer|foot|site-footer|page-footer)\b/i
const BADGE_CLASSES = /\b(badge|tag|chip|pill|label|status|indicator)\b/i
const METRIC_CLASSES = /\b(metric|stat|kpi|number|count|total|value|figure)\b/i
const DIVIDER_CLASSES = /\b(divider|separator|rule|hr)\b/i
const SLIDER_CLASSES = /\b(slider|range|seek)\b/i
const BUTTON_CLASSES = /\b(btn|button|cta|action|submit)\b/i

function getClassString(node) {
  return normalizeText(node.getAttribute?.('class') ?? node.className ?? '')
}

function getAllText(node) {
  return normalizeText(node.textContent ?? '')
}

function getDirectText(node) {
  let text = ''
  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) text += ` ${child.textContent ?? ''}`
  }
  return normalizeText(text)
}

function countDescendants(node, selector) {
  try {
    return node.querySelectorAll?.(selector)?.length ?? 0
  } catch {
    return 0
  }
}

/**
 * Classify a single DOM node into a semantic role.
 * Returns null if the element should be skipped.
 */
function classifyDOMNode(node, depth) {
  const tag = node.tagName?.toLowerCase() ?? ''
  if (!tag) return null

  // Skip hidden, script, style, meta elements
  if (['script', 'style', 'meta', 'link', 'head', 'template', 'noscript', 'svg', 'path', 'g'].includes(tag)) return null

  const classStr = getClassString(node)
  const allText = getAllText(node)
  const directText = getDirectText(node)
  const childCount = node.children?.length ?? 0
  const btnCount = countDescendants(node, 'button, [role="button"], a.btn, a.button')
  const inputCount = countDescendants(node, 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select')
  const headingCount = countDescendants(node, 'h1, h2, h3, h4')

  // Exact tag matches — highest priority
  if (tag === 'nav' || (tag === 'header' && depth < 2)) return { kind: 'nav', label: truncate(directText, 40) || 'Navigation', description: '', isFullWidth: true, isProminent: false }
  if (tag === 'footer') return { kind: 'footer', label: 'Footer', description: truncate(allText, 80), isFullWidth: true, isProminent: false }
  if (tag === 'hr') return { kind: 'divider', label: '', description: '', isFullWidth: true, isProminent: false }
  if (tag === 'form') return { kind: 'form', label: truncate(directText, 40) || 'Form', description: '', isFullWidth: false, isProminent: true }
  if (tag === 'button' || (tag === 'a' && node.getAttribute?.('href'))) {
    const text = truncate(allText, 30) || 'Action'
    return { kind: 'button', label: text, description: '', isFullWidth: false, isProminent: false }
  }
  if (tag === 'input') {
    const type = node.getAttribute?.('type') ?? 'text'
    if (type === 'range') return { kind: 'slider', label: node.getAttribute?.('name') || 'Range', description: '', isFullWidth: false, isProminent: false }
    if (['hidden', 'submit', 'button', 'reset', 'checkbox', 'radio'].includes(type)) return null
    return { kind: 'input', label: node.getAttribute?.('placeholder') || node.getAttribute?.('name') || 'Input', description: '', isFullWidth: false, isProminent: false }
  }
  if (tag === 'textarea') return { kind: 'input', label: node.getAttribute?.('placeholder') || 'Text area', description: '', isFullWidth: false, isProminent: false }
  if (tag === 'select') return { kind: 'input', label: 'Select', description: '', isFullWidth: false, isProminent: false }

  // Class-based classification
  if (NAV_CLASSES.test(classStr) && depth < 3) return { kind: 'nav', label: truncate(directText, 40) || 'Navigation', description: '', isFullWidth: true, isProminent: false }
  if (HERO_CLASSES.test(classStr) && depth < 3) return { kind: 'hero', label: truncate(allText, 40) || 'Hero', description: truncate(allText.slice(40), 80), isFullWidth: true, isProminent: true }
  if (FOOTER_CLASSES.test(classStr)) return { kind: 'footer', label: 'Footer', description: truncate(allText, 80), isFullWidth: true, isProminent: false }
  if (DIVIDER_CLASSES.test(classStr)) return { kind: 'divider', label: '', description: '', isFullWidth: true, isProminent: false }
  if (SLIDER_CLASSES.test(classStr)) return { kind: 'slider', label: truncate(directText, 30) || 'Slider', description: '', isFullWidth: false, isProminent: false }
  if (BADGE_CLASSES.test(classStr) && childCount <= 2) return { kind: 'badge', label: truncate(allText, 20) || '●', description: '', isFullWidth: false, isProminent: false }
  if (METRIC_CLASSES.test(classStr)) return { kind: 'metric', label: truncate(directText, 20) || '—', description: truncate(allText, 40), isFullWidth: false, isProminent: true }
  if (FORM_CLASSES.test(classStr) || (inputCount > 0 && btnCount > 0)) return { kind: 'form', label: truncate(directText, 40) || 'Form', description: '', isFullWidth: false, isProminent: true }
  if (BUTTON_CLASSES.test(classStr) && childCount <= 3) return { kind: 'button', label: truncate(allText, 30) || 'Action', description: '', isFullWidth: false, isProminent: false }
  if (CARD_CLASSES.test(classStr)) return { kind: 'card', label: truncate(directText, 40) || 'Card', description: truncate(allText.slice(0, 80), 80), isFullWidth: false, isProminent: false }

  // Content-based heuristics
  // Large isolated number → metric (e.g. "$92k", "99%", "1,234")
  if (/^[$€£¥]?\s*[\d,]+\.?\d*\s*[%kKmMbB]?$/.test(directText) && childCount < 3) {
    return { kind: 'metric', label: truncate(directText, 20), description: '', isFullWidth: false, isProminent: true }
  }

  // A section-like container with headings and body content
  if (['section', 'article', 'main', 'aside'].includes(tag)) {
    if (headingCount > 0 && allText.length > 20) {
      const label = truncate(node.querySelector?.('h1,h2,h3,h4')?.textContent ?? allText, 40)
      const paragraphs = node.querySelectorAll?.('p') ?? []
      const desc = paragraphs[0]?.textContent ? truncate(paragraphs[0].textContent, 80) : ''
      return { kind: tag === 'main' ? 'hero' : 'section', label, description: desc, isFullWidth: true, isProminent: tag === 'main' }
    }
  }

  // Generic div that acts as a card-like container with clear text hierarchy
  if (tag === 'div' && depth >= 2 && headingCount === 1 && childCount >= 2 && allText.length > 10) {
    const heading = node.querySelector?.('h1,h2,h3,h4,h5,h6')
    const para = node.querySelector?.('p')
    if (heading && (para || childCount >= 2)) {
      return {
        kind: 'card',
        label: truncate(heading.textContent ?? '', 40),
        description: truncate(para?.textContent ?? '', 80),
        isFullWidth: false,
        isProminent: false,
      }
    }
  }

  return null
}

/**
 * Walk a DOM tree and collect classified UIBlocks.
 * Stops recursion when a section-level block is found to avoid duplicates.
 */
function walkDOM(node, depth, blocks, maxDepth) {
  if (depth > maxDepth) return
  const children = Array.from(node.children ?? [])

  for (const child of children) {
    const classified = classifyDOMNode(child, depth)
    if (classified) {
      blocks.push({ ...classified, order: blocks.length, depth, quantity: 1 })
      // Don't recurse into classified section-level nodes — avoids double-counting
      const sectionLevels = new Set(['nav', 'hero', 'footer', 'section', 'form'])
      if (sectionLevels.has(classified.kind) && depth < 2) continue
    }
    // Recurse, but only if not shallow container noise
    const isNoisyWrapper = (child.tagName?.toLowerCase() === 'div') && (child.className === '' || !child.className) && depth > 0
    if (!isNoisyWrapper) {
      walkDOM(child, depth + 1, blocks, maxDepth)
    }
  }
}

function parseHTML(code) {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(code, 'text/html')
    const root = doc.body ?? doc.documentElement
    const blocks = []
    walkDOM(root, 0, blocks, 6)
    return deduplicateBlocks(blocks)
  } catch {
    return []
  }
}

// ─── JSX/React parser ─────────────────────────────────────────────────────────

const JSX_COMPONENT_ROLES = {
  // Nav
  Navbar: 'nav', NavBar: 'nav', Navigation: 'nav', Header: 'nav', AppHeader: 'nav', TopBar: 'nav', TopNav: 'nav', Sidebar: 'nav',
  // Hero
  Hero: 'hero', HeroSection: 'hero', Banner: 'hero', Splash: 'hero', Landing: 'hero', Showcase: 'hero', Intro: 'hero', Masthead: 'hero', HeroBanner: 'hero',
  // Card
  Card: 'card', Panel: 'card', Tile: 'card', Widget: 'card', FeatureCard: 'card', InfoCard: 'card', ProductCard: 'card',
  // Form
  Form: 'form', LoginForm: 'form', SignupForm: 'form', RegisterForm: 'form', ContactForm: 'form', AuthForm: 'form', FormGroup: 'form',
  // Button
  Button: 'button', Btn: 'button', CTA: 'button', CTAButton: 'button', SubmitButton: 'button', PrimaryButton: 'button', IconButton: 'button',
  // Input
  Input: 'input', TextField: 'input', TextInput: 'input', SearchBar: 'input', SearchInput: 'input', FormInput: 'input', InputField: 'input',
  // Badge
  Badge: 'badge', Tag: 'badge', Chip: 'badge', Pill: 'badge', Label: 'badge', StatusBadge: 'badge',
  // Divider
  Divider: 'divider', Separator: 'divider', Hr: 'divider',
  // Slider
  Slider: 'slider', RangeSlider: 'slider', Range: 'slider',
  // Metric
  Metric: 'metric', Stat: 'metric', KPI: 'metric', Stats: 'metric', StatCard: 'metric', MetricCard: 'metric',
  // Footer
  Footer: 'footer', SiteFooter: 'footer', PageFooter: 'footer', FooterSection: 'footer',
  // Section
  Section: 'section', Features: 'section', FeatureSection: 'section', AboutSection: 'section', PricingSection: 'section',
}

function inferJSXRole(componentName) {
  if (JSX_COMPONENT_ROLES[componentName]) return JSX_COMPONENT_ROLES[componentName]

  // Suffix matching
  const name = componentName.toLowerCase()
  if (/nav|bar|menu/.test(name) && !name.includes('progress')) return 'nav'
  if (/hero|banner|splash/.test(name)) return 'hero'
  if (/card|tile|panel|widget/.test(name)) return 'card'
  if (/form|login|register|signup|auth/.test(name)) return 'form'
  if (/button|btn|cta/.test(name)) return 'button'
  if (/input|field|textfield/.test(name)) return 'input'
  if (/badge|chip|tag|pill/.test(name)) return 'badge'
  if (/divider|separator/.test(name)) return 'divider'
  if (/slider|range/.test(name)) return 'slider'
  if (/metric|stat|kpi/.test(name)) return 'metric'
  if (/footer/.test(name)) return 'footer'
  if (/section|feature|pricing|testimonial|about|contact/.test(name)) return 'section'
  return null
}

function extractJSXProps(propsStr) {
  const props = {}
  // Extract string props: propName="value"
  for (const m of propsStr.matchAll(/(\w+)\s*=\s*["'`]([^"'`]*)["'`]/g)) {
    props[m[1]] = m[2]
  }
  // Boolean props: disabled, checked
  for (const m of propsStr.matchAll(/\b(disabled|checked|required|readOnly|autoFocus)\b/g)) {
    props[m[1]] = true
  }
  return props
}

function parseJSX(code) {
  const blocks = []

  // Match JSX opening tags: <ComponentName ... > or <componentName ...>
  // We prioritize capitalized (React components) and certain lowercase (HTML elements)
  const TAG_RE = /<([A-Z][A-Za-z0-9]*|nav|header|section|main|footer|form|button|input|textarea|select|hr|article|aside|div)[^>]*?(?:\/?>)/g

  for (const match of code.matchAll(TAG_RE)) {
    const tagName = match[1]
    const propsStr = match[0].slice(tagName.length + 1, match[0].endsWith('/>') ? -2 : -1)
    const props = extractJSXProps(propsStr)

    let kind = null
    let label = ''
    let description = ''
    let isFullWidth = false
    let isProminent = false

    // Capitalized → React component
    if (/^[A-Z]/.test(tagName)) {
      kind = inferJSXRole(tagName)
      label = props.label || props.title || props.heading || props.text || tagName
      description = props.description || props.body || props.subtitle || ''
      isFullWidth = ['nav', 'hero', 'footer', 'section'].includes(kind ?? '')
      isProminent = ['hero', 'card', 'metric'].includes(kind ?? '')
    } else {
      // HTML-like element in JSX
      const classified = classifyLowercaseTag(tagName, props, propsStr)
      if (classified) {
        kind = classified.kind
        label = classified.label
        description = classified.description
        isFullWidth = classified.isFullWidth
        isProminent = classified.isProminent
      }
    }

    if (kind && label !== undefined) {
      blocks.push({
        kind,
        order: blocks.length,
        label: truncate(label, 40),
        description: truncate(description, 80),
        isFullWidth,
        isProminent,
        quantity: 1,
        depth: 0,
      })
    }
  }

  return deduplicateBlocks(blocks)
}

function classifyLowercaseTag(tag, props) {
  if (tag === 'nav' || tag === 'header') return { kind: 'nav', label: 'Navigation', description: '', isFullWidth: true, isProminent: false }
  if (tag === 'footer') return { kind: 'footer', label: 'Footer', description: '', isFullWidth: true, isProminent: false }
  if (tag === 'main') return { kind: 'hero', label: 'Main content', description: '', isFullWidth: true, isProminent: true }
  if (tag === 'section' || tag === 'article' || tag === 'aside') return { kind: 'section', label: props.className || 'Section', description: '', isFullWidth: true, isProminent: false }
  if (tag === 'hr') return { kind: 'divider', label: '', description: '', isFullWidth: true, isProminent: false }
  if (tag === 'form') return { kind: 'form', label: 'Form', description: '', isFullWidth: false, isProminent: true }
  if (tag === 'button') return { kind: 'button', label: props.children || 'Action', description: '', isFullWidth: false, isProminent: false }
  if (tag === 'input') {
    if (props.type === 'range') return { kind: 'slider', label: props.name || props.id || 'Slider', description: '', isFullWidth: false, isProminent: false }
    if (['hidden', 'submit', 'button', 'reset'].includes(props.type ?? '')) return null
    return { kind: 'input', label: props.placeholder || props.name || props.id || 'Input', description: '', isFullWidth: false, isProminent: false }
  }
  if (tag === 'textarea') return { kind: 'input', label: props.placeholder || 'Message', description: '', isFullWidth: false, isProminent: false }
  if (tag === 'select') return { kind: 'input', label: props.name || 'Select', description: '', isFullWidth: false, isProminent: false }
  return null
}

// ─── Vue SFC parser ───────────────────────────────────────────────────────────

function parseVue(code) {
  // Extract the <template> section and parse it as HTML
  const templateMatch = code.match(/<template[^>]*>([\s\S]*?)<\/template>/i)
  if (!templateMatch) return parseJSX(code) // fallback: treat as JSX-like
  return parseHTML(templateMatch[1])
}

// ─── React Native parser ──────────────────────────────────────────────────────

const RN_COMPONENT_ROLES = {
  View: null, // generic, skip
  ScrollView: null,
  SafeAreaView: null,
  KeyboardAvoidingView: null,
  Text: null, // too generic
  Image: null,
  ImageBackground: null,
  TouchableOpacity: 'button',
  TouchableHighlight: 'button',
  Pressable: 'button',
  Button: 'button',
  TextInput: 'input',
  Slider: 'slider',
  Switch: 'input',
  FlatList: 'section',
  SectionList: 'section',
  StatusBar: null,
  ActivityIndicator: null,
}

function parseReactNative(code) {
  const blocks = []
  const TAG_RE = /<([A-Z][A-Za-z0-9]*)\s*([^>]*?)(?:\/?>)/g

  for (const match of code.matchAll(TAG_RE)) {
    const tagName = match[1]
    const propsStr = match[2]
    const props = extractJSXProps(propsStr)

    if (tagName in RN_COMPONENT_ROLES) {
      const kind = RN_COMPONENT_ROLES[tagName]
      if (!kind) continue
      const label = props.title || props.placeholder || props.label || props.value || tagName
      blocks.push({
        kind,
        order: blocks.length,
        label: truncate(label, 40),
        description: '',
        isFullWidth: false,
        isProminent: false,
        quantity: 1,
        depth: 0,
      })
    } else {
      const kind = inferJSXRole(tagName)
      if (kind) {
        blocks.push({
          kind,
          order: blocks.length,
          label: truncate(props.title || props.heading || tagName, 40),
          description: truncate(props.description || '', 80),
          isFullWidth: ['nav', 'hero', 'footer', 'section'].includes(kind),
          isProminent: ['hero', 'card', 'metric'].includes(kind),
          quantity: 1,
          depth: 0,
        })
      }
    }
  }

  return deduplicateBlocks(blocks)
}

// ─── Flutter parser ───────────────────────────────────────────────────────────

const FLUTTER_WIDGET_ROLES = {
  AppBar: 'nav',
  BottomNavigationBar: 'nav',
  Drawer: 'nav',
  NavigationRail: 'nav',
  TabBar: 'nav',
  ElevatedButton: 'button',
  FilledButton: 'button',
  TextButton: 'button',
  OutlinedButton: 'button',
  FloatingActionButton: 'button',
  IconButton: 'button',
  TextField: 'input',
  TextFormField: 'input',
  DropdownButton: 'input',
  Slider: 'slider',
  Chip: 'badge',
  Badge: 'badge',
  Card: 'card',
  ListTile: 'card',
  Divider: 'divider',
  VerticalDivider: 'divider',
  BottomSheet: 'footer',
  SnackBar: 'badge',
  ExpansionTile: 'card',
  DataTable: 'section',
  GridView: 'section',
  ListView: 'section',
}

function parseFlutter(code) {
  const blocks = []

  for (const [widget, kind] of Object.entries(FLUTTER_WIDGET_ROLES)) {
    const re = new RegExp(`\\b${widget}\\b`, 'g')
    const matches = [...code.matchAll(re)]
    for (const match of matches) {
      // Extract title/label from nearby Dart string literals
      const nearby = code.slice(Math.max(0, match.index - 30), match.index + 200)
      const labelMatch = nearby.match(/(?:title|label|text|hint|placeholder)\s*:\s*(?:Text\s*\(\s*)?['"]([^'"]{1,50})['"]/)
      const label = labelMatch?.[1] || widget

      blocks.push({
        kind,
        order: blocks.length,
        label: truncate(label, 40),
        description: '',
        isFullWidth: ['nav', 'hero', 'footer', 'section'].includes(kind),
        isProminent: ['hero', 'card'].includes(kind),
        quantity: 1,
        depth: 0,
      })
    }
  }

  return deduplicateBlocks(blocks)
}

// ─── Deduplication & normalization ────────────────────────────────────────────

/**
 * Merge consecutive same-kind blocks into grouped blocks.
 * E.g. 3 consecutive 'card' blocks → one block with quantity=3
 */
function deduplicateBlocks(blocks) {
  if (!blocks.length) return []
  const result = []
  let i = 0

  while (i < blocks.length) {
    const current = blocks[i]

    // Groupable kinds: card, button, metric, badge, input
    const GROUPABLE = new Set(['card', 'button', 'metric', 'badge', 'input'])

    if (GROUPABLE.has(current.kind)) {
      let j = i + 1
      while (j < blocks.length && blocks[j].kind === current.kind && j - i < 4) {
        j++
      }
      const count = j - i
      if (count > 1) {
        result.push({ ...current, quantity: count, order: result.length })
        i = j
        continue
      }
    }

    // Deduplicate exact same kind+label consecutively
    if (result.length > 0 && result[result.length - 1].kind === current.kind &&
        result[result.length - 1].label === current.label && current.depth > 1) {
      i++
      continue
    }

    result.push({ ...current, order: result.length })
    i++
  }

  return result
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Parse UI source code into a normalized list of UIBlocks.
 * @param {string} code — raw source code
 * @returns {{ framework: string, blocks: UIBlock[], elementCount: number }}
 */
export function extractUIBlocks(code) {
  if (!code || typeof code !== 'string' || code.trim().length < 8) {
    return { framework: 'unknown', blocks: [], elementCount: 0 }
  }

  const framework = detectFramework(code)
  let blocks = []

  try {
    switch (framework) {
      case 'react':
        blocks = parseJSX(code)
        break
      case 'vue':
        blocks = parseVue(code)
        break
      case 'react-native':
        blocks = parseReactNative(code)
        break
      case 'flutter':
        blocks = parseFlutter(code)
        break
      default:
        blocks = parseHTML(code)
    }
  } catch {
    blocks = []
  }

  // Ensure all blocks have required fields
  const normalized = blocks.map((b, i) => ({
    kind: b.kind ?? 'section',
    order: i,
    label: truncate(b.label ?? '', 40) || frameworkBlockLabel(b.kind ?? 'section'),
    description: truncate(b.description ?? '', 80),
    isFullWidth: b.isFullWidth ?? false,
    isProminent: b.isProminent ?? false,
    quantity: Math.max(1, Math.floor(b.quantity ?? 1)),
    depth: b.depth ?? 0,
  }))

  return {
    framework,
    blocks: normalized,
    elementCount: normalized.reduce((sum, b) => sum + b.quantity, 0),
  }
}

function frameworkBlockLabel(kind) {
  const LABELS = {
    nav: 'Navigation', hero: 'Hero section', card: 'Card', form: 'Form',
    button: 'Action', input: 'Input field', badge: 'Badge', divider: '',
    slider: 'Slider', metric: 'Metric', footer: 'Footer', section: 'Section',
  }
  return LABELS[kind] ?? kind
}
