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
      ["Actualité La Clé du Parc",ctx.urlPublic("/ESPACE-PUBLIC/actualite.html")]
    ];
    for(const [libelle,lien]of choix){const el=document.createElement(lien?"a":"button");el.className=lien?"lcdp-box-menu-burger__link":"lcdp-box-menu-burger__button-link";el.textContent=libelle;if(lien)el.href=lien;else{el.type="button";el.addEventListener("click",async()=>{fermer();if(libelle==="Mon compte"){await ctx.ouvrirAlerte("La page Mon compte de l’espace PARC sera créée prochainement.");return;}if(libelle==="Déconnexion"){try{const r=await fetch(ctx.endpoint+"/logout",{method:"POST",credentials:"include",cache:"no-store"});const d=await r.json().catch(()=>null);if(!r.ok||d?.success!==true)throw Error();window.location.href=ctx.urlPublic("/ESPACE-PUBLIC/accueil-public.html");}catch{await ctx.ouvrirAlerte("La déconnexion n’a pas pu être confirmée.");}}});}liste.append(el);}
    bouton.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();nav.hidden=!nav.hidden;bouton.setAttribute("aria-expanded",String(!nav.hidden));});
    nav.addEventListener("click",e=>e.stopPropagation());document.addEventListener("click",e=>{if(!slot.contains(e.target))fermer();});document.addEventListener("keydown",e=>{if(e.key==="Escape")fermer();});
  };
})();