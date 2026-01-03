import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  connectToDatabase, 
  disconnectFromDatabase, 
  executeQuery, 
  getSessionStatus, 
  getSavedConnections,
  activateConnection,
  deleteConnection,
  updateConnection,
  type ConnectionParams,
  type UpdateConnectionParams
} from "../api/connection";

export const useConnection = () => {
    const queryClient = useQueryClient();

    const connect = useMutation({
        mutationFn: (params: ConnectionParams) => connectToDatabase(params),
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ["session"] });
             queryClient.invalidateQueries({ queryKey: ["connections"] });
        }
    });

    const disconnect = useMutation({
        mutationFn: disconnectFromDatabase,
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ["session"] });
             queryClient.invalidateQueries({ queryKey: ["connections"] });
        }
    });

    return {
        connect,
        disconnect
    };
};

export const useSession = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["session"],
        queryFn: getSessionStatus,
        retry: false,
    });

    return {
        session: data,
        isLoading,
        error,
        isConnected: !!data?.connected
    };
};

export const useSavedConnections = () => {
    return useQuery({
        queryKey: ["connections"],
        queryFn: getSavedConnections,
    });
};

export const useActivateConnection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => activateConnection(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["session"] });
            queryClient.invalidateQueries({ queryKey: ["connections"] });
        }
    });
};

export const useQueryExecution = () => {
    return useMutation({
        mutationFn: (query: string) => executeQuery(query)
    });
}

export const useDeleteConnection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteConnection(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["connections"] });
            queryClient.invalidateQueries({ queryKey: ["session"] });
        }
    });
};

export const useUpdateConnection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, params }: { id: string; params: UpdateConnectionParams }) => updateConnection(id, params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["connections"] });
            queryClient.invalidateQueries({ queryKey: ["session"] });
        }
    });
};
