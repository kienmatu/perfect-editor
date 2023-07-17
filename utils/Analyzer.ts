import { Editor, Range } from '@tiptap/core';
import { Node as ProsemirrorNode } from '@tiptap/pm/model';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import { DuplicatedWords, Punctuation } from '../extensions';
import LinterPlugin, { Result as Issue } from '../extensions/LinterPlugin';

export function analyze(editor: Editor) {
  // const plugins = [DuplicatedWords, Punctuation];
  // runAllLinterPlugins(editor.state.tr.doc, plugins);
}

// function runAllLinterPlugins(doc: ProsemirrorNode, plugins: Array<typeof LinterPlugin>) {
//   const decorations: [any?] = [];

//   const results = plugins
//     .map((RegisteredLinterPlugin) => {
//       return new RegisteredLinterPlugin(doc).scan().getResults();
//     })
//     .flat();

//   results.forEach((issue) => {
//     decorations.push(
//       Decoration.inline(issue.from, issue.to, {
//         class: 'problem',
//       }),
//       Decoration.widget(issue.from, renderIcon(issue))
//     );
//   });

//   DecorationSet.create(doc, decorations);
// }
