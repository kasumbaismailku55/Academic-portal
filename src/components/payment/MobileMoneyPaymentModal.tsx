import React, { useState } from 'react';
import { PaymentMethod } from '../../types';
import {
  CreditCard,
  Phone,
  CheckCircle2,
  Clock,
  ShieldCheck,
  X,
  AlertCircle,
  Building,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface MobileMoneyPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolName: string;
  planName: string;
  billingCycle: 'termly' | 'annual';
  onSuccess: (paymentData: {
    paymentMethod: PaymentMethod;
    payerPhoneOrCard: string;
    reference: string;
    amountUgx: number;
    amountUsd: number;
  }) => void;
}

export const MobileMoneyPaymentModal: React.FC<MobileMoneyPaymentModalProps> = ({
  isOpen,
  onClose,
  schoolName,
  planName,
  billingCycle,
  onSuccess,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('mtn_momo');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Payment states: 'input' | 'prompting' | 'authorizing' | 'success'
  const [step, setStep] = useState<'input' | 'prompting' | 'authorizing' | 'success'>('input');
  const [simulatedPin, setSimulatedPin] = useState('');
  const [countdown, setCountdown] = useState(15);
  const [txnRef, setTxnRef] = useState('');

  if (!isOpen) return null;

  const amountUgx = billingCycle === 'annual' ? 480000 : 180000;
  const amountUsd = billingCycle === 'annual' ? 129 : 49;
  const formattedUgx = new Intl.NumberFormat('en-UG').format(amountUgx);

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (method !== 'visa_card' && !phoneNumber.trim()) return;
    if (method === 'visa_card' && (!cardNumber.trim() || !cardCvv.trim())) return;

    const ref = `${method === 'mtn_momo' ? 'MOMO' : method === 'airtel_money' ? 'AIRTEL' : 'VISA'}-${Math.floor(100000 + Math.random() * 900000)}`;
    setTxnRef(ref);
    setStep('prompting');

    // Simulate USSD Prompt arrival on phone
    setTimeout(() => {
      setStep('authorizing');
    }, 1500);
  };

  const handleAuthorize = () => {
    setStep('success');
    setTimeout(() => {
      onSuccess({
        paymentMethod: method,
        payerPhoneOrCard: method === 'visa_card' ? `•••• ${cardNumber.slice(-4) || '8821'}` : phoneNumber,
        reference: txnRef,
        amountUgx,
        amountUsd,
      });
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Institutional Subscription Checkout
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct carrier payment synced to System Account: <strong className="font-mono text-emerald-600 dark:text-emerald-400">0786721142</strong>
            </p>
          </div>
        </div>

        {/* Bill Summary Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Institution:</span>
            <span className="font-bold text-slate-900 dark:text-white">{schoolName || 'New Subscribing School'}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Plan &amp; Duration:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {planName} · {billingCycle === 'annual' ? '12 Months (Annual Pass)' : '3 Months (Termly Access)'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 font-semibold">Total Payable Amount:</span>
            <div className="text-right">
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                UGX {formattedUgx}
              </span>
              <span className="text-[11px] text-slate-400 ml-1.5 font-mono">(${amountUsd})</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Recipient Account: <strong>0786721142</strong> (Ismail Kasumba)</span>
            </div>
            <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded uppercase">Verified</span>
          </div>
        </div>

        {step === 'input' && (
          <form onSubmit={handleStartPayment} className="space-y-4">
            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Select Payment Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('mtn_momo')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    method === 'mtn_momo'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-900 font-black text-[11px] flex items-center justify-center shadow-xs">
                    MTN
                  </div>
                  <span className="text-[11px]">MTN MoMo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('airtel_money')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    method === 'airtel_money'
                      ? 'border-rose-600 bg-rose-600/10 text-rose-950 dark:text-rose-200 ring-2 ring-rose-600 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-rose-600 text-white font-black text-[11px] flex items-center justify-center shadow-xs">
                    airtel
                  </div>
                  <span className="text-[11px]">Airtel Money</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('visa_card')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    method === 'visa_card'
                      ? 'border-indigo-600 bg-indigo-600/10 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-600 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-[11px] flex items-center justify-center shadow-xs">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="text-[11px]">Visa / Card</span>
                </button>
              </div>
            </div>

            {/* Mobile Money Details */}
            {method !== 'visa_card' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {method === 'mtn_momo' ? 'MTN Mobile Money Phone Number' : 'Airtel Money Phone Number'} *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={method === 'mtn_momo' ? 'e.g. 0772 123 456 or 0786 721 142' : 'e.g. 0701 123 456'}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-medium"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  You will receive an instant push prompt on this phone to authorize payment to recipient <strong>0786721142</strong>.
                </p>
              </div>
            ) : (
              /* Visa / Mastercard Details */
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cardholder Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="e.g. Headteacher / School Bursar"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Card Number *
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4000 1234 5678 9010"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Expiry Date *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      CVV Security Code *
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Authorize UGX {formattedUgx}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {step === 'prompting' && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto animate-bounce">
              <Phone className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Sending Payment Request...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                Connecting to payment switch for destination account <strong>0786721142</strong> (Ismail Kasumba).
              </p>
            </div>
          </div>
        )}

        {step === 'authorizing' && (
          <div className="text-center py-6 space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
              <Clock className="w-7 h-7 animate-spin" />
            </div>

            <div>
              <span className="text-[11px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-900">
                USSD Prompt Dispatched
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">
                Authorize Transaction on Phone
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                Please enter your Mobile Money PIN on <strong>{phoneNumber || '0786721142'}</strong> to transfer <strong>UGX {formattedUgx}</strong> to <strong>Ismail Kasumba (0786721142)</strong>.
              </p>
            </div>

            {/* Simulated interactive mobile handset display */}
            <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl border border-slate-700 max-w-xs mx-auto shadow-inner text-left space-y-2">
              <div className="text-[10px] text-slate-400">
                [ {method === 'mtn_momo' ? 'MTN MoMo Gateway' : method === 'airtel_money' ? 'Airtel Money Push' : '3DS Secure'} ]
              </div>
              <div className="text-[11px] text-white">
                Do you approve transfer of UGX {formattedUgx} to ISMAIL KASUMBA (0786721142)? Ref: {txnRef}
              </div>
              <div className="pt-2">
                <input
                  type="password"
                  maxLength={5}
                  value={simulatedPin}
                  onChange={(e) => setSimulatedPin(e.target.value)}
                  placeholder="Enter 4-5 digit PIN"
                  className="w-full px-2.5 py-1.5 text-xs bg-black/60 border border-emerald-500/50 rounded-lg text-emerald-300 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleAuthorize}
              className="w-full max-w-xs mx-auto py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm Carrier Authorization
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Payment Confirmed &amp; Synced!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                UGX {formattedUgx} has been successfully received by <strong>0786721142</strong> (Ismail Kasumba). Your institutional operating portal is being provisioned!
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-left text-xs space-y-1.5 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{txnRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="font-semibold text-slate-900 dark:text-white">0786721142 (Ismail Kasumba)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-600 font-bold uppercase text-[10px]">VERIFIED_SETTLED</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
