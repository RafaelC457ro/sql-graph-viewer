import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "@/hooks/useConnection";

export const ProtectedRoute = () => {
  const { isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Checking session...</div>
      </div>
    );
  }

  return <Outlet />;
};
