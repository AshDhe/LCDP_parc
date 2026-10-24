/* Configuration LCDP parc — placer à la racine du dépôt sous le nom config.js.
   Adresses d'espaces reprises de la configuration membre fournie.
   Aucun secret ni contrôle d'accès privé n'est placé dans ce fichier. */
(function () {
  "use strict";

  const host = window.location.hostname;
  const isGithub = host === "ashdhe.github.io" || host === "huguespavret.github.io";
  const githubOwner = host === "huguespavret.github.io" ? "huguespavret" : "ashdhe";

  const CONFIG = {
    github: {
      publicBase: "https://" + githubOwner + ".github.io/LCDP_public",
      membreBase: "https://" + githubOwner + ".github.io/LCDP_membre",
      parcBase: "https://" + githubOwner + ".github.io/LCDP_parc",
      coachBase: "https://" + githubOwner + ".github.io/LCDP_coach",
      adminBase: "https://" + githubOwner + ".github.io/LCDP_admin"
    },

    production: {
      publicBase: "https://lacleduparc.fr",
      membreBase: "https://membre.lacleduparc.fr",
      parcBase: "https://parc.lacleduparc.fr",
      coachBase: "https://coach.lacleduparc.fr",
      adminBase: "https://admin.lacleduparc.fr"
    }
  };

  const active = isGithub ? CONFIG.github : CONFIG.production;
  function nettoyerBaseUrl(value) {
    return String(value || "").replace(/\/+$/, "");
  }
  function buildUrl(base, path) {
    return nettoyerBaseUrl(base) + "/" + String(path || "").replace(/^\/+/, "");
  }

  const objetBase = buildUrl(active.publicBase, "/OBJET");
  const workerContact = buildUrl(CONFIG.production.publicBase, "/api/contact-resparc");
  window.SITE_BASE = active.parcBase;
  window.SITE_CONFIG = {
    espace: "parc",
    publicBaseUrl: active.publicBase,
    membreBaseUrl: active.membreBase,
    parcBaseUrl: active.parcBase,
    coachBaseUrl: active.coachBase,
    adminBaseUrl: active.adminBase,
    objetBaseUrl: objetBase,
    siteBase: active.parcBase,

    workerContactResparcUrl: workerContact,
    WORKER_CONTACT_RESPARC_URL: workerContact,
    workerUserRouteurUrl: "https://user-routeur-api.lacleduparc.fr",
    WORKER_USER_ROUTEUR_URL: "https://user-routeur-api.lacleduparc.fr",

    PUBLIC_BASE: active.publicBase,
    MEMBRE_BASE: active.membreBase,
    PARC_BASE: active.parcBase,
    COACH_BASE: active.coachBase,
    ADMIN_BASE: active.adminBase,
    OBJET_BASE: objetBase,

    publicUrl(path) { return buildUrl(active.publicBase, path); },
    membreUrl(path) { return buildUrl(active.membreBase, path); },
    parcUrl(path) { return buildUrl(active.parcBase, path); },
    coachUrl(path) { return buildUrl(active.coachBase, path); },
    adminUrl(path) { return buildUrl(active.adminBase, path); },
    objetUrl(path) { return buildUrl(objetBase, path); },
    siteUrl(path) { return buildUrl(active.parcBase, path); },
    apiUrl(workerSubdomain) { return "https://" + workerSubdomain + ".lacleduparc.fr"; }
  };
})();
