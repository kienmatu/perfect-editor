import { Editor, Range } from '@tiptap/core';
import { Node } from 'prosemirror-model';
import { RegexMatch, WordDictionary } from '../lib';

const ignoredCharacters: string[] = ['', ',', '!', '.', ':', '?', '"'];

export function analyze(editor: Editor) {
  console.log('selection:', editor.state.selection);
  editor.commands.selectAll();
  editor.commands.unsetAllMarks();

  let buffer = 0;
  editor.state.doc.descendants((node, index) => {
    const text = node.text;
    console.log('Current node: ', node);
    if (!node.isBlock) {
      buffer += index;
    }
    if (!node.isText) {
      return;
    }
    if (!node.text) {
      return;
    }
    const duplicatedWords = findDuplicateOccurrences(node.text);
    const regex = buildDuplicateRegex(duplicatedWords);
    const matches = findAllMatchIndexes(regex, node.text);

    if (duplicatedWords.length > 0) {
      markDuplicates(node!, editor, matches, buffer);
    }
  });

  editor.commands.selectTextblockEnd();
}

function markDuplicates(node: Node, editor: Editor, matches: RegexMatch[], buffer: number) {
  if (node.text) {
    matches.forEach((m) => {
      const range = {
        from: m.index + buffer,
        to: m.index + m.word.length + buffer,
      };
      editor.chain().setTextSelection(range).setHighlight({ color: '#ffcc00' }).run();
      // console.log(`current selection for: ${m.word}`, editor.state.selection.toJSON());
    });
  }
  // if (node.childCount > 0) {
  //   node.descendants((child) => {
  //     markDuplicates(child, editor, matches);
  //   });
  // }
}

function findDuplicateOccurrences(text: string): string[] {
  const wordCountMap: WordDictionary = {};
  const words = text.split(' ');

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

function findAllMatchIndexes(regex: RegExp, text: string): RegexMatch[] {
  const matches: RegexMatch[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push({ word: match[0], index: match.index });
  }
  return matches;
}

function buildDuplicateRegex(words: string[]): RegExp {
  const escapedWords = words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const joinedWords = escapedWords.join('|');

  const regexPattern = `\\b(${joinedWords})\\b`;

  // g: global, i: case insensitive
  return new RegExp(regexPattern, 'ig');
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
