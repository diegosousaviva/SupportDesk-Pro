import type {
  CreateUserData,
  UpdateUserData,
  User,
} from "../types/user.js";

import pool from "../database/mysql.js";

interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  department: string;
  role: User["role"];
  store_id: number | null;
  status: User["status"];
  created_at: Date | string;
  must_change_password: number | boolean | null;
}

function mapUserRow(
  row: UserRow
): User {
  return {
    id:
      Number(row.id),

    name:
      row.name,

    email:
      row.email,

    password:
      row.password,

    phone:
      row.phone,

    department:
      row.department,

    role:
      row.role,

    storeId:
      row.store_id === null
        ? null
        : Number(row.store_id),

    status:
      row.status,

    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : new Date(
            row.created_at
          ).toISOString(),

    mustChangePassword:
      Boolean(
        row.must_change_password
      ),
  };
}

function normalizeEmail(
  email: string
): string {
  return email
    .trim()
    .toLowerCase();
}

export async function findAllUsers():
  Promise<User[]> {
  const [
    rows,
  ] =
    await pool.query(
      `
        SELECT
          id,
          name,
          email,
          password,
          phone,
          department,
          role,
          store_id,
          status,
          created_at,
          must_change_password
        FROM users
        ORDER BY id ASC
      `
    );

  return (
    rows as UserRow[]
  ).map(
    mapUserRow
  );
}

export async function findUserById(
  id: number
):
  Promise<User | undefined> {
  const [
    rows,
  ] =
    await pool.execute(
      `
        SELECT
          id,
          name,
          email,
          password,
          phone,
          department,
          role,
          store_id,
          status,
          created_at,
          must_change_password
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [
        id,
      ]
    );

  const users =
    rows as UserRow[];

  if (
    users.length ===
    0
  ) {
    return undefined;
  }

  return mapUserRow(
    users[0]
  );
}

export async function findUserByEmail(
  email: string
):
  Promise<User | undefined> {
  const normalizedEmail =
    normalizeEmail(
      email
    );

  if (
    normalizedEmail.length ===
    0
  ) {
    return undefined;
  }

  const [
    rows,
  ] =
    await pool.execute(
      `
        SELECT
          id,
          name,
          email,
          password,
          phone,
          department,
          role,
          store_id,
          status,
          created_at,
          must_change_password
        FROM users
        WHERE LOWER(TRIM(email)) = ?
        LIMIT 1
      `,
      [
        normalizedEmail,
      ]
    );

  const users =
    rows as UserRow[];

  if (
    users.length ===
    0
  ) {
    return undefined;
  }

  return mapUserRow(
    users[0]
  );
}

export async function createUserRepository(
  data: CreateUserData
):
  Promise<User> {
  const createdAt =
    data.createdAt ??
    new Date().toISOString();

  const mustChangePassword =
    data.mustChangePassword ===
    true
      ? 1
      : 0;

  const [
    result,
  ] =
    await pool.execute(
      `
        INSERT INTO users (
          name,
          email,
          password,
          phone,
          department,
          role,
          store_id,
          status,
          created_at,
          must_change_password
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.name,
        data.email,
        data.password,
        data.phone,
        data.department,
        data.role,
        data.storeId ??
          null,
        data.status,
        new Date(
          createdAt
        ),
        mustChangePassword,
      ]
    );

  const insertResult =
    result as {
      insertId: number;
    };

  const createdUser =
    await findUserById(
      Number(
        insertResult.insertId
      )
    );

  if (!createdUser) {
    throw new Error(
      "Não foi possível recuperar o usuário criado."
    );
  }

  return createdUser;
}

export async function updateUserById(
  id: number,
  data: UpdateUserData
):
  Promise<User | undefined> {
  const currentUser =
    await findUserById(
      id
    );

  if (!currentUser) {
    return undefined;
  }

  const fields: string[] =
    [];

  const values:
    (
      | string
      | number
      | Date
      | null
    )[] = [];

  if (
    data.name !==
    undefined
  ) {
    fields.push(
      "name = ?"
    );

    values.push(
      data.name
    );
  }

  if (
    data.email !==
    undefined
  ) {
    fields.push(
      "email = ?"
    );

    values.push(
      data.email
    );
  }

  if (
    data.password !==
    undefined
  ) {
    fields.push(
      "password = ?"
    );

    values.push(
      data.password
    );
  }

  if (
    data.phone !==
    undefined
  ) {
    fields.push(
      "phone = ?"
    );

    values.push(
      data.phone
    );
  }

  if (
    data.department !==
    undefined
  ) {
    fields.push(
      "department = ?"
    );

    values.push(
      data.department
    );
  }

  if (
    data.role !==
    undefined
  ) {
    fields.push(
      "role = ?"
    );

    values.push(
      data.role
    );
  }

  if (
    data.storeId !==
    undefined
  ) {
    fields.push(
      "store_id = ?"
    );

    values.push(
      data.storeId
    );
  }

  if (
    data.status !==
    undefined
  ) {
    fields.push(
      "status = ?"
    );

    values.push(
      data.status
    );
  }

  if (
    data.mustChangePassword !==
    undefined
  ) {
    fields.push(
      "must_change_password = ?"
    );

    values.push(
      data.mustChangePassword
        ? 1
        : 0
    );
  }

  if (
    fields.length ===
    0
  ) {
    return currentUser;
  }

  values.push(
    id
  );

  await pool.execute(
    `
      UPDATE users
      SET ${fields.join(
        ", "
      )}
      WHERE id = ?
    `,
    values
  );

  return findUserById(
    id
  );
}

export async function deleteUserById(
  id: number
):
  Promise<boolean> {
  const [
    result,
  ] =
    await pool.execute(
      `
        DELETE FROM users
        WHERE id = ?
      `,
      [
        id,
      ]
    );

  const deleteResult =
    result as {
      affectedRows: number;
    };

  return (
    deleteResult.affectedRows >
    0
  );
}
