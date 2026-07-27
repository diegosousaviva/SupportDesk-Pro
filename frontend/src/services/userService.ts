import type { User } from "../types/User";

import {
  createUserRepository,
  deleteUserById,
  findAllUsers,
  findUserById,
  updateUserById,
} from "../repositories/userRepository";

export type CreateUserData = Omit<User, "id">;

export function getUsers(): User[] {
  return findAllUsers();
}

export function getUserById(
  id: number
): User | undefined {
  return findUserById(id);
}

export function createUser(
  userData: CreateUserData
): User {
  return createUserRepository(userData);
}

export function updateUser(
  id: number,
  updatedData: Partial<User>
): User | undefined {
  return updateUserById(id, updatedData);
}

export function deleteUser(
  id: number
): boolean {
  return deleteUserById(id);
}