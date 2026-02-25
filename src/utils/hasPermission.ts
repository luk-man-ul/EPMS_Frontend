export const hasPermission = (
  permissions: string[] | undefined,
  required: string
) => {
  if (!permissions) return false;
  return permissions.includes(required);
};
