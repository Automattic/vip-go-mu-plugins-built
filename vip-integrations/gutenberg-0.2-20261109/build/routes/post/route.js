import { redirect } from "@wordpress/route";

// routes/post/route.ts
/**
* Route configuration for post redirect.
*/
const route = { beforeLoad: ({ params }) => {
	throw redirect({
		throw: true,
		to: "/types/$type/list/$slug",
		params: {
			type: params.type,
			slug: "all"
		}
	});
} };

export { route };