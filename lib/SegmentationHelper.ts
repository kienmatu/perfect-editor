import { Node } from '@tiptap/pm/model';
import axios from 'axios';

import { RegexMatch, WordDictionary } from './Model';
import { buildDuplicateRegex, cleanWord } from './FindDuplicatedWords';

const ignoredCharacters: string[] = ['', ',', '!', '.', ':', '?', '"'];

export const findDuplicatedTokenMatches = async (
  text: string,
  pos: number
): Promise<RegexMatch[]> => {
  const duplicates = await findDuplicateOccurrencesWithAI(text);
  if (duplicates.length < 1) {
    return [];
  }

  const regex = buildDuplicateRegex(duplicates);
  const matches = findAllMatchIndexesWithBuffer(regex, text, pos);

  return matches;
};

async function findDuplicateOccurrencesWithAI(text: string): Promise<string[]> {
  if (text.trim().length == 0) {
    return [];
  }
  try {
    const response = await axios.post('/api/nlp', {
      method: 'WORD_TOKENIZER',
      text: text,
    });
    const tokens: string[] = response.data.tokens;
    const lowerTokens = tokens.map((x) => x.toLocaleLowerCase());
    const wordCountMap: WordDictionary = {};
    lowerTokens.forEach((token) => {
      if (ignoredCharacters.includes(token)) {
        return;
      }
      const sanitizedWord = cleanWord(token);
      if (wordCountMap[sanitizedWord]) {
        wordCountMap[sanitizedWord]++;
      } else {
        wordCountMap[sanitizedWord] = 1;
      }
    });
    const duplicatedWords = Object.keys(wordCountMap).filter((word) => wordCountMap[word] > 1);
    console.log('tokens:', tokens);
    console.log('MAP:', wordCountMap);
    console.log('duplicatedWords:', duplicatedWords);
    return duplicatedWords;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export function findAllMatchIndexesWithBuffer(
  regex: RegExp,
  text: string,
  pos: number
): RegexMatch[] {
  const matches: RegexMatch[] = [];
  let match;
  let loop = 0;
  while ((match = regex.exec(text)) !== null) {
    matches.push({ word: match[0], index: match.index + pos });
    loop++;
    if (loop > 3000) {
      console.warn('Too much match, prevent crashing..., may be an error');
      break;
    }
  }
  return matches;
}
