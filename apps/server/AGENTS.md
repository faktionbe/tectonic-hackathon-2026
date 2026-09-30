# Server

- Feature modules in `src/modules/<feature>/`: module, service, controller and/or resolver, Zod schemas (`z.infer`) at the REST boundary with Nest Standard Schema (`@Body({ schema })`, `@SerializeOptions({ schema })`, `@ApiOkResponse({ standardSchema })`). Wire OpenAPI via `@repo/openapi`'s `zodStandardSchemaConverter` in `main.ts`.
- Protect handlers with `@Auth()` / `@Auth('role')` (`modules/auth/auth.decorator.ts`; bundles `JwtGuard`, `RolesGuard` and the Swagger auth docs). Read the user with `@User()`.
- Data routes the agent calls use `@M2M()` (`modules/auth/m2m.decorator.ts`; accepts the shared `M2M_JWT` bearer token or a user JWT).
- Name routes, DTOs and operationIds after the resource (`statistics`), never the screen that consumes it (`dashboardStatistics`).
- Paginate every list endpoint: `@ApiOffsetPagination()` or `@ApiCursorPagination()` with `PaginationService` (`src/modules/pagination/`).
- PATCH schemas `.refine()` to require at least one field, so `{}` is rejected.
- Nested controllers (`parents/:parentId/children/:childId/items`): every handler declares `@Param()` for every ancestor path param (prefix unused ones with `_`), or Orval codegen fails.
- Azure OpenAI structured output: every `properties` key must be `required`; model optional fields as `.nullable()`.
- Upstream/partner failures from bad external data or HTTP errors log at `warn`. User-facing messages stay simple; detail goes in logs.
- All authentication should live inside the auth.module.ts. All types of authentication follows `passport` strategy pattern.
- Tests: `pnpm test`, `pnpm test:e2e`.
