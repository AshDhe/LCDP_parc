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
  "introHtml": `<div class="lcdp-box-formulaire__note">Cette demande ne crée pas de compte PARC. Notre équipe vous recontacte pour étudier votre demande.</div>
    <section class="lcdp-boxtext__content" aria-labelledby="contact-parc-compte-title">
      <h2 id="contact-parc-compte-title" class="lcdp-text-strong-left" style="font-weight: 700 !important;">Le compte PARC La Clé du Parc</h2>
      <ul>
        <li>Inscrivez votre parc dans notre dynamique territoriale unique.</li>
        <li>Gardez le contrôle et la visibilité de l'accès à votre parc pour nos membres qualifiés La Clé du Parc.</li>
        <li>Devenez un actor discret et reconnu du dynamisme territorial autour de votre parc.</li>
      </ul>
    </section>`
 };

 window.LCDP_initialiserContactResparc = async function() {
  let attenteFormulaire = null;

  // 1. DÉMARRAGE : On affiche le GIF de chargement immédiatement
  if (window.LCDP_chargement) {
    attenteFormulaire = window.LCDP_chargement.afficher();
  }

  try {
    // 2. ATTENTE : Exécution des fonctions asynchrones de chargement du formulaire
    const form = await window.LCDP_creerFormulaire("formulaire-resparc-slot", configuration);
    const endpoint = window.SITE_CONFIG?.workerContactResparcUrl || "https://lacleduparc.fr";
    await window.LCDP_brancherFormulaireProtege(form, { type: "resparc", endpoint, champs: configuration.champs });

  } catch (error) {
    // Gestion d'une éventuelle erreur de l'application pendant le chargement
    console.error("Erreur lors de l'initialisation du formulaire responsable parc :", error);

  } finally {
    // 3. ARRÊT : Quoi qu'il arrive (succès ou échec), on masque le GIF dès que le processus est fini
    if (attenteFormulaire && window.LCDP_chargement) {
      window.LCDP_chargement.masquer(attenteFormulaire);
    }
  }
 };
})();
