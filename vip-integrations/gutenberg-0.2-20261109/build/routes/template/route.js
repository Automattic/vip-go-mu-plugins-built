import { redirect } from "@wordpress/route";

// routes/template/route.ts
/**
* Route configuration for template redirect.
*/
const route = { beforeLoad: () => {
	throw redirect({
		throw: true,
		to: "/templates/list/$activeView",
		params: { activeView: "all" }
	});
} };

export { route };