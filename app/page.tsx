'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = "https://ypfbljjrpppkdxdftjcv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_NZrVv1hI7aTWVdeyZT27-Q_rWp_olMG";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const EDGE_URL = "https://ypfbljjrpppkdxdftjcv.supabase.co/functions/v1/admin";
const ADMIN_PHONES = ['+447935463970','447935463970','07935463970'];
const clean = (p:string)=> p.replace(/[^0-9]/g,'').slice(-10);
const isAdminPhone = (phone:string)=>{ if(!phone) return false; const c=phone.replace(/[^0-9+]/g,''); return ADMIN_PHONES.includes(c) || ADMIN_PHONES.includes(clean(c)) || c.includes('7935463970'); };
const COUNTRIES = [{code:'BG',name:'🇧🇬 България',prefix:'359'},{code:'GB',name:'🇬🇧 UK',prefix:'44'},{code:'DE',name:'🇩🇪 Германия',prefix:'49'},{code:'ES',name:'🇪🇸 Испания',prefix:'34'},{code:'GR',name:'🇬🇷 Гърция',prefix:'30'},{code:'RO',name:'🇷🇴 Румъния',prefix:'40'},{code:'TR',name:'🇹🇷 Турция',prefix:'90'}];
const getCountryByPhone = (phone:string)=>{ const c = phone.replace(/[^0-9]/g,''); for(let co of COUNTRIES) if(c.startsWith(co.prefix) || c.includes(co.prefix)) return co.code; if(c.startsWith('44')) return 'GB'; if(c.startsWith('359')) return 'BG'; return 'GB'; }
const TRANSLATIONS = {
  bg: { siteFree:'Сайтът е безплатен', sharedCosts:'Пътуването е споделени разходи', exit:'Изход', find:'Намери', my:'Моите', offer:'Предложи', admin:'👑 Админ', shops:'🛒 Магазини', market:'🛒 Пазар', important:'ℹ️ ВАЖНО - 2 неща:', important1:'1. Сайтът VoziMe е 100% безплатен.', important1b:'Ние не вземаме комисионна.', important2:'2. Самото пътуване НЕ е безплатно.', important2b:'Шофьор и пътник се договарят ЛИЧНО.', all:'Всички', drivers:'Шофьори', passengers:'Пътници', search:'🔍 Лондон, София...', notFree:'⚠️ Пътуването НЕ е безплатно - лична договорка.', connectDirect:'📞 СВЪРЖИ СЕ ДИРЕКТНО:', call:'📞 Обади се', offers:'🚗 ПРЕДЛАГА', seeks:'🙋 ТЪРСИ', imDriver:'🚗 Аз съм Шофьор', imPassenger:'🙋 Аз съм Пътник', from:'От', to:'До', brand:'Марка', color:'Цвят', reg:'Рег. номер', seatsNeed:'Места нужни', seatsFree:'Свободни места', note:'Бележка...', declare:'ДЕКЛАРИРАМ: Пътувам лично, само споделени разходи, БЕЗ печалба.', fillFromTo:'Попълни От и До', publishSeeks:'🙋 Публикувай че ТЪРСИШ', publish:'🚗 Публикувай', edit:'Редактирай', youSeek:'ТЪРСИШ', youOffer:'ПРЕДЛАГАШ', footerTitle:'❤️ VoziMe е безплатна', footerSub:'Сайтът не взема комисионна.', footerWarn:'Пътуванията НЕ са безплатни - лична договорка.', enableLoc:'📍 Включи локация', report:'🚩 Докладвай', banned:'⛔ БАННАТ СИ', maintenanceTitle:'🔧 Профилактика', maintenanceMsg:'Работим по подобрения.', deleteAcc:'🗑️ Изтрий акаунт', tabLogin:'Вход', tabReg:'Регистрация', loginSub:'Влез за да продължиш', loginBtn:'Влез →', regBtn:'Регистрирай се →', firstName:'Име', lastName:'Фамилия', phone:'Телефон +447...', time:'Час на тръгване', needVerify:'⚠️ Трябва верификация за да пускаш обяви!', needVerifyLong:'Отиди в Моите -> Стани Проверен със снимка.', verifyTitle:'✅ Стани Проверен - Безплатно', verifyDesc:'Направи снимка как държиш лист с текст: VoziMe + днешна дата', writeOnPaper:'На листа напиши:', step1:'1. VoziMe', step2:'2. Днешна дата: ', step3:'3. Твоето име', deleteRide:'🗑️ Трий', deleteAccKeep:'🗑️ Изтрий акаунт (пази се 6м)', photoSent:'Снимката е изпратена! Админ ще я одобри до 24ч.', pendingApproval:'⏳ Чака одобрение.', uploading:'Качва...', sendForCheck:'📸 Изпрати за проверка', verifiedOn:'Верифициран на', noRides:'Нямаш обяви', noRidesVerify:'- първо се верифицирай', seatsPlace:'места', agreementConsent:'Регистрирайки се се съгласяваш снимката да се пази 1г за сигурност.', refresh:'🔄 Опресни', about:'За Нас', terms:'Условия', privacy:'Поверителност', contact:'Контакт', back:'← Назад' },
  en: { siteFree:'Site is free', sharedCosts:'Travel is shared costs', exit:'Exit', find:'Find', my:'My rides', offer:'Offer', admin:'👑 Admin', shops:'🛒 Shops', market:'🛒 Market', important:'ℹ️ IMPORTANT - 2 things:', important1:'1. VoziMe is 100% free.', important1b:'We take no commission.', important2:'2. Trip is NOT free.', important2b:'Driver and passenger agree personally.', all:'All', drivers:'Drivers', passengers:'Passengers', search:'🔍 London, Sofia...', notFree:'⚠️ Trip NOT free - personal agreement.', connectDirect:'📞 CONNECT DIRECTLY:', call:'📞 Call', offers:'🚗 OFFERS', seeks:'🙋 SEEKS', imDriver:'🚗 I am Driver', imPassenger:'🙋 I am Passenger', from:'From', to:'To', brand:'Brand', color:'Color', reg:'Reg number', seatsNeed:'Seats needed', seatsFree:'Free seats', note:'Note...', declare:'I DECLARE: Personal travel, shared costs only, NO profit.', fillFromTo:'Fill From and To', publishSeeks:'🙋 Publish SEEK', publish:'🚗 Publish', edit:'Edit', youSeek:'YOU SEEK', youOffer:'YOU OFFER', footerTitle:'❤️ VoziMe is free', footerSub:'No commission.', footerWarn:'Trips NOT free.', enableLoc:'📍 Enable location', report:'🚩 Report', banned:'⛔ BANNED', maintenanceTitle:'🔧 Maintenance', maintenanceMsg:'Working on improvements.', deleteAcc:'🗑️ Delete account', tabLogin:'Login', tabReg:'Register', loginSub:'Login to continue', loginBtn:'Login →', regBtn:'Register →', firstName:'First name', lastName:'Last name', phone:'Phone +447...', time:'Departure time', needVerify:'⚠️ Verification needed to post!', needVerifyLong:'Go to My rides -> Get Verified.', verifyTitle:'✅ Get Verified - Free', verifyDesc:'Take photo holding paper: VoziMe + today date', writeOnPaper:'On paper write:', step1:'1. VoziMe', step2:'2. Today date: ', step3:'3. Your name', deleteRide:'🗑️ Delete', deleteAccKeep:'🗑️ Delete account (kept 6m)', photoSent:'Photo sent! Admin will approve within 24h.', pendingApproval:'⏳ Waiting for approval.', uploading:'Uploading...', sendForCheck:'📸 Send for check', verifiedOn:'Verified on', noRides:'No rides', noRidesVerify:'- verify first', seatsPlace:'seats', agreementConsent:'By registering you agree your verification photo is kept 1 year for safety.', refresh:'🔄 Refresh', about:'About', terms:'Terms', privacy:'Privacy', contact:'Contact', back:'← Back' }
};
const STATIC_CONTENT = { bg: { about: `VoziMe.bg е проект на DropOffPay.co.uk`, terms: `VoziMe.bg е проект на DropOffPay.co.uk. Информационна платформа.`, privacy: `Администратор: DropOffPay.co.uk`, contact: `VoziMe.bg е част от DropOffPay.co.uk\n📧 dropoffpay.co.uk@gmail.com\n📞 +44 7935463970` }, en: { about: `VoziMe.bg is a project of DropOffPay.co.uk`, terms: `VoziMe.bg is a project`, privacy: `Data Controller`, contact: `VoziMe.bg is part of DropOffPay.co.uk` } };

export default function Home(){
  const [lang,setLang]=useState<'bg'|'en'>('bg');
  const [loginTab,setLoginTab]=useState<'login'|'register'>('login');
  const [loginForm,setLoginForm]=useState({firstName:'',lastName:'',phone:''});
  const [currentUser,setCurrentUser]=useState<any>(null);
  const [tab,setTab]=useState<'find'|'my'|'offer'|'admin'|'shops'|'market'>('find');
  const [staticPage,setStaticPage]=useState<'about'|'terms'|'privacy'|'contact'|null>(null);
  const [rides,setRides]=useState<any[]>([]);
  const [editingRide,setEditingRide]=useState<string|null>(null);
  const [offerForm,setOfferForm]=useState({type:'offer',from:'',to:'',fromCountry:'GB',toCountry:'BG',time:'09:30',returnTime:'12:30',date:'Днес',seats:'4',message:'',isDriver:false,carBrand:'',carColor:'',carReg:''});
  const [filterType,setFilterType]=useState(''); const [filterText,setFilterText]=useState('');
  const [myLocation,setMyLocation]=useState<any>(null); const [locLoading,setLocLoading]=useState(false); const [locDenied,setLocDenied]=useState(false);
  const [maintenance,setMaintenance]=useState<{enabled:boolean,msg:string}>({enabled:false,msg:''});
  const [bans,setBans]=useState<any[]>([]); const [reports,setReports]=useState<any[]>([]);
  const [banPhoneInput,setBanPhoneInput]=useState(''); const [banReasonInput,setBanReasonInput]=useState(''); const [banDuration,setBanDuration]=useState('forever');
  const [allUsers,setAllUsers]=useState<any[]>([]); const [userSearch,setUserSearch]=useState('');
  const [verifyFile,setVerifyFile]=useState<File|null>(null); const [uploadingVerify,setUploadingVerify]=useState(false);
  const [shops,setShops]=useState<any[]>([]); const [shopName,setShopName]=useState(''); const [ownerPhoneInput,setOwnerPhoneInput]=useState(''); const [driverPhoneInput,setDriverPhoneInput]=useState('');
  const [myShopProfile,setMyShopProfile]=useState<any>(null); const [myShopProducts,setMyShopProducts]=useState<any[]>([]); const [myShopOrders,setMyShopOrders]=useState<any[]>([]);
  const [newProdName,setNewProdName]=useState(''); const [newProdPrice,setNewProdPrice]=useState(''); const [newProdDesc,setNewProdDesc]=useState(''); const [newProdFile,setNewProdFile]=useState<File|null>(null);
  const [marketShops,setMarketShops]=useState<any[]>([]); const [marketProducts,setMarketProducts]=useState<any[]>([]); const [selectedMarketShop,setSelectedMarketShop]=useState<any>(null); const [cart,setCart]=useState<any[]>([]); const [customerAddr,setCustomerAddr]=useState('');
  const ridesContainerRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[lang];
  const isAdmin = currentUser && isAdminPhone(currentUser.phone);

  const callAdmin = async (action:string, data:any={})=>{
    const res = await fetch(EDGE_URL, { method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'apikey': SUPABASE_ANON_KEY }, body: JSON.stringify({action,...data, adminPhone: currentUser?.phone, phone: currentUser?.phone}) });
    if(!res.ok) throw new Error(await res.text()); return res.json();
  };
  const syncCurrentUser = async ()=>{ try{ const cuStr = localStorage.getItem('vozime_current'); if(!cuStr) return; const cu = JSON.parse(cuStr); if(!cu?.id) return; const {data} = await supabase.from('users').select('*').eq('id', cu.id).single(); if(data){ const updated = {...cu, firstName: data.first_name||cu.firstName, lastName: data.last_name||cu.lastName, phone: data.phone||cu.phone, is_verified: data.is_verified, verification_photo_url: data.verification_photo_url, verified_at: data.verified_at, country_code: data.country_code, deleted_at: data.deleted_at }; localStorage.setItem('vozime_current', JSON.stringify(updated)); setCurrentUser(updated); } }catch{} };
  const fetchLocation = async ()=>{ setLocLoading(true); setLocDenied(false); if(navigator.geolocation){ navigator.geolocation.getCurrentPosition(async (pos)=>{ try{ const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&accept-language=en`); const data = await res.json(); setMyLocation({country: data.address?.country_code?.toUpperCase()||'GB', city: data.address?.city||data.address?.town||'Portsmouth'}); }catch{ tryIPLocation(); } finally{ setLocLoading(false); } }, ()=>{ tryIPLocation(); }, {enableHighAccuracy:true, timeout:8000}); } else { tryIPLocation(); } };
  const tryIPLocation = async ()=>{ try{ const res = await fetch('https://ipapi.co/json/'); const data = await res.json(); if(data.city) setMyLocation({country: data.country_code||'GB', city: data.city}); else {setMyLocation(null); setLocDenied(true);} }catch{ setMyLocation(null); setLocDenied(true); } finally{ setLocLoading(false); } };
  const loadMaintenance = async ()=>{ const {data} = await supabase.from('site_settings').select('*').eq('id',1).single(); if(data) setMaintenance({enabled:data.maintenance_enabled, msg:data.maintenance_msg||''}); };
  const loadBans = async ()=>{ const {data} = await supabase.from('bans').select('*').order('created_at',{ascending:false}); if(data) setBans(data.map((b:any)=>({id:b.id, phone:b.phone, originalPhone:b.original_phone, reason:b.reason, until:b.until, bannedBy:b.banned_by, createdAt:b.created_at}))); };
  const loadReports = async ()=>{ const {data} = await supabase.from('reports').select('*').eq('status','open').order('created_at',{ascending:false}); if(data) setReports(data.map((r:any)=>({id:r.id, rideId:r.ride_id, reportedPhone:r.reported_phone, reportedName:r.reported_name, from:r.from_city, to:r.to_city, reason:r.reason, reporterPhone:r.reporter_phone, reporterName:r.reporter_name, createdAt:r.created_at}))); };
  const loadRides = async ()=>{ const cutoff = Date.now() - 48*60*60*1000; const {data} = await supabase.from('rides').select('*').gt('created_at', cutoff).order('created_at',{ascending:true}); if(data) setRides(data.map((d:any)=>({id:d.id, driverName:d.driver_name, driverPhone:d.driver_phone, driverId:d.driver_id, from:d.from_city, to:d.to_city, fromCountry:d.from_country||'BG', toCountry:d.to_country||'BG', time:d.time, date:d.date, seats:d.seats, message:d.message, createdAt:d.created_at, type:d.type||'offer', carInfo:d.car_info, isDriverVerified:d.is_driver}))); };
  const loadAllUsers = async ()=>{ const {data} = await supabase.from('users').select('*').order('first_name',{ascending:true}).limit(1000); if(data) setAllUsers(data); }
  const loadShops = async ()=>{ const {data}=await supabase.from('shops').select('*').order('created_at',{ascending:false}); if(data){ setShops(data); setMarketShops(data); } };
  const loadMyShopProfile = async ()=>{
    if(!currentUser?.phone) return;
    const {data}=await supabase.from('shop_profiles').select('*').eq('phone', currentUser.phone).maybeSingle();
    if(data){ setMyShopProfile(data); const {data:prods}=await supabase.from('products').select('*').eq('shop_id', data.shop_id); if(prods) setMyShopProducts(prods); const {data:ords}=await supabase.from('orders').select('*').eq('shop_id', data.shop_id).order('created_at',{ascending:false}); if(ords) setMyShopOrders(ords); }
  };
  const addShop = async ()=>{
    if(!shopName ||!ownerPhoneInput){ alert('Име и телефон!'); return; }
    const {data,error}=await supabase.from('shops').insert({name:shopName, slug:shopName.toLowerCase().replace(/\s+/g,'-')+'-'+Date.now(), city:'Sofia', phone:ownerPhoneInput, delivery_fee:4.99, vip_active:true}).select().single();
    if(error){ alert(error.message); return; }
    await supabase.from('shop_profiles').insert([{phone:ownerPhoneInput, role:'shop_owner', shop_id:data.id}]);
    if(driverPhoneInput) await supabase.from('shop_profiles').insert([{phone:driverPhoneInput, role:'driver', shop_id:data.id}]);
    setShopName(''); setOwnerPhoneInput(''); setDriverPhoneInput(''); await loadShops();
  };
  const addProductWithImage = async ()=>{
    if(!myShopProfile?.shop_id ||!newProdName ||!newProdPrice){ alert('Име и цена!'); return; }
    let imageUrl = null;
    if(newProdFile){
      const fileName = `${myShopProfile.shop_id}_${Date.now()}_${newProdFile.name}`;
      const {error:upErr}=await supabase.storage.from('product-images').upload(fileName, newProdFile);
      if(upErr){ alert(upErr.message); return; }
      const {data:urlData}=supabase.storage.from('product-images').getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }
    const {error}=await supabase.from('products').insert({shop_id:myShopProfile.shop_id, name:newProdName, price:parseFloat(newProdPrice), description:newProdDesc, image_url:imageUrl, active:true});
    if(error){ alert(error.message); return; }
    setNewProdName(''); setNewProdPrice(''); setNewProdDesc(''); setNewProdFile(null);
    const {data:prods}=await supabase.from('products').select('*').eq('shop_id', myShopProfile.shop_id); if(prods) setMyShopProducts(prods);
  };
  const deleteProduct = async (id:string)=>{ await supabase.from('products').delete().eq('id',id); setMyShopProducts(myShopProducts.filter(p=>p.id!==id)); };
  const loadMarketProducts = async (shopId:string)=>{ const {data}=await supabase.from('products').select('*').eq('shop_id', shopId).eq('active', true); if(data) setMarketProducts(data); setSelectedMarketShop(marketShops.find(s=>s.id===shopId)); };
  const placeOrder = async ()=>{
    if(!selectedMarketShop || cart.length===0 ||!customerAddr){ alert('Адрес и количка!'); return; }
    const total = cart.reduce((sum:any,i:any)=>sum+parseFloat(i.price),0) + parseFloat(selectedMarketShop.delivery_fee||4.99);
    const {error}=await supabase.from('orders').insert({shop_id:selectedMarketShop.id, customer_phone:currentUser.phone, customer_name:`${currentUser.firstName} ${currentUser.lastName}`, address:customerAddr, items:cart, total, status:'new'});
    if(error){ alert(error.message); return; }
    alert('Поръчка изпратена! Магазинерът и шофьорът я виждат в Моите.');
    setCart([]); setCustomerAddr('');
  };
  const updateOrderStatus = async (orderId:string, status:string)=>{ await supabase.from('orders').update({status}).eq('id',orderId); const {data:ords}=await supabase.from('orders').select('*').eq('shop_id', myShopProfile.shop_id).order('created_at',{ascending:false}); if(ords) setMyShopOrders(ords); };

  useEffect(()=>{ const savedLang = localStorage.getItem('vozime_lang') as 'bg'|'en'; if(savedLang) setLang(savedLang); const cu=localStorage.getItem('vozime_current'); if(cu) setCurrentUser(JSON.parse(cu)); syncCurrentUser(); loadRides(); loadMaintenance(); loadBans(); loadReports(); loadShops(); fetchLocation(); const interval = setInterval(()=>{ loadMaintenance(); loadBans(); loadReports(); loadRides(); loadShops(); syncCurrentUser(); if(isAdminPhone(JSON.parse(localStorage.getItem('vozime_current')||'{}').phone||'')) loadAllUsers(); }, 5000); return ()=> clearInterval(interval); },[]);
  useEffect(()=>{ if(currentUser) loadMyShopProfile(); if(currentUser && isAdmin) loadAllUsers(); },[currentUser]);
  useEffect(()=>{ localStorage.setItem('vozime_lang', lang); },[lang]);

  const handleAuth = async ()=>{
    if(!loginForm.firstName ||!loginForm.lastName ||!loginForm.phone){ alert(lang==='bg'?'Попълни всички полета':'Fill all fields'); return; }
    const cleanPhoneVal = loginForm.phone.replace(/[^0-9]/g,'').slice(-10);
    const countryCode = getCountryByPhone(loginForm.phone);
    if(loginTab==='register'){
      const {data:existing} = await supabase.from('users').select('*').eq('clean_phone', cleanPhoneVal).maybeSingle();
      if(existing){ if(existing.deleted_at){ await supabase.from('users').update({deleted_at:null, first_name:loginForm.firstName.trim(), last_name:loginForm.lastName.trim(), phone:loginForm.phone.trim()}).eq('id',existing.id); const appUser = {id:existing.id, firstName:loginForm.firstName.trim(), lastName:loginForm.lastName.trim(), phone:loginForm.phone.trim(), is_verified:existing.is_verified, verification_photo_url:existing.verification_photo_url}; localStorage.setItem('vozime_current', JSON.stringify(appUser)); setCurrentUser(appUser); return; } alert(lang==='bg'?'Вече съществува! Влез.':'Already exists! Login.'); setLoginTab('login'); return; }
      const {data:inserted, error} = await supabase.from('users').insert({ first_name: loginForm.firstName.trim(), last_name: loginForm.lastName.trim(), phone: loginForm.phone.trim(), clean_phone: cleanPhoneVal, country_code: countryCode, is_verified: false, deleted_at: null }).select().single();
      if(error){ alert(error.message); return; } const appUser = {id:inserted.id, firstName:inserted.first_name, lastName:inserted.last_name, phone:inserted.phone, is_verified:false, country_code:countryCode}; localStorage.setItem('vozime_current', JSON.stringify(appUser)); setCurrentUser(appUser);
    } else {
      const {data:found} = await supabase.from('users').select('*').eq('clean_phone', cleanPhoneVal).maybeSingle();
      if(!found){ alert(lang==='bg'?'Няма акаунт! Регистрирай се.':'No account! Register.'); setLoginTab('register'); return; }
      if(found.deleted_at && (Date.now() - Number(found.deleted_at) > 6*30*24*60*60*1000)){ alert(lang==='bg'?'Акаунтът е изтрит преди повече от 6 месеца. Регистрирай се наново.':'Account deleted over 6 months ago. Register again.'); await supabase.from('users').delete().eq('id',found.id); setLoginTab('register'); return; }
      if(found.deleted_at){ await supabase.from('users').update({deleted_at:null}).eq('id',found.id); }
      const appUser = {id:found.id, firstName:found.first_name, lastName:found.last_name, phone:found.phone, is_verified:found.is_verified, verification_photo_url:found.verification_photo_url, country_code:found.country_code, verified_at:found.verified_at};
      localStorage.setItem('vozime_current', JSON.stringify(appUser)); setCurrentUser(appUser);
    }
  };
  const handleVerificationUpload = async ()=>{ if(!verifyFile ||!currentUser) return; setUploadingVerify(true); try{ const fileName = `${currentUser.id}_${Date.now()}.jpg`; const {error:upErr} = await supabase.storage.from('verifications').upload(fileName, verifyFile); if(upErr) throw upErr; const {data:urlData} = supabase.storage.from('verifications').getPublicUrl(fileName); await supabase.from('users').update({verification_photo_url:urlData.publicUrl, is_verified:false, verification_status:'pending'}).eq('id',currentUser.id); alert(t.photoSent); setVerifyFile(null); await syncCurrentUser(); }catch(e:any){ alert(e.message); } finally{ setUploadingVerify(false); } }
  const handleDeleteAccount = async ()=>{ if(!confirm(lang==='bg'?'Сигурен ли си?':'Are you sure?')) return; try{ await supabase.from('users').update({deleted_at: Date.now()}).eq('id', currentUser.id); }catch{} localStorage.removeItem('vozime_current'); setCurrentUser(null); };
  const logout=()=>{localStorage.removeItem('vozime_current');setCurrentUser(null); setTab('find'); setStaticPage(null);};
  const isBanned = (phone:string)=>{ const now=Date.now(); return bans.find(b=> b.phone===clean(phone) && (b.until==='forever' || Number(b.until)>now)); };
  const currentBanned = currentUser? isBanned(currentUser.phone) : null;
  const carFilled = offerForm.carBrand.trim() && offerForm.carColor.trim() && offerForm.carReg.trim();
  const seatsFilled = offerForm.seats.trim() && parseInt(offerForm.seats)>0;
  const isVerified = currentUser?.is_verified || isAdmin;
  const canPublish = offerForm.from.trim() && offerForm.to.trim() && seatsFilled && (offerForm.type==='request' || (carFilled && offerForm.isDriver)) &&!currentBanned && isVerified;
  const toggleMaintenance = async ()=>{ const ne=!maintenance.enabled; try{ await callAdmin('maintenance',{enabled:ne, msg:maintenance.msg}); setMaintenance({...maintenance,enabled:ne}); }catch(e:any){ alert(e.message); } };
  const updateMaintenanceMsg = async (msg:string)=>{ setMaintenance({...maintenance,msg}); try{ await callAdmin('maintenance',{enabled:maintenance.enabled, msg}); }catch{} };
  const publishRide= async ()=>{ if(!isVerified){ alert(t.needVerify); setTab('my'); return; } if(currentBanned){ alert(`${t.banned}: ${currentBanned.reason}`); return; } if(!canPublish){alert(lang==='bg'?'Попълни всички *!':'Fill all *!');return;} const id = editingRide||Date.now().toString(); const existingCreated = editingRide? (rides.find(r=>r.id===editingRide)?.createdAt || Date.now()) : Date.now(); const row:any = {id, driver_name:`${currentUser.firstName} ${currentUser.lastName}`, driver_phone:currentUser.phone, driver_id:currentUser.id, from_city:offerForm.from, to_city:offerForm.to, time:offerForm.time, return_time:offerForm.returnTime, date:lang==='bg'?'Днес':'Today', seats:parseInt(offerForm.seats)||1, message:offerForm.message, created_at:existingCreated, type:offerForm.type, is_driver:offerForm.isDriver, car_brand:offerForm.carBrand, car_color:offerForm.carColor, car_reg:offerForm.carReg.toUpperCase(), car_info:`${offerForm.carBrand} ${offerForm.carColor} ${offerForm.carReg.toUpperCase()}`, from_country:offerForm.fromCountry, to_country:offerForm.toCountry}; try{ if(editingRide){ await callAdmin('update_ride',{ride_id:editingRide, newData:row}); } else { await supabase.from('rides').insert(row); } setEditingRide(null); await loadRides(); setTab('find'); }catch(e:any){ alert('Грешка: '+e.message); } };
  const deleteRide = async (id:string)=>{ try{ const ride = rides.find(r=>r.id===id); const isOwner = ride && (ride.driverId===currentUser.id || ride.driverPhone===currentUser.phone || clean(ride.driverPhone)===clean(currentUser.phone)); if(isOwner || isAdmin){ if(isOwner){ const {error} = await supabase.from('rides').delete().eq('id', id); if(error) throw error; } else { await callAdmin('delete_ride',{ride_id:id}); } } else { alert(lang==='bg'?'Нямаш право!':'No permission!'); return; } await loadRides(); }catch(e:any){ alert(e.message); } }
  const approveUser = async (uid:string)=>{ await supabase.from('users').update({is_verified:true, verification_status:'verified', verified_at: Date.now()}).eq('id',uid); await loadAllUsers(); if(uid===currentUser?.id){ await syncCurrentUser(); } }
  const getFlag = (c:string)=>COUNTRIES.find(x=>x.code===c)?.name.split(' ')[0]||'🏳️';
  const cleanPhone = (p:string)=> p.replace(/[^0-9+]/g,''); const waPhone = (p:string)=> p.replace(/[^0-9]/g,'');
  const handleReport = async (ride:any)=>{ const reason = prompt(lang==='bg'?'Причина:':'Reason:'); if(!reason) return; const newReport = {id:Date.now().toString(), ride_id:ride.id, reported_phone:ride.driverPhone, reported_name:ride.driverName, from_city:ride.from, to_city:ride.to, reason, reporter_phone:currentUser?.phone||'anon', reporter_name:currentUser?`${currentUser.firstName} ${currentUser.lastName}`:'Anon', created_at:Date.now(), status:'open'}; await supabase.from('reports').insert(newReport); setReports([ {...newReport, reportedPhone:newReport.reported_phone, reportedName:newReport.reported_name, from:newReport.from_city, to:newReport.to_city, reporterPhone:newReport.reporter_phone, reporterName:newReport.reporter_name, createdAt:newReport.created_at} as any,...reports]); alert(lang==='bg'?'Доклад изпратен!':'Report sent!'); };
  const handleBan = async (phone:string, reason:string, duration:string)=>{ try{ await callAdmin('ban',{original_phone:phone, reason, duration}); await loadBans(); setBanPhoneInput(''); setBanReasonInput(''); }catch(e:any){ alert(e.message); } };
  const unban = async (id:string)=>{ try{ await callAdmin('unban',{ban_id:id}); setBans(bans.filter(b=>b.id!==id)); }catch(e:any){ alert(e.message); } };
  const dismissReport = async (id:string)=>{ try{ await callAdmin('dismiss_report',{report_id:id, status:'dismissed'}); setReports(reports.filter(r=>r.id!==id)); }catch(e:any){ alert(e.message); } };
  const banFromReport = async (rep:any, dur:string)=>{ await handleBan(rep.reportedPhone||rep.reported_phone, `Репорт: ${rep.reason}`, dur); try{ await callAdmin('dismiss_report',{report_id:rep.id, status:'banned'}); setReports(reports.filter(r=>r.id!==rep.id)); }catch{} };
  const filteredRides = rides.filter(r=>{ if(filterText &&!(r.from.toLowerCase().includes(filterText.toLowerCase())||r.to.toLowerCase().includes(filterText.toLowerCase()))) return false; if(filterType && r.type!==filterType) return false; return true;});
  const filteredUsers = allUsers.filter(u=>{ if(!userSearch) return true; const s = userSearch.toLowerCase(); return (u.first_name?.toLowerCase().includes(s) || u.last_name?.toLowerCase().includes(s) || u.phone?.includes(s) || u.clean_phone?.includes(s)); }).sort((a,b)=>{ const ca = a.country_code||getCountryByPhone(a.phone||''); const cb = b.country_code||getCountryByPhone(b.phone||''); if(ca!==cb) return ca.localeCompare(cb); return (a.first_name||'').localeCompare(b.first_name||''); })

  if(maintenance.enabled &&!isAdmin){ return (<main style={{height:'100dvh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0F4C75',color:'white',padding:'20px',textAlign:'center'}}><div><div style={{fontSize:'60px'}}>🔧</div><div style={{fontSize:'24px',fontWeight:'bold',marginTop:'10px'}}>{t.maintenanceTitle}</div></div></main>); }
  if(!currentUser){
    return (
      <main style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'#0F4C75',padding:'16px'}}>
        <div style={{background:'white',padding:'20px',borderRadius:'24px',width:'100%',maxWidth:'380px'}}>
          <div style={{fontWeight:'800',fontSize:'22px',color:'#16486B'}}>🌍 VoziMe.bg</div>
          <input placeholder={t.firstName} value={loginForm.firstName} onChange={e=>setLoginForm({...loginForm,firstName:e.target.value})} style={{width:'100%',padding:'12px',marginTop:'10px',borderRadius:'10px',border:'1px solid #ddd'}}/>
          <input placeholder={t.lastName} value={loginForm.lastName} onChange={e=>setLoginForm({...loginForm,lastName:e.target.value})} style={{width:'100%',padding:'12px',marginTop:'10px',borderRadius:'10px',border:'1px solid #ddd'}}/>
          <input placeholder={t.phone} value={loginForm.phone} onChange={e=>setLoginForm({...loginForm,phone:e.target.value})} style={{width:'100%',padding:'12px',marginTop:'10px',borderRadius:'10px',border:'1px solid #ddd'}}/>
          <button onClick={handleAuth} style={{width:'100%',padding:'14px',marginTop:'12px',background:'#3DD68C',border:'none',borderRadius:'12px',fontWeight:'bold'}}>{loginTab==='login'?t.loginBtn:t.regBtn}</button>
        </div>
      </main>
    );
  }
  if(staticPage){ const content = STATIC_CONTENT[lang][staticPage]; return (<main style={{height:'100dvh',width:'100%',maxWidth:'480px',margin:'0 auto',background:'white',display:'flex',flexDirection:'column'}}><header style={{height:'56px',background:'#0F4C75',color:'white',display:'flex',alignItems:'center',padding:'0 12px',gap:'10px'}}><button onClick={()=>setStaticPage(null)} style={{background:'white',color:'#0F4C75',border:'none',padding:'8px 14px',borderRadius:'8px',fontWeight:'bold'}}>{t.back}</button><div style={{fontWeight:'bold'}}>{t[staticPage]}</div></header><div style={{flex:1,overflowY:'auto',padding:'16px',whiteSpace:'pre-wrap'}}>{content}</div></main>) }

  return (
    <main style={{height:'100dvh',width:'100%',maxWidth:'480px',margin:'0 auto',background:'white',display:'flex',flexDirection:'column',overflow:'hidden',fontFamily:'-apple-system, sans-serif'}}>
      <div style={{flexShrink:0}}>
        <div style={{background:maintenance.enabled?'#FF3B30':'#0F4C75',color:'white',padding:'6px',textAlign:'center',fontSize:'10px'}}>{maintenance.enabled?'🔴 MAINTENANCE!':'🌍 VoziMe • Сигурна ✅'}</div>
        <header style={{height:'56px',background:'#0F4C75',color:'white',display:'flex',alignItems:'center',padding:'0 8px',gap:'6px'}}>
          <div style={{width:'32px',height:'32px',background:isAdmin?'#FFD60A':'#2ECC71',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center'}}>{isAdmin?'👑':'🌍'}</div>
          <div style={{flex:1}}><div style={{fontWeight:'bold',fontSize:'13px'}}>{myLocation?.city||'VoziMe'} {isAdmin&&'👑'} {currentUser.is_verified&&'✅'}</div><div style={{fontSize:'9px'}}>{t.siteFree}</div></div>
          <button onClick={logout} style={{fontSize:'10px',background:'#FF3B30',border:'none',color:'white',padding:'5px 10px',borderRadius:'12px',fontWeight:'bold'}}>{t.exit}</button>
        </header>
        <div style={{height:'52px',display:'flex',gap:'4px',padding:'6px',background:'#f1f3f4',overflowX:'auto'}}>
          <button onClick={()=>setTab('find')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:tab==='find'?'#0F4C75':'white',color:tab==='find'?'white':'#666',fontSize:'11px'}}>{t.find}</button>
          <button onClick={()=>setTab('market')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:tab==='market'?'#22c55e':'white',color:tab==='market'?'white':'#666',fontSize:'11px'}}>🛒 Пазар</button>
          <button onClick={()=>setTab('my')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:tab==='my'?'#0F4C75':'white',color:tab==='my'?'white':'#666',fontSize:'11px'}}>{t.my}</button>
          <button onClick={()=>setTab('offer')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:tab==='offer'?'#2ECC71':'white',color:tab==='offer'?'#0F4C75':'#666',fontSize:'11px'}}>{t.offer}</button>
          {isAdmin && <button onClick={()=>setTab('shops')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:tab==='shops'?'#22c55e':'#22c55e',color:'white',fontSize:'10px'}}>👑 Магазини</button>}
        </div>
      </div>
      {tab==='find' && (<div style={{flexShrink:0,background:'white',padding:'8px 10px',borderBottom:'1px solid #e5e7eb',display:'flex',flexDirection:'column',gap:'8px'}}><div style={{background:'#e3f2fd',padding:'10px',borderRadius:'12px'}}><div style={{fontSize:'11px',fontWeight:'800'}}>{t.important}</div><div style={{fontSize:'11px'}}><b>{t.important1}</b> {t.important1b}<br/><b>{t.important2}</b> {t.important2b}</div></div><div style={{display:'flex',gap:'6px'}}><button onClick={()=>setFilterType('')} style={{flex:1,padding:'8px',borderRadius:'8px',border:'none',fontWeight:'bold',background:filterType===''?'#0F4C75':'white',color:filterType===''?'white':'#666'}}>Всички</button><button onClick={()=>setFilterType('offer')} style={{flex:1,padding:'8px',borderRadius:'8px',border:'none',background:filterType==='offer'?'#2ECC71':'white'}}>🚗 Шофьори</button><button onClick={()=>setFilterType('request')} style={{flex:1,padding:'8px',borderRadius:'8px',border:'none',background:filterType==='request'?'#FFD60A':'white'}}>🙋 Пътници</button></div><input placeholder={t.search} value={filterText} onChange={e=>setFilterText(e.target.value)} style={{padding:'10px',borderRadius:'10px',border:'1px solid #ddd',width:'100%'}}/></div>)}
      <div style={{flex:1,overflowY:'auto',background:'#f9fafb'}} ref={ridesContainerRef}>
        {tab==='market' && (
          <div style={{padding:'10px',display:'flex',flexDirection:'column',gap:'10px'}}>
            {!selectedMarketShop? (
              <>
                <div style={{background:'#22c55e',color:'white',padding:'12px',borderRadius:'12px'}}><b>🛒 Пазар - Магазини в VoziMe</b><div style={{fontSize:'11px'}}>Доставката се плаща на магазина, не на VoziMe. VoziMe взима 0%.</div></div>
                {marketShops.map((s:any)=><div key={s.id} onClick={()=>loadMarketProducts(s.id)} style={{background:'white',border:'2px solid #22c55e',borderRadius:'12px',padding:'12px',cursor:'pointer'}}><b>{s.name}</b> - {s.city}<br/><span style={{fontSize:'11px'}}>Доставка {s.delivery_fee}лв при магазина</span><div style={{fontSize:'11px',color:'#22c55e',fontWeight:'bold'}}>Виж продуктите →</div></div>)}
              </>
            ) : (
              <>
                <button onClick={()=>{setSelectedMarketShop(null); setMarketProducts([]); setCart([]);}} style={{padding:'8px',borderRadius:'8px',border:'1px solid #ddd',background:'white'}}>← Назад</button>
                <div style={{background:'#0F4C75',color:'white',padding:'12px',borderRadius:'12px'}}><b>{selectedMarketShop.name}</b><br/><span style={{fontSize:'11px'}}>Доставка {selectedMarketShop.delivery_fee}лв - при магазина</span></div>
                {marketProducts.map((p:any)=><div key={p.id} style={{background:'white',borderRadius:'12px',padding:'10px',display:'flex',gap:'10px',border:'1px solid #eee'}}>{p.image_url && <img src={p.image_url} style={{width:'60px',height:'60px',objectFit:'cover',borderRadius:'8px'}}/>}<div style={{flex:1}}><b>{p.name}</b><br/><span style={{fontSize:'11px'}}>{p.description||''}</span><br/><b>{p.price}лв</b></div><button onClick={()=>setCart([...cart,p])} style={{background:'#22c55e',color:'white',border:'none',padding:'8px 12px',borderRadius:'8px'}}>Добави</button></div>)}
                {cart.length>0 && <div style={{background:'white',border:'2px solid #22c55e',borderRadius:'12px',padding:'12px'}}><b>🛒 Количка - {cart.length}</b>{cart.map((c:any,i:any)=><div key={i} style={{fontSize:'12px',display:'flex',justifyContent:'space-between'}}><span>{c.name}</span><span>{c.price}лв</span></div>)}<div style={{borderTop:'1px solid #eee',marginTop:'8px',paddingTop:'8px',fontWeight:'bold'}}>Общо: {(cart.reduce((s:any,x:any)=>s+parseFloat(x.price),0)+parseFloat(selectedMarketShop.delivery_fee)).toFixed(2)}лв</div><input value={customerAddr} onChange={e=>setCustomerAddr(e.target.value)} placeholder="Адрес: ул. Люлин 5" style={{width:'100%',padding:'10px',marginTop:'8px',borderRadius:'8px',border:'1px solid #ddd'}}/><button onClick={placeOrder} style={{width:'100%',marginTop:'8px',padding:'12px',background:'#22c55e',color:'white',border:'none',borderRadius:'8px',fontWeight:'bold'}}>Поръчай - плаща се на магазина</button></div>}
              </>
            )}
          </div>
        )}
        {tab==='find' && (<div style={{padding:'10px',display:'flex',flexDirection:'column',gap:'10px'}}>{filteredRides.map((r:any)=>{ const banned = isBanned(r.driverPhone); const isReq = r.type==='request'; return (<div key={r.id} style={{border: banned?'2px solid #FF3B30':isReq?'2px solid #FFD60A':'2px solid #2ECC71',borderRadius:'14px',padding:'12px',background: banned?'#ffeaea':isReq?'#fffbe6':'#f0fdf4'}}><div style={{display:'flex',justifyContent:'space-between'}}><b>{getFlag(r.fromCountry)} {r.from} → {getFlag(r.toCountry)} {r.to}</b><span style={{background:isReq?'#FFD60A':'#2ECC71',color:isReq?'black':'white',fontSize:'9px',padding:'3px 8px',borderRadius:'12px',fontWeight:'bold'}}>{isReq?'🙋 ТЪРСИ':'🚗 ПРЕДЛАГА'}</span></div><div style={{fontSize:'11px',marginTop:'4px'}}>{r.driverName} • {r.seats} места • {r.carInfo} • {r.time}</div><div style={{marginTop:'10px',background:'white',borderRadius:'10px',padding:'8px',border:'1px solid #ddd'}}><div style={{fontSize:'12px',fontWeight:'bold',marginBottom:'8px'}}>{r.driverName} • {r.driverPhone}</div><div style={{display:'flex',gap:'5px'}}><a href={`tel:${cleanPhone(r.driverPhone)}`} style={{flex:1,background:'#0F4C75',color:'white',padding:'10px',borderRadius:'8px',textAlign:'center',fontWeight:'bold',textDecoration:'none',fontSize:'11px'}}>{t.call}</a><a href={`https://wa.me/${waPhone(r.driverPhone)}`} target="_blank" style={{flex:1,background:'#25D366',color:'white',padding:'10px',borderRadius:'8px',textAlign:'center',fontWeight:'bold',textDecoration:'none',fontSize:'11px'}}>WhatsApp</a></div></div></div>)})}</div>)}
        {tab==='shops' && isAdmin && (
          <div style={{padding:'10px',display:'flex',flexDirection:'column',gap:'12px'}}>
            <div style={{background:'#22c55e',color:'white',padding:'12px',borderRadius:'12px'}}><b>👑 Админ Магазини - само +447935463970</b></div>
            <div style={{background:'white',border:'2px solid #22c55e',borderRadius:'12px',padding:'12px'}}>
              <input value={shopName} onChange={e=>setShopName(e.target.value)} placeholder="Име: Месарница Иван" style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1px solid #ddd',marginTop:'8px'}}/>
              <input value={ownerPhoneInput} onChange={e=>setOwnerPhoneInput(e.target.value)} placeholder="Собственик: 0888123456" style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1px solid #ddd',marginTop:'8px'}}/>
              <input value={driverPhoneInput} onChange={e=>setDriverPhoneInput(e.target.value)} placeholder="Шофьор: 0888777888" style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1px solid #ddd',marginTop:'8px'}}/>
              <button onClick={addShop} style={{width:'100%',marginTop:'10px',padding:'12px',background:'#22c55e',color:'white',border:'none',borderRadius:'8px',fontWeight:'bold'}}>СЪЗДАЙ МАГАЗИН</button>
            </div>
            {shops.map((s:any)=><div key={s.id} style={{background:'white',padding:'10px',borderRadius:'8px',border:'1px solid #eee'}}><b>{s.name}</b> - {s.phone}</div>)}
          </div>
        )}
        {tab==='my' && (
          <div style={{padding:'10px',display:'flex',flexDirection:'column',gap:'12px'}}>
            {myShopProfile && myShopProfile.role==='shop_owner' && (
              <div style={{background:'white',border:'2px solid #22c55e',borderRadius:'12px',padding:'12px'}}>
                <div style={{fontWeight:'bold'}}>🛒 Моят магазин - {marketShops.find(s=>s.id===myShopProfile.shop_id)?.name||'Магазин'} - собственик си</div>
                <div style={{fontSize:'11px',marginTop:'4px'}}>Добави лист със стоки + снимки. Клиентите ги виждат в 🛒 Пазар веднага.</div>
                <input value={newProdName} onChange={e=>setNewProdName(e.target.value)} placeholder="Име: Кайма 1кг" style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1px solid #ddd',marginTop:'8px'}}/>
                <input value={newProdPrice} onChange={e=>setNewProdPrice(e.target.value)} placeholder="Цена: 12.50" style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1px solid #ddd',marginTop:'8px'}}/>
                <input value={newProdDesc} onChange={e=>setNewProdDesc(e.target.value)} placeholder="Описание: прясно мляно" style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1px solid #ddd',marginTop:'8px'}}/>
                <input type="file" accept="image/*" onChange={e=>setNewProdFile(e.target.files?.[0]||null)} style={{width:'100%',marginTop:'8px'}}/>
                <button onClick={addProductWithImage} style={{width:'100%',marginTop:'8px',padding:'12px',background:'#22c55e',color:'white',border:'none',borderRadius:'8px',fontWeight:'bold'}}>➕ Добави продукт със снимка</button>
                <div style={{marginTop:'12px'}}>{myShopProducts.map((p:any)=><div key={p.id} style={{display:'flex',gap:'8px',alignItems:'center',borderBottom:'1px solid #eee',padding:'8px 0'}}>{p.image_url && <img src={p.image_url} style={{width:'40px',height:'40px',objectFit:'cover',borderRadius:'6px'}}/>}<span style={{flex:1, fontSize:'12px'}}>{p.name} - {p.price}лв</span><button onClick={()=>deleteProduct(p.id)} style={{background:'#FF3B30',color:'white',border:'none',padding:'6px 10px',borderRadius:'6px'}}>🗑️</button></div>)}</div>
                <div style={{marginTop:'12px',background:'#e6f9ed',padding:'10px',borderRadius:'8px'}}><b>Поръчки за моя магазин - {myShopOrders.length}</b>{myShopOrders.map((o:any)=><div key={o.id} style={{background:'white',padding:'8px',borderRadius:'6px',marginTop:'6px',fontSize:'11px'}}><b>{o.customer_name} - {o.customer_phone}</b><br/>{o.address}<br/>Тотал: {o.total}лв - {o.status}<br/>{o.items?.map((it:any)=>it.name).join(', ')}<div style={{display:'flex',gap:'6px',marginTop:'6px'}}><button onClick={()=>updateOrderStatus(o.id,'accepted')} style={{background:'#0F4C75',color:'white',border:'none',padding:'4px 8px',borderRadius:'6px'}}>Приеми</button><button onClick={()=>updateOrderStatus(o.id,'delivered')} style={{background:'#22c55e',color:'white',border:'none',padding:'4px 8px',borderRadius:'6px'}}>Доставено</button></div></div>)}</div>
              </div>
            )}
            {myShopProfile && myShopProfile.role==='driver' && (
              <div style={{background:'white',border:'2px solid #0F4C75',borderRadius:'12px',padding:'12px'}}>
                <div style={{fontWeight:'bold'}}>🚚 Моите доставки - шофьор си към {marketShops.find(s=>s.id===myShopProfile.shop_id)?.name||myShopProfile.shop_id.slice(0,8)}</div>
                <div style={{fontSize:'11px',marginTop:'4px'}}>Получаваш поръчки от магазина към който те е добавил админа. Доставката 4.99лв отива при магазина.</div>
                <div style={{marginTop:'10px'}}>{myShopOrders.map((o:any)=><div key={o.id} style={{background:'#f9fafb',border:'1px solid #0F4C75',padding:'10px',borderRadius:'8px',marginBottom:'8px',fontSize:'12px'}}><b>Поръчка {o.id.slice(0,8)}</b> - {o.status}<br/>{o.customer_name} - {o.customer_phone}<br/>📍 {o.address}<br/>🛒 {o.items?.map((it:any)=>it.name).join(', ')}<br/><b>Тотал {o.total}лв (доставката при магазина)</b><div style={{display:'flex',gap:'6px',marginTop:'8px'}}><a href={`tel:${o.customer_phone}`} style={{flex:1,background:'#0F4C75',color:'white',padding:'8px',borderRadius:'6px',textAlign:'center',textDecoration:'none'}}>Обади се</a><button onClick={()=>updateOrderStatus(o.id,'on_the_way')} style={{flex:1,background:'#FFD60A',border:'none',padding:'8px',borderRadius:'6px',fontWeight:'bold'}}>Пътувам</button><button onClick={()=>updateOrderStatus(o.id,'delivered')} style={{flex:1,background:'#22c55e',color:'white',border:'none',padding:'8px',borderRadius:'6px',fontWeight:'bold'}}>Доставено</button></div></div>)}{myShopOrders.length===0 && <div style={{fontSize:'11px',color:'#666',textAlign:'center'}}>Няма поръчки за твоя магазин още.</div>}</div>
              </div>
            )}
            {!myShopProfile && <div style={{background:'white',padding:'12px',borderRadius:'12px',fontSize:'12px',color:'#666'}}>Нямаш магазин. Админът трябва да те добави по телефон в 👑 Магазини. След това влез пак и тук ще видиш твоя панел.</div>}
            <div style={{background:'white',border:'1px solid #ddd',borderRadius:'12px',padding:'12px'}}><b>Моите пътувания</b>{rides.filter(r=> r.driverId===currentUser?.id || r.driverPhone===currentUser?.phone || clean(r.driverPhone)===clean(currentUser?.phone)).map((r:any)=><div key={r.id} style={{borderTop:'1px solid #eee',padding:'8px 0',fontSize:'12px'}}><b>{r.from} → {r.to} • {r.time}</b> <button onClick={()=>deleteRide(r.id)} style={{float:'right',background:'#FF3B30',color:'white',border:'none',padding:'4px 8px',borderRadius:'6px'}}>🗑️</button></div>)}</div>
          </div>
        )}
        {tab==='offer' && (<div style={{padding:'12px',display:'flex',flexDirection:'column',gap:'10px'}}><div style={{display:'flex',gap:'6px',background:'#f1f3f4',padding:'3px',borderRadius:'12px'}}><button onClick={()=>setOfferForm({...offerForm,type:'offer'})} style={{flex:1,padding:'10px',borderRadius:'8px',border:'none',fontWeight:'bold',background:offerForm.type==='offer'?'#0F4C75':'white',color:offerForm.type==='offer'?'white':'#666'}}>🚗 Шофьор</button><button onClick={()=>setOfferForm({...offerForm,type:'request'})} style={{flex:1,padding:'10px',borderRadius:'8px',border:'none',fontWeight:'bold',background:offerForm.type==='request'?'#FFD60A':'white',color:offerForm.type==='request'?'black':'#666'}}>🙋 Пътник</button></div><div style={{display:'flex',gap:'6px'}}><input placeholder={`От - London`} value={offerForm.from} onChange={e=>setOfferForm({...offerForm,from:e.target.value})} style={{flex:1,padding:'10px',borderRadius:'10px',border:'1px solid #ddd'}}/><input placeholder={`До - Sofia`} value={offerForm.to} onChange={e=>setOfferForm({...offerForm,to:e.target.value})} style={{flex:1,padding:'10px',borderRadius:'10px',border:'1px solid #ddd'}}/></div><div style={{display:'flex',gap:'6px'}}><input type="time" value={offerForm.time} onChange={e=>setOfferForm({...offerForm,time:e.target.value})} style={{flex:1,padding:'10px',borderRadius:'10px',border:'1px solid #ddd'}}/><input placeholder={`Места - 4`} value={offerForm.seats} onChange={e=>setOfferForm({...offerForm,seats:e.target.value})} style={{flex:1,padding:'10px',borderRadius:'10px',border:'1px solid #ddd'}}/></div><button onClick={publishRide} disabled={!canPublish} style={{background:canPublish?'#2ECC71':'#ccc',padding:'14px',borderRadius:'10px',fontWeight:'bold',border:'none'}}>{canPublish? `Публикувай ${offerForm.from}→${offerForm.to}`:`Попълни всички *`}</button></div>)}
      </div>
    </main>
  );
}