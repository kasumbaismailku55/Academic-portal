import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { School as SchoolType, PaymentMethod } from '../../types';
import {
  Building,
  Mail,
  Phone,
  MapPin,
  KeyRound,
  UserCheck,
  Sparkles,
  X,
  CheckCircle2,
  Upload,
  Image,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Clock,
} from 'lucide-react';

interface SchoolSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Academic Crest Presets
const CREST_PRESETS = [
  {
    name: 'Gold Laurels',
    url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Royal Shield',
    url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Science & Wisdom',
    url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Torch of Learning',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=150&auto=format&fit=crop&q=80',
  },
];

export const SchoolSubscriptionModal: React.FC<SchoolSubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { subscribeNewSchool, navigateToSchool, superAdminPhone } = usePortal();

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [motto, setMotto] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [headteacherName, setHeadteacherName] = useState('');
  const [headteacherPassword, setHeadteacherPassword] = useState('');
  const [subscriptionPlan, setSubscriptionPlan] = useState<'Standard Academy' | 'Enterprise Campus'>('Enterprise Campus');
  const [subscriptionBilling, setSubscriptionBilling] = useState<'termly' | 'annual'>('annual');
  const [badgeUrl, setBadgeUrl] = useState('');

  // Payment states: 'form' | 'payment' | 'authorizing' | 'success'
  const [step, setStep] = useState<'form' | 'payment' | 'authorizing' | 'success'>('form');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mtn_momo');
  const [payerAccount, setPayerAccount] = useState('');
  const [simulatedPin, setSimulatedPin] = useState('');
  const [txnRef, setTxnRef] = useState('');
  const [createdSchool, setCreatedSchool] = useState<SchoolType | null>(null);

  if (!isOpen) return null;

  const amountUgx = subscriptionBilling === 'annual' ? 480000 : 180000;
  const amountUsd = subscriptionBilling === 'annual' ? 129 : 49;
  const formattedUgx = new Intl.NumberFormat('en-UG').format(amountUgx);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setBadgeUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !email || !headteacherName || !headteacherPassword) return;
    setPayerAccount(phone || '0786721142');
    setStep('payment');
  };

  const handleAuthorizePayment = () => {
    setStep('authorizing');
    const ref = `${paymentMethod === 'mtn_momo' ? 'MOMO' : paymentMethod === 'airtel_money' ? 'AIRTEL' : 'VISA'}-${Math.floor(100000 + Math.random() * 900000)}`;
    setTxnRef(ref);

    setTimeout(() => {
      // Create and save school
      const school = subscribeNewSchool({
        name,
        code: code.toUpperCase(),
        email,
        phone,
        address,
        motto: motto || 'Knowledge, Discipline, and Excellence',
        headteacherName,
        headteacherPassword,
        subscriptionPlan,
        subscriptionBilling,
        badgeUrl: badgeUrl || CREST_PRESETS[0].url,
        paymentMethod,
        payerPhoneOrCard: payerAccount,
      });

      setCreatedSchool(school);
      setStep('success');
    }, 1800);
  };

  const handleFinish = () => {
    if (createdSchool) {
      navigateToSchool(createdSchool.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: INSTITUTION DETAILS & BADGE UPLOAD */}
        {step === 'form' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Subscribe Your Institution
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Provision an isolated academic operating portal with custom gradebooks &amp; student namespaces
                </p>
              </div>
            </div>

            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Institution / School Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!code) {
                        const words = e.target.value.split(/\s+/).filter(Boolean);
                        const suggested = words.map((w) => w[0]).join('').slice(0, 4).toUpperCase();
                        setCode(suggested);
                      }
                    }}
                    placeholder="e.g. Kibuli Secondary School"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student Code Prefix *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. KBL"
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Codes: {code ? `${code}-S1-101` : 'PRE-S1-101'}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  School Motto / Tagline
                </label>
                <input
                  type="text"
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  placeholder="e.g. Knowledge, Discipline and Excellence"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Official School Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@school.ac.ug"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone / MoMo Contact *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+256 700 000 000"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* School Badge / Crest Section */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Image className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>School Badge &amp; Crest</span>
                  </label>
                  <label className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Custom Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  {badgeUrl ? (
                    <img src={badgeUrl} alt="Badge" className="w-12 h-12 rounded-2xl object-cover border border-indigo-500 shadow-sm shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {code || 'BADGE'}
                    </div>
                  )}
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Choose from standard academic crests below or upload your school's official PNG/JPG crest.
                  </div>
                </div>

                {/* Crest presets */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {CREST_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBadgeUrl(preset.url)}
                      className={`p-1.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                        badgeUrl === preset.url
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-8 h-8 rounded-lg object-cover" />
                      <span className="text-[9px] font-medium truncate w-full">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Headteacher Initial Credentials */}
              <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 dark:text-indigo-200">
                  <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Headteacher Master Administrator Account</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Headteacher Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={headteacherName}
                      onChange={(e) => setHeadteacherName(e.target.value)}
                      placeholder="e.g. Dr. Arthur Mugalu"
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Administrative Password *
                    </label>
                    <div className="relative">
                      <KeyRound className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={headteacherPassword}
                        onChange={(e) => setHeadteacherPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Plan & Billing */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Plan &amp; Duration Tier
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSubscriptionBilling('termly')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      subscriptionBilling === 'termly'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-600'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-xs font-bold">Termly Plan</span>
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono">UGX 180,000</span>
                    </div>
                    <div className="text-[10px] text-slate-500">3 Months full access ($49)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubscriptionBilling('annual')}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      subscriptionBilling === 'annual'
                        ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-600'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="absolute top-2 right-2 text-[8px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full uppercase">
                      Save 30%
                    </span>
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-xs font-bold">Annual Pass</span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">UGX 480,000</span>
                    </div>
                    <div className="text-[10px] text-slate-500">12 Months unlimited ($129)</div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Continue to Payment (UGX {formattedUgx})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: PAYMENT CHANNEL (MTN / AIRTEL / VISA TO 0786721142) */}
        {step === 'payment' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Payment Settlement &amp; Verification
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select payment channel. Funds are synced directly to merchant: <strong className="text-emerald-600 font-mono">{superAdminPhone}</strong> (Ismail Kasumba).
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-500">School: </span>
                <strong className="text-slate-900 dark:text-white">{name} ({code.toUpperCase()})</strong>
                <div className="text-slate-400 text-[11px]">{subscriptionBilling.toUpperCase()} plan · 17-pt A-Level &amp; AOI</div>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  UGX {formattedUgx}
                </span>
                <div className="text-[10px] text-slate-400 font-mono">(${amountUsd} USD)</div>
              </div>
            </div>

            {/* Channels */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('mtn_momo')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                  paymentMethod === 'mtn_momo'
                    ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-900 font-black text-[10px] flex items-center justify-center">
                  MTN
                </div>
                <span className="text-[11px]">MTN MoMo</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('airtel_money')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                  paymentMethod === 'airtel_money'
                    ? 'border-rose-600 bg-rose-600/10 ring-2 ring-rose-600 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-rose-600 text-white font-black text-[10px] flex items-center justify-center">
                  airtel
                </div>
                <span className="text-[11px]">Airtel Money</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('visa_card')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                  paymentMethod === 'visa_card'
                    ? 'border-indigo-600 bg-indigo-600/10 ring-2 ring-indigo-600 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px]">Visa / Card</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {paymentMethod === 'visa_card' ? 'Visa / Mastercard Number' : 'Payer Mobile Money Phone Number'} *
              </label>
              <input
                type="text"
                required
                value={payerAccount}
                onChange={(e) => setPayerAccount(e.target.value)}
                placeholder={paymentMethod === 'visa_card' ? '4000 1234 5678 9010' : '0772 123 456'}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                A USSD push prompt will be sent to this phone to authorize <strong>UGX {formattedUgx}</strong> to recipient <strong>{superAdminPhone}</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleAuthorizePayment}
                className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Authorize UGX {formattedUgx}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: AUTHORIZING SIMULATION */}
        {step === 'authorizing' && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-lg animate-pulse">
              <Clock className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Contacting Carrier Switch ({paymentMethod.toUpperCase()})...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                Dispatching payment prompt of <strong>UGX {formattedUgx}</strong> to merchant account <strong>{superAdminPhone}</strong> (Ismail Kasumba).
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS & LAUNCH */}
        {step === 'success' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Payment Confirmed &amp; Portal Provisioned!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                UGX {formattedUgx} successfully credited to <strong>{superAdminPhone}</strong> (Ismail Kasumba). Welcome to <strong>{createdSchool?.name}</strong>.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Institution:</span>
                <span className="font-bold text-slate-900 dark:text-white">{createdSchool?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Dedicated Portal URL:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded text-[11px]">
                  ?school={createdSchool?.slug}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Master Administrator:</span>
                <span className="font-semibold">{headteacherName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{txnRef}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Recipient:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{superAdminPhone} (Ismail Kasumba)</span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full max-w-md mx-auto py-3 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Launch Your Institutional Portal Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
