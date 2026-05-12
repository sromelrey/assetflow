import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

async function normalizeCSV() {
  const inputPath = path.join(process.cwd(), '..', 'assets.csv');
  const outputPath = path.join(process.cwd(), '..', 'assets-clean.csv');

  if (!fs.existsSync(inputPath)) {
    console.error('Source assets.csv not found at:', inputPath);
    process.exit(1);
  }

  console.log(`Normalizing: ${inputPath}`);
  console.log(`Outputting to: ${outputPath}`);

  const fileStream = fs.createReadStream(inputPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const writeStream = fs.createWriteStream(outputPath);
  let lineCount = 0;

  for await (let line of rl) {
    let cleanLine = line.trim();

    // Step 1: The original file wraps each entire CSV row in outer double-quotes.
    // Remove those outer quotes so the internal content is exposed.
    if (
      cleanLine.startsWith('"') &&
      cleanLine.endsWith('"') &&
      cleanLine.length > 1
    ) {
      cleanLine = cleanLine.substring(1, cleanLine.length - 1);
    }

    // Step 2: After removing the outer wrapper, internal field values are escaped
    // as "" (two double-quotes). Convert them back to standard single " quotes
    // so csv-parser can read them correctly as quoted CSV fields.
    cleanLine = cleanLine.replace(/""/g, '"');

    if (cleanLine) {
      writeStream.write(cleanLine + '\n');
      lineCount++;
    }

    if (lineCount % 1000 === 0) {
      console.log(`Cleaned ${lineCount} lines...`);
    }
  }

  writeStream.end();
  console.log(
    `\nNormalization Complete! ${lineCount} lines written to assets-clean.csv`,
  );
}

normalizeCSV().catch(console.error);
