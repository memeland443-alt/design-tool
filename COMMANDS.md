# 📝 Полезные команды

## 🚀 Первый деплой (выполните один раз)

```bash
# 1. Авторизуйтесь в GitHub
gh auth login

# 2. Создайте репозиторий и запушьте код
cd "d:\Project\design.tool"
gh repo create design-tool --public --source=. --remote=origin --push

# 3. Задеплойте на Vercel
vercel
# Следуйте инструкциям, затем:
vercel env add REPLICATE_API_TOKEN
vercel --prod
```

## 🔄 Ежедневная работа

```bash
# Запустить dev сервер
npm run dev

# Внести изменения, закоммитить и запушить
git add .
git commit -m "Описание изменений"
git push

# Vercel автоматически задеплоит!
```

## 🛠️ Разработка

```bash
# Установить зависимости
npm install

# Запустить dev сервер
npm run dev

# Собрать для продакшн
npm run build

# Запустить продакшн локально
npm start

# Проверить код
npm run lint
```

## 📦 Управление зависимостями

```bash
# Добавить новый пакет
npm install package-name

# Добавить dev зависимость
npm install -D package-name

# Удалить пакет
npm uninstall package-name

# Обновить все пакеты
npm update
```

## 🎨 shadcn/ui компоненты

```bash
# Добавить новый компонент
npx shadcn-ui@latest add [component-name]

# Примеры:
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add progress
```

## 🔧 Git команды

```bash
# Проверить статус
git status

# Посмотреть изменения
git diff

# Посмотреть историю
git log --oneline

# Создать новую ветку
git checkout -b feature/new-feature

# Переключиться на ветку
git checkout main

# Смержить ветку
git merge feature/new-feature

# Удалить ветку
git branch -d feature/new-feature
```

## 🌐 Vercel команды

```bash
# Войти в Vercel
vercel login

# Деплой в preview
vercel

# Деплой в production
vercel --prod

# Посмотреть логи
vercel logs

# Список деплоев
vercel ls

# Добавить environment variable
vercel env add VARIABLE_NAME

# Посмотреть environment variables
vercel env ls

# Удалить environment variable
vercel env rm VARIABLE_NAME

# Открыть проект в браузере
vercel open
```

## 🐛 Отладка

```bash
# Очистить кеш Next.js
rm -rf .next

# Переустановить зависимости
rm -rf node_modules package-lock.json
npm install

# Проверить TypeScript ошибки
npx tsc --noEmit

# Найти процесс на порту 3000 (Windows)
netstat -ano | findstr :3000

# Убить процесс (Windows)
taskkill //F //PID [PID]
```

## 🔍 Полезные проверки

```bash
# Проверить версию Node.js
node --version

# Проверить версию npm
npm --version

# Проверить версию Next.js
npx next --version

# Проверить GitHub CLI
gh --version

# Проверить Vercel CLI
vercel --version

# Проверить авторизацию GitHub
gh auth status

# Проверить авторизацию Vercel
vercel whoami
```

## 📊 Тестирование API

```bash
# Тест API endpoint локально
curl -X POST http://localhost:3000/api/remove-background \
  -F "image=@path/to/image.jpg"

# Тест API endpoint на продакшн
curl -X POST https://your-project.vercel.app/api/remove-background \
  -F "image=@path/to/image.jpg"

# Тест Replicate API напрямую
curl -X POST "https://api.replicate.com/v1/predictions" \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"version":"...","input":{"image":"..."}}'
```

## 🎯 Быстрые ссылки

```bash
# Открыть проект локально
start http://localhost:3000

# Открыть GitHub репозиторий
gh repo view --web

# Открыть Vercel dashboard
start https://vercel.com/dashboard

# Открыть Replicate dashboard
start https://replicate.com/account
```

## 💡 Полезные алиасы (добавьте в .bashrc или .zshrc)

```bash
alias dev="npm run dev"
alias build="npm run build"
alias deploy="vercel --prod"
alias logs="vercel logs"
alias push="git add . && git commit -m"
```

Использование:
```bash
dev          # вместо npm run dev
build        # вместо npm run build
deploy       # вместо vercel --prod
logs         # вместо vercel logs
push "fix"   # вместо git add . && git commit -m "fix"
```

## 📚 Документация

- **Next.js**: https://nextjs.org/docs
- **Vercel**: https://vercel.com/docs
- **Replicate**: https://replicate.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs

## 🆘 Помощь

```bash
# Next.js помощь
npx next --help

# Vercel помощь
vercel --help

# GitHub CLI помощь
gh --help

# npm помощь
npm help
```
