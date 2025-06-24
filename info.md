@/ is src directory import alias when @/components is mentioned it is taken as src/components
by default all components are server components unless explicitly mentioned use client
for components using react hooks or interactive element we should mention use client


Server → Client nesting is fine.
❌ Client → Server nesting is not allowed.
Server components don’t increase bundle size – they render on the server.
Client components can access browser-only APIs, useEffect, Clerk hooks, etc.



for database we are using neon which is serverless database , which means we donot need to maintain server for making our database available ,neon handles it for us.
It seperates computation from storage which makes it more cost efficient . In traditional databases computation and storage are tightly coupled which makes offing the compute not possible as data is lost , but if they are seperated we can turn off our compute node and turn it on only when needed and keeping data storage on all the time which makes more efficient 

Neon provides a postgress database to use for us , which makes it simple to use


prisma is an orm (object relational mapper) which translates our js or typescript code to raw database query , it is middleman between the databse and our server  which makes interacting with the  database  easy 



Dev dependencies (short for development dependencies) are packages that are only needed during development — not in production.
They help you build, test, compile, lint, or develop your app but are not required when the app runs in production.



why foriegn keys matter 
| Benefit                      | Why It’s Important                      |
| ---------------------------- | --------------------------------------- |
| 🔐 Enforces valid references | Prevents orphan records & junk data     |
| 🔄 Supports cascading        | Handles auto-delete/update cases        |
| ⚡ Improves query performance | Adds indexes for faster joins           |
| 📚 Documents relationships   | Easier for devs and tools to understand |
| 🧼 Prevents logic bugs       | Catches errors at the DB level          |
