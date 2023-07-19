import { Node } from '@tiptap/pm/model';

import LinterPlugin from '../LinterPlugin';
import { findDuplicatedMatches } from '../../../lib/FindDuplicatedWords';

export class DuplicatedWords extends LinterPlugin {
  scan() {
    this.doc.descendants((node: Node, position: number) => {
      const matches = findDuplicatedMatches(node);
      if (matches) {
        matches.forEach((m) => {
          this.record(
            `This word is duplicated: '${m.word}'`,
            position + m.index,
            position + m.index + m.word.length
          );
        });
      }
    });

    return this;
  }
}
