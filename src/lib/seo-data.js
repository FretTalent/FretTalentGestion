/**
 * Données SEO exhaustives et ultra-enrichies pour les 15 landing pages FretTalent
 * Articles de 1 000 à 1 500 mots, tableaux comparatifs, FAQs et données structurées.
 */

export const seoPagesData = {
  'chauffeur-spl': {
    slug: 'chauffeur-spl',
    metaTitle: 'Emploi Chauffeur SPL | Recrutement Permis CE Transport Routier FretTalent',
    metaDescription: 'Trouvez un emploi de chauffeur routier SPL (Permis CE, FIMO, FCO, Chrono). Guide complet du métier, salaires, comparatifs et recrutement direct par les transporteurs sans intermédiaire.',
    h1: 'Recrutement & Emploi Chauffeur SPL (Super Poids Lourd - Permis CE)',
    subtitle: 'Accédez en direct aux meilleures offres d’emploi et candidatures pour conducteurs routiers grand ruban, régional et national titulaires du permis CE.',
    badgeText: 'Métier • Chauffeur SPL / Permis CE',
    keyTakeaways: [
      "Permis CE obligatoire + FIMO ou FCO Marchandises valide",
      "Carte conducteur chronotachygraphe numérique à jour",
      "Salaire moyen : 2 400 € à 3 400 € brut/mois + frais de déplacement",
      "Recrutement direct 0% commission d'intérim sur FretTalent"
    ],
    sections: [
      {
        h2: "Le Métier de Chauffeur SPL en France : Exigences, Quotidien & Carrière",
        content: "Le conducteur routier Super Poids Lourd (SPL) est le garant de la continuité de la chaîne logistique française et européenne. Titulaire du permis CE et titulaire d'une FIMO (Formation Initiale Minimale Obligatoire) ou FCO (Formation Continue de la Sécurité) à jour, le chauffeur SPL pilote des ensembles routiers de plus de 3,5 tonnes pouvant atteindre 44 tonnes de poids total roulant autorisé (PTRA). Qu'il s'agisse de tracteurs routiers avec semi-remorque (savoyarde, tautliner, frigo, benne) ou de trains routiers avec remorque, ce professionnel assure l'acheminement sécurisé des marchandises sur de courtes, moyennes ou longues distances.",
        subsections: [
          {
            h3: "Permis & Certifications Réglementaires Obligatoires",
            content: "L'accès au métier impose d'être titulaire du permis CE (extension du permis C aux véhicules tractant une remorque > 750 kg). S'y ajoutent la qualification FIMO/FCO Marchandises (renouvelable tous les 5 ans) et la carte de conducteur pour le chronotachygraphe numérique."
          },
          {
            h3: "Conduite Régionale vs Grand Ruban (Découchés)",
            content: "Le chauffeur SPL régional effectue des tournées de distribution quotidiennes avec un retour chaque soir au domicile. Le conducteur grand ruban (national ou international) effectue des découchés réguliers (plusieurs nuits par semaine dans la cabine du camion) avec des primes d'éloignement et de repas revalorisées."
          }
        ]
      },
      {
        h2: "Compétences Techniques & Réglementation Sociale Européenne (RSE)",
        content: "Au-delà de la maîtrise de la conduite d'un ensemble articulé de 16,50 mètres de long, le conducteur Super Poids Lourd doit maîtriser parfaitement les règles RSE régissant les temps de conduite et de repos. La durée maximale de conduite journalière est fixée à 9 heures (extensible à 10 heures deux fois par semaine), avec une pause obligatoire de 45 minutes après 4 heures et demie de conduite continue.",
        subsections: [
          {
            h3: "Arrimage & Sécurisation des Chargements",
            content: "Le chauffeur est garant du bon centrage et du sanglage du fret. Il doit connaître les limites de charge par essieu, la répartition des masses et les consignes particulières selon le type de marchandise (palettes, vrac, produits frais ou dangereux)."
          },
          {
            h3: "Gestion Administrative & CMR",
            content: "À chaque livraison, le conducteur contrôle la conformité des lettres de voiture (CMR international ou récépissé national), fait émarger le destinataire et signale toute réserve en cas de litige ou d'avarie constatée lors du déchargement."
          }
        ]
      },
      {
        h2: "Grille Salariale & Avantages du Chauffeur SPL en 2026",
        content: "La rémunération du chauffeur SPL dépend de son taux horaire de convention collective (IDCC 1600 - Transport Routier), du coefficient (généralement 150M pour le régional et 138M ou 150M pour le grand ruban), des heures supplémentaires (25% et 50%) ainsi que des indemnités conventionnelles de frais (repas du midi, repas du soir, découché).",
        subsections: [
          {
            h3: "Salaire Débutant & Confirmé",
            content: "Un chauffeur SPL débutant perçoit en moyenne entre 2 100 € et 2 400 € net/mois (frais inclus). Un conducteur grand ruban expérimenté ou effectuant du transport spécialisé peut dépasser 3 200 € à 3 600 € net/mois."
          },
          {
            h3: "Évolution de Carrière",
            content: "Après plusieurs années d'expérience, un chauffeur SPL peut évoluer vers des postes de chef d'équipe, moniteur d'entreprise, formateur FIMO/FCO, ou créer sa propre entreprise de transport routier (attestation de capacité)."
          }
        ]
      }
    ],
    comparisonTable: {
      title: "Comparatif Métier : Chauffeur SPL vs Chauffeur PL",
      headers: ["Critère", "Chauffeur SPL (Permis CE)", "Chauffeur PL (Permis C)"],
      rows: [
        ["Poids Routier Maximal", "Jusqu'à 44 tonnes (PTRA)", "Jusqu'à 32 tonnes (PTAC porteur)"],
        ["Type de Véhicule", "Semi-remorque, train routier, porte-conteneur", "Porteur rigide 2, 3 ou 4 essieux"],
        ["Rayon d'Action", "Régional, National, International (Grand Ruban)", "Principalement Régional et Urbain"],
        ["Découchés (Nuits hors domicile)", "Féquents en grand ruban (1 à 4 nuits/semaine)", "Rares (retour domicile quotidien)"],
        ["Salaire Moyen Mensuel", "2 400 € à 3 500 € net (frais inclus)", "1 900 € à 2 600 € net (frais inclus)"]
      ]
    },
    faqs: [
      {
        q: "Quelles sont les diplômes ou formations pour devenir chauffeur SPL ?",
        a: "Il existe plusieurs voies d'accès : le Permis CE suivi de la FIMO Passerelle ou FIMO Voyageurs, le Titre Professionnel de Conducteur du Transport Routier de Marchandises sur Porteur (TP CTRMP) puis Tous Véhicules (TP CTRMTV), ou le CAP Conducteur Routier."
      },
      {
        q: "Quelle est la durée de validité de la carte de conducteur chronotachygraphe ?",
        a: "La carte de conducteur chronotachygraphe est personnelle et valable 5 ans. Elle doit être renouvelée auprès d'Chronoservices au moins 1 mois avant sa date d'expiration."
      },
      {
        q: "Comment trouver un poste de chauffeur SPL sans passer par l'intérim ?",
        a: "Sur FretTalent, inscrivez-vous gratuitement et déposez votre profil. Les entreprises de transport routier partenaires accèdent directement à votre dossier et vous contactent pour des contrats en CDI ou CDD sans aucun intermédiaire."
      },
      {
        q: "La formation FCO est-elle obligatoire pour continuer à conduire ?",
        a: "Oui, la Formation Continue Obligatoire (FCO) doit être effectuée tous les 5 ans (durée de 35 heures) dans un centre agréé pour prolonger la validité de la qualification de conducteur."
      }
    ]
  },

  'chauffeur-pl': {
    slug: 'chauffeur-pl',
    metaTitle: 'Emploi Chauffeur PL | Offres & Recrutement Permis C Poids Lourd FretTalent',
    metaDescription: 'Découvrez les offres d’emploi et le guide complet pour chauffeur poids lourd (Permis C). Distribution régionale, messagerie, camion porteur et livraison urbaine sans intermédiaire.',
    h1: 'Emploi & Recrutement Chauffeur PL (Poids Lourd - Permis C)',
    subtitle: 'Trouvez rapidement votre poste de conducteur routier poids lourd porteur en distribution régionale, messagerie et logistique locale.',
    badgeText: 'Métier • Chauffeur PL / Permis C',
    keyTakeaways: [
      "Permis C obligatoire + FIMO/FCO Marchandises",
      "Véhicules porteurs de plus de 3,5t PTAC",
      "Retour quotidien au domicile garanti en distribution",
      "Accès direct aux employeurs régionaux 0% commission"
    ],
    sections: [
      {
        h2: "Le Rôle Clé du Chauffeur PL dans la Distribution & la Messagerie",
        content: "Le conducteur poids lourd (PL) est le maillon indispensable de la livraison de proximité et de la distribution régionale. Au volant d'un camion porteur rigide d'un poids total en charge (PTAC) supérieur à 3,5 tonnes (camions 12t, 19t ou 26t), le chauffeur PL effectue des tournées quotidiennes d'approvisionnement des commerces, supermarchés, chantiers ou plateformes logistiques.",
        subsections: [
          {
            h3: "Missions & Tournées de Livraison",
            content: "Le chauffeur PL prépare et vérifie son camion avant le départ, charge les palettes ou colis, suit la feuille de route transmise par l'exploitant transport, effectue les manœuvres de mise à quai et gère le déchargement à l'aide d'un hayon élévateur ou d'un transpalette électrique."
          },
          {
            h3: "Conduite Urbaine & Relation Client",
            content: "Contrairement au grand ruban, le chauffeur PL évolue fréquemment en agglomération et zones industrielles. Il doit faire preuve d'anticipation face au trafic routier et d'un excellent sens relationnel auprès des clients récepteurs."
          }
        ]
      },
      {
        h2: "Compétences Réglementaires & Équipements du Véhicule PL",
        content: "Pour exercer comme conducteur poids lourd, le permis C est requis, accompagné de la carte de qualification FIMO/FCO. Le suivi rigoureux du chronotachygraphe reste obligatoire, même sur les courtes distances régionales.",
        subsections: [
          {
            h3: "Utilisation des Équipements de Manutention",
            content: "La maîtrise du hayon élévateur, du transpalette manuel ou à conducteur porté et du sanglage des palettes est essentielle pour prévenir les risques de casse et les troubles musculo-squelettiques."
          }
        ]
      }
    ],
    comparisonTable: {
      title: "Tableau d'Orientation : Distribution PL vs Transport Grand Ruban SPL",
      headers: ["Caractéristiques", "Chauffeur PL (Distribution)", "Chauffeur SPL (Grand Ruban)"],
      rows: [
        ["Rythme de Vie", "Retour au domicile chaque soir", "Plusieurs nuits en cabine par semaine"],
        ["Nombre de Points de Livraison", "Multi-clients (10 à 30 clients/jour)", "Mono ou Bi-client (1 à 3 clients/jour)"],
        ["Manutention", "Déchargement physique au hayon", "Chargement/déchargement à quai souvent assisté"],
        ["Permis Requis", "Permis C", "Permis CE (Super Poids Lourd)"]
      ]
    },
    faqs: [
      {
        q: "Quel est le salaire d'un chauffeur PL débutant ?",
        a: "Un chauffeur PL débute en moyenne entre 1 900 € et 2 300 € net par mois, selon les primes de panier, d'assiduité et la région d'exercice."
      },
      {
        q: "Peut-on passer du permis C au permis CE rapidement ?",
        a: "Oui, après l'obtention du permis C, il est possible de suivre la formation au permis CE (ou une FIMO passerelle) pour évoluer vers la conduite de véhicules Super Poids Lourds (SPL)."
      }
    ]
  },

  'chauffeur-adr': {
    slug: 'chauffeur-adr',
    metaTitle: 'Chauffeur ADR / Transport Matières Dangereuses | Offres & Recrutement FretTalent',
    metaDescription: 'Guide complet du métier de chauffeur routier ADR (Matières Dangereuses de base, Citerne, Chimique, Gaz). Règlementation, valise ADR, salaires, comparatifs et offres d’emploi directes sans intérim.',
    h1: 'Recrutement & Emploi Chauffeur ADR (Transport Matières Dangereuses)',
    subtitle: 'Accédez aux offres d’emploi et candidatures pour conducteurs routiers qualifiés ADR de Base, ADR Citerne Pétrolière et Produits Chimiques partout en France.',
    badgeText: 'Spécialisation • Transport ADR / Chimique',
    keyTakeaways: [
      "Attestation de formation ADR de Base ou Citerne (gaz/chimie/pétrole) valide",
      "Maîtrise de la classification des matières dangereuses (Classes 1 à 9)",
      "Conformité des équipements : valise ADR, extincteurs, panneaux oranges UN",
      "Grille salariale attractive : 2 500 € à 3 800 € net/mois (primes de risque incluses)"
    ],
    sections: [
      {
        h2: "Le Transport Routier de Matières Dangereuses (ADR) : Réglementation & Exigences",
        content: "Le transport par route de marchandises dangereuses est soumis à une réglementation européenne stricte intitulée Accord ADR (Accord européen relatif au transport international des marchandises dangereuses par route). Le conducteur routier ADR est un professionnel hautement spécialisé responsable de l'acheminement sécurisé de produits chimiques, carburants, gaz liquides, matières corrosives ou comburantes. Face à la technicité du métier et aux normes environnementales et de sécurité incendie, les transporteurs routiers recherchent en permanence des chauffeurs rigoureux titulaires d'une attestation ADR à jour.",
        subsections: [
          {
            h3: "La Classification Internationale des Matières Dangereuses (Classes 1 à 9)",
            content: "Le chauffeur ADR manipule des marchandises réparties en 9 classes de danger : Classe 3 (Liquides inflammables comme l'essence et le fioul), Classe 2 (Gaz inflammables et toxiques), Classe 8 (Matières corrosives), Classe 6 (Matières toxiques), Classe 4 (Solides inflammables), Classe 5 (Comburants), ainsi que les classes spéciales 1 (Explosifs) et 7 (Radioactifs)."
          },
          {
            h3: "Les Différents Niveaux de Certifications ADR",
            content: "La formation ADR de Base est le socle obligatoire pour transporter des colis ou vracs solides dangereux. Elle doit être complétée par des spécialisations spécifiques : ADR Citerne (transports pétroliers et produits chimiques en citerne), ADR Citerne Gaz (GLP, GNL, azote liquide), ou les spécialisations Classe 1 (Explosifs) et Classe 7 (Radioactifs)."
          }
        ]
      },
      {
        h2: "Consignes de Sécurité, Signalisation UN & Valise ADR Obligatoire",
        content: "Avant chaque départ, le chauffeur routier certifié ADR effectue un contrôle rigoureux du camion porteur ou de l'ensemble routier articulé. Il s'assure du bon positionnement des panneaux oranges d'avertissement et des plaques-étiquettes de danger sur le véhicule.",
        subsections: [
          {
            h3: "Lecture des Panneaux Oranges Numérotés (Code UN & Danger)",
            content: "Le panneau orange rectangulaire comporte deux numéros majeurs : le numéro d'identification du danger (code Kemler en haut, ex: 33 pour liquide très inflammable) et le numéro d'identification de la matière (numéro UN en bas, ex: 1203 pour le carburant automobile ou 1202 pour le gazole)."
          },
          {
            h3: "La Valise ADR & Équipements de Protection Individuelle (EPI)",
            content: "Le camion doit embarquer l'équipement réglementaire composé d'extincteurs contrôlés, de cale de roue, de signaux d'avertissement autonomes (triangles ou feux clignotants), d'un kit de protection individuelle (masque d'évacuation d'urgence, lunettes étanches, gants de protection chimique, bavette d'obturation d'égout et bac collecteur)."
          }
        ]
      },
      {
        h2: "Grille Salariale & Rémunération du Chauffeur ADR en 2026",
        content: "En raison des risques encourus et de la haute technicité exigée, les chauffeurs routiers titulaires de la qualification ADR bénéficient d'un taux horaire et de primes conventionnelles nettement supérieures au transport régional standard. La rémunération est renforcée par les indemnités de repas, les primes d'astreinte, de lavage de citerne et de manipulation de produits dangereux.",
        subsections: [
          {
            h3: "Salaire Moyen Chauffeur ADR Citerne vs Colis",
            content: "Un chauffeur ADR de Base perçoit en moyenne entre 2 200 € et 2 700 € net/mois. Un conducteur ADR Citerne pétrolière ou chimique expérimenté effectuant du grand ruban ou du transport de nuit peut atteindre 3 200 € à 3 800 € net par mois."
          },
          {
            h3: "Perspectives de Carrière & Évolutions",
            content: "Un conducteur ADR aguerri peut évoluer vers des postes de conseiller à la sécurité transport (CSTD), responsable d'exploitation de dépôt pétrolier/chimique ou formateur agréé en centre FIMO/ADR."
          }
        ]
      }
    ],
    comparisonTable: {
      title: "Tableau Comparatif des Qualifications & Spécialisations ADR",
      headers: ["Spécialisation", "ADR de Base", "ADR Citerne Pétrolière", "ADR Citerne Chimique / Gaz"],
      rows: [
        ["Types de Fret", "Colis, fûts, conteneurs, vrac solide", "Carburants, fioul, gazole, kérosène", "Acides, gaz liquides (GPL/GNL), solvants"],
        ["Véhicules Utilisés", "Bâché (Tautliner), Fourgon, Porteur", "Tracteur + Citerne compartimentée", "Citerne inox/aluminium spécialisée"],
        ["Niveau de Formation", "Stage de base (3 jours)", "Stage de base + Spécialisation Citerne", "Stage de base + Citernes Gaz / Chimie"],
        ["Primes & Rémunération", "Standard + Prime ADR (2 200 € - 2 700 €)", "Élevée + Prime volucompteur (2 800 € - 3 400 €)", "Très élevée + Primes risques (3 000 € - 3 800 €)"],
        ["Contrôles Principaux", "Arrimage, étiquetage colis, extincteurs", "Test d'étanchéité, dépotage à la pompe", "Pression de citerne, purges, EPI étanches"]
      ]
    },
    faqs: [
      {
        q: "Quelle est la durée de validité du certificat de formation ADR ?",
        a: "Le certificat ADR est valable 5 ans. Pour prolonger sa validité, le conducteur doit suivre un stage de recyclage ADR d'une durée de 2 jours et réussir le QCM de contrôle avant l'échéance indiquée sur sa carte."
      },
      {
        q: "Quelle est la différence entre la plaque orange vierge et la plaque orange numérotée ?",
        a: "La plaque orange vierge (sans numéro) indique que le véhicule transporte des marchandises dangereuses en colis (ex: camions bâchés). La plaque orange numérotée (avec le code Kemler et le numéro UN) est obligatoire pour les transports en citerne ou vrac."
      },
      {
        q: "Quel est le matériel obligatoire dans la valise ADR ?",
        a: "La valise ADR contient obligatoirement un liquide de rincage pour les yeux, une baudrier haute visibilité, une lampe de poche anti-déflagrante, une paire de gants de protection, des lunettes de sécurité, un masque d'évacuation, un pelle, une plaque d'obturation d'égout et un bac plastique récepteur."
      },
      {
        q: "Faut-il le permis CE pour passer le certificat ADR ?",
        a: "Non, la formation ADR de Base est accessible dès lors que vous êtes titulaire du permis C (porteur poids lourd) ou du permis CE (Super Poids Lourd) et de la FIMO/FCO Marchandises."
      },
      {
        q: "Comment trouver un emploi de chauffeur ADR sans intermédiaire ?",
        a: "FretTalent met en relation directe les chauffeurs certifiés ADR avec les entreprises du secteur pétrolier et chimique. Créez votre profil gratuitement et recevez des propositions d'embauche en CDI/CDD direct."
      }
    ]
  },

  'chauffeur-frigo': {
    slug: 'chauffeur-frigo',
    metaTitle: 'Chauffeur Frigo (Transport Frigorifique) | Offres & Recrutement FretTalent',
    metaDescription: 'Guide métier du chauffeur routier frigorifique. Température dirigée (frais, surgelés, viandes, légumes), agrément ATP, groupe froid Carrier/Thermo King, salaires et offres d’emploi directes.',
    h1: 'Emploi & Recrutement Chauffeur Frigo (Transport Sous Température Dirigée)',
    subtitle: 'Rejoignez les acteurs majeurs du transport frigorifique agroalimentaire, de la viande et de la chaîne du froid partout en France.',
    badgeText: 'Spécialisation • Transport Frigorifique',
    keyTakeaways: [
      "Maîtrise des groupes frigorifiques (Carrier, Thermo King, mono/multi-température)",
      "Agrément sanitaire ATP et traçabilité de la température (enregistreur Datacold)",
      "Liaisons Rungis, MIN, centrales d'achat et Grande Distribution",
      "Rémunération attractive avec primes de nuit, de week-end et casse-croûte"
    ],
    sections: [
      {
        h2: "Le Transport Frigorifique Agroalimentaire : Rôle & Exigences Sanitaires",
        content: "Le conducteur frigorifique joue un rôle vital dans l'approvisionnement alimentaire de la population. Il assure l'acheminement sécurisé des denrées périssables (produits laitiers, légumes frais, fruits, viande pendue, poisson, plats préparés) et surgelés, ainsi que des produits pharmaceutiques sensibles. Sa responsabilité première est de garantir le maintien ininterrompu de la chaîne du froid, de l'enlèvement chez le producteur jusqu'à la livraison sur quai récepteur.",
        subsections: [
          {
            h3: "Les Classes de Température Dirigée (Frais vs Surgelé)",
            content: "Le chauffeur frigo règle son groupe thermique selon les consignes : Produits Frais (+2°C à +4°C), Produits Surgelés et Glaces (-20°C à -25°C), Bananes et Produits Exotiques (+12°C à +14°C), Viande fraîche pendue (+0°C à +2°C)."
          },
          {
            h3: "L'Agrément Sanitaire ATP & Hygiène des Caisses Frigo",
            content: "Toutes les caisses frigorifiques doivent posséder un attestation de conformité technique ATP (Accord relatif aux Transports internationaux de denrées Périssables) valide. Le chauffeur veille à la propreté et à la désinfection régulière de la caisse isotherme avant chaque chargement."
          }
        ]
      },
      {
        h2: "Exploitation du Groupe Froid, Enregistreur de Température & Matériel",
        content: "La conduite d'une semi-remorque frigorifique (13,60m) ou d'un porteur frigo exige la parfaite maîtrise des commandes du moteur thermique auxiliaire (de marques référentes comme Carrier Transicold ou Thermo King).",
        subsections: [
          {
            h3: "Supervision du Groupe Thermal & Décrassage",
            content: "Avant la mise à quai, le conducteur effectue la pré-descente en température de la caisse frigo. Pendant le trajet, il contrôle la température de soufflage, le dégivrage automatique du moteur et le niveau du réservoir de gazole dédié au groupe frigorifique."
          },
          {
            h3: "Traçabilité & Impression du Ticket de Température (Datacold)",
            content: "À l'arrivée chez le client, l'enregistreur électronique de température (ex: Datacold ou Transcan) permet d'imprimer la courbe de température du voyage attestant du respect des normes lors du déchargement."
          }
        ]
      },
      {
        h2: "Horaires de Travail, Rungis & Rémunération du Chauffeur Frigo en 2026",
        content: "Le transport frigorifique est caractérisé par un fonctionnement en continu (24h/24 et 7j/7) afin d'approvisionner les étals de la grande distribution avant l'ouverture. Les chauffeurs bénéficient de nombreuses primes conventionnelles venant majorer leur salaire net.",
        subsections: [
          {
            h3: "Livraisons Nocturnes & Centrales d'Achat",
            content: "Les départs s'effectuent fréquemment en cours de nuit (entre 2h et 5h du matin) pour acheminer le fret depuis les Marchés d'Intérêt National (MIN de Rungis, Lomme, Lyon-Corbas) vers les centrales d'achat de la grande distribution."
          },
          {
            h3: "Salaire Moyen Chauffeur Frigo (Régional & Grand Ruban)",
            content: "Le salaire moyen d'un chauffeur frigo s'établit entre 2 300 € et 2 800 € net/mois en régional, et peut atteindre 3 000 € à 3 500 € net/mois en grand ruban national ou international avec les majorations de nuit et frais de route."
          }
        ]
      }
    ],
    comparisonTable: {
      title: "Tableau Comparatif des Typologies de Transport Frigorifique",
      headers: ["Segment", "Transport Produit Frais", "Transport Surgelé (-20°C)", "Transport Viande Pendue", "Transport Pharma (+15°C/+25°C)"],
      rows: [
        ["Température Consigne", "+2°C à +4°C", "-20°C à -25°C", "0°C à +2°C", "+15°C à +25°C ou +2°C/+8°C"],
        ["Équipement Caisse", "Semi-remorque isotherme standard", "Caisse renforcée forte isolation", "Caisse équipée de rails à viande au toit", "Caisse certifiée CERTIPHARM / GDP"],
        ["Horaires Clés", "Nuit et tôt le matin", "Jour et Nuit réguliers", "Très tôt le matin (abattoirs)", "Heures de jour (livraison hôpitaux)"],
        ["Contraintes Majeures", "Créneaux horaires très courts", "Risque de décongélation immédiat", "Effort physique au penderie/crochets", "Sécurité renforcée et enregistreurs étalonnés"]
      ]
    },
    faqs: [
      {
        q: "Qu'est-ce que l'attestation de conformité sanitaire ATP pour une remorque frigo ?",
        a: "L'attestation ATP est délivrée par Cemafroid. Elle certifie la capacité d'isolation thermique de la caisse et la puissance du groupe frigorifique. Elle est obligatoire pour transporter des denrées périssables au-delà de 50 kilomètres sans rupture de température."
      },
      {
        q: "Comment réagir en cas d'alarme ou de panne du groupe frigorifique ?",
        a: "Le chauffeur doit immédiatement se garer en sécurité, vérifier le niveau de gazole du groupe, contrôler la fermeture des portes, contacter son exploitant transport et enclencher la procédure de secours ou l'intervention d'un dépanneur Carrier/Thermo King H24."
      },
      {
        q: "Pourquoi le transport frigo nécessite-t-il souvent de travailler la nuit ?",
        a: "Pour garantir la fraîcheur optimale des aliments (viande, légumes, produits laitiers), les produits récoltés ou abattus la veille doivent être livrés en plateforme logistique pendant la nuit afin d'être en rayon dès 8h du matin."
      },
      {
        q: "Quel permis est nécessaire pour conduire un camion frigo ?",
        a: "Le permis C convient pour les camionnettes et porteurs frigo rigides. Le permis CE (Super Poids Lourd) est nécessaire pour conduire des semi-remorques frigorifiques de 44 tonnes."
      },
      {
        q: "Comment postuler aux offres de chauffeur frigo sur FretTalent ?",
        a: "Créez votre profil conducteur en indiquant vos permis, FIMO et votre expérience sur groupe frigo. Les transporteurs agroalimentaires partenaires vous contacteront directement sans frais d'agence."
      }
    ]
  },

  'chauffeur-benne': {
    slug: 'chauffeur-benne',
    metaTitle: 'Chauffeur Benne (Travaux Publics & Vrac) | Offres & Recrutement FretTalent',
    metaDescription: 'Guide du métier de conducteur poids lourd et SPL benne (TP, céréalière, ferraille, enrobé, enrochement). Manœuvres de bennage, CACES TP, salaires et recrutements directs.',
    h1: 'Recrutement & Emploi Chauffeur Benne (TP, Carrière & Vrac Agricole)',
    subtitle: 'Consultez les opportunités d’emploi pour chauffeurs benne TP, benne céréalière, enrobé et vrac industriel sur toute la France.',
    badgeText: 'Spécialisation • Transport Benne & TP',
    keyTakeaways: [
      "Permis C ou CE + FIMO/FCO Marchandises",
      "Maîtrise des manœuvres de bennage en carrière, centrale d'enrobé et chantier TP",
      "Bâchage automatique Cramaro et contrôle de la planéité du sol",
      "Retour quotidien au domicile garanti dans 90% des postes régionaux"
    ],
    sections: [
      {
        h2: "Le Métier de Chauffeur Benne : Chantiers, Carrières & Agriculture",
        content: "Le conducteur de camion benne (en version porteur 6x4, 8x4 ou semi-remorque 2 essieux / 3 essieux) évolue dans l'univers des travaux publics, de la voirie (VRD), de l'environnement ou du vrac agricole. Ce métier exige un excellent coup de volant pour naviguer sur des terrains accidentés, dans les centrales d'enrobé chaud, les carrières d'extraction ou les exploitations agricoles.",
        subsections: [
          {
            h3: "Les Différents Types de Bennes & Matériaux Transportés",
            content: "Benne TP Acier (transport de blocs d'enrochement, gravats, terre), Benne Aluminium (gravillons, sable, céréales, engrais vrac), Benne Calorifugée (enrobé à chaud pour bitume routier), Benne Ferraille (recyclage, métaux, déchetterie)."
          },
          {
            h3: "Conduite Hors-Route & Adaptation au Terrain",
            content: "Le chauffeur benne doit savoir engager le blocage de différentiel, gérer la motricité sur sol boueux ou instable et adapter sa conduite aux fortes pentes des carrières."
          }
        ]
      },
      {
        h2: "Consignes de Sécurité lors du Bennage & Bâchage",
        content: "Le bennage d'une semi-remorque élevée à plusieurs mètres de hauteur représente une manœuvre délicate nécessitant une vigilance absolue pour prévenir le renversement du camion.",
        subsections: [
          {
            h3: "Règles d'Or avant de Benner (Planéité & Lignes Électriques)",
            content: "Le chauffeur doit impérativement s'assurer que le camion est parfaitement à plat, vérifier l'absence d'obstacles au-dessus du camion (câbles électriques HTA/HTB, structures métalliques), déverrouiller les crochets de porte arrière et ne jamais déplacer le véhicule pendant que la benne est levée."
          },
          {
            h3: "Systèmes de Bâchage Automatique (Cramaro / Marcolin)",
            content: "Pour éviter l'envol de gravillons ou de poussières sur voie publique, les bennes sont équipées de bâches électriques télécommandées. Le chauffeur contrôle l'étanchéité de la bâche avant de prendre la route."
          }
        ]
      },
      {
        h2: "Gestion des Charges, Pesée aux Essieux & Rémunération en 2026",
        content: "Le transport de vrac impose une gestion rigoureuse de la masse totale en charge pour éviter les amendes de surcharge au niveau du pesage des essieux.",
        subsections: [
          {
            h3: "Pesée en Carrière & Tolérances de Surcharge",
            content: "Au chargement sous la trémie ou par pelle mécanique, le chauffeur effectue un passage sur le pont-bascule. Il s'assure que le poids total ne dépasse pas 32 tonnes (porteur 8x4) ou 44 tonnes (ensemble articulé)."
          },
          {
            h3: "Salaire Moyen & Cadre de Travail (Retour Domicile)",
            content: "Un chauffeur benne TP perçoit en moyenne entre 2 100 € et 2 700 € net/mois. Ce secteur offre l'avantage majeur d'assurer un retour quotidien au domicile la plupart du temps, avec des horaires de journée réguliers."
          }
        ]
      }
    ],
    comparisonTable: {
      title: "Tableau Comparatif des Différents Modèles de Camions Bennes",
      headers: ["Modèle", "Benne TP Acier (8x4 / Semi)", "Benne Céréalière Aluminium", "Benne Enrobé Calorifugée"],
      rows: [
        ["Matériaux Transportés", "Terre, pierre, enrochement, gravats", "Blé, maïs, engrais, pulpes, granulés", "Enrobé bitumineux à chaud (160°C)"],
        ["Matériau Caisse", "Acier Hardox ultra-résistant aux chocs", "Aluminium léger pour max charge utile", "Acier/Alu avec isolation thermique"],
        ["Capacité Utile", "20 à 28 tonnes utiles", "26 à 30 tonnes utiles", "24 à 28 tonnes utiles"],
        ["Secteurs d'Activité", "BTP, Terrassement, Carrières", "Coopératives agricoles, Négoce vrac", "Chantiers routiers, Autoroutes"],
        ["Manutention Spécifique", "Vérification blocage de crochets", "Nettoyage balai & trappe à grain", "Vidage au finisseur routier à vitesse lente"]
      ]
    },
    faqs: [
      {
        q: "Le CACES engins est-il obligatoire pour conduire un camion benne TP ?",
        a: "Non, la possession du permis C ou CE avec FIMO/FCO est suffisante pour conduire le camion benne sur route et sur chantier. Cependant, posséder le CACES R482 catégorie F (engins de chantier) est apprécié si vous devez occasionnellement charger vous-même votre camion."
      },
      {
        q: "Quels sont les principaux risques d'accident lors du bennage ?",
        a: "Le risque principal est le renversement latéral du camion en cas de sol instable ou non plat, le choc avec une ligne électrique aérienne haute tension, ou la non-ouverture de la porte arrière sous la pression des matériaux."
      },
      {
        q: "Quelle est la différence entre une benne en acier et une benne en aluminium ?",
        a: "La benne acier (type Hardox) est très solide et conçue pour résister au choc des gros blocs de roche ou démolition. La benne aluminium est plus légère, ce qui permet d'augmenter la charge utile nette de marchandise (idéal pour le sable, le gravier fin ou les céréales)."
      },
      {
        q: "Est-ce qu'un chauffeur benne rentre tous les soirs chez lui ?",
        a: "Oui, dans plus de 90% des cas, le chauffeur benne TP ou carrière travaille en régional sur des chantiers locaux et rentre chaque soir à son domicile."
      },
      {
        q: "Comment trouver des offres de chauffeur benne directes sur FretTalent ?",
        a: "Inscrivez-vous gratuitement sur FretTalent, indiquez vos permis et vos CACES éventuels. Les entreprises de TP, carrières et transporteurs vrac vous contacteront en direct pour des postes en CDI ou CDD."
      }
    ]
  },

  'emploi-chauffeur': {
    slug: 'emploi-chauffeur',
    metaTitle: 'Offres d’Emploi Chauffeur Routier & Poids Lourd | Recrutement FretTalent',
    metaDescription: 'Trouvez votre emploi de chauffeur routier SPL, PL, messagerie ou régional. Candidature directe sans agence d’intérim, rémunérations, conseils et offres actualisées en CDI/CDD.',
    h1: 'Offres d’Emploi Chauffeur Routier & Poids Lourd en France',
    subtitle: 'Postulez directement auprès des entreprises de transport qui recrutent des conducteurs qualifiés près de chez vous.',
    badgeText: 'Emploi • Candidature Directe 0% Intérim',
    keyTakeaways: [
      "Accès 100% gratuit pour tous les chauffeurs candidats",
      "Mise en relation directe avec les responsables d'exploitation transport",
      "Contrats CDI, CDD et missions de saisonniers sur tout le territoire",
      "Couverture nationale et transfrontalière (Belgique, Suisse, Luxembourg)"
    ],
    sections: [
      {
        h2: "Le Marché de l'Emploi de Conducteur Routier en France en 2026",
        content: "Le secteur du transport routier de marchandises (TRM) fait face à une pénurie structurelle de conducteurs qualifiés en France et en Europe. Avec plus de 50 000 postes à pourvoir chaque année, la profession de chauffeur routier offre des perspectives d'embauche rapides et durables. Que vous recherchiez un poste en régional avec retour quotidien à votre domicile ou des missions en grand ruban national/international, les opportunités n'ont jamais été aussi nombreuses.",
        subsections: [
          {
            h3: "La Diversité des Typologies de Postes Proposés",
            content: "Du conducteur SPL tautliner grand ruban au chauffeur PL livreur en messagerie urbaine, en passant par les conducteurs spécialisés en citerne ADR, frigo agroalimentaire ou benne travaux publics, chaque chauffeur trouve la spécialité adaptée à son rythme de vie."
          },
          {
            h3: "Du CDI Immédiat au Contrat de Saison",
            content: "Les transporteurs favorisent désormais l'embauche directe en CDI afin de fidéliser leurs équipes routières. Des opportunités en CDD et contrats saisonniers (campagnes betteravières, céréalières, pics e-commerce) sont également disponibles."
          }
        ]
      },
      {
        h2: "Comment Réussir sa Candidature & Valoriser son Profil Chauffeur",
        content: "Sur un marché du recrutement en forte tension, la réactivité et la clarté de votre dossier font la différence auprès des exploitants transport.",
        subsections: [
          {
            h3: "La Constitution d'un Dossier Candidat Conforme",
            content: "Téléchargez des visuels lisibles de votre permis de conduire (C ou CE), de votre carte de qualification FIMO/FCO Marchandises valide et de votre carte de conducteur chronotachygraphe numérique à jour."
          },
          {
            h3: "Mettre en Avant vos Spécialisations & Habilitations",
            content: "Indiquez clairement vos diplômes complémentaires : attestation ADR de base ou citerne, CACES grue auxiliaire, CACES engins de chantier, expérience sur groupe frigo Carrier/Thermo King ou conduite de hayon."
          }
        ]
      },
      {
        h2: "Grilles Salariales, Primes & Avantages par Spécialité",
        content: "La rémunération brute du chauffeur routier est encadrée par la Convention Collective Nationale des Transports Routiers (IDCC 1600), complétée par de multiples indemnités conventionnelles non imposables.",
        subsections: [
          {
            h3: "Composantes du Salaire Net",
            content: "Le salaire net mensuel comprend le taux horaire conventionnel (selon coefficient 138M, 150M), les heures supplémentaires (majorées à 25% et 50%), les indemnités de frais de route (repas du midi à ~15€, repas du soir, découché à ~48€) et les primes de travail de nuit ou de week-end."
          },
          {
            h3: "Niveaux de Salaire Moyens Observés",
            content: "Livreur PL Messagerie : 1 900 € à 2 400 € net/mois. Chauffeur SPL Régional : 2 200 € à 2 700 € net/mois. Chauffeur SPL Grand Ruban : 2 600 € à 3 400 € net/mois. Chauffeur ADR Citerne : 2 800 € à 3 800 € net/mois."
          }
        ]
      }
    ],
    comparisonTable: {
      title: "Tableau d'Orientation des Métiers du Transport Routier",
      headers: ["Métier", "Permis Requis", "Rythme de Conduite", "Manutention", "Salaire Net Moyen"],
      rows: [
        ["Livreur Messagerie VL/PL", "Permis B ou C", "Urbain / Régional (Retour soir)", "Chargement/déchargement colis au hayon", "1 900 € - 2 400 €"],
        ["Conducteur SPL Régional", "Permis CE + FIMO", "Régional (Retour domicile quotidien)", "Mise à quai, sanglage palettes", "2 200 € - 2 700 €"],
        ["Conducteur SPL Grand Ruban", "Permis CE + FIMO", "National / Europe (Nuits en cabine)", "Principalement conduite longue distance", "2 600 € - 3 400 €"],
        ["Conducteur ADR Citerne", "Permis CE + ADR Citerne", "Régional ou National", "Dépotage de liquides / gaz en sécurité", "2 800 € - 3 800 €"]
      ]
    },
    faqs: [
      {
        q: "Comment postuler gratuitement aux offres d'emploi sur FretTalent ?",
        a: "Inscrivez-vous gratuitement sur FretTalent, créez votre profil chauffeur en 2 minutes et entrez en contact direct par téléphone ou message avec les recruteurs transport."
      },
      {
        q: "Quels sont les documents obligatoires pour postuler auprès d'un transporteur ?",
        a: "Vous devez fournir un permis de conduire valide (C ou CE), votre carte de qualification FIMO/FCO Marchandises à jour et votre carte de conducteur pour le chronotachygraphe numérique."
      },
      {
        q: "Un jeune conducteur débutant peut-il trouver un contrat en CDI rapidement ?",
        a: "Oui, la pénurie de conducteurs incitent les transporteurs à embaucher des débutants sortant de FIMO ou Titre Professionnel et à assurer un accompagnement en doublon lors de la prise de poste."
      },
      {
        q: "Quelle est la différence entre un poste en régional et un poste grand ruban ?",
        a: "Le poste régional garantit un retour du conducteur à son domicile chaque soir. Le poste grand ruban implique des découchés (nuits passées dans la couchette de la cabine) indemnisés par des primes d'éloignement."
      },
      {
        q: "Les chauffeurs résidant en Belgique ou Suisse peuvent-ils s'inscrire ?",
        a: "Absolument, FretTalent couvre la France, la Belgique, la Suisse et le Luxembourg pour faciliter les recrutements transfrontaliers."
      }
    ]
  },

  'recrutement-transport': {
    slug: 'recrutement-transport',
    metaTitle: 'Plateforme de Recrutement Transport Routier | FretTalent Recruteurs',
    metaDescription: 'La 1ère plateforme de recrutement direct de chauffeurs poids lourds et SPL. CVthèque vérifiée, carte interactive des profils et 0% commission d’intérim.',
    h1: 'Plateforme de Recrutement Direct Transport Routier de Marchandises',
    subtitle: 'Recrutez vos conducteurs routiers qualifiés rapidement et supprimez vos frais d’intérim traditionnels.',
    badgeText: 'Recruteurs • Solution Directe 0% Commission',
    keyTakeaways: [
      "Suppression des commissions d'intérim (économies financières immédiates)",
      "Vérification préalable des permis C/CE, FIMO/FCO et cartes chronotachygraphes",
      "Accès à la CVthèque interactive des chauffeurs disponibles par région",
      "Publication et gestion illimitée des offres d'emploi transport"
    ],
    sections: [
      {
        h2: "Digitalisez & Simplifiez vos Recrutements de Conducteurs Routiers",
        content: "Face à la pénurie de main-d'œuvre dans le secteur des transports et à l'explosion des coûts de facturation des agences d'intérim (coefficients à 2.0+), FretTalent propose une alternative moderne et rentable. Notre plateforme met en relation directe les entreprises de transport routier avec une communauté de chauffeurs professionnels titulaires des permis Poids Lourd et Super Poids Lourd.",
        subsections: [
          {
            h3: "Accès Instantané à la CVthèque Géolocalisée",
            content: "Consultez en temps réel les profils de chauffeurs en recherche active près de vos dépôts logistiques et filiales régionales."
          },
          {
            h3: "Réduction du Temps de Vacance des Camions",
            content: "Contactez directement les conducteurs par téléphone ou e-mail pour pourvoir rapidement un volant vacant et éviter l'immobilisation de vos ensembles routiers."
          }
        ]
      },
      {
        h2: "Vérification des Documents Officiels & Sécurisation des Embauches",
        content: "Pour garantir un recrutement 100% conforme au code des transports et aux exigences des assureurs flottes, FretTalent intègre des outils de contrôle documentaire.",
        subsections: [
          {
            h3: "Contrôle des Permis & Cartes de Qualification",
            content: "Accédez aux visuels scannés des permis de conduire (C, CE), attestations FIMO/FCO Marchandises, cartes chronotachygraphes numériques et diplômes ADR pour valider l'habilitation du candidat avant l'embauche."
          },
          {
            h3: "Transparence & Direct Recruteur - Chauffeur",
            content: "Pas de contrat de mise à disposition complexe. Vous signez directement vos contrats de travail en CDI, CDD ou contrat de saison avec vos nouveaux salariés."
          }
        ]
      },
      {
        h2: "Analyse des Économies Financières pour les Transporteurs",
        content: "Le recours systématique à l'intérim pèse lourdement sur les marges opérationnelles des transporteurs routiers.",
        subsections: [
          {
            h3: "Comparatif Budgétaire Embauche Directe vs Intérim",
            content: "Pour un chauffeur SPL rémunéré 2 500 € brut/mois, une agence d'intérim facturera environ 5 000 € à 5 500 €/mois au transporteur. Sur FretTalent, votre abonnement fixe vous permet de recruter autant de chauffeurs en CDI/CDD que nécessaire sans aucun surcoût."
          }
        ]
      }
    ],
    comparisonTable: {
      title: "Comparatif des Solutions de Recrutement Transport",
      headers: ["Critère", "Plateforme Directe FretTalent", "Agence d'Intérim Traditionnelle", "Cabinets de Recrutement Généralistes"],
      rows: [
        ["Modèle Économique", "Abonnement fixe (0% commission)", "Facturation horaire coef 1.9 à 2.2", "Honoraires au % du salaire annuel (15-20%)"],
        ["Vérification des Documents", "Visuels Permis/FIMO/Chrono vérifiés", "Vérification basique agence", "Contrôle des références"],
        ["Type de Contrats", "Embauche directe en CDI / CDD", "Contrats de mission temporaires", "Principalement CDI cadre/maîtrise"],
        ["Délai de Mise en Relation", "Instantané (Contact direct 1-click)", "24h à 72h selon vivier", "Plusieurs semaines"],
        ["Spécialisation Métier", "100% Transport Routier de Marchandises", "Généraliste (Industrie, BTP, etc.)", "Tertiaire et cadres"]
      ]
    },
    faqs: [
      {
        q: "Comment s'inscrire en tant qu'entreprise de transport sur FretTalent ?",
        a: "Renseignez votre numéro SIRET/SIREN sur l'espace recruteur FretTalent pour valider votre compte entreprise et accéder immédiatement aux profils de conducteurs."
      },
      {
        q: "Comment sont vérifiés les permis et qualifications des chauffeurs ?",
        a: "Les candidats mettent en ligne les scans de leurs permis C/CE, FIMO/FCO et carte chronotachygraphe. Les recruteurs peuvent consulter ces justificatifs certifiés."
      },
      {
        q: "Y a-t-il des frais cachés lors de l'embauche d'un candidat ?",
        a: "Non, FretTalent ne prélève aucune commission sur vos embauches. Vous recrutez en direct autant de conducteurs que souhaité."
      },
      {
        q: "Puis-je diffuser des offres d'emploi pour plusieurs filiales ?",
        a: "Oui, la plateforme vous permet de publier des annonces ciblées par agence, dépôt logistique ou secteur géographique."
      },
      {
        q: "Comment contacter directement un chauffeur disponible ?",
        a: "Une fois connecté à votre espace recruteur, cliquez sur la fiche du conducteur disponible pour afficher son numéro de téléphone et lui envoyer un message direct."
      }
    ]
  },

  'transporteurs-france': {
    slug: 'transporteurs-france',
    metaTitle: 'Annuaire & Réseau des Transporteurs Routiers de France | FretTalent',
    metaDescription: 'Annuaire et guide complet du réseau des entreprises de transport routier en France (PME, grands groupes, spécialistes). Opportunités d’emploi et recrutement direct.',
    h1: 'Réseau National des Transporteurs Routiers de France',
    subtitle: 'Mise en relation directe entre transporteurs routiers français et conducteurs professionnels qualifiés.',
    badgeText: 'Réseau • Transport Routier France',
    keyTakeaways: [
      "Plus de 40 000 entreprises de transport routier en activité en France",
      "Diversité des flottes : du camion porteur 19t aux ensembles 44t et convois spéciaux",
      "Maillage géographique complet couvrant toutes les régions métropolitaines",
      "Synergie entre PME familiales de proximité et grands groupes nationaux"
    ],
    sections: [
      {
        h2: "Le Panorama du Tissu des Transporteurs Routiers Français",
        content: "Le réseau des transporteurs routiers français constitue le poumon économique de la chaîne d'approvisionnement nationale. Avec près de 88% des marchandises acheminées par la route en France, les entreprises de transport routier de marchandises (TRM) emploient plus de 400 000 salariés et génèrent un chiffre d'affaires annuel de plusieurs dizaines de milliards d'euros.",
        subsections: [
          {
            h3: "Des PME Familiales aux Acteurs Majeurs du Transport",
            content: "Le paysage français est composé à 80% de PME et TPE régionales ancrées dans leurs territoires, côtoyant les leaders du transport et de la logistique contractuelle."
          },
          {
            h3: "Spécialisation des Flottes & Métiers",
            content: "Les transporteurs se structurent par spécialité : transporteurs en bâché tautliner, spécialistes du froid agroalimentaire, transporteurs de produits liquides pétroliers et chimiques, entreprises de bennes TP et négoce vrac."
          }
        ]
      },
      {
        h2: "La Transition Écologique & l'Évolution des Flottes des Transporteurs",
        content: "Les transporteurs routiers français investissent massivement dans la décarbonation de leurs flottes de poids lourds pour répondre aux objectifs climatiques et aux exigences des Zones à Faibles Émissions (ZFE-m).",
        subsections: [
          {
            h3: "Énergies Alternatives : GNV, BioGNV, B100 & Électrique",
            content: "L'acquisition de camions fonctionnant au Gaz Naturel Véhicule (GNV), au carburant végétal B100 ou à l'hydrogène modifie la conduite et exige des conducteurs formés à l'éco-conduite."
          },
          {
            h3: "Labels Objectif CO2 & Chartes d'Engagement",
            content: "De nombreuses entreprises du réseau FretTalent sont engagées dans le programme EVE (Objectif CO2) visant à réduire l'empreinte carbone au kilomètre parcouru."
          }
        ]
      },
      {
        h2: "Relation Directe & Recrutement au Cœur du Réseau FretTalent",
        content: "FretTalent valorise les transporteurs français en leur offrant une vitrine dédiée pour promouvoir leur marque employeur et attirer les meilleurs conducteurs.",
        subsections: [
          {
            h3: "Valorisation de la Marque Employeur",
            content: "Chaque entreprise de transport dispose d'un profil présentant sa flotte (âge des camions, équipements de cabine), ses valeurs et ses offres d'emploi disponibles."
          }
        ]
      }
    ],
    comparisonTable: {
      title: "Analyse des Typologies d'Entreprises de Transport en France",
      headers: ["Structure", "PME Transporteur Familial", "Groupe National / Européen", "Transporteur Niche Spécialisé"],
      rows: [
        ["Taille de Flotte", "5 à 50 camions", "200 à +3 000 camions", "10 à 100 camions spécialisés"],
        ["Ambiance de Travail", "Proximité, management familial", "Procédures structurées, outils digitaux", "Haite technicité, rigueur sécurité"],
        ["Matériel & Flotte", "Camions attribués souvent récents", "Renouvellement automatique 3-4 ans", "Véhicules sur-mesure (citernes, bennes)"],
        ["Rayon d'Action", "Majoritairement Régional & National", "National & Transfrontalier Europe", "Ciblé selon les dépôts industriels"],
        ["Avantages Chauffeurs", "Retour domicile fréquent, écoute", "Comité d'entreprise, formations régulières", "Primes de risque et rémunération élevée"]
      ]
    },
    faqs: [
      {
        q: "Comment trouver une entreprise de transport qui recrute dans ma région ?",
        a: "Consultez l'annuaire des transporteurs et les offres d'emploi sur FretTalent en filtrant par département ou région (ex: Hauts-de-France, Île-de-France)."
      },
      {
        q: "Comment faire référencer sa société de transport sur FretTalent ?",
        a: "Inscrivez-vous sur l'espace recruteur en saisissant votre SIRET pour créer gratuitement la fiche de votre entreprise de transport."
      },
      {
        q: "Les transporteurs français financent-ils le renouvellement de la FCO ?",
        a: "Oui, dans le cadre de la formation professionnelle continue, l'entreprise de transport prend en charge le coût de la FCO (Formation Continue Obligatoire) de ses conducteurs salariés."
      },
      {
        q: "Quels sont les équipements cabine privilégiés par les transporteurs ?",
        a: "Les camions récents sont équipés de cabines grand confort avec climatisation autonome de nuit, réfrigérateur de cabine, sièges pneumatiques chauffants et régulateur de vitesse adaptatif."
      },
      {
        q: "Comment entrer en contact avec le responsable d'exploitation d'un transporteur ?",
        a: "Via FretTalent, vous pouvez envoyer directement votre profil ou contacter le responsable par téléphone sans passer par des intermédiaires."
      }
    ]
  },

  'transport-routier': {
    slug: 'transport-routier',
    metaTitle: 'Transport Routier de Marchandises (TRM) | Actualités & Emplois FretTalent',
    metaDescription: 'Tout savoir sur le transport routier de marchandises en France : réglementations RSE, permis, recrutement et tendances.',
    h1: 'Transport Routier de Marchandises (TRM) en France',
    subtitle: 'Le portail de référence pour la gestion, l’emploi et la réglementation du secteur transport routier.',
    badgeText: 'Secteur • Transport Routier',
    keyTakeaways: [
      "88% du transport de fret en France assuré par la route",
      "Réglementation RSE stricte et chronotachygraphe numérique",
      "Transition écologique : renouvellement des flottes GNV/Électrique",
      "Métier d'avenir avec de réelles perspectives d'évolution"
    ],
    sections: [
      {
        h2: "Les Enjeux & Tendances du Transport Routier Moderne",
        content: "Le secteur du transport routier de marchandises (TRM) innove continuellement pour répondre aux objectifs de décarbonation et d'efficacité logistique. La demande en conducteurs qualifiés n'a jamais été aussi forte.",
        subsections: [
          {
            h3: "Réglementation RSE & Temps de Conduite",
            content: "Respect de la coupure de 45 minutes après 4h30 de conduite, repos quotidien de 11 heures et repos hebdomadaire de 45 heures."
          }
        ]
      }
    ],
    faqs: [
      {
        q: "Quelles sont les sanctions en cas de dépassement des heures RSE ?",
        a: "Les infractions aux temps de conduite et de repos sont passibles d'amendes forfaitaires pouvant atteindre 1 500 € par infraction constatée lors des contrôles DREAL ou gendarmerie."
      }
    ]
  },

  'messagerie': {
    slug: 'messagerie',
    metaTitle: 'Recrutement Chauffeur Messagerie & Distribution Express | FretTalent',
    metaDescription: 'Offres d’emploi pour livreur chauffeur en messagerie nationale et régionale. Emplois permis B, C, CE en distribution.',
    h1: 'Emploi & Recrutement en Messagerie & Distribution Express',
    subtitle: 'Trouvez vos tournées de livraison et postes en messagerie palettisée ou colis express.',
    badgeText: 'Métier • Messagerie & Colis',
    keyTakeaways: [
      "Tournées denses multi-clients en zone urbaine ou périurbaine",
      "Utilisation des outils digitaux de scannage (PDA) et signature électronique",
      "Véhicules utilitaires (VL) ou porteurs poids lourds (PL)",
      "Recrutement rapide et dynamique"
    ],
    sections: [
      {
        h2: "Le Secteur de la Messagerie & Livraison du Dernier Kilomètre",
        content: "La messagerie palettisée et l'express connaissent une croissance soutenue sous l'impulsion du e-commerce et de la distribution industrielle. Le chauffeur livreur en messagerie assure le ramassage et la distribution quotidienne des colis.",
        subsections: [
          {
            h3: "Organisation d'une Tournée de Messagerie",
            content: "Tri du chargement par secteur géographique, optimisation de l'itinéraire et gestion des créneaux horaires imposés par les destinataires."
          }
        ]
      }
    ],
    faqs: [
      {
        q: "Faut-il le permis poids lourd pour travailler en messagerie ?",
        a: "Non, de nombreux postes en messagerie légère s'effectuent avec le permis B sur des véhicules utilitaires légers (VUL < 3,5t)."
      }
    ]
  },

  'fret-express': {
    slug: 'fret-express',
    metaTitle: 'Fret Express & Transport Urgent | Offres d’Emploi FretTalent',
    metaDescription: 'Opportunités et recrutements pour conducteurs dédiés au fret express, navettes urgentes et liaisons dédiées.',
    h1: 'Transport de Fret Express & Navettes Dédiées',
    subtitle: 'Postes pour chauffeurs spécialisés dans l’urgence, la course express et les liaisons dédiées H24.',
    badgeText: 'Spécialisation • Fret Express',
    keyTakeaways: [
      "Transport dédié sur-mesure sans rupture de charge",
      "Réactivité H24 et départ immédiat",
      "Véhicules légers ou poids lourds équipés",
      "Postes motivants à haute valeur ajoutée"
    ],
    sections: [
      {
        h2: "L'Urgence au Cœur du Fret Express",
        content: "Le fret express prend en charge les livraisons critiques pour l'industrie, le secteur médical ou l'événementiel. Le chauffeur livreur en fret express garantit le délai de livraison au minute près.",
        subsections: [
          {
            h3: "Suivi Géolocalisé en Temps Réel",
            content: "Le véhicule est géolocalisé en permanence pour informer l'expéditeur de la progression du trajet."
          }
        ]
      }
    ],
    faqs: [
      {
        q: "Quelle est la différence entre messagerie et fret express ?",
        a: "La messagerie regroupe des colis dans des quais de tri avec délais standard. Le fret express est un transport dédié direct du point d'enlèvement au destinataire final sans escale."
      }
    ]
  },

  'chauffeur-spl-hauts-de-france': {
    slug: 'chauffeur-spl-hauts-de-france',
    metaTitle: 'Chauffeur SPL Hauts-de-France | Offres & Recrutement FretTalent',
    metaDescription: 'Offres d’emploi et candidats conducteurs routiers SPL (Permis CE) en Hauts-de-France (Lille, Dunkerque, Amiens, Saint-Quentin, Arras). Guide régional et recrutements directs.',
    h1: 'Recrutement & Emploi Chauffeur SPL en Hauts-de-France',
    subtitle: 'Consultez les offres d’emploi et candidatures de chauffeurs routiers Super Poids Lourd dans le Nord (59), le Pas-de-Calais (62), l’Aisne (02), la Somme (80) et l’Oise (60).',
    badgeText: 'Région • Hauts-de-France (59, 62, 02, 60, 80)',
    keyTakeaways: [
      "1er hub logistique et routier de France (Autoroutes A1, A26, A16, A2)",
      "Plateforme bimodal majeur Delta 3 Dourges et zones logistiques e-commerce",
      "Flux routiers intenses vers les ports de Dunkerque/Calais, la Belgique et le Royaume-Uni",
      "Opportunités massives en régional (retour quotidien) et grand ruban"
    ],
    sections: [
      {
        h2: "Les Hauts-de-France : 1er Carrefour Logistique & Routier de France",
        content: "Idéalement positionnée au cœur du triangle économique Paris-Londres-Bruxelles, la région Hauts-de-France héberge une densité exceptionnelle de plateformes logistiques, de centrales d'achat de la grande distribution et d'entreprises de transport routier de marchandises. La demande en chauffeurs routiers Super Poids Lourd (SPL - Permis CE) y est l'une des plus élevées d'Europe.",
        subsections: [
          {
            h3: "Les Grands Axes Autoroutiers de la Région",
            content: "L'autoroute A1 (axe Paris-Lille), l'A26 (Autoroute des Anglais Calais-Reims), l'A16 (Littoral) et l'A2 (vers la Belgique) constituent des artères vitales où transitent quotidiennement des dizaines de milliers d'ensembles routiers."
          },
          {
            h3: "Plateformes Logistiques & Ports Maritimes",
            content: "Le terminal multimodal Delta 3 à Dourges, les zones logistiques de Douai-Sin-le-Noble, Saint-Quentin, Creil-Oise et les complexes portuaires de Dunkerque et Calais créent un besoin permanent de conducteurs SPL qualifiés."
          }
        ]
      },
      {
        h2: "Les Bassins d'Emploi Majeurs pour Chauffeurs SPL dans les 5 Départements",
        content: "La région offre une grande diversité d'opportunités réparties sur ses cinq départements.",
        subsections: [
          {
            h3: "Nord (59) & Pas-de-Calais (62)",
            content: "La Métropole Européenne de Lille (MEL), Seclin, Lesquin, Arras, Lens, Valenciennes et Dunkerque concentrent les transports en messagerie palettisée, port-conteneurs et frigorifique."
          },
          {
            h3: "Aisne (02), Somme (80) & Oise (60)",
            content: "Saint-Quentin, Laon et Soissons (02), Amiens (80), Compiègne et Senlis (60) offrent de nombreux postes en benne agricole/TP, transport agroalimentaire et liaisons quotidiennes vers l'Île-de-France."
          }
        ]
      },
      {
        h2: "Typologies de Transports & Rémunérations en Hauts-de-France",
        content: "Les conditions de rémunération des conducteurs SPL en Hauts-de-France bénéficient du volume d'activité et des primes de nuit et d'éloignement.",
        subsections: [
          {
            h3: "Régional vs Transfrontalier Belgique / Angleterre",
            content: "De nombreux postes régionaux permettent un retour chaque soir au domicile. Les lignes transfrontalières vers la Belgique (Courtrai, Gand, Bruxelles) ou l'Angleterre (via ferry/Eurotunnel) offrent des indemnités de frais de route revalorisées."
          },
          {
            h3: "Salaire Moyen Chauffeur SPL Régional & National",
            content: "Un chauffeur SPL perçoit entre 2 300 € et 2 800 € net/mois en régional et jusqu'à 3 200 € à 3 600 € net/mois en grand ruban transfrontalier."
          }
        ]
      }
    ],
    comparisonTable: {
      title: "Comparatif des Bassins d'Emploi SPL en Hauts-de-France",
      headers: ["Bassin d'Emploi", "Spécialités Dominantes", "Axes Routiers Majeurs", "Type de Lignes", "Salaire Net Moyen"],
      rows: [
        ["Lille / Lesquin / Seclin (59)", "Messagerie, E-commerce, Frigo", "A1, A25, A23", "Régional & Navettes nuit", "2 300 € - 2 800 €"],
        ["Dunkerque / Calais (59/62)", "Porte-conteneur, Ferry UK, ADR", "A16, A26", "Transfrontalier & Portuaire", "2 600 € - 3 500 €"],
        ["Saint-Quentin / Laon (02)", "Benne agricole, Citerne, Tautliner", "A26, RN2", "Régional & Liaison Paris", "2 200 € - 2 700 €"],
        ["Amiens / Roye (80)", "Logistique grande distribution, Frigo", "A1, A16, A29", "Régional & National", "2 300 € - 2 900 €"]
      ]
    },
    faqs: [
      {
        q: "Pourquoi la région Hauts-de-France recrute-t-elle autant de chauffeurs SPL ?",
        a: "En raison de sa position géographique stratégique au nord de Paris, proche du Royaume-Uni et du Benelux, et de la concentration exceptionnelle de hubs logistiques e-commerce et agroalimentaires."
      },
      {
        q: "Y a-t-il des postes de chauffeur SPL avec retour tous les soirs chez soi ?",
        a: "Oui, plus de 60% des offres publiées en Hauts-de-France concernent des tournées régionales ou des navettes de nuit régulières garantissant le retour quotidien au domicile."
      },
      {
        q: "Faut-il parler anglais pour faire du transport vers l'Angleterre depuis Calais/Dunkerque ?",
        a: "Des notions de base sont appréciées pour les formalités douanières au port, mais la maîtrise du français et des consignes de sécurité transport suffit pour la plupart des lignes."
      },
      {
        q: "Quel est le salaire d'un conducteur SPL grand ruban en Hauts-de-France ?",
        a: "En incluant les primes de découché, de repas et de nuit, un chauffeur SPL grand ruban gagne en moyenne entre 2 800 € et 3 500 € net par mois."
      },
      {
        q: "Comment postuler directement auprès des transporteurs des Hauts-de-France ?",
        a: "Créez votre profil chauffeur sur FretTalent, indiquez votre département (59, 62, 02, 60, 80) et contactez directement les responsables de recrutement."
      }
    ]
  },

  'chauffeur-spl-aisne': {
    slug: 'chauffeur-spl-aisne',
    metaTitle: 'Chauffeur SPL Aisne (02) | Offres d’Emploi & Recrutement FretTalent',
    metaDescription: 'Emploi de conducteur routier SPL permis CE dans le département de l’Aisne (Saint-Quentin, Soissons, Laon, Chauny).',
    h1: 'Recrutement Chauffeur SPL dans l’Aisne (02)',
    subtitle: 'Opportunités emploi et candidatures de chauffeurs poids lourds à Saint-Quentin, Laon, Soissons et Tergnier.',
    badgeText: 'Département • Aisne (02)',
    keyTakeaways: [
      "Proximité des axes stratégiques A26, A2 et RN2",
      "Transport agroalimentaire, vrac agricole et benne TP",
      "Postes régionaux avec retour quotidien au domicile",
      "Recrutement direct sans commission d'intérim"
    ],
    sections: [
      {
        h2: "Le Transport Routier dans le Département de l'Aisne (02)",
        content: "Le département de l'Aisne bénéficie d'une position privilégiée reliant l'Île-de-France aux Hauts-de-France et à la Belgique. Les entreprises de transport de Saint-Quentin, Laon, Soissons et Chauny recherchent en permanence des conducteurs SPL qualifiés.",
        subsections: [
          {
            h3: "Lignes Régionales & Nationales dans le 02",
            content: "Postes en benne agricole, transport frigorifique et navettes régulières vers les hubs logistiques de la région parisienne."
          }
        ]
      }
    ],
    faqs: [
      {
        q: "Quelles sont les villes qui recrutent le plus dans l'Aisne ?",
        a: "Saint-Quentin, Laon, Soissons, Chauny, Tergnier, Hirson et Château-Thierry concentrent la majorité des offres transporteurs."
      }
    ]
  },

  'transporteurs-hauts-de-france': {
    slug: 'transporteurs-hauts-de-france',
    metaTitle: 'Transporteurs Routiers Hauts-de-France | Annuaire & Recrutement FretTalent',
    metaDescription: 'Liste des entreprises de transport routier de marchandises en Hauts-de-France (59, 62, 02, 60, 80). Emploi direct.',
    h1: 'Entreprises & Transporteurs Routiers en Hauts-de-France',
    subtitle: 'Trouvez les sociétés de transport qui recrutent des conducteurs routiers dans le Nord-Pas-de-Calais, la Picardie et l’Aisne.',
    badgeText: 'Région • Entreprises Hauts-de-France',
    keyTakeaways: [
      "Réseau dense de transporteurs régionaux et internationaux",
      "Mise en relation directe avec les dirigeants et responsables d'exploitation",
      "Accès aux fiches d'entreprises et coordonnées certifiées",
      "Plateforme 100% dédiée au transport routier"
    ],
    sections: [
      {
        h2: "Le Réseau des Transporteurs Routiers en Hauts-de-France",
        content: "La région Hauts-de-France compte plusieurs milliers de transporteurs opérant dans tous les segments du transport routier de marchandises. FretTalent connecte directement ces employeurs avec les conducteurs disponibles.",
        subsections: [
          {
            h3: "Embauche Directe Sans Intermédiaire",
            content: "Publiez vos offres et consultez la CVthèque régionale pour recruter vos chauffeurs sans frais de commission."
          }
        ]
      }
    ],
    faqs: [
      {
        q: "Comment contacter un transporteur en Hauts-de-France ?",
        a: "Naviguez sur FretTalent, consultez les offres d'emploi ou les fiches transporteurs et envoyez votre candidature en direct."
      }
    ]
  },

  'transporteurs-aisne': {
    slug: 'transporteurs-aisne',
    metaTitle: 'Transporteurs Routiers de l’Aisne (02) | Emplois FretTalent',
    metaDescription: 'Découvrez les entreprises de transport implantées dans l’Aisne (02) : Saint-Quentin, Soissons, Laon, Hirson, Chauny.',
    h1: 'Entreprises de Transport Routier dans l’Aisne (02)',
    subtitle: 'Guide des transporteurs implantés à Saint-Quentin, Laon, Soissons, Château-Thierry et Villers-Cotterêts.',
    badgeText: 'Département • Transporteurs Aisne (02)',
    keyTakeaways: [
      "Ancrage local fort dans les villes de l'Aisne",
      "Flottes spécialisées en vrac, frigo, citerne et benne",
      "Offres d'emploi locales pour chauffeurs routiers",
      "Recrutement rapide et direct"
    ],
    sections: [
      {
        h2: "Les Transporteurs Routiers du Département de l'Aisne",
        content: "L'Aisne possède un tissu d'entreprises de transport familiales et de filiales nationales solides. FretTalent vous met en contact avec les responsables de recrutement du département.",
        subsections: [
          {
            h3: "Opportunités Locales",
            content: "Postes en CDI, CDD et remplacement saisonnier dans l'Aisne."
          }
        ]
      }
    ],
    faqs: [
      {
        q: "Comment faire figurer mon entreprise de transport de l'Aisne sur FretTalent ?",
        a: "Créez votre compte recruteur gratuit en indiquant votre SIRET pour être référencé et diffuser vos annonces d'emploi."
      }
    ]
  }
};
