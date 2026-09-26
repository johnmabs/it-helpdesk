import { randomUUID } from "node:crypto";

import { IdGenerator } from "./id-generator";

export class RandomIdGenerator implements IdGenerator {
  generate(): string {
    return randomUUID();
  }
}
