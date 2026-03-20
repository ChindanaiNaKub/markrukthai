import { PUZZLES } from '../../../shared/puzzles';
import { validatePuzzles } from '../../../shared/puzzleValidation';

const results = validatePuzzles(PUZZLES);
const invalid = results.filter(result => result.errors.length > 0);
const warned = results.filter(result => result.warnings.length > 0);

for (const result of results) {
  const status = result.errors.length > 0 ? 'FAIL' : result.warnings.length > 0 ? 'WARN' : 'OK';
  console.log(`${status} puzzle #${result.puzzleId} ${result.title}`);

  for (const error of result.errors) {
    console.log(`  error: ${error}`);
  }

  for (const warning of result.warnings) {
    console.log(`  warning: ${warning}`);
  }
}

if (invalid.length > 0) {
  console.error(`\n${invalid.length} puzzle(s) failed validation.`);
  process.exit(1);
}

console.log(`\nValidated ${results.length} puzzle(s) successfully.${warned.length > 0 ? ` ${warned.length} warning set(s).` : ''}`);
