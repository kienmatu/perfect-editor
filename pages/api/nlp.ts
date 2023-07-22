import { NextApiRequest, NextApiResponse } from 'next';
import vntk from 'vntk';

const tokenizer = vntk.wordTokenizer();

enum NLPMethod {
  TOKENIZER = 'TOKENIZER',
  WORD_TOKENIZER = 'WORD_TOKENIZER',
  CHUNKING = 'CHUNKING',
}

type NLPRequestBody = {
  method: NLPMethod;
  text: string;
};
export interface NLPApiRequest extends NextApiRequest {
  // let's say our request accepts name and age property
  body: NLPRequestBody;
}

export default function handler(req: NLPApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { method, text } = req.body;
    switch (method) {
      default:
        let tokens = tokenizer.tag(text);
        if (!Array.isArray(tokens)) {
          tokens = [tokens];
        }
        res.status(200).json({ tokens: tokens });
        break;
    }
  } else {
    res.status(404).json({ message: 'NOT FOUND AHIHI' });
  }
}
