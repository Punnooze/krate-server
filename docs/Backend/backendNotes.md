A module is a box that groups related things together. It tells NestJS what exists in this feature — what controllers handle requests, what services are available, what can be shared with other modules.

---

## @Module() — what goes where

### `providers`
Anything decorated with `@Injectable()` that you want NestJS to create and inject.
This includes: services, middleware, guards, interceptors, pipes.

If a class **injects something** or **needs to be injected into something** inside this module, it must be in `providers`.

```ts
@Injectable()
export class AuthService { ... }       // a service — goes in providers

@Injectable()
export class AuthMiddleware { ... }    // middleware is also @Injectable — goes in providers too
```

### `controllers`
Classes decorated with `@Controller()` that handle incoming HTTP requests.
They can inject providers from this module or from imported modules.

```ts
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}  // AuthService must be in providers
}
```

### `imports`
Other **modules** whose exported providers you need inside this module.
You don't import a class — you import the **module** that wraps and exports it.

```ts
// HttpService comes from HttpModule — to use HttpService, import HttpModule
imports: [HttpModule]

// ConfigService comes from ConfigModule
imports: [ConfigModule.forRoot({ isGlobal: true })]
```

### `exports`
Providers from this module that you want other modules to be able to use.

```ts
// In AuthModule:
exports: [AuthService]

// Now any module that does `imports: [AuthModule]` can inject AuthService.
```

---

## Concrete example

`AuthMiddleware` injects `HttpService` and `ConfigService`:

```
AuthMiddleware
  → needs HttpService    → lives in HttpModule       → add HttpModule to imports
  → needs ConfigService  → lives in ConfigModule     → already global, fine
  → is itself @Injectable → add AuthMiddleware to providers
```

```ts
@Module({
  imports: [
    HttpModule,                                    // provides HttpService
    ConfigModule.forRoot({ isGlobal: true }),      // provides ConfigService globally
  ],
  controllers: [AuthController],                   // handles /auth/* routes
  providers: [AppService, AuthMiddleware],          // AuthMiddleware must be here so NestJS can inject into it
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*'); // this alone is NOT enough — must also be in providers
  }
}
```

---

## Checklist when you hit a dependency error

1. **What class is failing?** — the error says `type: 'AuthMiddleware'`
2. **What does it inject?** — look at its `constructor(private x: X, private y: Y)`
3. **For each injected thing:**
   - Is it a service/middleware you wrote? → add it to `providers`
   - Is it from a NestJS package (`HttpService`, `ConfigService`)? → add the module that provides it to `imports` (`HttpModule`, `ConfigModule`)
   - Is it from another feature module you wrote? → `imports: [ThatModule]` AND make sure `ThatModule` has it in `exports`
4. **Is the middleware/guard itself in `providers`?** — easy to forget. `.apply()` alone is not enough.

---




What are volumes?
By default Docker containers are stateless. When a container stops, everything inside it is gone. Including your PostgreSQL data.
Volumes solve this by linking a folder inside the container to storage that persists outside the container.
yamlvolumes:
  - postgres_data:/var/lib/postgresql/data
This says: "link the container's /var/lib/postgresql/data folder to a volume called postgres_data managed by Docker."
When the container stops and restarts — data is still there. When you run docker-compose down -v — the -v deletes that volume, wiping the data. That's why we lost the database earlier.

Two types of volumes we used:
Named volume — Docker manages it:
yaml- postgres_data:/var/lib/postgresql/data
Bind mount — links to your actual local folder:
yaml- ./auth:/app
This one is what gives you hot reload. Your local code is directly mounted into the container. You save a file → container sees it instantly.

The /app/node_modules line:
yaml- /app/node_modules
This is an anonymous volume. It tells Docker "keep whatever is in /app/node_modules inside the container, don't let the bind mount above overwrite it."
Without this line, ./auth:/app would overwrite everything in /app including node_modules — with your Mac's empty or ARM-incompatible modules.

Can you delete src/generated?
Yes. We're no longer generating there. The client now lives in node_modules/@prisma/client which is the default.
Delete the folder and also remove it from .gitignore if it was added there.




validator pipe runs the validations added in DTO, without pipe request just falls through