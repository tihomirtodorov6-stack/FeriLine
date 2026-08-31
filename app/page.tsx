'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ypfbljjrpppkdxdftjcv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_NZrVv1hI7aTWVdeyZT27-Q_rWp_olMG";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const COUNTRIES = [{code:'BG',name:'🇧🇬 България'},{code:'GB',name:'🇬🇧 UK'},{code:'DE',name:'🇩🇪 Германия'},{code:'ES',name:'🇪🇸 Испания'},{code:'GR',name:'🇬🇷 Гърция'},{code:'RO',name:'🇷🇴 Румъния'},{code:'TR',name:'🇹🇷 Турция'},{code:'IT',name:'🇮🇹 Италия'},{code:'FR',name:'🇫🇷 Франция'},{code:'NL',name:'🇳🇱 Холандия'}];

export default function Home(){
  const [users,setUsers]=useState<any[]>([]); const [currentUser,setCurrentUser]=useState<any>(null);
  const [tab,setTab]=useState<'find'|'my'|'offer'>('find');
  const [rides,setRides]=useState<any[]>([]);
  const [editingRide,setEditingRide]=useState<string|null>(null);
  const [offerForm,setOfferForm]=useState({type:'offer',from:'',to:'',fromCountry:'GB',toCountry:'BG',time:'09:30',returnTime:'12:30',date:'Днес',seats:'4',message:'',isDriver:false,carBrand:'',carColor:'',carReg:'',oblast:''});
  const [filterType,setFilterType]=useState(''); const [filterText,setFilterText]=useState('');
  const [myLocation,setMyLocation]=useState<any>(null);
  const [showTerms,setShowTerms]=useState(false);

  useEffect(()=>{
    const u=localStorage.getItem('vozime_users'); const cu=localStorage.getItem('vozime_current');
    if(u) setUsers(JSON.parse(u)); if(cu){ setCurrentUser(JSON.parse(cu)); }
    loadRides();
    navigator.geolocation?.getCurrentPosition(async (pos)=>{
      try{
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&accept-language=en`);
        const data = await res.json();
        setMyLocation({country: data.address?.country_code?.toUpperCase()||'GB', city: data.address?.city||data.address?.town||''});
      }catch{ setMyLocation({country:'GB', city:'Portsmouth'}); }
    });
  },[]);

  const mapFromDB = (d:any)=>({id:d.id, driverName:d.driver_name, driverPhone:d.driver_phone, driverId:d.driver_id, from:d.from_city, to:d.to_city, fromCountry:d.from_country||'BG', toCountry:d.to_country||'BG', time:d.time, returnTime:d.return_time, date:d.date, seats:d.seats, message:d.message, createdAt:d.created_at, type:d.type||'offer', carInfo:d.car_info, oblast:d.oblast, isDriverVerified:d.is_driver});
  const loadRides = async ()=>{ const cutoff = Date.now() - 48*60*60*1000; const {data} = await supabase.from('rides').select('*').gt('created_at', cutoff).order('created_at',{ascending:true}); if(data) setRides(data.map(mapFromDB)); };
  const logout=()=>{localStorage.removeItem('vozime_current');setCurrentUser(null);};
  const carFilled = offerForm.carBrand.trim() && offerForm.carColor.trim() && offerForm.carReg.trim();
  const seatsFilled = offerForm.seats.trim() && parseInt(offerForm.seats)>0;
  const canPublish = offerForm.from.trim() && offerForm.to.trim() && seatsFilled && (offerForm.type==='request' || (carFilled && offerForm.isDriver));

  const publishRide= async ()=>{
    if(!canPublish){alert('Попълни всички *');return;}
    const id = editingRide||Date.now().toString(); const existingCreated = editingRide ? (rides.find(r=>r.id===editingRide)?.createdAt || Date.now()) : Date.now();
    const row:any = {id, driver_name: `${currentUser.firstName} ${currentUser.lastName}`, driver_phone: currentUser.phone, driver_id: currentUser.id, from_city: offerForm.from, to_city: offerForm.to, time: offerForm.time, return_time: offerForm.returnTime, date: offerForm.date, seats: parseInt(offerForm.seats)||1, message: offerForm.message, created_at: existingCreated, type: offerForm.type, is_driver: offerForm.isDriver, car_brand: offerForm.carBrand, car_color: offerForm.carColor, car_reg: offerForm.carReg.toUpperCase(), car_info: `${offerForm.carBrand} ${offerForm.carColor} ${offerForm.carReg.toUpperCase()}`, oblast: offerForm.oblast, from_country: offerForm.fromCountry, to_country: offerForm.toCountry};
    if(editingRide) await supabase.from('rides').update(row).eq('id', editingRide); else await supabase.from('rides').insert(row);
    setEditingRide(null); await loadRides(); setTab('find');
  };
  const startEdit=(r:any)=>{ setOfferForm({type:r.type,from:r.from,to:r.to,fromCountry:r.fromCountry,toCountry:r.toCountry,time:r.time,returnTime:r.returnTime,date:r.date,seats:r.seats.toString(),message:r.message,isDriver:r.isDriverVerified,carBrand:'',carColor:'',carReg:'',oblast:r.oblast||''}); setEditingRide(r.id); setTab('offer'); };
  const deleteRide = async (id:string)=>{ await supabase.from('rides').delete().eq('id', id); await loadRides(); }
  const getFlag = (c:string)=>COUNTRIES.find(x=>x.code===c)?.name.split(' ')[0]||'🏳️';
  const cleanPhone = (p:string)=> p.replace(/[^0-9+]/g,''); const waPhone = (p:string)=> p.replace(/[^0-9]/g,'');

  return (
    <main style={{height:'100dvh',width:'100%',maxWidth:'480px',margin:'0 auto',background:'white',display:'flex',flexDirection:'column',overflow:'hidden',fontFamily:'-apple-system, sans-serif'}}>
      <div style={{background:'#0F4C75',color:'white',padding:'6px',textAlign:'center',fontSize:'10px'}}>🌍 VoziMe WORLD • Платформата е 100% безплатна • dropoffpay.co.uk</div>
      <header style={{height:'56px',minHeight:'56px',background:'#0F4C75',color:'white',display:'flex',alignItems:'center',padding:'0 12px',gap:'8px',flexShrink:0}}>
        <div style={{width:'32px',height:'32px',background:'#2ECC71',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center'}}>🌍</div>
        <div style={{flex:1}}><div style={{fontWeight:'bold',fontSize:'13px'}}>{myLocation? `${getFlag(myLocation.country)} ${myLocation.city}` : 'VoziMe'}</div><div style={{fontSize:'9px',opacity:0.9}}>Сайтът е безплатен • Пътуването е споделени разходи</div></div>
        <button onClick={()=>setShowTerms(true)} style={{fontSize:'10px',background:'rgba(255,255,255,0.15)',border:'none',color:'white',padding:'6px 10px',borderRadius:'12px'}}>ℹ️ Как работи</button>
        <button onClick={logout} style={{fontSize:'11px',background:'rgba(255,255,255,0.2)',border:'none',color:'white',padding:'6px 10px',borderRadius:'12px'}}>Изход</button>
      </header>
      <div style={{height:'52px',display:'flex',gap:'6px',padding:'6px',background:'#f1f3f4',flexShrink:0}}>
        <button onClick={()=>setTab('find')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:tab==='find'?'#0F4C75':'white',color:tab==='find'?'white':'#666',fontSize:'12px'}}>Намери ({rides.length})</button>
        <button onClick={()=>setTab('my')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:tab==='my'?'#0F4C75':'white',color:tab==='my'?'white':'#666',fontSize:'12px'}}>Моите</button>
        <button onClick={()=>setTab('offer')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:tab==='offer'?'#2ECC71':'white',color:tab==='offer'?'#0F4C75':'#666',fontSize:'12px'}}>Предложи</button>
      </div>
      <div style={{flex:1,overflowY:'auto'}}>
        {tab==='find' && <div style={{padding:'10px',display:'flex',flexDirection:'column',gap:'10px',paddingBottom:'140px'}}>
          <div style={{background:'#e3f2fd',padding:'10px',borderRadius:'12px',border:'1px solid #90caf9'}}>
            <div style={{fontSize:'11px',fontWeight:'800',color:'#0F4C75'}}>ℹ️ ВАЖНО - 2 неща:</div>
            <div style={{fontSize:'11px',marginTop:'4px',lineHeight:'1.4'}}><b>1. Сайтът VoziMe е 100% безплатен.</b> Ние не вземаме комисионна. Ако искаш да ни подкрепиш - бутона Ko-fi долу.<br/><b>2. Самото пътуване НЕ е безплатно.</b> Шофьор и пътник се договарят ЛИЧНО за споделени разходи. Без печалба - споделено пътуване.</div>
          </div>
          <div style={{display:'flex',gap:'6px'}}>
            <button onClick={()=>setFilterType('')} style={{flex:1,padding:'8px',borderRadius:'8px',border:'none',fontWeight:'bold',fontSize:'11px',background:filterType===''?'#0F4C75':'white',color:filterType===''?'white':'#666'}}>Всички</button>
            <button onClick={()=>setFilterType('offer')} style={{flex:1,padding:'8px',borderRadius:'8px',border:'none',fontWeight:'bold',fontSize:'10px',background:filterType==='offer'?'#2ECC71':'white'}}>🚗 Шофьори</button>
            <button onClick={()=>setFilterType('request')} style={{flex:1,padding:'8px',borderRadius:'8px',border:'none',fontWeight:'bold',fontSize:'10px',background:filterType==='request'?'#FFD60A':'white'}}>🙋 Пътници</button>
          </div>
          <input placeholder="🔍 Лондон, София..." value={filterText} onChange={e=>setFilterText(e.target.value)} style={{padding:'10px',borderRadius:'10px',border:'1px solid #ddd',fontSize:'13px'}}/>
          {rides.filter(r=>{ if(filterText &&!(r.from.toLowerCase().includes(filterText.toLowerCase())||r.to.toLowerCase().includes(filterText.toLowerCase()))) return false; if(filterType && r.type!==filterType) return false; return true;}).map((r:any)=>{
            const isReq = r.type==='request';
            return (
              <div key={r.id} style={{border: isReq?'2px solid #FFD60A':'2px solid #2ECC71',borderRadius:'14px',padding:'12px',background: isReq?'#fffbe6':'#f0fdf4'}}>
                <div style={{display:'flex',justifyContent:'space-between'}}><b style={{fontSize:'14px'}}>{getFlag(r.fromCountry)} {r.from} → {getFlag(r.toCountry)} {r.to}</b><span style={{background:isReq?'#FFD60A':'#2ECC71',color:isReq?'black':'white',fontSize:'9px',padding:'3px 8px',borderRadius:'12px',fontWeight:'bold'}}>{isReq?'🙋 ТЪРСИ':'🚗 ПРЕДЛАГА'}</span></div>
                <div style={{fontSize:'11px',marginTop:'4px'}}>{isReq?`Пътник ${r.driverName} търси ${r.seats} място`:`Шофьор ${r.driverName} • ${r.seats} места • ${r.carInfo}`} • {r.time} • {r.date}</div>
                <div style={{fontSize:'10px',background:'#fff3cd',padding:'6px 8px',borderRadius:'8px',marginTop:'6px',border:'1px solid #ffe69c'}}>⚠️ Пътуването НЕ е безплатно - лична договорка за споделени разходи между шофьор и пътник. Сайтът не участва.</div>
                {r.message && <div style={{fontSize:'11px',marginTop:'6px',background:'white',padding:'6px',borderRadius:'6px'}}>💬 {r.message}</div>}
                <div style={{marginTop:'10px',background:'white',borderRadius:'10px',padding:'8px',border:'1px solid #ddd'}}>
                  <div style={{fontSize:'10px',fontWeight:'bold',color:'#0F4C75',marginBottom:'6px'}}>📞 СВЪРЖИ СЕ ДИРЕКТНО - Лична договорка за разходите:</div>
                  <div style={{fontSize:'12px',fontWeight:'bold',marginBottom:'8px'}}>{r.driverName} • {r.driverPhone}</div>
                  <div style={{display:'flex',gap:'5px'}}>
                    <a href={`tel:${cleanPhone(r.driverPhone)}`} style={{flex:1,background:'#0F4C75',color:'white',padding:'10px',borderRadius:'8px',textAlign:'center',fontWeight:'bold',textDecoration:'none',fontSize:'11px'}}>📞 Обади се</a>
                    <a href={`https://wa.me/${waPhone(r.driverPhone)}?text=Здравей! За ${r.from} → ${r.to} от VoziMe - какви са споделените разходи?`} target="_blank" style={{flex:1,background:'#25D366',color:'white',padding:'10px',borderRadius:'8px',textAlign:'center',fontWeight:'bold',textDecoration:'none',fontSize:'11px'}}>💬 WhatsApp</a>
                    <a href={`viber://chat?number=${encodeURIComponent(cleanPhone(r.driverPhone))}`} style={{flex:1,background:'#7360F2',color:'white',padding:'10px',borderRadius:'8px',textAlign:'center',fontWeight:'bold',textDecoration:'none',fontSize:'11px'}}>📱 Viber</a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>}
        {tab==='offer' && (
          <div style={{padding:'12px',display:'flex',flexDirection:'column',gap:'10px',paddingBottom:'140px'}}>
            <div style={{display:'flex',gap:'6px',background:'#f1f3f4',padding:'3px',borderRadius:'12px'}}>
              <button onClick={()=>setOfferForm({...offerForm,type:'offer'})} style={{flex:1,padding:'10px',borderRadius:'8px',border:'none',fontWeight:'bold',fontSize:'11px',background:offerForm.type==='offer'?'#0F4C75':'white',color:offerForm.type==='offer'?'white':'#666'}}>🚗 Аз съм Шофьор</button>
              <button onClick={()=>setOfferForm({...offerForm,type:'request'})} style={{flex:1,padding:'10px',borderRadius:'8px',border:'none',fontWeight:'bold',fontSize:'11px',background:offerForm.type==='request'?'#FFD60A':'white',color:offerForm.type==='request'?'black':'#666'}}>🙋 Аз съм Пътник</button>
            </div>
            <div style={{background:'#e8f5e9',padding:'10px',borderRadius:'10px',border:'1px solid #a5d6a7',fontSize:'11px',lineHeight:'1.4'}}>
              <b>Сайтът е безплатен</b> - използвай го свободно. <b>Пътуването НЕ е безплатно</b> - ти и другият човек се договаряте ЛИЧНО какви са споделените разходи. Ние не определяме цена и не вземаме комисионна.
            </div>
            <div style={{display:'flex',gap:'6px'}}><select value={offerForm.fromCountry} onChange={e=>setOfferForm({...offerForm,fromCountry:e.target.value})} style={{padding:'10px',borderRadius:'10px',border:'2px solid #2ECC71',background:'#e6f9ed',fontWeight:'bold',fontSize:'12px'}}>{COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}</select><input placeholder="От - London" value={offerForm.from} onChange={e=>setOfferForm({...offerForm,from:e.target.value})} style={{flex:1,padding:'10px',borderRadius:'10px',border:offerForm.from?'2px solid #2ECC71':'2px solid #FF3B30'}}/></div>
            <div style={{display:'flex',gap:'6px'}}><select value={offerForm.toCountry} onChange={e=>setOfferForm({...offerForm,toCountry:e.target.value})} style={{padding:'10px',borderRadius:'10px',border:'2px solid #2ECC71',background:'#e6f9ed',fontWeight:'bold',fontSize:'12px'}}>{COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}</select><input placeholder="До - София" value={offerForm.to} onChange={e=>setOfferForm({...offerForm,to:e.target.value})} style={{flex:1,padding:'10px',borderRadius:'10px',border:offerForm.to?'2px solid #2ECC71':'2px solid #FF3B30'}}/></div>
            {offerForm.type==='offer' && <><div style={{display:'flex',gap:'6px'}}><input placeholder="Марка *" value={offerForm.carBrand} onChange={e=>setOfferForm({...offerForm,carBrand:e.target.value})} style={{flex:1,padding:'10px',borderRadius:'10px',border:offerForm.carBrand?'2px solid #2ECC71':'2px solid #FF3B30'}}/><input placeholder="Цвят *" value={offerForm.carColor} onChange={e=>setOfferForm({...offerForm,carColor:e.target.value})} style={{flex:1,padding:'10px',borderRadius:'10px',border:offerForm.carColor?'2px solid #2ECC71':'2px solid #FF3B30'}}/></div><input placeholder="Рег. номер *" value={offerForm.carReg} onChange={e=>setOfferForm({...offerForm,carReg:e.target.value.toUpperCase()})} style={{width:'100%',padding:'10px',borderRadius:'10px',border:offerForm.carReg?'2px solid #2ECC71':'2px solid #FF3B30'}}/></>}
            <input placeholder={offerForm.type==='request'?'Места нужни - 2':'Свободни места - 4'} value={offerForm.seats} onChange={e=>setOfferForm({...offerForm,seats:e.target.value})} style={{padding:'10px',borderRadius:'10px',border:offerForm.seats?'2px solid #2ECC71':'2px solid #FF3B30'}}/>
            <textarea placeholder="Бележка..." value={offerForm.message} onChange={e=>setOfferForm({...offerForm,message:e.target.value})} style={{padding:'10px',borderRadius:'10px',border:'1px solid #ddd',minHeight:'50px'}}/>
            {offerForm.type==='offer' && <label style={{display:'flex',gap:'8px',background:offerForm.isDriver?'#e6f9ed':'#fff8e1',padding:'10px',borderRadius:'10px',border:`2px solid ${offerForm.isDriver?'#2ECC71':'#FFD60A'}`,fontSize:'11px'}}><input type="checkbox" checked={offerForm.isDriver} onChange={e=>setOfferForm({...offerForm,isDriver:e.target.checked})}/>ДЕКЛАРИРАМ: Пътувам лично по маршрута. Предлагам само споделени разходи, БЕЗ печалба. Не е такси. Сайтът е само борса.</label>}
            <button onClick={publishRide} disabled={!canPublish} style={{background:canPublish?'#2ECC71':'#ccc',padding:'14px',borderRadius:'10px',fontWeight:'bold',border:'none'}}>{canPublish? (offerForm.type==='request'?`🙋 Публикувай че ТЪРСИШ ${offerForm.from}→${offerForm.to}`:`🚗 Публикувай ${offerForm.from}→${offerForm.to}`):'Попълни От и До *'}</button>
          </div>
        )}
        {tab==='my' && <div style={{padding:'10px'}}>{rides.filter(r=>r.driverId===currentUser?.id).map((r:any)=><div key={r.id} style={{border:'2px solid #0F4C75',borderRadius:'12px',padding:'12px',marginBottom:'8px'}}><b>{getFlag(r.fromCountry)} {r.from} → {getFlag(r.toCountry)} {r.to}</b> <span style={{background:r.type==='request'?'#FFD60A':'#2ECC71',padding:'2px 6px',borderRadius:'6px',fontSize:'10px'}}>{r.type==='request'?'ТЪРСИШ':'ПРЕДЛАГАШ'}</span><div style={{display:'flex',gap:'6px',marginTop:'8px'}}><button onClick={()=>startEdit(r)} style={{flex:1,background:'#0F4C75',color:'white',border:'none',padding:'8px',borderRadius:'8px',fontSize:'12px'}}>Редактирай</button><button onClick={()=>deleteRide(r.id)} style={{padding:'8px 12px',borderRadius:'8px',border:'1px solid #ddd',background:'white'}}>🗑️</button></div></div>)}</div>}
      </div>
      <div style={{minHeight:'88px',flexShrink:0,background:'white',borderTop:'1px solid #e5e7eb',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 12px',gap:'8px'}}>
        <div style={{flex:1}}>
          <div style={{fontSize:'12px',fontWeight:'800',color:'#0F4C75'}}>❤️ Платформата VoziMe е безплатна</div>
          <div style={{fontSize:'10px',color:'#333',marginTop:'2px'}}>Сайтът не взема комисионна. Подкрепи ни с Ko-fi.<br/><span style={{color:'#b45309',fontWeight:'700'}}>Пътуванията НЕ са безплатни - лична договорка за разходите.</span></div>
        </div>
        <a href="https://ko-fi.com/dropoffpay" target="_blank" style={{background:'#FF5E5B',color:'white',padding:'10px 16px',borderRadius:'20px',fontWeight:'bold',textDecoration:'none',fontSize:'12px'}}>☕ Ko-fi</a>
      </div>
      {showTerms && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px'}}>
          <div style={{background:'white',borderRadius:'16px',padding:'20px',maxWidth:'400px',maxHeight:'80vh',overflowY:'auto'}}>
            <div style={{fontWeight:'bold',fontSize:'16px',marginBottom:'12px'}}>ℹ️ Как работи VoziMe</div>
            <div style={{fontSize:'12px',lineHeight:'1.5',display:'flex',flexDirection:'column',gap:'10px'}}>
              <div><b>1. Платформата е 100% безплатна.</b><br/>VoziMe не е превозвач, не взема комисионна. Ние сме борса за обяви. Има бутон Ko-fi - ако искаш да подкрепиш безплатния сайт.</div>
              <div><b>2. Пътуването НЕ е безплатно - лична договорка за разходите.</b><br/>Шофьор и пътник се свързват директно по телефон / WhatsApp / Viber и се договарят ЛИЧНО какви са споделените разходи. Това е между тях, сайтът не участва и не определя цена.</div>
              <div><b>3. Защо е законно?</b><br/>В UK и БГ споделеното пътуване е законно, когато шофьорът пътува по своя маршрут и само си дели разходите - БЕЗ печалба. Това НЕ е такси.</div>
              <div><b>4. Двупосочно:</b><br/>🚗 Шофьор предлага места → пътниците му звънят.<br/>🙋 Пътник търси превоз → шофьорите му предлагат място.</div>
            </div>
            <button onClick={()=>setShowTerms(false)} style={{width:'100%',marginTop:'16px',background:'#0F4C75',color:'white',padding:'12px',borderRadius:'10px',border:'none',fontWeight:'bold'}}>Разбрах</button>
          </div>
        </div>
      )}
    </main>
  );
}