'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient("https://ypfbljjrpppkdxdftjcv.supabase.co","sb_publishable_NZrVv1hI7aTWVdeyZT27-Q_rWp_olMG");

export default function ShopDashboard(){
  const [shopId,setShopId]=useState(''); const [products,setProducts]=useState<any[]>([]); const [phone,setPhone]=useState(''); const [newProd,setNewProd]=useState({name:'',price:''});

  async function login(){
    const {data}=await supabase.from('shop_profiles').select('shop_id').eq('phone',phone).eq('role','shop_owner').single();
    if(!data) return alert('Няма магазин за този телефон! Първо го създай от админ панела /admin/shops');
    setShopId(data.shop_id); loadProducts(data.shop_id);
  }
  async function loadProducts(id:string){ const {data}=await supabase.from('products').select('*').eq('shop_id',id); if(data) setProducts(data); }
  async function updatePrice(id:string, price:string){ await supabase.from('products').update({price:parseFloat(price)}).eq('id',id); alert('Цената е запазена! Клиентите я виждат веднага в реално време.'); }
  async function addProduct(){ if(!newProd.name || !newProd.price) return; await supabase.from('products').insert({shop_id:shopId, name:newProd.name, price:parseFloat(newProd.price), active:true}); setNewProd({name:'',price:''}); loadProducts(shopId); }

  if(!shopId) return <div style={{padding:20,fontFamily:'sans-serif'}}><h3>Вход за магазинер</h3><p>Въведи телефона с който те е добавил админа:</p><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="0888123456" style={{padding:10,width:'100%'}}/><button onClick={login} style={{marginTop:10,padding:12,width:'100%',background:'#0F4C75',color:'white',border:0,borderRadius:8}}>ВЛЕЗ И СМЕНИ ЦЕНИ</button></div>;

  return (
    <div style={{padding:16,fontFamily:'sans-serif'}}>
      <h3>Моите продукти - сменям цени без код</h3>
      <div style={{display:'flex',gap:6,marginBottom:12}}><input value={newProd.name} onChange={e=>setNewProd({...newProd,name:e.target.value})} placeholder="Име: Кайма 1кг" style={{flex:1,padding:8}}/><input value={newProd.price} onChange={e=>setNewProd({...newProd,price:e.target.value})} placeholder="Цена: 12.50" style={{width:90,padding:8}}/><button onClick={addProduct}>+ Добави</button></div>
      {products.map(p=><div key={p.id} style={{display:'flex',gap:8,marginBottom:8,border:'1px solid #eee',padding:8}}><span style={{flex:1}}>{p.name}</span><input id={p.id} defaultValue={p.price} style={{width:70}}/><button onClick={()=>updatePrice(p.id,(document.getElementById(p.id) as HTMLInputElement).value)}>Запази</button></div>)}
    </div>
  )
}