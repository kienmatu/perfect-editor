import { Node } from '@tiptap/pm/model';
import { RegexMatch, WordDictionary } from './Model';

const ignoredCharacters: string[] = ['', ',', '!', '.', ':', '?', '"'];

export const findDuplicatedMatches = (node: Node): RegexMatch[] => {
  if (!node.isText || !node.text) {
    return [];
  }
  const duplicates = findDuplicateOccurrences(node.text);
  const regex = buildDuplicateRegex(duplicates);
  const matches = findAllMatchIndexes(regex, node.text);

  return matches;
};

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
