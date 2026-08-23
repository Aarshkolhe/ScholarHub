import { createPortal } from "react-dom";
import { LogOut } from "lucide-react";

export function SignOutConfirmModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-300 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400">
            <LogOut className="size-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Sign Out of ScholarHub?</h3>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">You will need to log back in</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Are you sure you want to sign out of your account? You will need to log back in to access your saved scholarships, eligibility details, and AI grant matches.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Yes, Sign Out
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default SignOutConfirmModal;
