import { ensureDirSync, walkSync } from 'https://deno.land/std@0.74.0/fs/mod.ts';

const STEPS_DIRECTORY = './steps';

//Iterates over the steps directory and will run deno test on each file
export async function Tester() {
  ensureDirSync(STEPS_DIRECTORY);

  for (const step of walkSync(STEPS_DIRECTORY)) {
    const path = feature.path;

    //Spawns a sub-process
    const run = (path : string) : Deno.Process => {
      return Deno.run({
        cmd: ["deno", "test", path]
      });
    }

    const p = run(path);
    const status = await p.status();
    p.close();
  }
}
