import { describe, it, expect, vi, beforeEach } from 'vitest';
const fixture=vi.hoisted(()=>({user:null as {id:string}|null,cast:null as Record<string,string>|null}));
vi.mock('@/lib/supabase/server',()=>({createServerSupabaseClient:()=>({
  auth:{getUser:async()=>({data:{user:fixture.user},error:null})},
  from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:fixture.cast,error:null})})})}),
})}));
import { requireOwner, readLineJson } from '../lib/personal-line/server';
beforeEach(()=>{fixture.user=null;fixture.cast=null;});
describe('personal LINE API identity',()=>{
  it('rejects mock-cookie identity',async()=>{
    await expect(requireOwner(new Request('https://app.test/api',{headers:{cookie:'nightos.mock-cast-id=cast1'}}))).rejects.toMatchObject({status:401});
  });
  it.each(['store_owner','store_staff'])('rejects %s even with a real Auth session',async role=>{
    fixture.user={id:'owner'};fixture.cast={id:'cast1',name:'店舗',user_role:role};
    await expect(requireOwner(new Request('https://app.test/api'))).rejects.toMatchObject({status:403});
  });
  it('accepts only the real user and their own cast profile',async()=>{
    fixture.user={id:'owner'};fixture.cast={id:'cast1',name:'本人',user_role:'cast'};
    const owner=await requireOwner(new Request('https://app.test/api'));
    expect(owner.userId).toBe('owner');expect(owner.cast.id).toBe('cast1');
  });
  it('rejects cross-origin modification before resolving a session',async()=>{
    fixture.user={id:'owner'};fixture.cast={id:'cast1',user_role:'cast'};
    await expect(requireOwner(new Request('https://app.test/api',{method:'POST',headers:{origin:'https://other.test'}}))).rejects.toMatchObject({status:403});
  });
  it('bounds actual UTF-8 body bytes, including requests with no content-length',async()=>{
    const request=new Request('https://app.test/api',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:'あ'.repeat(100)})});
    await expect(readLineJson(request,100)).rejects.toMatchObject({status:413});
    expect(await readLineJson(new Request('https://app.test/api',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"x":1}'}))).toEqual({x:1});
  });
});
