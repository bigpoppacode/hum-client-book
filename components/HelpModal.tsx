"use client";

interface HelpModalProps {
  text: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ text, isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-28 backdrop-blur-sm sm:items-center sm:pb-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
            <svg
              className="h-4 w-4 text-primary-700"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-900">How this works</h3>
        </div>
        <p className="mb-6 text-sm leading-relaxed text-slate-600">{text}</p>
        <button
          onClick={onClose}
          className="btn-primary min-h-tap w-full"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
