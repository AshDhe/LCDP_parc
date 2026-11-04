(() => {
  "use strict";

  const config = window.SITE_CONFIG || {};
  const endpoint = String(config.workerConnexionParcUrl || config.WORKER_CONNEXION_PARC_URL ||
    (typeof config.apiUrl === "function" ? config.apiUrl("connexion-parc-api") : "")).replace(/\/+$/, "");
  const construireUrl = (base, path) => String(base || "").replace(/\/+$/, "") + "/" + String(path || "").replace(/^\/+/, "");
  const espace = path => typeof config.parcUrl === "function" ? config.parcUrl(path) : construireUrl(config.parcBaseUrl || config.PARC_BASE, path);
  const publicUrl = path => typeof config.publicUrl === "function" ? config.publicUrl(path) : construireUrl(config.publicBaseUrl || config.PUBLIC_BASE, path);
  const objet = path => typeof config.objetUrl === "function" ? config.objetUrl(path) : construireUrl(config.objetBaseUrl || config.OBJET_BASE, path);
  const attente = document.getElementById("lcdp-accueil-attente");
  const contenu = document.getElementById("lcdp-accueil-contenu");
  const erreur = document.getElementById("lcdp-accueil-erreur");
  const menu = document.getElementById("lcdp-menu-central-slot");
  const zoneAlerte = document.getElementById("lcdp-lightbox-slot");
  const accueil = "Votre compte La Clé du Parc";

  // Couleur PARC : utilise exclusivement les variables déjà déclarées dans cssbase.css.
  document.body.style.setProperty("--lcdp-color-logo-green", "var(--lcdp-color-parc)");


  // Initialise Cal.com selon le chargeur officiel, avec espace de noms.
  const LCDP_CAL = {
    onboarding: "hugues-pavret-5dysvw/onboarding",
    crm: "hugues-pavret-5dysvw/crm"
  };
  const CAL_ORIGIN = "https://cal.com";
  let calPrepare = false;
  function preparerCal() {
    if (calPrepare) return;
    // Chargeur officiel Cal.com : crée l'API de commandes avant embed.js.
    ((C, A, L) => {
      const p = (a, ar) => { a.q.push(ar); };
      const d = C.document;
      C.Cal = C.Cal || function () {
        const cal = C.Cal, ar = arguments;
        if (!cal.loaded) {
          cal.ns = {};
          cal.q = cal.q || [];
          d.head.appendChild(d.createElement("script")).src = A;
          cal.loaded = true;
        }
        if (ar[0] === L) {
          const api = function () { p(api, arguments); };
          const namespace = ar[1];
          api.q = api.q || [];
          if (typeof namespace === "string") {
            cal.ns[namespace] = cal.ns[namespace] || api;
            p(cal.ns[namespace], ar);
            p(cal, ["initNamespace", namespace]);
          } else p(cal, ar);
          return;
        }
        p(cal, ar);
      };
    })(window, "https://app.cal.com/embed/embed.js", "init");
    window.Cal("init", "lcdp-rdv", { origin: CAL_ORIGIN });
    calPrepare = true;
  }
  function ouvrirRdvCal(type) {
    const lien = LCDP_CAL[type];
    if (!lien) return false;
    try {
      preparerCal();
      const cal = window.Cal?.ns?.["lcdp-rdv"];
      if (typeof cal !== "function") throw new Error("API Cal.com indisponible");
      cal("modal", { calLink: lien, config: { layout: "month_view" } });
      return true;
    } catch (e) {
      console.error("Cal.com :", e);
      // Une panne d'intégration ne bloque jamais la prise de rendez-vous.
      window.open(CAL_ORIGIN + "/" + lien, "_blank", "noopener,noreferrer");
      return false;
    }
  }
  window.LCDP_ouvrirRdvCal = ouvrirRdvCal;
  function afficherOnboardingInitial(session, espaceNom) {
    const identifiant = String(session.idresp || session.idcoach || session.id || "").trim();
    if (!identifiant) return;
    const cle = "lcdp:cal:onboarding:v1:" + espaceNom + ":" + identifiant;
    try {
      if (localStorage.getItem(cle) === "vu") return;
    } catch (e) {
      console.warn("Mémorisation ONBOARDING indisponible", e);
    }
    if (ouvrirRdvCal("onboarding")) {
      try { localStorage.setItem(cle, "vu"); }
      catch (e) { console.warn("Mémorisation ONBOARDING indisponible", e); }
    }
  }

  function masquerAttente() { attente.hidden = true; attente.style.display = "none"; }
  function rediriger() { window.location.replace(publicUrl("/ESPACE-PUBLIC/connexion-parc.html?source=accueil-parc&session=inactive")); }
  async function fragment(url) {
    const r = await fetch(url, { credentials: "omit", cache: "no-cache" });
    if (!r.ok) throw new Error("Composant indisponible : " + url);
    const t = document.createElement("template");
    t.innerHTML = (await r.text()).trim();
    return t.content.cloneNode(true);
  }
  async function scriptUnique(url) {
    if (document.querySelector('script[data-lcdp-pro-script="burger-parc"]')) return;
    await new Promise((resolve, reject) => {
      const el = document.createElement("script");
      el.src = url; el.dataset.lcdpProScript = "burger-parc";
      el.onload = resolve; el.onerror = () => reject(new Error("Burger indisponible."));
      document.body.append(el);
    });
  }
  function appliquerRoutes(root) {
    root.querySelectorAll("[data-site-href]").forEach(el => {
      el.href = el.dataset.space === "parc" ? espace(el.dataset.siteHref) : publicUrl(el.dataset.siteHref);
    });
    root.querySelectorAll("[data-site-src]").forEach(el => {
      const chemin = el.dataset.siteSrc.replace(/^\/?OBJET\//, "/");
      el.src = objet(chemin);
    });
  }
  async function alerte(message) {
    try {
      zoneAlerte.replaceChildren(await fragment(objet("/BOX/02-box-alerte.html")));
      const texte = zoneAlerte.querySelector("[data-lcdp-alerte-message]");
      const ok = zoneAlerte.querySelector("[data-lcdp-alerte-ok]");
      const close = zoneAlerte.querySelector("[data-lcdp-alerte-close]");
      const cadre = zoneAlerte.querySelector("[data-lcdp-box-alerte]");
      if (!texte || !ok || !close || !cadre) throw new Error("Alerte incomplète.");
      texte.textContent = message;
      await new Promise(resolve => {
        const fermer = () => { zoneAlerte.replaceChildren(); resolve(); };
        ok.addEventListener("click", fermer, { once: true });
        close.addEventListener("click", fermer, { once: true });
        cadre.addEventListener("click", event => { if (event.target === cadre) fermer(); });
      });
    } catch (e) { zoneAlerte.replaceChildren(); console.warn(e); window.alert(message); }
  }
  async function bandeau() {
    const slot = document.getElementById("lcdp-bandeau-slot");
    slot.replaceChildren(await fragment(espace("/ESPACE-PARC/box-bandeau-nav-parc.html")));
    appliquerRoutes(slot);
    await scriptUnique(espace("/ESPACE-PARC/box-menu-burger-parc.js?v=20261104-cal-rdv-v1"));
    if (typeof window.LCDP_initialiserMenuBurgerParc !== "function") throw new Error("Burger PARC indisponible.");
    await window.LCDP_initialiserMenuBurgerParc({ endpoint, urlEspace: espace, urlPublic: publicUrl, urlObjet: objet, ouvrirAlerte: alerte, redirection: rediriger });
  }
  async function footer() {
    const slot = document.getElementById("lcdp-footer-slot");
    slot.replaceChildren(await fragment(objet("/BOX/02-box-footer.html")));
    appliquerRoutes(slot);
  }
  function presenterCompte(d) {
    const el = document.getElementById("message-accueil-parc");
    const prenom = String(d.prenomresp || d.prenom || "").trim().slice(0, 60);
    const span = document.createElement("span");
    span.textContent = prenom ? "Bonjour " + prenom : "Bonjour";
    span.style.fontWeight = "400"; // comportement identique à accueil-membre.js
    el.replaceChildren(document.createTextNode(accueil), document.createElement("br"), span);
    const mention = document.getElementById("mention-statut-parc");
    mention.textContent = "ESPACE PARC";
  }
  async function afficherMenuEtParcs() {
    // Un seul recto de Card Parc, à la place des boutons de l'accueil MEMBRE.
    // Aucun titre de liste, aucun appel /parcs, aucune navigation ni retournement.
    menu.replaceChildren();
    const composant = await fragment(objet("/BOX/04-box-card-parc-diaporama.html"));
    const carte = composant.querySelector("[data-lcdp-card-parc-diaporama]");
    const recto = carte?.querySelector(".lcdp-box-card-parc-diaporama__face--recto");
    const ouverture = carte?.querySelector("[data-lcdp-diaporama-retourner]");
    if (!carte || !recto || !ouverture) throw new Error("Recto Card Parc indisponible.");

    // Le composant est réutilisé tel quel, mais la face arrière et son bouton
    // sont retirés : cette vitrine ne doit déclencher aucune action.
    carte.querySelector("[data-lcdp-diaporama-dos]")?.remove();
    const face = document.createElement("div");
    face.className = ouverture.className;
    const media = document.createElement("span");
    media.className = "lcdp-box-card-parc__media";
    const image = document.createElement("img");
    image.className = "lcdp-box-card-parc__image";
    image.src = "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80";
    image.alt = "Photographie illustrative d'un espace boisé";
    image.loading = "eager";
    media.append(image);
    const nom = document.createElement("span");
    nom.className = "lcdp-box-card-parc-diaporama__nom";
    nom.textContent = "PARC";
    face.append(media, nom);
    ouverture.replaceWith(face);
    carte.style.width = "176px";
    carte.style.maxWidth = "100%";
    menu.append(carte);
    return true;
  }

  async function demarrer() {
    if (!endpoint) { window.LCDP_echecAccueilParc(); return; }
    try {
      const r = await fetch(endpoint + "/session", { credentials: "include", cache: "no-store", headers: { Accept: "application/json" } });
      if (r.status === 401) { rediriger(); return; }
      const session = await r.json().catch(() => null);
      if (!r.ok || session?.success !== true || !(session.idresp || session.id)) throw new Error("Session PARC indisponible.");
      presenterCompte(session);
      const composants = [bandeau().catch(e => console.warn("Bandeau PARC :", e)), footer().catch(e => console.warn("Footer PARC :", e))];
      const listeChargee = await afficherMenuEtParcs();
      if (!listeChargee) return;
      await Promise.all(composants);
      contenu.hidden = false;
      contenu.setAttribute("aria-busy", "false");
      erreur.hidden = true;
      masquerAttente();
      afficherOnboardingInitial(session, "parc");
    } catch (e) {
      console.error("Accueil PARC :", e);
      masquerAttente();
      erreur.hidden = false;
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer, { once: true });
  else demarrer();
})();
