import type {
  User,
} from "../types/User";

const STORAGE_KEY =
  "supportdesk-pro-users";

/*
 * Senhas iniciais de demonstração:
 *
 * Administrador:
 * E-mail: admin@supportdesk.com
 * Senha: Admin@123
 *
 * Técnico:
 * E-mail: carlos@supportdesk.com
 * Senha: Tecnico@123
 *
 * Solicitante:
 * E-mail: mariana@supportdesk.com
 * Senha: Solicitante@123
 *
 * As senhas começam em texto puro somente para permitir
 * a inicialização dos usuários de demonstração.
 *
 * No primeiro login, o authService converte automaticamente
 * a senha para hash PBKDF2.
 */

const initialUsers: User[] = [
  {
    id: 1,

    name:
      "Administrador",

    email:
      "admin@supportdesk.com",

    password:
      "Admin@123",

    phone:
      "(11) 99999-0001",

    department:
      "TI",

    role:
      "Administrador",

    storeId:
      null,

    status:
      "Ativo",

    createdAt:
      new Date().toISOString(),
  },

  {
    id: 2,

    name:
      "Carlos Oliveira",

    email:
      "carlos@supportdesk.com",

    password:
      "Tecnico@123",

    phone:
      "(11) 99999-0002",

    department:
      "Suporte",

    role:
      "Técnico",

    storeId:
      null,

    status:
      "Ativo",

    createdAt:
      new Date().toISOString(),
  },

  {
    id: 3,

    name:
      "Mariana Souza",

    email:
      "mariana@supportdesk.com",

    password:
      "Solicitante@123",

    phone:
      "(11) 99999-0003",

    department:
      "Financeiro",

    role:
      "Solicitante",

    /*
     * A Mariana ainda não possui uma loja definida.
     *
     * Como as lojas reais já foram cadastradas, vamos
     * escolher a loja dela posteriormente, através da
     * tela de edição do usuário.
     */
    storeId:
      null,

    status:
      "Ativo",

    createdAt:
      new Date().toISOString(),
  },
];

function saveUsers(
  users: User[]
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      users
    )
  );
}

function getInitialPasswordByEmail(
  email: string
): string | undefined {
  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  const initialUser =
    initialUsers.find(
      (user) =>
        user.email
          .trim()
          .toLowerCase() ===
        normalizedEmail
    );

  return initialUser?.password;
}

function normalizeStoredUser(
  storedUser: unknown
): User | undefined {
  if (
    !storedUser ||
    typeof storedUser !==
      "object"
  ) {
    return undefined;
  }

  const candidate =
    storedUser as Partial<User>;

  if (
    typeof candidate.id !==
      "number" ||
    !Number.isInteger(
      candidate.id
    ) ||
    candidate.id <= 0
  ) {
    return undefined;
  }

  if (
    typeof candidate.name !==
      "string" ||
    typeof candidate.email !==
      "string" ||
    typeof candidate.role !==
      "string" ||
    typeof candidate.status !==
      "string"
  ) {
    return undefined;
  }

  let password =
    typeof candidate.password ===
      "string"
      ? candidate.password
      : "";

  /*
   * Migração de registros antigos.
   *
   * Algumas versões anteriores do sistema podiam manter
   * usuários de demonstração sem o campo password.
   *
   * Como conhecemos as senhas iniciais dessas contas,
   * conseguimos restaurá-las automaticamente.
   */
  if (
    !password
  ) {
    const initialPassword =
      getInitialPasswordByEmail(
        candidate.email
      );

    if (
      initialPassword
    ) {
      password =
        initialPassword;
    }
  }

  /*
   * Migração do vínculo com loja.
   *
   * Usuários criados antes da implementação de lojas
   * não possuem storeId.
   *
   * Administradores e Técnicos podem permanecer sem
   * loja específica.
   *
   * Solicitantes antigos também permanecem sem loja
   * até que o Administrador defina uma loja através
   * da edição do usuário.
   */
  let storeId:
    number | null = null;

  if (
    typeof candidate.storeId ===
    "number" &&
    Number.isInteger(
      candidate.storeId
    ) &&
    candidate.storeId > 0
  ) {
    storeId =
      candidate.storeId;
  }

  /*
   * Administrador e Técnico não ficam vinculados a uma
   * loja específica.
   */
  if (
    candidate.role !==
      "Solicitante"
  ) {
    storeId =
      null;
  }

  return {
    id:
      candidate.id,

    name:
      candidate.name,

    email:
      candidate.email,

    password,

    phone:
      typeof candidate.phone ===
        "string"
        ? candidate.phone
        : "",

    department:
      typeof candidate.department ===
        "string"
        ? candidate.department
        : "",

    role:
      candidate.role as User["role"],

    storeId,

    status:
      candidate.status,

    createdAt:
      typeof candidate.createdAt ===
        "string"
        ? candidate.createdAt
        : new Date().toISOString(),
  };
}

function loadUsers():
  User[] {
  const data =
    localStorage.getItem(
      STORAGE_KEY
    );

  if (!data) {
    saveUsers(
      initialUsers
    );

    return initialUsers;
  }

  try {
    const parsedData =
      JSON.parse(
        data
      ) as unknown;

    if (
      !Array.isArray(
        parsedData
      )
    ) {
      saveUsers(
        initialUsers
      );

      return initialUsers;
    }

    const normalizedUsers =
      parsedData
        .map(
          normalizeStoredUser
        )
        .filter(
          (
            user
          ): user is User =>
            user !==
            undefined
        );

    if (
      normalizedUsers.length ===
      0
    ) {
      saveUsers(
        initialUsers
      );

      return initialUsers;
    }

    /*
     * Salvamos novamente os dados normalizados.
     *
     * Assim a migração acontece automaticamente e o
     * localStorage passa a utilizar o formato atual.
     */
    saveUsers(
      normalizedUsers
    );

    return normalizedUsers;
  } catch {
    saveUsers(
      initialUsers
    );

    return initialUsers;
  }
}

export function findAllUsers():
  User[] {
  return loadUsers();
}

export function findUserById(
  id: number
): User | undefined {
  return loadUsers().find(
    (user) =>
      user.id === id
  );
}

export function createUserRepository(
  user: Omit<
    User,
    "id"
  >
): User {
  const users =
    loadUsers();

  const nextId =
    users.length > 0
      ? Math.max(
          ...users.map(
            (
              currentUser
            ) =>
              currentUser.id
          )
        ) + 1
      : 1;

  const newUser:
    User = {
      id:
        nextId,

      ...user,

      storeId:
        user.role ===
        "Solicitante"
          ? (
              user.storeId ??
              null
            )
          : null,
    };

  users.push(
    newUser
  );

  saveUsers(
    users
  );

  return newUser;
}

export function updateUserById(
  id: number,
  updatedData:
    Partial<User>
): User | undefined {
  const users =
    loadUsers();

  const index =
    users.findIndex(
      (user) =>
        user.id === id
    );

  if (
    index === -1
  ) {
    return undefined;
  }

  const currentUser =
    users[index];

  if (!currentUser) {
    return undefined;
  }

  const updatedUser:
    User = {
      ...currentUser,

      ...updatedData,

      id:
        currentUser.id,

      storeId:
        (
          updatedData.role ??
          currentUser.role
        ) ===
        "Solicitante"
          ? (
              updatedData.storeId !==
              undefined
                ? updatedData.storeId
                : currentUser.storeId ??
                  null
            )
          : null,
    };

  users[index] =
    updatedUser;

  saveUsers(
    users
  );

  return updatedUser;
}

export function deleteUserById(
  id: number
): boolean {
  const users =
    loadUsers();

  const filteredUsers =
    users.filter(
      (user) =>
        user.id !== id
    );

  if (
    filteredUsers.length ===
    users.length
  ) {
    return false;
  }

  saveUsers(
    filteredUsers
  );

  return true;
}