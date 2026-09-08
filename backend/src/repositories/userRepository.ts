import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";

import {
  dirname,
  resolve,
} from "node:path";

import type {
  CreateUserData,
  UpdateUserData,
  User,
} from "../types/user.js";

const DATA_FILE_PATH =
  resolve(
    process.cwd(),
    "data",
    "users.json"
  );

function ensureDataFile(): void {
  const directory =
    dirname(
      DATA_FILE_PATH
    );

  if (
    !existsSync(
      directory
    )
  ) {
    mkdirSync(
      directory,
      {
        recursive: true,
      }
    );
  }

  if (
    !existsSync(
      DATA_FILE_PATH
    )
  ) {
    writeFileSync(
      DATA_FILE_PATH,
      "[]",
      "utf-8"
    );
  }
}

function readUsers(): User[] {
  ensureDataFile();

  try {
    const content =
      readFileSync(
        DATA_FILE_PATH,
        "utf-8"
      );

    if (
      !content.trim()
    ) {
      return [];
    }

    const parsed =
      JSON.parse(
        content
      );

    if (
      !Array.isArray(
        parsed
      )
    ) {
      return [];
    }

    return parsed as User[];
  } catch {
    return [];
  }
}

function writeUsers(
  users: User[]
): void {
  ensureDataFile();

  writeFileSync(
    DATA_FILE_PATH,
    JSON.stringify(
      users,
      null,
      2
    ),
    "utf-8"
  );
}

function getNextUserId(
  users: User[]
): number {
  if (
    users.length ===
    0
  ) {
    return 1;
  }

  const highestId =
    users.reduce(
      (
        highest,
        user
      ) =>
        Math.max(
          highest,
          user.id
        ),
      0
    );

  return (
    highestId +
    1
  );
}

export function findAllUsers():
  User[] {
  return readUsers();
}

export function findUserById(
  id: number
):
  User | undefined {
  const users =
    readUsers();

  return users.find(
    (user) =>
      user.id ===
      id
  );
}

export function findUserByEmail(
  email: string
):
  User | undefined {
  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  const users =
    readUsers();

  return users.find(
    (user) =>
      user.email
        .trim()
        .toLowerCase() ===
      normalizedEmail
  );
}

export function createUserRepository(
  data: CreateUserData
): User {
  const users =
    readUsers();

  const now =
    new Date().toISOString();

  const newUser:
    User = {
    id:
      getNextUserId(
        users
      ),

    name:
      data.name,

    email:
      data.email,

    password:
      data.password,

    phone:
      data.phone,

    department:
      data.department,

    role:
      data.role,

    storeId:
      data.storeId ??
      null,

    status:
      data.status,

    createdAt:
      data.createdAt ??
      now,
  };

  users.push(
    newUser
  );

  writeUsers(
    users
  );

  return newUser;
}

export function updateUserById(
  id: number,
  data: UpdateUserData
):
  User | undefined {
  const users =
    readUsers();

  const index =
    users.findIndex(
      (user) =>
        user.id ===
        id
    );

  if (
    index ===
    -1
  ) {
    return undefined;
  }

  const currentUser =
    users[index];

  const updatedUser:
    User = {
    ...currentUser,

    ...data,

    id:
      currentUser.id,

    createdAt:
      currentUser.createdAt,
  };

  users[index] =
    updatedUser;

  writeUsers(
    users
  );

  return updatedUser;
}

export function deleteUserById(
  id: number
): boolean {
  const users =
    readUsers();

  const filteredUsers =
    users.filter(
      (user) =>
        user.id !==
        id
    );

  if (
    filteredUsers.length ===
    users.length
  ) {
    return false;
  }

  writeUsers(
    filteredUsers
  );

  return true;
}