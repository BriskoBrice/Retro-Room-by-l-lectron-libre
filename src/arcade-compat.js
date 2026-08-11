/* ============================================================
   RETRO ROOM — ARCADE COMPATIBILITY
   Adapte les cores arcade aux romsets réellement utilisés.
   CPS1/CPS2 passent par défaut sur FBA2012, plus tolérant avec
   les romsets classiques/anciens. FBNeo reste disponible en secours.
   ============================================================ */
(() => {
  if (typeof SYSTEMS === 'undefined' || typeof SYSTEM_GROUPS === 'undefined') return;

  // Garde les profils/manettes arcade identiques, ne change que les cores par défaut.
  if (SYSTEMS.cps1) {
    SYSTEMS.cps1 = {
      ...SYSTEMS.cps1,
      label: 'CAPCOM CPS I — FBA2012 (COMPAT)',
      core: 'fbalpha2012_cps1',
      controlScheme: 'arcade',
      profile: 'arcade6',
      arcade: true
    };
  }

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

  // Conserve explicitement FBNeo pour les romsets récents.
  if (!SYSTEMS.cps1fbneo) {
    SYSTEMS.cps1fbneo = {
      label: 'CAPCOM CPS I — FBNEO (ROMSET RÉCENT)',
      core: 'arcade',
      controlScheme: 'arcade',
      profile: 'arcade6',
      arcade: true,
      exts: []
    };
  }

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
  if (arcadeGroup) {
    if (!arcadeGroup[1].includes('cps1fbneo')) {
      const cps1Index = arcadeGroup[1].indexOf('cps1');
      arcadeGroup[1].splice(cps1Index >= 0 ? cps1Index + 1 : 0, 0, 'cps1fbneo');
    }
    if (!arcadeGroup[1].includes('cps2fbneo')) {
      const cps2Index = arcadeGroup[1].indexOf('cps2');
      arcadeGroup[1].splice(cps2Index >= 0 ? cps2Index + 1 : 0, 0, 'cps2fbneo');
    }
  }
})();
