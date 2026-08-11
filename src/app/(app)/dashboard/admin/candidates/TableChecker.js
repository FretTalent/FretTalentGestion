'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const TableChecker = () => {
  useEffect(() => {
    const checkTable = async () => {
      try {
        // Vérifier la structure de la table candidates
        const { data: schema, error: schemaError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type')
          .eq('table_name', 'candidates');

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

    checkTable();
  }, []);

  return null;
};

export default TableChecker;
