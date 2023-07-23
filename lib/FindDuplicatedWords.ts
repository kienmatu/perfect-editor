import { Node } from '@tiptap/pm/model';
import { RegexMatch, WordDictionary } from './Model';

const ignoredCharacters: string[] = ['', ',', '!', '.', ':', '?', '"'];

export const findDuplicatedMatches = (node: Node): RegexMatch[] => {
  if (node.type.name !== 'paragraph' && node.type.name !== 'heading') {
    return [];
  }
  const duplicates = findDuplicateOccurrences(node.textContent?.toLowerCase());
  if (duplicates.length < 1) {
    return [];
  }
  const regex = buildDuplicateRegex(duplicates);
  const matches = findAllMatchIndexes(regex, node.textContent?.toLowerCase());
  return matches;
};

export function findAllMatchIndexes(regex: RegExp, text: string): RegexMatch[] {
  const matches: RegexMatch[] = [];
  let match;
  let loop = 0;
  while ((match = regex.exec(text)) !== null) {
    matches.push({ word: match[0], index: match.index });
    loop++;
    if (loop > 3000) {
      console.warn('Too much match, prevent crashing..., may be an error');
      break;
    }
  }
  return matches;
}

export function buildDuplicateRegex(words: string[]): RegExp {
  const escapedWords = words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const joinedWords = escapedWords.join('|');

  // const regexPattern = `\\b(${joinedWords})\\b`;
  const regexPattern = `(?<![\\p{L}\\p{N}_])(${joinedWords})(?![\\p{L}\\p{N}_])`;

  // g: global, i: case insensitive, u: full unicode
  return new RegExp(regexPattern, 'igu');
}

// build a simple map with single words, then check duplications
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

/* Removes ignored character from start or end of words.
 * eg: end!! => end, !abc.. => abc
 */
export function cleanWord(input: string): string {
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
