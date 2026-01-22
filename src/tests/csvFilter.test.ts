import { csvFilter } from '../core/csvFilter';

describe('csvFilter', () => {
  it('runs', () => {
    expect(csvFilter('hello, world')).toEqual('hello, world');
  });
});
