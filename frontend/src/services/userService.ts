import type {
  User,
  UserRole,
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
  assertStrongPassword,
  hashPassword,
  isPasswordHash,
} from "../utils/password";

import {
  createAuditLog,
} from "./auditLogService";

import {
  getCurrentUser,
} from "./sessionService";

import {
  createUserHistory,
} from "./userHistoryService";

export type CreateUserData = Omit<
  User,
  "id"
>;

const SETTINGS_STORAGE_KEY =
  "supportdesk-pro-settings";

const MINIMUM_NAME_LENGTH =
  3;

const MAXIMUM_NAME_LENGTH =
  100;

const MAXIMUM_EMAIL_LENGTH =
  150;

const MINIMUM_BASIC_PASSWORD_LENGTH =
  6;

const MAXIMUM_PASSWORD_LENGTH =
  128;

const MAXIMUM_PHONE_LENGTH =
  30;

const MAXIMUM_DEPARTMENT_LENGTH =
  80;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_PATTERN =
  /^[0-9()+\-\s.]+$/;

const VALID_ROLES:
  readonly UserRole[] = [
    "Administrador",
    "Técnico",
    "Solicitante",
  ];

const VALID_STATUSES:
  readonly UserStatus[] = [
    "Ativo",
    "Inativo",
  ];

function normalizeText(
  value: string
): string {
  return value.trim();
}

function normalizeEmail(
  email: string
): string {
  return email
    .trim()
    .toLowerCase();
}

function validateMaximumLength(
  value: string,
  maximumLength: number,
  fieldName: string
): void {
  if (
    value.length >
    maximumLength
  ) {
    throw new Error(
      `${fieldName} deve possuir no máximo ${maximumLength} caracteres.`
    );
  }
}

function validateName(
  name: string
): void {
  if (!name) {
    throw new Error(
      "Informe o nome do usuário."
    );
  }

  if (
    name.length <
    MINIMUM_NAME_LENGTH
  ) {
    throw new Error(
      `O nome deve possuir pelo menos ${MINIMUM_NAME_LENGTH} caracteres.`
    );
  }

  validateMaximumLength(
    name,
    MAXIMUM_NAME_LENGTH,
    "O nome"
  );
}

function validateEmail(
  email: string
): void {
  if (!email) {
    throw new Error(
      "Informe o e-mail do usuário."
    );
  }

  validateMaximumLength(
    email,
    MAXIMUM_EMAIL_LENGTH,
    "O e-mail"
  );

  if (
    !EMAIL_PATTERN.test(
      email
    )
  ) {
    throw new Error(
      "Informe um e-mail válido."
    );
  }
}

function validatePhone(
  phone: string
): void {
  if (!phone) {
    return;
  }

  validateMaximumLength(
    phone,
    MAXIMUM_PHONE_LENGTH,
    "O telefone"
  );

  if (
    !PHONE_PATTERN.test(
      phone
    )
  ) {
    throw new Error(
      "Informe um telefone válido."
    );
  }
}

function validateDepartment(
  department: string
): void {
  validateMaximumLength(
    department,
    MAXIMUM_DEPARTMENT_LENGTH,
    "O departamento"
  );
}

function validateRole(
  role: UserRole
): void {
  if (
    !VALID_ROLES.includes(
      role
    )
  ) {
    throw new Error(
      "Selecione um perfil de usuário válido."
    );
  }
}

function validateStatus(
  status: UserStatus
): void {
  if (
    !VALID_STATUSES.includes(
      status
    )
  ) {
    throw new Error(
      "Selecione um status de usuário válido."
    );
  }
}

function isStrongPasswordRequired():
  boolean {
  try {
    const storedSettings =
      localStorage.getItem(
        SETTINGS_STORAGE_KEY
      );

    if (!storedSettings) {
      return true;
    }

    const parsedSettings =
      JSON.parse(
        storedSettings
      ) as {
        requireStrongPassword?:
          unknown;
      };

    return (
      parsedSettings.requireStrongPassword !==
      false
    );
  } catch {
    return true;
  }
}

function validatePasswordPolicy(
  password: string
): void {
  if (!password) {
    throw new Error(
      "Informe a senha do usuário."
    );
  }

  if (
    password.length >
    MAXIMUM_PASSWORD_LENGTH
  ) {
    throw new Error(
      `A senha deve possuir no máximo ${MAXIMUM_PASSWORD_LENGTH} caracteres.`
    );
  }

  if (
    isStrongPasswordRequired()
  ) {
    assertStrongPassword(
      password
    );

    return;
  }

  if (
    password.length <
    MINIMUM_BASIC_PASSWORD_LENGTH
  ) {
    throw new Error(
      `A senha deve possuir pelo menos ${MINIMUM_BASIC_PASSWORD_LENGTH} caracteres.`
    );
  }
}

function validateUserData(
  data: {
    name: string;
    email: string;
    phone: string;
    department: string;
    role: UserRole;
    status: UserStatus;
  }
): void {
  validateName(
    data.name
  );

  validateEmail(
    data.email
  );

  validatePhone(
    data.phone
  );

  validateDepartment(
    data.department
  );

  validateRole(
    data.role
  );

  validateStatus(
    data.status
  );
}

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

export function getUsers():
  User[] {
  return findAllUsers();
}

export function getUserById(
  id: number
): User | undefined {
  if (
    !Number.isInteger(
      id
    ) ||
    id <= 0
  ) {
    return undefined;
  }

  return findUserById(
    id
  );
}

function getActiveAdministrators():
  User[] {
  return getUsers().filter(
    (user) =>
      user.role ===
        "Administrador" &&
      user.status ===
        "Ativo"
  );
}

function isCurrentSessionUser(
  userId: number
): boolean {
  const sessionUser =
    getCurrentUser();

  return (
    sessionUser?.id ===
    userId
  );
}

function validateAdministratorUpdate(
  currentUser: User,
  updatedData: Partial<User>
): void {
  const newRole:
    UserRole =
      updatedData.role ??
      currentUser.role;

  const newStatus:
    UserStatus =
      updatedData.status ??
      currentUser.status;

  const wasActiveAdministrator =
    currentUser.role ===
      "Administrador" &&
    currentUser.status ===
      "Ativo";

  const willBeActiveAdministrator =
    newRole ===
      "Administrador" &&
    newStatus ===
      "Ativo";

  if (
    !wasActiveAdministrator ||
    willBeActiveAdministrator
  ) {
    return;
  }

  if (
    isCurrentSessionUser(
      currentUser.id
    )
  ) {
    if (
      newStatus !==
      "Ativo"
    ) {
      throw new Error(
        "Você não pode inativar sua própria conta administrativa."
      );
    }

    if (
      newRole !==
      "Administrador"
    ) {
      throw new Error(
        "Você não pode remover o perfil de Administrador da sua própria conta."
      );
    }
  }

  const activeAdministrators =
    getActiveAdministrators();

  if (
    activeAdministrators.length <=
    1
  ) {
    throw new Error(
      "O sistema deve possuir pelo menos um Administrador ativo."
    );
  }
}

function validateAdministratorDeletion(
  user: User
): void {
  if (
    isCurrentSessionUser(
      user.id
    )
  ) {
    throw new Error(
      "Você não pode excluir sua própria conta enquanto estiver conectado."
    );
  }

  const isActiveAdministrator =
    user.role ===
      "Administrador" &&
    user.status ===
      "Ativo";

  if (
    !isActiveAdministrator
  ) {
    return;
  }

  const activeAdministrators =
    getActiveAdministrators();

  if (
    activeAdministrators.length <=
    1
  ) {
    throw new Error(
      "O sistema deve possuir pelo menos um Administrador ativo."
    );
  }
}

function validateEmailAvailability(
  email: string,
  ignoredUserId?: number
): void {
  const normalizedEmail =
    normalizeEmail(
      email
    );

  const emailAlreadyExists =
    getUsers().some(
      (user) =>
        user.id !==
          ignoredUserId &&
        normalizeEmail(
          user.email
        ) ===
          normalizedEmail
    );

  if (
    emailAlreadyExists
  ) {
    throw new Error(
      "Já existe um usuário cadastrado com este e-mail."
    );
  }
}

export async function createUser(
  userData: CreateUserData
): Promise<User> {
  const normalizedName =
    normalizeText(
      userData.name
    );

  const normalizedEmail =
    normalizeEmail(
      userData.email
    );

  const normalizedPhone =
    normalizeText(
      userData.phone
    );

  const normalizedDepartment =
    normalizeText(
      userData.department
    );

  const normalizedPassword =
    userData.password.trim();

  validateUserData({
    name:
      normalizedName,

    email:
      normalizedEmail,

    phone:
      normalizedPhone,

    department:
      normalizedDepartment,

    role:
      userData.role,

    status:
      userData.status,
  });

  validateEmailAvailability(
    normalizedEmail
  );

  if (
    !isPasswordHash(
      normalizedPassword
    )
  ) {
    validatePasswordPolicy(
      normalizedPassword
    );
  }

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
        normalizedName,

      email:
        normalizedEmail,

      password:
        protectedPassword,

      phone:
        normalizedPhone,

      department:
        normalizedDepartment,
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

  validateAdministratorUpdate(
    currentUser,
    updatedData
  );

  const normalizedName =
    updatedData.name !==
    undefined
      ? normalizeText(
          updatedData.name
        )
      : currentUser.name;

  const normalizedEmail =
    updatedData.email !==
    undefined
      ? normalizeEmail(
          updatedData.email
        )
      : currentUser.email;

  const normalizedPhone =
    updatedData.phone !==
    undefined
      ? normalizeText(
          updatedData.phone
        )
      : currentUser.phone;

  const normalizedDepartment =
    updatedData.department !==
    undefined
      ? normalizeText(
          updatedData.department
        )
      : currentUser.department;

  const normalizedRole =
    updatedData.role ??
    currentUser.role;

  const normalizedStatus =
    updatedData.status ??
    currentUser.status;

  validateUserData({
    name:
      normalizedName,

    email:
      normalizedEmail,

    phone:
      normalizedPhone,

    department:
      normalizedDepartment,

    role:
      normalizedRole,

    status:
      normalizedStatus,
  });

  if (
    updatedData.email !==
    undefined
  ) {
    validateEmailAvailability(
      normalizedEmail,
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

  if (
    passwordWasChanged
  ) {
    const normalizedPassword =
      updatedData.password?.trim() ??
      "";

    if (
      !isPasswordHash(
        normalizedPassword
      )
    ) {
      validatePasswordPolicy(
        normalizedPassword
      );
    }

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
        normalizedName,

      email:
        normalizedEmail,

      phone:
        normalizedPhone,

      department:
        normalizedDepartment,

      role:
        normalizedRole,

      status:
        normalizedStatus,

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

  if (
    generalDataChanged
  ) {
    const changedFields:
      string[] = [];

    if (
      nameChanged
    ) {
      changedFields.push(
        "nome"
      );
    }

    if (
      emailChanged
    ) {
      changedFields.push(
        "e-mail"
      );
    }

    if (
      phoneChanged
    ) {
      changedFields.push(
        "telefone"
      );
    }

    if (
      departmentChanged
    ) {
      changedFields.push(
        "departamento"
      );
    }

    if (
      passwordWasChanged
    ) {
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

  if (
    roleChanged
  ) {
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

  if (
    statusChanged
  ) {
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

  validateStatus(
    status
  );

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

  validateAdministratorDeletion(
    currentUser
  );

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

  if (
    deleted
  ) {
    registerUserAudit(
      currentUser.id,
      "Exclusão",
      `Usuário "${currentUser.name}" excluído.`,
      `E-mail: ${currentUser.email} | Perfil: ${currentUser.role} | Status: ${currentUser.status}`
    );
  }

  return deleted;
}