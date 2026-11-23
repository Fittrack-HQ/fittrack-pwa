(() => {
  "use strict";

  const API_BASE = "https://api.fittrack-app.ru";
  const REQUEST_TIMEOUT_MS = 15000;
  const SYNC_DEBOUNCE_MS = 1200;

  let cloudAuthenticated = false;
  let cloudSyncBusy = false;
  let syncAgain = false;
  let applyingCloudState = false;
  let syncTimer = null;
  let authCheckPromise = null;
  let resumeCheckPromise = null;

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

    const retryButton = byId("authGateRetry");
    if (retryButton) retryButton.disabled = false;

    if (message) setGateStatus(message);
  }

  function unlockApp() {
    document.body.classList.remove("auth-required");
    const gate = byId("authGate");
    if (gate) gate.classList.add("hidden");
  }

  function updatePanel() {
    const syncButton = byId("cloudSync");
    const logoutButton = byId("cloudLogout");
    const authStatus = byId("cloudAuthStatus");

    if (syncButton) syncButton.classList.toggle("hidden", !cloudAuthenticated);
    if (logoutButton) logoutButton.classList.toggle("hidden", !cloudAuthenticated);

    if (authStatus) {
      authStatus.textContent = cloudAuthenticated
        ? "Вход через Яндекс ID выполнен. Данные FitTrack синхронизируются с облаком автоматически."
        : "Нет активной сессии. Для входа используй стартовый экран FitTrack.";
    }
  }

  async function apiFetch(path, options = {}) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS
    );

    try {
      return await fetch(API_BASE + path, {
        ...options,
        credentials: "include",
        cache: "no-store",
        signal: controller.signal
      });
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  async function responseJson(response) {
    return response.json().catch(() => ({}));
  }

  function requestError(error, fallback) {
    if (error && error.name === "AbortError") {
      return "Сервер не ответил за 15 секунд. Проверь интернет и нажми «Проверить ещё раз».";
    }
    if (error instanceof TypeError) {
      return "Браузер не смог выполнить запрос из FitTrack к API. Возможна проблема CORS или передачи cookie. Локальные данные сохранены.";
    }
    return (error && error.message) || fallback;
  }

  async function refreshAuth() {
    try {
      const response = await apiFetch("/auth/me", { method: "GET" });
      const payload = await responseJson(response);

      if (response.status === 401) {
        cloudAuthenticated = false;
        updatePanel();

        return {
          ok: true,
          authenticated: false,
          unauthorized: true,
          message: "Приложение получило HTTP 401 от /auth/me: сессионная cookie не пришла в запрос из FitTrack. Проверь вход и настройки доступа браузера."
        };
      }

      if (!response.ok) {
        return {
          ok: false,
          authenticated: cloudAuthenticated,
          unauthorized: false,
          message: payload.error || "Не удалось проверить авторизацию (HTTP " + response.status + ")."
        };
      }

      if (payload.authenticated !== true) {
        cloudAuthenticated = false;
        updatePanel();
        return {
          ok: true,
          authenticated: false,
          unauthorized: true,
          message: "Активная сессия не найдена. Войди через Яндекс ID."
        };
      }

      cloudAuthenticated = true;
      updatePanel();
      return { ok: true, authenticated: true, unauthorized: false };
    } catch (error) {
      // A temporary network failure must not erase a previously verified session.
      updatePanel();
      return {
        ok: false,
        authenticated: cloudAuthenticated,
        unauthorized: false,
        message: requestError(error, "API временно недоступен.")
      };
    }
  }

  function normalizeState(source) {
    const defaults = blankState();
    const value = source && typeof source === "object" ? source : {};

    return {
      ...defaults,
      ...value,
      sessions: Array.isArray(value.sessions) ? value.sessions : [],
      deletedSessions: Array.isArray(value.deletedSessions) ? value.deletedSessions : [],
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

      // On matching IDs the copy on the current device takes precedence.
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

    const deletedSessions = [...new Set([
      ...remote.deletedSessions,
      ...local.deletedSessions
    ].map(String))];

    const deletedIds = new Set(deletedSessions);

    return {
      sessions: mergeRecords(remote.sessions, local.sessions)
        .filter(session => !deletedIds.has(String(session.id))),
      deletedSessions,
      bodyWeights: mergeRecords(remote.bodyWeights, local.bodyWeights),
      draft,
      settings
    };
  }

  function goToYandexLogin() {
    // The visible login control is a real link. It works even when this script fails to initialize.
    window.location.href = API_BASE + "/oauth/login";
  }

  async function logout() {
    if (!cloudAuthenticated) return;

    if (!window.confirm("Выйти из аккаунта FitTrack? Локальные и облачные данные останутся сохранены.")) {
      return;
    }

    const button = byId("cloudLogout");
    if (button) button.disabled = true;

    try {
      const response = await apiFetch("/auth/logout", { method: "POST" });
      const payload = await responseJson(response);

      if (!response.ok) {
        throw new Error(payload.error || "Не удалось завершить сессию (HTTP " + response.status + ").");
      }

      cloudAuthenticated = false;
      clearTimeout(syncTimer);
      updatePanel();
      showAuthGate("Вы вышли из FitTrack. Чтобы продолжить работу, войди через Яндекс ID.");
      setStatus("Вы вышли из аккаунта. Локальные и облачные данные сохранены.");
    } catch (error) {
      setStatus(requestError(error, "Не удалось выполнить выход."));
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

    window.clearTimeout(syncTimer);
    syncTimer = window.setTimeout(
      () => syncNow({ automatic: true }),
      SYNC_DEBOUNCE_MS
    );
  }

  async function syncNow(options = {}) {
    if (cloudSyncBusy) {
      syncAgain = true;
      return false;
    }

    if (!cloudAuthenticated) {
      const auth = await refreshAuth();
      if (!auth.authenticated) {
        if (auth.unauthorized) {
          showAuthGate(auth.message);
        }
        return false;
      }
    }

    cloudSyncBusy = true;
    let syncSucceeded = false;
    const button = byId("cloudSync");

    if (button && !options.automatic) {
      button.disabled = true;
      button.textContent = "Синхронизация…";
    }

    try {
      if (typeof activeSession !== "undefined" && activeSession) {
        activeSession.updatedAt = new Date().toISOString();
        state.draft = activeSession;
      }

      setStatus("Получаем данные из облака…");

      const getResponse = await apiFetch("/state", { method: "GET" });
      const cloudPayload = await responseJson(getResponse);

      if (getResponse.status === 401) {
        cloudAuthenticated = false;
        updatePanel();
        showAuthGate("Сессия завершилась. Войди через Яндекс ID ещё раз.");
        throw new Error("Сессия не найдена. Требуется повторный вход.");
      }

      if (!getResponse.ok) {
        throw new Error(
          cloudPayload.error ||
          "Не удалось прочитать облачные данные (HTTP " + getResponse.status + ")."
        );
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

      const remoteState = cloudPayload.exists
        ? normalizeState(cloudPayload.state)
        : blankState();

      const mergedState = mergeStates(state, remoteState);

      setStatus("Сохраняем объединённые данные в облаке…");

      const putResponse = await apiFetch("/state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: mergedState })
      });
      const putPayload = await responseJson(putResponse);

      if (putResponse.status === 401) {
        cloudAuthenticated = false;
        updatePanel();
        showAuthGate("Сессия завершилась. Войди через Яндекс ID ещё раз.");
        throw new Error("Сессия не найдена. Требуется повторный вход.");
      }

      if (!putResponse.ok) {
        throw new Error(
          putPayload.error ||
          "Не удалось сохранить облачные данные (HTTP " + putResponse.status + ")."
        );
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

      if (
        typeof activeSession !== "undefined" &&
        activeSession &&
        mergedState.draft &&
        mergedState.draft.id === activeSession.id
      ) {
        activeSession = mergedState.draft;
      }

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

      syncSucceeded = true;
      if (!options.automatic) showToast("Данные FitTrack синхронизированы");
    } catch (error) {
      applyingCloudState = false;
      setStatus(requestError(error, "Не удалось выполнить синхронизацию. Локальные данные сохранены."));
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

  function verifyAndEnter() {
    if (authCheckPromise) return authCheckPromise;

    authCheckPromise = (async () => {
      showAuthGate("Проверяем сессию FitTrack…");

      const retryButton = byId("authGateRetry");
      if (retryButton) retryButton.disabled = true;

      try {
        const auth = await refreshAuth();

        if (!auth.authenticated) {
          setGateStatus(
            auth.message ||
            "Вход не выполнен. Нажми «Войти через Яндекс ID»."
          );
          return false;
        }

        setGateStatus("Вход подтверждён. Загружаем данные из облака…");

        const synced = await syncNow({ automatic: true, initial: true });

        if (!cloudAuthenticated) {
          showAuthGate("Сессия не подтверждена. Войди через Яндекс ID ещё раз.");
          return false;
        }

        unlockApp();

        if (!synced) {
          setStatus(
            "Вход выполнен. Облако временно недоступно; локальные данные сохранены. Синхронизация повторится позже."
          );
          showToast("Вход выполнен. Облако пока недоступно.");
        }

        return true;
      } catch (error) {
        setGateStatus(requestError(error, "Не удалось проверить вход. Попробуй ещё раз."));
        return false;
      } finally {
        if (retryButton) retryButton.disabled = false;
      }
    })().finally(() => {
      authCheckPromise = null;
    });

    return authCheckPromise;
  }

  async function resumeSession() {
    if (resumeCheckPromise) return resumeCheckPromise;

    resumeCheckPromise = (async () => {
      const auth = await refreshAuth();

      if (auth.unauthorized) {
        showAuthGate("Сессия завершилась. Войди через Яндекс ID, чтобы продолжить.");
        setGateStatus("Сессия завершилась. Войди через Яндекс ID, чтобы продолжить.");
        return;
      }

      if (!auth.authenticated) {
        // Keep an already unlocked app usable during a temporary network outage.
        if (auth.message) setStatus(auth.message);
        return;
      }

      await syncNow({ automatic: true });
    })().finally(() => {
      resumeCheckPromise = null;
    });

    return resumeCheckPromise;
  }

  function handleOAuthReturn() {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("auth") === "success";
    const error = params.get("auth_error");

    if (success) {
      setGateStatus("Вход через Яндекс выполнен. Проверяем сессию и загружаем данные…");
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

      setGateStatus(
        messages[error] ||
        "Не удалось выполнить вход через Яндекс. Попробуй ещё раз."
      );
    }

    if (success || error) {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.hash
      );
    }
  }

  function initCloudSync() {
    const loginLink = byId("authGateLogin");
    const retryButton = byId("authGateRetry");
    const syncButton = byId("cloudSync");
    const logoutButton = byId("cloudLogout");
    const gate = byId("authGate");

    // The login anchor and gate are the only UI elements needed for authentication.
    // Profile controls are optional: their absence must never block sign-in.
    if (loginLink && !loginLink.getAttribute("href")) {
      loginLink.href = API_BASE + "/oauth/login";
    }

    if (retryButton) {
      retryButton.addEventListener("click", verifyAndEnter);
    }

    if (syncButton) {
      syncButton.addEventListener("click", () => syncNow({ automatic: false }));
    }

    if (logoutButton) {
      logoutButton.addEventListener("click", logout);
    }

    // If optional profile controls are missing, report this without blocking auth.
    const missingOptional = [];
    if (!syncButton) missingOptional.push("cloudSync");
    if (!logoutButton) missingOptional.push("cloudLogout");
    if (missingOptional.length) {
      setStatus("Вход доступен. Не найдены дополнительные элементы профиля: " + missingOptional.join(", ") + ".");
    }

    if (!gate) {
      console.error("FitTrack: #authGate was not found; authentication will still be checked.");
    }

    window.addEventListener("fittrack:state-saved", scheduleSync);

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "visible") return;

      if (document.body.classList.contains("auth-required")) {
        verifyAndEnter();
      } else {
        resumeSession();
      }
    });

    window.addEventListener("pageshow", (event) => {
      if (!event.persisted) return;

      if (document.body.classList.contains("auth-required")) {
        verifyAndEnter();
      } else {
        resumeSession();
      }
    });

    handleOAuthReturn();
    verifyAndEnter();
  }

  initCloudSync();
})();
