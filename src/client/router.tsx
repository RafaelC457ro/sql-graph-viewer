import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { QueryPage } from "./pages/QueryPage";
import { NotFound } from "./pages/NotFound";

import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: (
          <Layout>
            <QueryPage />
          </Layout>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
