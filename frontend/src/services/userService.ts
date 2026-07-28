import type { User } from "../types/User";

import {
  createUserRepository,
  deleteUserById,
  findAllUsers,
  findUserById,
  updateUserById,
} from "../repositories/userRepository";

import {
  hashPassword,
  isPasswordHash,
} from "../utils/password";

export type CreateUserData = Omit<User, "id">;

export function getUsers(): User[] {
  return findAllUsers();
}

export function getUserById(
  id: number
): User | undefined {
  return findUserById(id);
}

function validateEmailAvailability(
  email: string,
  ignoredUserId?: number
): void {
  const normalizedEmail = email
    .trim()
    .toLowerCase();

  const emailAlreadyExists = getUsers().some(
    (user) =>
      user.id !== ignoredUserId &&
      user.email.trim().toLowerCase() ===
        normalizedEmail
  );

  if (emailAlreadyExists) {
    throw new Error(
      "Já existe um usuário cadastrado com este e-mail."
    );
  }
}

export async function createUser(
  userData: CreateUserData
): Promise<User> {
  validateEmailAvailability(userData.email);

  const normalizedPassword =
    userData.password.trim();

  const protectedPassword =
    isPasswordHash(normalizedPassword)
      ? normalizedPassword
      : await hashPassword(normalizedPassword);

  return createUserRepository({
    ...userData,
    name: userData.name.trim(),
    email: userData.email.trim().toLowerCase(),
    password: protectedPassword,
    phone: userData.phone.trim(),
    department: userData.department.trim(),
  });
}

export async function updateUser(
  id: number,
  updatedData: Partial<User>
): Promise<User | undefined> {
  const currentUser = getUserById(id);

  if (!currentUser) {
    return undefined;
  }

  if (updatedData.email !== undefined) {
    validateEmailAvailability(
      updatedData.email,
      id
    );
  }

  let password = currentUser.password;

  if (
    updatedData.password !== undefined &&
    updatedData.password.trim() !== ""
  ) {
    const normalizedPassword =
      updatedData.password.trim();

    password = isPasswordHash(
      normalizedPassword
    )
      ? normalizedPassword
      : await hashPassword(
          normalizedPassword
        );
  }

  return updateUserById(id, {
    ...updatedData,
    name:
      updatedData.name !== undefined
        ? updatedData.name.trim()
        : currentUser.name,
    email:
      updatedData.email !== undefined
        ? updatedData.email
            .trim()
            .toLowerCase()
        : currentUser.email,
    phone:
      updatedData.phone !== undefined
        ? updatedData.phone.trim()
        : currentUser.phone,
    department:
      updatedData.department !== undefined
        ? updatedData.department.trim()
        : currentUser.department,
    password,
  });
}

export function deleteUser(
  id: number
): boolean {
  return deleteUserById(id);
}