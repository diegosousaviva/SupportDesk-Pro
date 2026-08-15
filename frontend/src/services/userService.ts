import type {
  User,
  UserStatus,
} from "../types/User";

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

import {
  createAuditLog,
} from "./auditLogService";

import {
  getCurrentUser,
} from "./authService";

import {
  createUserHistory,
} from "./userHistoryService";

export type CreateUserData = Omit<
  User,
  "id"
>;

function getAuditUser(): {
  userId: number | null;
  userName: string;
} {
  const currentUser =
    getCurrentUser();

  if (!currentUser) {
    return {
      userId: null,
      userName: "Sistema",
    };
  }

  return {
    userId:
      currentUser.id,

    userName:
      currentUser.name,
  };
}

function registerUserAudit(
  targetUserId: number,
  action:
    | "Criação"
    | "Edição"
    | "Exclusão"
    | "Alteração de status",
  description: string,
  details?: string
): void {
  const auditUser =
    getAuditUser();

  createAuditLog({
    module:
      "Usuários",

    action,

    userId:
      auditUser.userId,

    userName:
      auditUser.userName,

    entityId:
      targetUserId,

    description,

    details,
  });
}

export function getUsers(): User[] {
  return findAllUsers();
}

export function getUserById(
  id: number
): User | undefined {
  return findUserById(
    id
  );
}

function validateEmailAvailability(
  email: string,
  ignoredUserId?: number
): void {
  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  const emailAlreadyExists =
    getUsers().some(
      (user) =>
        user.id !==
          ignoredUserId &&
        user.email
          .trim()
          .toLowerCase() ===
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
  validateEmailAvailability(
    userData.email
  );

  const normalizedPassword =
    userData.password.trim();

  const protectedPassword =
    isPasswordHash(
      normalizedPassword
    )
      ? normalizedPassword
      : await hashPassword(
          normalizedPassword
        );

  const newUser =
    createUserRepository({
      ...userData,

      name:
        userData.name.trim(),

      email:
        userData.email
          .trim()
          .toLowerCase(),

      password:
        protectedPassword,

      phone:
        userData.phone.trim(),

      department:
        userData.department.trim(),
    });

  createUserHistory({
    userId:
      newUser.id,

    action:
      "created",

    title:
      "Usuário criado",

    description:
      "O cadastro do usuário foi criado no sistema.",

    performedBy:
      "Sistema",

    createdAt:
      newUser.createdAt,
  });

  registerUserAudit(
    newUser.id,
    "Criação",
    `Usuário "${newUser.name}" criado.`,
    `E-mail: ${newUser.email} | Perfil: ${newUser.role} | Status: ${newUser.status}`
  );

  return newUser;
}

export async function updateUser(
  id: number,
  updatedData: Partial<User>
): Promise<User | undefined> {
  const currentUser =
    getUserById(
      id
    );

  if (!currentUser) {
    return undefined;
  }

  if (
    updatedData.email !==
    undefined
  ) {
    validateEmailAvailability(
      updatedData.email,
      id
    );
  }

  let password =
    currentUser.password;

  const passwordWasChanged =
    updatedData.password !==
      undefined &&
    updatedData.password.trim() !==
      "";

  if (passwordWasChanged) {
    const normalizedPassword =
      updatedData.password?.trim() ??
      "";

    password =
      isPasswordHash(
        normalizedPassword
      )
        ? normalizedPassword
        : await hashPassword(
            normalizedPassword
          );
  }

  const normalizedData:
    Partial<User> = {
      ...updatedData,

      name:
        updatedData.name !==
        undefined
          ? updatedData.name.trim()
          : currentUser.name,

      email:
        updatedData.email !==
        undefined
          ? updatedData.email
              .trim()
              .toLowerCase()
          : currentUser.email,

      phone:
        updatedData.phone !==
        undefined
          ? updatedData.phone.trim()
          : currentUser.phone,

      department:
        updatedData.department !==
        undefined
          ? updatedData.department.trim()
          : currentUser.department,

      password,
    };

  const updatedUser =
    updateUserById(
      id,
      normalizedData
    );

  if (!updatedUser) {
    return undefined;
  }

  const nameChanged =
    updatedUser.name !==
    currentUser.name;

  const emailChanged =
    updatedUser.email !==
    currentUser.email;

  const phoneChanged =
    updatedUser.phone !==
    currentUser.phone;

  const departmentChanged =
    updatedUser.department !==
    currentUser.department;

  const roleChanged =
    updatedUser.role !==
    currentUser.role;

  const statusChanged =
    updatedUser.status !==
    currentUser.status;

  const generalDataChanged =
    nameChanged ||
    emailChanged ||
    phoneChanged ||
    departmentChanged ||
    passwordWasChanged;

  if (generalDataChanged) {
    const changedFields:
      string[] = [];

    if (nameChanged) {
      changedFields.push(
        "nome"
      );
    }

    if (emailChanged) {
      changedFields.push(
        "e-mail"
      );
    }

    if (phoneChanged) {
      changedFields.push(
        "telefone"
      );
    }

    if (departmentChanged) {
      changedFields.push(
        "departamento"
      );
    }

    if (passwordWasChanged) {
      changedFields.push(
        "senha"
      );
    }

    createUserHistory({
      userId:
        id,

      action:
        "updated",

      title:
        "Dados do usuário atualizados",

      description:
        `Os seguintes campos foram alterados: ${changedFields.join(
          ", "
        )}.`,

      performedBy:
        "Sistema",
    });

    registerUserAudit(
      updatedUser.id,
      "Edição",
      `Dados do usuário "${updatedUser.name}" atualizados.`,
      `Campos alterados: ${changedFields.join(
        ", "
      )}`
    );
  }

  if (roleChanged) {
    createUserHistory({
      userId:
        id,

      action:
        "role_changed",

      title:
        "Perfil alterado",

      description:
        `O perfil foi alterado de ${currentUser.role} para ${updatedUser.role}.`,

      performedBy:
        "Sistema",
    });

    registerUserAudit(
      updatedUser.id,
      "Edição",
      `Perfil do usuário "${updatedUser.name}" alterado.`,
      `"${currentUser.role}" → "${updatedUser.role}"`
    );
  }

  if (statusChanged) {
    const userWasActivated =
      updatedUser.status ===
      "Ativo";

    createUserHistory({
      userId:
        id,

      action:
        userWasActivated
          ? "activated"
          : "deactivated",

      title:
        userWasActivated
          ? "Usuário ativado"
          : "Usuário inativado",

      description:
        userWasActivated
          ? "O acesso do usuário ao sistema foi ativado."
          : "O acesso do usuário ao sistema foi inativado.",

      performedBy:
        "Sistema",
    });

    registerUserAudit(
      updatedUser.id,
      "Alteração de status",
      userWasActivated
        ? `Usuário "${updatedUser.name}" ativado.`
        : `Usuário "${updatedUser.name}" inativado.`,
      `"${currentUser.status}" → "${updatedUser.status}"`
    );
  }

  return updatedUser;
}

export async function changeUserStatus(
  id: number,
  status: UserStatus
): Promise<User> {
  const currentUser =
    getUserById(
      id
    );

  if (!currentUser) {
    throw new Error(
      "Usuário não encontrado."
    );
  }

  const updatedUser =
    await updateUser(
      id,
      {
        status,
      }
    );

  if (!updatedUser) {
    throw new Error(
      "Não foi possível atualizar o status do usuário."
    );
  }

  return updatedUser;
}

export function deleteUser(
  id: number
): boolean {
  const currentUser =
    getUserById(
      id
    );

  if (!currentUser) {
    return false;
  }

  createUserHistory({
    userId:
      id,

    action:
      "deleted",

    title:
      "Usuário excluído",

    description:
      "O cadastro do usuário foi excluído do sistema.",

    performedBy:
      "Sistema",
  });

  const deleted =
    deleteUserById(
      id
    );

  if (deleted) {
    registerUserAudit(
      currentUser.id,
      "Exclusão",
      `Usuário "${currentUser.name}" excluído.`,
      `E-mail: ${currentUser.email} | Perfil: ${currentUser.role} | Status: ${currentUser.status}`
    );
  }

  return deleted;
}