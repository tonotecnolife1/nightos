import { mkdir,mkdtemp,copyFile,writeFile,chmod,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join,resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root=resolve(fileURLToPath(new URL('../..',import.meta.url)));
const output=resolve(process.argv[2]);
const scratch=await mkdtemp(join(tmpdir(),'nightos-line-package-'));
const folder=join(scratch,'NIGHTOS-LINE-Mac-Bridge');
try{
  await mkdir(join(folder,'scripts/personal-line'),{recursive:true});
  await mkdir(join(folder,'lib/personal-line'),{recursive:true});
  for(const file of ['bridge.mjs','mcp-client.mjs','send-form.mjs','relay-http.mjs','check-preview.mjs','Start-line-bridge.command'])await copyFile(join(root,'scripts/personal-line',file),join(folder,'scripts/personal-line',file));
  await copyFile(join(root,'lib/personal-line/crypto.mjs'),join(folder,'lib/personal-line/crypto.mjs'));
  await copyFile(join(root,'docs/personal-line-mac-bridge.md'),join(folder,'README.md'));
  await writeFile(join(folder,'Start.command'),'#!/bin/bash\nset -euo pipefail\nexec bash "$(dirname "$0")/scripts/personal-line/Start-line-bridge.command"\n');
  await chmod(join(folder,'Start.command'),0o755);await chmod(join(folder,'scripts/personal-line/Start-line-bridge.command'),0o755);
  execFileSync('/usr/bin/zip',['-qr',output,'NIGHTOS-LINE-Mac-Bridge'],{cwd:scratch});
  console.log('Packaged Mac bridge without credentials or LINE sessions: '+output);
}finally{await rm(scratch,{recursive:true,force:true});}
