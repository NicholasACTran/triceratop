import {
  ensureDirSync,
  ensureFileSync,
  existsSync,
  walkSync
} from 'https://deno.land/std@0.74.0/fs/mod.ts';
import { SEP } from 'https://deno.land/std@0.74.0/path/mod.ts';

import { Parser } from './parser.ts';
import {
  GenerationResult,
  printGenerationResults,
  GenerationStatus,
} from './printer.ts';

//Default directories
const FEATURE_DIRECTORY = './__tests__/features';
const STEPS_DIRECTORY = './__tests__/steps';

async function getConfig() {
  if (existsSync('./triceratop.json')) {
    //TODO: Create this json automatically
    let data = await Deno.readFile('triceratop.json');
    const decoder = new TextDecoder('utf-8');
    return JSON.parse(decoder.decode(data));
  } else {
    return {
      'feature-directory': FEATURE_DIRECTORY,
      'steps-directory': STEPS_DIRECTORY
    };
  }
}

export async function Generate(args: Array<string>) {

  const config = await getConfig();
  const featureDirectory = config.hasOwnProperty('feature-directory') ? config['feature-directory'] : FEATURE_DIRECTORY;
  const stepDirectory = config.hasOwnProperty('steps-directory') ? config['steps-directory'] : STEPS_DIRECTORY;
  // Creates feature and steps folder if they don't exist
  ensureDirSync(featureDirectory);
  ensureDirSync(stepDirectory);

  const generationResults: GenerationResult[] = [];

  //For each .feature file in the feature folder
  //Check if a corresponding steps folder exists
  for (const feature of walkSync(featureDirectory)) {
    //If not create one and write parsed feature file it
    const path = feature.path;
    if (path.endsWith('.feature')) {
      const file_name = path.substring(path.indexOf(SEP), path.lastIndexOf('.'));
      const feature_file_name = featureDirectory + file_name + '.feature';
      const step_file_name = stepDirectory + file_name + '.ts';
      if (!existsSync(step_file_name)) {
        ensureFileSync(step_file_name);
        const text = await Parser(feature_file_name);
        await Deno.writeTextFile(step_file_name, text);
        generationResults.push({
          identifier: step_file_name,
          status: GenerationStatus.GENERATED
        });
      } else {
        generationResults.push({
          identifier: feature_file_name,
          status: GenerationStatus.SKIPPED
        });
      }
    }
  }

  printGenerationResults(generationResults);
}
