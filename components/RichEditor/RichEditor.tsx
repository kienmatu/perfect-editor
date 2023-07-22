import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import Highlight from '@tiptap/extension-highlight';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import { useEffect } from 'react';

import { useEditorContent } from '../../utils/Storage';
import { DuplicatedWords, Linter, Punctuation } from '../../extensions/linter';
import { SearchAndReplace } from '../../extensions/searchAndReplace';

export interface RichEditorProps {
  btnSaveClickCount: number;
  keywords: string;
}
const pluginWithoutSegment = [DuplicatedWords, Punctuation];

export function RichEditor(props: RichEditorProps) {
  const [content, setContent] = useEditorContent();
  const searchExtension = SearchAndReplace.configure({ caseSensitive: false });
  searchExtension.storage.searchTerm = props.keywords;
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Linter.configure({
        plugins: pluginWithoutSegment,
      }),
      searchExtension,
    ],
    content: content,
  });

  useEffect(() => {
    if (props.btnSaveClickCount > 0) {
      const json = editor?.getJSON();
      if (json) {
        setContent(json);
      }
    }
  }, [props.btnSaveClickCount]);

  useEffect(() => {
    if (props.keywords !== undefined && props.keywords !== null) {
      editor?.commands.setSearchTerm(props.keywords);
    }
  }, [props.keywords]);

  return (
    <RichTextEditor editor={editor} style={{ minHeight: '400px' }}>
      <RichTextEditor.Toolbar stickyOffset={60}>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
          <RichTextEditor.Strikethrough />
          <RichTextEditor.ClearFormatting />
          <RichTextEditor.Highlight />
          <RichTextEditor.Code />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.H1 />
          <RichTextEditor.H2 />
          <RichTextEditor.H3 />
          <RichTextEditor.H4 />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Blockquote />
          <RichTextEditor.Hr />
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
          <RichTextEditor.Subscript />
          <RichTextEditor.Superscript />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Link />
          <RichTextEditor.Unlink />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.AlignLeft />
          <RichTextEditor.AlignCenter />
          <RichTextEditor.AlignJustify />
          <RichTextEditor.AlignRight />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>

      <RichTextEditor.Content />
    </RichTextEditor>
  );
}
