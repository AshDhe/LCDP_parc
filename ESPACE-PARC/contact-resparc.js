(() => {
 "use strict";
 const configuration = {
  "id": "formulaire-contact-resparc",
  "ariaLabel": "Formulaire de contact",
  "titre": "Formulaire de contact",
  "validationNative": true,
  "champs": [
    {
      "type": "text",
      "id": "nomresp",
      "name": "nomresp",
      "label": "NOM",
      "placeholder": "NOM",
      "required": true,
      "validationNative": true,
      "maxlength": 120,
      "autocomplete": "family-name"
    },
    {
      "type": "text",
      "id": "prenomresp",
      "name": "prenomresp",
      "label": "Prénom",
      "placeholder": "Prénom",
      "required": true,
      "validationNative": true,
      "maxlength": 120,
      "autocomplete": "given-name"
    },
    {
      "type": "email",
      "id": "emailresp",
      "name": "emailresp",
      "label": "Adresse mail",
      "placeholder": "Adresse mail",
      "required": true,
      "validationNative": true,
      "maxlength": 254,
      "autocomplete": "email"
    },
    {
      "type": "tel",
      "id": "telresp",
      "name": "telresp",
      "label": "Ligne directe",
      "placeholder": "Ligne directe",
      "required": true,
      "validationNative": true,
      "maxlength": 120,
      "autocomplete": "tel"
    },
    {
      "type": "text",
      "id": "nomparccontact",
      "name": "nomparccontact",
      "label": "Votre parc",
      "placeholder": "Votre parc",
      "required": true,
      "validationNative": true,
      "maxlength": 240
    },
    {
      "type": "text",
      "id": "dptmtresp",
      "name": "dptmtresp",
      "label": "Département",
      "placeholder": "Département - Exemple : 08",
      "required": true,
      "validationNative": true,
      "maxlength": 3,
      "inputmode": "text"
    }
  ],
  "bouton": {
    "type": "submit",
    "label": "Envoyer ma demande",
    "style": "lcdp-button-secondary"
  },
  "introHtml": `<div class="lcdp-box-formulaire__note">Cette demande ne crée pas de compte PARC. Notre équipe vous recontacte pour étudier votre demande.</div>
    <section class="lcdp-boxtext__content" aria-labelledby="contact-parc-compte-title">
      <h2 id="contact-parc-compte-title" class="lcdp-text-strong-left" style="font-weight: 700 !important;">Le compte PARC La Clé du Parc</h2>
      <ul>
        <li>Inscrivez votre parc dans notre dynamique territoriale unique.</li>
        <li>Gardez le contrôle et la visibilité de l'accès à votre parc pour nos membres qualifiés La Clé du Parc.</li>
        <li>Devenez un acteur discret et reconnu du dynamisme territorial autour de votre parc.</li>
      </ul>
    </section>`
};
 window.LCDP_initialiserContactResparc = async function() {
  const form=await window.LCDP_creerFormulaire("formulaire-resparc-slot",configuration);
  configuration.champs.forEach((champ, index) => {
    const controle = form.elements.namedItem(champ.name);
    if (!controle) return;
    controle.setAttribute("aria-label", champ.label);
    const zone = controle.closest(".lcdp-box-champ-formulaire")?.querySelector(".lcdp-box-champ-formulaire__label-zone");
    if (!zone) return;
    if (index === 0) {
      const label = zone.querySelector("label");
      if (label) label.textContent = "Information de contact";
    } else {
      zone.hidden = true;
    }
  });
  document.dispatchEvent(new CustomEvent("lcdp:contact-formulaire-pret", {detail: {type: "parc"}}));
  const endpoint=window.SITE_CONFIG?.workerContactResparcUrl || "https://lacleduparc.fr/api/contact-resparc";
  await window.LCDP_brancherFormulaireProtege(form,{type:"resparc",endpoint,champs:configuration.champs});
 };
})();
