import { SfdxError } from '@salesforce/core';
import { Dictionary, get } from '@salesforce/ts-types';
import { spawn, SpawnOptions } from 'child_process';
import { parseCommand } from '../utils/stringUtils';

export const runCommand = (fullCommand: string): Promise<Dictionary> => {
  const error = new Error(); // Get stack here to use for later

  if (!fullCommand.includes('--json')) {
    fullCommand += ' --json';
  }

  const { name: commandName, args } = parseCommand(fullCommand);

  const spawnOpt: SpawnOptions = {
    // Always use json in stdout
    env: Object.assign({ SFDX_JSON_TO_STDOUT: 'true' }, process.env)
  };

  return new Promise((resolve, reject) => {
    const cmd = spawn(commandName, args, spawnOpt);
    let stdout = '';
    cmd.stdout?.on('data', data => {
      stdout += data;
    });

    cmd.stderr?.on('data', data => {
      console.warn('stderr', data);
    });

    cmd.on('error', data => {
      console.error('err', data);
    });

    cmd.on('close', code => {
      let json;
      try { json = JSON.parse(stdout); } catch {
        console.warn(`No parsable results from command "${fullCommand}"`);
      }
      if (code && code > 0) {
        // Get non-promise stack for extra help
        const sfdxError = SfdxError.wrap(error);
        sfdxError.message = `Command ${commandName} failed with ${get(json, 'message')}`;
        sfdxError.setData(json);
        reject(sfdxError);
      } else {
        resolve(json.result);
      }
    });
  });
};
