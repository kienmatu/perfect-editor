import { Extension } from '@tiptap/core';
import { Node as ProsemirrorNode } from '@tiptap/pm/model';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import { Result as Issue } from '../../lib';
import LinterPlugin from './LinterPlugin';

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

function runAllLinterPlugins(doc: ProsemirrorNode, plugins: Array<typeof LinterPlugin>) {
  const decorations: [any?] = [];

  const results = plugins
    .map((RegisteredLinterPlugin) => {
      return new RegisteredLinterPlugin(doc).scan().getResults();
    })
    .flat();

  results.forEach((issue) => {
    decorations.push(
      Decoration.inline(issue.from, issue.to, {
        class: 'problem',
      }),
      Decoration.widget(issue.from, renderIcon(issue))
    );
  });

  return DecorationSet.create(doc, decorations);
}

export interface LinterOptions {
  plugins: Array<typeof LinterPlugin>;
}
interface LinterProps {
  oldDecorations: DecorationSet;
  decorations: DecorationSet;
  stopped: boolean;
}

export const Linter = Extension.create<LinterOptions>({
  name: 'linter',
  addOptions() {
    return {
      plugins: [],
    };
  },

  addProseMirrorPlugins() {
    const { plugins } = this.options;
    const editor = this.editor;
    return [
      new Plugin({
        key: new PluginKey('linter'),
        state: {
          init(_, { doc }): LinterProps {
            const initDecor = runAllLinterPlugins(doc, plugins);
            return {
              oldDecorations: initDecor,
              decorations: initDecor,
              stopped: true,
            };
          },
          apply(tr, oldState): LinterProps {
            if (!tr.docChanged) {
              return oldState;
            }
            const newDecorations = runAllLinterPlugins(tr.doc, plugins);
            // might be redundant
            const stopped = !editor.view.composing;
            return {
              oldDecorations: oldState.decorations,
              decorations: newDecorations,
              stopped: stopped,
            };
          },
        },
        props: {
          decorations(state) {
            const props = this.getState(state);
            if (props?.stopped) {
              return props.decorations;
            }
            return props?.oldDecorations;
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
