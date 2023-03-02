import * as process from 'process';
import * as cp from 'child_process';
import * as path from 'path';
import { test } from '@jest/globals';

test('test run', () => {
  process.env['INPUT_prompt'] = 'Can pigs fly?';
  process.env['INPUT_model'] = 'gpt-3.5-turbo';
  const np = process.execPath;
  const ip = path.join(__dirname, '..', 'dist', 'index.js');
  const options: cp.ExecFileSyncOptions = {
    env: process.env,
  };
  try {
    console.log(cp.execFileSync(np, [ip], options).toString());
  } catch (error) {
    console.log(JSON.stringify(error, null, 2));
    const t = error as any;
    console.log(t.output[1].toString());
  }
});
