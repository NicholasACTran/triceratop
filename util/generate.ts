import {
  ensureDirSync,
  ensureFileSync,
  existsSync,
  walkSync
} from 'https://deno.land/std@0.74.0/fs/mod.ts';
import { SEP } from 'https://deno.land/std@0.74.0/path/mod.ts';

import { Parser } from './parser.ts';

//TODO: Pull this from yml config file?
const FEATURE_DIRECTORY = './features';
const STEPS_DIRECTORY = './steps';

export async function Generate() {
  // Creates feature and steps folder if they don't exist
  ensureDirSync(FEATURE_DIRECTORY);
  ensureDirSync(STEPS_DIRECTORY);

  //For each .feature file in the feature folder
  //Check if a corresponding steps folder exists
  for (const feature of walkSync(FEATURE_DIRECTORY)) {
    //If not create one and write parsed feature file it
    const path = feature.path;
    if (path.endsWith('.feature')) {
      const file_name = path.substring(path.indexOf(SEP), path.lastIndexOf('.'));
      const feature_file_name = FEATURE_DIRECTORY + file_name + '.feature';
      const step_file_name = STEPS_DIRECTORY + file_name + '.ts';
      if (!existsSync(step_file_name)) {
        ensureFileSync(step_file_name);
        const text = await Parser(feature_file_name);
        await Deno.writeTextFile(step_file_name, text);
      }
    }
  }
}
