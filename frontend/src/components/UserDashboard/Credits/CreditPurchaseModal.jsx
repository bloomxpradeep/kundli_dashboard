import React from 'react';
import Modal from '../../Shared/Modal/Modal';
import { Coins } from 'lucide-react';

export default function CreditPurchaseModal({
  isCreditPurchaseModalOpen,
  setIsCreditPurchaseModalOpen,
  isProcessingPayment,
  handleBuyCredits,
  creditPackages,
  selectedPackage,
  setSelectedPackage,
  isCustomAmount,
  setIsCustomAmount,
  purchaseCreditAmount,
  setPurchaseCreditAmount
}) {
  return (
    <Modal 
      isOpen={isCreditPurchaseModalOpen} 
      onClose={() => !isProcessingPayment && setIsCreditPurchaseModalOpen(false)}
      title="Purchase Credits via Razorpay"
    >
      <form onSubmit={handleBuyCredits} className="flex flex-col gap-5">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
          <h4 className="text-sm font-semibold text-blue-800 mb-1">Select a Package</h4>
          <p className="text-xs text-blue-700">1 Credit = ₹1 INR. Credits never expire.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {creditPackages.map((pkg) => (
            <div 
              key={pkg.id}
              onClick={() => {
                setSelectedPackage(pkg.id);
                setIsCustomAmount(false);
                setPurchaseCreditAmount(pkg.credits.toString());
              }}
              className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedPackage === pkg.id && !isCustomAmount 
                  ? 'border-blue-600 bg-blue-50/50' 
                  : 'border-border-subtle hover:border-blue-300 bg-white'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-2.5 bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Most Popular
                </div>
              )}
              <Coins size={24} className={`mb-2 ${selectedPackage === pkg.id && !isCustomAmount ? 'text-blue-600' : 'text-neutral-400'}`} />
              <div className="font-bold text-lg text-text-main">{pkg.credits}</div>
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Credits</div>
              <div className="text-sm font-bold text-text-main bg-neutral-100 px-3 py-1 rounded-lg w-full text-center transition-colors">₹{pkg.price}</div>
            </div>
          ))}
        </div>

        <div 
          onClick={() => {
            setIsCustomAmount(true);
            setSelectedPackage('');
          }}
          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            isCustomAmount ? 'border-blue-600 bg-blue-50/50' : 'border-border-subtle hover:border-blue-300 bg-white'
          }`}
        >
          <div className="flex-1">
            <div className="font-bold text-text-main text-sm">Custom Amount</div>
            <div className="text-xs font-medium text-text-muted">Enter any number of credits</div>
          </div>
          {isCustomAmount && (
            <input 
              type="number" 
              min="1"
              value={purchaseCreditAmount}
              onChange={(e) => setPurchaseCreditAmount(e.target.value)}
              className="form-input text-lg font-semibold w-[120px] text-right"
              disabled={isProcessingPayment}
              autoFocus
              required
            />
          )}
        </div>
        
        <div className="flex justify-between items-center bg-neutral-50 p-4 rounded-xl border border-border-subtle">
          <span className="text-sm font-semibold text-text-muted">Total Amount</span>
          <span className="text-xl font-bold text-text-main">
            ₹{(parseInt(purchaseCreditAmount) || 0) * 1}
          </span>
        </div>

        <div className="flex gap-3 justify-end mt-2">
          <button 
            type="button"
            onClick={() => setIsCreditPurchaseModalOpen(false)}
            className="px-5 py-2.5 text-xs font-semibold text-text-muted hover:bg-neutral-100 rounded-lg transition"
            disabled={isProcessingPayment}
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="btn-primary min-w-[140px]"
            disabled={isProcessingPayment || !purchaseCreditAmount || parseInt(purchaseCreditAmount) <= 0}
          >
            {isProcessingPayment ? 'Processing...' : 'Pay securely'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
