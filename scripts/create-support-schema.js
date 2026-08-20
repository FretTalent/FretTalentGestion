require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  await client.connect();
  console.log('Connected to Postgres DB...');

  try {
    // 1. Table support_conversations
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.support_conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        user_role VARCHAR(20) NOT NULL, -- 'candidate' ou 'recruiter'
        user_name VARCHAR(255) NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL DEFAULT 'Demande d''assistance',
        status VARCHAR(20) NOT NULL DEFAULT 'open', -- 'open', 'resolved', 'closed'
        last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        notified_new_conversation BOOLEAN NOT NULL DEFAULT FALSE,
        notified_first_reply BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✓ Table support_conversations created.');

    // 2. Table support_messages
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.support_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES public.support_conversations(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        sender_role VARCHAR(20) NOT NULL, -- 'admin', 'candidate', 'recruiter'
        sender_name VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✓ Table support_messages created.');

    // 3. Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_support_conv_user_id ON public.support_conversations(user_id);
      CREATE INDEX IF NOT EXISTS idx_support_conv_last_msg ON public.support_conversations(last_message_at DESC);
      CREATE INDEX IF NOT EXISTS idx_support_msg_conv_id ON public.support_messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_support_msg_created ON public.support_messages(created_at ASC);
    `);
    console.log('✓ Indexes created.');

    // 4. RLS activation
    await client.query(`
      ALTER TABLE public.support_conversations ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
    `);

    // Drop existing policies if any
    await client.query(`
      DROP POLICY IF EXISTS "support_conv_select" ON public.support_conversations;
      DROP POLICY IF EXISTS "support_conv_insert" ON public.support_conversations;
      DROP POLICY IF EXISTS "support_conv_update" ON public.support_conversations;
      DROP POLICY IF EXISTS "support_conv_delete" ON public.support_conversations;

      DROP POLICY IF EXISTS "support_msg_select" ON public.support_messages;
      DROP POLICY IF EXISTS "support_msg_insert" ON public.support_messages;
      DROP POLICY IF EXISTS "support_msg_update" ON public.support_messages;
      DROP POLICY IF EXISTS "support_msg_delete" ON public.support_messages;
    `);

    // Policies for conversations
    await client.query(`
      -- SELECT: Users see their own, Admins see all
      CREATE POLICY "support_conv_select" ON public.support_conversations
        FOR SELECT
        USING (user_id = auth.uid() OR public.is_admin());

      -- INSERT: Authenticated users can create conversation for themselves, Admins for anyone
      CREATE POLICY "support_conv_insert" ON public.support_conversations
        FOR INSERT
        WITH CHECK (user_id = auth.uid() OR public.is_admin());

      -- UPDATE: Participants and Admins can update
      CREATE POLICY "support_conv_update" ON public.support_conversations
        FOR UPDATE
        USING (user_id = auth.uid() OR public.is_admin());

      -- DELETE: ONLY ADMIN CAN DELETE! (Candidates & Recruiters cannot delete)
      CREATE POLICY "support_conv_delete" ON public.support_conversations
        FOR DELETE
        USING (public.is_admin());
    `);

    // Policies for messages
    await client.query(`
      -- SELECT: Users can read messages of their conversations, Admins see all
      CREATE POLICY "support_msg_select" ON public.support_messages
        FOR SELECT
        USING (
          public.is_admin() OR 
          EXISTS (
            SELECT 1 FROM public.support_conversations c 
            WHERE c.id = support_messages.conversation_id AND c.user_id = auth.uid()
          )
        );

      -- INSERT: Users can send to their conversations, Admins can send to any
      CREATE POLICY "support_msg_insert" ON public.support_messages
        FOR INSERT
        WITH CHECK (
          public.is_admin() OR 
          EXISTS (
            SELECT 1 FROM public.support_conversations c 
            WHERE c.id = support_messages.conversation_id AND c.user_id = auth.uid()
          )
        );

      -- UPDATE: Admin or sender can mark read
      CREATE POLICY "support_msg_update" ON public.support_messages
        FOR UPDATE
        USING (
          public.is_admin() OR 
          EXISTS (
            SELECT 1 FROM public.support_conversations c 
            WHERE c.id = support_messages.conversation_id AND c.user_id = auth.uid()
          )
        );

      -- DELETE: ONLY ADMIN CAN DELETE!
      CREATE POLICY "support_msg_delete" ON public.support_messages
        FOR DELETE
        USING (public.is_admin());
    `);
    console.log('✓ RLS Policies configured.');

    // 5. Reload PostgREST schema cache
    await client.query(`NOTIFY pgrst, 'reload schema';`);
    console.log('✓ Schema cache reloaded.');

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

migrate();
