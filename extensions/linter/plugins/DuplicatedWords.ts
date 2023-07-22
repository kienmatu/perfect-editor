import { Node } from '@tiptap/pm/model';

import LinterPlugin from '../LinterPlugin';
import { findDuplicatedMatches } from '../../../lib';

export class DuplicatedWords extends LinterPlugin {
  scan() {
    this.doc.descendants((node: Node, position: number) => {
      const matches = findDuplicatedMatches(node);
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

    return this;
  }
}
