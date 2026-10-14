declare module "node:sqlite" {
  export class DatabaseSync {
    constructor(filename: string, options?: { readOnly?: boolean });
    prepare(sql: string): { get(slug: string): unknown };
  }
}
