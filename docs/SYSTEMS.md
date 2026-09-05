# RetroRoom V6.29 — état des systèmes

Ce document sépare volontairement deux notions :

- **✅ Validé Xiaomi** : lancement/commandes ou comportement du système explicitement validé sur le Xiaomi 13T Pro pendant le développement RetroRoom ;
- **🟢 Core configuré** : RetroRoom possède un core/moteur et une configuration pour ce système, mais cette release ne prétend pas qu’il a été individuellement revalidé sur l’appareil de test.

Un système reconnu par le catalogue ES-DE mais sans core web configuré peut apparaître dans la bibliothèque comme **NON ÉMULÉ** ; il n’est pas listé ci-dessous comme système opérationnel.

## Nintendo

| Système | État V6.29 | Core/configuration |
|---|---|---|
| Game Boy / Game Boy Color | 🟢 Core configuré | `gb` |
| Game Boy Advance | 🟢 Core configuré | `gba` |
| NES / Famicom | 🟢 Core configuré | `nes` |
| SNES / Super Famicom | ✅ Validé Xiaomi | `snes` |
| Nintendo 64 | ✅ Validé Xiaomi | `n64`, profil tactile dédié |
| Nintendo DS | 🟢 Core configuré | `nds` |
| Virtual Boy | ✅ Validé Xiaomi | `vb`, double D-pad dédié |

## Sega

| Système | État V6.29 | Core/configuration |
|---|---|---|
| Game Gear | 🟢 Core configuré | `segaGG` |
| Master System | 🟢 Core configuré | `segaMS` |
| Mega Drive / Genesis | 🟢 Core configuré | `segaMD` |
| Sega 32X | 🟢 Core configuré | `sega32x` |
| Mega-CD / Sega CD | 🟢 Core configuré | `segaCD` |
| Sega Saturn | 🟢 Core configuré | `segaSaturn` |

## Sony

| Système | État V6.29 | Core/configuration |
|---|---|---|
| PlayStation | ✅ Validé Xiaomi | `psx`, CUE/BIN géré |
| PSP | 🟢 Core configuré ⚠️ | `psp`, threads requis/contraignants selon navigateur |

## Atari

| Système | État V6.29 | Core/configuration |
|---|---|---|
| Atari 2600 | 🟢 Core configuré | `atari2600` |
| Atari 5200 | 🟢 Core configuré | `a5200` |
| Atari 7800 | 🟢 Core configuré | `atari7800` |
| Atari Lynx | ✅ Validé Xiaomi | `lynx` |
| Atari Jaguar | 🟢 Core configuré | `jaguar` |

## Arcade / SNK

| Système | État V6.29 | Core/configuration |
|---|---|---|
| CPS I | 🟢 Core configuré | FBNeo |
| CPS II | ✅ Validé Xiaomi | FBNeo |
| CPS III | 🟢 Core configuré | FBNeo |
| Neo Geo MVS / AES | 🟢 Core configuré | FBNeo |
| Arcade générique | 🟢 Core configuré | FBNeo |
| CPS I ancien ROMset | 🟢 Core configuré | FBA2012 CPS1 |
| CPS II ancien ROMset | 🟢 Core configuré | FBA2012 CPS2 |
| MAME 2003+ | 🟢 Core configuré | `mame2003_plus` |

## NEC / SNK / Bandai

| Système | État V6.29 | Core/configuration |
|---|---|---|
| PC Engine / TurboGrafx / SuperGrafx | 🟢 Core configuré | `pce` |
| NEC PC-FX | 🟢 Core configuré | `pcfx` |
| Neo Geo Pocket / Color | 🟢 Core configuré | `ngp` |
| WonderSwan / Color | 🟢 Core configuré | `ws` |

## Autres consoles / moteurs

| Système | État V6.29 | Core/configuration |
|---|---|---|
| ColecoVision | 🟢 Core configuré | `coleco` |
| 3DO | ✅ Validé Xiaomi | Opera / `3do`, CUE/BIN + BIOS |
| Philips CD-i | 🟢 Core configuré | `same_cdi` |
| LowRes NX | 🟢 Moteur configuré | moteur web LowRes NX dédié |
| Doom / PrBoom | 🟢 Core configuré | `prboom` |

## Micro-ordinateurs

| Système | État V6.29 | Core/configuration |
|---|---|---|
| Commodore 64 | 🟢 Core configuré | `c64` |
| Commodore 128 | 🟢 Core configuré | `c128` |
| Commodore VIC-20 | 🟢 Core configuré | `vic20` |
| Commodore Plus/4 | 🟢 Core configuré | `plus4` |
| Commodore PET | 🟢 Core configuré | `pet` |
| Commodore Amiga | 🟢 Core configuré | `amiga` |
| ZX81 | 🟢 Core configuré | `81` |
| ZX Spectrum | 🟢 Core configuré | `fuse` |
| Amstrad CPC | 🟢 Core configuré | `cap32` |
| DOS / DOSBox Pure | 🟢 Core configuré ⚠️ | `dosbox_pure`, threads requis/contraignants selon navigateur |

## Validation V6.29

Smoke test de la base V6.29 : **Xiaomi 13T Pro / Android / Chrome**, bibliothèque **1219 ROMs / 17 systèmes détectés**.

BIOS : **353 BIOS reconnus / 85 systèmes / 81 archives indexées** sur le dossier de validation. Ces nombres décrivent le jeu de test utilisé ; ils ne constituent pas une limite du logiciel.
