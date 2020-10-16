import {
  ensureDirSync,
  ensureFileSync,
  existsSync,
  walkSync
} from "https://deno.land/std@0.74.0/fs/mod.ts";

//TODO: Pull this from yml config file?
const FEATURE_DIRECTORY = './features';
const STEPS_DIRECTORY = './steps';

export function Generate() : void {
  // Creates feature and steps folder if they don't exist
  ensureDirSync(FEATURE_DIRECTORY);
  ensureDirSync(STEPS_DIRECTORY);

  //For each .feature file in the feature folder
  //Check if a corresponding steps folder exists
  //If not create one
  for (const feature of walkSync(FEATURE_DIRECTORY)) {
    const path = feature.path;
    if (path.endsWith('.feature')) {
      const file_name = STEPS_DIRECTORY + path.substring(path.indexOf('\\'));
      if (!existsSync(file_name)) {
        //TODO: Add parsing logic
        ensureFileSync(file_name);
      }
    }
  }
}
