import { Editor, Range } from '@tiptap/core';
import { Node } from 'prosemirror-model';

type WordDictionary = { [word: string]: number };

const ignoredCharacters: string[] = ['', ',', '!', '.', ':', '?', '"'];

export function analyze(editor: Editor) {
  console.log('selection:', editor.state.selection);
  editor.commands.selectAll();
  editor.commands.unsetAllMarks();

  editor.state.doc.content.forEach((node, index) => {
    const duplicatedWords = findDuplicates(node!);
    console.log(`Found duplicated words at node #${index}:`, duplicatedWords);
    if (duplicatedWords.length > 0) {
      markDuplicates(node!, editor, duplicatedWords);
    }
  });

  editor.commands.selectTextblockEnd();
}

function markDuplicates(node: Node, editor: Editor, duplicatedWords: string[]) {
  if (node.text) {
    let startOffset = 0;
    duplicatedWords.forEach((w) => {
      console.log('node size:', node.nodeSize);
      const ranges = getAllRanges(node.text!, w, startOffset);
      let buffer = 0;
      ranges.forEach((r) => {
        const bufferedRange = {
          from: r.from + buffer,
          to: r.to + buffer,
        };
        editor.chain().setTextSelection(r).setHighlight({ color: '#ffcc00' }).run();
        console.log(`current selection for: ${w}`, editor.state.selection.toJSON());
        buffer++;
      });

      // break line == 2
      startOffset = node.nodeSize + 2;
    });
  }
  if (node.childCount > 0) {
    node.content.forEach((child) => {
      markDuplicates(child, editor, duplicatedWords);
    });
  }
}

function findDuplicates(node: Node): string[] {
  if (node.type.name == 'paragraph' || node.type.name == 'heading') {
    const wordCountMap: WordDictionary = {};
    const words = node.textContent.split(' ');

    words.forEach((word) => {
      if (ignoredCharacters.includes(word)) {
        return;
      }
      const sanitizedWord = cleanWord(word);
      if (wordCountMap[sanitizedWord]) {
        wordCountMap[sanitizedWord]++;
      } else {
        wordCountMap[sanitizedWord] = 1;
      }
    });

    const duplicatedWords = Object.keys(wordCountMap).filter((word) => wordCountMap[word] > 1);
    return duplicatedWords;
  }
  return [];
}

function cleanWord(input: string): string {
  let startIndex = 0;
  let endIndex = input.length - 1;

  // Remove trailing characters
  while (startIndex <= endIndex && ignoredCharacters.includes(input[startIndex])) {
    startIndex++;
  }

  // Remove prefixing characters
  while (endIndex >= startIndex && ignoredCharacters.includes(input[endIndex])) {
    endIndex--;
  }

  return input.slice(startIndex, endIndex + 1);
}

const getAllRanges = (fullString: string, substr: string, startOffset: number): Range[] => {
  const results = [];
  let startIndex = 0;

  while (startIndex !== -1) {
    startIndex = fullString.indexOf(substr, startIndex);

    if (startIndex !== -1) {
      const endIndex = startIndex + substr.length - 1;
      results.push({ from: startIndex + 1 + startOffset, to: endIndex + 2 + startOffset });
      startIndex += 1;
    }
  }

  return results;
};
