# Design System Specification: High-End Editorial Leave Planning

## 1. Overview & Creative North Star
### The Creative North Star: "The Curated Escape"
This design system moves away from the rigid, spreadsheet-like nature of traditional planners. Instead, it adopts the persona of a high-end travel editorial. We are not just "tracking days off"; we are "curating time." 

To break the "template" look, we utilize **Intentional Asymmetry** and **Tonal Layering**. By eschewing traditional borders and harsh grids, we create a fluid, organic interface that feels as breathable as a vacation. The layout uses high-contrast typography scales (the "Editorial Jump") to guide the eye, making the act of planning feel like a premium, stress-free experience.

---

## 2. Colors & Surface Philosophy
The palette rejects "Corporate Blue" in favor of a warm, sunset-inspired spectrum. 

- **Primary (`#9b4500` to `#ff8c42`):** Sunset Orange. Used for active states and "The Big Trip" calls to action.
- **Secondary (`#19648d` to `#91d0fe`):** Soft Sky Blue. Used for general leave tracking and calm data points.
- **Tertiary (`#006e1c` to `#5cbf5e`):** Tropical Green. Reserved exclusively for Public Holidays and "Found Time" to signify growth and opportunity.

### The "No-Line" Rule
**Explicit Instruction:** Prohibit the use of 1px solid borders for sectioning. 
Boundaries must be defined solely through background color shifts. For instance, a `surface_container_low` card should sit on a `surface` background. If you feel the need for a line, you haven't used your surface tokens correctly.

### The "Glass & Gradient" Rule
To provide visual "soul," primary buttons and hero cards should never be flat. Use a subtle linear gradient from `primary` to `primary_container` (at 15% opacity overlay) to create a sense of light source. Floating elements (like the Country Selector) should utilize **Glassmorphism**: a semi-transparent `surface_container_lowest` with a `20px` backdrop-blur.

---

## 3. Typography: The Editorial Scale
We pair **Plus Jakarta Sans** (Display/Headlines) with **Be Vietnam Pro** (Body/Labels) to balance high-fashion editorial vibes with modern productivity.

| Role | Token | Font | Size | Intent |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Plus Jakarta Sans | 3.5rem | High-impact "Year at a Glance" numbers. |
| **Headline** | `headline-md` | Plus Jakarta Sans | 1.75rem | Monthly headers and Leave Opportunity titles. |
| **Title** | `title-lg` | Be Vietnam Pro | 1.375rem | Card titles and primary navigation. |
| **Body** | `body-lg` | Be Vietnam Pro | 1rem | Standard data entry and descriptions. |
| **Label** | `label-md` | Plus Jakarta Sans | 0.75rem | Metadata, caps-on for "Days Remaining." |

---

## 4. Elevation & Depth: Tonal Layering
We do not use structural lines. We use physics.

- **The Layering Principle:** Depth is achieved by "stacking" surface tiers. Place a `surface_container_lowest` card on a `surface_container_low` section to create a soft, natural lift. 
- **Ambient Shadows:** For floating Year Pickers or Modals, use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(86, 67, 56, 0.08)`. Note the use of the `on_surface_variant` color for the shadow tint—never use pure black.
- **The "Ghost Border" Fallback:** If accessibility requires a stroke (e.g., input focus), use the `outline_variant` token at **20% opacity**. 100% opaque borders are strictly forbidden.

---

## 5. Components

### Leave Opportunity Cards
*The centerpiece of the system.*
- **Structure:** Use `surface_container_lowest` with a `lg` (2rem) corner radius.
- **Iconography:** Use large Emoji icons set against a `tertiary_fixed` circular background.
- **Separation:** No dividers. Use `spacing-6` (2rem) of vertical white space to separate the header from the "Days Saved" stats.
- **Accent:** A subtle `primary` gradient "glow" on the bottom edge to indicate a "Hot Deal" or "High Value" leave period.

### Country Selector & Year Picker
- **Style:** Glassmorphic dropdowns using `surface_container_highest` at 80% opacity with backdrop-blur.
- **Flags:** Circular masks only. Never square.
- **Interaction:** Hover states should shift the background from `surface_container_low` to `surface_container_high`.

### Data-Entry Toggles
- **Track:** Use `surface_container_highest`.
- **Thumb:** Use `primary` for "On" and `outline` for "Off."
- **Shape:** `full` (9999px) roundedness for a friendly, pill-like feel.

### Buttons
- **Primary:** Gradient from `primary` to `primary_container`. `xl` (3rem) corner radius. No shadow unless hovered.
- **Secondary:** Transparent background with a `Ghost Border` (20% `outline_variant`).
- **Tertiary:** Text-only using `secondary` color, bolded, with an underline that only appears on hover.

---

## 6. Do’s and Don’ts

### Do:
- **Use "The Editorial Jump":** Contrast a `display-lg` year (2024) with a `label-sm` subtitle.
- **Embrace White Space:** If the layout feels "tight," double your spacing tokens. High-end design needs room to breathe.
- **Tone-on-Tone:** Use `on_surface_variant` for secondary text to keep the interface soft.

### Don’t:
- **Don't use 1px dividers.** Use a `spacing-px` height box with `surface_variant` color at 50% opacity if absolutely desperate, but try a background shift first.
- **Don't use corporate grays.** Every "gray" in this system is tinted with warm sun or earth tones (`#faf9f6`).
- **Don't use sharp corners.** Everything must have at least a `sm` (0.5rem) radius to maintain the "Friendly/Vacation" personality.

### Interaction Note:
When a user toggles a leave day, use a "Spring" animation (stiffness: 300, damping: 20). The UI should feel as bouncy and energetic as the first day of a holiday.