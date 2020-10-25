export function Then(name: Deno.TestDefinition['name'], fn: Deno.TestDefinition['fn']) {
  return Deno.test({ name, fn });
}
