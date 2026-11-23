import { redirect } from "@wordpress/route";

// routes/template-part/route.ts
/**
* Route configuration for template part redirect.
*/
const route = { beforeLoad: () => {
	throw redirect({
		throw: true,
		to: "/template-parts/list/$area",
		params: { area: "all-parts" }
	});
} };

export { route };