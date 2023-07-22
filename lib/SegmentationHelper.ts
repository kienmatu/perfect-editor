import { Node } from '@tiptap/pm/model';
import vntk from 'vntk';

import { RegexMatch, WordDictionary } from './Model';
import { buildDuplicateRegex, cleanWord, findAllMatchIndexes } from './FindDuplicatedWords';

const tokenizer = vntk.wordTokenizer();
const ignoredCharacters: string[] = ['', ',', '!', '.', ':', '?', '"'];

export const findDuplicatedTokenMatches = (node: Node): RegexMatch[] => {
  if (node.type.name !== 'paragraph' && node.type.name !== 'heading') {
    return [];
  }
  const duplicates = findDuplicateOccurrencesWithAI(node.textContent?.toLowerCase());
  if (duplicates.length < 1) {
    return [];
  }
  const regex = buildDuplicateRegex(duplicates);
  const matches = findAllMatchIndexes(regex, node.textContent?.toLowerCase());
  return matches;
};

function findDuplicateOccurrencesWithAI(text: string): string[] {
  const wordCountMap: WordDictionary = {};
  const words = text.split(' ');
  let tokens = tokenizer.tag(text);
  if (!Array.isArray(tokens)) {
    tokens = [tokens];
  }

  tokens.forEach((token) => {
    const sanitizedToken = cleanWord(token);
    if (sanitizedToken === '' || ignoredCharacters.includes(sanitizedToken)) {
      return;
    }
    if (wordCountMap[sanitizedToken]) {
      wordCountMap[sanitizedToken]++;
    } else {
      wordCountMap[sanitizedToken] = 1;
    }
  });

  const duplicatedWords = Object.keys(wordCountMap).filter((word) => wordCountMap[word] > 1);
  return duplicatedWords;
}
