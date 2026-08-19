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
    metaTitle: 'Chauffeur ADR / Transport Matières Dangereuses | Emplois FretTalent',
    metaDescription: 'Offres d’emploi et profil de chauffeurs routiers certifiés ADR (Matières Dangereuses de base, Citerne, Chimique, Gaz). Contact direct.',
    h1: 'Recrutement & Emploi Chauffeur ADR (Transport Matières Dangereuses)',
    subtitle: 'Postes et candidats qualifiés ADR de base, ADR citerne et produits chimiques dangereux sur toute la France.',
    badgeText: 'Spécialisation • Transport ADR',
    keyTakeaways: [
      "Attestation de formation ADR de Base ou Citerne valide",
      "Connaissances des classes de danger (1 à 9) et protocoles de sécurité",
      "Primes de risque et rémunérations supérieures à la moyenne",
      "Embauche directe par les spécialistes de la chimie et pétrole"
    ],
    sections: [
      {
        h2: "Le Transport Routier de Matières Dangereuses (ADR) en France",
        content: "Le transport par route de marchandises dangereuses est encadré par l'Accord européen relatif au transport international des marchandises dangereuses par route (ADR). Le chauffeur ADR est un spécialiste hautement qualifié formé pour transporter des produits inflammables, toxiques, corrosifs, gazeux ou chimiques en toute sécurité.",
        subsections: [
          {
            h3: "Les Différentes Certifications ADR",
            content: "L'attestation ADR de Base permet de transporter des marchandises dangereuses en colis ou vrac solide. L'extension ADR Citerne (spécialisation produits pétroliers ou chimiques) est indispensable pour la conduite de camions citernes."
          },
          {
            h3: "Consignes de Sécurité & Équipements Obligatoires",
            content: "Le chauffeur ADR contrôle le panneau orange numéroté, l'extincteur vérifié, la valise ADR (masque à gaz, combinaison, kit de neutralisation des fuites) et respecte scrupuleusement les consignes écrites de sécurité."
          }
        ]
      }
    ],
    faqs: [
      {
        q: "Quelle est la durée de validité du certificat ADR ?",
        a: "Le certificat ADR a une durée de validité de 5 ans. Il doit être renouvelé par un stage de recyclage et un examen réussi avant sa date d'échéance."
      }
    ]
  },

  'chauffeur-frigo': {
    slug: 'chauffeur-frigo',
    metaTitle: 'Chauffeur Frigo (Transport Frigorifique) | Emplois FretTalent',
    metaDescription: 'Recrutement chauffeur routier frigo (sous température dirigée). Transport agroalimentaire, viande, surgelés et produits frais.',
    h1: 'Emploi Chauffeur Frigo (Transport Sous Température Dirigée)',
    subtitle: 'Rejoignez les acteurs du transport frigorifique agroalimentaire et chaîne du froid partout en France.',
    badgeText: 'Spécialisation • Transport Frigorifique',
    keyTakeaways: [
      "Gestion rigoureuse du groupe frigorifique et enregistreurs de température",
      "Agrément sanitaire ATP et désinfection de la caisse frigo",
      "Liaisons Rungis, centrales d'achat et grande distribution",
      "Nombreuses primes de nuit et horaires décalés"
    ],
    sections: [
      {
        h2: "Les Spécificités du Transport Frigorifique Agroalimentaire",
        content: "Le conducteur frigorifique assure la livraison de marchandises sous température dirigée (produits frais, surgelés, viandes pendues, produits pharmaceutiques). Il est le garant du respect absolu de la chaîne du froid, d'une traçabilité irréprochable et des règles d'hygiène alimentaire (HACCP).",
        subsections: [
          {
            h3: "Supervision du Groupe Froid & Enregistreur",
            content: "Avant chaque départ, le chauffeur vérifie le niveau de carburant du groupe auxiliaire, sélectionne le point de consigne (-20°C pour le surgelé, +2°C à +4°C pour le frais) et s'assure du bon fonctionnement de l'enregistreur de température."
          }
        ]
      }
    ],
    faqs: [
      {
        q: "Les chauffeurs frigo travaillent-ils souvent la nuit ?",
        a: "Oui, la logistique de distribution agroalimentaire impose des livraisons très tôt le matin pour approvisionner les centrales et supermarchés dès l'ouverture."
      }
    ]
  },

  'chauffeur-benne': {
    slug: 'chauffeur-benne',
    metaTitle: 'Chauffeur Benne (Travaux Publics & Vrac) | Emploi FretTalent',
    metaDescription: 'Postes de conducteur poids lourd et SPL benne (TP, céréalière, ferraille, enrobé, enrochement). Recrutement direct.',
    h1: 'Recrutement & Emploi Chauffeur Benne (TP & Vrac)',
    subtitle: 'Offres d’emploi pour conducteurs de camion benne TP, benne céréalière et vrac industriel.',
    badgeText: 'Spécialisation • Transport Benne & TP',
    keyTakeaways: [
      "Permis C ou CE + FIMO/FCO",
      "Maîtrise des manœuvres de bennage en carrière et chantier TP",
      "Respect des limites de charge par essieu",
      "Retour quotidien au domicile la plupart du temps"
    ],
    sections: [
      {
        h2: "La Conduite de Camion Benne : Chantiers & Carrières",
        content: "Le conducteur de camion benne (benne TP, benne céréalière, benne ferraille ou enrobé) évolue sur les chantiers de terrassement, de voirie (VRD) ou dans le transport de produits agricoles vrac. Ce métier demande une excellente maîtrise des manœuvres hors-route et une vigilance accrue lors du bennage.",
        subsections: [
          {
            h3: "Bennage en Sécurité & Stabilisation",
            content: "Avant toute manœuvre de vidage, le chauffeur s'assure de la stabilité du sol, vérifie l'absence de câbles électriques aériens et contrôle le déverrouillage de la porte arrière de la benne."
          }
        ]
      }
    ],
    faqs: [
      {
        q: "Le CACES engins est-il obligatoire pour être chauffeur benne TP ?",
        a: "Le permis C/CE suffit pour la conduite. Le CACES R482 (engins de chantier) est néanmoins un avantage précieux pour utiliser des chargeuses sur chantier."
      }
    ]
  },

  'emploi-chauffeur': {
    slug: 'emploi-chauffeur',
    metaTitle: 'Offres d’Emploi Chauffeur Routier & Poids Lourd | FretTalent',
    metaDescription: 'Consultez des centaines d’offres d’emploi de chauffeur routier SPL, PL, messagerie et régional. Candidature directe sans agence.',
    h1: 'Offres d’Emploi Chauffeur Routier & Poids Lourd en France',
    subtitle: 'Postulez directement auprès des entreprises de transport qui recrutent près de chez vous.',
    badgeText: 'Emploi • Candidature Directe',
    keyTakeaways: [
      "Accès 100% gratuit pour tous les candidats conducteurs",
      "Mise en relation directe avec les responsables d'exploitation",
      "Contrats CDI, CDD et missions saisonnières",
      "Couverture nationale et transfrontalière (BE, CH, LU)"
    ],
    sections: [
      {
        h2: "Comment Trouver le Poste de Chauffeur Routier Idéal ?",
        content: "Le secteur du transport routier fait face à une forte demande de conducteurs qualifiés. Que vous préfériez les lignes régulières avec retour quotidien chez vous ou le grand ruban national, FretTalent simplifie vos démarches d'embauche.",
        subsections: [
          {
            h3: "Créez un Profil Attractif",
            content: "Renseignez vos permis, vos spécialisations (ADR, Frigo, Benne, Grue auxiliaire) et téléchargez vos justificatifs officiels pour rassurer les recruteurs."
          }
        ]
      }
    ],
    faqs: [
      {
        q: "Comment postuler aux offres sur FretTalent ?",
        a: "Inscrivez-vous gratuitement, complétez votre profil chauffeur et contactez directement les employeurs en 1 clic."
      }
    ]
  },

  'recrutement-transport': {
    slug: 'recrutement-transport',
    metaTitle: 'Recrutement Transport Routier | Plateforme Recruteurs FretTalent',
    metaDescription: 'La 1ère plateforme de recrutement direct de chauffeurs poids lourds et SPL sans frais d’intérim ni commissions.',
    h1: 'Plateforme de Recrutement Transport Routier de Marchandises',
    subtitle: 'Recrutez vos conducteurs routiers qualifiés rapidement et réduisez vos coûts d’embauche.',
    badgeText: 'Recruteurs • Solution 0% Commission',
    keyTakeaways: [
      "Suppression des commissions d'intérim (économies immédiates)",
      "Vérification préalable des permis C/CE et FIMO/FCO",
      "Accès illimité à la CVthèque chauffeurs qualifiés",
      "Gestion simplifiée des annonces d'emploi"
    ],
    sections: [
      {
        h2: "Optimisez vos Processus de Recrutement dans le Transport",
        content: "FretTalent met en relation directe les transporteurs routiers de marchandises avec des conducteurs professionnels vérifiés. Réduisez vos délais de vacance de poste et vos budgets de recrutement.",
        subsections: [
          {
            h3: "Carte Interactive des Compétences",
            content: "Visualisez en temps réel les chauffeurs disponibles dans votre zone géographique avec le détail de leurs permis et diplômes."
          }
        ]
      }
    ],
    faqs: [
      {
        q: "Comment s'inscrire en tant qu'entreprise de transport ?",
        a: "Renseignez votre SIRET ou SIREN sur l'espace recruteur FretTalent pour accéder immédiatement aux profils de conducteurs."
      }
    ]
  },

  'transporteurs-france': {
    slug: 'transporteurs-france',
    metaTitle: 'Annuaire & Réseau des Transporteurs Routiers de France | FretTalent',
    metaDescription: 'Découvrez les entreprises de transport routier de marchandises implantées en France et leurs besoins en recrutement.',
    h1: 'Réseau National des Transporteurs Routiers de France',
    subtitle: 'Mise en relation entre transporteurs routiers français et conducteurs professionnels qualifiés.',
    badgeText: 'Réseau • Transport Routier France',
    keyTakeaways: [
      "Plus de 40 000 entreprises de transport routier en France",
      "Diversité des flottes : du camion remorque au porteur léger",
      "Besoins continus en recrutement sur tout le territoire",
      "Synergie entre PME locales et grands groupes"
    ],
    sections: [
      {
        h2: "Le Panorama des Transporteurs Routiers en France",
        content: "Le transport de fret routier est la colonne vertébrale de l'économie française. FretTalent répertorie les entreprises de transport et facilite la connexion entre employeurs et candidats.",
        subsections: [
          {
            h3: "Maillage Territorial Dense",
            content: "De l'Île-de-France aux grandes régions logistiques, découvrez les sociétés de transport actives près de chez vous."
          }
        ]
      }
    ],
    faqs: [
      {
        q: "Comment faire référencer ma société de transport ?",
        a: "Créez votre compte entreprise sur FretTalent pour être référencé dans notre réseau et publier vos opportunités."
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
    metaTitle: 'Chauffeur SPL Hauts-de-France | Emploi & Recrutement FretTalent',
    metaDescription: 'Offres d’emploi et conducteurs SPL (Permis CE) en Hauts-de-France (Lille, Amiens, Saint-Quentin, Dunkerque).',
    h1: 'Recrutement & Emploi Chauffeur SPL en Hauts-de-France',
    subtitle: 'Consultez les offres et candidats conducteurs routiers Super Poids Lourd dans le Nord, le Pas-de-Calais, l’Aisne, l’Oise et la Somme.',
    badgeText: 'Région • Hauts-de-France (59, 62, 02, 60, 80)',
    keyTakeaways: [
      "Carrefour logistique européen majeur (A1, A26, A16, Delta 3)",
      "Forte concentration de plateformes e-commerce et grande distribution",
      "Transport transfrontalier actif vers la Belgique et le Royaume-Uni",
      "Recrutement direct de chauffeurs SPL en CDI et régional"
    ],
    sections: [
      {
        h2: "Les Hauts-de-France : Cœur Battant de la Logistique & du Transport SPL",
        content: "La région Hauts-de-France est le premier hub logistique de France. En raison de sa situation géographique privilégiée à proximité des ports de Dunkerque et Calais et au croisement des autoroutes A1, A26 et A16, les besoins en conducteurs Super Poids Lourd y sont intenses.",
        subsections: [
          {
            h3: "Bassins d'Emploi Majeurs",
            content: "Lille Métropole, le bassin minier (Dourges, Lens, Douai), le port de Dunkerque, l'Aisne (Saint-Quentin) et la Somme (Amiens) recrutent en continu."
          }
        ]
      }
    ],
    faqs: [
      {
        q: "Quels types de lignes SPL prédominent en Hauts-de-France ?",
        a: "On retrouve principalement des lignes régulières de messagerie palettisée vers Paris et la Belgique, ainsi que du transport frigorifique agroalimentaire."
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
