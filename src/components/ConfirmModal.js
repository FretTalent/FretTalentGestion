import { AlertTriangle, X, RefreshCw, CheckCircle2, ShieldAlert, Mail, Zap } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'orange', // 'orange' | 'danger' | 'success' | 'info'
  icon: CustomIcon,
  loading = false,
}) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      badgeBg: 'bg-red-50 text-red-600 border-red-100',
      btnBg: 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20',
      defaultIcon: ShieldAlert,
    },
    orange: {
      badgeBg: 'bg-orange-50 text-orange-600 border-orange-100',
      btnBg: 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-orange-500/25',
      defaultIcon: AlertTriangle,
    },
    success: {
      badgeBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      btnBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/20',
      defaultIcon: CheckCircle2,
    },
    info: {
      badgeBg: 'bg-blue-50 text-blue-600 border-blue-100',
      btnBg: 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20',
      defaultIcon: Zap,
    },
  };

  const style = variantStyles[variant] || variantStyles.orange;
  const IconComponent = CustomIcon || style.defaultIcon;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl border ${style.badgeBg} flex items-center justify-center`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <button
              onClick={onCancel}
              disabled={loading}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-700 disabled:opacity-50 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-lg font-black text-slate-950 mb-2 leading-snug">{title}</h3>
          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{message}</p>
        </div>

        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2.5 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 ${style.btnBg}`}
          >
            {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
