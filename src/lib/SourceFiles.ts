import { NS, SourceFileLvl } from 'Bitburner';

interface SourceFileDictionary {
  [key: number]: number;
}

export class SourceFiles {
  sourceFiles: SourceFileDictionary = {};

  constructor(ns: NS) {
    ns.getOwnedSourceFiles().forEach(function (srcFileLevel: SourceFileLvl) {
      this.sourceFiles[srcFileLevel.n] = srcFileLevel.lvl;
    });
  }

  hasSourceFile(node: number): boolean {
    return node in this.sourceFiles;
  }

  doesNotHaveSourceFile(node: number): boolean {
    return this.hasSourceFile(node);
  }

  level(node: number): number {
    return this.sourceFiles[node];
  }
}
