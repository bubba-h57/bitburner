/**
 * A map is an object that holds a mapping between string keys and some consistent type.
 */
export interface IMap<T> {
  [key: string]: T;
}
