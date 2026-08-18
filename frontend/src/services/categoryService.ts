import {
  create,
  deleteById,
  findAll,
  findById,
  updateById,
} from "../repositories/categoryRepository";

import type {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
} from "../types/Category";

const MINIMUM_NAME_LENGTH =
  3;

const MAXIMUM_NAME_LENGTH =
  80;

const MAXIMUM_DESCRIPTION_LENGTH =
  500;

const COLOR_PATTERN =
  /^#[0-9A-Fa-f]{6}$/;

function normalizeName(
  name: string
): string {
  return name
    .trim()
    .toLocaleLowerCase(
      "pt-BR"
    );
}

function normalizeText(
  value: string
): string {
  return value.trim();
}

function validateCategoryId(
  id: number
): boolean {
  return (
    Number.isInteger(
      id
    ) &&
    id > 0
  );
}

function validateName(
  name: string,
  ignoreId?: number
): void {
  const trimmedName =
    name.trim();

  if (!trimmedName) {
    throw new Error(
      "Informe o nome da categoria."
    );
  }

  if (
    trimmedName.length <
    MINIMUM_NAME_LENGTH
  ) {
    throw new Error(
      `O nome da categoria deve possuir pelo menos ${MINIMUM_NAME_LENGTH} caracteres.`
    );
  }

  if (
    trimmedName.length >
    MAXIMUM_NAME_LENGTH
  ) {
    throw new Error(
      `O nome da categoria deve possuir no máximo ${MAXIMUM_NAME_LENGTH} caracteres.`
    );
  }

  const normalized =
    normalizeName(
      trimmedName
    );

  const exists =
    findAll().some(
      (category) =>
        normalizeName(
          category.name
        ) ===
          normalized &&
        category.id !==
          ignoreId
    );

  if (exists) {
    throw new Error(
      "Já existe uma categoria com este nome."
    );
  }
}

function validateDescription(
  description: string
): void {
  if (
    description.length >
    MAXIMUM_DESCRIPTION_LENGTH
  ) {
    throw new Error(
      `A descrição deve possuir no máximo ${MAXIMUM_DESCRIPTION_LENGTH} caracteres.`
    );
  }
}

function validateColor(
  color: string
): void {
  if (
    !COLOR_PATTERN.test(
      color
    )
  ) {
    throw new Error(
      "Informe uma cor hexadecimal válida."
    );
  }
}

function normalizeCategoryData<
  T extends
    CreateCategoryData |
    UpdateCategoryData,
>(
  data: T
): T {
  return {
    ...data,

    name:
      data.name.trim(),

    description:
      normalizeText(
        data.description
      ),

    color:
      data.color.trim(),
  };
}

function validateCategoryData(
  data:
    CreateCategoryData |
    UpdateCategoryData,
  ignoreId?: number
): void {
  validateName(
    data.name,
    ignoreId
  );

  validateDescription(
    data.description
  );

  validateColor(
    data.color
  );
}

export function getCategories():
  Category[] {
  return findAll();
}

export function getCategoryById(
  id: number
): Category | undefined {
  if (
    !validateCategoryId(
      id
    )
  ) {
    return undefined;
  }

  return findById(
    id
  );
}

export async function createCategory(
  data:
    CreateCategoryData
): Promise<Category> {
  const normalizedData =
    normalizeCategoryData(
      data
    );

  validateCategoryData(
    normalizedData
  );

  return create(
    normalizedData
  );
}

export async function updateCategory(
  id: number,
  data:
    UpdateCategoryData
): Promise<Category | undefined> {
  if (
    !validateCategoryId(
      id
    )
  ) {
    return undefined;
  }

  const existingCategory =
    findById(
      id
    );

  if (
    !existingCategory
  ) {
    return undefined;
  }

  const normalizedData =
    normalizeCategoryData(
      data
    );

  validateCategoryData(
    normalizedData,
    id
  );

  return updateById(
    id,
    normalizedData
  );
}

export function deleteCategory(
  id: number
): boolean {
  if (
    !validateCategoryId(
      id
    )
  ) {
    return false;
  }

  return deleteById(
    id
  );
}