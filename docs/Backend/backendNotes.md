A module is a box that groups related things together. It tells NestJS what exists in this feature — what controllers handle requests, what services are available, what can be shared with other modules.

Three important properties:

- `controllers` — the waiters for this module
- `providers` — the chefs (services) for this module. Anything `@Injectable()` goes here
- `imports` — other modules this module depends on
- `exports` — providers you want to share with other modules




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