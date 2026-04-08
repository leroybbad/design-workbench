# Design Explore — Palette Reference

This file is the data backbone for the Explore skill. It contains complete CSS `:root` token blocks for each adoptable design system and personality archetype.

## Usage Notes

### Rendering palette selection cards

When presenting palettes to the user in the browser, render each palette as a clickable card using `data-choice` attributes. The Explore skill captures clicks by listening for `[data-choice]` elements:

```html
<div class="palette-grid">
  <div class="palette-card" data-choice="material" data-tier="1">
    <div class="palette-swatch" style="background:#6750A4"></div>
    <strong>Material Design</strong>
    <p>Medium density, bold type, elevation surfaces</p>
  </div>
  <!-- repeat for each palette -->
</div>
```

The `data-choice` value must match the palette key used when applying it.

### Applying a chosen palette

Once the user selects a palette, inject its `:root` block into the prototype's `<style>` tag (or prepend a `<style>` element to `<head>`). All tokens use CSS custom properties, so injection replaces the previous palette without touching component markup.

```js
// Example: apply palette by injecting its :root block
const style = document.createElement('style');
style.id = 'dc-palette-override';
style.textContent = chosenRootBlock;
document.head.appendChild(style);
```

---

## Tier 1: Adoptable Systems

These four palettes mirror widely-used production design systems. Use them when the user wants their prototype to feel immediately familiar — cross-platform, enterprise, or SaaS contexts where convention matters.

---

### Material Design

Google's cross-platform design system. Medium density, bold type hierarchy, surface layering with elevation, and expressive rounded corners. The primary purple communicates modern Material You tonality.

**Best for:** Cross-platform apps, data-rich interfaces, Android/web hybrids.

```css
:root {
  /* Colors */
  --color-primary:          #6750A4;
  --color-primary-hover:    #4F378B;
  --color-on-primary:       #FFFFFF;
  --color-bg:               #FFFBFE;
  --color-surface:          #FFFFFF;
  --color-surface-variant:  #E7E0EC;
  --color-border:           #CAC4D0;
  --color-text:             #1C1B1F;
  --color-text-secondary:   #49454F;
  --color-text-tertiary:    #79747E;
  --color-success:          #386A20;
  --color-warning:          #7D5700;
  --color-danger:           #B3261E;

  /* Spacing */
  --space-xs:  0.25rem;
  --space-sm:  0.5rem;
  --space-md:  1rem;
  --space-lg:  1.5rem;
  --space-xl:  2rem;

  /* Typography */
  --font-family:       'Google Sans', 'Roboto', sans-serif;
  --font-xs:           0.6875rem;
  --font-sm:           0.75rem;
  --font-base:         0.875rem;
  --font-lg:           1rem;
  --font-xl:           1.125rem;
  --font-2xl:          1.375rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold:   700;

  /* Shape */
  --radius-sm:   4px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-full: 9999px;
  --shadow-sm:   0 1px 2px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md:   0 1px 2px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.10);
  --shadow-lg:   0 2px 6px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.12);
}
```

---

### Apple HIG

Apple's Human Interface Guidelines aesthetic. Consumer-facing, generous whitespace, SF Pro–inspired type scale, and subtle translucent depth. Clean backgrounds with blue as the trusted action color.

**Best for:** Consumer apps, Apple platforms, lifestyle and productivity tools.

```css
:root {
  /* Colors */
  --color-primary:          #007AFF;
  --color-primary-hover:    #0062CC;
  --color-on-primary:       #FFFFFF;
  --color-bg:               #F2F2F7;
  --color-surface:          #FFFFFF;
  --color-surface-variant:  #E5E5EA;
  --color-border:           #C6C6C8;
  --color-text:             #000000;
  --color-text-secondary:   #3C3C43;
  --color-text-tertiary:    #8E8E93;
  --color-success:          #34C759;
  --color-warning:          #FF9500;
  --color-danger:           #FF3B30;

  /* Spacing */
  --space-xs:  0.25rem;
  --space-sm:  0.5rem;
  --space-md:  1rem;
  --space-lg:  1.75rem;
  --space-xl:  2.5rem;

  /* Typography */
  --font-family:        -apple-system, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  --font-xs:            0.6875rem;
  --font-sm:            0.8125rem;
  --font-base:          0.9375rem;
  --font-lg:            1.0625rem;
  --font-xl:            1.25rem;
  --font-2xl:           1.5rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold:   600;

  /* Shape */
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   18px;
  --radius-full: 9999px;
  --shadow-sm:   0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md:   0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06);
  --shadow-lg:   0 8px 24px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.08);
}
```

---

### Tailwind / Shadcn

Clean, utility-driven, modern SaaS aesthetic. Near-black as the primary action color for a confident, opinionated look. Pairs naturally with Tailwind CSS and the Shadcn/ui component ecosystem.

**Best for:** Web apps, SaaS products, developer tools, startup dashboards.

```css
:root {
  /* Colors */
  --color-primary:          #18181B;
  --color-primary-hover:    #3F3F46;
  --color-on-primary:       #FAFAFA;
  --color-bg:               #FAFAFA;
  --color-surface:          #FFFFFF;
  --color-surface-variant:  #F4F4F5;
  --color-border:           #E4E4E7;
  --color-text:             #09090B;
  --color-text-secondary:   #3F3F46;
  --color-text-tertiary:    #71717A;
  --color-success:          #16A34A;
  --color-warning:          #CA8A04;
  --color-danger:           #DC2626;

  /* Spacing */
  --space-xs:  0.25rem;
  --space-sm:  0.5rem;
  --space-md:  1rem;
  --space-lg:  1.5rem;
  --space-xl:  2rem;

  /* Typography */
  --font-family:        'Inter', 'Geist', system-ui, sans-serif;
  --font-family-mono:   'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace;
  --font-xs:            0.6875rem;
  --font-sm:            0.8125rem;
  --font-base:          0.875rem;
  --font-lg:            1rem;
  --font-xl:            1.125rem;
  --font-2xl:           1.375rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold:   600;

  /* Shape */
  --radius-sm:   4px;
  --radius-md:   6px;
  --radius-lg:   8px;
  --radius-full: 9999px;
  --shadow-sm:   0 1px 2px rgba(0,0,0,0.05);
  --shadow-md:   0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-lg:   0 4px 6px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04);
}
```

---

### Ant Design

Alibaba's enterprise-grade system. Structured, data-heavy, information-dense. The clear blue primary signals action and trust in data-heavy contexts. Optimized for tables, forms, and admin workflows.

**Best for:** Admin dashboards, enterprise tools, back-office applications.

```css
:root {
  /* Colors */
  --color-primary:          #1677FF;
  --color-primary-hover:    #0958D9;
  --color-on-primary:       #FFFFFF;
  --color-bg:               #F5F5F5;
  --color-surface:          #FFFFFF;
  --color-surface-variant:  #FAFAFA;
  --color-border:           #D9D9D9;
  --color-text:             #000000D9;
  --color-text-secondary:   #000000A6;
  --color-text-tertiary:    #00000073;
  --color-success:          #52C41A;
  --color-warning:          #FAAD14;
  --color-danger:           #FF4D4F;

  /* Spacing */
  --space-xs:  0.25rem;
  --space-sm:  0.5rem;
  --space-md:  0.75rem;
  --space-lg:  1rem;
  --space-xl:  1.5rem;

  /* Typography */
  --font-family:        -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Segoe UI', sans-serif;
  --font-xs:            0.625rem;
  --font-sm:            0.75rem;
  --font-base:          0.875rem;
  --font-lg:            1rem;
  --font-xl:            1.125rem;
  --font-2xl:           1.25rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold:   600;

  /* Shape */
  --radius-sm:   2px;
  --radius-md:   6px;
  --radius-lg:   8px;
  --radius-full: 9999px;
  --shadow-sm:   0 1px 2px rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02);
  --shadow-md:   0 3px 6px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.04);
  --shadow-lg:   0 6px 16px rgba(0,0,0,0.06), 0 12px 28px rgba(0,0,0,0.05);
}
```

---

## Tier 2: Personality Archetypes

These six palettes define a mood or working style rather than a named system. Use them when the user wants to express a specific character — density, elegance, playfulness, or drama — without committing to a particular vendor's system.

---

### Corporate Dense

Maximum information density. Compact spacing, small type, heavy use of borders and dividers. Every pixel earns its place. Think Jira, Confluence, or classic enterprise CRUD apps where users live in the interface all day.

**Best for:** Project management tools, ticketing systems, internal ops dashboards.  
**Inspired by:** Atlassian (Jira, Confluence)

```css
:root {
  /* Colors */
  --color-primary:          #0052CC;
  --color-primary-hover:    #0747A6;
  --color-on-primary:       #FFFFFF;
  --color-bg:               #F4F5F7;
  --color-surface:          #FFFFFF;
  --color-surface-variant:  #EBECF0;
  --color-border:           #C1C7D0;
  --color-text:             #172B4D;
  --color-text-secondary:   #42526E;
  --color-text-tertiary:    #6B778C;
  --color-success:          #006644;
  --color-warning:          #FF8B00;
  --color-danger:           #BF2600;

  /* Spacing — tight by design */
  --space-xs:  0.125rem;
  --space-sm:  0.25rem;
  --space-md:  0.5rem;
  --space-lg:  0.75rem;
  --space-xl:  1rem;

  /* Typography — small, readable under dense conditions */
  --font-family:        'Charlie Text', '-apple-system', 'Segoe UI', sans-serif;
  --font-xs:            0.625rem;
  --font-sm:            0.6875rem;
  --font-base:          0.8125rem;
  --font-lg:            0.9375rem;
  --font-xl:            1rem;
  --font-2xl:           1.125rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold:   600;

  /* Shape — square corners, minimal shadow */
  --radius-sm:   2px;
  --radius-md:   3px;
  --radius-lg:   4px;
  --radius-full: 9999px;
  --shadow-sm:   0 1px 1px rgba(9,30,66,0.13);
  --shadow-md:   0 1px 3px rgba(9,30,66,0.13), 0 0 1px rgba(9,30,66,0.08);
  --shadow-lg:   0 3px 6px rgba(9,30,66,0.16), 0 0 1px rgba(9,30,66,0.06);
}
```

---

### Clean & Spacious

Restrained palette, generous whitespace, and confident typography. The indigo primary reads as intelligent and trustworthy without feeling cold. Used where premium positioning matters more than density.

**Best for:** Payment products, fintech, developer-facing SaaS, premium subscriptions.  
**Inspired by:** Stripe

```css
:root {
  /* Colors */
  --color-primary:          #635BFF;
  --color-primary-hover:    #4F46E5;
  --color-on-primary:       #FFFFFF;
  --color-bg:               #F6F9FC;
  --color-surface:          #FFFFFF;
  --color-surface-variant:  #F0F4F8;
  --color-border:           #E0E6EC;
  --color-text:             #0A2540;
  --color-text-secondary:   #425466;
  --color-text-tertiary:    #8898AA;
  --color-success:          #09825D;
  --color-warning:          #C98A00;
  --color-danger:           #CD3D64;

  /* Spacing — generous breathing room */
  --space-xs:  0.375rem;
  --space-sm:  0.75rem;
  --space-md:  1.25rem;
  --space-lg:  2rem;
  --space-xl:  3rem;

  /* Typography */
  --font-family:        'Sohne', 'Inter', system-ui, sans-serif;
  --font-family-mono:   'Roboto Mono', 'Fira Code', monospace;
  --font-xs:            0.6875rem;
  --font-sm:            0.8125rem;
  --font-base:          0.9375rem;
  --font-lg:            1.0625rem;
  --font-xl:            1.25rem;
  --font-2xl:           1.625rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold:   700;

  /* Shape — subtle radius, refined shadows */
  --radius-sm:   4px;
  --radius-md:   6px;
  --radius-lg:   10px;
  --radius-full: 9999px;
  --shadow-sm:   0 2px 5px rgba(10,37,64,0.06), 0 1px 2px rgba(10,37,64,0.04);
  --shadow-md:   0 4px 14px rgba(10,37,64,0.10), 0 2px 4px rgba(10,37,64,0.06);
  --shadow-lg:   0 15px 35px rgba(10,37,64,0.12), 0 5px 15px rgba(10,37,64,0.08);
}
```

---

### Neon AI

Dark-first, vibrant accent, built for the future. Cyan on near-black creates a technical, luminous feel. Glow shadows and monospace type accents signal computation and intelligence. At home in AI tools, coding environments, and developer products.

**Best for:** AI assistants, dev tools, terminal-adjacent UIs, data visualization platforms.  
**Inspired by:** —

```css
:root {
  /* Colors */
  --color-primary:          #00E5FF;
  --color-primary-hover:    #00B8D4;
  --color-on-primary:       #0A0A0F;
  --color-bg:               #0A0A0F;
  --color-surface:          #13131A;
  --color-surface-variant:  #1C1C28;
  --color-border:           #2A2A3C;
  --color-text:             #E8E8F0;
  --color-text-secondary:   #9898B0;
  --color-text-tertiary:    #5A5A78;
  --color-success:          #00E676;
  --color-warning:          #FFD740;
  --color-danger:           #FF5252;

  /* Spacing */
  --space-xs:  0.25rem;
  --space-sm:  0.5rem;
  --space-md:  1rem;
  --space-lg:  1.5rem;
  --space-xl:  2.5rem;

  /* Typography */
  --font-family:       'Inter', system-ui, sans-serif;
  --font-family-mono:  'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  --font-xs:           0.6875rem;
  --font-sm:           0.8125rem;
  --font-base:         0.9375rem;
  --font-lg:           1.0625rem;
  --font-xl:           1.25rem;
  --font-2xl:          1.5rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold:   700;

  /* Shape — glow shadows for the dark theme */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-full: 9999px;
  --shadow-sm:   0 0 8px rgba(0,229,255,0.15);
  --shadow-md:   0 0 16px rgba(0,229,255,0.20), 0 4px 12px rgba(0,0,0,0.40);
  --shadow-lg:   0 0 32px rgba(0,229,255,0.25), 0 8px 24px rgba(0,0,0,0.60);
}
```

---

### Editorial

Reading-optimized. Serif headings signal depth and craft. The type scale is generous to support long-form content, and the near-black primary keeps attention on text rather than chrome. Built for content where ideas are the product.

**Best for:** Publishing, blogs, documentation, research tools, long-form reading apps.  
**Inspired by:** —

```css
:root {
  /* Colors */
  --color-primary:          #1A1A1A;
  --color-primary-hover:    #3A3A3A;
  --color-on-primary:       #FFFFFF;
  --color-bg:               #FAFAF8;
  --color-surface:          #FFFFFF;
  --color-surface-variant:  #F2F2EE;
  --color-border:           #D8D8D0;
  --color-text:             #1A1A1A;
  --color-text-secondary:   #4A4A45;
  --color-text-tertiary:    #8A8A82;
  --color-success:          #2E7D32;
  --color-warning:          #E65100;
  --color-danger:           #C62828;

  /* Spacing — comfortable reading rhythm */
  --space-xs:  0.375rem;
  --space-sm:  0.75rem;
  --space-md:  1.25rem;
  --space-lg:  2rem;
  --space-xl:  3.5rem;

  /* Typography — serif-led, high line-height */
  --font-family:        Georgia, 'Times New Roman', serif;
  --font-family-body:   'Charter', Georgia, serif;
  --font-xs:            0.75rem;
  --font-sm:            0.875rem;
  --font-base:          1.0625rem;
  --font-lg:            1.25rem;
  --font-xl:            1.5rem;
  --font-2xl:           2rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold:   700;

  /* Shape — soft but understated */
  --radius-sm:   2px;
  --radius-md:   4px;
  --radius-lg:   6px;
  --radius-full: 9999px;
  --shadow-sm:   0 1px 3px rgba(26,26,26,0.08);
  --shadow-md:   0 3px 8px rgba(26,26,26,0.10), 0 1px 3px rgba(26,26,26,0.06);
  --shadow-lg:   0 8px 20px rgba(26,26,26,0.12), 0 3px 8px rgba(26,26,26,0.08);
}
```

---

### Playful

Rounded, saturated, and a bit oversized. Generous border-radius and a vibrant purple primary make every interaction feel inviting. Type is slightly larger than typical to feel approachable. Designed for delight.

**Best for:** Consumer apps, creative tools, education, games, kids' products, community platforms.  
**Inspired by:** —

```css
:root {
  /* Colors */
  --color-primary:          #6C5CE7;
  --color-primary-hover:    #5649C0;
  --color-on-primary:       #FFFFFF;
  --color-bg:               #FDFCFF;
  --color-surface:          #FFFFFF;
  --color-surface-variant:  #F0EEFF;
  --color-border:           #D8D2F8;
  --color-text:             #2D2B55;
  --color-text-secondary:   #5A5580;
  --color-text-tertiary:    #9990CC;
  --color-success:          #00B894;
  --color-warning:          #FDCB6E;
  --color-danger:           #FF6B6B;

  /* Spacing — roomy and relaxed */
  --space-xs:  0.375rem;
  --space-sm:  0.75rem;
  --space-md:  1.25rem;
  --space-lg:  2rem;
  --space-xl:  2.5rem;

  /* Typography — slightly large, friendly weight */
  --font-family:        'Nunito', 'DM Sans', system-ui, sans-serif;
  --font-xs:            0.75rem;
  --font-sm:            0.875rem;
  --font-base:          1rem;
  --font-lg:            1.125rem;
  --font-xl:            1.375rem;
  --font-2xl:           1.75rem;
  --font-weight-normal: 400;
  --font-weight-medium: 600;
  --font-weight-bold:   800;

  /* Shape — very rounded, soft shadows */
  --radius-sm:   10px;
  --radius-md:   16px;
  --radius-lg:   24px;
  --radius-full: 9999px;
  --shadow-sm:   0 2px 8px rgba(108,92,231,0.10);
  --shadow-md:   0 4px 16px rgba(108,92,231,0.15), 0 2px 6px rgba(108,92,231,0.08);
  --shadow-lg:   0 8px 32px rgba(108,92,231,0.20), 0 4px 12px rgba(108,92,231,0.12);
}
```

---

### Minimal Mono

Color is not the message here — structure is. Near-zero chromatic color; all semantic states (success, warning, danger) are rendered in near-black so type weight and spacing carry all hierarchy. For interfaces that need to feel authoritative without visual noise.

**Best for:** Legal, financial, writing tools, terminal UIs, high-stakes dashboards where color would distract.  
**Inspired by:** —

```css
:root {
  /* Colors — monochromatic with near-zero chroma */
  --color-primary:          #111111;
  --color-primary-hover:    #333333;
  --color-on-primary:       #FFFFFF;
  --color-bg:               #FFFFFF;
  --color-surface:          #FAFAFA;
  --color-surface-variant:  #F2F2F2;
  --color-border:           #DEDEDE;
  --color-text:             #111111;
  --color-text-secondary:   #444444;
  --color-text-tertiary:    #888888;
  --color-success:          #111111;
  --color-warning:          #111111;
  --color-danger:           #111111;

  /* Spacing */
  --space-xs:  0.25rem;
  --space-sm:  0.5rem;
  --space-md:  1rem;
  --space-lg:  1.75rem;
  --space-xl:  2.5rem;

  /* Typography — monospace option available, weight-driven hierarchy */
  --font-family:       'DM Mono', 'Fira Mono', 'Courier New', monospace;
  --font-family-mono:  'DM Mono', 'Fira Mono', 'Courier New', monospace;
  --font-xs:           0.6875rem;
  --font-sm:           0.8125rem;
  --font-base:         0.9375rem;
  --font-lg:           1.0625rem;
  --font-xl:           1.25rem;
  --font-2xl:          1.5rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold:   700;

  /* Shape — flat, minimal shadow */
  --radius-sm:   0px;
  --radius-md:   2px;
  --radius-lg:   4px;
  --radius-full: 9999px;
  --shadow-sm:   0 1px 2px rgba(0,0,0,0.04);
  --shadow-md:   0 2px 6px rgba(0,0,0,0.06);
  --shadow-lg:   0 4px 12px rgba(0,0,0,0.08);
}
```
