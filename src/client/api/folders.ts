import type { Folder, NewFolder } from "../../shared/types";

const API_URL = "/api/db/folders";

export async function fetchFolders(): Promise<Folder[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch folders");
  return res.json();
}

export async function createFolder(folder: NewFolder): Promise<Folder> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(folder),
  });
  if (!res.ok) throw new Error("Failed to create folder");
  return res.json();
}

export async function renameFolder({ id, name }: { id: number; name: string }): Promise<Folder> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to rename folder");
  return res.json();
}

export async function deleteFolder(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete folder");
}
