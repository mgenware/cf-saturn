export class Result<T> {
  constructor(
    public result: T,
    public isCached: boolean,
  ) {}
}
