import { redirect } from "@wordpress/route";

// routes/fonts-home/route.ts
/**
* Route configuration for fonts home redirect.
*/
const route = { beforeLoad: () => {
	throw redirect({
		throw: true,
		to: "/font-list"
	});
} };

export { route };