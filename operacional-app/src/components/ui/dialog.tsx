"use client";

import React, { Fragment } from "react";
import { Dialog as HDialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { cn } from "./utils"; // ajuste se seu caminho for diferente

// ---------- ROOT ----------

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <Transition appear show={open} as={Fragment}>
      <HDialog
        as="div"
        className="relative z-50"
        onClose={() => onOpenChange(false)}
      >
        <DialogOverlay />

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            {children}
          </div>
        </div>
      </HDialog>
    </Transition>
  );
}

// ---------- OVERLAY ----------

export function DialogOverlay() {
  return (
    <Transition.Child
      as={Fragment}
      enter="ease-out duration-200"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
    </Transition.Child>
  );
}

// ---------- CONTENT ----------

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DialogContent({
  className,
  children,
  ...props
}: DialogContentProps) {
  return (
    <Transition.Child
      as={Fragment}
      enter="ease-out duration-200"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="ease-in duration-150"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
    >
      <HDialog.Panel
        className={cn(
          "w-full max-w-3xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all",
          className
        )}
        {...props}
      >
        {children}
      </HDialog.Panel>
    </Transition.Child>
  );
}

// ---------- HEADER / TITLE / FOOTER / CLOSE ----------

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return (
    <div
      className={cn("flex flex-col gap-2 text-left mb-4", className)}
      {...props}
    />
  );
}

interface DialogTitleProps extends React.ComponentProps<typeof HDialog.Title> {}

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <HDialog.Title
      className={cn("text-lg font-semibold text-gray-900", className)}
      {...props}
    />
  );
}

interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DialogFooter({ className, ...props }: DialogFooterProps) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-6",
        className
      )}
      {...props}
    />
  );
}

export function DialogCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-4 top-4 opacity-70 hover:opacity-100 transition"
    >
      <X className="w-4 h-4" />
      <span className="sr-only">Fechar</span>
    </button>
  );
}
