import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { School, PaymentMethod } from '../../types';
import {
  ShieldCheck,
  Building,
  Users,
  DollarSign,
  Lock,
  Unlock,
  AlertTriangle,
  Clock,
  ExternalLink,
  Plus,
  RefreshCw,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  CreditCard,
  Phone,
  Search,
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const {
    schools,
    transactions,
    superAdminEmail,
    superAdminPhone,
    logoutSuperAdmin,
    toggleBlockSchool,
    renewSubscription,
    navigateToSchool,
    navigateToWelcome,
    getSchoolAppUrl,
  } = usePortal();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'blocked'>('all');
  const [selectedSchoolForAction, setSelectedSchoolForAction] = useState<School | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [showBlockModal, setShowBlockModal] = useState(false);

  // Financial statistics
  const totalRevenueUgx = transactions.reduce((acc, tx) => acc + (tx.amountUgx || 0), 0);
  const totalRevenueUsd = transactions.reduce((acc, tx) => acc + (tx.amountUsd || 0), 0);
  const formattedRevenueUgx = new Intl.NumberFormat('en-UG').format(totalRevenueUgx);

  const activeCount = schools.filter((s) => !s.isBlocked && new Date(s.subscriptionExpiresAt) >= new Date()).length;
  const expiredCount = schools.filter((s) => !s.isBlocked && new Date(s.subscriptionExpiresAt) < new Date()).length;
  const blockedCount = schools.filter((s) => s.isBlocked).length;

  const filteredSchools = schools.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());

    const isExpired = new Date(s.subscriptionExpiresAt) < new Date();
    if (filterStatus === 'active') return matchesSearch && !s.isBlocked && !isExpired;
    if (filterStatus === 'expired') return matchesSearch && !s.isBlocked && isExpired;
    if (filterStatus === 'blocked') return matchesSearch && s.isBlocked;
    return matchesSearch;
  });

  const handleToggleBlock = (school: School) => {
    if (school.isBlocked) {
      toggleBlockSchool(school.id, false);
    } else {
      setSelectedSchoolForAction(school);
      setBlockReason('Administrative and compliance review');
      setShowBlockModal(true);
    }
  };

  const confirmBlock = () => {
    if (selectedSchoolForAction) {
      toggleBlockSchool(selectedSchoolForAction.id, true, blockReason);
      setShowBlockModal(false);
      setSelectedSchoolForAction(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={navigateToWelcome}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Return to Public Welcome Page"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-white">
                  EduPortal Creator Console
                </h1>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-bold px-2 py-0.5 rounded-full">
                  Master Super-Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Operator: <span className="text-white font-semibold">{superAdminEmail}</span> · Merchant Sync: <span className="text-emerald-400 font-bold">{superAdminPhone}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={navigateToWelcome}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all"
            >
              Public Home
            </button>
            <button
              onClick={logoutSuperAdmin}
              className="px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-950/80 border border-rose-900/60 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-md space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Total Revenue Synced</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
              UGX {formattedRevenueUgx}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
              <span>Account: <strong>{superAdminPhone}</strong></span>
              <span>· (${totalRevenueUsd})</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-md space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Subscribed Institutions</span>
              <Building className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono tracking-tight">
              {schools.length}
            </div>
            <div className="text-[11px] text-slate-400">
              {activeCount} Active · {expiredCount} Expired · {blockedCount} Blocked
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-md space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Payment Gateway Status</span>
              <CreditCard className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-lg font-black text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              MTN / Airtel / Visa
            </div>
            <div className="text-[11px] text-emerald-400 font-mono">
              Direct settlement to {superAdminPhone}
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-md space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Master Creator Access</span>
              <Lock className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-lg font-bold text-white truncate font-mono">
              {superAdminEmail}
            </div>
            <div className="text-[11px] text-indigo-300">
              Authority to block or extend any school
            </div>
          </div>
        </div>

        {/* Institution Management Section */}
        <section className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-400" />
                Subscribed Institutions &amp; Access Governance
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage institutional URLs, enforce subscription lockouts, or block rogue portals
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search school or code..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px]">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterStatus === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({schools.length})
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterStatus === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Active ({activeCount})
                </button>
                <button
                  onClick={() => setFilterStatus('expired')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterStatus === 'expired' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Expired ({expiredCount})
                </button>
                <button
                  onClick={() => setFilterStatus('blocked')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    filterStatus === 'blocked' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Blocked ({blockedCount})
                </button>
              </div>
            </div>
          </div>

          {/* School Portals Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-semibold font-mono">
                <tr>
                  <th className="py-3 px-4">School &amp; Prefix</th>
                  <th className="py-3 px-4">Admin Email</th>
                  <th className="py-3 px-4">Plan &amp; Billing</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Master Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredSchools.map((sch) => {
                  const isExpired = new Date(sch.subscriptionExpiresAt) < new Date();
                  const daysRemaining = Math.max(
                    0,
                    Math.ceil((new Date(sch.subscriptionExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  );

                  return (
                    <tr key={sch.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white flex items-center gap-2">
                          {sch.badgeUrl ? (
                            <img src={sch.badgeUrl} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center font-mono text-[10px]">
                              {sch.code}
                            </div>
                          )}
                          <span>{sch.name}</span>
                        </div>
                        <div className="font-mono text-[10px] text-indigo-400 mt-0.5">
                          ?school={sch.slug}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {sch.adminEmail || sch.email}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white">{sch.subscriptionPlan}</span>
                        <div className="text-[10px] text-slate-400 uppercase font-mono">
                          {sch.subscriptionBilling} billing
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px] text-slate-200">
                          {new Date(sch.subscriptionExpiresAt).toLocaleDateString()}
                        </div>
                        <div className={`text-[10px] ${isExpired ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                          {isExpired ? 'Expired' : `${daysRemaining} days remaining`}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {sch.isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <Lock className="w-3 h-3" /> Blocked
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <Clock className="w-3 h-3" /> Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {/* Direct Launch */}
                        <button
                          onClick={() => navigateToSchool(sch.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-800 rounded-lg transition-colors inline-flex items-center gap-1"
                          title="Open school portal"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Launch
                        </button>

                        {/* Extend / Renew Subscription */}
                        <button
                          onClick={() => renewSubscription(sch.id, sch.subscriptionPlan, 'annual', 'mtn_momo', superAdminPhone)}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 rounded-lg transition-colors inline-flex items-center gap-1"
                          title="Extend by 1 Year"
                        >
                          <RefreshCw className="w-3 h-3" />
                          +1 Year
                        </button>

                        {/* Block / Unblock Portal */}
                        <button
                          onClick={() => handleToggleBlock(sch)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg inline-flex items-center gap-1 transition-colors ${
                            sch.isBlocked
                              ? 'text-emerald-300 bg-emerald-950/60 hover:bg-emerald-800 border border-emerald-700'
                              : 'text-rose-300 bg-rose-950/60 hover:bg-rose-800 border border-rose-800'
                          }`}
                        >
                          {sch.isBlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          {sch.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Live Transaction Ledger Synced to 0786721142 */}
        <section className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                Live Revenue &amp; Carrier Settlements
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                All school subscription payments routed to <strong>{superAdminPhone}</strong> (Ismail Kasumba)
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-xl">
              Account: {superAdminPhone}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">School Name</th>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">Payer Account</th>
                  <th className="py-2.5 px-3">Amount (UGX)</th>
                  <th className="py-2.5 px-3 text-right">Settlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/30">
                    <td className="py-2.5 px-3 text-slate-400">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-sans font-bold text-white">
                      {tx.schoolName}
                    </td>
                    <td className="py-2.5 px-3 text-indigo-400 font-bold">
                      {tx.reference}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-slate-800 font-bold">
                        {tx.paymentMethod.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {tx.payerPhoneOrCard}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-400">
                      UGX {new Intl.NumberFormat('en-UG').format(tx.amountUgx)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-900 px-2 py-0.5 rounded-full">
                        &rarr; {superAdminPhone}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Block Portal Confirmation Modal */}
      {showBlockModal && selectedSchoolForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Suspend School Portal Access
                </h3>
                <p className="text-xs text-slate-400">
                  Target: {selectedSchoolForAction.name} ({selectedSchoolForAction.code})
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Suspension Reason (Displayed to School)
              </label>
              <textarea
                rows={3}
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Reason for suspension..."
                className="w-full p-3 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowBlockModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmBlock}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md cursor-pointer"
              >
                Confirm Portal Suspension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
