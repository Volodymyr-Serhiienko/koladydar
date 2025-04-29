// ==================== Константы ====================

const API_BASE_URL = "http://www.astroapi.somee.com";

// Названия месяцев
const monthNames = ["Рамхатъ", "Айлѣтъ", "Бейлѣтъ", "Гэйлѣтъ", "Дайлѣтъ", "Ѥлѣтъ", "Вейлѣтъ", "Хейлѣтъ", "Тайлѣтъ"];

// Краткие имена дней недели
const weekDays = ["пн", "вт", "тр", "чт", "пт", "шт", "см", "ос", "нд"];

// Полные имена дней недели
const fullWeekNames = ["Понедельникъ", "Вторникъ", "Тритейникъ", "Четверикъ", "Пятница", "Шестица", "Седьмица", "Осьмица", "Неделя"];

// Праздничные дни по месяцам
const holidays = {
    1: [1, 4, 6, 9, 11, 14, 16, 19, 22, 24, 27, 31, 36, 38, 40],
    2: [2, 4, 7, 12, 13, 16, 19, 22, 25, 29, 32, 36],
    3: [1, 4, 7, 13, 18, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 38],
    4: [2, 7, 12, 17, 22, 33, 37, 40],
    5: [2, 5, 6, 14, 17, 19, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 40],
    6: [4, 11, 13, 16, 19, 22, 26, 29, 33, 37, 40],
    7: [5, 9, 12, 14, 18, 22, 25, 27, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41],
    8: [1, 2, 3, 4, 5, 6, 7, 8, 9, 13, 17, 18, 21, 22, 27, 30, 33, 34, 35, 38, 40],
    9: [3, 6, 9, 12, 16, 18, 21, 22, 24, 27, 29, 31, 33, 35, 38, 41]
};

// Дни длительных постов
const postdays = {
    1: [23, 25, 26, 28, 29, 30],
    3: [2, 3, 5, 6, 8, 9, 10, 11, 12, 14, 15, 16, 17],
    4: [23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 34, 35, 36, 38, 39]
};

// Специальные пометки по дням недели
const specialNotes = {
    0: `<strong>День труда</strong><br>`,
    1: `<strong>День труда</strong><br>`,
    2: `<strong>Выходной день</strong><br>`,
    3: `<strong>День труда</strong><br>`,
    4: `<strong>День труда</strong><br>`,
    5: `<strong>День труда</strong><br>`,
    6: `<strong>Выходной день. Однодневный ПОСТЪ</strong><br>`,
    7: `<strong>День труда</strong><br>`,
    8: `<strong>Выходной день</strong><br>`
};

// ==================== Переменные состояния ====================

let yearOffset = 0;           // Смещение года (для переключения лет)
let startWeekDayIndexGlobal = 0; // Индекс начала недели
let currentYear16 = 0;        // Номер года в 16-летнем цикле
const realNow = new Date();   // Сохраняем дату загрузки страницы


// ==================== Функции ====================

// Загрузка календаря
async function loadCalendar(yearOverride = null) {
    let localDateTime;

    if (yearOffset === 0) {
        const now = new Date();
        localDateTime = now.getFullYear() + "-" +
            String(now.getMonth() + 1).padStart(2, '0') + "-" +
            String(now.getDate()).padStart(2, '0') + "T" +
            String(now.getHours()).padStart(2, '0') + ":" +
            String(now.getMinutes()).padStart(2, '0') + ":" +
            String(now.getSeconds()).padStart(2, '0');
    } else {
        // Заглушка: фиксированная дата для указанного года
        localDateTime = `${yearOverride}-07-01T12:00:00`;
    }

    const encoded = encodeURIComponent(localDateTime);
    const url = `${API_BASE_URL}/api/calender/numeroobjectslav?dateTime=${encoded}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        document.getElementById("title").innerText = `Лѣто ${data.year} от СМЗХ`;
        renderCalendar(data);
    } catch (err) {
        document.getElementById("calendar").innerText = "Ошибка загрузки.";
        console.error(err);
    }
}

// Отрисовка всего календаря
function renderCalendar(todaySlav) {
    const container = document.getElementById("calendar");
    container.innerHTML = "";

    const currentMonth = todaySlav.month;
    const currentDay = todaySlav.day;
    const year16 = todaySlav.year16;
    currentYear16 = year16;
    const todayDayName = todaySlav.dayName;

    // Генерируем длины месяцев
    const monthLengths = Array.from({ length: 9 }, (_, i) => {
        const monthNum = i + 1;
        return (year16 === 16) ? 41 : (monthNum % 2 === 0 ? 40 : 41);
    });

    // Считаем общее количество прошедших дней с начала года до сегодняшнего дня
    let passedDays = monthLengths.slice(0, currentMonth - 1).reduce((a, b) => a + b, 0) + currentDay;

    // Определяем индекс дня недели для первого дня года
    const todayIndex = fullWeekNames.indexOf(todayDayName);
    const startWeekDayIndex = (todayIndex - ((passedDays - 1) % 9) + 9) % 9;
    startWeekDayIndexGlobal = startWeekDayIndex;

    // Предварительно считаем количество прошедших дней до каждого месяца
    const passedDaysPerMonth = [];
    let total = 0;
    for (let i = 0; i < 9; i++) {
        passedDaysPerMonth.push(total);
        total += monthLengths[i];
    }

    for (let m = 0; m < 9; m++) {
        const monthDiv = document.createElement("div");
        monthDiv.className = "month";

        const title = document.createElement("div");
        title.className = "month-name";
        title.innerText = monthNames[m];
        monthDiv.appendChild(title);

        const weekdays = document.createElement("div");
        weekdays.className = "weekdays";
        for (let w of weekDays) {
            const wd = document.createElement("div");
            wd.className = "weekday";
            wd.innerText = w;
            weekdays.appendChild(wd);
        }
        monthDiv.appendChild(weekdays);

        const days = document.createElement("div");
        days.className = "days";

        const totalDays = monthLengths[m];
        const offset = (startWeekDayIndex + passedDaysPerMonth[m]) % 9;

        // Добавляем пустые ячейки в начале месяца
        for (let i = 0; i < offset; i++) {
            const empty = document.createElement("div");
            empty.className = "day empty-day";
            empty.innerText = "";
            days.appendChild(empty);
        }

        // Рисуем дни месяца
        for (let d = 1; d <= totalDays; d++) {
            const day = document.createElement("div");
            day.className = "day";
            day.innerText = d;

            day.dataset.day = d;
            day.dataset.month = m + 1;

            // Выделяем праздничные дни
            if (holidays[m + 1]?.includes(d)) {
                day.classList.add("holiday");
            }

            // Выделяем дни постов
            if (postdays[m + 1]?.includes(d)) {
                day.classList.add("postday");
            }

            // Выделяем сегодняшний день
            if ((m + 1) === currentMonth && d === currentDay) {
                day.classList.add("today");
            }

            day.addEventListener("click", () => {
                fetchDayInfo(d, m + 1);
            });

            days.appendChild(day);
        }

        monthDiv.appendChild(days);
        container.appendChild(monthDiv);
    }

    // 🔄 Автопрокрутка в зависимости от года
    if (yearOffset === 0) {
        // Прокрутка к сегодняшнему дню
        const todayElement = document.querySelector(".today");
        if (todayElement) {
            todayElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    } else {
        // Прокрутка к началу календаря (но с учётом фиксированной верхней панели)
        const calendarTop = document.querySelector(".calendar-grid");
        if (calendarTop) {
            const topOffset = calendarTop.getBoundingClientRect().top + window.scrollY;
            const headerHeight = document.querySelector(".topbar")?.offsetHeight || 0;

            window.scrollTo({
                top: topOffset - headerHeight - 10, // небольшой зазор
                behavior: "smooth"
            });
        }
    }
}

// Вывод информации о дне
function renderDayInfo(data, dayOfWeekIndex = null, day = null, month = null) {
    let extraNote = "";

    if (dayOfWeekIndex !== null) {
        extraNote = getSpecialNote(dayOfWeekIndex);
    } else if (data.dayName) {
        const normalizedDayName = data.dayName.trim();
        // Ищем индекс дня недели по названию
        const dayNameIndex = fullWeekNames.indexOf(normalizedDayName);
        if (dayNameIndex !== -1) {
            extraNote = getSpecialNote(dayNameIndex);
        }
    }

    const monthName = month ? monthNames[month - 1] : "";
    const info = `
                <h3>Информация дня: ${day && monthName ? `${day} ${monthName}` : ""}</h3><br>
                ${data.holiday ? `<strong>Праздник:</strong> ${data.holiday}<br>` : ""}
                ${data.postName ? `<strong>${data.postName}</strong><br>` : ""}
                ${data.postDescription ? `<em>${data.postDescription}</em><br>` : ""}
                ${extraNote}
            `;

    document.getElementById("modalInfo").innerHTML = info;
    document.getElementById("dayModal").style.display = "flex";
}

// Загрузка информации о дне по клику
async function fetchDayInfo(day, month) {
    const url = `${API_BASE_URL}/api/calender/holidayobjectslav?day=${day}&month=${month}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Вычисляем индекс дня недели
        const monthLengths = [];
        for (let i = 1; i <= 9; i++) {
            const isEven = i % 2 === 0;
            monthLengths.push((currentYear16 === 16) ? 41 : (isEven ? 40 : 41));
        }
        const daysBefore = monthLengths.slice(0, month - 1).reduce((a, b) => a + b, 0) + day;
        const dayOfWeekIndex = (startWeekDayIndexGlobal + (daysBefore - 1)) % 9;

        renderDayInfo(data, dayOfWeekIndex, day, month);
    } catch (err) {
        document.getElementById("modalInfo").innerText = "Ошибка при загрузке информации о дне.";
        console.error(err);
    }
}

// Получение спецпометки по индексу дня недели
function getSpecialNote(dayOfWeekIndex) {
    return specialNotes[dayOfWeekIndex] || "";
}

// ==================== Обработчики событий ====================

// Кнопки переключения лет
document.getElementById("prevYear").addEventListener("click", () => {
    yearOffset--;
    loadCalendar(realNow.getFullYear() + yearOffset);
});

document.getElementById("nextYear").addEventListener("click", () => {
    yearOffset++;
    loadCalendar(realNow.getFullYear() + yearOffset);
});

// Открытие и закрытие контактов разработчика
document.getElementById("devName").addEventListener("click", () => {
    const contact = document.getElementById("contactInfo");
    if (contact.style.display === "none") {
        contact.style.display = "block";
    } else {
        contact.style.display = "none";
    }
});

// Закрытие модального окна
document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("dayModal").style.display = "none";
});

// Закрытие по клику вне окна
window.addEventListener("click", (event) => {
    const modal = document.getElementById("dayModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

// Стартовая загрузка
loadCalendar();
