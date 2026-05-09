'use client';

import { Modal } from './QuizMode';
import { Icon } from './Icon';

interface ShortcutsModalProps {
  onClose: () => void;
}

const shortcuts: Array<{ keys: string[]; description: string; section: string }> = [
  { section: 'Navigation', keys: ['/'], description: 'Focus search' },
  { section: 'Navigation', keys: ['Esc'], description: 'Close modals / clear search' },
  { section: 'Quiz mode', keys: ['Q'], description: 'Open quiz mode' },
  { section: 'Quiz mode', keys: ['Space'], description: 'Reveal / hide answer' },
  { section: 'Quiz mode', keys: ['→'], description: 'Next question' },
  { section: 'Quiz mode', keys: ['←'], description: 'Previous question' },
  { section: 'Display', keys: ['T'], description: 'Toggle light / dark theme' },
  { section: 'Display', keys: ['S'], description: 'Open stats' },
  { section: 'Display', keys: ['?'], description: 'Open this shortcuts dialog' },
];

export function ShortcutsModal({ onClose }: ShortcutsModalProps) {
  // Group by section
  const bySection = shortcuts.reduce((acc, s) => {
    (acc[s.section] ||= []).push(s);
    return acc;
  }, {} as Record<string, typeof shortcuts>);

  return (
    <Modal onClose={onClose} ariaLabel="Keyboard shortcuts">
      <div
        className="flex items-center justify-between px-6 py-4 border-b shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
          Keyboard shortcuts
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-md"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Close"
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Icon.X />
        </button>
      </div>

      <div className="overflow-y-auto thin-scroll px-6 py-6 flex-1 space-y-6">
        {Object.entries(bySection).map(([section, items]) => (
          <section key={section}>
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: 'var(--text-muted)' }}
            >
              {section}
            </h3>
            <ul className="space-y-2">
              {items.map((s) => (
                <li key={s.description} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--text)' }}>
                    {s.description}
                  </span>
                  <span className="flex gap-1">
                    {s.keys.map((k) => (
                      <kbd
                        key={k}
                        className="px-2 py-1 text-xs font-mono rounded-md border min-w-[28px] text-center"
                        style={{
                          background: 'var(--bg-subtle)',
                          borderColor: 'var(--border)',
                          color: 'var(--text)',
                        }}
                      >
                        {k}
                      </kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Modal>
  );
}
