/** Categories are converted to strings when packed. */
export type Category = string | number | boolean | null | undefined

export type PackInput = string | readonly string[] | ReadonlySet<string> | Record<string, Category | readonly Category[]>

export interface PackOptions {
  /** Reject unsupported keys and normalization collisions. */
  strict?: boolean
  /** Choose prefix sharing, suffix sharing, or the smaller encoding per category. */
  direction?: 'prefix' | 'suffix' | 'auto'
  /** Use a fragment dictionary when it reduces the packed size. */
  dictionary?: boolean
}

/** Only the category "true" is restored as a boolean; other categories are strings. */
export type UnpackedValue = string | true | (string | true)[]
export type Unpacked = Record<string, UnpackedValue>

export declare function pack(input?: PackInput | null, options?: PackOptions): string
export declare function unpack(input?: string | null): Unpacked
export declare const version: string
