const STORAGE_KEY = "fittrack-v1";
const workouts = [
  {
    "id": "A",
    "day": "ПОНЕДЕЛЬНИК",
    "title": "Тренировка A",
    "subtitle": "Грудь · трицепс · пресс",
    "focus": "Грудь · трицепс · пресс",
    "exercises": [
      {
        "id": "chest-press",
        "name": "Жим от груди в тренажёре",
        "sets": 3,
        "reps": "8–12",
        "rest": 120,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0577-T0yTjgW.gif",
        "tech": "Настрой сиденье так, чтобы рукояти были на уровне середины груди. Прижми спину к опоре, выжимай плавно.",
        "muscles": "Грудные мышцы, трицепс",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "incline-press",
        "name": "Наклонный жим от груди в тренажёре",
        "sets": 3,
        "reps": "8–12",
        "rest": 120,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/1299-jHAnWmT.gif",
        "tech": "Настрой умеренный наклон. Держи спину у опоры, опускай рукояти до комфортной глубины.",
        "muscles": "Верх груди, передние дельты, трицепс",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "pec-deck",
        "name": "Сведение рук в тренажёре («бабочка»)",
        "sets": 3,
        "reps": "10–15",
        "rest": 90,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0596-v3xmPAR.gif",
        "tech": "Прижми спину к спинке и своди рукояти перед собой без рывка.",
        "muscles": "Грудные мышцы",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "db-bench",
        "name": "Жим гантелей лёжа",
        "sets": 3,
        "reps": "8–12",
        "rest": 120,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0289-SpYC0Kp.gif",
        "tech": "Стопы на полу, лопатки сведены. Опускай гантели по сторонам груди и выжимай под контролем.",
        "muscles": "Грудные мышцы, трицепс",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "triceps-push",
        "name": "Разгибание рук на верхнем блоке",
        "sets": 3,
        "reps": "10–15",
        "rest": 75,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0241-gAwDzB3.gif",
        "tech": "Локти держи возле корпуса. Разгибай руки без раскачивания.",
        "muscles": "Трицепс",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "triceps-overhead",
        "name": "Разгибание рук из-за головы",
        "sets": 3,
        "reps": "10–15",
        "rest": 75,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0092-5uFK1xr.gif",
        "tech": "Удерживай корпус стабильно, локти направлены вверх. Не прогибай поясницу.",
        "muscles": "Трицепс",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "bench-dips",
        "name": "Обратные отжимания от скамьи",
        "sets": 3,
        "reps": "8–12",
        "rest": 90,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0129-RrLske5.gif",
        "tech": "Не опускайся глубоко. При дискомфорте в плечах пропусти упражнение.",
        "muscles": "Трицепс",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "abs-leg-raise",
        "name": "Подъём ног лёжа на скамье",
        "sets": 3,
        "reps": "10–15",
        "rest": 75,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0620-WhuFnR7.gif",
        "tech": "Ляг на скамью, держись за её край. Поднимай ноги без рывка, не раскачивай таз и опускай их подконтрольно, не прогибая поясницу.",
        "muscles": "Прямая мышца живота",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "abs-decline",
        "name": "Скручивания на наклонной скамье",
        "sets": 3,
        "reps": "10–15",
        "rest": 75,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0282-QLL2gdc.gif",
        "tech": "Поднимай корпус за счёт мышц живота, не тяни себя за шею. Двигайся плавно.",
        "muscles": "Мышцы живота",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "abs-captain",
        "name": "Подъём коленей в тренажёре капитанский стул",
        "sets": 3,
        "reps": "8–12",
        "rest": 75,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/2963-weoDEpH.gif",
        "tech": "Упрись предплечьями в подушки и прижми спину к опоре. Поднимай колени контролируемо, не раскачиваясь.",
        "muscles": "Мышцы живота и сгибатели бедра",
        "startWeight": "Начни с лёгкого веса"
      }
    ]
  },
  {
    "id": "B",
    "day": "СРЕДА",
    "title": "Тренировка B",
    "subtitle": "Ноги · плечи · пресс",
    "focus": "Ноги · плечи · пресс",
    "exercises": [
      {
        "id": "leg-extension",
        "name": "Разгибание ног в тренажёре",
        "sets": 3,
        "reps": "10–15",
        "rest": 90,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0585-my33uHU.gif",
        "tech": "Совмести колени с осью тренажёра. Разгибай плавно, затем медленно опускай валик.",
        "muscles": "Квадрицепсы",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "lying-leg-curl",
        "name": "Сгибание ног лёжа",
        "sets": 3,
        "reps": "10–15",
        "rest": 90,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0586-17lJ1kr.gif",
        "tech": "Таз остаётся на скамье. Сгибай колени плавно, не поднимай таз.",
        "muscles": "Задняя поверхность бедра",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "reverse-lunge",
        "name": "Выпады назад",
        "sets": 3,
        "reps": "8–10 на ногу",
        "rest": 90,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0381-SSsBDwB.gif",
        "tech": "Начни без веса. Шаг назад, комфортная амплитуда, устойчивый корпус.",
        "muscles": "Квадрицепсы, ягодичные мышцы",
        "startWeight": "Сначала без веса"
      },
      {
        "id": "hip-abduction",
        "name": "Разведение бёдер в тренажёре",
        "sets": 3,
        "reps": "12–15",
        "rest": 75,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0597-CHpahtl.gif",
        "tech": "Спина у опоры, таз неподвижен. Разводи колени плавно.",
        "muscles": "Средняя ягодичная мышца",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "hip-adduction",
        "name": "Сведение бёдер в тренажёре",
        "sets": 3,
        "reps": "12–15",
        "rest": 75,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0598-oHsrypV.gif",
        "tech": "Сохраняй спину у опоры. Своди колени плавно, без инерции.",
        "muscles": "Приводящие мышцы бедра",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "calf-raise",
        "name": "Подъёмы на носки сидя",
        "sets": 3,
        "reps": "12–20",
        "rest": 75,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0594-bOOdeyc.gif",
        "tech": "Опускай пятки в комфортную растяжку и поднимайся на носки с паузой наверху.",
        "muscles": "Икроножная и камбаловидная мышцы",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "shoulder-press",
        "name": "Жим вверх в тренажёре на плечи",
        "sets": 3,
        "reps": "10–12",
        "rest": 90,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0603-67n3r98.gif",
        "tech": "Рукояти примерно на уровне ушей. Не прогибай поясницу, выжимай плавно.",
        "muscles": "Дельтовидные мышцы, трицепс",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "lateral-raise",
        "name": "Махи гантелями в стороны",
        "sets": 3,
        "reps": "12–15",
        "rest": 75,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0334-DsgkuIt.gif",
        "tech": "Лёгкие гантели, слегка согнутые локти. Поднимай руки до уровня плеч без раскачивания.",
        "muscles": "Средняя дельта",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "abs-leg-raise",
        "name": "Подъём ног лёжа на скамье",
        "sets": 3,
        "reps": "10–15",
        "rest": 75,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0620-WhuFnR7.gif",
        "tech": "Ляг на скамью, держись за её край. Поднимай ноги без рывка, не раскачивай таз и опускай их подконтрольно, не прогибая поясницу.",
        "muscles": "Прямая мышца живота",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "abs-decline",
        "name": "Скручивания на наклонной скамье",
        "sets": 3,
        "reps": "10–15",
        "rest": 75,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0282-QLL2gdc.gif",
        "tech": "Поднимай корпус за счёт мышц живота, не тяни себя за шею. Двигайся плавно.",
        "muscles": "Мышцы живота",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "abs-captain",
        "name": "Подъём коленей в тренажёре капитанский стул",
        "sets": 3,
        "reps": "8–12",
        "rest": 75,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/2963-weoDEpH.gif",
        "tech": "Упрись предплечьями в подушки и прижми спину к опоре. Поднимай колени контролируемо, не раскачиваясь.",
        "muscles": "Мышцы живота и сгибатели бедра",
        "startWeight": "Начни с лёгкого веса"
      }
    ]
  },
  {
    "id": "C",
    "day": "ПЯТНИЦА",
    "title": "Тренировка C",
    "subtitle": "Спина · бицепс · пресс",
    "focus": "Спина · бицепс · пресс",
    "exercises": [
      {
        "id": "dumbbell-pullover",
        "name": "Пуловер с гантелью лёжа",
        "sets": 3,
        "reps": "10–12",
        "rest": 90,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0375-9XjtHvS.gif",
        "tech": "Ляг на скамью, стопы поставь на пол. Держи одну гантель двумя руками над грудью, слегка согни локти. Медленно опускай гантель за голову до комфортного растяжения, затем верни над грудью. Не прогибай поясницу и не опускай слишком глубоко.",
        "muscles": "Широчайшие мышцы спины, грудные мышцы",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "row-machine",
        "name": "Тяга в тренажёре сидя",
        "sets": 3,
        "reps": "8–12",
        "rest": 120,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/1350-7I6LNUG.gif",
        "tech": "Сохраняй устойчивое положение корпуса. Тяни рукояти к корпусу, сводя лопатки.",
        "muscles": "Средняя часть спины, широчайшие",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "seated-row",
        "name": "Горизонтальная тяга нижнего блока",
        "sets": 3,
        "reps": "10–12",
        "rest": 90,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0861-fUBheHs.gif",
        "tech": "Держи спину нейтрально. Тяни рукоять к животу, сводя лопатки, не раскачиваясь.",
        "muscles": "Широчайшие и средняя часть спины",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "reverse-fly",
        "name": "Обратная бабочка",
        "sets": 3,
        "reps": "12–15",
        "rest": 75,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0602-myfUsKf.gif",
        "tech": "Грудь держи у опоры. Разводи руки в стороны, не пожимая плечами.",
        "muscles": "Задние дельты, верх спины",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "machine-curl",
        "name": "Сгибание рук на бицепс в тренажёре",
        "sets": 3,
        "reps": "10–15",
        "rest": 75,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0592-b6hQYMb.gif",
        "tech": "Плечи прижаты к опоре. Сгибай руки без движения локтей вперёд.",
        "muscles": "Бицепс",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "cable-curl",
        "name": "Сгибание рук на нижнем блоке",
        "sets": 3,
        "reps": "10–15",
        "rest": 75,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0868-G08RZcQ.gif",
        "tech": "Локти возле корпуса, плечи неподвижны. Сгибай и медленно опускай рукоять.",
        "muscles": "Бицепс",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "hammer-curl",
        "name": "Молотковые сгибания с гантелями",
        "sets": 3,
        "reps": "10–15 на руку",
        "rest": 75,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0313-slDvUAU.gif",
        "tech": "Держи гантели нейтральным хватом. Не раскачивай корпус.",
        "muscles": "Бицепс и плечелучевая мышца",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "incline-curl",
        "name": "Сгибание рук с гантелями на наклонной скамье",
        "sets": 3,
        "reps": "10–12",
        "rest": 75,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0315-F3xgbjF.gif",
        "tech": "Установи спинку под умеренным наклоном. Не выводи локти вперёд и не раскачивай корпус.",
        "muscles": "Бицепс",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "abs-leg-raise",
        "name": "Подъём ног лёжа на скамье",
        "sets": 3,
        "reps": "10–15",
        "rest": 75,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0620-WhuFnR7.gif",
        "tech": "Ляг на скамью, держись за её край. Поднимай ноги без рывка, не раскачивай таз и опускай их подконтрольно, не прогибая поясницу.",
        "muscles": "Прямая мышца живота",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "abs-decline",
        "name": "Скручивания на наклонной скамье",
        "sets": 3,
        "reps": "10–15",
        "rest": 75,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0282-QLL2gdc.gif",
        "tech": "Поднимай корпус за счёт мышц живота, не тяни себя за шею. Двигайся плавно.",
        "muscles": "Мышцы живота",
        "startWeight": "Начни с лёгкого веса"
      },
      {
        "id": "abs-captain",
        "name": "Подъём коленей в тренажёре капитанский стул",
        "sets": 3,
        "reps": "8–12",
        "rest": 75,
        "gif": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/2963-weoDEpH.gif",
        "tech": "Упрись предплечьями в подушки и прижми спину к опоре. Поднимай колени контролируемо, не раскачиваясь.",
        "muscles": "Мышцы живота и сгибатели бедра",
        "startWeight": "Начни с лёгкого веса"
      }
    ]
  }
];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const todayISO=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};
const fmtDate=v=>new Date(v+"T12:00:00").toLocaleDateString("ru-RU",{day:"numeric",month:"short",year:"numeric"});
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const blankState=()=>({sessions:[],bodyWeights:[],draft:null});
function loadState(){try{const s=JSON.parse(localStorage.getItem(STORAGE_KEY));return s&&Array.isArray(s.sessions)?{...blankState(),...s}:blankState()}catch{return blankState()}}
let state=loadState(),activeWorkoutId=null,activeSession=null,timerSeconds=90,timerRemaining=90,timerInterval=null,timerRunning=false,toastTimeout=null,calendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1),selectedCalendarDate=todayISO();
function saveState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));return true}catch{showToast("Не удалось сохранить данные.");return false}}
function showToast(m){const e=$("#toast");e.textContent=m;e.classList.add("show");clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>e.classList.remove("show"),2400)}
function getWorkout(id){return workouts.find(w=>w.id===id)||workouts[0]}
function allExercises(){const m=new Map();workouts.forEach(w=>w.exercises.forEach(e=>{if(!m.has(e.id))m.set(e.id,e)}));return [...m.values()]}
function latestWeight(){return [...state.bodyWeights].sort((a,b)=>a.date.localeCompare(b.date)||a.createdAt-b.createdAt).at(-1)}
function navigate(v){$$(".view").forEach(e=>e.classList.toggle("active",e.id===`view-${v}`));$$(".tab").forEach(e=>e.classList.toggle("active",e.dataset.nav===v));if(v==="home")renderHome();if(v==="history")renderHistory();if(v==="progress")renderProgress();window.scrollTo({top:0,behavior:"smooth"})}
function workoutDoneThisWeek(){const n=new Date(),m=new Date(n);m.setDate(n.getDate()-((n.getDay()+6)%7));m.setHours(0,0,0,0);return state.sessions.filter(s=>s.completedAt&&new Date(s.completedAt)>=m).length}
function nextWorkout(){const last=[...state.sessions].filter(s=>s.completedAt).sort((a,b)=>b.completedAt.localeCompare(a.completedAt))[0];if(!last)return workouts[0];return workouts[(workouts.findIndex(w=>w.id===last.workoutId)+1)%workouts.length]}
function renderHome(){const n=nextWorkout();$("#weekCount").textContent=workoutDoneThisWeek();$("#nextDayTag").textContent=n.day;$("#nextWorkoutTitle").textContent=n.title;$("#nextWorkoutSubtitle").textContent=`${n.subtitle} · ${n.exercises.length} упражнений`;$("#totalWorkouts").textContent=state.sessions.filter(s=>s.completedAt).length;const lw=latestWeight();$("#latestBodyWeight").textContent=lw?`${Number(lw.weight).toLocaleString("ru-RU",{maximumFractionDigits:1})} кг`:"—";const ws=[...state.bodyWeights].sort((a,b)=>a.date.localeCompare(b.date));$("#bodyWeightChange").textContent=ws.length>1?`${ws.at(-1).weight-ws[0].weight>0?"+":""}${(ws.at(-1).weight-ws[0].weight).toFixed(1)} кг за период`:"добавь первое измерение";$("#homeWorkoutList").innerHTML=workouts.map(w=>`<button class="workout-card" data-start="${w.id}"><span class="workout-letter">${w.id}</span><span class="workout-card-copy"><strong>${w.title} · ${w.day.toLowerCase()}</strong><span>${w.subtitle} · ${w.exercises.length} упражнений</span></span><span class="workout-arrow">›</span></button>`).join("");$$("[data-start]").forEach(b=>b.addEventListener("click",()=>startWorkout(b.dataset.start)))}
function startWorkout(id){activeWorkoutId=id;const w=getWorkout(id),draftMatches=state.draft&&state.draft.workoutId===id&&Array.isArray(state.draft.exercises)&&state.draft.exercises.length===w.exercises.length&&w.exercises.every((e,i)=>state.draft.exercises[i]?.exerciseId===e.id&&state.draft.exercises[i]?.sets?.length===e.sets),d=draftMatches?state.draft:null;activeSession=d||{id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),workoutId:id,date:todayISO(),startedAt:new Date().toISOString(),completedAt:null,exercises:w.exercises.map(e=>({exerciseId:e.id,name:e.name,sets:Array.from({length:e.sets},()=>({weight:"",reps:"",done:false}))}))};$("#activeWorkoutDay").textContent=w.day;$("#activeWorkoutTitle").textContent=w.title;renderActiveWorkout();navigate("workout")}
function persistDraft(){state.draft=activeSession;saveState()}
function renderActiveWorkout(){if(!activeSession)return;const w=getWorkout(activeWorkoutId),done=activeSession.exercises.reduce((n,e)=>n+e.sets.filter(s=>s.done).length,0),total=activeSession.exercises.reduce((n,e)=>n+e.sets.length,0);$("#exerciseCounter").textContent=`${done} / ${total}`;$("#workoutProgressBar").style.width=`${total?done/total*100:0}%`;$("#activeExerciseList").innerHTML=activeSession.exercises.map((se,ei)=>{const ex=w.exercises.find(e=>e.id===se.exerciseId)||w.exercises[ei];return `<article class="exercise-card ${se.sets.every(s=>s.done)?"done":""}">${ex.gif?`<img class="tech-image exercise-image" src="${esc(ex.gif)}" alt="${esc(ex.name)}" loading="lazy">`:""}<div class="exercise-title-row"><div class="exercise-title-copy"><h3>${esc(se.name)}</h3><p class="muted">${ex.reps} повторений · ${restForExercise(ex)} сек отдыха</p></div><button class="tech-button" data-tech="${ei}">Техника</button></div><div class="set-header"><span>№</span><span>Вес, кг</span><span>Повторы</span><span>✓</span></div>${se.sets.map((s,si)=>`<div class="set-row"><span class="set-number">${si+1}</span><input class="number-input set-weight" type="number" min="0" step=".5" placeholder="—" value="${esc(s.weight)}" data-ei="${ei}" data-si="${si}" data-field="weight"><input class="number-input set-reps" type="number" min="0" max="100" step="1" placeholder="${ex.reps.split("–")[0]}" value="${esc(s.reps)}" data-ei="${ei}" data-si="${si}" data-field="reps"><button class="set-check ${s.done?"checked":""}" data-check="${ei}:${si}">✓</button></div>`).join("")}<div class="exercise-footer"><button class="mini-button accent" data-addset="${ei}">＋ Добавить подход</button><button class="mini-button" data-rest="${ei}">⏱ Отдых</button></div></article>`}).join("");$$("[data-tech]").forEach(b=>b.onclick=()=>showTechnique(+b.dataset.tech));$$("[data-check]").forEach(b=>b.onclick=()=>toggleSet(b.dataset.check));$$("[data-addset]").forEach(b=>b.onclick=()=>addSet(+b.dataset.addset));$$("[data-rest]").forEach(b=>b.onclick=()=>openTimer(w.exercises[+b.dataset.rest].rest));$$(".set-weight,.set-reps").forEach(i=>{const save=()=>{activeSession.exercises[+i.dataset.ei].sets[+i.dataset.si][i.dataset.field]=i.value;persistDraft()};i.addEventListener("input",save);i.addEventListener("change",save)});$$("#activeExerciseList img").forEach(i=>i.onerror=()=>i.remove());persistDraft()}
function toggleSet(k){const [ei,si]=k.split(":").map(Number),s=activeSession.exercises[ei].sets[si];s.done=!s.done;if(s.done)openTimer(getWorkout(activeWorkoutId).exercises[ei].rest);renderActiveWorkout()}
function addSet(ei){activeSession.exercises[ei].sets.push({weight:"",reps:"",done:false});renderActiveWorkout();showToast("Подход добавлен")}
function showTechnique(i){const se=activeSession.exercises[i],ex=getWorkout(activeWorkoutId).exercises.find(e=>e.id===se.exerciseId)||getWorkout(activeWorkoutId).exercises[i];$("#dialogExerciseTitle").textContent=ex.name;$("#dialogExerciseBody").innerHTML=`${ex.gif?`<img class="tech-image" src="${esc(ex.gif)}" alt="${esc(ex.name)}">`:""}<p class="muted">${esc(ex.muscles)}</p><h3>Техника выполнения</h3><p>${esc(ex.tech)}</p><div class="panel"><p><strong>План:</strong> ${ex.sets} подхода по ${ex.reps} повторений.</p>${ex.startWeight?`<p><strong>Стартовый ориентир:</strong> ${esc(ex.startWeight)}</p>`:""}<p class="muted small">Начинай с лёгкой нагрузки, оставляй 3–4 повтора в запасе и не выполняй упражнение через боль.</p></div>`;$("#exerciseDialog").showModal()}
function finishWorkout(){if(!activeSession)return;const n=activeSession.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0);if(!n&&!confirm("Ты ещё не отметил ни одного подхода. Всё равно завершить тренировку?"))return;activeSession.completedAt=new Date().toISOString();activeSession.exercises.forEach(e=>e.sets.forEach(s=>{s.weight=Number(s.weight)||0;s.reps=Number(s.reps)||0}));const previousDraft=state.draft;state.sessions.push(activeSession);state.draft=null;if(!saveState()){state.sessions.pop();state.draft=previousDraft;showToast("Не удалось сохранить тренировку. Черновик оставлен открытым — экспортируй резервную копию и освободи место в хранилище.");return}activeSession=null;activeWorkoutId=null;showToast("Тренировка сохранена");navigate("history")}
function sessionCard(s){const w=getWorkout(s.workoutId),n=s.exercises.reduce((a,e)=>a+e.sets.filter(x=>x.done).length,0);return `<div class="history-item"><div class="history-item-top"><div><h3>${w.title}</h3><p class="muted">${fmtDate(s.date)} · ${w.day.toLowerCase()}</p></div><span class="tag">${n} подходов</span></div><div class="history-summary">${s.exercises.filter(e=>e.sets.some(x=>x.done)).map(e=>esc(e.name)).join(" · ")}</div></div>`}
function renderHistory(){const ss=[...state.sessions].filter(s=>s.completedAt).sort((a,b)=>b.completedAt.localeCompare(a.completedAt));$("#historySessions").innerHTML=ss.length?ss.map(sessionCard).join(""):`<div class="empty-state">Здесь появятся завершённые тренировки. Выбери тренировку на главной и отмечай подходы.</div>`;renderCalendar();renderWeightHistory()}
function renderCalendar(){const title=$("#calendarMonthTitle"),grid=$("#calendarGrid"),detail=$("#calendarDayDetails");if(!title||!grid||!detail)return;const year=calendarMonth.getFullYear(),month=calendarMonth.getMonth(),monthName=calendarMonth.toLocaleDateString("ru-RU",{month:"long",year:"numeric"});title.textContent=monthName.charAt(0).toLocaleUpperCase("ru-RU")+monthName.slice(1);const sessions=state.sessions.filter(s=>s.completedAt),counts=new Map();sessions.forEach(s=>counts.set(s.date,(counts.get(s.date)||0)+1));const firstOffset=(new Date(year,month,1).getDay()+6)%7,days=new Date(year,month+1,0).getDate(),cells=Math.ceil((firstOffset+days)/7)*7;let markup="";for(let i=0;i<cells;i++){const day=i-firstOffset+1;if(day<1||day>days){markup+=`<span class="calendar-empty"></span>`;continue}const key=`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`,count=counts.get(key)||0;markup+=`<button class="calendar-day ${key===selectedCalendarDate?"selected":""} ${count?"has-workout":""} ${key===todayISO()?"today":""}" data-calendar-day="${key}" aria-label="${day}${count?`, тренировок: ${count}`:""}"><span>${day}</span>${count?`<i>${count>1?count:""}</i>`:""}</button>`}grid.innerHTML=markup;Array.from(document.querySelectorAll("[data-calendar-day]")).forEach(b=>b.onclick=()=>{selectedCalendarDate=b.dataset.calendarDay;renderCalendar()});const selected=sessions.filter(s=>s.date===selectedCalendarDate).sort((a,b)=>a.completedAt.localeCompare(b.completedAt));$("#calendarSelectedDate").textContent=fmtDate(selectedCalendarDate);detail.innerHTML=selected.length?selected.map(sessionCard).join(""):`<div class="empty-state">На эту дату тренировок нет.</div>`;$("#calendarPrev").onclick=()=>{calendarMonth=new Date(year,month-1,1);renderCalendar()};$("#calendarNext").onclick=()=>{calendarMonth=new Date(year,month+1,1);renderCalendar()};$("#calendarToday").onclick=()=>{calendarMonth=new Date();calendarMonth.setDate(1);selectedCalendarDate=todayISO();renderCalendar()}}
function renderWeightHistory(){$("#historyWeights").innerHTML=state.bodyWeights.length?[...state.bodyWeights].sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt-a.createdAt).map(w=>`<div class="history-item"><div class="history-item-top"><div><h3>${Number(w.weight).toLocaleString("ru-RU",{maximumFractionDigits:1})} кг</h3><p class="muted">${fmtDate(w.date)}</p></div><button class="mini-button" data-delete-weight="${w.id}">Удалить</button></div></div>`).join(""):`<div class="empty-state">Пока нет измерений. Добавь вес во вкладке «Профиль».</div>`;$$("[data-delete-weight]").forEach(b=>b.onclick=()=>{if(confirm("Удалить это измерение?")){state.bodyWeights=state.bodyWeights.filter(w=>w.id!==b.dataset.deleteWeight);saveState();renderHistory();renderProgress();renderHome()}})}
function drawChart(el,items,{valueKey="value",unit="",empty="Нет данных"}={}){if(!items.length){el.innerHTML=`<div class="empty-state">${empty}</div>`;return}const d=items.map(x=>({date:x.date,value:Number(x[valueKey]??x.value)})).filter(x=>Number.isFinite(x.value));if(!d.length){el.innerHTML=`<div class="empty-state">${empty}</div>`;return}const W=320,H=160,L=32,R=12,T=15,B=30,iw=W-L-R,ih=H-T-B;let min=Math.min(...d.map(x=>x.value)),max=Math.max(...d.map(x=>x.value));if(min===max){min-=1;max+=1}const pad=(max-min)*.12;min-=pad;max+=pad;const pts=d.map((x,i)=>({x:d.length===1?W/2:L+i*iw/(d.length-1),y:T+(max-x.value)/(max-min)*ih,d:x})),path=pts.map((p,i)=>(i?"L":"M")+p.x.toFixed(1)+" "+p.y.toFixed(1)).join(" ");el.innerHTML=`<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="График прогресса"><line x1="${L}" y1="${T+ih}" x2="${W-R}" y2="${T+ih}" stroke="#343740"/><path d="${path}" fill="none" stroke="#c5ff4a" stroke-width="2.5" stroke-linecap="round"/>${pts.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="#c5ff4a"><title>${esc(fmtDate(p.d.date))}: ${p.d.value}${unit}</title></circle>`).join("")}${pts.filter((p,i)=>i===0||i===pts.length-1).map(p=>`<text class="chart-label" x="${p.x}" y="${H-8}" text-anchor="middle">${new Date(p.d.date+"T12:00:00").toLocaleDateString("ru-RU",{day:"numeric",month:"short"})}</text>`).join("")}<text class="chart-label" x="0" y="${T+5}">${max.toFixed(1)}${unit}</text><text class="chart-label" x="0" y="${T+ih}">${Math.max(0,min).toFixed(1)}${unit}</text></svg>`}
function renderProgress(){const ws=[...state.bodyWeights].sort((a,b)=>a.date.localeCompare(b.date)||a.createdAt-b.createdAt);drawChart($("#bodyWeightChart"),ws,{valueKey:"weight",unit:" кг",empty:"Добавь несколько измерений веса, чтобы увидеть график."});const sel=$("#exerciseHistorySelect"),old=sel.value;sel.innerHTML=allExercises().map(e=>`<option value="${e.id}">${esc(e.name)}</option>`).join("");if(allExercises().some(e=>e.id===old))sel.value=old;renderExerciseChart()}
function renderExerciseChart(){const id=$("#exerciseHistorySelect").value,pts=[];state.sessions.filter(s=>s.completedAt).sort((a,b)=>a.date.localeCompare(b.date)).forEach(s=>s.exercises.filter(e=>e.exerciseId===id).forEach(e=>{const done=e.sets.filter(x=>x.done&&Number(x.weight)>0);if(done.length)pts.push({date:s.date,value:Math.max(...done.map(x=>Number(x.weight)))})}));drawChart($("#exerciseChart"),pts,{unit:" кг",empty:"Заверши подходы с указанным весом — здесь появится история."})}
function addBodyWeight(v){const weight=Number(v);if(!Number.isFinite(weight)||weight<20||weight>350){showToast("Введи корректный вес от 20 до 350 кг");return false}const entry={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),date:todayISO(),weight,createdAt:Date.now()};state.bodyWeights.push(entry);if(!saveState()){state.bodyWeights.pop();showToast("Не удалось сохранить вес. Проверь свободное место в хранилище.");return false}$("#bodyWeightInput").value="";$("#weightSaveStatus").textContent=`Сохранено: ${weight.toLocaleString("ru-RU")} кг`;renderHome();renderProgress();renderHistory();showToast("Вес тела сохранён");return true}
function openTimer(sec=90){timerSeconds=sec;timerRemaining=sec;timerRunning=false;clearInterval(timerInterval);updateTimerDisplay();$("#timerStartPause").textContent="Старт";$$(".timer-presets button").forEach(b=>b.classList.toggle("active",+b.dataset.seconds===sec));$("#timerDialog").showModal()}
function updateTimerDisplay(){const m=String(Math.floor(timerRemaining/60)).padStart(2,"0"),s=String(timerRemaining%60).padStart(2,"0");$("#timerDisplay").textContent=`${m}:${s}`;document.title=timerRunning?`${m}:${s} · FitTrack`:"FitTrack — тренировки"}
function stopTimer(){clearInterval(timerInterval);timerRunning=false;$("#timerStartPause").textContent="Старт";updateTimerDisplay()}
function toggleTimer(){if(timerRunning){stopTimer();return}if(timerRemaining<=0)timerRemaining=timerSeconds;timerRunning=true;$("#timerStartPause").textContent="Пауза";timerInterval=setInterval(()=>{timerRemaining--;updateTimerDisplay();if(timerRemaining<=0){stopTimer();showToast("Отдых окончен — следующий подход");if(navigator.vibrate)navigator.vibrate([180,100,180])}},1000)}
function setTimer(s){timerSeconds=s;timerRemaining=s;stopTimer();$$(".timer-presets button").forEach(b=>b.classList.toggle("active",+b.dataset.seconds===s));updateTimerDisplay()}
function exportBackup(){const payload={app:"FitTrack",version:1,exportedAt:new Date().toISOString(),data:{sessions:state.sessions,bodyWeights:state.bodyWeights,draft:state.draft}},blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`fittrack-backup-${todayISO()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);showToast("Резервная копия подготовлена")}
async function importBackup(file){try{const p=JSON.parse(await file.text()),d=p.data||p;if(!Array.isArray(d.sessions)||!Array.isArray(d.bodyWeights))throw Error();if(!confirm("Импорт заменит текущую историю данными из файла. Продолжить?"))return;const previousState=state;state={...blankState(),...d};if(!saveState()){state=previousState;showToast("Не удалось импортировать данные: хранилище недоступно");return}renderHome();renderHistory();renderProgress();showToast("Резервная копия импортирована")}catch{showToast("Не удалось импортировать: проверь файл")}}
function clearAll(){if(!confirm("Удалить все тренировки, измерения веса и незавершённую тренировку? Это нельзя отменить."))return;const previousState=state,previousSession=activeSession,previousWorkoutId=activeWorkoutId;state=blankState();if(!saveState()){state=previousState;activeSession=previousSession;activeWorkoutId=previousWorkoutId;showToast("Не удалось удалить данные: хранилище недоступно");return}activeSession=null;activeWorkoutId=null;renderHome();renderHistory();renderProgress();showToast("Локальные данные удалены")}
function openInstallGuide(){$("#installDialog").showModal()}
function init(){renderHome();renderHistory();renderProgress();$$("[data-nav]").forEach(b=>b.addEventListener("click",()=>{const v=b.dataset.nav;if(v==="workout"&&!activeSession){showToast("Сначала выбери тренировку");navigate("home")}else navigate(v)}));$("#startNext").onclick=()=>startWorkout(nextWorkout().id);$("#finishWorkout").onclick=finishWorkout;$("#bodyWeightForm").onsubmit=e=>{e.preventDefault();addBodyWeight($("#bodyWeightInput").value)};$("#exerciseHistorySelect").onchange=renderExerciseChart;$$("[data-history-tab]").forEach(b=>b.onclick=()=>{$$("[data-history-tab]").forEach(x=>x.classList.toggle("active",x===b));$("#historySessions").classList.toggle("hidden",b.dataset.historyTab!=="sessions");$("#historyWeights").classList.toggle("hidden",b.dataset.historyTab!=="weights");$("#historyCalendar").classList.toggle("hidden",b.dataset.historyTab!=="calendar")});$("#closeExerciseDialog").onclick=()=>$("#exerciseDialog").close();$("#closeTimer").onclick=()=>{stopTimer();$("#timerDialog").close()};$("#closeInstall").onclick=()=>$("#installDialog").close();$("#installHelp").onclick=openInstallGuide;$("#showInstallGuide").onclick=openInstallGuide;$("#timerStartPause").onclick=toggleTimer;$("#timerReset").onclick=()=>setTimer(timerSeconds);$$("[data-seconds]").forEach(b=>b.onclick=()=>setTimer(+b.dataset.seconds));$("#exportData").onclick=exportBackup;$("#importData").onchange=e=>{if(e.target.files[0])importBackup(e.target.files[0]);e.target.value=""};$("#clearData").onclick=clearAll;if("serviceWorker"in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js",{updateViaCache:"none"}).then(reg=>{reg.update().catch(()=>{});document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")reg.update().catch(()=>{})})}).catch(()=>{})}
init();
