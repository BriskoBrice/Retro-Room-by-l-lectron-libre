/* ============================================================
   RETRO ROOM — ARCADE COMPATIBILITY
   Adapte les cores arcade aux romsets réellement utilisés.
   CPS1 reste sur FBNeo. CPS2 passe par défaut sur FBA2012,
   plus tolérant avec les romsets classiques/anciens.
   ============================================================ */
(() => {
  if (typeof SYSTEMS === 'undefined' || typeof SYSTEM_GROUPS === 'undefined') return;

  // Garde le profil/manette arcade identique, ne change que le core par défaut.
  if (SYSTEMS.cps2) {
    SYSTEMS.cps2 = {
      ...SYSTEMS.cps2,
      label: 'CAPCOM CPS II — FBA2012 (COMPAT)',
      core: 'fbalpha2012_cps2',
      controlScheme: 'arcade',
      profile: 'arcade6',
      arcade: true
    };
  }

  // Conserve explicitement l'option FBNeo pour les romsets CPS2 récents.
  if (!SYSTEMS.cps2fbneo) {
    SYSTEMS.cps2fbneo = {
      label: 'CAPCOM CPS II — FBNEO (ROMSET RÉCENT)',
      core: 'arcade',
      controlScheme: 'arcade',
      profile: 'arcade6',
      arcade: true,
      exts: []
    };
  }

  const arcadeGroup = SYSTEM_GROUPS.find(group => group[0] === 'ARCADE');
  if (arcadeGroup && !arcadeGroup[1].includes('cps2fbneo')) {
    const cps2Index = arcadeGroup[1].indexOf('cps2');
    arcadeGroup[1].splice(cps2Index >= 0 ? cps2Index + 1 : 0, 0, 'cps2fbneo');
  }
})();
