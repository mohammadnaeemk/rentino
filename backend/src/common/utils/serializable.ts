import { Prisma, PrismaClient } from "@prisma/client";

export type TransactionClient = Prisma.TransactionClient;

/**
 * Runs `fn` inside a SERIALIZABLE transaction, retrying on Postgres
 * serialization failures (Prisma `P2034`). Used by booking and payment flows
 * where concurrent writers must not interleave.
 */
export async function runSerializable<T>(
  prisma: PrismaClient,
  fn: (tx: TransactionClient) => Promise<T>,
): Promise<T> {
  const maxAttempts = 3;

  for (let attempt = 1; ; attempt += 1) {
    try {
      return await prisma.$transaction(fn, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      const isWriteConflict =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034";

      if (isWriteConflict && attempt < maxAttempts) {
        continue;
      }
      throw error;
    }
  }
}
