export const Permissions = {
  dashboard: {
    view: "dashboard.view",
  },

  users: {
    view: "users.view",
    create: "users.create",
    edit: "users.edit",
    delete: "users.delete",
  },

  tickets: {
    view: "tickets.view",
    viewAll: "tickets.view-all",
    viewOwn: "tickets.view-own",
    viewAssigned: "tickets.view-assigned",
    create: "tickets.create",
    edit: "tickets.edit",
    editOwn: "tickets.edit-own",
    delete: "tickets.delete",
    assign: "tickets.assign",
    updateStatus: "tickets.update-status",
    close: "tickets.close",
    comment: "tickets.comment",
  },

  categories: {
    view: "categories.view",
    create: "categories.create",
    edit: "categories.edit",
    delete: "categories.delete",
  },

  reports: {
    view: "reports.view",
  },

  settings: {
    view: "settings.view",
    edit: "settings.edit",
  },

stores: {
  view: "stores.view",
  create: "stores.create",
  edit: "stores.edit",
  delete: "stores.delete",
},

inventory: {
  view: "inventory.view",
  create: "inventory.create",
  edit: "inventory.edit",
  delete: "inventory.delete",
},


} as const;

type PermissionGroup =
  (typeof Permissions)[keyof typeof Permissions];

export type Permission =
  PermissionGroup[keyof PermissionGroup];