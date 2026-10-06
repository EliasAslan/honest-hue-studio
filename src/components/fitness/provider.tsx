import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { readFitness, saveFitness } from '@/lib/fitness.functions';
import { dayKey, type FitnessRecord, type Profile, type Daily } from '@/lib/fitness';
interface FitnessContext { records:FitnessRecord[]; profile:Profile; today:Daily; date:string; loading:boolean; saving:boolean; error:string; save:(kind:FitnessRecord['kind'],payload:FitnessRecord['payload'],date?:string,recordKey?:string)=>Promise<void>; key:string; restoreKey:(key:string)=>void }
const Context = createContext<FitnessContext | null>(null);
export function FitnessProvider({children}:{children:ReactNode}) {
 const [key,setKey]=useState(''); const [date,setDate]=useState(''); const [storageError,setStorageError]=useState(''); const qc=useQueryClient();
 useEffect(()=>{ try { let k=localStorage.getItem('ben-private-journal'); if(!k || !/^[a-f0-9]{64}$/.test(k)){k=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');localStorage.setItem('ben-private-journal',k);} setKey(k); }catch {setStorageError('Allow browser storage to save and access your private journal.');} setDate(dayKey()); const interval=setInterval(()=>setDate(dayKey()),30000); return ()=>clearInterval(interval); },[]);
 const query=useQuery({queryKey:['fitness',key],queryFn:()=>readFitness({data:{key}}),enabled:!!key});
 const mutation=useMutation({mutationFn:saveFitness,onSuccess:()=>qc.invalidateQueries({queryKey:['fitness',key]})});
 const records=query.data ?? []; const profile=(records.find(r=>r.kind==='profile')?.payload ?? {}) as Profile; const today=(records.find(r=>r.kind==='daily'&&r.record_date===date)?.payload ?? {}) as Daily;
 const save=async(kind:FitnessRecord['kind'],payload:FitnessRecord['payload'],d=date,recordKey=d)=>{if(!key)throw new Error('Private journal is not ready.'); await mutation.mutateAsync({data:{key,kind,date:d,recordKey:kind==='profile'?'benjamin':recordKey,payload}});};
 const restoreKey=(k:string)=>{if(!/^[a-f0-9]{64}$/.test(k))throw new Error('Please enter a valid private journal key.');localStorage.setItem('ben-private-journal',k);setKey(k);};
 return <Context.Provider value={{records,profile,today,date,loading:!date||query.isLoading,saving:mutation.isPending,error:storageError||query.error?.message||mutation.error?.message||'',save,key,restoreKey}}>{children}</Context.Provider>;
}
export function useFitness(){const context=useContext(Context);if(!context)throw new Error('Fitness provider missing');return context;}
