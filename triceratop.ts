// run `deno install ${your file}` to create a shell command that wraps
// the deno run command

// deno run --unstable --allow-read --allow-write triceratop.ts

import { Generate } from './util/generate.ts'
import { Tester } from './util/tester.ts'

const command = Deno.args[0];
const args : string[] = [...Deno.args];
switch (command) {
  case 'generate':
    await Generate(args);
    break;
  case 'test':
    await Tester(args);
    break;
}
