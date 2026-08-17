const HASH_PREFIX =
  "pbkdf2";

const HASH_ALGORITHM =
  "SHA-256";

const ITERATIONS =
  210_000;

const SALT_LENGTH =
  16;

const HASH_LENGTH =
  256;

const MINIMUM_PASSWORD_LENGTH =
  8;

export interface PasswordValidationResult {
  valid:
    boolean;

  errors:
    string[];
}

function bytesToBase64(
  bytes: Uint8Array
): string {
  let binary =
    "";

  for (
    const byte of bytes
  ) {
    binary +=
      String.fromCharCode(
        byte
      );
  }

  return window.btoa(
    binary
  );
}

function base64ToBytes(
  value: string
): Uint8Array {
  const binary =
    window.atob(
      value
    );

  return Uint8Array.from(
    binary,
    (
      character
    ) =>
      character.charCodeAt(
        0
      )
  );
}

async function derivePasswordHash(
  password: string,
  salt: Uint8Array,
  iterations: number
): Promise<Uint8Array> {
  const passwordBytes =
    new TextEncoder().encode(
      password
    );

  const passwordKey =
    await window.crypto.subtle.importKey(
      "raw",
      passwordBytes,
      {
        name:
          "PBKDF2",
      },
      false,
      [
        "deriveBits",
      ]
    );

  const derivedBits =
    await window.crypto.subtle.deriveBits(
      {
        name:
          "PBKDF2",

        hash:
          HASH_ALGORITHM,

        salt,

        iterations,
      },
      passwordKey,
      HASH_LENGTH
    );

  return new Uint8Array(
    derivedBits
  );
}

function compareBytes(
  first: Uint8Array,
  second: Uint8Array
): boolean {
  if (
    first.length !==
    second.length
  ) {
    return false;
  }

  let difference =
    0;

  for (
    let index = 0;
    index <
    first.length;
    index += 1
  ) {
    difference |=
      first[index] ^
      second[index];
  }

  return (
    difference ===
    0
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

  return (
    parts.length ===
      4 &&
    parts[0] ===
      HASH_PREFIX &&
    Number.isInteger(
      Number(
        parts[1]
      )
    ) &&
    Number(
      parts[1]
    ) >
      0 &&
    parts[2].length >
      0 &&
    parts[3].length >
      0
  );
}

export async function hashPassword(
  password: string
): Promise<string> {
  /*
   * Aqui fazemos somente a proteção criptográfica.
   *
   * A política de senha forte é aplicada pelo serviço
   * de usuários antes de chamar esta função.
   *
   * Isso permite que senhas antigas sejam migradas
   * automaticamente no primeiro login.
   */
  if (
    password.length <
    6
  ) {
    throw new Error(
      "A senha deve possuir pelo menos 6 caracteres."
    );
  }

  const salt =
    window.crypto.getRandomValues(
      new Uint8Array(
        SALT_LENGTH
      )
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
      base64ToBytes(
        saltValue
      );

    const expectedHash =
      base64ToBytes(
        hashValue
      );

    const receivedHash =
      await derivePasswordHash(
        password,
        salt,
        iterations
      );

    return compareBytes(
      receivedHash,
      expectedHash
    );
  } catch {
    return false;
  }
}