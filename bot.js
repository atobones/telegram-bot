const TelegramBot = require('node-telegram-bot-api');
const moment = require('moment'); // Use moment.js for date and time manipulation

// Токен вашего бота
const token = '';
const bot = new TelegramBot(token, { polling: true });

// Идентификатор группы для уведомлений
const staffGroupId = '-1002203948443'; // замените на новый идентификатор супергруппы

// Тексты на разных языках
const texts = {
    'Русский': {
        welcome: 'Добро пожаловать! Пожалуйста, выберите язык:',
        selectDepartment: 'Вы выбрали язык: ${language}. Пожалуйста, выберите отдел:',
        selectEmployee: 'Вы выбрали отдел: ${department}. Пожалуйста, выберите сотрудника:',
        selectTimeSlot: 'Пожалуйста, выберите время для бронирования:',
        bookingConfirmed: 'Ваше бронирование подтверждено: ${department} на ${date} в ${time}.',
        startOver: 'Пожалуйста, начните с команды /start.',
        changeBooking: 'Вы можете изменить свое бронирование или вернуться к началу.',
        buttons: {
            licenses: 'Лицензии',
            newDriver: 'Новый водитель',
            carRental: 'Аренда машин',
            help: 'Помощь',
            changeBooking: 'Изменить бронирование',
            startOver: 'Вернуться к началу'
        }
    },
    'English': {
        welcome: 'Welcome! Please choose a language:',
        selectDepartment: 'You selected the language: ${language}. Please choose a department:',
        selectEmployee: 'You selected the department: ${department}. Please choose an employee:',
        selectTimeSlot: 'Please choose a time slot for booking:',
        bookingConfirmed: 'Your booking is confirmed: ${department} on ${date} at ${time}.',
        startOver: 'Please start with the command /start.',
        changeBooking: 'You can change your booking or return to the beginning.',
        buttons: {
            licenses: 'Licenses',
            newDriver: 'New Driver',
            carRental: 'Car Rental',
            help: 'Help',
            changeBooking: 'Change Booking',
            startOver: 'Return to Start'
        }
    },
    'Polski': {
        welcome: 'Witamy! Proszę wybrać język:',
        selectDepartment: 'Wybrałeś język: ${language}. Proszę wybrać dział:',
        selectEmployee: 'Wybrałeś dział: ${department}. Proszę wybrać pracownika:',
        selectTimeSlot: 'Proszę wybrać godzinę na rezerwację:',
        bookingConfirmed: 'Twoja rezerwacja została potwierdzona: ${department} w dniu ${date} o godzinie ${time}.',
        startOver: 'Proszę rozpocząć od komendy /start.',
        changeBooking: 'Możesz zmienić swoją rezerwację lub wrócić do początku.',
        buttons: {
            licenses: 'Licencje',
            newDriver: 'Nowy kierowca',
            carRental: 'Wynajem samochodów',
            help: 'Pomoc',
            changeBooking: 'Zmień rezerwację',
            startOver: 'Powrót do początku'
        }
    }
};

// Список сотрудников по отделам
const employees = {
    'Лицензии': ['Иванов', 'Петров', 'Сидоров'],
    'Licenses': ['Smith', 'Johnson', 'Williams'],
    'Licencje': ['Kowalski', 'Nowak', 'Wiśniewski'],
    'Новый водитель': ['Смирнов', 'Кузнецов', 'Попов'],
    'New Driver': ['Brown', 'Davis', 'Miller'],
    'Nowy kierowca': ['Wójcik', 'Kowalczyk', 'Kamiński'],
    'Аренда машин': ['Васильев', 'Павлов', 'Козлов'],
    'Car Rental': ['Taylor', 'Anderson', 'Thomas'],
    'Wynajem samochodów': ['Lewandowski', 'Zieliński', 'Szymański'],
    'Помощь': ['Новиков', 'Морозов', 'Соколов'],
    'Help': ['Moore', 'Jackson', 'Martin'],
    'Pomoc': ['Woźniak', 'Dąbrowski', 'Kwiatkowski']
};

// Хранилище для временных данных бронирования
const bookingData = {};
const availableTimeSlots = {
    'Лицензии': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
    'Licenses': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
    'Licencje': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
    'Новый водитель': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
    'New Driver': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
    'Nowy kierowca': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
    'Аренда машин': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
    'Car Rental': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
    'Wynajem samochodów': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
    'Помощь': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
    'Help': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
    'Pomoc': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']
};

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const languageOptions = {
        reply_markup: {
            keyboard: [['Русский', 'English', 'Polski']],
            one_time_keyboard: true
        }
    };
    bot.sendMessage(chatId, texts['Русский'].welcome, languageOptions);
});

// Функция для фильтрации временных интервалов
function filterTimeSlots(slots) {
    const currentTime = moment();
    console.log('Current time:', currentTime.format('HH:mm')); // Debugging line
    const filteredSlots = slots.filter(slot => moment(slot, 'HH:mm').isAfter(currentTime));
    console.log('Filtered slots:', filteredSlots); // Debugging line
    return filteredSlots;
}

// Обработчик выбора языка и отдела
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!bookingData[chatId]) {
        bookingData[chatId] = {};
    }

    // Проверка, если команда /start была введена
    if (text === '/start') return;

    // Проверка, выбрал ли пользователь язык
    if (['Русский', 'English', 'Polski'].includes(text)) {
        bot.userLanguage = text;  // Сохраняем выбранный язык
        bookingData[chatId].language = text;
        const languageButtons = [
            [{ text: texts[text].buttons.licenses }, { text: texts[text].buttons.newDriver }],
            [{ text: texts[text].buttons.carRental }, { text: texts[text].buttons.help }]
        ];
        bot.sendMessage(chatId, texts[text].selectDepartment.replace('${language}', text), {
            reply_markup: {
                keyboard: languageButtons,
                one_time_keyboard: true
            }
        });
    } 
    // Проверка, выбрал ли пользователь отдел
    else if (Object.values(texts['Русский'].buttons).includes(text) ||
             Object.values(texts['English'].buttons).includes(text) ||
             Object.values(texts['Polski'].buttons).includes(text)) {
        const userLanguage = bookingData[chatId].language || 'Русский';  // Используем сохраненный язык или дефолтный
        bookingData[chatId].department = text;
        
        if (employees[text]) {
            const employeeButtons = employees[text].map(employee => [{ text: employee }]);
            bot.sendMessage(chatId, texts[userLanguage].selectEmployee.replace('${department}', text), {
                reply_markup: {
                    keyboard: employeeButtons,
                    one_time_keyboard: true
                }
            });
        } else {
            console.error(`No employees found for department: ${text}`);
            bot.sendMessage(chatId, texts[userLanguage].startOver, {
                reply_markup: {
                    keyboard: [['/start']],
                    one_time_keyboard: true
                }
            });
        }
    } 
    // Проверка, выбрал ли пользователь сотрудника
    else if (employees[bookingData[chatId].department] && employees[bookingData[chatId].department].includes(text)) {
        const userLanguage = bookingData[chatId].language || 'Русский';  // Используем сохраненный язык или дефолтный
        bookingData[chatId].employee = text;
        
        if (availableTimeSlots[bookingData[chatId].department]) {
            const timeSlots = filterTimeSlots(availableTimeSlots[bookingData[chatId].department]).map(time => [{ text: time }]);
            if (timeSlots.length > 0) {
                bot.sendMessage(chatId, texts[userLanguage].selectTimeSlot, {
                    reply_markup: {
                        keyboard: timeSlots,
                        one_time_keyboard: true
                    }
                });
            } else {
                console.error(`No available time slots for department: ${bookingData[chatId].department}`);
                bot.sendMessage(chatId, `No available time slots for department: ${bookingData[chatId].department}`, {
                    reply_markup: {
                        keyboard: [['/start']],
                        one_time_keyboard: true
                    }
                });
            }
        } else {
            console.error(`No time slots found for department: ${bookingData[chatId].department}`);
            bot.sendMessage(chatId, texts[userLanguage].startOver, {
                reply_markup: {
                    keyboard: [['/start']],
                    one_time_keyboard: true
                }
            });
        }
    } 
    // Обработка выбора временного интервала
    else if (availableTimeSlots[bookingData[chatId].department] && availableTimeSlots[bookingData[chatId].department].includes(text)) {
        const userLanguage = bookingData[chatId].language || 'Русский';
        const department = bookingData[chatId].department;
        const employee = bookingData[chatId].employee;
        const time = text;
        const currentDate = moment().format('YYYY-MM-DD'); // Current date in format 'YYYY-MM-DD'

        // Удаляем выбранный временной интервал из доступных
        availableTimeSlots[department] = availableTimeSlots[department].filter(slot => slot !== time);

        bookingData[chatId].time = time;
        
        // Подтверждение бронирования
        bot.sendMessage(chatId, texts[userLanguage].bookingConfirmed.replace('${department}', department).replace('${date}', currentDate).replace('${time}', time));

        // Отправка уведомления в группу сотрудников
        bot.sendMessage(staffGroupId, `Новое бронирование:\nВодитель: ${msg.from.first_name} ${msg.from.last_name}\nОтдел: ${department}\nСотрудник: ${employee}\nДата: ${currentDate}\nВремя: ${time}`);
        
        // Предоставляем пользователю возможность изменить бронирование или вернуться к началу
        bot.sendMessage(chatId, texts[userLanguage].changeBooking, {
            reply_markup: {
                keyboard: [
                    [{ text: texts[userLanguage].buttons.changeBooking }], 
                    [{ text: texts[userLanguage].buttons.startOver }]
                ],
                one_time_keyboard: true
            }
        });
    }
    // Обработка команды изменения бронирования
    else if (text === texts[bot.userLanguage].buttons.changeBooking) {
        const userLanguage = bookingData[chatId].language || 'Русский';
        // Сброс данных бронирования и возвращение к выбору отдела
        const previousDepartment = bookingData[chatId].department;
        const previousTime = bookingData[chatId].time;
        if (previousDepartment && previousTime) {
            availableTimeSlots[previousDepartment].push(previousTime); // Возвращаем временной интервал в доступные
            availableTimeSlots[previousDepartment].sort(); // Сортируем интервалы для удобства
        }
        delete bookingData[chatId];
        bookingData[chatId] = {};
        bookingData[chatId].language = userLanguage;
        const languageButtons = [
            [{ text: texts[userLanguage].buttons.licenses }, { text: texts[userLanguage].buttons.newDriver }],
            [{ text: texts[userLanguage].buttons.carRental }, { text: texts[userLanguage].buttons.help }]
        ];
        bot.sendMessage(chatId, texts[userLanguage].selectDepartment.replace('${language}', userLanguage), {
            reply_markup: {
                keyboard: languageButtons,
                one_time_keyboard: true
            }
        });
    }
    // Обработка команды возврата к началу
    else if (text === texts[bot.userLanguage].buttons.startOver) {
        const userLanguage = bookingData[chatId].language || 'Русский';
        // Сброс всех данных и возвращение к выбору языка
        delete bookingData[chatId];
        bot.sendMessage(chatId, texts[userLanguage].welcome, {
            reply_markup: {
                keyboard: [['Русский', 'English', 'Polski']],
                one_time_keyboard: true
            }
        });
    }
    // Обработка непредвиденных случаев, предлагаем начать заново
    else {
        const userLanguage = bookingData[chatId].language || 'Русский';  // Используем сохраненный язык или дефолтный
        console.log(`Unexpected text received: ${text}`); // Debugging line
        bot.sendMessage(chatId, texts[userLanguage].startOver, {
            reply_markup: {
                keyboard: [['/start']],
                one_time_keyboard: true
            }
        });
    }
});

// Обработка ошибок
bot.on('polling_error', (error) => {
    console.error(`Polling error: ${error.code}`);
    console.error(error); // Log the entire error object for more information
    if (error.response && error.response.body) {
        console.error(error.response.body);
    }
});
