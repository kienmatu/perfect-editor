import { Extension, Editor } from '@tiptap/core';
import { Node as ProsemirrorNode } from '@tiptap/pm/model';
import { EditorState, Plugin, PluginKey, TextSelection, Transaction } from '@tiptap/pm/state';
import { Decoration, DecorationSet, EditorView } from '@tiptap/pm/view';
import { useState } from 'react';

import LinterPlugin, { Result as Issue } from './LinterPlugin';
import { debounce } from '../lib';

// https://github.dev/lukesmurray/prosemirror-async-query/blob/main/src/AsyncFlowExtension.tsx
// https://prosemirror-async-query.vercel.app/
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

export interface LinterMasterPluginProps {
  pluginKey: PluginKey | string;
  editor: Editor;
  plugins: Array<typeof LinterPlugin>;
  updateDelay: number;
}

export type LinterOptions = Omit<LinterMasterPluginProps, 'editor'>;

export type LinterViewProps = LinterMasterPluginProps & {
  view: EditorView;
};

export const Linter = Extension.create<LinterOptions>({
  name: 'linter',

  addOptions() {
    return {
      plugins: [],
      updateDelay: 800,
      pluginKey: 'linter',
    };
  },

  addProseMirrorPlugins() {
    if (!this.options.plugins) {
      return [];
    }
    const { plugins, updateDelay } = this.options;

    // const debouncedApply = debounce((transaction: Transaction, decorationSet: DecorationSet) => {
    //   return transaction.docChanged ? runAllLinterPlugins(transaction.doc, plugins) : decorationSet;
    // }, 2000);
    return [
      LinterMasterPlugin({
        pluginKey: this.options.pluginKey,
        editor: this.editor,
        plugins: this.options.plugins,
        updateDelay: this.options.updateDelay,
      }),
    ];
  },
});

export class LinterView {
  public editor: Editor;
  public view: EditorView;
  public plugins: Array<typeof LinterPlugin>;
  public updateDelay: number;
  private updateDebounceTimer: number | undefined;

  constructor(props: LinterViewProps) {
    this.editor = props.editor;
    this.view = props.view;
    this.updateDelay = props.updateDelay;
    this.plugins = props.plugins;
  }

  update(view: EditorView, oldState?: EditorState) {
    if (this.updateDelay > 0) {
      this.handleDebouncedUpdate(view, oldState);
      return;
    }

    const docChanged = !oldState?.doc.eq(view.state.doc);

    this.updateHandler(view, docChanged, oldState);
  }

  handleDebouncedUpdate = (view: EditorView, oldState?: EditorState) => {
    const docChanged = !oldState?.doc.eq(view.state.doc);

    if (!docChanged) {
      return;
    }

    if (this.updateDebounceTimer) {
      clearTimeout(this.updateDebounceTimer);
    }

    this.updateDebounceTimer = window.setTimeout(() => {
      this.updateHandler(view, docChanged, oldState);
    }, this.updateDelay);
  };

  updateHandler = (view: EditorView, docChanged: boolean, oldState?: EditorState) => {
    const { state, composing } = view;

    if (composing || !docChanged) {
      return;
    }
    // const decorSet = runAllLinterPlugins(view.state.doc, this.plugins);
    // view.dispatch(view.state.tr)
  };
}

export const LinterMasterPlugin = (options: LinterMasterPluginProps) => {
  return new Plugin({
    key:
      typeof options.pluginKey === 'string' ? new PluginKey(options.pluginKey) : options.pluginKey,
    view: (view) => new LinterView({ view, ...options }),
    state: {
      init(config, instance) {
        return runAllLinterPlugins(instance.doc, options.plugins);
      },
      apply(tr, value, oldState, newState) {
        return tr.docChanged ? runAllLinterPlugins(tr.doc, options.plugins) : value;
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
  });
};
