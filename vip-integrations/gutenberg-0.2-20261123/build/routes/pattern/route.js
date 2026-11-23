import { redirect } from "@wordpress/route";

// routes/pattern/route.ts
/**
* Route configuration for pattern redirect.
*/
const route = { beforeLoad: () => {
	throw redirect({
		throw: true,
		to: "/patterns/list/$type",
		params: { type: "all" }
	});
} };

export { route };