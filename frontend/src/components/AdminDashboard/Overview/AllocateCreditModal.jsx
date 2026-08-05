import React, { useState, useEffect } from 'react';
import Modal from '../../Shared/Modal/Modal';
import { AlertCircle, CheckCircle2, User, Coins, FileText, ChevronDown, RotateCcw, Plus, Minus } from 'lucide-react';

export default function AllocateCreditModal({
  isOpen,
  onClose,
  handleAllocateCredit,
  companySettings,
  creditAmount,
  setCreditAmount,
  allocationReason,
  setAllocationReason,
  submittingCredit,
  users,
  targetUserId,
  setTargetUserId
}) {
  const [step, setStep] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [stepSize, setStepSize] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCreditAmount(0);
      setTargetUserId('');
      setAllocationReason('');
      setStepSize(null);
      setIsDropdownOpen(false);
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (targetUserId) setErrors(prev => ({ ...prev, targetUserId: '' }));
  }, [targetUserId]);

  useEffect(() => {
    if (Number(creditAmount) > 0) setErrors(prev => ({ ...prev, creditAmount: '' }));
  }, [creditAmount]);

  useEffect(() => {
    if (allocationReason && allocationReason.trim() !== '') setErrors(prev => ({ ...prev, allocationReason: '' }));
  }, [allocationReason]);

  const handleNext = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!targetUserId) {
      newErrors.targetUserId = 'Please select a user to allocate credits to.';
    }
    if (!creditAmount || Number(creditAmount) <= 0) {
      newErrors.creditAmount = 'Please enter an amount greater than 0.';
    }
    if (!allocationReason || allocationReason.trim() === '') {
      newErrors.allocationReason = 'Please enter an invoice or reference number.';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (targetUserId && creditAmount && allocationReason) {
      setErrors({});
      setStep(2);
    }
  };

  const selectedUser = users.find(u => u.id === targetUserId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 1 ? "Allocate Global Credits" : "Confirm Allocation"}
      description={step === 1 ? "Add credits directly to the company's shared pool." : "Please review the details before confirming."}
      maxWidth="max-w-[540px]"
    >
      {step === 1 ? (
        <form onSubmit={handleNext} className="space-y-6 mt-2">
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-2" htmlFor="target-user">
                Select User
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                  <User size={16} className="text-neutral-400" />
                </div>
                
                {/* Custom Select Trigger */}
                <div 
                  className={`w-full pl-10 pr-10 py-3 text-[13px] border ${errors.targetUserId ? 'border-red-500 bg-red-50/50 ring-4 ring-red-500/10' : isDropdownOpen ? 'border-neutral-300 bg-white shadow-sm ring-4 ring-neutral-900/5' : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/50'} rounded-xl transition-all cursor-pointer flex items-center select-none ${submittingCredit ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className={`truncate ${!targetUserId ? 'text-neutral-400 font-normal' : 'text-neutral-900 font-semibold'}`}>
                    {targetUserId 
                      ? (() => {
                          const u = users.find(u => u.id === targetUserId);
                          return u ? `${u.name || u.username}` : 'Select a user...';
                        })()
                      : 'Select a user...'
                    }
                  </span>
                </div>

                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none z-10">
                  <ChevronDown size={16} className={`text-neutral-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-neutral-600' : ''}`} />
                </div>

                {/* Custom Dropdown Menu */}
                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] z-50 py-1.5 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                      {users.filter(u => u.role !== 'admin').map((user) => (
                        <div 
                          key={user.id} 
                          className={`px-3.5 py-2.5 mx-1.5 rounded-lg text-[13px] cursor-pointer transition-all flex items-center justify-between ${targetUserId === user.id ? 'bg-[#800020]/[0.06] text-[#800020] font-semibold ring-1 ring-inset ring-[#800020]/20' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'}`}
                          onClick={() => {
                            setTargetUserId(user.id);
                            setIsDropdownOpen(false);
                          }}
                        >
                          <span className="truncate">{user.name || user.username}</span>
                          <span className={`text-[13px] px-3 py-1 rounded-md font-bold shadow-sm ${targetUserId === user.id ? 'bg-white border border-[#800020]/20 text-[#800020]' : 'bg-white border border-neutral-200 text-neutral-600'}`}>
                            {user.credits_balance || 0} Credits
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              {errors.targetUserId && (
                <div className="flex items-center gap-1.5 mt-2 text-red-500 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle size={13} strokeWidth={2.5} />
                  <span className="text-[11px] font-semibold">{errors.targetUserId}</span>
                </div>
              )}
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-widest" htmlFor="add-credits">
                  Credits to Add
                </label>
                <button 
                  type="button"
                  onClick={() => {
                    setCreditAmount(0);
                    setStepSize(null);
                  }}
                  className="text-neutral-400 hover:text-neutral-700 transition-colors bg-neutral-100 hover:bg-neutral-200 rounded-full p-1 border border-neutral-200 shadow-sm"
                  title="Reset to 0"
                >
                  <RotateCcw size={12} strokeWidth={2.5} />
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Coins size={16} className={`${errors.creditAmount ? 'text-red-400' : 'text-neutral-400'}`} />
                </div>
                <input
                  id="add-credits"
                  type="number"
                  min="0"
                  className={`w-full pl-10 pr-4 py-3 text-[13px] font-medium border ${errors.creditAmount ? 'border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500/10 focus:border-red-500' : 'border-neutral-200 bg-neutral-50/50 text-neutral-900 focus:ring-neutral-200 focus:border-neutral-400'} rounded-xl outline-none focus:ring-2 focus:bg-white transition-all shadow-sm hover:bg-neutral-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  disabled={submittingCredit}
                />
              </div>
              {errors.creditAmount && (
                <div className="flex items-center gap-1.5 mt-2 text-red-500 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle size={13} strokeWidth={2.5} />
                  <span className="text-[11px] font-semibold">{errors.creditAmount}</span>
                </div>
              )}
              <div className="flex gap-2 mt-2.5 items-center">
                {[100, 200, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setCreditAmount(amt);
                    }}
                    disabled={submittingCredit}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                      Number(creditAmount) === amt 
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm' 
                        : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 hover:border-neutral-300'
                    }`}
                  >
                    {amt}
                  </button>
                ))}
                
                <div className="flex bg-neutral-100 rounded-lg p-0.5 ml-1 border border-neutral-200 shadow-sm shrink-0">
                  <button
                    type="button"
                    onClick={() => setCreditAmount(Math.max(0, Number(creditAmount || 0) - 50))}
                    disabled={submittingCredit}
                    className="p-1.5 text-neutral-600 hover:bg-white hover:text-neutral-900 hover:shadow-sm rounded-md transition-all cursor-pointer"
                  >
                    <Minus size={14} strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreditAmount(Number(creditAmount || 0) + 50)}
                    disabled={submittingCredit}
                    className="p-1.5 text-neutral-600 hover:bg-white hover:text-neutral-900 hover:shadow-sm rounded-md transition-all cursor-pointer"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
              
              {Number(creditAmount) > 9999 && (
                <div className="flex items-start gap-1.5 mt-3 text-amber-600 bg-amber-50/50 p-2 rounded-lg border border-amber-100/50 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <p className="text-[11px] font-medium leading-relaxed">
                    You are allocating a very large amount of credits. Please double-check the amount before proceeding.
                  </p>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-2" htmlFor="allocation-reason">
                Invoice .no / Reference no
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FileText size={16} className="text-neutral-400" />
                </div>
                <input
                  id="allocation-reason"
                  type="text"
                  placeholder="e.g. INV-2026-001"
                  className={`w-full pl-10 pr-4 py-3 text-[13px] font-medium border ${errors.allocationReason ? 'border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500/10 focus:border-red-500' : 'border-neutral-200 bg-neutral-50/50 text-neutral-900 focus:ring-neutral-200 focus:border-neutral-400'} rounded-xl outline-none focus:ring-2 focus:bg-white transition-all shadow-sm hover:bg-neutral-50`}
                  value={allocationReason}
                  onChange={(e) => setAllocationReason(e.target.value)}
                  disabled={submittingCredit}
                  autoComplete="off"
                />
              </div>
              {errors.allocationReason && (
                <div className="flex items-center gap-1.5 mt-2 text-red-500 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle size={13} strokeWidth={2.5} />
                  <span className="text-[11px] font-semibold">{errors.allocationReason}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-3 justify-end pt-4 border-t border-neutral-100">
            <button 
              type="button" 
              className="px-5 py-2.5 text-[13px] font-semibold border border-neutral-200 hover:bg-neutral-50 rounded-xl cursor-pointer transition-all text-neutral-500 hover:text-neutral-700 focus:outline-none" 
              onClick={onClose}
              disabled={submittingCredit}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-8 py-2.5 text-[13px] font-bold bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl transition-all cursor-pointer border-none shadow-md hover:shadow-lg flex items-center justify-center transform hover:-translate-y-0.5"
              disabled={submittingCredit}
            >
              Next
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleAllocateCredit} className="space-y-4">
          <div className="flex flex-col items-center justify-center pt-1 pb-3 space-y-3">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-emerald-400 opacity-20 blur-xl rounded-full w-16 h-16 animate-pulse"></div>
              <div className="relative bg-emerald-50 text-emerald-600 rounded-full p-3 border border-emerald-100 shadow-sm">
                <CheckCircle2 size={32} strokeWidth={1.5} />
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-[10px] font-bold text-neutral-400 mb-1 uppercase tracking-[0.2em]">Amount to Allocate</p>
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-6xl font-light text-neutral-900 tracking-tighter">{creditAmount}</span>
                <span className="text-xl font-medium text-neutral-300 tracking-tight">Credits</span>
              </div>
            </div>
          </div>
          
          <div className="relative bg-neutral-50 border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
             <div className="absolute left-[-12px] top-[76px] transform -translate-y-1/2 w-6 h-6 bg-white border-r border-neutral-200 rounded-full z-10"></div>
             <div className="absolute right-[-12px] top-[76px] transform -translate-y-1/2 w-6 h-6 bg-white border-l border-neutral-200 rounded-full z-10"></div>
             
             <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                   <span className="text-neutral-500 font-medium text-sm">Recipient</span>
                   <span className="text-neutral-900 font-semibold">{selectedUser?.name || selectedUser?.username}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-neutral-500 font-medium text-sm">Current Balance</span>
                   <span className="text-neutral-900 font-semibold">{selectedUser?.credits_balance || 0} Credits</span>
                </div>
             </div>
             
             <div className="border-t-2 border-dashed border-neutral-200/80 mx-4 relative"></div>
             
             <div className="p-4">
                <div className="flex justify-between items-center">
                   <span className="text-neutral-500 font-medium text-sm">Invoice / Ref No.</span>
                   <span className="text-neutral-600 font-mono text-[13px] bg-white border border-neutral-200 px-2.5 py-1 rounded-md shadow-sm">{allocationReason}</span>
                </div>
             </div>
          </div>

          <div className="flex items-start gap-2.5 bg-red-50/40 p-3.5 rounded-xl border border-red-100/60">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-[13px] font-medium text-red-800 leading-relaxed">
              This action is permanent and will instantly update the user's usable balance. Please verify the amount and reference number.
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button 
              type="button" 
              className="px-4 py-2 text-xs font-semibold border border-border-subtle hover:bg-neutral-50 rounded-lg cursor-pointer transition text-text-muted focus:outline-none" 
              onClick={() => setStep(1)}
              disabled={submittingCredit}
            >
              Back
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 text-[13px] font-bold bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl transition-all cursor-pointer border-none shadow-md hover:shadow-lg flex items-center justify-center min-w-[140px] transform hover:-translate-y-0.5"
              disabled={submittingCredit}
            >
              {submittingCredit ? 'Processing...' : 'Confirm Allocation'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
