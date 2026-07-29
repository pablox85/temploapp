export const NEW_ITEM_IDS_STORAGE_KEY = "temploapp:new-item-ids";
export const NEW_ITEM_CREATED_EVENT = "temploapp:new-item-created";

function readNewItemIds(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const stored: unknown = JSON.parse(window.sessionStorage.getItem(NEW_ITEM_IDS_STORAGE_KEY) ?? "[]");
    return Array.isArray(stored) && stored.every((itemId) => typeof itemId === "string")
      ? stored
      : [];
  } catch {
    window.sessionStorage.removeItem(NEW_ITEM_IDS_STORAGE_KEY);
    return [];
  }
}

export function getNewItemIds(): ReadonlySet<string> {
  return new Set(readNewItemIds());
}

export function rememberNewItem(itemId: string): void {
  if (typeof window === "undefined") return;

  const itemIds = new Set(readNewItemIds());
  itemIds.add(itemId);
  window.sessionStorage.setItem(NEW_ITEM_IDS_STORAGE_KEY, JSON.stringify([...itemIds]));
  window.dispatchEvent(new CustomEvent<string>(NEW_ITEM_CREATED_EVENT, { detail: itemId }));
}

export function clearNewItemIds(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(NEW_ITEM_IDS_STORAGE_KEY);
}
