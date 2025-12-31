import type { File, NewFile } from "../../shared/types";

const API_URL = "/api/db/files";

export async function fetchFiles(search?: string): Promise<File[]> {
  const url = search ? `${API_URL}?search=${encodeURIComponent(search)}` : API_URL;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch files");
  return res.json();
}

export async function createFile(file: NewFile): Promise<File> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(file),
  });
  if (!res.ok) throw new Error("Failed to create file");
  return res.json();
}

export async function updateFile({ id, ...updates }: Partial<NewFile> & { id: number }): Promise<File> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update file");
  return res.json();
}

export async function patchFile({ id, ...updates }: { id: number; name?: string; isFavorite?: boolean; folderId?: number | null }): Promise<File> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to patch file");
  return res.json();
}

export async function deleteFile(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete file");
}

