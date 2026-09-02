"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode
} from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress
} from "@mui/material";

export interface ConfirmOptions {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: "primary" | "error" | "warning" | "secondary";
  onConfirm?: () => Promise<void> | void;
}

export interface AlertOptions {
  title: string;
  message: ReactNode;
  okLabel?: string;
  color?: "primary" | "error" | "warning" | "info";
}

type DialogState =
  | {
      type: "confirm";
      options: ConfirmOptions;
      resolve: (value: boolean) => void;
    }
  | {
      type: "alert";
      options: AlertOptions;
      resolve: () => void;
    };

export interface DialogContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialogState, setDialogState] = useState<DialogState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setDialogState({
        type: "confirm",
        options,
        resolve
      });
    });
  }, []);

  const alert = useCallback((options: AlertOptions): Promise<void> => {
    return new Promise<void>((resolve) => {
      setDialogState({
        type: "alert",
        options,
        resolve
      });
    });
  }, []);

  const handleCancel = useCallback(() => {
    if (isLoading || !dialogState) return;
    if (dialogState.type === "confirm") {
      dialogState.resolve(false);
    } else {
      dialogState.resolve();
    }
    setDialogState(null);
  }, [isLoading, dialogState]);

  const handleConfirm = useCallback(async () => {
    if (isLoading || !dialogState) return;

    if (dialogState.type === "confirm") {
      if (dialogState.options.onConfirm) {
        try {
          setIsLoading(true);
          await dialogState.options.onConfirm();
          setIsLoading(false);
          dialogState.resolve(true);
          setDialogState(null);
        } catch (error) {
          setIsLoading(false);
          throw error;
        }
      } else {
        dialogState.resolve(true);
        setDialogState(null);
      }
    } else {
      dialogState.resolve();
      setDialogState(null);
    }
  }, [isLoading, dialogState]);

  const open = Boolean(dialogState);
  const isConfirmType = dialogState?.type === "confirm";
  const confirmOpts = isConfirmType ? dialogState.options : null;
  const alertOpts = !isConfirmType && dialogState ? dialogState.options : null;

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}
      <Dialog
        open={open}
        onClose={isLoading ? undefined : handleCancel}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            maxWidth: 440,
            width: "100%"
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {confirmOpts?.title ?? alertOpts?.title ?? ""}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "text.secondary" }}>
            {confirmOpts?.message ?? alertOpts?.message ?? ""}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
          {isConfirmType && (
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={isLoading}
              sx={{ borderRadius: 2 }}
            >
              {confirmOpts?.cancelLabel ?? "Batal"}
            </Button>
          )}
          <Button
            variant="contained"
            color={
              isConfirmType
                ? confirmOpts?.confirmColor ?? "primary"
                : alertOpts?.color ?? "primary"
            }
            onClick={handleConfirm}
            disabled={isLoading}
            startIcon={
              isLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
            sx={{ borderRadius: 2 }}
          >
            {isConfirmType
              ? confirmOpts?.confirmLabel ?? "Konfirmasi"
              : alertOpts?.okLabel ?? "OK"}
          </Button>
        </DialogActions>
      </Dialog>
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogContextValue {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}

export function useConfirm() {
  const { confirm } = useDialog();
  return { confirm };
}
