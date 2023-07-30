import axios from 'axios';

import { RegexMatch, WordDictionary } from './Model';
import { buildDuplicateRegex } from './FindDuplicatedWords';

const ignoredCharacters: string[] = ['', ',', '!', '.', ':', '?', '"'];

export const findDuplicatedTokenMatches = async (
  text: string,
  pos: number,
  mode: string
): Promise<RegexMatch[]> => {
  const duplicates = await findDuplicateOccurrencesWithAI(text, mode);
  if (duplicates.length < 1) {
    return [];
  }

  const regex = buildDuplicateRegex(duplicates);
  const matches = findAllMatchIndexesWithBuffer(regex, text, pos);

  return matches;
};

async function findDuplicateOccurrencesWithAI(text: string, mode: string): Promise<string[]> {
  if (text.trim().length == 0) {
    return [];
  }
  try {
    let response;
    if (mode == 'node') {
      response = await axios.post('/api/nlp', {
        method: 'WORD_TOKENIZER',
        text: text,
      });
    }
    if (mode == 'python') {
      response = await axios.post('/api/py_tok', {
        text: text,
      });
    }
    const tokens: string[] = response?.data?.tokens;
    const lowerTokens = tokens.map((x) => x.toLocaleLowerCase());

    const wordCountMap: WordDictionary = {};
    lowerTokens.forEach((token, index) => {
      if (ignoredCharacters.includes(token)) {
        return;
      }

      const quoted = getQuotedText(lowerTokens, index);
      if (wordCountMap[quoted]) {
        wordCountMap[quoted]++;
      } else {
        wordCountMap[quoted] = 1;
      }
    });

    const duplicatedWords = Object.keys(wordCountMap).filter((word) => wordCountMap[word] > 1);
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

function getQuotedText(tokens: string[], index: number): string {
  const startIndex = index - 1;
  const endIndex = index + 1;
  if (startIndex < 0 || endIndex >= tokens.length) {
    return tokens[index];
  }
  const isInQuote =
    (tokens[startIndex] == '"' || tokens[startIndex] == '“') &&
    (tokens[endIndex] == '"' || tokens[endIndex] == '”');
  if (isInQuote) {
    return tokens[index - 1] + tokens[index] + tokens[index + 1];
  }
  return tokens[index];
}
