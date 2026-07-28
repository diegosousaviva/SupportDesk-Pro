import type { User } from "../types/User";

const STORAGE_KEY = "supportdesk-pro-users";

type StoredUser = Omit<User, "password"> & {
  password?: string;
};

const DEFAULT_PASSWORD_HASH =
  "pbkdf2$210000$lVAqH2FRQiAkxrOrGuDERA==$uLrFdnCK91RJqDx3Kygi2L7anKM90tpxO5pYQsvv+Vg=";

const DEFAULT_PASSWORD_HASHES: Record<
  string,
  string
> = {
  "admin@supportdesk.com":
    "pbkdf2$210000$YD+N2MVWe9LwtYOlsjiJPg==$kkUcb4YV4v9sco5f7gW7s6E/4MK4CGo7k3BODMqeGFU=",

  "carlos@supportdesk.com":
    "pbkdf2$210000$ztYlHzwuPFukwCzCnV4tjA==$08r1480cua430RBPqmy5x1vYGEV7adKmHuDaX8H6Hzo=",

  "mariana@supportdesk.com":
    "pbkdf2$210000$ixNzr40mibiVgeBAZce+KA==$W9dPUt2R8smRdxmQq/8zVaie1A1uD0Z4/gXaLNxxTgw=",
};

const initialUsers: User[] = [
  {
    id: 1,
    name: "Administrador",
    email: "admin@supportdesk.com",
    password:
      DEFAULT_PASSWORD_HASHES[
        "admin@supportdesk.com"
      ],
    phone: "(11) 99999-0001",
    department: "TI",
    role: "Administrador",
    status: "Ativo",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Carlos Oliveira",
    email: "carlos@supportdesk.com",
    password:
      DEFAULT_PASSWORD_HASHES[
        "carlos@supportdesk.com"
      ],
    phone: "(11) 99999-0002",
    department: "Suporte",
    role: "Técnico",
    status: "Ativo",
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Mariana Souza",
    email: "mariana@supportdesk.com",
    password:
      DEFAULT_PASSWORD_HASHES[
        "mariana@supportdesk.com"
      ],
    phone: "(11) 99999-0003",
    department: "Financeiro",
    role: "Solicitante",
    status: "Ativo",
    createdAt: new Date().toISOString(),
  },
];

function saveUsers(users: User[]): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(users)
  );
}

function getInitialPasswordHash(
  user: StoredUser
): string {
  const normalizedEmail = user.email
    .trim()
    .toLowerCase();

  return (
    DEFAULT_PASSWORD_HASHES[normalizedEmail] ??
    DEFAULT_PASSWORD_HASH
  );
}

function migrateUsers(
  storedUsers: StoredUser[]
): User[] {
  let migrationRequired = false;

  const migratedUsers = storedUsers.map(
    (user) => {
      if (
        typeof user.password === "string" &&
        user.password.length > 0
      ) {
        return user as User;
      }

      migrationRequired = true;

      return {
        ...user,
        password: getInitialPasswordHash(user),
      };
    }
  );

  if (migrationRequired) {
    saveUsers(migratedUsers);
  }

  return migratedUsers;
}

function loadUsers(): User[] {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    saveUsers(initialUsers);

    return initialUsers;
  }

  try {
    const storedUsers = JSON.parse(
      data
    ) as StoredUser[];

    if (!Array.isArray(storedUsers)) {
      saveUsers(initialUsers);

      return initialUsers;
    }

    return migrateUsers(storedUsers);
  } catch {
    saveUsers(initialUsers);

    return initialUsers;
  }
}

export function findAllUsers(): User[] {
  return loadUsers();
}

export function findUserById(
  id: number
): User | undefined {
  return loadUsers().find(
    (user) => user.id === id
  );
}

export function createUserRepository(
  user: Omit<User, "id">
): User {
  const users = loadUsers();

  const nextId =
    users.length > 0
      ? Math.max(
          ...users.map(
            (currentUser) => currentUser.id
          )
        ) + 1
      : 1;

  const newUser: User = {
    id: nextId,
    ...user,
  };

  users.push(newUser);

  saveUsers(users);

  return newUser;
}

export function updateUserById(
  id: number,
  updatedData: Partial<User>
): User | undefined {
  const users = loadUsers();

  const index = users.findIndex(
    (user) => user.id === id
  );

  if (index === -1) {
    return undefined;
  }

  users[index] = {
    ...users[index],
    ...updatedData,
    id: users[index].id,
  };

  saveUsers(users);

  return users[index];
}

export function deleteUserById(
  id: number
): boolean {
  const users = loadUsers();

  const filteredUsers = users.filter(
    (user) => user.id !== id
  );

  if (filteredUsers.length === users.length) {
    return false;
  }

  saveUsers(filteredUsers);

  return true;
}