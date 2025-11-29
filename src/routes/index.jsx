import { createBrowserRouter } from "react-router-dom";
import { AppRouter } from "@/routes/AppRouter";
export const router = createBrowserRouter(
    [...AppRouter],
);
