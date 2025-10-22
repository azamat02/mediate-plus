# Инструкция по развертыванию

## Проблема Mixed Content (HTTPS → HTTP)

Когда сайт загружен по HTTPS, браузеры блокируют HTTP запросы из соображений безопасности. Поскольку backend API работает на HTTP (`http://85.202.192.21:3001`), а сайт на HTTPS (`https://kelisim.bar`), прямые запросы будут заблокированы.

## Решение: Firebase Cloud Functions как HTTPS прокси

Firebase Cloud Functions работают как HTTPS прокси:
1. Фронт делает HTTPS запрос к `https://kelisim.bar/api/sms/send`
2. Firebase Hosting перенаправляет запрос на Cloud Function `smsProxy`
3. Cloud Function делает HTTP запрос к `http://85.202.192.21:3001/api/sms/send`
4. Результат возвращается обратно фронту

## Развертывание

### 1. Установите зависимости для Cloud Functions

```bash
cd functions
npm install
cd ..
```

### 2. Соберите проект

```bash
npm run build
```

### 3. Разверните на Firebase

```bash
# Развернуть всё (hosting + functions)
firebase deploy

# Или по отдельности:
firebase deploy --only hosting
firebase deploy --only functions
```

### 4. Проверьте развертывание

После развертывания:
- Hosting будет доступен на `https://kelisim.bar`
- Cloud Function будет доступна на `https://kelisim.bar/api/sms/send`
- Проверьте логи: `firebase functions:log`

## Локальная разработка

В локальной разработке используется `.env`:
```
VITE_BACKEND_API_URL=http://85.202.192.21:3001
```

В production используется `.env.production`:
```
VITE_BACKEND_API_URL=https://kelisim.bar
```

Vite автоматически выбирает правильный файл при сборке.

## Мониторинг

Просмотр логов Cloud Functions:
```bash
firebase functions:log
```

Мониторинг в Firebase Console:
https://console.firebase.google.com → Functions

## Стоимость

Firebase Cloud Functions имеют бесплатный лимит:
- 2M вызовов/месяц
- 400,000 ГБ-секунд/месяц
- 200,000 ЦП-секунд/месяц

Для SMS прокси этого более чем достаточно.
