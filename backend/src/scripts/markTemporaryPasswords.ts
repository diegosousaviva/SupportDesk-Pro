import {
  findAllUsers,
  updateUserById,
} from "../repositories/userRepository.js";

import {
  verifyPassword,
} from "../utils/password.js";

const TEMPORARY_PASSWORD =
  "Suporte@123";

async function markTemporaryPasswords(): Promise<void> {
  const users =
    await findAllUsers();

  let markedCount = 0;

  for (const user of users) {
    const usesTemporaryPassword =
      await verifyPassword(
        TEMPORARY_PASSWORD,
        user.password
      );

    if (!usesTemporaryPassword) {
      continue;
    }

    if (
      user.mustChangePassword ===
      true
    ) {
      continue;
    }

    const updatedUser =
      await updateUserById(
        user.id,
        {
          mustChangePassword:
            true,
        }
      );

    if (updatedUser) {
      markedCount += 1;

      console.log(
        `Senha temporária identificada: ${user.name} (${user.email})`
      );
    }
  }

  console.log(
    ""
  );

  console.log(
    `Usuários marcados para troca obrigatória: ${markedCount}`
  );

  console.log(
    "Migração concluída."
  );
}

markTemporaryPasswords().catch(
  (error) => {
    console.error(
      "Erro ao marcar senhas temporárias:",
      error
    );

    process.exit(
      1
    );
  }
);
