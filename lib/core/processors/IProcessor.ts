import {State} from '../state';

export default interface IProcessor {
  process(relFile: string, state: State): Promise<void>;
}
