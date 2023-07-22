import { Extension } from '@tiptap/core';
import { Node as ProsemirrorNode } from '@tiptap/pm/model';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import { Result as Issue, Status } from '../../lib';
import SegmenterPlugin from './SegmenterPlugin';
import { Dispatch, SetStateAction } from 'react';

interface IconDivElement extends HTMLDivElement {
  issue?: Issue;
}

function renderIcon(issue: Issue) {
  const icon: IconDivElement = document.createElement('div');

  icon.className = 'lint-icon';
  icon.title = issue.message;
  icon.issue = issue;

  return icon;
}

function runAllPlugins(doc: ProsemirrorNode, plugins: Array<typeof SegmenterPlugin>) {
  const decorations: [any?] = [];

  const promises = plugins.map(async (registeredPlugin) => {
    return new registeredPlugin(doc).getResults();
  });

  const results = Promise.all(promises);

  results.forEach((issues) => {
    issues.forEach((issue) => {
      decorations.push(
        Decoration.inline(issue.from, issue.to, {
          class: 'problem',
        }),
        Decoration.widget(issue.from, renderIcon(issue))
      );
    });
  });

  return DecorationSet.create(doc, decorations);
}

export interface SegmenterOptions {
  plugins: Array<typeof SegmenterPlugin>;
  status: Status;
  setStatus?: Dispatch<SetStateAction<Status>>;
}
interface SegmenterProps {
  decorations: DecorationSet;
}

export const Segmenter = Extension.create<SegmenterOptions>({
  name: 'segmenter',

  addOptions() {
    return {
      plugins: [],
      status: Status.IDLE,
    };
  },

  addProseMirrorPlugins() {
    const { plugins, status, setStatus } = this.options;
    const editor = this.editor;
    return [
      new Plugin({
        key: new PluginKey('segmenter'),
        state: {
          init(_, { doc }): DecorationSet {
            const initDecor = runAllPlugins(doc, plugins);
            return initDecor;
          },
          apply(tr, oldState): DecorationSet {
            // if (!tr.docChanged || editor.view.composing || status === Status.IDLE) {
            //   return oldState;
            // }
            if (status === Status.STARTED) {
              const newDecorations = runAllPlugins(tr.doc, plugins);
              if (setStatus) {
                setStatus(Status.IDLE);
              }
              return newDecorations;
            }

            return oldState;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
          handleClick(view, _, event) {
            const target = event.target as IconDivElement;

            if (/lint-icon/.test(target.className) && target.issue) {
              const { from, to } = target.issue;

              view.dispatch(
                view.state.tr
                  .setSelection(TextSelection.create(view.state.doc, from, to))
                  .scrollIntoView()
              );

              return true;
            }

            return false;
          },
          handleDoubleClick(view, _, event) {
            const target = event.target as IconDivElement;

            if (/lint-icon/.test((event.target as HTMLElement).className) && target.issue) {
              const prob = target.issue;

              if (prob.fix) {
                prob.fix(view, prob);
                view.focus();
                return true;
              }
            }

            return false;
          },
        },
      }),
    ];
  },
});
