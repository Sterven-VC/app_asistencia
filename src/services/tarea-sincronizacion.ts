import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';

import { sincronizar } from './sincronizacion';

const TAREA = 'sincronizar-marcaciones';

TaskManager.defineTask(TAREA, async () => {
  try {
    await sincronizar();
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function registrarTareaDeEnvio() {
  try {
    await BackgroundTask.registerTaskAsync(TAREA, { minimumInterval: 15 });
  } catch {
    // Expo Go no permite tareas en segundo plano. Abrir la app igual envía.
  }
}
