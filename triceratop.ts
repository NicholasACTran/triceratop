// run `deno install ${your file}` to create a shell command that wraps
// the deno run command

// deno run --unstable --allow-read --allow-write triceratop.ts

import { Generate } from './util/generate.ts'

const command = Deno.args[0];

switch (command) {
  case 'generate':
    await Generate();
    break;
  case 'test':
    console.log('Need to implement test functionality');
    break;
}
