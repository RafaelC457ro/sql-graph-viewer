import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFiles, createFile, updateFile, patchFile, deleteFile } from "../api/files";
import type { File, NewFile } from "../../shared/types";

export const useFiles = () => {
  return useQuery({
    queryKey: ["files"],
    queryFn: () => fetchFiles(),
  });
};

export const useCreateFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
};

export const useUpdateFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<NewFile> & { id: number }) => updateFile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
};

export const usePatchFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: patchFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
};

