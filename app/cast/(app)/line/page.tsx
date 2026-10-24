import { PersonalLinePage } from '@/features/personal-line/personal-line-page';
import { resolveAuthedCast } from '@/lib/nightos/api-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function LinePage({searchParams}:{searchParams:{settings?:string;customerId?:string}}) {
  const cast=await resolveAuthedCast();
  // No mock customers are ever associated with a live personal LINE account.
  const supabase=cast?createServerSupabaseClient():null;
  const {data}=supabase?await supabase.from('customers').select('id,name').order('name'):{data:[]};
  return <PersonalLinePage customers={data??[]} initialSettings={searchParams.settings==='1'} initialCustomerId={searchParams.customerId}/>;
}
