"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Dialog } from "./Dialog";

export type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions>({ message: "" });
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setOpts(options);
      setOpen(true);
    });
  }, []);

  const finish = (value: boolean) => {
    setOpen(false);
    resolveRef.current?.(value);
    resolveRef.current = null;
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog
        open={open}
        onClose={() => finish(false)}
        title={opts.title ?? "Confirm"}
        subtitle={opts.message}
        width={420}
        className="confirm-modal"
      >
        <div className="modal-body confirm-actions">
          <button type="button" className="btn-quiet" onClick={() => finish(false)}>
            {opts.cancelLabel ?? "Cancel"}
          </button>
          <button
            type="button"
            className={opts.danger ? "btn-cta confirm-danger" : "btn-cta"}
            onClick={() => finish(true)}
          >
            {opts.confirmLabel ?? "Confirm"}
          </button>
        </div>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error("useConfirm must be used within ConfirmProvider");
  }
  return confirm;
}
