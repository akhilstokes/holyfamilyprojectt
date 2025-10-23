import React, { useCallback, useState } from 'react';

export const ConfirmDialogContext = React.createContext({ confirm: async () => false });

export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState({ open: false, title: '', message: '', resolve: null });

  const confirm = useCallback((title, message) => new Promise((resolve) => {
    setState({ open: true, title, message, resolve });
  }), []);

  const onClose = (result) => {
    if (state.resolve) state.resolve(result);
    setState({ open: false, title: '', message: '', resolve: null });
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      {state.open && (
        <div className="confirm-backdrop">
          <div className="confirm-modal">
            <div className="confirm-header">{state.title || 'Confirm'}</div>
            <div className="confirm-body">{state.message}</div>
            <div className="confirm-actions">
              <button className="btn" onClick={() => onClose(false)}>No</button>
              <button className="btn primary" onClick={() => onClose(true)}>Yes</button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .confirm-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;z-index:1000}
        .confirm-modal{background:#0b1220;color:#e5e7eb;border:1px solid #1f2937;border-radius:10px;min-width:320px;max-width:92vw;padding:16px;box-shadow:0 10px 30px rgba(0,0,0,.5)}
        .confirm-header{font-weight:700;margin-bottom:8px}
        .confirm-body{opacity:.9;margin-bottom:16px}
        .confirm-actions{display:flex;justify-content:flex-end;gap:8px}
        .btn{padding:8px 12px;border-radius:6px;border:1px solid #334155;background:#111827;color:#e5e7eb;cursor:pointer}
        .btn.primary{background:#4f46e5;border-color:#4f46e5}
      `}</style>
    </ConfirmDialogContext.Provider>
  );
};

export function useConfirm() {
  const ctx = React.useContext(ConfirmDialogContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
}
