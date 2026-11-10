import { redirect } from "@wordpress/route";

// routes/navigation/route.ts
const route = { beforeLoad: () => {
	throw redirect({ to: "/navigation/list" });
} };

export { route };