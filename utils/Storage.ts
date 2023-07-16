import { JSONContent } from '@tiptap/react';
import { useEffect, useState } from 'react';

export const StorageKeys = Object.freeze({
  EDITOR_CONTENT: 'EDITOR_CONTENT',
  KEYWORD_LIST: 'KEYWORD_LIST',
});
type EditorState = JSONContent | string | null | undefined;

const content = `<h2 style="text-align: center;">Welcome to Perfect editor, for the publisher - publisher</h2>
<p>Perfect editor Support indicating the duplication words, for example, and example. </p>`;

export function useEditorContent() {
  const stored =
    typeof window !== 'undefined' ? localStorage.getItem(StorageKeys.EDITOR_CONTENT) : null;
  const initialContent = stored ? JSON.parse(stored) : content;
  return useLocalStorage<EditorState>(StorageKeys.EDITOR_CONTENT, initialContent);
}

export function useLocalStorage<T>(key: string, fallbackValue: T) {
  const [value, setValue] = useState(fallbackValue);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  return [value, setValue] as const;
}
