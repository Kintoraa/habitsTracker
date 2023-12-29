import cors from "@fastify/cors";
import Fastify from "fastify";
import fse from "fs-extra";
import path from "path";

const fastify = Fastify({
  logger: true,
});
const trackerPath = path.join(process.cwd(), "database.json");

await fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

fastify.post("/habits", async (resquest, reply) => {
  try {
    const data = resquest.body;
    const listTracker = await fse.readFile(trackerPath, "utf-8");
    const listJson = JSON.parse(listTracker);
    listJson.habits.push(data);
    await fse.writeFile(trackerPath, JSON.stringify(listJson), "utf-8");
    console.log("donnée recu ", data);
  } catch (err) {
    console.error("Erreur lors du traitement de la requête:", err);
    reply.code(500).send({ error: "Erreur serveur interne." });
  }
});

fastify.post("/habits/id", async (request, reply) => {
  try {
    const data = request.body;
    const listTracker = await fse.readFile(trackerPath, "utf-8");
    const listJson = JSON.parse(listTracker);
    const listDate = listJson.habits[data - 1].daysDone;
    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0];
    if (!listDate[formattedToday]) {
      listDate[formattedToday] = true;
    } else {
      listDate[formattedToday] = false;
    }
    await fse.writeFile(trackerPath, JSON.stringify(listJson), "utf-8");

    console.log(
      "Donées recues:",
      JSON.stringify(listDate[formattedToday], null, 2)
    );
  } catch (err) {
    console.error("Erreur lors du traitement de la requête:", err);
  }
});

fastify.post("/habits/days", async (request, reply) => {
  try {
    const data = request.body;
    const listTracker = await fse.readFile(trackerPath);
    const listJson = JSON.parse(listTracker);
    const index = data.index;
    const listDate = data.allDate;
    for (const date in listDate) {
      listJson.habits[index].daysDone[date] = false;
    }

    await fse.writeFile(trackerPath, JSON.stringify(listJson), "utf-8");

    reply.code(200).send({ message: "Données reçues avec succès (date) ! " });
    console.log("Données reçues (date):", JSON.stringify(listDate, null, 2));
  } catch (err) {
    console.error("Erreur lors du traitement de la requête:", err);
    reply.code(500).send({ error: "Erreur serveur interne." });
  }
});

fastify.get("/habits", async () => {
  const listTracker = JSON.parse(await fse.readFile(trackerPath));
  return { listTracker };
});

try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
