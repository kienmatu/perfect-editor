import { JSONContent } from '@tiptap/react';
import { useEffect, useState } from 'react';

export const StorageKeys = Object.freeze({
  EDITOR_CONTENT: 'EDITOR_CONTENT',
  KEYWORD_LIST: 'KEYWORD_LIST',
  AI_EDITION: 'AI',
});
type EditorState = JSONContent | string | null | undefined;

const content = `<h2 style="text-align: center;">Welcome to Perfect editor, for the publisher - publisher</h2>
<p>Hỗ trợ tìm kiếm các từ bị lặp trong 1 đoạn văn, ví dụ đoạn văn này.</p>`;

export function useAI() {
  const stored =
    typeof window !== 'undefined' ? localStorage.getItem(StorageKeys.AI_EDITION) : null;
  const initialContent = stored ? JSON.parse(stored) : 'python';
  return useLocalStorage<string>(StorageKeys.AI_EDITION, initialContent);
}

export function useEditorContent() {
  const stored =
    typeof window !== 'undefined' ? localStorage.getItem(StorageKeys.EDITOR_CONTENT) : null;
  const initialContent = stored ? JSON.parse(stored) : content;
  return useLocalStorage<EditorState>(StorageKeys.EDITOR_CONTENT, initialContent);
}

export function useKeywords() {
  const stored =
    typeof window !== 'undefined' ? localStorage.getItem(StorageKeys.KEYWORD_LIST) : null;
  const initialContent = stored ? JSON.parse(stored) : 'tìm kiếm';
  return useLocalStorage<string>(StorageKeys.KEYWORD_LIST, initialContent);
}

export function useLocalStorage<T>(key: string, fallbackValue: T) {
  const [value, setValue] = useState(fallbackValue);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savingValue = value !== undefined && value !== null ? value : '';
      localStorage.setItem(key, JSON.stringify(savingValue));
    }
  }, [key, value]);

  return [value, setValue] as const;
}
