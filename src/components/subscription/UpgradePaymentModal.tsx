import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudentTwin } from '../../context/StudentTwinContext';
import { SubscriptionPlan } from '../../types';
import QRCode from 'qrcode';
import {
  QrCode,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Zap,
  ArrowRight,
  Clock,
  Copy,
  Check,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

interface UpgradePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (upgradedPlan: SubscriptionPlan) => void;
  targetPlan?: SubscriptionPlan;
  billingPeriod?: 'monthly' | 'annual';
}

export const UpgradePaymentModal: React.FC<UpgradePaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetPlan = 'pro_annual',
  billingPeriod = 'annual',
}) => {
  const { user } = useAuth();
  const { upgradePlan, uploadDataToCloud } = useStudentTwin();

  const [paymentState, setPaymentState] = useState<'scan' | 'verifying' | 'success'>('scan');
  const [countdown, setCountdown] = useState<number>(11);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const upiId = '8520981574@ybl';

  const planDetails = useMemo(() => {
    if (targetPlan === 'pro_monthly' || billingPeriod === 'monthly') {
      return {
        id: 'pro_monthly' as SubscriptionPlan,
        name: 'Pro Career Twin (Monthly)',
        badge: 'Monthly Plan',
        amountNumeric: 299,
        amountINR: '₹299',
        periodText: '/ month',
        billingPeriod: 'monthly' as const,
      };
    }
    return {
      id: 'pro_annual' as SubscriptionPlan,
      name: 'Pro Career Twin (Annual)',
      badge: 'Annual Plan',
      amountNumeric: 1499,
      amountINR: '₹1,499',
      periodText: '/ year',
      billingPeriod: 'annual' as const,
    };
  }, [targetPlan, billingPeriod]);

  // Standard valid UPI deep link URI with dynamic amount
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent('Student Digital Twin')}&am=${planDetails.amountNumeric}&cu=INR`;

  // Generate real scannable QR code whenever modal opens or plan details change
  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(
        upiDeepLink,
        {
          errorCorrectionLevel: 'M',
          margin: 2,
          width: 220,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (err, url) => {
          if (!err && url) {
            setQrDataUrl(url);
          } else {
            console.error('Error generating UPI QR code', err);
          }
        }
      );
    }
  }, [isOpen, upiDeepLink]);

  // 11-second timer effect when state transitions to 'verifying'
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (paymentState === 'verifying') {
      if (countdown > 0) {
        timer = setTimeout(() => {
          setCountdown((prev) => prev - 1);
        }, 1000);
      } else {
        // Countdown reached 0 -> Complete simulated upgrade and persistence
        handleSimulatedPaymentSuccess();
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [paymentState, countdown]);

  if (!isOpen) return null;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handlePayWithUpi = () => {
    window.location.href = upiDeepLink;
  };

  const handleStartVerification = () => {
    setCountdown(11);
    setPaymentState('verifying');
  };

  const handleSimulatedPaymentSuccess = async () => {
    try {
      await upgradePlan(planDetails.id, planDetails.billingPeriod, planDetails.amountNumeric);
      await uploadDataToCloud();
      setPaymentState('success');
      if (onSuccess) {
        onSuccess(planDetails.id);
      }
    } catch (e) {
      console.error('Plan upgrade error', e);
    }
  };

  const handleClose = () => {
    setPaymentState('scan');
    setCountdown(11);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Top Header with Back Button and Close */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white relative">
          <div className="flex items-center justify-between gap-2 mb-3">
            {/* Top Left Back Button */}
            <button
              id="payment-modal-back-btn"
              onClick={handleClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {/* Top Right Close / X Button */}
            <button
              id="payment-modal-close-x-btn"
              onClick={handleClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wider">
              {planDetails.badge}
            </span>
          </div>
          <h3 className="text-xl font-black tracking-tight">
            {planDetails.name} — {planDetails.amountINR} {planDetails.periodText}
          </h3>
          <p className="text-xs text-blue-100 mt-0.5">
            Unlock unlimited AI tools, multi-student profiles, and deep career insights.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {paymentState === 'scan' && (
            <div className="space-y-5">
              {/* Notice Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <span className="font-bold">Test & Demonstration Gateway:</span> Scan the valid UPI QR or tap &quot;Pay with UPI&quot;. To test the plan upgrade without a live payment gateway, use the simulated 11s test flow below.
                </div>
              </div>

              {/* QR & Plan Info Container */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-4">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 inline-flex flex-col items-center">
                  {/* Generated Valid UPI QR Code */}
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="UPI Payment QR Code"
                      className="w-44 h-44 rounded-lg object-contain"
                    />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                  )}
                  <span className="text-[10px] font-bold text-slate-500 mt-1">
                    Scan with GPay / PhonePe / Paytm / BHIM
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {planDetails.name}
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {planDetails.amountINR} <span className="text-xs font-normal text-slate-400">{planDetails.periodText}</span>
                  </div>
                </div>

                {/* UPI ID Pill & Copy Action */}
                <div className="w-full max-w-xs flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-2xs">
                  <div className="text-left font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                    UPI ID: {upiId}
                  </div>
                  <button
                    id="copy-upi-id-btn"
                    onClick={handleCopyUPI}
                    className="inline-flex items-center gap-1 px-2 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors cursor-pointer text-[11px] font-bold"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Pay with UPI Clickable Fallback Button */}
                <a
                  id="pay-with-upi-link-btn"
                  href={upiDeepLink}
                  onClick={handlePayWithUpi}
                  className="w-full max-w-xs py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Pay with UPI ({planDetails.amountINR})</span>
                </a>
              </div>

              {/* Action Buttons: 11s Test Simulation and Cancel */}
              <div className="space-y-2.5 pt-1">
                <button
                  id="initiate-simulated-payment-btn"
                  onClick={handleStartVerification}
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Zap className="w-4 h-4" />
                  <span>Simulate & Verify UPI Payment (11s Test)</span>
                </button>

                <button
                  id="payment-modal-cancel-btn"
                  onClick={handleClose}
                  className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {paymentState === 'verifying' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 animate-spin flex items-center justify-center" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {countdown}s
                  </span>
                </div>
              </div>

              <div className="space-y-2 max-w-xs">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Verifying Simulated Payment...
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Simulating payment provider confirmation of {planDetails.amountINR} in {countdown} seconds. Please do not close this window.
                </p>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${((11 - countdown) / 11) * 100}%` }}
                />
              </div>

              <button
                id="cancel-verification-btn"
                onClick={handleClose}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline cursor-pointer"
              >
                Cancel Simulation
              </button>
            </div>
          )}

          {paymentState === 'success' && (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xl font-black text-slate-900 dark:text-white">
                  Simulated Payment Successful!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm">
                  Your account has been upgraded to <strong>{planDetails.id === 'pro_monthly' ? 'PRO MONTHLY' : 'PRO ANNUAL'}</strong> ({planDetails.amountINR} {planDetails.periodText}). This plan status is securely saved to your account and preserved across sessions.
                </p>
              </div>

              <div className="w-full p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 space-y-1">
                <div>Plan: {planDetails.name}</div>
                <div>Account: {user?.email}</div>
                <div>Status: Active (Persisted)</div>
              </div>

              <button
                id="payment-modal-success-done-btn"
                onClick={handleClose}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md cursor-pointer transition-all"
              >
                Access Pro Twin Workspace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
