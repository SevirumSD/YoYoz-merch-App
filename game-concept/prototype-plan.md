# Prototype Plan — UE5 Vertical Slice

> Model: *Implosion: Never Lose Hope* — tight arenas, combo-driven melee,
> short mission structure, overwhelming game-feel. The prototype's only job:
> **make swinging a blade at one enemy feel incredible.**

## Scope (v0 — the honest checklist)

1. **UE 5.x**, Third Person template base. C++ + Blueprints hybrid.
2. **One playable Ghost** (default Sevirum; Linora is the alternate pick —
   see open question #17). Paragon free assets as stand-ins until real
   models exist.
3. **Combat core before content:**
   - Light/heavy attack combo chains (3-hit light, 2-hit heavy, mix branches)
   - Dodge with i-frames
   - One charged special (suit ability — e.g. Nano Swarm / Phantom Dash)
   - **Game-feel layer FIRST-CLASS: hitstop, camera shake, impact VFX,
     sound, enemy stagger** — this is 80% of why Implosion feels good
4. **One enemy type** with simple AI (approach → telegraph → attack →
   stagger window). Abyssal Spawn tier (bottom of Vaelthar's hierarchy —
   lore-correct fodder).
5. **One arena** committing fully to the art direction (dark + one accent).
6. Fixed-ish isometric-to-shoulder camera test — pick what reads best.

## Explicitly OUT of v0

- Adaptive suit systems, mode switching, elemental sword forms
- Multiple characters / squad play
- Guns (melee first; Implosion adds ranged as seasoning later)
- Bosses, story scenes, dialogue, inventory
- Any final art

## Milestones

| # | Deliverable | Done when |
|---|---|---|
| 0 | Repo + UE project boots | Fresh repo (separate from this one), UE5 project, character moves in graybox |
| 1 | **The Swing** | One light attack with hitstop/VFX/sound that already feels great |
| 2 | Combat loop | Combos + dodge + special vs 3 dummies; squad-play decision made (OQ #16) |
| 3 | The Fight | 1 enemy AI, stagger, health, death; 5 enemies in arena is fun for 5 minutes |
| 4 | The Slice | Arena with art pass, Ghost stand-in reskin, 1 suit ability, menu-free loop |

## Later-era hooks the lore already supports

- **Belthizar** as the recurring rival boss (sheet literally specifies:
  Intelligent AI • High Mobility • Adaptive Difficulty).
- **Kortharax** as first raid-tier boss (sheet ships with production specs).
- ExZer relic minibosses (BirdEater in ruins), Caesar "the enemies learn"
  difficulty mechanic, Archon superboss.
- Dossier/codex system = Curators Archive; unknowns fill in as you fight.
- Terran companion beat for the feels.

## Repo strategy

Game gets its **own fresh repository** when prototype work starts. This
folder (game-concept/) migrates in as `/docs/design/`. The YoYoz merch app
repo is a temporary home for the bible only.
