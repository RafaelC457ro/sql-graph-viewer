import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFolders, createFolder, renameFolder, deleteFolder } from "../api/folders";

export const useFolders = () => {
  return useQuery({
    queryKey: ["folders"],
    queryFn: fetchFolders,
  });
};

export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
};

export const useRenameFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: renameFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
};

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
};
