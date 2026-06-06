# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## CRUD de produtos com MockAPI

O CRUD de produtos (cadastrar, listar, editar e excluir) usa uma API REST baseada
em JSON hospedada no [MockAPI](https://mockapi.io). Configure assim:

1. Acesse https://mockapi.io e faça login (Google/GitHub).
2. Clique em **New Project** e dê um nome (ex.: `minibank`).
3. Dentro do projeto, clique em **New Resource** e crie o recurso `products`
   com os campos:
   - `name` (String)
   - `category` (String)
   - `description` (String)
   - `price` (Number)
   - `image` (String)
   - `createdAt` (Date)
4. Copie a **API base URL** do projeto (algo como
   `https://66xxxxxxx.mockapi.io/api/v1`).
5. Na raiz do projeto, copie `.env.example` para `.env` e preencha:

   ```bash
   EXPO_PUBLIC_MOCKAPI_BASE_URL=https://66xxxxxxx.mockapi.io/api/v1
   ```

6. Reinicie o Expo (`npx expo start -c`) para carregar as variáveis do `.env`.

A integração faz `GET/POST/PUT/DELETE` em `<BASE_URL>/products`. Login, carrinho
e notificações continuam usando o Firebase.

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
