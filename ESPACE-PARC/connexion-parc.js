(() => {
 'use strict';
 const c=window.SITE_CONFIG||{}, space='parc';
 const publicUrl=p=>typeof c.publicUrl==='function'?c.publicUrl(p):String(c.publicBaseUrl||c.PUBLIC_BASE||'https://lacleduparc.fr').replace(/\/+$/,'')+p;
 const objectUrl=p=>typeof c.objetUrl==='function'?c.objetUrl(p):publicUrl('/OBJET'+p);
 const form=document.getElementById('formulaire-connexion-parc'),button=document.getElementById('bouton-valider-formulaire');
 const endpoint=String(c.workerConnexionParcUrl||c.WORKER_CONNEXION_PARC_URL||'').replace(/\/+$/,'');
 if(!form||!button)return;
 form.dataset.connexionInitialisee='true';let busy=false;
 async function alertBox(text){
  const slot=document.getElementById('lcdp-lightbox-slot');
  try{const r=await fetch(objectUrl('/BOX/02-box-alerte.html'));if(!r.ok||!slot)throw Error();const t=document.createElement('template');t.innerHTML=await r.text();
   const zone=document.createElement('div');zone.append(t.content.cloneNode(true));slot.append(zone);const target=zone.querySelector('[data-lcdp-alerte-message]');if(!target){zone.remove();throw Error();}target.textContent=text;
   await new Promise(resolve=>{zone.querySelectorAll('[data-lcdp-alerte-ok], [data-lcdp-alerte-close]').forEach(b=>b.addEventListener('click',()=>{zone.remove();resolve();},{once:true}));});
  }catch{window.alert(text);}
 }
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;if(!form.reportValidity())return;
  if(!endpoint){await alertBox('Connexion momentanément indisponible.');return;}
  busy=true;button.disabled=true;button.classList.add('is-loading');button.setAttribute('aria-label','Connexion en cours');
  try{const response=await fetch(endpoint+'/login',{method:'POST',credentials:'include',cache:'no-store',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(20000),body:JSON.stringify({emailresp:document.getElementById('emailresp').value.trim().toLowerCase(),mdpparc:document.getElementById('mdpparc').value})});
   const data=await response.json().catch(()=>null);if(!response.ok||data?.success!==true||data.espace!==space)throw Error(data?.message||'Connexion non confirmée.');
   const session=await fetch(endpoint+'/session',{credentials:'include',cache:'no-store',signal:AbortSignal.timeout(15000)});const state=await session.json();
   if(!session.ok||state.connected!==true||state.espace!==space)throw Error('La session ne peut pas être conservée. Autorisez les cookies et réessayez.');
   const destination=typeof c.parcUrl==='function'?c.parcUrl('/index.html'):String(c.parcBaseUrl||c.PARC_BASE||'https://parc.lacleduparc.fr').replace(/\/+$/,'')+'/index.html';
   window.location.assign(destination);
  }catch(error){await alertBox(error.name==='TimeoutError'?'Le service ne répond pas. Réessayez.':error.message||'Connexion momentanément indisponible.');}
  finally{busy=false;button.disabled=false;button.classList.remove('is-loading');button.setAttribute('aria-label','Connexion');}
 });
 const recovery=document.getElementById('lien-mot-de-passe-oublie');if(recovery){recovery.href='#';recovery.addEventListener('click',event=>{event.preventDefault();alertBox('La récupération du mot de passe de cet espace n’est pas encore disponible.');});}
 async function fragment(id,path){const r=await fetch(path,{cache:'no-cache'});if(!r.ok)throw Error('Navigation indisponible');const slot=document.getElementById(id),t=document.createElement('template');t.innerHTML=await r.text();slot.replaceChildren(t.content.cloneNode(true));slot.querySelectorAll('[data-site-href]').forEach(el=>el.href=publicUrl(el.dataset.siteHref));slot.querySelectorAll('[data-site-src]').forEach(el=>el.src=publicUrl(el.dataset.siteSrc));}
 async function navigation(){await fragment('lcdp-bandeau-slot',publicUrl('/ESPACE-PUBLIC/box-bandeau-nav-public.html'));await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=publicUrl('/ESPACE-PUBLIC/box-menu-burger-public.js');s.onload=resolve;s.onerror=reject;document.body.append(s);});if(typeof window.LCDP_initialiserMenuBurgerPublic==='function')await window.LCDP_initialiserMenuBurgerPublic();}
 window.LCDP_ouvrirDialogueMonCompte=async()=>{await fragment('lcdp-lightbox-slot',objectUrl('/BOX/02-box-dialogue-bouton.html'));const slot=document.getElementById('lcdp-lightbox-slot'),dialog=slot.querySelector('[data-lcdp-box-dialogue-bouton]');dialog.querySelector('[data-lcdp-dialogue-title]').textContent='Mon compte';dialog.querySelector('[data-lcdp-dialogue-text]').textContent='Choisissez votre espace.';const actions=dialog.querySelector('[data-lcdp-dialogue-actions]');actions.replaceChildren();for(const name of ['membre','coach','parc']){const a=document.createElement('a');a.className='lcdp-button lcdp-button-primary';a.textContent='Connexion '+name;a.href=publicUrl('/ESPACE-PUBLIC/connexion-'+name+'.html');actions.append(a);}dialog.querySelector('[data-lcdp-dialogue-close]').addEventListener('click',()=>slot.replaceChildren());};
 document.addEventListener('lcdp:ouvrir-dialogue-mon-compte',()=>window.LCDP_ouvrirDialogueMonCompte().catch(console.error));
 navigation().catch(console.error);fragment('lcdp-footer-slot',objectUrl('/BOX/02-box-footer.html')).catch(console.error);
})();
