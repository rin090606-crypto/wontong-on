import { ReactNode } from "react";
import ManagerGuard from "@/components/auth/ManagerGuard";

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return <ManagerGuard>{children}</ManagerGuard>;
}
