(() => {"use strict";
  window.LCDP_initialiserMenuBurgerParc=async function(ctx){
    const slot=document.querySelector("[data-lcdp-burger-slot]");if(!slot)return;
    const r=await fetch(ctx.urlObjet("/BOX/02-box-menu-burger.html"),{credentials:"omit",cache:"no-cache"});if(!r.ok)throw Error("Menu burger indisponible.");
    const t=document.createElement("template");t.innerHTML=(await r.text()).trim();slot.replaceChildren(t.content.cloneNode(true));
    const bouton=slot.querySelector("[data-lcdp-burger-button]"),nav=slot.querySelector("[data-lcdp-burger-nav]"),liste=slot.querySelector("[data-lcdp-burger-list]");
    if(!bouton||!nav||!liste)throw Error("Menu burger incomplet.");nav.hidden=true;const fermer=()=>{nav.hidden=true;bouton.setAttribute("aria-expanded","false");};
    const choix=[
      ["Accueil",ctx.urlEspace("/ESPACE-PARC/accueil-parc.html")],
      ["Déconnexion",null],
      ["Mon compte",null],
      ["Actualité La Clé du Parc",ctx.urlPublic("/ESPACE-PUBLIC/actualite.html")],
      ["RDV LCDP",null],
      ["Changer d’espace connecté",null]
    ];
    const configurations = [
      { id: "membre", label: "Espace MEMBRE", chemin: "/ESPACE-PUBLIC/connexion-membre.html?source=menu-mon-compte" },
      { id: "parc", label: "Espace PARC", chemin: "/ESPACE-PUBLIC/connexion-parc.html?source=menu-mon-compte" },
      { id: "coach", label: "Espace COACH", chemin: "/ESPACE-PUBLIC/connexion-coach.html?source=menu-mon-compte" }
    ];
    async function changerEspace(){
      const slotDialogue = document.getElementById("lcdp-lightbox-slot");
      const reponse = await fetch(ctx.urlObjet("/BOX/02-box-dialogue-bouton.html"), { credentials:"omit", cache:"no-cache" });
      if (!reponse.ok) { await ctx.ouvrirAlerte("Dialogue indisponible."); return; }
      const template = document.createElement("template");
      template.innerHTML = (await reponse.text()).trim();
      slotDialogue.replaceChildren(template.content.cloneNode(true));
      const fond = slotDialogue.querySelector("[data-lcdp-box-dialogue-bouton]");
      const titre = slotDialogue.querySelector("[data-lcdp-dialogue-title]");
      const texte = slotDialogue.querySelector("[data-lcdp-dialogue-text]");
      const actions = slotDialogue.querySelector("[data-lcdp-dialogue-actions]");
      const quitter = slotDialogue.querySelector("[data-lcdp-dialogue-close]");
      if (!fond || !titre || !texte || !actions || !quitter) { slotDialogue.replaceChildren(); return; }
      titre.textContent = "Espace connecté";
      texte.textContent = "Choisissez votre espace";
      const choixCompte = await new Promise(resolve => {
        let termine = false;
        const fin = valeur => { if (termine) return; termine=true; slotDialogue.replaceChildren(); resolve(valeur); };
        for (const compte of configurations) {
          const action = document.createElement("button");
          action.type = "button";
          action.className = "lcdp-button lcdp-button-compte lcdp-button-compte--" + compte.id;
          action.textContent = compte.label;
          action.addEventListener("click", () => fin(compte));
          actions.append(action);
        }
        quitter.addEventListener("click", () => fin(null));
        fond.addEventListener("click", e => { if (e.target === fond) fin(null); });
        document.addEventListener("keydown", e => { if (e.key === "Escape") fin(null); }, { once:true });
      });
      if (!choixCompte) return;
      const cfg = window.SITE_CONFIG || {};
      const routeur = String(cfg.workerUserRouteurUrl || cfg.WORKER_USER_ROUTEUR_URL || (typeof cfg.apiUrl === "function" ? cfg.apiUrl("user-routeur-api") : "")).replace(/\/+$/, "");
      if (!routeur) { window.location.href = ctx.urlPublic(choixCompte.chemin); return; }
      try {
        const r = await fetch(routeur, { method:"POST", credentials:"include", headers:{"Content-Type":"application/json"}, body:JSON.stringify({compte:choixCompte.id}) });
        if (!r.ok) throw new Error("Routeur indisponible");
        const data = await r.json().catch(() => null);
        window.location.href = data?.redirectUrl || ctx.urlPublic(choixCompte.chemin);
      } catch(e) {
        console.error("Changement d’espace connecté", e);
        window.location.href = ctx.urlPublic(choixCompte.chemin);
      }
    }
    for(const [libelle,lien]of choix){const el=document.createElement(lien?"a":"button");el.className=lien?"lcdp-box-menu-burger__link":"lcdp-box-menu-burger__button-link";el.textContent=libelle;if(lien)el.href=lien;else{el.type="button";el.addEventListener("click",async()=>{fermer();if(libelle==="RDV LCDP"){window.LCDP_ouvrirRdvCal?.("crm");return;}if(libelle==="Changer d’espace connecté"){await changerEspace();return;}if(libelle==="Mon compte"){await ctx.ouvrirAlerte("La page Mon compte de l’espace PARC sera créée prochainement.");return;}if(libelle==="Déconnexion"){try{const r=await fetch(ctx.endpoint+"/logout",{method:"POST",credentials:"include",cache:"no-store"});const d=await r.json().catch(()=>null);if(!r.ok||d?.success!==true)throw Error();window.location.href=ctx.urlPublic("/ESPACE-PUBLIC/accueil-public.html");}catch{await ctx.ouvrirAlerte("La déconnexion n’a pas pu être confirmée.");}}});}liste.append(el);}
    bouton.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();nav.hidden=!nav.hidden;bouton.setAttribute("aria-expanded",String(!nav.hidden));});
    nav.addEventListener("click",e=>e.stopPropagation());document.addEventListener("click",e=>{if(!slot.contains(e.target))fermer();});document.addEventListener("keydown",e=>{if(e.key==="Escape")fermer();});
  };
})();