import { Node as ProsemirrorNode } from '@tiptap/pm/model';
import { Result } from '../../lib';

export default class SegmenterPlugin {
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

  async scan() {
    return this;
  }

  async getResults() {
    const that = await this.scan();
    return that.results;
  }
}
