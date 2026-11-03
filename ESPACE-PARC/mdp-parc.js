(()=>{"use strict";
const role='parc',form=document.getElementById('formulaire-mdp-parc'),password=document.getElementById('password'),status=document.getElementById('statut'),submit=document.getElementById('envoyer');
const qs=new URLSearchParams(location.search),mode=qs.get('mode'),token=qs.get('token');
const cfg=window.SITE_CONFIG||{};
const worker=cfg.workerMdptokenzParcUrl||cfg.WORKER_MDPTOKENZ_PARC_URL||'https://mdptokenz-parc-api.lacleduparc.fr';
const connexion=typeof cfg.publicUrl==='function'?cfg.publicUrl('/ESPACE-PUBLIC/connexion-parc.html'):(cfg.publicBaseUrl||'https://lacleduparc.fr')+'/ESPACE-PUBLIC/connexion-parc.html';
if(!['create','reset'].includes(mode)||!token||!/^[0-9a-f-]{36}$/i.test(token)){submit.disabled=true;status.textContent='Lien invalide ou expiré.';}
document.getElementById('titre-mode').textContent=mode==='reset'?'Réinitialisation du mot de passe':'Création du mot de passe';
document.getElementById('afficher').addEventListener('change',e=>password.type=e.target.checked?'text':'password');
form.addEventListener('submit',async e=>{e.preventDefault();if(submit.disabled||password.value.length<10||!document.getElementById('unikuser').checked)return;
submit.disabled=true;status.textContent='Enregistrement en cours…';
try{const r=await fetch(worker,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'write-mdp',token,mode,password:password.value,unikuser:true})});const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||'Opération impossible.');password.value='';status.textContent='Votre mot de passe est enregistré. Vous allez accéder à la page de connexion.';location.assign(connexion);}
catch(ex){status.textContent=ex.message;submit.disabled=false;}});
})();