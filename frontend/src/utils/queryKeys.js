export const userKeys = {
  all: ["users"],

  list: (type = "list", filters = {}) => {
    // The key is an array composed of:
    // 1. The root key ('users')
    // 2. A 'list' identifier
    // 3. The list type (e.g., 'infinite')
    // 4. The filter/search object (CRITICAL for cache separation)

    return [...userKeys.all, "list", type, filters];
  },

  profile: ["user", "profile"],
};

export const appointmentKeys = {
  all: ["appointments"],

  new: ["appointmentCreate"],

  update: ["appointmentUpdate"],

  list: (params = {}) => {
    return [...appointmentKeys.all, "list", params];
  },

  detail: (id, role) => {
    if (!id) return [...appointmentKeys.all, "detail"];

    return [...appointmentKeys.all, "detail", id, role];
  },
};
