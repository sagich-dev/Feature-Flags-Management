import { openApiSpec } from "./openapi.spec";

export { openApiSpec };

export const generateDocsHtml = (): string => {
	const specJson = JSON.stringify(openApiSpec);
	return `<!doctype html>
<html>
	<head>
		<title>Moodify API Documentation</title>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<meta name="description" content="API Documentation for Moodify Backend" />
		<style>
			body {
				margin: 0;
			}
		</style>
	</head>
	<body>
		<script
			id="api-reference"
			type="application/json"
			data-configuration='{"theme":"default","layout":"modern"}'
		>
			${specJson}
		</script>
		<script src="/api/docs/standalone.js"></script>
	</body>
</html>`;
};
