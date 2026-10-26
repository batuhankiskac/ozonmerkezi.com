"use client";

import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  confirmMessage?: string;
  pending?: boolean;
}

export default function SubmitButton({
  children,
  pendingText = "Kaydediliyor...",
  className,
  confirmMessage,
  pending: pendingOverride,
}: SubmitButtonProps) {
  const status = useFormStatus();
  const pending = pendingOverride ?? status.pending;

  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {pending ? pendingText : children}
    </button>
  );
}
