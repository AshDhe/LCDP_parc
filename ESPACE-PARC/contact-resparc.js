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
      "required": true,
      "validationNative": true,
      "maxlength": 240
    },
    {
      "type": "text",
      "id": "dptmtresp",
      "name": "dptmtresp",
      "label": "Département",
      "required": true,
      "validationNative": true,
      "maxlength": 3,
      "inputmode": "text",
      "placeholder": "Exemple 08"
    }
  ],
  "bouton": {
    "type": "submit",
    "label": "Envoyer ma demande",
    "style": "lcdp-button-secondary"
  },
  "noteHtml": "Cette demande ne crée pas d’accès à l’espace privé. Notre équipe vous recontacte pour étudier votre inscription."
};
 window.LCDP_initialiserContactResparc = async function() {
  const form=await window.LCDP_creerFormulaire("formulaire-resparc-slot",configuration);
  const endpoint=window.SITE_CONFIG?.workerContactResparcUrl || "https://lacleduparc.fr/api/contact-resparc";
  await window.LCDP_brancherFormulaireProtege(form,{type:"resparc",endpoint,champs:configuration.champs});
 };
})();
