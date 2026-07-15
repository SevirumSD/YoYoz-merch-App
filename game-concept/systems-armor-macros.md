# System Design — Living Suit Systems (Morph, Macros, Danger Sense)

> Creator ideas (2026-07). Status: concepts approved for design bible; visual
> treatments pending.

## 1. Nanite armor transformation (the "Mystique morph")

When the player changes armor sets, the swap is rendered diegetically: the
suit's nanites visibly reshape from the old set into the new one (reference
feel: Mystique's transformation in the X-Men films — a ripple that travels
across the body leaving the new surface behind).

- Justified by canon: Zeniths (and all adaptive-tech descendants of
  Azrael-0) are living nanite systems. The swap IS the fantasy.
- On armor pickup/unlock: player chooses keep current look or morph into the
  new set (transmog-friendly from day one).

### UE5 implementation sketch
- Master material with a world/body-space **reveal mask sweep** (dissolve of
  old set / reveal of new set along a travelling front).
- **Niagara pass riding the sweep line** — nanite shimmer particles.
- Soft mesh crossfade underneath (old set mesh → new set mesh).
- Sweep origin: the character's suit core (chest/helmet focal per art
  direction) — outward ripple.
- Build once, reuse for every set and every character.

### Design upgrade: morph speed as mechanics
- Out of combat: slow, cinematic morph (show-off mode).
- In combat: snap-morph with a brief vulnerability window and/or suit-energy
  cost. Adaptation under pressure = the universe's thesis, made tactile.

## 2. Macro system (FFXI-inspired, evolved)

Reference: FFXI's macro books bound to controller input — but with the two
things FFXI never gave players:

1. **Far more storage** — pages of named macro lines per character (data is
   cheap; generosity is the feature).
2. **Macro chaining** — a macro can activate another macro. Primary use:
   one input = armor set change + weapon change + stance/ability toggles.

### Structure
- **Trigger layer:** D-pad (main) or radial menu — player-configurable.
- **Action layer:** macro lines (equip set X, swap weapon Y, toggle Z).
- **Composition layer:** chains — macros invoking macros, e.g. "Siege Mode"
  = heavy set + gatling loadout + defensive stance in one press.

### Balancing rule (canon-flavored)
Chains cost **nanite reconfiguration time/energy** that scales with chain
length. Short chains are snappy; long god-chains leave the character
visibly mid-morph and vulnerable. The Mystique visual doubles as the cost
indicator. This prevents "one-button optimal rotation" scripting from
collapsing combat depth — the fix is diegetic, not a UI restriction.

### Characterization hook (optional)
Loadout-system depth can differ per Ghost: fixed quick-sets for most
members, with **Sevirum's adaptive Zenith allowing full unrestricted
chaining** — the only suit that can truly re-imagine itself mid-fight.
System design as characterization.

## 3. Suit danger sense (diegetic threat detection)

Creator concept: if the player pays close attention, the suit itself
**shivers and moves** when it senses danger or a very dangerous enemy — the
living nanite armor reacting like a prey animal before the player sees
anything.

- **No UI. The suit IS the UI.** Rewards observation; inattentive players
  walk into the ambush. Doubles as free horror/dread (the suit flinches
  before anything appears on screen).
- **Tiered to the threat ladders:**
  - Minor threats → faint nanite shimmer.
  - Elites → directional ripple (nanites lean toward/away from the threat's
    bearing — an organic compass for attentive players).
  - Omega-class → full bristle: half-formed spikes, glow drops to embers.
  - Boss-specific reactions as enemy characterization (dead-still freeze for
    Longshadow; frantic ripple for Shardclaw packs; etc.).
- **Sense layering:** visual shiver + sub-audible nanite whisper +
  heartbeat-pattern haptic rumble (the suit's fear felt in the hands).
- **Lore/story hooks:** danger-sense as per-suit personality. Sevirum's
  adaptive Zenith reacts to things no other suit registers (Azrael-0,
  Belthizar). A suit reacting to a *friendly* NPC = silent foreshadowing
  tool (The Faction arc).
- **Accessibility guardrail:** optional subtle HUD pulse mirroring the cue
  so hearing/vision-impaired players receive the same information.

## Open items
- Final visual treatment of the morph (creator: "still pending").
- In-combat swap rules (allowed everywhere vs safe zones vs cooldown).
- UI: macro editor scope for prototype vs full game (prototype needs none —
  this is a post-vertical-slice system).
