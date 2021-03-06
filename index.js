const express = require("express");

const server = express();

// Necessário para receber json por post
server.use(express.json());

// Mock de armazenamento de dados de projetos em memória
const projectsData = new Map();
Map.prototype.toArray = function() {
    return [...this.values()];
};

// Contador de requests
let requestsCount = 0;

// Middleware global para log print
server.use((req, res, next) => {
    requestsCount++;
    console.log(`Requests count: ${requestsCount}`);
    return next();
});

// Middleware para verificar se existe projeto com a id dada
function checkProjectExists(req, res, next) {
    const { id } = req.params;

    if(!projectsData.has(id)) {
        return res.status(400).json({ error: "Project not exists" });
    }

    return next();
};

// Listar todos os projetos
server.get("/projects", (req, res) => {
    return res.json(projectsData.toArray());
});

// Criar projeto
server.post("/projects", (req, res) => {
    const { id, title } = req.body;

    if(typeof id !== "string" || typeof title !== "string") {
        return res.status(400).json({ error: "ID and title must be string" });
    }

    projectsData.set(id, {id, title});

    return res.json(projectsData.toArray());
});

// Editar projeto
server.put("/projects/:id", checkProjectExists, (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    if(typeof title !== "string") {
        return res.status(400).json({ error: "Title must be string" });
    }

    const projectData = projectsData.get(id);
    projectData.title = title;
    projectsData.set(id, projectData);

    return res.json(projectsData.toArray());
});

// Deletar projeto
server.delete("/projects/:id", checkProjectExists, (req, res) => {
    const { id } = req.params;

    projectsData.delete(id);

    return res.json(projectsData.toArray());
});

// Deletar projeto
server.post("/projects/:id/tasks", checkProjectExists, (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    if(typeof title !== "string") {
        return res.status(400).json({ error: "Title must be string" });
    }

    const projectData = projectsData.get(id);
    if(!projectData.tasks) {
        projectData.tasks = [];        
    }
    projectData.tasks.push(title);
    projectsData.set(id, projectData);

    return res.json(projectsData.toArray());
});

server.listen(3000);
