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
    const logo = slot.querySelector(".lcdp-box-bandeau-nav__logo");
    if (logo) logo.addEventListener("error", () => {
      // Repli sur le favicon déjà référencé par cssbase.css ; aucun logo inventé.
      const secours = publicUrl("/favicon-32x32.png");
      if (logo.src !== secours) logo.src = secours;
    }, { once: true });
    await scriptUnique(espace("/ESPACE-PARC/box-menu-burger-parc.js"));
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
    menu.replaceChildren(await fragment(objet("/BOX/02-box-menu-bouton.html")));
    const liste = menu.querySelector("[data-lcdp-menu-bouton-list]");
    if (!liste) throw new Error("Menu principal incomplet.");
    liste.classList.add("lcdp-accueil-actions");
    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "lcdp-button lcdp-button-compte lcdp-button-compte--parc";
    bouton.textContent = "Mon compte PARC";
    bouton.addEventListener("click", () => alerte("La page Mon compte de l’espace PARC sera créée prochainement."));
    liste.append(bouton);

    const enveloppe = document.createElement("div");
    enveloppe.append(await fragment(objet("/BOX/04-box-liste-card.html")));
    const bloc = enveloppe.querySelector("[data-lcdp-box-liste-card]");
    const listeParcs = enveloppe.querySelector("[data-lcdp-liste-card-list]");
    const titre = enveloppe.querySelector("[data-lcdp-liste-card-title]");
    const message = enveloppe.querySelector("[data-lcdp-liste-card-message]");
    if (!bloc || !listeParcs || !titre || !message) throw new Error("Composant Mes parcs incomplet.");
    titre.textContent = "Mes parcs";
    menu.append(enveloppe);

    const r = await fetch(endpoint + "/parcs", { method: "GET", credentials: "include", cache: "no-store", headers: { Accept: "application/json" } });
    if (r.status === 401) { rediriger(); return false; }
    const d = await r.json().catch(() => null);
    if (!r.ok || d?.success !== true || !Array.isArray(d.parcs)) {
      message.hidden = false;
      message.dataset.lcdpMessageType = "erreur";
      message.textContent = "Impossible de charger les parcs associés à votre compte.";
      return true; // Ne pas masquer toute la page pour un incident de liste.
    }
    if (d.parcs.length === 0) {
      message.hidden = false;
      message.textContent = "Aucun parc associé à ce compte à ce jour.";
      return true;
    }
    for (const parc of d.parcs) {
      // L'API actuelle ne renvoie ni photo ni slug de page : aucune image/lien fictif.
      const boutonParc = document.createElement("button");
      boutonParc.type = "button";
      boutonParc.className = "lcdp-button lcdp-button-compte lcdp-button-compte--parc";
      boutonParc.textContent = String(parc.nomparccontact || "Parc associé");
      boutonParc.addEventListener("click", () => alerte("La page de ce parc sera disponible après le raccordement de sa fiche."));
      listeParcs.append(boutonParc);
    }
    return true;
  }
  async function demarrer() {
    if (!endpoint) { window.LCDP_echecAccueilParc(); return; }
    try {
      const r = await fetch(endpoint + "/session", { credentials: "include", cache: "no-store", headers: { Accept: "application/json" } });
      if (r.status === 401) { rediriger(); return; }
      const session = await r.json().catch(() => null);
      if (!r.ok || session?.success !== true || !session.id) throw new Error("Session PARC indisponible.");
      presenterCompte(session);
      const composants = [bandeau().catch(e => console.warn("Bandeau PARC :", e)), footer().catch(e => console.warn("Footer PARC :", e))];
      const listeChargee = await afficherMenuEtParcs();
      if (!listeChargee) return;
      await Promise.all(composants);
      contenu.hidden = false;
      contenu.setAttribute("aria-busy", "false");
      erreur.hidden = true;
      masquerAttente();
    } catch (e) {
      console.error("Accueil PARC :", e);
      masquerAttente();
      erreur.hidden = false;
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer, { once: true });
  else demarrer();
})();
