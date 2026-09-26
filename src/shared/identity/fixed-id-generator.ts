import { IdGenerator } from "./id-generator";

export class FixedIdGenerator implements IdGenerator {
  constructor(private readonly id: string) {}

  generate(): string {
    return this.id;
  }
}
