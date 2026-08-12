# RetroRoom Unity Lab 0.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a separate Android-first Unity 6 prototype where the player can explore a dense 1990s RetroRoom bedroom, pick up and insert a cartridge into a console, press POWER, and drive a CRT test source through an emulator-ready abstraction.

**Architecture:** The Unity prototype lives under `unity-lab/` and stays isolated from RetroRoom HTML V5.6. Gameplay is split into small systems: player/input, interaction, grabbables/snapping, console/media state, CRT presentation, emulator abstraction, quality/performance and a reproducible scene builder. Real emulation is excluded from 0.1; `FakeEmulatorBridge` provides the CRT source so 0.2 can replace it without redesigning the room.

**Tech Stack:** Unity 6.0 LTS (6000.0.x), Universal Render Pipeline, C#, Unity Input System, Unity Test Framework, Android ARM64/IL2CPP, Vulkan first with OpenGLES3 fallback.

## Global Constraints

- Primary target: Android / Xiaomi 13T Pro.
- Reference build: RetroRoom HTML V5.6 remains frozen and independent.
- Engine target: Unity 6 with URP.
- Preferred performance target: 60 FPS.
- Acceptable fallback: stable 30 FPS.
- First-person explorable room from the first playable prototype.
- The room itself is the interface; avoid dashboard-heavy UI.
- Dense 1990s bedroom atmosphere rather than a sparse benchmark scene.
- Prototype 0.1 explicitly does NOT include a real emulator core.
- CRT must use a replaceable video-source boundary from day one.
- First real emulator target after 0.1: Game Gear.
- Device performance on Xiaomi 13T Pro is authoritative; Editor performance is not sufficient.
- Do not modify the existing `index.html`, `src/`, or HTML runtime while implementing Unity Lab 0.1.
- Android application id: `com.lelectronlibre.retroroomlab`.
- Landscape left/right only; ARM64; IL2CPP; Vulkan first, OpenGLES3 fallback.

---

## Planned File Structure

```text
unity-lab/
├── Assets/
│   ├── RetroRoom/
│   │   ├── Art/{Materials,Models,Textures,Audio}/
│   │   ├── Data/{ConsoleDefinition.cs,GameDefinition.cs,MediaType.cs,RuntimeIds.cs}
│   │   ├── Emulator/{IEmulatorBridge.cs,EmulatorState.cs,FakeEmulatorBridge.cs}
│   │   ├── Interaction/{IInteractable.cs,InteractionSystem.cs,GrabbableObject.cs,SnapSlot.cs,GameMedia.cs}
│   │   ├── Console/{ConsoleStation.cs,ConsoleState.cs,CRTController.cs,PowerButton.cs}
│   │   ├── Player/{PlayerController.cs,TouchLookProcessor.cs,PlayerInputActions.inputactions}
│   │   ├── UI/{MobileHud.cs,VirtualStick.cs,TouchLookArea.cs,FpsDisplay.cs}
│   │   ├── Quality/{QualityManager.cs,QualityPreset.cs}
│   │   ├── Runtime/{RetroRoomBootstrap.cs,PrototypeAudio.cs}
│   │   ├── Scenes/RetroRoomLab.unity
│   │   └── Tests/{EditMode,PlayMode}/
│   └── Editor/{RetroRoomAndroidConfigurator.cs,RetroRoomSceneBuilder.cs,RetroRoomBuild.cs}
├── Packages/
├── ProjectSettings/
├── DEVICE_TESTS.md
└── README.md
```

The scene is generated through `RetroRoomSceneBuilder` instead of hand-editing Unity YAML, so the first prototype is reproducible.

---

### Task 1: Scaffold Unity 6 Android/URP project

**Files:**
- Create: `unity-lab/Packages/manifest.json`
- Create: `unity-lab/Assets/Editor/RetroRoomAndroidConfigurator.cs`
- Create: `unity-lab/Assets/RetroRoom/Runtime/RetroRoomBootstrap.cs`
- Create: `unity-lab/Assets/RetroRoom/Tests/EditMode/AndroidConfigurationTests.cs`
- Modify: `.gitignore`

**Interfaces:**
- Produces deterministic Android settings and `RetroRoomBootstrap.TargetFrameRate`.

- [ ] **Step 1: Extend `.gitignore`**

```gitignore
# RetroRoom Unity Lab
unity-lab/[Ll]ibrary/
unity-lab/[Tt]emp/
unity-lab/[Oo]bj/
unity-lab/[Bb]uild/
unity-lab/[Bb]uilds/
unity-lab/[Ll]ogs/
unity-lab/[Uu]ser[Ss]ettings/
unity-lab/*.csproj
unity-lab/*.sln
```

- [ ] **Step 2: Create Unity 6 Universal 3D project at `unity-lab/` and enable Input System**

Keep the Unity 6 editor-resolved URP/core package versions. Add Input System through Package Manager and commit `Packages/manifest.json` plus `packages-lock.json`.

- [ ] **Step 3: Write failing Android settings test**

```csharp
using NUnit.Framework;
using UnityEditor;
using UnityEditor.Build;
using UnityEngine.Rendering;

public sealed class AndroidConfigurationTests
{
    [Test]
    public void AndroidContractIsApplied()
    {
        Assert.AreEqual("com.lelectronlibre.retroroomlab",
            PlayerSettings.GetApplicationIdentifier(NamedBuildTarget.Android));
        Assert.AreEqual(ScriptingImplementation.IL2CPP,
            PlayerSettings.GetScriptingBackend(NamedBuildTarget.Android));
        Assert.AreEqual(AndroidArchitecture.ARM64, PlayerSettings.Android.targetArchitectures);
        CollectionAssert.AreEqual(
            new[] { GraphicsDeviceType.Vulkan, GraphicsDeviceType.OpenGLES3 },
            PlayerSettings.GetGraphicsAPIs(BuildTarget.Android));
    }
}
```

- [ ] **Step 4: Run EditMode test and verify RED**

```bash
Unity -batchmode -projectPath unity-lab -runTests -testPlatform EditMode -testFilter AndroidConfigurationTests -quit
```

Expected: FAIL until Android settings are applied.

- [ ] **Step 5: Implement `RetroRoomAndroidConfigurator.Apply()`**

```csharp
using UnityEditor;
using UnityEditor.Build;
using UnityEngine;
using UnityEngine.Rendering;

public static class RetroRoomAndroidConfigurator
{
    [MenuItem("RetroRoom/Configure Android")]
    public static void Apply()
    {
        PlayerSettings.SetApplicationIdentifier(NamedBuildTarget.Android, "com.lelectronlibre.retroroomlab");
        PlayerSettings.SetScriptingBackend(NamedBuildTarget.Android, ScriptingImplementation.IL2CPP);
        PlayerSettings.Android.targetArchitectures = AndroidArchitecture.ARM64;
        PlayerSettings.defaultInterfaceOrientation = UIOrientation.AutoRotation;
        PlayerSettings.allowedAutorotateToPortrait = false;
        PlayerSettings.allowedAutorotateToPortraitUpsideDown = false;
        PlayerSettings.allowedAutorotateToLandscapeLeft = true;
        PlayerSettings.allowedAutorotateToLandscapeRight = true;
        PlayerSettings.SetGraphicsAPIs(BuildTarget.Android,
            new[] { GraphicsDeviceType.Vulkan, GraphicsDeviceType.OpenGLES3 });
        PlayerSettings.colorSpace = ColorSpace.Linear;
        AssetDatabase.SaveAssets();
    }
}
```

- [ ] **Step 6: Add runtime bootstrap**

```csharp
using UnityEngine;

public sealed class RetroRoomBootstrap : MonoBehaviour
{
    public const int TargetFrameRate = 60;
    private void Awake()
    {
        Application.targetFrameRate = TargetFrameRate;
        QualitySettings.vSyncCount = 0;
        Screen.sleepTimeout = SleepTimeout.NeverSleep;
    }
}
```

- [ ] **Step 7: Re-run test; expect PASS**
- [ ] **Step 8: Commit**

```bash
git add .gitignore unity-lab
git commit -m "feat(unity): scaffold Android-first Unity Lab"
```

---

### Task 2: Add data-driven console/game definitions

**Files:**
- Create: `unity-lab/Assets/RetroRoom/Data/RuntimeIds.cs`
- Create: `unity-lab/Assets/RetroRoom/Data/MediaType.cs`
- Create: `unity-lab/Assets/RetroRoom/Data/ConsoleDefinition.cs`
- Create: `unity-lab/Assets/RetroRoom/Data/GameDefinition.cs`
- Test: `unity-lab/Assets/RetroRoom/Tests/EditMode/DefinitionTests.cs`

**Interfaces:**
- Produces `ConsoleDefinition.Supports(GameDefinition game) : bool`.

- [ ] **Step 1: Write failing compatibility tests**

```csharp
[Test]
public void GameGearAcceptsGameGearCartridge()
{
    var console = ScriptableObject.CreateInstance<ConsoleDefinition>();
    console.ConfigureForTests("gamegear", new[] { "gamegear" }, MediaType.Cartridge);
    var game = ScriptableObject.CreateInstance<GameDefinition>();
    game.ConfigureForTests("sonic", "gamegear", MediaType.Cartridge);
    Assert.IsTrue(console.Supports(game));
}
```

Add a second test with SNES media and expect `false`.

- [ ] **Step 2: Run and verify RED**
- [ ] **Step 3: Implement minimal definitions**

```csharp
public enum MediaType { Cartridge, Disc }

public static class RuntimeIds
{
    public const string GameGear = "gamegear";
    public const string Snes = "snes";
    public const string MegaDrive = "megadrive";
    public const string Psx = "psx";
    public const string N64 = "n64";
}
```

`GameDefinition` and `ConsoleDefinition` are `ScriptableObject` assets; `Supports` must require both matching media type and an allowed system id.

- [ ] **Step 4: Re-run tests; expect PASS**
- [ ] **Step 5: Commit `feat(unity): add data-driven console definitions`**

---

### Task 3: Define emulator boundary and fake video implementation

**Files:**
- Create: `unity-lab/Assets/RetroRoom/Emulator/EmulatorState.cs`
- Create: `unity-lab/Assets/RetroRoom/Emulator/IEmulatorBridge.cs`
- Create: `unity-lab/Assets/RetroRoom/Emulator/FakeEmulatorBridge.cs`
- Test: `unity-lab/Assets/RetroRoom/Tests/EditMode/EmulatorBridgeTests.cs`

**Interfaces:**
- Produces `Load`, `Start`, `Stop`, `Reset`, `VideoTexture`, `SendButton`, `State`.

- [ ] **Step 1: Write failing load/start/stop state test**
- [ ] **Step 2: Run and verify RED**
- [ ] **Step 3: Implement contract**

```csharp
using UnityEngine;

public enum EmulatorState { Idle, Loaded, Running, Stopped, Error }

public interface IEmulatorBridge
{
    EmulatorState State { get; }
    Texture VideoTexture { get; }
    void Load(GameDefinition game);
    void Start();
    void Stop();
    void Reset();
    void SendButton(string actionId, bool pressed);
}
```

`FakeEmulatorBridge` stores one `GameDefinition`, exposes an assignable `Texture`, and changes only the enum state; it contains no real emulator code.

- [ ] **Step 4: Re-run tests; expect PASS**
- [ ] **Step 5: Commit `feat(unity): add emulator bridge abstraction`**

---

### Task 4: Add console POWER and CRT state flow

**Files:**
- Create: `unity-lab/Assets/RetroRoom/Console/ConsoleState.cs`
- Create: `unity-lab/Assets/RetroRoom/Console/ConsoleStation.cs`
- Create: `unity-lab/Assets/RetroRoom/Console/CRTController.cs`
- Test: `unity-lab/Assets/RetroRoom/Tests/EditMode/ConsoleStationTests.cs`

**Interfaces:**
- Produces `ConsoleStation.Insert`, `Eject`, `SetPower`; `CRTController.SetPowered`.

- [ ] **Step 1: Write failing tests**

Test A: POWER with no media -> `ConsoleState.NoMedia`.
Test B: valid Game Gear media + POWER -> `ConsoleState.Running` through `FakeEmulatorBridge`.
Test C: incompatible media -> `Insert` returns false.

- [ ] **Step 2: Run and verify RED**
- [ ] **Step 3: Implement state machine**

```csharp
public enum ConsoleState { Off, NoMedia, Ready, Running, Error }
```

Core behavior:

```csharp
public bool Insert(GameDefinition game)
{
    if (definition == null || !definition.Supports(game)) return false;
    insertedGame = game;
    return true;
}

public void SetPower(bool on)
{
    if (!on) { emulator?.Stop(); State = ConsoleState.Off; crt?.SetPowered(false, null); return; }
    if (insertedGame == null) { State = ConsoleState.NoMedia; crt?.SetPowered(true, null); return; }
    emulator.Load(insertedGame);
    emulator.Start();
    State = emulator.State == EmulatorState.Running ? ConsoleState.Running : ConsoleState.Error;
    crt?.SetPowered(true, emulator.VideoTexture);
}
```

`CRTController` uses `MaterialPropertyBlock` so changing the screen texture does not instantiate a new material every time.

- [ ] **Step 4: Re-run tests; expect PASS**
- [ ] **Step 5: Commit `feat(unity): add console and CRT state flow`**

---

### Task 5: Implement pickup, release and cartridge snapping

**Files:**
- Create: `unity-lab/Assets/RetroRoom/Interaction/IInteractable.cs`
- Create: `unity-lab/Assets/RetroRoom/Interaction/GrabbableObject.cs`
- Create: `unity-lab/Assets/RetroRoom/Interaction/GameMedia.cs`
- Create: `unity-lab/Assets/RetroRoom/Interaction/SnapSlot.cs`
- Test: `unity-lab/Assets/RetroRoom/Tests/EditMode/SnapSlotTests.cs`

**Interfaces:**
- Produces `PickUp(Transform)`, `Release()`, `SnapSlot.TrySnap(GameMedia) : bool`.

- [ ] **Step 1: Write failing compatible/incompatible snap tests**
- [ ] **Step 2: Run and verify RED**
- [ ] **Step 3: Implement `IInteractable`**

```csharp
public interface IInteractable
{
    bool CanInteract { get; }
    string Prompt { get; }
    void Interact(InteractionSystem interactor);
}
```

- [ ] **Step 4: Implement stable held-object behavior**

While held: Rigidbody `isKinematic=true`, collisions disabled, object parented to hold anchor. On release: restore physics. Do not use unconstrained joint physics for 0.1.

- [ ] **Step 5: Implement `SnapSlot.TrySnap`**

It must call `ConsoleStation.Insert(media.Definition)` first. Only on success does it release and parent the cartridge to the snap anchor at local position/rotation zero.

- [ ] **Step 6: Re-run tests; expect PASS**
- [ ] **Step 7: Commit `feat(unity): add pickup and cartridge snapping`**

---

### Task 6: Add first-person targeting and mobile movement/look

**Files:**
- Create: `unity-lab/Assets/RetroRoom/Interaction/InteractionSystem.cs`
- Create: `unity-lab/Assets/RetroRoom/Player/TouchLookProcessor.cs`
- Create: `unity-lab/Assets/RetroRoom/Player/PlayerController.cs`
- Create: `unity-lab/Assets/RetroRoom/Player/PlayerInputActions.inputactions`
- Tests: `InteractionSystemTests.cs`, `TouchLookProcessorTests.cs`

**Interfaces:**
- Produces `InteractionSystem.Current`, `TryInteract`, `HoldAnchor`; `PlayerController.SetMoveInput`, `AddLookDelta`.

- [ ] **Step 1: Write failing range and pitch clamp tests**

```csharp
Assert.IsTrue(InteractionSystem.IsInRange(1.5f, 2f));
Assert.IsFalse(InteractionSystem.IsInRange(2.5f, 2f));
Assert.AreEqual(80f, TouchLookProcessor.ApplyPitch(75f, 20f, 1f));
```

- [ ] **Step 2: Run and verify RED**
- [ ] **Step 3: Implement center-camera raycast with 2 m range**
- [ ] **Step 4: Implement CharacterController movement at initial 2.6 m/s, gravity and ±80° pitch clamp**
- [ ] **Step 5: Add Input System actions `Move`, `Look`, `Interact`; WASD/mouse/E are Editor fallbacks**
- [ ] **Step 6: Re-run tests; expect PASS**
- [ ] **Step 7: Commit `feat(unity): add first-person interaction controller`**

---

### Task 7: Build low-chrome mobile HUD

**Files:**
- Create: `unity-lab/Assets/RetroRoom/UI/VirtualStick.cs`
- Create: `unity-lab/Assets/RetroRoom/UI/TouchLookArea.cs`
- Create: `unity-lab/Assets/RetroRoom/UI/MobileHud.cs`
- Test: `unity-lab/Assets/RetroRoom/Tests/EditMode/VirtualStickTests.cs`

**Interfaces:**
- Left stick feeds `PlayerController.SetMoveInput`.
- Right drag feeds `PlayerController.AddLookDelta`.
- Context button invokes `InteractionSystem.TryInteract`.

- [ ] **Step 1: Write failing stick normalization test**

```csharp
var value = VirtualStick.Normalize(new Vector2(300f, 400f), 100f);
Assert.LessOrEqual(value.magnitude, 1.0001f);
```

- [ ] **Step 2: Run and verify RED**
- [ ] **Step 3: Implement `VirtualStick.Normalize` with `Vector2.ClampMagnitude`**
- [ ] **Step 4: Implement transparent right-side `IDragHandler` look area**
- [ ] **Step 5: Implement HUD with tiny reticle and contextual action button only when a target exists**
- [ ] **Step 6: Re-run tests; expect PASS**
- [ ] **Step 7: Commit `feat(unity): add touch HUD`**

---

### Task 8: Add Performance/Quality presets and FPS diagnostics

**Files:**
- Create: `unity-lab/Assets/RetroRoom/Quality/QualityPreset.cs`
- Create: `unity-lab/Assets/RetroRoom/Quality/QualityManager.cs`
- Create: `unity-lab/Assets/RetroRoom/UI/FpsDisplay.cs`
- Test: `unity-lab/Assets/RetroRoom/Tests/EditMode/QualityManagerTests.cs`

**Interfaces:**
- Produces `QualityManager.Apply(QualityPreset)`.

- [ ] **Step 1: Write failing preset test**

```csharp
Assert.AreEqual(0.80f, QualityManager.GetRenderScale(QualityPreset.Performance), 0.001f);
Assert.AreEqual(1.00f, QualityManager.GetRenderScale(QualityPreset.Quality), 0.001f);
```

- [ ] **Step 2: Run and verify RED**
- [ ] **Step 3: Implement presets**

Performance starts with render scale 0.80, shadow distance 12 m and lower shadow resolution. Quality starts at render scale 1.00, shadow distance 20 m and permits additional-light shadows. Both target 60 FPS; 30 FPS is a measured fallback, not an unconditional cap.

- [ ] **Step 4: Add development-build-only smoothed FPS label**
- [ ] **Step 5: Re-run tests; expect PASS**
- [ ] **Step 6: Commit `feat(unity): add mobile quality presets`**

---

### Task 9: Generate the playable RetroRoom 3D scene

**Files:**
- Create: `unity-lab/Assets/Editor/RetroRoomSceneBuilder.cs`
- Create: `unity-lab/Assets/RetroRoom/Console/PowerButton.cs`
- Generate: `unity-lab/Assets/RetroRoom/Scenes/RetroRoomLab.unity`
- Test: `unity-lab/Assets/RetroRoom/Tests/PlayMode/RetroRoomSmokeTests.cs`

**Interfaces:**
- Consumes Tasks 2-8; produces complete prototype scene.

- [ ] **Step 1: Write failing PlayMode smoke test**

```csharp
[UnityTest]
public IEnumerator LabSceneContainsCoreObjects()
{
    SceneManager.LoadScene("RetroRoomLab");
    yield return null;
    Assert.NotNull(Object.FindFirstObjectByType<PlayerController>());
    Assert.NotNull(Object.FindFirstObjectByType<InteractionSystem>());
    Assert.NotNull(Object.FindFirstObjectByType<ConsoleStation>());
    Assert.NotNull(Object.FindFirstObjectByType<CRTController>());
    Assert.NotNull(Object.FindFirstObjectByType<QualityManager>());
}
```

- [ ] **Step 2: Run and verify RED**
- [ ] **Step 3: Implement menu command `RetroRoom/Build Prototype Scene`**

The builder creates an empty scene then calls focused methods: `CreateRoomShell`, `CreatePlayer`, `CreateCrtAndConsole`, `CreatePrototypeMedia`, `CreateLighting`, `CreateHud`, `CreateManagers`.

- [ ] **Step 4: Build dense first-pass room**

Use primitives initially but include: floor/walls/ceiling, TV stand, two shelves, bed/seating mass, beige-PC blockout, window, desk, box/VHS/game clutter proxies and collision. The CRT remains the visual anchor.

- [ ] **Step 5: Build validated RetroRoom lighting identity**

Warm tungsten key light + blue emissive/neon accent + low ambient/night window. Performance mode starts with at most one important realtime shadow-casting light.

- [ ] **Step 6: Build CRT test pipeline**

Create a second camera rendering a rotating test object into a `RenderTexture`; assign it to `FakeEmulatorBridge.VideoTexture`; `CRTController` displays that texture only after POWER. This proves the replaceable video boundary without an emulator.

- [ ] **Step 7: Add Game Gear prototype assets**

Create one Game Gear console definition and one cartridge game definition. Cartridge must be pickable, compatible with the console slot and snap reliably.

- [ ] **Step 8: Add physical POWER interactable**

```csharp
public sealed class PowerButton : MonoBehaviour, IInteractable
{
    [SerializeField] private ConsoleStation station;
    private bool powered;
    public bool CanInteract => station != null;
    public string Prompt => powered ? "ÉTEINDRE" : "POWER";
    public void Interact(InteractionSystem interactor)
    {
        powered = !powered;
        station.SetPower(powered);
    }
}
```

- [ ] **Step 9: Build HUD/managers and register scene in Build Settings**
- [ ] **Step 10: Re-run PlayMode smoke test; expect PASS**
- [ ] **Step 11: Commit `feat(unity): build playable RetroRoom 3D prototype scene`**

---

### Task 10: Add lightweight audio and rejection feedback

**Files:**
- Create: `unity-lab/Assets/RetroRoom/Runtime/PrototypeAudio.cs`
- Create: `unity-lab/Assets/RetroRoom/UI/InteractionFeedback.cs`
- Modify: `RetroRoomSceneBuilder.cs`
- Test: `InteractionFeedbackTests.cs`

**Interfaces:**
- Produces room tone/CRT hum hooks, power click, insertion click and short rejected-media message.

- [ ] **Step 1: Write failing test**

```csharp
Assert.AreEqual("JEU INCOMPATIBLE", InteractionFeedback.MessageForRejectedMedia());
```

- [ ] **Step 2: Run and verify RED**
- [ ] **Step 3: Implement null-safe AudioSource hooks for power, insertion and CRT hum**
- [ ] **Step 4: Wire successful snap/power and rejected snap feedback**
- [ ] **Step 5: Re-run tests; expect PASS**
- [ ] **Step 6: Commit `feat(unity): add prototype audio and feedback`**

Do not import copyrighted console startup audio; use original/generated clips or silent null-safe placeholders until original audio exists.

---

### Task 11: Add deterministic Android APK build command

**Files:**
- Create: `unity-lab/Assets/Editor/RetroRoomBuild.cs`
- Create: `unity-lab/Assets/RetroRoom/Tests/EditMode/BuildConfigurationTests.cs`
- Create: `unity-lab/DEVICE_TESTS.md`

**Interfaces:**
- Produces `Builds/Android/RetroRoomUnityLab-0.1-dev.apk`.

- [ ] **Step 1: Write failing path test**

```csharp
Assert.AreEqual("Builds/Android/RetroRoomUnityLab-0.1-dev.apk", RetroRoomBuild.DevelopmentApkPath);
```

- [ ] **Step 2: Run and verify RED**
- [ ] **Step 3: Implement build method**

It must call Android configurator + scene builder, set APK rather than AAB, use Development build and ASTC texture target, then `BuildPipeline.BuildPlayer` for Android. Throw `BuildFailedException` unless `BuildResult.Succeeded`.

- [ ] **Step 4: Re-run test; expect PASS**
- [ ] **Step 5: Create Xiaomi acceptance checklist**

```markdown
- [ ] APK installs and launches without crash.
- [ ] Landscape orientation is correct.
- [ ] Left joystick movement feels controllable.
- [ ] Right look drag feels controllable and does not jump.
- [ ] Cartridge can be picked up and released.
- [ ] Cartridge snaps into compatible console.
- [ ] Incompatible media is rejected.
- [ ] POWER with no media shows safe no-signal output.
- [ ] POWER with media starts the fake video source.
- [ ] CRT source stays aligned while walking around it.
- [ ] Performance preset stable for 10 minutes; record FPS range.
- [ ] Quality preset stable for 10 minutes; record FPS range.
- [ ] Record obvious thermal throttling after 10 minutes if present.
- [ ] Touch UI does not cover the central CRT interaction area.
- [ ] Room still feels dense rather than like a sparse benchmark scene.
```

- [ ] **Step 6: Build APK**

```bash
Unity -batchmode -projectPath unity-lab -executeMethod RetroRoomBuild.BuildDevelopmentApk -quit
```

- [ ] **Step 7: Commit build tooling, not APK binary**

```bash
git add unity-lab/Assets/Editor/RetroRoomBuild.cs unity-lab/Assets/RetroRoom/Tests/EditMode/BuildConfigurationTests.cs unity-lab/DEVICE_TESTS.md
git commit -m "build(unity): add Android APK pipeline"
```

---

### Task 12: Automated verification and Xiaomi acceptance gate

**Files:**
- Create: `unity-lab/PROTOTYPE_0_1_RESULTS.md`
- Modify only files implicated by failing tests.

**Interfaces:**
- Produces one 0.1 candidate ready for real-device validation.

- [ ] **Step 1: Run all EditMode tests**

```bash
Unity -batchmode -projectPath unity-lab -runTests -testPlatform EditMode -testResults unity-lab/TestResults/editmode.xml -quit
```

Expected: PASS.

- [ ] **Step 2: Run all PlayMode tests**

```bash
Unity -batchmode -projectPath unity-lab -runTests -testPlatform PlayMode -testResults unity-lab/TestResults/playmode.xml -quit
```

Expected: PASS.

- [ ] **Step 3: Build development APK again**

Expected: build succeeds without compile errors.

- [ ] **Step 4: Create results document**

```markdown
# RetroRoom Unity Lab 0.1 Candidate

Automated verification:
- EditMode: PASS
- PlayMode: PASS
- Android development APK build: PASS

Prototype scope:
- First-person exploration: implemented
- Touch movement/look: implemented
- Pickup/release: implemented
- Cartridge snap: implemented
- Console POWER: implemented
- CRT replaceable video source: FakeEmulatorBridge
- Performance/Quality presets: implemented
- Real emulator core: intentionally not included

Device acceptance:
- Status: awaiting Xiaomi 13T Pro run
- Checklist: DEVICE_TESTS.md
```

Do not mark device acceptance PASS until the APK has actually run on the Xiaomi.

- [ ] **Step 5: Commit candidate**

```bash
git add unity-lab/PROTOTYPE_0_1_RESULTS.md
git commit -m "chore(unity): freeze RetroRoom Lab 0.1 candidate"
```

- [ ] **Step 6: Run Xiaomi gate**

If frame pacing is unstable, optimize in this order before cutting room density: render scale → realtime shadows → additional-light shadows → texture size/compression → material/draw-call reuse → LOD/culling → decorative object count.

Do not begin real Game Gear emulation until exploration, interaction, CRT rendering and thermal behavior pass the 0.1 device gate.

---

## Self-review

**Spec coverage:** Android configuration, URP/mobile baseline, modular project structure, touch PlayerController, InteractionSystem, GrabbableObject/snap slots, ConsoleStation/GameMedia, CRT fake video source, room blockout, visual lighting pass, audio, Android build and Xiaomi profiling are all mapped to Tasks 1-12.

**No-go scope preserved:** no real core, ROM folder scan, dozens of consoles, VR, multiplayer, cloud, procedural room or advanced physics in 0.1.

**Interface consistency:** shared signatures remain `ConsoleDefinition.Supports`, `IEmulatorBridge.Load/Start/Stop/Reset/SendButton`, `ConsoleStation.Insert/Eject/SetPower`, `CRTController.SetPowered`, `InteractionSystem.TryInteract/HoldAnchor`, `PlayerController.SetMoveInput/AddLookDelta`, `QualityManager.Apply`.

**Execution boundary:** `unity-lab/` is a sibling project; existing HTML files remain untouched except the repository `.gitignore` addition.