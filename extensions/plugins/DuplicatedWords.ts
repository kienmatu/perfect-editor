import LinterPlugin from '../LinterPlugin';
import { Node } from 'prosemirror-model';

type WordDictionary = { [word: string]: number };

const ignoredCharacters: string[] = ['', ',', '!', '.', ':', '?', '"'];

export class DuplicatedWords extends LinterPlugin {
  // public regex = /\b(obviously|clearly|evidently|simply)\b/gi;

  scan() {
    this.doc.descendants((node: Node, position: number) => {
      if (!node.isText) {
        return;
      }
      if (!node.text) {
        return;
      }
      const duplicates = findDuplicateOccurrences(node.text);
      const regex = buildDuplicateRegex(duplicates);

      const matches = regex.exec(node.text);

      if (matches) {
        this.record(
          `This word is duplicated: '${matches[0]}'`,
          position + matches.index,
          position + matches.index + matches[0].length
        );
      }
    });

    return this;
  }
}

function buildDuplicateRegex(words: string[]): RegExp {
  const escapedWords = words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const joinedWords = escapedWords.join('|');

  const regexPattern = `\\b(${joinedWords})\\b`;

  return new RegExp(regexPattern, 'ig');
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
