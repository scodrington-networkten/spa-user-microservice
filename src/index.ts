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

    const {title, content, user_id} = req.body;
    console.log("Creating note for user");
    console.log(title, content, user_id);

    const note = await prisma.note.create({
        data: {
            title: title,
            content: content,
            user: {connect: {id: user_id}},
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


app.post("/users", async (req, res) => {

    const {email, name} = req.body;

    const user = await prisma.user.create({
        data: {
            name, email
        }
    });

    res.json(user);
});

/**
 * Get a list of all notes
 */
app.get("/notes", async (req, res) => {
    const notes = await prisma.note.findMany();
    res.json(notes);
});


/**
 * Get a list of all users
 */
app.get('/users', async (req, res) => {

    const collection = await prisma.user.findMany({
        include: {notes: true}
    });
    return res.json(collection);

})

/**
 * Get a single user via its ID
 */
app.get('/users/:id', async (req, res) => {

    const userId = Number(req.params.id);
    const user = await prisma.user.findUnique({
        where: {id: userId},
        include: {notes: true}
    });

    return res.json(user);
})

/**
 * Delete a given note
 * Checks if note belongs to user and deletes it
 */
app.delete('/notes/:id', async (req, res) => {

    const noteId = Number(req.params.id);
    const userId = req.body.user.id;

    const result = await prisma.note.deleteMany({
        where: {
            id: noteId, userId: userId
        },
    });

    //no matching note for user, couldnt delete
    if (result.count === 0) {
        const data = {
            status: 'error',
            message: "Note could not be found for user"
        };
        return res.json(data);
    }

    //return success after deletion
    const data = {
        status: 'success',
        message: "Successfully deleted note for user"
    }
    return res.json(data);

})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
