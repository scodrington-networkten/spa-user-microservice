import express from "express";
import "dotenv/config";
import {PrismaClient} from "@prisma/client";
import {PrismaBetterSqlite3} from '@prisma/adapter-better-sqlite3';
import cors from "cors";

//setup express server
const app = express();
app.use(express.json());

//setup allowed domains for cors
const allowed = process.env.ALLOWED_ORIGINS?.split(",") || [];
app.use(cors({
    origin: allowed
}))

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({adapter});

app.post("/notes", async (req, res) => {

    const {title, content} = req.body;
    console.log(title, content);

    const note = await prisma.note.create({
        data: {
            title: title,
            content: content,
            user: {connect: {id: 1}},
        }
    });

    res.json(note);

});

async function testPrisma() {
    try {
        const count = await prisma.note.count();
        console.log("Notes count:", count);
    } catch (err) {
        console.error("Prisma error:", err);
    }
}

app.get("/notes", async (req, res) => {
    const notes = await prisma.note.findMany();
    res.json(notes);
});

app.post("/users", async (req, res) => {

    const {email, name} = req.body;

    const user = await prisma.user.create({
        data: {
            name, email
        }
    });

    res.json(user);
});

app.get('/users', async (req, res) => {

    const collection = await prisma.user.findMany({
        include: {notes: true}
    });
    return res.json(collection);

})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running`));
