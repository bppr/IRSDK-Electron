import { BrowserWindow } from 'electron'
import { join } from 'path'
import iracing from 'node-irsdk-2021';

import watch, { NotifyOfIncident, NotifyOfSessionChanged } from '@app/state';
import '@app/ipc-inbox';

import StateWatcher  from './statewatcher.js';
import Watcher from '@app/state';

export function start() {
  console.log('creating window');

  const win = new BrowserWindow({ 
    width: 1200, 
    height: 900, 
    webPreferences: {
      sandbox: true,
      preload: join(__dirname, 'api-bridge.js')
    }
  });

  win.loadFile(join(__dirname, '..', 'ui', 'main.html'));
  win.webContents.openDevTools();

  startSDK(win);
}

function startSDK(win: BrowserWindow) {
  const sdk = iracing.init({ 
    sessionInfoUpdateInterval: 100 /* ms */, 
    telemetryUpdateInterval: 50
  });

  const outbox = win.webContents;

  sdk.on('Connected', () => console.log('connected to iRacing!'));
  
  const config = {
    minPitStopTime: 35,
    observers: [ new NotifyOfIncident(outbox), new NotifyOfSessionChanged(outbox) ]
  }

  const watcher = new Watcher(outbox, config);

  sdk.on('Telemetry', watcher.onTelemetryUpdate);
  sdk.on('SessionInfo', watcher.onSessionUpdate);

  var sw = new StateWatcher(win.webContents);
  sw.bindToIRSDK(sdk);
}