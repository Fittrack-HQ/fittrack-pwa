(() => {
  "use strict";

  const API_BASE = "https://api.fittrack-app.ru";
  const SYNC_DEBOUNCE_MS = 1200;

  let cloudAuthenticated = false;
  let cloudSyncBusy = false;
  let syncAgain = false;
  let applyingCloudState = false;
  let syncTimer = null;

  const byId = (id) => document.getElementById(id);

  function setStatus(message) {
    const element = byId("cloudSyncStatus");
    if (element) element.textContent = message;
  }

  function updatePanel() {
    const login = byId("cloudLogin");
    const sync = byId("cloudSync");
    const logout = byId("cloudLogout");
    const authStatus = byId("cloudAuthStatus");

    if (!login || !sync || !logout || !authStatus) return;

    login.classList.toggle("hidden", cloudAuthenticated);
    sync.classList.toggle("hidden", !cloudAuthenticated);
    logout.classList.toggle("hidden", !cloudAuthenticated);

    authStatus.textContent = cloudAuthenticated
      ? "Вход через Яндекс ID выполнен. Данные FitTrack синхронизируются с облаком автоматически."
      : "Вход не выполнен. Локальные данные продолжают храниться на этом устройстве.";
  }

  async function refreshAuth() {
    try {
      const response = await fetch(API_BASE + "/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store"
      });

      const payload = await response.json().catch(() => ({}));
      cloudAuthenticated = response.ok && payload.authenticated === true;
      updatePanel();

      if (cloudAuthenticated) {
        setStatus("Аккаунт подключён. Проверяем и обновляем облачные данные…");
      } else if (response.status === 401) {
        setStatus("Войди через Яндекс ID, чтобы включить облачное хранение.");
      } else {
        setStatus("Не удалось проверить вход. Проверь подключение к интернету.");
      }

      return cloudAuthenticated;
    } catch (_) {
      cloudAuthenticated = false;
      updatePanel();
      setStatus("API временно недоступен. Локальные данные не затронуты.");
      return false;
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
      setStatus("Вы вышли из аккаунта. Локальные и облачные данные сохранены.");
      showToast("Выход выполнен");
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
      return;
    }

    if (!cloudAuthenticated && !(await refreshAuth())) {
      if (!options.automatic) showToast("Сначала войди через Яндекс ID");
      return;
    }

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
  }

  function handleOAuthReturn() {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("auth") === "success";
    const error = params.get("auth_error");

    if (success) {
      showToast("Вход через Яндекс выполнен. Подключаем облако…");
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
      showToast(messages[error] || "Не удалось выполнить вход через Яндекс.");
    }

    if (success || error) {
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    }
  }

  function initCloudSync() {
    const loginButton = byId("cloudLogin");
    const syncButton = byId("cloudSync");
    const logoutButton = byId("cloudLogout");
    if (!loginButton || !syncButton || !logoutButton) return;

    loginButton.addEventListener("click", login);
    syncButton.addEventListener("click", () => syncNow({ automatic: false }));
    logoutButton.addEventListener("click", logout);

    // Any successful local save is uploaded after a short pause.
    window.addEventListener("fittrack:state-saved", scheduleSync);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        refreshAuth().then((authenticated) => {
          if (authenticated) syncNow({ automatic: true });
        });
      }
    });

    handleOAuthReturn();
    refreshAuth().then((authenticated) => {
      if (authenticated) syncNow({ automatic: true });
    });
  }

  // app.js must be loaded immediately before this file.
  initCloudSync();
})();
