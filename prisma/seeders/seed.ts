import "dotenv/config";
import {PrismaClient} from "@prisma/client";
import {PrismaBetterSqlite3} from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({adapter});


async function seed() {

    try{

        // clear existing data first
        await prisma.note.deleteMany();
        await prisma.user.deleteMany();

        //create user data
        const user = await prisma.user.create({
            data: {
                name: 'Alice',
                email: 'alice@gmail.com'
            }
        })

        const user2 = await prisma.user.create({
            data: {
                name: 'John',
                email: 'john@gmail.com'
            }
        })

        //create notes
        await prisma.note.create({
            data: {
                title: "Go to the shops",
                content: "go to the shops today to get dinner",
                userId: user2.id
            }
        })
        await prisma.note.create({
            data: {
                title: "Go for a run",
                content: "Time to go for a run!",
                userId: user2.id
            }
        })

        console.log("Seeding completed successfully!");
    }catch(error){
        console.error("Seeding failed:", error);
    }finally{
        await prisma.$disconnect();
    }
}
seed();

