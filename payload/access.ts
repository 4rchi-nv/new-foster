import type { Access } from "payload";

export const staffOnly: Access = ({ req }) => Boolean(req.user);

export const publishedOrStaff: Access = ({ req }) => {
  if (req.user) return true;
  return { status: { equals: "published" } };
};
