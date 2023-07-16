import { Editor } from '@tiptap/core';
import { Node } from 'prosemirror-model';

export function analyze(editor: Editor) {
  console.log('doc:', editor.state.doc);
  console.log('---------');
  editor.state.doc.content.forEach((node) => {
    findDuplicates(node!);
  });
}

function findDuplicates(node: Node) {
  if (node.type.isText || node.type.name == 'paragraph') {
    console.log('Text:', node.text);
  } else {
    node.content.forEach((n) => {
      findDuplicates(n);
    });
  }
}
