const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const User = require('./models/User');
const Book = require('./models/Book');

const bcrypt = require('bcrypt');


mongoose.connect('mongodb+srv://VinceDS99:azerty@cluster0.bakpevt.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use(bodyParser.json());


//Hachage du mot de passe de l'utilisateur, ajout de l'utilisateur à la base de données.
app.post('/api/auth/signup', (req, res) => 
{
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Inscription réussie !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
});

//Vérification des informations d'identification del'utilisateur ; renvoie l’_id de l'utilisateur depuis la
//base de données et un token web JSON signé
app.post('/api/auth/login', (req, res) => 
{
  User.findOne({ email: req.body.email })
      .then(user => {
          if (!user) {
              return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
          }
          bcrypt.compare(req.body.password, user.password)
              .then(valid => {
                  if (!valid) {
                      return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                  }
                  res.status(200).json({
                      userId: user._id,
                      token: 'TOKEN'
                  });
              })
              .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
});

//Renvoie un tableau de tous les livres de la base de données
app.get('/api/books', (req, res) => {
  Book.find()
    .then(things => res.status(200).json(things))
    .catch(error => res.status(400).json({ error }));
});

//Renvoie le livre avec l’_id fourni.
app.get('/api/books/:id', (req, res) => {
  Thing.findOne({ _id: req.params.id })
    .then(thing => res.status(200).json(thing))
    .catch(error => res.status(404).json({ error }));
});

//Renvoie un tableau des 3 livres de la base de données ayant la meilleure note moyenne.
app.get('/api/books/bestrating', (req, res) => {
  Thing.findOne({ _id: req.params.id })
    .then(thing => res.status(200).json(thing))
    .catch(error => res.status(404).json({ error }));
});

//Capture et enregistre l'image, analyse le livre transformé en chaîne de caractères, et l'enregistre dans la base de données en définissant
//correctement son ImageUrl.Initialise la note moyenne du livre à 0 et le rating avec un tableau vide. Remarquez que le corps de la
//demande initiale est vide ; lorsque Multer est ajouté, il renvoie une chaîne pour le corps de la demande en fonction des données soumises avec le fichier.
app.post('/api/books', (req, res) => {
  delete req.body._id;
  console.log(req.body);
  const book = new Book({
    ...req.body
  });
  book.save()
    .then(() => res.status(201).json({ message: 'Livre enregistré !'}))
    .catch(error => res.status(400).json({ error }));
});

//Met à jour le livre avec l'_id fourni
app.put('/api/books/:id', (req, res) => {
  Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Livre modifié !'}))
    .catch(error => res.status(400).json({ error }));
});

//Supprime le livre avec l'_id fourni ainsi que l’image associée.
app.delete('/api/books/:id', (req, res) => {
  Book.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Livre supprimé !'}))
    .catch(error => res.status(400).json({ error }));
});


//Définit la note pour le user ID fourni. La note doit être comprise entre 0 et 5. L'ID de l'utilisateur et la note doivent être ajoutés au
//tableau "rating" afin de ne pas laisser un utilisateur noter deux fois le même livre.
//Il n’est pas possible de modifier une note. La note moyenne "averageRating" doit être tenue à
//jour, et le livre renvoyé en réponse de la requête.
app.post('/api/books/:id/rating', (req, res) => {
  delete req.body._id;
  const book = new Book({
    ...req.body
  });
  book.save()
    .then(() => res.status(201).json({ message: 'Livre enregistré !'}))
    .catch(error => res.status(400).json({ error }));
});

module.exports = app;