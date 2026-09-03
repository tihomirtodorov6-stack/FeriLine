'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient("https://ypfbljjrpppkdxdftjcv.supabase.co","sb_publishable_NZrVv1hI7aTWVdeyZT27-Q_rWp_olMG");
const ADMIN_PHONES = ['+447935463970','447935463970','07935463970'];

export default function AdminShops(){
  const [shops,setShops]=useState<any[]>([]); 
  const [name,setName]=useState(''); const [ownerPhone,setOwnerPhone]=useState(''); const [driverPhone,setDriverPhone]=useState('');
  const [isAdmin,setIsAdmin]=useState(false);

  useEffect(()=>{ 
    const cu = JSON.parse(localStorage.getItem('vozime_current')||'{}');
    if(ADMIN_PHONES.includes(cu.phone) || cu.phone?.includes('7935463970')) setIsAdmin(true);
    load(); 
  },[]);

  async function load(){ const {data}=await supabase.from('shops').select('*').order('created_at',{ascending:false}); if(data) setShops(data); }
  
  async function addShop(){
    if(!name || !ownerPhone) return alert('Напиши име и телефон на собственика!');
    const {data,error}=await supabase.from('shops').insert({name, slug:name.toLowerCase().replace(/\s+/g,'-')+'-'+Date.now(), city:'Sofia', phone:ownerPhone, delivery_fee:4.99, vip_active:true}).select().single();
    if(error) return alert(error.message);
    await supabase.from('shop_profiles').insert([{phone:ownerPhone, role:'shop_owner', shop_id:data.id}]);
    if(driverPhone) await supabase.from('shop_profiles').insert([{phone:driverPhone, role:'driver', shop_id:data.id}]);
    setName(''); setOwnerPhone(''); setDriverPhone(''); load();
    alert('Готово! Магазин '+name+' създаден. Собственикът влиза с '+ownerPhone);
  }

  if(!isAdmin) return <div style={{padding:20}}>⛔ Нямаш достъп. Само +447935463970 вижда този панел.</div>;

  return (
    <div style={{padding:16, maxWidth:600, margin:'0 auto', fontFamily:'sans-serif'}}>
      <h2>👑 Админ Магазини - само за теб</h2>
      <div style={{border:'2px solid #22c55e', padding:12, borderRadius:12}}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Име: Месарница Иван" style={{width:'100%',padding:10,marginTop:8}}/>
        <input value={ownerPhone} onChange={e=>setOwnerPhone(e.target.value)} placeholder="Телефон собственик: 0888123456" style={{width:'100%',padding:10,marginTop:8}}/>
        <input value={driverPhone} onChange={e=>setDriverPhone(e.target.value)} placeholder="Телефон шофьор: 0888777888 (незадължително)" style={{width:'100%',padding:10,marginTop:8}}/>
        <button onClick={addShop} style={{width:'100%',marginTop:10,padding:12,background:'#22c55e',color:'white',border:0,borderRadius:8,fontWeight:'bold'}}>СЪЗДАЙ МАГАЗИН</button>
        <div style={{fontSize:11,marginTop:8,color:'#666'}}>Доставката 4.99лв отива при магазина. Ти взимаш 0% от поръчката - само 59лв наем.</div>
      </div>
      <div style={{marginTop:20}}>{shops.map(s=><div key={s.id} style={{border:'1px solid #eee',padding:10,borderRadius:8,marginBottom:6}}>{s.name} - {s.phone} - ID: {s.id.slice(0,8)}</div>)}</div>
    </div>
  )
}