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
    // Accueil PARC : aucun bouton générique dans le contenu.
    // Les établissements sont représentés par le composant Card Parc diaporama existant.
    menu.replaceChildren();
    const titre = document.createElement("h2");
    titre.className = "lcdp-box-liste-card__title";
    titre.textContent = "Mes parcs";
    menu.append(titre);
    const fragmentListe = await fragment(objet("/BOX/04-box-liste-card-diaporama.html"));
    const listeParcs = fragmentListe.querySelector("[data-lcdp-liste-card-diaporama-list]");
    if (!listeParcs) throw new Error("Composant diaporama des parcs incomplet.");
    menu.append(fragmentListe);

    const message = document.createElement("p");
    message.className = "lcdp-box-liste-card__message";
    message.hidden = true;
    menu.append(message);
    const r = await fetch(endpoint + "/parcs", {
      method: "GET", credentials: "include", cache: "no-store",
      headers: { Accept: "application/json" }
    });
    if (r.status === 401) { rediriger(); return false; }
    const d = await r.json().catch(() => null);
    if (!r.ok || d?.success !== true || !Array.isArray(d.parcs)) {
      // La route /parcs n'est pas présente dans le Worker transmis.
      message.hidden = false;
      message.dataset.lcdpMessageType = "erreur";
      message.textContent = "Impossible de charger les parcs associés à votre compte.";
      return true;
    }
    if (d.parcs.length === 0) {
      message.hidden = false;
      message.textContent = "Aucun parc associé à ce compte à ce jour.";
      return true;
    }
    for (const parc of d.parcs) {
      const nom = String(parc.nomparccontact || parc.nomparc || "").trim();
      // Ne pas afficher une carte fictive en cas de données incomplètes.
      if (!nom) continue;
      const carteFragment = await fragment(objet("/BOX/04-box-card-parc-diaporama.html"));
      const carte = carteFragment.querySelector("[data-lcdp-card-parc-diaporama]");
      const ouvrir = carte?.querySelector("[data-lcdp-diaporama-retourner]");
      const fermer = carte?.querySelector("[data-lcdp-diaporama-fermer]");
      const dos = carte?.querySelector("[data-lcdp-diaporama-dos]");
      const contenuDos = carte?.querySelector("[data-lcdp-diaporama-dos-contenu]");
      if (!carte || !ouvrir || !fermer || !dos || !contenuDos) throw new Error("Card Parc incomplète.");

      // La photo provient exclusivement de la réponse du Worker, si elle est fournie.
      const sourceImage = [parc.photoparc, parc.photo, parc.image_url, parc.imageUrl]
        .find(v => typeof v === "string" && /^https:\/\//i.test(v.trim()));
      if (sourceImage) {
        const media = document.createElement("span");
        media.className = "lcdp-box-card-parc__media";
        const image = document.createElement("img");
        image.className = "lcdp-box-card-parc__image";
        image.alt = "";
        image.src = sourceImage;
        image.loading = "lazy";
        media.append(image);
        ouvrir.append(media);
      }
      const nomRecto = document.createElement("span");
      nomRecto.className = "lcdp-box-card-parc-diaporama__nom";
      nomRecto.textContent = nom;
      ouvrir.append(nomRecto);
      ouvrir.setAttribute("aria-label", "Découvrir le parc " + nom);
      const nomVerso = document.createElement("h3");
      nomVerso.className = "lcdp-box-card-parc__title";
      nomVerso.textContent = nom;
      contenuDos.append(nomVerso);
      // Les six actions de gestion sont réservées à la future page du parc :
      // aucun bouton inopérant ni URL supposée n'est créé ici.
      const infos = document.createElement("p");
      infos.className = "lcdp-box-card-parc__description";
      infos.textContent = "La page de gestion de ce parc n’est pas encore disponible.";
      contenuDos.append(infos);
      ouvrir.addEventListener("click", () => {
        carte.classList.add("is-retourne");
        ouvrir.setAttribute("aria-expanded", "true");
        dos.setAttribute("aria-hidden", "false");
      });
      fermer.addEventListener("click", () => {
        carte.classList.remove("is-retourne");
        ouvrir.setAttribute("aria-expanded", "false");
        dos.setAttribute("aria-hidden", "true");
        ouvrir.focus();
      });
      listeParcs.append(carte);
      requestAnimationFrame(() => carte.classList.add("is-ready"));
    }
    if (!listeParcs.children.length) {
      message.hidden = false;
      message.textContent = "Aucun parc exploitable dans les données reçues.";
    }
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
    } catch (e) {
      console.error("Accueil PARC :", e);
      masquerAttente();
      erreur.hidden = false;
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer, { once: true });
  else demarrer();
})();
