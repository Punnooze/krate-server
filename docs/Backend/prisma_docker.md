npx prisma init
# Creates schema.prisma, prisma.config.ts, .env

npx prisma migrate dev --name init
# Creates a migration SQL file and runs it on the database
# Production safe — keeps history of all changes

npx prisma db push
# Directly pushes schema to database without migration file
# Fast but no history — development only

npx prisma generate
# Generates the TypeScript client from your schema
# Must run every time schema changes

npx prisma migrate reset
# Wipes database and reruns all migrations from scratch

docker exec -it krate-postgres psql -U krate -d krate -c "SELECT * FROM \"User\";"
# View DB

docker exec -it krate-postgres psql -U krate -d krate_auth -c "\dt"
# View table schema



docker-compose up
# Starts all containers defined in docker-compose.yml

docker-compose up -d
# Same but runs in background (detached mode)

docker-compose down
# Stops and removes containers but keeps volumes (data safe)

docker-compose down -v
# Stops containers AND deletes volumes (wipes database)

docker-compose build --no-cache auth
# Rebuilds only the auth image from scratch, ignoring cache

docker logs krate-auth --tail 50
# Shows last 50 log lines from auth container

docker exec -it krate-postgres psql -U krate -d krate -c "SELECT..."
# Runs a SQL command directly inside the postgres container




