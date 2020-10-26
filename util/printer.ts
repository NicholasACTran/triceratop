export enum GenerationStatus {
  GENERATED = 'GENERATED',
  SKIPPED = 'SKIPPED'
}

export interface GenerationResult {
  identifier: string;
  status: GenerationStatus;
}

export function printGenerationResults(results: GenerationResult[]) {
  results.forEach(result => {
    switch (result.status) {
      case GenerationStatus.GENERATED:
        console.log(`✅ ${result.identifier} generated.`);
        break;
      case GenerationStatus.SKIPPED:
        console.log(`❗️ ${result.identifier} skipped!`);
        break;
    }
  });
}
