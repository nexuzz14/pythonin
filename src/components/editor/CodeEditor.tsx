'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { basicSetup, EditorView } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { python } from '@codemirror/lang-python';
import { indentUnit } from '@codemirror/language';
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';

export interface CodeEditorProps {
  initialCode: string;
  onChange?: (code: string) => void;
  readOnly?: boolean;
  className?: string;
  onInsertSymbolRef?: React.MutableRefObject<((symbol: string) => void) | null>;
}

// Tema Gelap Editor yang konsisten dengan token globals.css (--color-editor-bg: #0f172a)
const pythonDarkTheme = EditorView.theme(
  {
    '&': {
      color: '#f8fafc',
      backgroundColor: 'var(--color-editor-bg, #0f172a)',
      fontSize: '15px',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      borderRadius: '0.75rem',
      border: '1px solid #334155',
    },
    // Font minimal 16px di mobile (<= 768px) untuk mencegah auto-zoom iOS Safari
    '@media (max-width: 768px)': {
      '&': {
        fontSize: '16px',
      },
    },
    '.cm-content': {
      caretColor: '#38bdf8',
      padding: '12px 4px',
      lineHeight: '1.6',
    },
    '&.cm-focused': {
      outline: 'none',
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.25)',
    },
    '.cm-gutters': {
      backgroundColor: 'var(--color-editor-bg, #0f172a)',
      color: '#64748b',
      borderRight: '1px solid #1e293b',
      paddingRight: '8px',
      userSelect: 'none',
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(51, 65, 85, 0.4)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'rgba(51, 65, 85, 0.4)',
      color: '#94a3b8',
    },
    '.cm-selectionBackground, ::selection': {
      backgroundColor: '#334155 !important',
    },
    '.cm-cursor': {
      borderLeftColor: '#38bdf8',
    },
  },
  { dark: true }
);

export default function CodeEditor({
  initialCode,
  onChange,
  readOnly = false,
  className = '',
  onInsertSymbolRef,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const tabTrapCompartment = useRef(new Compartment());
  const readOnlyCompartment = useRef(new Compartment());
  const [allowTabExit, setAllowTabExit] = useState(false);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Fungsi menyisipkan teks pada posisi kursor aktif
  const insertTextAtCursor = useCallback((text: string) => {
    if (!viewRef.current) return;
    const view = viewRef.current;
    const { from, to } = view.state.selection.main;

    view.dispatch({
      changes: { from, to, insert: text },
      selection: { anchor: from + text.length },
    });
    view.focus();
  }, []);

  // Kaitkan ref untuk SymbolBar di dalam effect (bukan saat render)
  useEffect(() => {
    if (onInsertSymbolRef) {
      onInsertSymbolRef.current = insertTextAtCursor;
    }
    return () => {
      if (onInsertSymbolRef) {
        onInsertSymbolRef.current = null;
      }
    };
  }, [onInsertSymbolRef, insertTextAtCursor]);

  // Inisialisasi CodeMirror 6 saat mount
  useEffect(() => {
    if (!containerRef.current) return;

    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }

    const state = EditorState.create({
      doc: initialCode,
      extensions: [
        basicSetup,
        python(),
        indentUnit.of('    '), // Indentasi 4 spasi
        pythonDarkTheme,
        EditorView.contentAttributes.of({
          autocorrect: 'off',
          autocapitalize: 'off',
          spellcheck: 'false',
          'aria-label': 'Editor Kode Python',
          role: 'textbox',
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && onChangeRef.current) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
        readOnlyCompartment.current.of(EditorState.readOnly.of(readOnly)),
        // Compartment untuk Tab trap (dapat dimatikan saat Esc ditekan)
        tabTrapCompartment.current.of(keymap.of([indentWithTab])),
        // Tangkap tombol Escape untuk navigasi aksesibilitas
        EditorView.domEventHandlers({
          keydown: (event) => {
            if (event.key === 'Escape') {
              setAllowTabExit(true);
              return true;
            }
            if (event.key !== 'Tab') {
              setAllowTabExit(false);
            }
            return false;
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // initialCode dan readOnly hanya dipakai sebagai konfigurasi awal saat mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update readOnly secara dinamis jika berubah
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: readOnlyCompartment.current.reconfigure(EditorState.readOnly.of(readOnly)),
    });
  }, [readOnly]);

  // Update keymap Tab saat Esc ditekan untuk aksesibilitas keluar fokus
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: tabTrapCompartment.current.reconfigure(
        allowTabExit ? [] : keymap.of([indentWithTab])
      ),
    });
  }, [allowTabExit]);

  return (
    <div className={`relative flex flex-col ${className}`}>
      {/* Editor Container */}
      <div
        ref={containerRef}
        className="w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-inner"
      />

      {/* Petunjuk Aksesibilitas Keyboard (Esc lalu Tab) */}
      <div className="mt-1 flex items-center justify-between px-1 text-[11px] text-slate-500">
        <span>
          💡 <kbd className="rounded bg-slate-200 px-1 py-0.5 font-mono text-[10px] text-slate-700">Tab</kbd> untuk indentasi 4 spasi
        </span>
        <span className={allowTabExit ? 'font-semibold text-blue-600' : ''}>
          {allowTabExit
            ? '✅ Tekan Tab sekarang untuk keluar dari editor'
            : 'Aksesibilitas: tekan Esc lalu Tab untuk keluar fokus'}
        </span>
      </div>
    </div>
  );
}
