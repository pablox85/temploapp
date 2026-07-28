export const EXTRA_LIST_TYPES = [
  { value: "checklist", label: "Checklist" },
  { value: "inventory", label: "Inventario" },
  { value: "notes", label: "Notas" },
] as const;

export type ExtraListType = (typeof EXTRA_LIST_TYPES)[number]["value"];

export const EXTRA_LIST_TYPE_BADGE_CLASSES: Record<ExtraListType, string> = {
  checklist: "bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300",
  inventory: "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
  notes: "bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300",
};

export function getExtraListTypeLabel(type: ExtraListType): string {
  return EXTRA_LIST_TYPES.find((option) => option.value === type)?.label ?? type;
}
