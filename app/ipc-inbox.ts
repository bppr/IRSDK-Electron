import { ipcMain } from 'electron';
import iracing from 'node-irsdk-2021';
import { Resolution } from "@common/incident";
import Application from "@app/application";

type CarNumberParam = { carNumber: string };
type JumpToTimeParam = { sessionNum: number, sessionTime: number};
type ReplayParam = CarNumberParam & JumpToTimeParam;

type IncidentResolvedParam = {
   incidentId: number,
   resolution: Resolution
};

ipcMain.on('replay', (ev, data: ReplayParam) => {
  const sdk = iracing.getInstance();
  sdk.playbackControls.searchTs(data.sessionNum, data.sessionTime);
  sdk.camControls.switchToCar(data.carNumber)
});

ipcMain.on('focus-camera', (ev, data: CarNumberParam) => {
  const sdk = iracing.getInstance();
  sdk.camControls.switchToCar(data.carNumber);
});

ipcMain.on('jump-to-time', (ev, data: JumpToTimeParam) => {
  const sdk = iracing.getInstance();
  sdk.playbackControls.searchTs(data.sessionNum, data.sessionTime);
});

ipcMain.on('acknowledge-incident', (ev, data: IncidentResolvedParam) => {
  console.log("INBOX: " + 'acknowledge-incident '+ data.incidentId);
  Application.getInstance().incidents.resolve(data.incidentId, 'Acknowledged');
});

ipcMain.on('dismiss-incident', (ev, data: IncidentResolvedParam) => {
  console.log("INBOX: " + 'dismiss-incident '+ data.incidentId);
  Application.getInstance().incidents.resolve(data.incidentId, 'Dismissed');
});

ipcMain.on('unresolve-incident', (ev, data: IncidentResolvedParam) => {
  console.log("INBOX: " + 'unresolve-incident '+ data.incidentId);
  Application.getInstance().incidents.reopen(data.incidentId);
});