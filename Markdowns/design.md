# Glassmorphism / Soft Glass UI Design System Specification

## Design Style Overview

This UI follows a modern **Glassmorphism + Soft UI (Neumorphic Glass)** aesthetic.

The interface combines:

- Frosted glass surfaces
- Semi-transparent layers
- Soft ambient shadows
- Blurred backgrounds
- Subtle highlights
- Rounded pill-shaped components
- Minimal color palette
- Floating depth illusion

The overall feeling should be:

- Premium
- Elegant
- Futuristic
- Calm
- Spacious
- Apple Vision Pro inspired
- Luxury SaaS dashboard aesthetic

---

# Core Design Principles

## 1. Floating Components

Every interactive element should appear to float above the background.

Characteristics:

- Soft elevation
- Large border radius
- Subtle shadows
- Light reflections
- Thin translucent borders

Avoid:

- Flat cards
- Harsh borders
- Strong dark shadows

---

## 2. Frosted Glass Effect

All UI surfaces should use glass styling.

Properties:

```css
background: rgba(255,255,255,0.15);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);

border: 1px solid rgba(255,255,255,0.25);
```

Visual appearance:

- Semi-transparent
- Frosted
- Light diffusion
- Soft edge glow

---

## 3. Soft Depth

Instead of traditional Material Design shadows:

Use layered shadows.

Example:

```css
box-shadow:
  0 8px 24px rgba(0,0,0,0.08),
  0 2px 8px rgba(255,255,255,0.4) inset;
```

The goal is subtle depth.

Not dramatic elevation.

---

## 4. Rounded Geometry

Everything should be highly rounded.

Recommended radii:

| Element | Radius |
|----------|----------|
| Buttons | 999px |
| Inputs | 999px |
| Chips | 999px |
| Toggles | 999px |
| Cards | 24px–32px |
| Modals | 32px |

Avoid sharp corners.

---

# Color System

## Background

Use soft neutral tones.

Examples:

```css
#F5F5F5
#EFEFEF
#EAEAEA
#DDD8D3
#D7D0CA
```

Background should never be pure white.

---

## Primary Accent

Soft blue accent.

Examples:

```css
#BFD8FF
#AFCBFF
#9ABEFF
#8BB6FF
```

Use only for:

- Active tabs
- Selected buttons
- Toggles
- Highlights

---

## Text

Primary:

```css
#111111
```

Secondary:

```css
#555555
```

Muted:

```css
#777777
```

---

# Typography

## Font Style

Recommended:

- Inter
- SF Pro Display
- Geist
- Plus Jakarta Sans

---

## Font Weights

Headings:

```css
font-weight: 600;
```

Body:

```css
font-weight: 400;
```

Labels:

```css
font-weight: 500;
```

---

## Typography Rules

- Large whitespace
- High readability
- Minimal text density

Avoid:

- Tiny text
- Excessive labels
- Heavy bold usage

---

# Component Specifications

---

# Buttons

## Primary Button

Appearance:

- Frosted glass
- Soft blue fill
- Elevated shadow
- Pill shape

```css
height: 48px;
border-radius: 999px;
```

States:

### Default

Soft blue background

### Hover

Slightly brighter

### Active

Slightly darker

### Disabled

Reduced opacity

---

## Secondary Button

Appearance:

- Transparent glass
- White translucent fill

```css
background: rgba(255,255,255,0.12);
```

---

# Search Input

Appearance:

- Large pill shape
- Frosted glass
- Left icon
- Soft border

Specs:

```css
height: 56px;
padding-inline: 24px;
border-radius: 999px;
```

---

# Toggle Switch

Style:

- Floating capsule
- Rounded track
- Glass surface

Thumb:

```css
border-radius: 999px;
```

Active state:

Soft blue thumb.

---

# Segmented Controls

Example:

```text
Today | Week
```

Selected segment:

- Blue background
- Raised appearance

Unselected segment:

- Transparent glass

Container:

```css
border-radius: 999px;
```

---

# Tabs

Style:

- Embedded glass container
- Sliding active indicator

Example:

```text
Home | Library | Profile
```

Active tab:

- Light blue highlight
- Slight glow

---

# Dropdowns

Appearance:

- Glass card
- Minimal border
- Soft blur

Avoid traditional browser dropdown styling.

---

# Cards

Cards should feel like floating glass sheets.

Properties:

```css
border-radius: 28px;

backdrop-filter: blur(24px);

background: rgba(255,255,255,0.12);
```

Shadow:

```css
box-shadow:
0 12px 32px rgba(0,0,0,0.08);
```

---

# Layout Rules

## Spacing

Use generous spacing.

Recommended scale:

```text
8
12
16
24
32
48
64
```

Avoid crowded layouts.

---

## Alignment

Strong horizontal alignment.

Components should feel organized and balanced.

---

## Content Width

Dashboard:

```css
max-width: 1400px;
```

Forms:

```css
max-width: 600px;
```

---

# Motion Design

Animations should be smooth.

Duration:

```css
150ms - 300ms
```

Easing:

```css
ease-out
```

---

## Hover Effects

Use:

- Lift
- Glow
- Slight brightness

Example:

```css
transform: translateY(-2px);
```

Avoid:

- Bouncy effects
- Aggressive scaling

---

# Visual Inspiration Keywords

Use these keywords when generating new UI sections:

- Glassmorphism
- Frosted Glass
- Apple Vision Pro
- Soft UI
- Luxury SaaS
- Floating Panels
- Modern Dashboard
- Ambient Lighting
- Elegant Transparency
- High-End Productivity App
- Premium AI Product
- Spatial Interface
- Depth Through Blur
- Minimal Futuristic UI

---

# AI Refactoring Instructions

When redesigning the current website:

1. Convert all cards into glass surfaces.
2. Convert buttons into pill-shaped floating components.
3. Add backdrop blur to all containers.
4. Replace sharp corners with rounded geometry.
5. Reduce visual noise.
6. Increase whitespace by 20–30%.
7. Use soft shadows instead of hard borders.
8. Introduce subtle blue accent highlights.
9. Maintain accessibility and contrast.
10. Preserve functionality while upgrading aesthetics.
11. Make the design feel like Apple Vision Pro meets Linear meets modern AI SaaS.
12. Do not use skeuomorphism.
13. Do not use heavy gradients.
14. Keep everything minimal, premium, and futuristic.

---

# Desired Final Outcome

The final interface should feel like:

- Apple Vision Pro
- Arc Browser
- Linear
- Raycast
- Modern AI SaaS products

while maintaining:

- High readability
- Fast usability
- Clean hierarchy
- Professional production-ready appearance