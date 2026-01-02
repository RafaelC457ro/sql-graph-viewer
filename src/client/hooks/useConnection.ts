import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  connectToDatabase, 
  disconnectFromDatabase, 
  executeQuery, 
  getSessionStatus, 
  getSavedSessions,
  activateSession,
  type ConnectionParams 
} from "../api/connection";

export const useConnection = () => {
    const queryClient = useQueryClient();

    const connect = useMutation({
        mutationFn: (params: ConnectionParams) => connectToDatabase(params),
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ["session"] });
             queryClient.invalidateQueries({ queryKey: ["sessions"] });
        }
    });

    const disconnect = useMutation({
        mutationFn: disconnectFromDatabase,
        onSuccess: () => {
             queryClient.clear(); // Clear all cache on disconnect
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

export const useSessions = () => {
    return useQuery({
        queryKey: ["sessions"],
        queryFn: getSavedSessions,
    });
};

export const useActivateSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => activateSession(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["session"] });
        }
    });
};

export const useQueryExecution = () => {
    return useMutation({
        mutationFn: (query: string) => executeQuery(query)
    });
}
