import { createLazyFileRoute, Outlet } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import Footer from "@/layout/footer";
import Header from "@/layout/header";

export const Route = createLazyFileRoute("/(main)")({
  pendingComponent: PageLoading,
  component: () => (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  ),
});
