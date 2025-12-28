import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { QueryPage } from "./pages/QueryPage";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <QueryPage />
      </Layout>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
