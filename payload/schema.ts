import type { CollectionConfig, Field, GlobalConfig } from "payload";

import { publishedOrStaff, staffOnly } from "@/payload/access";
import { fillSlug } from "@/payload/hooks";

const site = "Сайт";
const equipment = "Оборудование";
const projects = "Проекты";
const materials = "Материалы";
const inbox = "Обращения";

const statusField: Field = {
  name: "status",
  type: "select",
  label: "Публикация",
  defaultValue: "draft",
  required: true,
  options: [
    { label: "Черновик", value: "draft" },
    { label: "Опубликовано", value: "published" },
  ],
  admin: { position: "sidebar" },
};

const sortField: Field = {
  name: "sortOrder",
  type: "number",
  label: "Порядок",
  defaultValue: 0,
  admin: { position: "sidebar" },
};

const slugField: Field = {
  name: "slug",
  type: "text",
  label: "Адрес страницы",
  required: true,
  unique: true,
  index: true,
  admin: {
    position: "sidebar",
    description: "Латиница и дефисы. Если оставить пустым при создании, адрес соберётся из названия.",
  },
};

const seoField: Field = {
  name: "seo",
  type: "group",
  label: "SEO",
  fields: [
    { name: "title", type: "text", localized: true, label: "Заголовок страницы" },
    { name: "description", type: "textarea", localized: true, label: "Описание" },
  ],
};

const specField: Field = {
  name: "specifications",
  type: "array",
  label: "Характеристики",
  labels: { singular: "Параметр", plural: "Параметры" },
  fields: [
    { name: "label", type: "text", localized: true, required: true, label: "Параметр" },
    { name: "value", type: "text", localized: true, required: true, label: "Значение" },
    { name: "unit", type: "text", label: "Единица измерения" },
    { name: "notes", type: "textarea", localized: true, label: "Примечание" },
  ],
};

const officeMimes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Пользователь", plural: "Пользователи" },
  auth: true,
  admin: { useAsTitle: "email", group: "Система" },
  fields: [],
};

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Изображение", plural: "Изображения" },
  access: { read: () => true },
  admin: { group: materials, useAsTitle: "filename" },
  upload: {
    staticDir: "media",
    mimeTypes: ["image/*"],
    imageSizes: [{ name: "card", width: 1600, height: 1200, fit: "inside" }],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      localized: true,
      required: true,
      label: "Подпись для слабовидящих",
    },
  ],
};

export const Documents: CollectionConfig = {
  slug: "documents",
  labels: { singular: "Документ", plural: "Документы" },
  access: { read: publishedOrStaff },
  admin: {
    group: materials,
    useAsTitle: "title",
    defaultColumns: ["title", "kind", "placement", "status"],
    description: "Публикуйте только согласованные файлы. Черновики на сайте не видны.",
  },
  upload: { staticDir: "media/documents", mimeTypes: officeMimes },
  hooks: { beforeValidate: [fillSlug] },
  fields: [
    { name: "title", type: "text", localized: true, required: true, label: "Название" },
    slugField,
    statusField,
    {
      name: "placement",
      type: "select",
      label: "Где показывать",
      required: true,
      defaultValue: "standards",
      options: [
        { label: "Нормативная база", value: "standards" },
        { label: "Документы компании", value: "company" },
      ],
    },
    {
      name: "kind",
      type: "select",
      label: "Тип",
      required: true,
      options: [
        { label: "Применимый стандарт", value: "relevant-standard" },
        { label: "Сертификат", value: "certificate" },
        { label: "Аттестация", value: "approval" },
        { label: "Разрешение", value: "permit" },
        { label: "Технический документ", value: "technical" },
        { label: "Требование заказчика", value: "customer-requirement" },
      ],
    },
    { name: "standardCode", type: "text", label: "Обозначение стандарта" },
    { name: "documentNumber", type: "text", label: "Номер документа" },
    { name: "description", type: "textarea", localized: true, label: "Описание" },
    { name: "issueDate", type: "date", label: "Дата выпуска" },
    { name: "validUntil", type: "date", label: "Действует до" },
    {
      name: "language",
      type: "select",
      label: "Язык файла",
      defaultValue: "ru",
      options: [
        { label: "Русский", value: "ru" },
        { label: "English", value: "en" },
        { label: "Оба", value: "both" },
      ],
    },
  ],
};

export const InquiryFiles: CollectionConfig = {
  slug: "inquiry-files",
  labels: { singular: "Файл запроса", plural: "Файлы запросов" },
  access: {
    read: staffOnly,
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
  },
  admin: {
    group: inbox,
    description: "Файлы заказчиков. На сайте не публикуются.",
  },
  upload: { staticDir: "storage/inquiries", mimeTypes: officeMimes },
  fields: [{ name: "originalName", type: "text", required: true, label: "Исходное имя" }],
};

export const Inquiries: CollectionConfig = {
  slug: "inquiries",
  labels: { singular: "Запрос", plural: "Запросы" },
  access: {
    read: staffOnly,
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
  },
  admin: {
    group: inbox,
    useAsTitle: "company",
    defaultColumns: ["company", "email", "createdAt"],
  },
  fields: [
    { name: "name", type: "text", required: true, label: "Имя" },
    { name: "company", type: "text", required: true, label: "Компания" },
    { name: "phone", type: "text", required: true, label: "Телефон" },
    { name: "email", type: "email", required: true, label: "Эл. почта" },
    { name: "message", type: "textarea", label: "Описание задачи" },
    { name: "source", type: "text", label: "Страница" },
    { name: "locale", type: "text", label: "Язык формы" },
    {
      name: "files",
      type: "upload",
      relationTo: "inquiry-files",
      hasMany: true,
      label: "Файлы",
    },
  ],
};

export const EquipmentGroups: CollectionConfig = {
  slug: "equipment-groups",
  labels: { singular: "Группа оборудования", plural: "Группы оборудования" },
  access: { read: publishedOrStaff },
  admin: { group: equipment, useAsTitle: "title" },
  hooks: { beforeValidate: [fillSlug] },
  fields: [
    { name: "title", type: "text", localized: true, required: true, label: "Название" },
    { name: "summary", type: "textarea", localized: true, label: "Краткое описание" },
    slugField,
    sortField,
    statusField,
  ],
};

export const EquipmentCategories: CollectionConfig = {
  slug: "equipment-categories",
  labels: { singular: "Категория оборудования", plural: "Категории оборудования" },
  access: { read: publishedOrStaff },
  admin: { group: equipment, useAsTitle: "title", defaultColumns: ["title", "group", "status"] },
  hooks: { beforeValidate: [fillSlug] },
  fields: [
    { name: "title", type: "text", localized: true, required: true, label: "Название" },
    { name: "summary", type: "textarea", localized: true, label: "Краткое описание" },
    {
      name: "group",
      type: "relationship",
      relationTo: "equipment-groups",
      required: true,
      label: "Группа",
    },
    slugField,
    sortField,
    statusField,
  ],
};

export const Equipment: CollectionConfig = {
  slug: "equipment",
  labels: { singular: "Оборудование", plural: "Оборудование" },
  access: { read: publishedOrStaff },
  admin: {
    group: equipment,
    useAsTitle: "title",
    description: "Карточка оборудования, не товар. Цену и наличие не указывайте.",
  },
  hooks: { beforeValidate: [fillSlug] },
  fields: [
    { name: "title", type: "text", localized: true, required: true, label: "Название" },
    slugField,
    statusField,
    sortField,
    {
      name: "category",
      type: "relationship",
      relationTo: "equipment-categories",
      required: true,
      label: "Категория",
    },
    { name: "summary", type: "textarea", localized: true, label: "Краткое описание" },
    { name: "body", type: "textarea", localized: true, label: "Техническое описание" },
    specField,
    { name: "images", type: "upload", relationTo: "media", hasMany: true, label: "Изображения" },
    { name: "diagrams", type: "upload", relationTo: "media", hasMany: true, label: "Схемы" },
    { name: "documents", type: "relationship", relationTo: "documents", hasMany: true, label: "Документы" },
    { name: "relatedProjects", type: "relationship", relationTo: "projects", hasMany: true, label: "Проекты" },
    { name: "relatedArticles", type: "relationship", relationTo: "articles", hasMany: true, label: "Материалы" },
    {
      name: "inquiry",
      type: "checkbox",
      label: "Показывать запрос по этой позиции",
      defaultValue: true,
    },
    seoField,
  ],
};

export const ProjectCategories: CollectionConfig = {
  slug: "project-categories",
  labels: { singular: "Направление проектов", plural: "Направления проектов" },
  access: { read: publishedOrStaff },
  admin: { group: projects, useAsTitle: "title" },
  hooks: { beforeValidate: [fillSlug] },
  fields: [
    { name: "title", type: "text", localized: true, required: true, label: "Название" },
    slugField,
    sortField,
    statusField,
  ],
};

export const Projects: CollectionConfig = {
  slug: "projects",
  labels: { singular: "Проект", plural: "Проекты" },
  access: { read: publishedOrStaff },
  admin: {
    group: projects,
    useAsTitle: "title",
    description: "Публикуйте только согласованные кейсы. Пустые разделы на сайте скрыты.",
  },
  hooks: { beforeValidate: [fillSlug] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Общие",
          fields: [
            { name: "title", type: "text", localized: true, required: true, label: "Объект" },
            { name: "customer", type: "text", localized: true, label: "Заказчик" },
            { name: "equipmentName", type: "text", localized: true, label: "Оборудование" },
            { name: "scope", type: "textarea", localized: true, label: "Объём работ" },
            { name: "year", type: "number", label: "Год", min: 1900, max: 2100 },
            {
              name: "projectStatus",
              type: "select",
              label: "Статус проекта",
              options: [
                { label: "Завершён", value: "completed" },
                { label: "В реализации", value: "in-progress" },
                { label: "Запланирован", value: "planned" },
              ],
            },
            { name: "location", type: "text", localized: true, label: "Площадка" },
            {
              name: "category",
              type: "relationship",
              relationTo: "project-categories",
              label: "Направление",
            },
          ],
        },
        {
          label: "Содержание",
          fields: [
            { name: "task", type: "textarea", localized: true, label: "Задача" },
            { name: "solution", type: "textarea", localized: true, label: "Инженерное решение" },
            { name: "execution", type: "textarea", localized: true, label: "Реализация" },
            { name: "manufacturing", type: "textarea", localized: true, label: "Изготовление и поставка" },
            { name: "result", type: "textarea", localized: true, label: "Результат" },
            specField,
          ],
        },
        {
          label: "Медиа",
          fields: [
            { name: "cover", type: "upload", relationTo: "media", label: "Обложка" },
            {
              name: "gallery",
              type: "array",
              label: "Галерея и схемы",
              fields: [
                { name: "image", type: "upload", relationTo: "media", required: true, label: "Файл" },
                { name: "caption", type: "text", localized: true, label: "Подпись" },
              ],
            },
          ],
        },
        {
          label: "Связи",
          fields: [
            { name: "documents", type: "relationship", relationTo: "documents", hasMany: true, label: "Документы" },
            { name: "relatedEquipment", type: "relationship", relationTo: "equipment", hasMany: true, label: "Оборудование" },
            { name: "relatedArticles", type: "relationship", relationTo: "articles", hasMany: true, label: "Материалы" },
          ],
        },
        { label: "SEO", fields: [seoField] },
      ],
    },
    slugField,
    statusField,
  ],
};

export const ArticleCategories: CollectionConfig = {
  slug: "article-categories",
  labels: { singular: "Рубрика", plural: "Рубрики" },
  access: { read: publishedOrStaff },
  admin: { group: materials, useAsTitle: "title" },
  hooks: { beforeValidate: [fillSlug] },
  fields: [
    { name: "title", type: "text", localized: true, required: true, label: "Название" },
    slugField,
    sortField,
    statusField,
  ],
};

export const Articles: CollectionConfig = {
  slug: "articles",
  labels: { singular: "Материал", plural: "Материалы" },
  access: { read: publishedOrStaff },
  admin: {
    group: materials,
    useAsTitle: "title",
    description: "Технические статьи и новости. Абзацы разделяйте пустой строкой.",
  },
  hooks: { beforeValidate: [fillSlug] },
  fields: [
    { name: "title", type: "text", localized: true, required: true, label: "Заголовок" },
    { name: "excerpt", type: "textarea", localized: true, label: "Краткий текст" },
    { name: "body", type: "textarea", localized: true, label: "Текст" },
    {
      name: "category",
      type: "relationship",
      relationTo: "article-categories",
      label: "Рубрика",
    },
    { name: "publishedOn", type: "date", label: "Дата публикации" },
    { name: "author", type: "text", localized: true, label: "Автор" },
    { name: "hero", type: "upload", relationTo: "media", label: "Главное изображение" },
    {
      name: "gallery",
      type: "array",
      label: "Изображения и схемы",
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true, label: "Файл" },
        { name: "caption", type: "text", localized: true, label: "Подпись" },
      ],
    },
    { name: "documents", type: "relationship", relationTo: "documents", hasMany: true, label: "Документы" },
    { name: "relatedEquipment", type: "relationship", relationTo: "equipment", hasMany: true, label: "Оборудование" },
    { name: "relatedProjects", type: "relationship", relationTo: "projects", hasMany: true, label: "Проекты" },
    slugField,
    statusField,
    seoField,
  ],
};

export const Expertise: CollectionConfig = {
  slug: "expertise",
  labels: { singular: "Компетенция", plural: "Компетенции" },
  access: { read: publishedOrStaff },
  admin: { group: site, useAsTitle: "title" },
  hooks: { beforeValidate: [fillSlug] },
  fields: [
    { name: "index", type: "text", required: true, label: "Номер", admin: { description: "Например 01" } },
    { name: "title", type: "text", localized: true, required: true, label: "Название" },
    { name: "text", type: "textarea", localized: true, required: true, label: "Описание" },
    slugField,
    sortField,
    statusField,
  ],
};

export const Metrics: CollectionConfig = {
  slug: "metrics",
  labels: { singular: "Показатель", plural: "Показатели" },
  access: { read: publishedOrStaff },
  admin: {
    group: site,
    useAsTitle: "label",
    description: "Добавляйте только утверждённые цифры. Без отметки «Утверждено» показатель на сайте не появится.",
  },
  fields: [
    { name: "label", type: "text", localized: true, required: true, label: "Подпись" },
    { name: "value", type: "text", required: true, label: "Значение" },
    { name: "suffix", type: "text", label: "Суффикс" },
    { name: "approved", type: "checkbox", label: "Утверждено", defaultValue: false },
    sortField,
    statusField,
  ],
};

export const Site: GlobalConfig = {
  slug: "site",
  label: "Содержание сайта",
  access: { read: () => true },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Компания",
          fields: [
            { name: "companyName", type: "text", localized: true, label: "Название" },
            { name: "legalName", type: "text", localized: true, label: "Юридическое название" },
            { name: "slogan", type: "text", localized: true, label: "Слоган" },
            { name: "positioning", type: "textarea", localized: true, label: "Позиционирование" },
            { name: "heroLead", type: "textarea", localized: true, label: "Текст первого экрана" },
            { name: "furnacesIntro", type: "textarea", localized: true, label: "Текст о промышленных печах" },
          ],
        },
        {
          label: "Принцип работы",
          fields: [
            {
              name: "workflow",
              type: "array",
              label: "Шаги",
              fields: [{ name: "title", type: "text", localized: true, required: true, label: "Шаг" }],
            },
          ],
        },
        {
          label: "Почему New Foster",
          fields: [
            {
              name: "principles",
              type: "array",
              label: "Положения",
              fields: [
                { name: "title", type: "text", localized: true, required: true, label: "Заголовок" },
                { name: "text", type: "textarea", localized: true, required: true, label: "Текст" },
              ],
            },
          ],
        },
        {
          label: "Контакты",
          fields: [
            { name: "phone", type: "text", label: "Телефон" },
            { name: "email", type: "email", label: "Эл. почта" },
            { name: "address", type: "textarea", localized: true, label: "Адрес" },
          ],
        },
        {
          label: "SEO",
          fields: [
            { name: "seoTitle", type: "text", localized: true, label: "Заголовок главной" },
            { name: "seoDescription", type: "textarea", localized: true, label: "Описание главной" },
          ],
        },
      ],
    },
  ],
};
