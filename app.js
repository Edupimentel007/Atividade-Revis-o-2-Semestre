const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'mysecretkey',
    resave: true,
    saveUninitialized: true
}));

const pool = mysql.createPool({
    host: 'localhost',
    user: 'phpmyadmin',
    password: 'eduardo',
    database: 'blog'
});

// Rota inicial
app.get('/', (req, res) => {
    res.render('home');
});

// Rota sobre
app.get('/sobre', (req, res) => {
    res.render('sobre');
});

// Rota contato
app.get('/contato', (req, res) => {
    res.render('contato');
});

// Rota postagens
app.get('/postagens', async (req, res) => {
    // Lógica para obter postagens do banco de dados
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query('SELECT * FROM postagens');
        res.render('postagens', { postagens: rows });
    } catch (error) {
        console.error('Erro ao obter postagens:', error);
        res.status(500).send('Erro interno do servidor');
    } finally {
        connection.release();
    }
});

// Rota login
app.get('/login', (req, res) => {
    res.render('login');
});

// Rota de autenticação
app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query('SELECT * FROM usuarios WHERE username = ?', [username]);
        
        if (rows.length > 0) {
            const hashedPassword = rows[0].password;
            
            bcrypt.compare(password, hashedPassword, (bcryptErr, bcryptResult) => {
                if (bcryptResult) {
                    req.session.loggedin = true;
                    req.session.username = username;
                    res.redirect('/admin');
                } else {
                    res.send('Credenciais inválidas');
                }
            });
        } else {
            res.send('Usuário não encontrado');
        }
    } catch (error) {
        console.error('Erro ao autenticar:', error);
        res.status(500).send('Erro interno do servidor');
    } finally {
        connection.release();
    }
});

// Middleware para verificar se o usuário está autenticado
const requireLogin = (req, res, next) => {
    if (req.session.loggedin) {
        next();
    } else {
        res.redirect('/login');
    }
};

app.set('views', path.join(__dirname, 'views'));


// Rota de administração protegida
app.get('/admin', requireLogin, (req, res) => {
    res.render('admin');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
// Rota para criar postagem
app.post('/criar-postagem', requireLogin, (req, res) => {
    // Verificar se o usuário é admin
    if (req.session.username === 'admin') {
        const titulo = req.body.titulo;
        const conteudo = req.body.conteudo;

        // Adicione lógica para inserir a postagem no banco de dados
        // Aqui, você deve adicionar a lógica para inserir a postagem no banco de dados
        // Use a conexão do pool para executar a inserção no MySQL

        res.redirect('/admin');
    } else {
        res.status(403).send('Acesso proibido. Somente o admin pode criar postagens.');
    }
});
// Rota para editar postagem
app.get('/editar-postagem/:id', requireLogin, async (req, res) => {
    // Verificar se o usuário é admin
    if (req.session.username === 'admin') {
        const postId = req.params.id;

        // Adicione lógica para obter a postagem do banco de dados pelo ID
        // Aqui, você deve adicionar a lógica para obter a postagem do banco de dados
        // Use a conexão do pool para executar a consulta no MySQL

        // Renderizar formulário de edição
        res.render('editar-postagem', { postagem: postagemDoBancoDeDados });
    } else {
        res.status(403).send('Acesso proibido. Somente o admin pode editar postagens.');
    }
});
// Rota para salvar edição de postagem
app.post('/editar-postagem/:id', requireLogin, async (req, res) => {
    // Verificar se o usuário é admin
    if (req.session.username === 'admin') {
        const postId = req.params.id;
        const novoTitulo = req.body.titulo;
        const novoConteudo = req.body.conteudo;
        res.redirect('/post');

    }})

        // Adicione lógica para atualizar a postagem no banco de dados pelo ID
        // Aqui, você deve adicionar a lógica para atualizar a postagem no banco de dados
        // Use a conexão do pool para executar a atualização no MySQL

        