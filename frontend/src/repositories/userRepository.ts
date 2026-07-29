import type { User } from "../types/User";

const STORAGE_KEY = "supportdesk-pro-users";

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
    name: "Administrador",
    email: "admin@supportdesk.com",
    password: "Admin@123",
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
    password: "Tecnico@123",
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
    password: "Solicitante@123",
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

function loadUsers(): User[] {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    saveUsers(initialUsers);

    return initialUsers;
  }

  try {
    const storedUsers = JSON.parse(data) as User[];

    if (!Array.isArray(storedUsers)) {
      saveUsers(initialUsers);

      return initialUsers;
    }

    return storedUsers;
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