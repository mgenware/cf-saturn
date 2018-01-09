import Config from '../config';
import PathComponent from 'pathComponent';
import ContentGenerator from 'contentGenerator';

export class State {
  attachedDirTitle: { [key: string]: string} = {};
  calculatedDirTitle: { [key: string]: string } = {};
  calculatedFileTitle: { [key: string]: string } = {};
  dirTitle: { [key: string]: string} = {};
  fileTitle: { [key: string]: string} = {};
  dirPathComponent: { [key: string]: PathComponent } = {}
  dirPathBar: { [key: string]: PathComponent[] } = {};

  constructor(
    public config: Config,
    public contentGenerator: ContentGenerator,
  ) {}
}
