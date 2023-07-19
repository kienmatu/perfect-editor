import { Editor, Range } from '@tiptap/core';
import { EditorState, Plugin, PluginKey } from '@tiptap/pm/state';
import { Node } from '@tiptap/pm/model';
import { Decoration, DecorationSet, EditorView } from '@tiptap/pm/view';

import { findDuplicatedMatches } from '../../lib/FindDuplicatedWords.js';
import { RegexMatch, Result } from '../../lib/Model.js';

export interface DuplicationDetectionOptions<I = any> {
  pluginKey?: PluginKey;
  editor: Editor;
  char?: string;
  allowSpaces?: boolean;
  allowedPrefixes?: string[] | null;
  startOfLine?: boolean;
  decorationTag?: string;
  decorationClass?: string;
  command?: (props: { editor: Editor; range: Range; props: I }) => void;
  items?: (props: { query: string; editor: Editor }) => I[] | Promise<I[]>;
  render?: () => {
    onBeforeStart?: (props: DuplicationDetectionProps<I>) => void;
    onStart?: (props: DuplicationDetectionProps<I>) => void;
    onBeforeUpdate?: (props: DuplicationDetectionProps<I>) => void;
    onUpdate?: (props: DuplicationDetectionProps<I>) => void;
    onExit?: (props: DuplicationDetectionProps<I>) => void;
    onKeyDown?: (props: DuplicationDetectionKeyDownProps) => boolean;
  };
  allow?: (props: { editor: Editor; state: EditorState; range: Range }) => boolean;
}

export interface DuplicationDetectionProps<I = any> {
  editor: Editor;
  range: Range;
  query: string;
  text: string;
  items: I[];
  command: (props: I) => void;
  decorationNode: Element | null;
  clientRect?: (() => DOMRect | null) | null;
}

export interface DuplicationDetectionKeyDownProps {
  view: EditorView;
  event: KeyboardEvent;
  range: Range;
}

export const DuplicationDetectionPluginKey = new PluginKey('suggestion');

export function DuplicationDetection<I = any>({
  pluginKey = DuplicationDetectionPluginKey,
  editor,
  char = '@',
  allowSpaces = false,
  allowedPrefixes = [' '],
  startOfLine = false,
  decorationTag = 'span',
  decorationClass = 'problem',
  command = () => null,
  items = () => [],
  render = () => ({}),
  allow = () => true,
}: DuplicationDetectionOptions<I>) {
  let props: DuplicationDetectionProps<I> | undefined;
  const renderer = render?.();

  const plugin: Plugin<any> = new Plugin({
    key: pluginKey,

    view() {
      return {
        update: async (view, prevState) => {
          const prev = this.key?.getState(prevState);
          const next = this.key?.getState(view.state);

          // See how the state changed
          const moved = prev.active && next.active && prev.range.from !== next.range.from;
          const started = !prev.active && next.active;
          const stopped = prev.active && !next.active;
          const changed = !started && !stopped && prev.query !== next.query;
          const handleStart = started || moved;
          const handleChange = changed && !moved;
          const handleExit = stopped || moved;

          // Cancel when suggestion isn't active
          if (!handleStart && !handleChange && !handleExit) {
            return;
          }

          const state = handleExit && !handleStart ? prev : next;
          const decorationNode = view.dom.querySelector(
            `[data-decoration-id="${state.decorationId}"]`
          );

          props = {
            editor,
            range: state.range,
            query: state.query,
            text: state.text,
            items: [],
            command: (commandProps) => {
              command({
                editor,
                range: state.range,
                props: commandProps,
              });
            },
            decorationNode,
            // virtual node for popper.js or tippy.js
            // this can be used for building popups without a DOM node
            clientRect: decorationNode
              ? () => {
                  // because of `items` can be asynchrounous we'll search for the current decoration node
                  const { decorationId } = this.key?.getState(editor.state); // eslint-disable-line
                  const currentDecorationNode = view.dom.querySelector(
                    `[data-decoration-id="${decorationId}"]`
                  );

                  return currentDecorationNode?.getBoundingClientRect() || null;
                }
              : null,
          };

          if (handleChange || handleStart) {
            props.items = await items({
              editor,
              query: state.query,
            });
          }
        },

        destroy: () => {
          if (!props) {
            return;
          }

          renderer?.onExit?.(props);
        },
      };
    },

    state: {
      // Initialize the plugin's internal state.
      init() {
        const state: {
          active: boolean;
          results: Result[];
          composing: boolean;
          decorationId?: string | null;
        } = {
          active: false,
          results: [],
          composing: false,
        };

        return state;
      },

      // Apply changes to the plugin state from a view transaction.
      apply(transaction, prev, oldState, state) {
        const { isEditable } = editor;
        const { composing } = editor.view;
        const next = { ...prev };

        next.composing = composing;

        if (isEditable && !editor.view.composing) {
          // Try to match against where our cursor currently is
          const results: Result[] = [];
          transaction.doc.descendants((node: Node, position: number) => {
            findDuplicatedMatches(node).forEach((m) => {
              results.push({
                message: `This word is duplicated: '${m.word}'`,
                from: position + m.index,
                to: position + m.index + m.word.length,
              });
            });
          });
          const decorationId = `id_${Math.floor(Math.random() * 0xffffffff)}`;

          // If we found a match, update the current state to show it
          if (results) {
            next.active = true;
            next.decorationId = prev.decorationId ? prev.decorationId : decorationId;
            next.results = results;
          } else {
            next.active = false;
          }
        } else {
          next.active = false;
        }

        // Make sure to empty the range if suggestion is inactive
        if (!next.active) {
          next.decorationId = null;
          next.results = prev.results;
        }

        return next;
      },
    },

    props: {
      // Call the keydown hook if suggestion is active.
      handleKeyDown(view, event) {
        const { active, range } = plugin.getState(view.state);

        if (!active) {
          return false;
        }

        return renderer?.onKeyDown?.({ view, event, range }) || false;
      },

      // Setup decorator on the currently active suggestion.
      decorations(state: EditorState) {
        const { active, results, decorationId } = plugin.getState(state);

        if (!active) {
          return null;
        }
        const decorations: Decoration[] = [];
        results.forEach((r: Result) => {
          decorations.push(
            Decoration.inline(r.from, r.to, {
              class: 'problem',
            })
            // Decoration.widget(m.from, renderIcon(issue))
          );
        });
        return DecorationSet.create(state.doc, decorations);
      },
    },
  });

  return plugin;
}
