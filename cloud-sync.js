(() => {
  "use strict";

  const API_BASE = "https://api.fittrack-app.ru";
  const SYNC_DEBOUNCE_MS = 1200;

  let cloudAuthenticated = false;
  let cloudSyncBusy = false;
  let syncAgain = false;
  let applyingCloudState = false;
  let syncTimer = null;
  let authCheckBusy = false;

  const byId = (id) => document.getElementById(id);

  function setStatus(message) {
    const element = byId("cloudSyncStatus");
    if (element) element.textContent = message;
  }

  function setGateStatus(message) {
    const element = byId("authGateStatus");
    if (element) element.textContent = message;
  }

  function showAuthGate(message) {
    document.body.classList.add("auth-required");
    const gate = byId("authGate");
    if (gate) gate.classList.remove("hidden");
    const loginButton = byId("authGateLogin");
    if (loginButton) {
      loginButton.disabled = false;
      loginButton.textContent = "Войти через Яндекс ID";
    }
    const retryButton = byId("authGateRetry");
    if (retryButton) retryButton.classList.remove("hidden");
    if (message) setGateStatus(message);
  }

  function unlockApp() {
    document.body.classList.remove("auth-required");
    const gate = byId("authGate");
    if (gate) gate.classList.add("hidden");
  }

  function updatePanel() {
    const sync = byId("cloudSync");
    const logout = byId("cloudLogout");
    const authStatus = byId("cloudAuthStatus");

    if (sync) sync.classList.toggle("hidden", !cloudAuthenticated);
    if (logout) logout.classList.toggle("hidden", !cloudAuthenticated);

    if (authStatus) {
      authStatus.textContent = cloudAuthenticated
        ? "Вход через Яндекс ID выполнен. Данные FitTrack синхронизируются с облаком автоматически."
        : "Нет активной сессии. Для входа используй экран авторизации.";
    }
  }

  async function refreshAuth() {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(API_BASE + "/auth/me", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      signal: controller.signal
    });

    const payload = await response.json().catch(() => ({}));
    cloudAuthenticated = response.ok && payload.authenticated === true;
    updatePanel();

    if (cloudAuthenticated) {
      setStatus("Аккаунт подключён. Проверяем и обновляем облачные данные…");
    } else if (response.status === 401) {
      setStatus("Войди через Яндекс ID, чтобы включить облачное хранение.");
    } else {
      setStatus("Не удалось проверить вход. Проверь подключение и попробуй ещё раз.");
    }

    return cloudAuthenticated;
  } catch (error) {
    cloudAuthenticated = false;
    updatePanel();

    const message = error.name === "AbortError"
      ? "Сервер не ответил за 12 секунд. Проверь интернет и попробуй ещё раз."
      : "API временно недоступен. Локальные данные не затронуты.";

    setStatus(message);

    if (document.body.classList.contains("auth-required")) {
      setGateStatus(message);
    }

    return false;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

  function normalizeState(source) {
    const defaults = blankState();
    const value = source && typeof source === "object" ? source : {};

    return {
      ...defaults,
      ...value,
      sessions: Array.isArray(value.sessions) ? value.sessions : [],
      bodyWeights: Array.isArray(value.bodyWeights) ? value.bodyWeights : [],
      draft: value.draft && typeof value.draft === "object" ? value.draft : null,
      settings: {
        ...defaults.settings,
        ...(value.settings && typeof value.settings === "object" ? value.settings : {}),
        restByExercise: {
          ...defaults.settings.restByExercise,
          ...(value.settings?.restByExercise || {})
        }
      }
    };
  }

  function mergeRecords(remoteRecords, localRecords) {
    const merged = new Map();

    for (const item of [
      ...(Array.isArray(remoteRecords) ? remoteRecords : []),
      ...(Array.isArray(localRecords) ? localRecords : [])
    ]) {
      const key = item && item.id !== undefined && item.id !== null
        ? String(item.id)
        : JSON.stringify(item);
      // Local copy wins when the same record ID exists on both devices.
      merged.set(key, item);
    }

    return Array.from(merged.values());
  }

  function draftTimestamp(draft) {
    if (!draft) return 0;
    return Date.parse(draft.updatedAt || draft.startedAt || "") || 0;
  }

  function mergeStates(localSource, remoteSource) {
    const local = normalizeState(localSource);
    const remote = normalizeState(remoteSource);
    const defaults = blankState().settings;
    const localSettings = local.settings;
    const remoteSettings = remote.settings;

    const settings = {
      ...remoteSettings,
      timerSound: localSettings.timerSound !== defaults.timerSound
        ? localSettings.timerSound
        : remoteSettings.timerSound,
      timerVibration: localSettings.timerVibration !== defaults.timerVibration
        ? localSettings.timerVibration
        : remoteSettings.timerVibration,
      backupReminderDays: localSettings.backupReminderDays !== defaults.backupReminderDays
        ? localSettings.backupReminderDays
        : remoteSettings.backupReminderDays,
      weightGoal: localSettings.weightGoal !== null && localSettings.weightGoal !== undefined
        ? localSettings.weightGoal
        : remoteSettings.weightGoal,
      lastBackupAt: Math.max(
        Number(localSettings.lastBackupAt) || 0,
        Number(remoteSettings.lastBackupAt) || 0
      ) || null,
      restByExercise: {
        ...(remoteSettings.restByExercise || {}),
        ...(localSettings.restByExercise || {})
      }
    };

    let draft = null;
    if (!local.draft) {
      draft = remote.draft;
    } else if (!remote.draft) {
      draft = local.draft;
    } else {
      draft = draftTimestamp(local.draft) >= draftTimestamp(remote.draft)
        ? local.draft
        : remote.draft;
    }

    return {
      sessions: mergeRecords(remote.sessions, local.sessions),
      bodyWeights: mergeRecords(remote.bodyWeights, local.bodyWeights),
      draft,
      settings
    };
  }

  async function login() {
    const button = byId("authGateLogin");
    if (button) {
      button.disabled = true;
      button.textContent = "Переходим к Яндекс ID…";
    }
    setGateStatus("Сейчас откроется страница входа Яндекс ID…");
    window.location.assign(API_BASE + "/oauth/login");
  }

  async function logout() {
    if (!cloudAuthenticated) return;
    if (!confirm("Выйти из аккаунта FitTrack? Локальные и облачные данные останутся сохранены.")) return;

    const button = byId("cloudLogout");
    if (button) button.disabled = true;

    try {
      const response = await fetch(API_BASE + "/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Не удалось завершить сессию (HTTP " + response.status + ").");
      }

      cloudAuthenticated = false;
      updatePanel();
      clearTimeout(syncTimer);
      setStatus("Вы вышли из аккаунта. Локальные и облачные данные сохранены.");
      showAuthGate("Вы вышли из FitTrack. Чтобы продолжить работу, войди через Яндекс ID.");
    } catch (error) {
      setStatus(error.message || "Не удалось выполнить выход.");
    } finally {
      if (button) button.disabled = false;
    }
  }

  function scheduleSync() {
    if (!cloudAuthenticated || applyingCloudState) return;
    if (cloudSyncBusy) {
      syncAgain = true;
      return;
    }
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => syncNow({ automatic: true }), SYNC_DEBOUNCE_MS);
  }

  async function syncNow(options = {}) {
    if (cloudSyncBusy) {
      syncAgain = true;
      return false;
    }

    if (!cloudAuthenticated && !(await refreshAuth())) {
      if (!options.automatic) showToast("Сначала войди через Яндекс ID");
      return false;
    }

    let syncSucceeded = false;
    cloudSyncBusy = true;
    const button = byId("cloudSync");
    if (button) {
      button.disabled = true;
      button.textContent = "Синхронизация…";
    }

    try {
      // Include an active workout draft in the snapshot being synchronized.
      if (typeof activeSession !== "undefined" && activeSession) {
        activeSession.updatedAt = new Date().toISOString();
        state.draft = activeSession;
      }

      setStatus("Получаем данные из облака…");

      const getResponse = await fetch(API_BASE + "/state", {
        method: "GET",
        credentials: "include",
        cache: "no-store"
      });
      const cloudPayload = await getResponse.json().catch(() => ({}));

      if (getResponse.status === 401) {
        cloudAuthenticated = false;
        updatePanel();
        showAuthGate("Сессия завершилась. Для продолжения снова войди через Яндекс ID.");
        throw new Error("Сессия не найдена. Войди через Яндекс ID ещё раз.");
      }
      if (!getResponse.ok) {
        throw new Error(cloudPayload.error || "Не удалось прочитать облачные данные (HTTP " + getResponse.status + ").");
      }

      if (cloudPayload.exists && (
        !cloudPayload.state ||
        !Array.isArray(cloudPayload.state.sessions) ||
        !Array.isArray(cloudPayload.state.bodyWeights) ||
        !cloudPayload.state.settings ||
        typeof cloudPayload.state.settings !== "object"
      )) {
        throw new Error("Структура облачных данных не распознана. Локальные данные не изменены.");
      }

      const remoteState = cloudPayload.exists ? normalizeState(cloudPayload.state) : blankState();
      const mergedState = mergeStates(state, remoteState);

      setStatus("Сохраняем объединённые данные в облаке…");
      const putResponse = await fetch(API_BASE + "/state", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: mergedState }),
        cache: "no-store"
      });
      const putPayload = await putResponse.json().catch(() => ({}));

      if (putResponse.status === 401) {
        cloudAuthenticated = false;
        updatePanel();
        showAuthGate("Сессия завершилась. Для продолжения снова войди через Яндекс ID.");
        throw new Error("Сессия не найдена. Войди через Яндекс ID ещё раз.");
      }
      if (!putResponse.ok) {
        throw new Error(putPayload.error || "Не удалось сохранить данные в облаке (HTTP " + putResponse.status + ").");
      }

      const previousState = state;
      applyingCloudState = true;
      state = mergedState;
      const savedLocally = saveState();
      applyingCloudState = false;

      if (!savedLocally) {
        state = previousState;
        throw new Error("Облако обновлено, но локально сохранить объединённые данные не удалось.");
      }

      if (typeof activeSession !== "undefined" && activeSession &&
          mergedState.draft && mergedState.draft.id === activeSession.id) {
        activeSession = mergedState.draft;
      }

      renderHome();
      renderHistory();
      renderProgress();

      setStatus(
        "Синхронизация завершена. Тренировок: " + mergedState.sessions.length +
        ", измерений веса: " + mergedState.bodyWeights.length + "."
      );
      syncSucceeded = true;
      if (!options.automatic) showToast("Данные FitTrack синхронизированы");
    } catch (error) {
      applyingCloudState = false;
      setStatus(error.message || "Не удалось выполнить синхронизацию. Локальные данные сохранены.");
    } finally {
      applyingCloudState = false;
      cloudSyncBusy = false;
      if (button) {
        button.disabled = false;
        button.textContent = "Синхронизировать сейчас";
      }
      if (syncAgain) {
        syncAgain = false;
        scheduleSync();
      }
    }

    return syncSucceeded;
  }

  async function verifyAndEnter() {
  if (authCheckBusy) return;

  authCheckBusy = true;
  const retryButton = byId("authGateRetry");

  try {
    showAuthGate("Проверяем авторизацию через Яндекс ID…");

    if (retryButton) retryButton.disabled = true;

    const authenticated = await refreshAuth();

    if (!authenticated) {
      const panelStatus = byId("cloudSyncStatus");

      setGateStatus(
        panelStatus && panelStatus.textContent
          ? panelStatus.textContent
          : "Для продолжения работы войди через Яндекс ID."
      );

      return;
    }

    setGateStatus("Вход подтверждён. Загружаем и объединяем данные с облаком…");

    const synced = await syncNow({
      automatic: true,
      initial: true
    });

    if (!cloudAuthenticated) {
      showAuthGate("Сессия не подтверждена. Войди через Яндекс ID ещё раз.");
      return;
    }

    unlockApp();

    if (!synced) {
      setStatus(
        "Вход выполнен. Облачная синхронизация временно недоступна; локальные данные сохранены. Повторим её автоматически."
      );

      showToast("Вход выполнен. Облако пока недоступно.");
    }

  } catch (error) {
    showAuthGate(
      error.message || "Не удалось проверить авторизацию. Попробуй ещё раз."
    );

  } finally {
    authCheckBusy = false;

    if (retryButton) {
      retryButton.disabled = false;
    }
  }
}

  function handleOAuthReturn() {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("auth") === "success";
    const error = params.get("auth_error");

    if (success) {
      setGateStatus("Вход через Яндекс выполнен. Проверяем аккаунт и загружаем данные…");
    } else if (error) {
      const messages = {
        access_denied: "Вход через Яндекс отменён.",
        invalid_callback: "Не удалось проверить ответ Яндекса.",
        oauth_exchange_failed: "Не удалось завершить вход через Яндекс.",
        userinfo_failed: "Не удалось получить профиль Яндекса.",
        session_store_failed: "Не удалось сохранить сессию FitTrack.",
        session_permission_error: "У API недостаточно прав для работы с сессией.",
        session_table_error: "Не найдена таблица сессий.",
        session_query_error: "Ошибка запроса к базе данных.",
        session_db_connection_error: "Не удалось подключиться к базе данных."
      };
      setGateStatus(messages[error] || "Не удалось выполнить вход через Яндекс. Попробуй ещё раз.");
    }

    if (success || error) {
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    }
  }

  function initCloudSync() {
    const loginButton = byId("authGateLogin");
    const retryButton = byId("authGateRetry");
    const syncButton = byId("cloudSync");
    const logoutButton = byId("cloudLogout");
    if (!loginButton || !retryButton || !syncButton || !logoutButton) return;

    loginButton.addEventListener("click", login);
    retryButton.addEventListener("click", verifyAndEnter);
    syncButton.addEventListener("click", () => syncNow({ automatic: false }));
    logoutButton.addEventListener("click", logout);

    // Any successful local save is uploaded after a short pause.
    window.addEventListener("fittrack:state-saved", scheduleSync);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        if (document.body.classList.contains("auth-required")) {
          verifyAndEnter();
        } else {
          refreshAuth().then((authenticated) => {
            if (authenticated) syncNow({ automatic: true });
            else showAuthGate("Сессия завершилась. Для продолжения снова войди через Яндекс ID.");
          });
        }
      }
    });

window.addEventListener("pageshow", (event) => {
  if (!event.persisted) return;

  const loginButton = byId("authGateLogin");
  const retryButton = byId("authGateRetry");

  if (loginButton) {
    loginButton.disabled = false;
    loginButton.textContent = "Войти через Яндекс ID";
  }

  if (retryButton) {
    retryButton.disabled = false;
  }

  if (document.body.classList.contains("auth-required")) {
    authCheckBusy = false;
    verifyAndEnter();
  }
});
    
    handleOAuthReturn();
    verifyAndEnter();
  }

  // app.js must be loaded immediately before this file.
  initCloudSync();
})();
