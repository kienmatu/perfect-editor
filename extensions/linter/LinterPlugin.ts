import { Node as ProsemirrorNode } from '@tiptap/pm/model';
import { Result } from '../../lib';

export default class LinterPlugin {
  protected doc;

  private results: Array<Result> = [];

  constructor(doc: ProsemirrorNode) {
    this.doc = doc;
  }

  record(message: string, from: number, to: number, fix?: Function) {
    this.results.push({
      message,
      from,
      to,
      fix,
    });
  }

  scan() {
    return this;
  }

  getResults() {
    return this.results;
  }
}
