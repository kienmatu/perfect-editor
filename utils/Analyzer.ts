import { Editor } from '@tiptap/core';
import { Node } from 'prosemirror-model';
import { RegexMatch, findDuplicatedTokenMatches } from '../lib';

export async function analyze(editor: Editor) {
  console.log('selection:', editor.state.selection);
  editor.chain().selectAll().unsetAllMarks().run();
  const requests: Array<Promise<RegexMatch[]>> = [];
  editor.state.doc.descendants((node: Node, position: number) => {
    if (node.type.name !== 'paragraph' && node.type.name !== 'heading') {
      return;
    }
    if (node.textContent.trim().length === 0) {
      return;
    }
    const text = node.textContent;
    requests.push(findDuplicatedTokenMatches(text, position + 1));
  });

  const results = await Promise.all(requests);

  console.log('results', results);
  results.forEach((r) => {
    r.forEach((match) => {
      editor
        .chain()
        .setTextSelection({
          from: match.index,
          to: match.index + match.word.length,
        })
        .setHighlight({
          color: '#fdd',
        })
        .run();
    });
  });
}
