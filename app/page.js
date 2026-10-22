import { redirect } from 'next/navigation';
import { createClient } from '../lib/supabase/server';
import CreativeForm from './creative-form';
import SiteHeader from './site-header';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  let user = null;
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error) user = data.user;
    } catch {
      // Never render private content without a verified user.
    }
  }
  if (!user) redirect('/login');

  return (
    <>
      <SiteHeader email={user.email} />
      <CreativeForm />
    </>
  );
}
