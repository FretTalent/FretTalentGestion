import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger',
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div
              className={`p-3 rounded-2xl ${variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button
              onClick={onCancel}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all ${
              variant === 'danger'
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
