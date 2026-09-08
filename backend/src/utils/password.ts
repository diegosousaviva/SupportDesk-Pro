import {
  pbkdf2,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

import {
  promisify,
} from "node:util";

const HASH_PREFIX =
  "pbkdf2";

const HASH_ALGORITHM =
  "sha256";

const ITERATIONS =
  210_000;

const SALT_LENGTH =
  16;

const HASH_LENGTH =
  32;

const MINIMUM_PASSWORD_LENGTH =
  8;

const pbkdf2Async =
  promisify(
    pbkdf2
  );

export interface PasswordValidationResult {
  valid: boolean;

  errors: string[];
}

function bytesToBase64(
  bytes: Buffer
): string {
  return bytes.toString(
    "base64"
  );
}

function base64ToBuffer(
  value: string
): Buffer {
  return Buffer.from(
    value,
    "base64"
  );
}

function isValidIterationCount(
  value: string
): boolean {
  const iterations =
    Number(
      value
    );

  return (
    Number.isInteger(
      iterations
    ) &&
    iterations > 0
  );
}

export function validateStrongPassword(
  password: string
): PasswordValidationResult {
  const errors:
    string[] = [];

  if (
    password.length <
    MINIMUM_PASSWORD_LENGTH
  ) {
    errors.push(
      `A senha deve possuir pelo menos ${MINIMUM_PASSWORD_LENGTH} caracteres.`
    );
  }

  if (
    !/[A-Z]/.test(
      password
    )
  ) {
    errors.push(
      "A senha deve possuir pelo menos uma letra maiúscula."
    );
  }

  if (
    !/[a-z]/.test(
      password
    )
  ) {
    errors.push(
      "A senha deve possuir pelo menos uma letra minúscula."
    );
  }

  if (
    !/[0-9]/.test(
      password
    )
  ) {
    errors.push(
      "A senha deve possuir pelo menos um número."
    );
  }

  if (
    !/[^A-Za-z0-9]/.test(
      password
    )
  ) {
    errors.push(
      "A senha deve possuir pelo menos um caractere especial."
    );
  }

  if (
    /\s/.test(
      password
    )
  ) {
    errors.push(
      "A senha não pode possuir espaços."
    );
  }

  return {
    valid:
      errors.length ===
      0,

    errors,
  };
}

export function assertStrongPassword(
  password: string
): void {
  const validation =
    validateStrongPassword(
      password
    );

  if (
    validation.valid
  ) {
    return;
  }

  throw new Error(
    validation.errors[0] ??
      "A senha informada não atende aos requisitos de segurança."
  );
}

export function isPasswordHash(
  value: string
): boolean {
  const parts =
    value.split(
      "$"
    );

  if (
    parts.length !==
    4
  ) {
    return false;
  }

  const [
    prefix,
    iterations,
    salt,
    hash,
  ] =
    parts;

  return (
    prefix ===
      HASH_PREFIX &&
    isValidIterationCount(
      iterations
    ) &&
    salt.length >
      0 &&
    hash.length >
      0
  );
}

async function derivePasswordHash(
  password: string,
  salt: Buffer,
  iterations: number
): Promise<Buffer> {
  const derivedKey =
    await pbkdf2Async(
      password,
      salt,
      iterations,
      HASH_LENGTH,
      HASH_ALGORITHM
    );

  return derivedKey;
}

export async function hashPassword(
  password: string
): Promise<string> {
  if (
    password.length <
    6
  ) {
    throw new Error(
      "A senha deve possuir pelo menos 6 caracteres."
    );
  }

  const salt =
    randomBytes(
      SALT_LENGTH
    );

  const hash =
    await derivePasswordHash(
      password,
      salt,
      ITERATIONS
    );

  return [
    HASH_PREFIX,

    ITERATIONS.toString(),

    bytesToBase64(
      salt
    ),

    bytesToBase64(
      hash
    ),
  ].join(
    "$"
  );
}

export async function verifyPassword(
  password: string,
  storedPassword: string
): Promise<boolean> {
  /*
   * Compatibilidade com senhas antigas:
   *
   * Se o valor armazenado ainda não estiver no
   * formato PBKDF2, comparamos temporariamente
   * como texto puro.
   *
   * A migração para PBKDF2 será feita pelo serviço
   * de autenticação após o login bem-sucedido.
   */
  if (
    !isPasswordHash(
      storedPassword
    )
  ) {
    return (
      password ===
      storedPassword
    );
  }

  try {
    const [
      ,
      iterationsValue,
      saltValue,
      hashValue,
    ] =
      storedPassword.split(
        "$"
      );

    const iterations =
      Number(
        iterationsValue
      );

    const salt =
      base64ToBuffer(
        saltValue
      );

    const expectedHash =
      base64ToBuffer(
        hashValue
      );

    const receivedHash =
      await derivePasswordHash(
        password,
        salt,
        iterations
      );

    if (
      receivedHash.length !==
      expectedHash.length
    ) {
      return false;
    }

    return timingSafeEqual(
      receivedHash,
      expectedHash
    );
  } catch {
    return false;
  }
}