import React, { useEffect, useState } from 'react';
import './buyers.css';
import { saveBuyerProfile } from '../../services/buyersService';
import { useAuth } from '../../context/AuthContext';

// Kerala districts and common taluks (extendable)
const KERALA_DISTRICTS = [
  'Thiruvananthapuram','Kollam','Pathanamthitta','Alappuzha','Kottayam','Idukki','Ernakulam','Thrissur','Palakkad','Malappuram','Kozhikode','Wayanad','Kannur','Kasaragod'
];
const TALUKS_BY_DISTRICT = {
  Thiruvananthapuram: ['Thiruvananthapuram','Neyyattinkara','Nedumangad','Kattakkada','Varkala','Chirayinkeezhu'],
  Kollam: ['Kollam','Kunnathoor','Karunagappally','Kottarakkara','Punalur','Pathanapuram'],
  Pathanamthitta: ['Adoor','Konni','Kozhencherry','Ranni','Thiruvalla','Mallappally'],
  Alappuzha: ['Alappuzha','Ambalappuzha','Cherthala','Chengannur','Karthikappally','Mavelikkara'],
  Kottayam: ['Changanassery','Kanjirappally','Kottayam','Vaikom','Meenachil','Ettumanoor'],
  Idukki: ['Devikulam','Peerumedu','Thodupuzha','Udumbanchola','Idukki'],
  Ernakulam: ['Aluva','Kochi','Kothamangalam','Muvattupuzha','North Paravur','Perumbavoor','Kanayannur'],
  Thrissur: ['Chalakudy','Chavakkad','Kodungallur','Kunnamkulam','Mukundapuram','Thalapilly','Thrissur'],
  Palakkad: ['Alathur','Chittur','Mannarkkad','Ottapalam','Palakkad','Pattambi'],
  Malappuram: ['Eranad','Kondotty','Nilambur','Perinthalmanna','Ponnani','Tirur','Tirurangadi'],
  Kozhikode: ['Kozhikode','Vadakara','Koyilandy','Thamarassery'],
  Wayanad: ['Mananthavady','Sulthan Bathery','Vythiri'],
  Kannur: ['Iritty','Kannur','Payyannur','Taliparamba','Thalassery'],
  Kasaragod: ['Hosdurg','Kasaragod','Manjeshwaram','Vellarikundu']
};

const BuyersProfile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', state: 'Kerala', district: '', taluk: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('buyer_profile') || '{}');
      setForm({ name: u.name || user?.name || '', email: u.email || user?.email || '', phone: u.phone || user?.phoneNumber || '', state: u.state || 'Kerala', district: u.district || '', taluk: u.taluk || '' });
    } catch {}
  }, [user]);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!/\S+@\S+\.\S+/.test(form.email || '')) return 'Valid email required';
    if (!/^\d{10}$/.test((form.phone || '').replace(/\D/g, '').slice(-10))) return 'Valid 10-digit phone required';
    if (!form.state) return 'Select state';
    if (!form.district) return 'Select district';
    if (!form.taluk) return 'Enter taluk';
    return '';
  };

  const save = async (e) => {
    e.preventDefault();
    setMessage('');
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    localStorage.setItem('buyer_profile', JSON.stringify(form));
    await saveBuyerProfile(form);
    setMessage('Profile saved');
  };

  const districts = form.state === 'Kerala' ? KERALA_DISTRICTS : [];
  const taluks = TALUKS_BY_DISTRICT[form.district] || [];

  return (
    <div className="buyers-container">
      <div className="buyers-header"><h1>Buyer Profile</h1></div>
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      <form className="buyers-form" onSubmit={save}>
        <label>Name</label>
        <input value={form.name} onChange={(e) => update('name', e.target.value)} />
        <label>Email</label>
        <input value={form.email} onChange={(e) => update('email', e.target.value)} />
        <label>Phone</label>
        <input value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        <label>State</label>
        <select value={form.state} onChange={(e) => update('state', e.target.value)}>
          <option value="Kerala">Kerala</option>
        </select>
        <label>District</label>
        <select value={form.district} onChange={(e) => update('district', e.target.value)} disabled={!form.state}>
          <option value="">Select district</option>
          {districts.map((d) => (<option key={d} value={d}>{d}</option>))}
        </select>
        <label>Taluk</label>
        <select value={form.taluk} onChange={(e) => update('taluk', e.target.value)} disabled={!form.district}>
          <option value="">Select taluk</option>
          {taluks.map((t) => (<option key={t} value={t}>{t}</option>))}
        </select>
        <button className="buyers-btn primary" type="submit">Save</button>
      </form>
    </div>
  );
};

export default BuyersProfile;


