// src/app/(dashboard)/layout.tsx
import { auth } from "@clerk/nextjs/server";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	await auth.protect();

	return <div>{children}</div>;
}
