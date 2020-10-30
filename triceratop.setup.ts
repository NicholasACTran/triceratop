function Given(...args: Parameters<typeof Deno.test>): ReturnType<typeof Deno.test> {
  return Deno.test(...args);
}

function When(...args: Parameters<typeof Deno.test>): ReturnType<typeof Deno.test> {
  return Deno.test(...args);
}

function Then(...args: Parameters<typeof Deno.test>): ReturnType<typeof Deno.test> {
  return Deno.test(...args);
}

function And(...args: Parameters<typeof Deno.test>): ReturnType<typeof Deno.test> {
  return Deno.test(...args);
}

function But(...args: Parameters<typeof Deno.test>): ReturnType<typeof Deno.test> {
  return Deno.test(...args);
}

// Assign test functions to global scope
globalThis.Given = Given;
globalThis.When = When;
globalThis.Then = Then;
globalThis.And = And;
globalThis.But = But;
