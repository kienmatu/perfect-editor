import { RichTextEditor, Link } from '@mantine/tiptap';
import { Editor, Extensions, useEditor } from '@tiptap/react';
import Highlight from '@tiptap/extension-highlight';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import { Dispatch, SetStateAction, useEffect } from 'react';

import { useEditorContent } from '../../utils/Storage';
import { DuplicatedWords, Linter, Punctuation } from '../../extensions/linter';
import { SearchAndReplace } from '../../extensions/searchAndReplace';
import { analyze } from '../../utils/Analyzer';
import { Status } from '../../lib';

export interface RichEditorProps {
  btnSaveClickCount: number;
  status: Status;
  setStatus: Dispatch<SetStateAction<Status>>;
  keywords: string;
  enableLinter: boolean;
}

const linterPlugins = [DuplicatedWords, Punctuation];
const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export function RichEditor(props: RichEditorProps) {
  const [content, setContent] = useEditorContent();
  const searchExtension = SearchAndReplace.configure({ caseSensitive: false });
  searchExtension.storage.searchTerm = props.keywords;
  const extensions: Extensions = [
    StarterKit,
    Underline,
    Link,
    Superscript,
    SubScript,
    Highlight,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    searchExtension,
  ];

  if (props.enableLinter) {
    extensions.push(
      Linter.configure({
        plugins: linterPlugins,
      })
    );
  }
  const editor = useEditor({
    extensions: extensions,
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
    const fetcher = async (editor: Editor) => {
      await analyze(editor);
      // await sleep(200);
    };
    if (props.status === Status.STARTED && editor) {
      props.setStatus(Status.RUNNING);
      fetcher(editor)
        .catch((err) => console.log)
        .finally(() => {
          console.log('ANALYZED');
          props.setStatus(Status.IDLE);
        });
    }
  }, [props.status]);

  useEffect(() => {
    if (props.keywords !== undefined && props.keywords !== null) {
      editor?.commands.setSearchTerm(props.keywords);
    }
  }, [props.keywords]);

  return (
    <RichTextEditor id="mantine-perfector" editor={editor} style={{ minHeight: '400px' }}>
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
