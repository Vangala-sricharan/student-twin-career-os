import React, { useState } from 'react';
import { useStudentTwin } from '../../context/StudentTwinContext';
import { SubscriptionPlan } from '../../types';
import {
  Check,
  Zap,
  ShieldCheck,
  Sparkles,
  Building,
  CreditCard,
  Download,
  CheckCircle2,
  Lock,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { UpgradePaymentModal } from '../../components/subscription/UpgradePaymentModal';

export const SubscriptionUpgradePage: React.FC = () => {
  const { plan } = useStudentTwin();
  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const tiers = [
    {
      id: 'free',
      name: 'Starter Twin',
      tagline: 'Basic profile modeling & single resume export',
      priceINR: '₹0',
      period: 'Forever free',
      features: [
        'Single student digital twin profile',
        'Skills matrix tracking (up to 10 skills)',
        'Basic ATS resume export (Standard template)',
        'Standard 30-day career roadmap',
        'Community support',
      ],
      cta: 'Current Starter Plan',
      isPopular: false,
    },
    {
      id: 'pro_annual',
      name: 'Pro Career Twin',
      tagline: 'Full AI Career OS intelligence suite & unlimited multi-profile management',
      priceINR: selectedBilling === 'yearly' ? '₹1,499' : '₹299',
      period: selectedBilling === 'yearly' ? 'per year (Save 75%)' : 'per month',
      features: [
        'Unlimited student digital twin profiles & switching',
        'Interactive AI Career Assistant with full context memory',
        'Deep Resume ATS Analyzer with line-by-line audit',
        '30/60/90-Day dynamic roadmap with skill gaps analysis',
        'Interactive What-If Career Simulator & role projections',
        'GitHub repository & commit readiness auditor',
        'Official Student Digital Twin branded PDF exports',
        'Priority AI model processing & fast cloud backups',
      ],
      cta: selectedBilling === 'yearly' ? 'Upgrade to Annual (₹1,499)' : 'Upgrade to Monthly (₹299)',
      isPopular: true,
    },
    {
      id: 'institution',
      name: 'Campus / Enterprise',
      tagline: 'Full university-wide placement readiness tracking and analytics',
      priceINR: '₹12,999',
      period: 'per year / campus cohort',
      features: [
        'Everything in Pro Career Twin',
        'Batch multi-student import & bulk PDF export',
        'Departmental analytics & placement readiness leaderboard',
        'Custom university syllabus & curriculum gap mapping',
        'Dedicated account manager & training sessions',
        'Enterprise SLA & 99.9% uptime guarantee',
      ],
      cta: 'Contact Campus Sales',
      isPopular: false,
    },
  ];

  const handleSelectPlan = (tierId: string) => {
    if (tierId === 'free' || tierId === plan) return;
    if (tierId === 'pro_annual' || tierId === 'pro_monthly') {
      setPaymentModalOpen(true);
    }
  };

  const isCurrentPro = plan === 'pro_annual' || plan === 'pro_monthly';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Student Digital Twin Subscription</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Supercharge Your Placement Readiness
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Equip yourself with autonomous AI intelligence, multi-student profiles, and industry-grade verification tools.
        </p>

        {/* Current Active Plan Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <span className="text-slate-500 dark:text-slate-400">Current Plan:</span>
          <span className="text-blue-600 dark:text-blue-400 uppercase font-black tracking-wider">
            {plan === 'pro_annual'
              ? 'Pro Annual (₹1,499/yr)'
              : plan === 'pro_monthly'
              ? 'Pro Monthly (₹299/mo)'
              : plan === 'institution'
              ? 'Campus Enterprise'
              : 'Free Plan (₹0)'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Billing Selector */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setSelectedBilling('monthly')}
            className={`text-xs font-bold transition-colors cursor-pointer ${
              selectedBilling === 'monthly' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Monthly Billing (₹299/mo)
          </button>
          <button
            id="billing-toggle-btn"
            type="button"
            onClick={() => setSelectedBilling(selectedBilling === 'monthly' ? 'yearly' : 'monthly')}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-all cursor-pointer ${
              selectedBilling === 'yearly' ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
          </button>
          <button
            type="button"
            onClick={() => setSelectedBilling('yearly')}
            className={`text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              selectedBilling === 'yearly' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>Annual Billing (₹1,499/yr)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Save 75%
            </span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const isCurrent =
            (tier.id === 'free' && (plan === 'free' || !plan)) ||
            (tier.id === 'pro_annual' && isCurrentPro) ||
            (tier.id === 'institution' && plan === 'institution');

          return (
            <div
              key={tier.id}
              className={`p-6 sm:p-7 rounded-3xl transition-all border flex flex-col justify-between relative ${
                tier.isPopular
                  ? 'bg-white dark:bg-slate-900 border-blue-600 dark:border-blue-500 shadow-xl ring-2 ring-blue-600/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {tier.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-600 text-white shadow-md">
                  Most Recommended
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {tier.name}
                  </h3>
                  {isCurrent && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  {tier.tagline}
                </p>

                <div className="mt-5 pb-5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                      {tier.priceINR}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      / {tier.period}
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Included Features:
                  </div>
                  {tier.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                <button
                  id={`select-plan-${tier.id}-btn`}
                  disabled={isCurrent}
                  onClick={() => handleSelectPlan(tier.id)}
                  className={`w-full py-3 rounded-2xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-default'
                      : tier.isPopular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25'
                      : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Current Active Plan</span>
                    </>
                  ) : tier.id === 'pro_annual' ? (
                    <>
                      <QrCode className="w-4 h-4" />
                      <span>
                        {selectedBilling === 'yearly'
                          ? 'Upgrade to Annual (₹1,499)'
                          : 'Upgrade to Monthly (₹299)'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>{tier.cta}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Guarantees */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        <div className="flex flex-col items-center space-y-1.5">
          <ShieldCheck className="w-6 h-6 text-blue-600" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Student Data Isolation</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Strict per-profile sandboxing and privacy guarantee.</p>
        </div>
        <div className="flex flex-col items-center space-y-1.5">
          <CreditCard className="w-6 h-6 text-indigo-600" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">UPI QR Code Payments</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Instant UPI payments to 8520981574@ybl in Indian Rupees (₹).</p>
        </div>
        <div className="flex flex-col items-center space-y-1.5">
          <Download className="w-6 h-6 text-emerald-600" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Official PDF Reports</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Export unlimited official dossiers at any time.</p>
        </div>
      </div>

      {/* Upgrade QR Payment Modal with dynamic plan & billing period */}
      <UpgradePaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        targetPlan={selectedBilling === 'yearly' ? 'pro_annual' : 'pro_monthly'}
        billingPeriod={selectedBilling === 'yearly' ? 'annual' : 'monthly'}
        onSuccess={(upgradedPlan) => {
          const planLabel = upgradedPlan === 'pro_monthly' ? 'PRO MONTHLY (₹299/mo)' : 'PRO ANNUAL (₹1,499/yr)';
          setSuccessToast(`Your simulated UPI payment was verified! You are now on ${planLabel}.`);
          setTimeout(() => setSuccessToast(null), 5000);
        }}
      />
    </div>
  );
};
