# RetroRoom Unity Lab — Design Spec

Date: 2026-08-12
Status: Approved design, pre-implementation
Primary target: Android / Xiaomi 13T Pro
Reference build: RetroRoom HTML V5.6

## 1. Goal

Create a separate Unity-based RetroRoom prototype that aims for an EmuVR-like mobile experience while preserving the proven RetroRoom HTML V5.6 as the stable functional reference.

The Unity Lab must not replace or modify the V5.6 code path during the prototype phase. Its purpose is to prove that a real 3D room, touch-first navigation, physical interactions, and a CRT-centric console workflow can deliver a substantial visual and experiential upgrade on the Xiaomi 13T Pro without sacrificing acceptable performance.

## 2. Product principles

- Android-first, specifically tuned and tested on Xiaomi 13T Pro.
- First-person, explorable room from the first playable prototype.
- The room itself is the interface; avoid dashboard-heavy UI.
- Dense 1990s bedroom atmosphere rather than sparse benchmark scenes.
- Preserve the visual identity already validated in RetroRoom: large CRT, warm lamp light, blue neon, shelves, beige PC, posters, night window, magazines, VHS/game clutter.
- Emulation must be architecturally anticipated from day one, but must not block the first 3D prototype.
- RetroRoom HTML V5.6 remains frozen as the stable reference and fallback.

## 3. Prototype 0.1 scope

The first Android APK must allow the user to:

1. Launch directly into the 3D bedroom.
2. Move with a left virtual joystick.
3. Look around by dragging on the right side of the screen.
4. Aim at interactable objects with a subtle center reticle.
5. Pick up and move selected objects.
6. Pick up a game cartridge.
7. Bring the cartridge to a compatible console slot.
8. Insert/snap the cartridge into the console.
9. Press a physical POWER control.
10. Turn on the CRT and display a test animation/render source.
11. Hear basic power/CRT ambience.
12. Toggle between Performance and Quality graphics presets.
13. Display a lightweight FPS/debug readout when debug mode is enabled.

Prototype 0.1 explicitly does NOT include a real emulator core.

## 4. Interaction model

### Player controls

- Left thumb: movement joystick.
- Right drag area: camera look.
- Small center reticle: current interaction target.
- Contextual action button appears only when a valid target is in range.

### Object interactions

Interactable objects implement one common interaction contract.

Initial supported actions:

- inspect/target,
- pick up,
- hold,
- release,
- snap into compatible slot,
- activate/power.

The first prototype should favor stable, readable interactions over full physics simulation. Held objects should feel physical but must not depend on unstable free-body physics for basic use.

### Room-as-inventory

No traditional inventory screen is planned for the core experience. Shelves, boxes, tables, consoles and storage surfaces act as the physical library/inventory.

## 5. Technical architecture

The prototype should use small, isolated systems with explicit responsibilities.

### PlayerController

Owns:

- movement,
- camera look,
- touch input routing,
- interaction range,
- mobile sensitivity settings.

It does not own object-specific behavior.

### InteractionSystem

Owns:

- raycast/target selection,
- reticle state,
- contextual action availability,
- dispatching interaction requests to objects.

### GrabbableObject

Owns:

- pickup/release state,
- held transform behavior,
- optional physics handoff,
- snap eligibility.

### GameMedia

Represents a cartridge/disc/game object.

Data includes:

- system identifier,
- title,
- media type,
- optional ROM/library identifier reserved for later use.

### ConsoleStation

Owns:

- supported system/media types,
- media slot,
- inserted media state,
- POWER state,
- connection to a CRT target,
- calls to the emulator abstraction.

### CRTController

Owns:

- CRT power state,
- screen material/render target,
- startup/shutdown effects,
- scanline/noise/glow presentation where affordable,
- audio hum/buzz,
- future emulator video surface.

### EmulatorBridge

This is an abstraction boundary, not a real emulator in 0.1.

Required contract conceptually:

- load game/media,
- start,
- stop,
- reset,
- expose video output target,
- receive logical controller input,
- report basic runtime state/errors.

Prototype 0.1 uses a FakeEmulatorBridge/test source so ConsoleStation and CRTController can be implemented against the final interface shape without bundling a core.

### RomLibrary

Reserved data/service boundary for later Android storage integration.

It should not be implemented beyond interfaces/data placeholders needed by 0.1.

### QualityManager

Owns graphics presets and device-oriented runtime tuning.

Initial presets:

- Performance
- Quality

Target behavior should permit later adaptive scaling without changing scene/gameplay systems.

## 6. Data-driven console/game model

Console and game definitions should be data-driven rather than hard-coded into interaction scripts.

Use Unity-native data assets or equivalent structured definitions for:

### ConsoleDefinition

- id,
- display name,
- compatible media/system ids,
- controller profile id,
- future emulator/core mapping,
- CRT routing metadata.

### GameDefinition

- id,
- title,
- system id,
- media type,
- future ROM/library metadata.

This boundary is intended to make SNES, Mega Drive, Game Gear and later systems additive rather than requiring new interaction architecture.

## 7. Visual direction

The room must preserve the established RetroRoom identity while becoming fully spatial.

Required motifs:

- large CRT as the visual anchor,
- dark wood/furniture,
- warm tungsten desk/lamp lighting,
- blue neon accent with “L’électron libre”,
- beige 1990s computer,
- shelves packed with game/VHS boxes,
- posters,
- magazines and believable clutter,
- night-city/window ambience,
- visible cabling and small props where performance allows.

The goal is not photorealism. The goal is a convincing, dense, nostalgic room with strong lighting and material response that is clearly more immersive than the static 2.5D HTML presentation.

## 8. Rendering and performance strategy

Engine target: Unity 6 with URP.

Android should be configured from the beginning rather than as a later port.

### Performance targets

- Preferred target: 60 FPS.
- Acceptable fallback: stable 30 FPS.
- Avoid unstable frame pacing even if average FPS is high.

### Rendering principles

- Hybrid/baked lighting for most static environment lighting.
- Keep dynamic lights limited to visually important sources.
- CRT/neon may use lightweight emissive presentation; expensive real-time lighting effects should be profile-dependent.
- Reuse materials aggressively.
- Use atlas/shared texture strategies where appropriate.
- Use LODs for objects that benefit from them.
- Use occlusion/culling only after profiling proves benefit.
- Avoid excessive transparent materials and overdraw.
- Avoid expensive post-processing by default on mobile.

### Assets

Runtime 3D asset contract should be clean, mobile-ready models and textures. Source assets may come from external DCC workflows, but Unity imports should be normalized for scale, pivots, material reuse and collision.

The room should not be reduced to a sparse scene merely to reach benchmark numbers; optimization should first target lighting, shadows, texture size, LOD, resolution and draw calls.

## 9. CRT pipeline

The CRT must be designed around a replaceable video source.

Prototype 0.1:

- CRT screen receives a test RenderTexture/animated source.
- Power transitions and screen presentation are real.
- ConsoleStation drives CRT state through the EmulatorBridge abstraction.

Later emulator integration:

- replace the fake source with emulator video output,
- preserve the same CRT material/screen surface,
- preserve the same ConsoleStation interaction flow.

No scene redesign should be required to introduce real emulation.

## 10. Planned emulator path

Real emulation is intentionally deferred until the 3D APK proves itself.

First target system after 0.1: Game Gear.

Reason:

- simple ROM format (.gg),
- simple controls,
- already validated in RetroRoom HTML,
- low complexity compared with N64/PS1,
- good test of the complete ROM → core → video → input pipeline.

A later implementation phase will evaluate the best native/embedded emulator strategy for Unity/Android without assuming EmulatorJS can simply be reused as-is.

## 11. Audio

Prototype 0.1 should include only lightweight ambience needed for presence:

- room tone,
- CRT hum/buzz,
- console power click,
- cartridge insertion feedback.

Audio must remain modular and optional per object/system.

## 12. Error handling and robustness

The prototype should fail clearly rather than silently.

Examples:

- incompatible cartridge: reject snap and provide subtle feedback,
- no media inserted: CRT may power to an idle/no-signal state,
- already-held object: prevent duplicate ownership,
- unavailable render source: CRT uses safe fallback/no-signal material,
- bad configuration data: log a clear developer-facing error and disable only the affected object when possible.

## 13. Testing strategy

### Editor tests

- input action mapping,
- compatible/incompatible media snap rules,
- ConsoleStation state transitions,
- CRT power transitions,
- EmulatorBridge fake implementation behavior,
- data definition validation.

### Device tests on Xiaomi 13T Pro

For every meaningful visual/system milestone, validate:

- APK launch,
- touch controls,
- camera comfort,
- pickup/snap usability,
- frame pacing,
- temperature/throttling signs during longer sessions,
- Performance preset,
- Quality preset,
- visual regressions around CRT/lighting.

Device performance is authoritative; editor performance is not sufficient.

## 14. Success criteria for Prototype 0.1

Prototype 0.1 is successful only if all of the following are true:

- the room is genuinely explorable on Android,
- touch navigation feels usable,
- at least one cartridge can be picked up and inserted reliably,
- console POWER drives CRT state,
- CRT displays a test source through the final abstraction boundary,
- the scene preserves RetroRoom’s dense visual identity,
- Xiaomi 13T Pro maintains stable playable performance,
- the result is visibly and experientially more immersive than RetroRoom HTML V5.6.

If the visual/experiential improvement is not substantial, the Unity migration should not proceed simply for the sake of changing engines.

## 15. Non-goals for Prototype 0.1

Do not add these before the core prototype is validated:

- real emulator core,
- full ROM folder scanning,
- dozens of consoles,
- online services,
- cloud saves,
- multiplayer,
- VR,
- complex inventory menus,
- advanced physics for every prop,
- procedural room generation,
- large settings/dashboard UI.

## 16. Relationship to RetroRoom HTML V5.6

V5.6 remains frozen and independent.

The Unity Lab may reuse product knowledge from V5.6, such as:

- system naming,
- controller profiles,
- ROM extension/detection lessons,
- CRT framing/aesthetic decisions,
- validated interaction expectations.

It must not modify or destabilize the V5.6 runtime during experimentation.

## 17. Next implementation phase

After this design spec is reviewed and approved, create a separate implementation plan covering:

1. Unity project creation and Android configuration.
2. URP/mobile quality baseline.
3. project folder/module structure.
4. touch-first PlayerController.
5. InteractionSystem.
6. GrabbableObject and snap slots.
7. ConsoleStation + GameMedia.
8. CRTController + fake video source.
9. first room blockout.
10. art/asset pass.
11. audio pass.
12. Android build pipeline.
13. Xiaomi device profiling and iteration.

The implementation plan must preserve the isolation boundaries defined in this spec.
