"use client";

import { useRef, useState } from "react";

type DeleteConfirmationFormProps = {
  action: () => Promise<void>;
  itemName: string;
  buttonLabel: string;
};

export default function DeleteConfirmationForm({
  action,
  itemName,
  buttonLabel,
}: DeleteConfirmationFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const submitConfirmed = useRef(false);
  const [isOpen, setIsOpen] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (submitConfirmed.current) {
      submitConfirmed.current = false;
      return;
    }

    event.preventDefault();
    setIsOpen(true);
  }

  function confirmDelete() {
    submitConfirmed.current = true;
    setIsOpen(false);
    formRef.current?.requestSubmit();
  }

  return (
    <>
      <form ref={formRef} action={action} onSubmit={handleSubmit}>
        <button
          type="submit"
          className="text-sm font-semibold text-[#a14e45] transition hover:text-[#7d2924]"
        >
          {buttonLabel}
        </button>
      </form>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#173329]/45 px-5"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            className="w-full max-w-sm rounded-2xl border border-[#dce5dd] bg-white p-6 shadow-[0_24px_60px_-12px_#17231e]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a14e45]">
              Confirm deletion
            </p>
            <h2
              id="delete-dialog-title"
              className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[#17231e]"
            >
              Are you sure?
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#68766d]">
              Delete <span className="font-semibold text-[#405048]">{itemName}</span>? This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-[#cfdbd1] px-4 py-2.5 text-sm font-semibold text-[#405048] transition hover:bg-[#f5f8f4]"
              >
                No
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-[#a14e45] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7d2924]"
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}