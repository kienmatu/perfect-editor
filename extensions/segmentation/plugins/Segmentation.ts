import { Node } from '@tiptap/pm/model';

import SegmenterPlugin from '../SegmenterPlugin';
import { findDuplicatedTokenMatches } from '../../../lib';

export class Segmentation extends SegmenterPlugin {
  async scan() {
    this.doc.descendants((node: Node, position: number) => {
      findDuplicatedTokenMatches(node).then((matches) => {
        if (matches) {
          matches.forEach((m) => {
            this.record(
              `This word is duplicated: '${m.word}'`,
              position + m.index + 1,
              position + m.index + m.word.length + 1
            );
          });
        }
      });
    });

    return this;
  }
}
