'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const CandidateChecker = () => {
  useEffect(() => {
    const checkCandidates = async () => {
      try {
        // Vérifier la structure de la table
        const { data: schema, error: schemaError } = await supabase
          .rpc('get_table_schema', { table_name: 'candidates' });

        if (schemaError) {
          console.error('Erreur de schéma:', schemaError);
          return;
        }

        console.log('Structure de la table candidates:', schema);

        // Vérifier les données existantes
        const { data: candidates, error: dataError } = await supabase
          .from('candidates')
          .select('*')
          .limit(10);

        if (dataError) {
          console.error('Erreur de données:', dataError);
          return;
        }

        console.log('Exemples de candidats:', candidates);
      } catch (err) {
        console.error('Erreur générale:', err);
      }
    };

    checkCandidates();
  }, []);

  return null;
};

export default CandidateChecker;
