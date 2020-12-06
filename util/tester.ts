import { ensureDirSync, walkSync, existsSync } from 'https://deno.land/std@0.74.0/fs/mod.ts';
import { SEP } from 'https://deno.land/std@0.74.0/path/mod.ts';

//Default directory
const STEPS_DIRECTORY = './__tests__/steps';

async function getDirectory() {
  if (existsSync('./triceratop.json')) {
    let data = await Deno.readFile('triceratop.json');
    const decoder = new TextDecoder('utf-8');
    return JSON.parse(decoder.decode(data))['steps-directory'];
  } else {
    return STEPS_DIRECTORY;
  }
}

async function runTest(testFile: string) {
  //Spawns a sub-process
  //TODO: Give this subprocess all of the permissions?
  const run = (path : string) : Deno.Process => {
    return Deno.run({
      cmd: ["deno", "test", "--unstable", "--allow-read", path]
    });
  }

  const p = run(testFile);
  const status = await p.status();
  p.close();
}

//Iterates over the steps directory and will run deno test on each file
export async function Tester(args: Array<string>) {

  const directory = await getDirectory();

  ensureDirSync(directory);

  if (args.length === 1) {
    //Run all tests
    for (const step of walkSync(directory)) {
      if (step.isFile) {
        const path = directory + SEP + step.name;
        await runTest(path);
      }
    }
  } else {
    //Run specific tests
    args.shift();
    for (const featurename of args) {
      const path = directory + SEP + featurename + '.ts';
      if (existsSync(path)){
          await runTest(path);
      } else {
        throw `File Not Found: ${path}`;
      }
    }
  }
}
