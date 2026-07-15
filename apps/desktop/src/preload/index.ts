import { contextBridge, ipcRenderer } from "electron";
import type { AgentEventDto, DesktopApi } from "../shared/ipc";
import { IPC } from "../shared/ipc";

const api: DesktopApi = {
  app: {
    bootstrap: () => ipcRenderer.invoke(IPC.bootstrap),
    revealPath: (path) => ipcRenderer.invoke(IPC.revealPath, { path })
  },
  projects: {
    list: () => ipcRenderer.invoke(IPC.projectList),
    chooseRoot: () => ipcRenderer.invoke(IPC.projectChooseRoot),
    create: (input) => ipcRenderer.invoke(IPC.projectCreate, input),
    importExisting: () => ipcRenderer.invoke(IPC.projectImportExisting),
    open: (projectId) => ipcRenderer.invoke(IPC.projectOpen, { projectId }),
    archive: (projectId, archived) => ipcRenderer.invoke(IPC.projectArchive, { projectId, archived })
  },
  scripts: {
    chooseAndPreview: (projectId) => ipcRenderer.invoke(IPC.scriptChooseAndPreview, { projectId }),
    previewText: (input) => ipcRenderer.invoke(IPC.scriptPreviewText, input),
    applyImport: (input) => ipcRenderer.invoke(IPC.scriptApplyImport, input)
  },
  agent: {
    health: () => ipcRenderer.invoke(IPC.agentHealth),
    run: (input) => ipcRenderer.invoke(IPC.agentRun, input),
    cancel: (runId) => ipcRenderer.invoke(IPC.agentCancel, { runId }),
    onEvent: (listener) => {
      const handler = (_event: Electron.IpcRendererEvent, payload: AgentEventDto): void => listener(payload);
      ipcRenderer.on(IPC.agentEvent, handler);
      return () => ipcRenderer.removeListener(IPC.agentEvent, handler);
    }
  },
  draft: {
    accept: (projectId, proposalId, operationIds) => ipcRenderer.invoke(IPC.draftAccept, { projectId, proposalId, operationIds }),
    reject: (projectId, proposalId) => ipcRenderer.invoke(IPC.draftReject, { projectId, proposalId })
  },
  revisions: {
    restore: (projectId, revisionId) => ipcRenderer.invoke(IPC.revisionRestore, { projectId, revisionId })
  },
  entities: {
    patch: (input) => ipcRenderer.invoke(IPC.entityPatch, input)
  },
  tasks: {
    upsert: (input) => ipcRenderer.invoke(IPC.taskUpsert, input)
  },
  mapping: {
    replace: (input) => ipcRenderer.invoke(IPC.mappingReplace, input)
  },
  structure: {
    create: (input) => ipcRenderer.invoke(IPC.structureCreate, input)
  },
  prompts: {
    createEnvelope: (input) => ipcRenderer.invoke(IPC.promptEnvelopeCreate, input)
  },
  skills: {
    list: (projectId) => ipcRenderer.invoke(IPC.skillList, { projectId }),
    importFromFolder: () => ipcRenderer.invoke(IPC.skillImport),
    cloneForEditing: (skillId) => ipcRenderer.invoke(IPC.skillClone, { skillId }),
    assignSlot: (input) => ipcRenderer.invoke(IPC.skillAssignSlot, input),
    readContent: (input) => ipcRenderer.invoke(IPC.skillReadContent, input),
    updateContent: (input) => ipcRenderer.invoke(IPC.skillUpdateContent, input),
    setEnabled: (input) => ipcRenderer.invoke(IPC.skillSetEnabled, input),
    bind: (input) => ipcRenderer.invoke(IPC.skillBind, input)
  },
  settings: {
    getRuntimePreference: (projectId) => ipcRenderer.invoke(IPC.settingsGetRuntimePreference, { projectId }),
    setRuntimePreference: (input) => ipcRenderer.invoke(IPC.settingsSetRuntimePreference, input),
    saveApiKey: (apiKey, model) => ipcRenderer.invoke(IPC.settingsSaveApiKey, { apiKey, model, testConnection: true }),
    removeApiKey: () => ipcRenderer.invoke(IPC.settingsRemoveApiKey),
    testApiKey: (model) => ipcRenderer.invoke(IPC.settingsTestApiKey, { model })
  },
  exports: {
    save: (input) => ipcRenderer.invoke(IPC.exportSave, input)
  }
};

contextBridge.exposeInMainWorld("aiDirector", api);
