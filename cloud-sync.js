(() => {
  "use strict";

  const API_BASE = "https://api.fittrack-app.ru";
  const CLOUD_BACKUP_KEY = "fittrack-cloud-first-sync-backup-v1";

  let cloudAuthenticated = false;
  let cloudSyncBusy = false;

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
      ? "Вход через Яндекс ID выполнен. Эта учётная запись используется для облачных данных."
      : "Вход не выполнен. Локальные тренировки продолжают храниться на этом устройстве.";
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
        setStatus("Аккаунт подключён. Нажми «Синхронизировать сейчас», чтобы объединить данные устройств.");
      } else if (response.status === 401) {
        setStatus("Войди через Яндекс ID, чтобы включить облачную синхронизацию.");
      } else {
        setStatus("Не удалось проверить вход. Проверь подключение и попробуй ещё раз.");
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

      // For the same record ID, the local copy takes precedence.
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

    if (!confirm("Выйти из аккаунта FitTrack? Локальные и облачные данные останутся сохранены.")) {
      return;
    }

    const button = byId("cloudLogout");
    button.disabled = true;

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
      button.disabled = false;
    }
  }

  async function syncNow() {
    if (cloudSyncBusy) return;

    if (!cloudAuthenticated && !(await refreshAuth())) {
      showToast("Сначала войди через Яндекс ID");
      return;
    }

    // Include the currently edited workout draft in the local snapshot.
    if (typeof activeSession !== "undefined" && activeSession) {
      activeSession.updatedAt = new Date().toISOString();
      state.draft = activeSession;
      saveState();
    }

    // Confirm the backup separately before starting network sync.
if (!localStorage.getItem(CLOUD_BACKUP_KEY)) {
  const backupConfirmed = confirm(
    "Ты уже сохранил резервную копию FitTrack JSON в приложении «Файлы» на этом устройстве? " +
    "Нажми OK, если файл сохранён. Если нет — нажми «Отмена» и сначала экспортируй данные."
  );

  if (!backupConfirmed) {
    setStatus("Сначала сохрани резервную копию через «Экспортировать данные».");
    return;
  }

  localStorage.setItem(CLOUD_BACKUP_KEY, "done");
  setStatus("Резервная копия подтверждена. Нажми «Синхронизировать сейчас» ещё раз.");
  showToast("Резервная копия подтверждена");
  return;
}
    }

    cloudSyncBusy = true;
    const button = byId("cloudSync");
    button.disabled = true;
    button.textContent = "Синхронизация…";
    setStatus("Получаем данные из облака…");

    try {
      const getResponse = await fetch(API_BASE + "/state", {
        method: "GET",
        credentials: "include",
        cache: "no-store"
      });

      const cloudPayload = await getResponse.json().catch(() => ({}));

      if (getResponse.status === 401) {
        cloudAuthenticated = false;
        updatePanel();
        throw new Error("Сессия истекла. Войди через Яндекс ID ещё раз.");
      }

      if (!getResponse.ok) {
        throw new Error(
          cloudPayload.error ||
          "Не удалось прочитать облачные данные (HTTP " + getResponse.status + ")."
        );
      }

      if (
        cloudPayload.exists &&
        (
          !cloudPayload.state ||
          !Array.isArray(cloudPayload.state.sessions) ||
          !Array.isArray(cloudPayload.state.bodyWeights) ||
          !cloudPayload.state.settings ||
          typeof cloudPayload.state.settings !== "object"
        )
      ) {
        throw new Error("Структура облачных данных не распознана. Локальные данные не изменены.");
      }

      const remoteState = cloudPayload.exists
        ? normalizeState(cloudPayload.state)
        : blankState();

      const mergedState = mergeStates(state, remoteState);

      setStatus("Объединяем историю и сохраняем результат в облако…");

      const putResponse = await fetch(API_BASE + "/state", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ state: mergedState }),
        cache: "no-store"
      });

      const putPayload = await putResponse.json().catch(() => ({}));

      if (putResponse.status === 401) {
        cloudAuthenticated = false;
        updatePanel();
        throw new Error("Сессия истекла. Войди через Яндекс ID ещё раз.");
      }

      if (!putResponse.ok) {
        throw new Error(
          putPayload.error ||
          "Не удалось сохранить облачные данные (HTTP " + putResponse.status + ")."
        );
      }

      const previousState = state;
      state = mergedState;

      if (!saveState()) {
        state = previousState;
        throw new Error(
          "Облако обновлено, но локально не удалось сохранить объединённую историю. Повтори синхронизацию на этом устройстве."
        );
      }

      if (
        typeof activeSession !== "undefined" &&
        activeSession &&
        mergedState.draft &&
        mergedState.draft.id === activeSession.id
      ) {
        activeSession = mergedState.draft;
      }

      localStorage.setItem(CLOUD_BACKUP_KEY, "done");

      renderHome();
      renderHistory();
      renderProgress();

      setStatus(
        "Синхронизация завершена. Тренировок: " +
        mergedState.sessions.length +
        ", измерений веса: " +
        mergedState.bodyWeights.length +
        "."
      );

      showToast("Данные FitTrack синхронизированы");
    } catch (error) {
      setStatus(
        error.message ||
        "Не удалось выполнить синхронизацию. Локальные данные сохранены."
      );
    } finally {
      cloudSyncBusy = false;
      button.disabled = false;
      button.textContent = "Синхронизировать сейчас";
    }
  }

  function initCloudSync() {
    const loginButton = byId("cloudLogin");
    const syncButton = byId("cloudSync");
    const logoutButton = byId("cloudLogout");

    if (!loginButton || !syncButton || !logoutButton) return;

    loginButton.addEventListener("click", login);
    syncButton.addEventListener("click", syncNow);
    logoutButton.addEventListener("click", logout);

    handleOAuthReturn();
    refreshAuth();
  }

  function handleOAuthReturn() {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("auth") === "success";
    const error = params.get("auth_error");

    if (success) {
      showToast("Вход через Яндекс выполнен");
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
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.hash
      );
    }
  }

  // app.js is loaded immediately before this file at the end of index.html.
  initCloudSync();
})();
