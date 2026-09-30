export const E2E_PASSWORD = "E2ePassword!123";

export const E2E_USERS = {
  admin: {
    id: "e2e-admin",
    name: "E2E Admin",
    email: "e2e.admin@example.com",
  },
  technician: {
    id: "e2e-technician",
    name: "E2E Technician",
    email: "e2e.technician@example.com",
  },
  requester: {
    id: "e2e-requester",
    name: "E2E Requester",
    email: "e2e.requester@example.com",
  },
} as const;

export const E2E_CATEGORY = {
  id: "e2e-category-general",
  name: "E2E General",
} as const;

export const E2E_ADMIN_TICKET_ID = "e2e-admin-ticket";
