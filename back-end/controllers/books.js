const fs = require('fs');
const Book = require('../models/Book');

//Capture et enregistre l'image, analyse le livre transformé en chaîne de caractères, et l'enregistre dans la base de données en définissant
//correctement son ImageUrl.Initialise la note moyenne du livre à 0 et le rating avec un tableau vide. Remarquez que le corps de la
//demande initiale est vide ; lorsque Multer est ajouté, il renvoie une chaîne pour le corps de la demande en fonction des données soumises avec le fichier.
exports.createBook = (req, res) => 
{
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    book.save()
    .then(() => { res.status(201).json({message: 'Livre ajouté !'})})
    .catch(error => { res.status(400).json( { error })})
};

//Définit la note pour le user ID fourni. La note doit être comprise entre 0 et 5. L'ID de l'utilisateur et la note doivent être ajoutés au
//tableau "rating" afin de ne pas laisser un utilisateur noter deux fois le même livre.
//Il n’est pas possible de modifier une note. La note moyenne "averageRating" doit être tenue à
//jour, et le livre renvoyé en réponse de la requête.
exports.rateBook = (req, res) => 
{
    
    Book.findOne({ _id: req.params.id})
    .then((book) => {
        book.ratings.push({grade: req.body.rating , userId: req.body.userId})
        var somme = 0;
        book.ratings.map((rating) =>
            somme = somme + rating.grade
        )
        var moyenne = somme / book.ratings.length;
        book.averageRating = moyenne;
        book.save()
        .then(() => res.status(201).json(book))
        .catch(error => res.status(400).json({ error }));
    })
}

//Met à jour le livre avec l'_id fourni
exports.modifyBook = (req, res) => 
{
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Livre modifié!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

//Supprime le livre avec l'_id fourni ainsi que l’image associée.
exports.deleteBook = (req, res) => 
{
    Book.findOne({ _id: req.params.id})
    .then(book => {
        if (book.userId != req.auth.userId) {
            res.status(401).json({message: 'Not authorized'});
        } else {
            const filename = book.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Book.deleteOne({_id: req.params.id})
                    .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                    .catch(error => res.status(401).json({ error }));
            });
        }
    })
    .catch( error => {
        res.status(500).json({ error });
    });
}

//Renvoie le livre avec l’_id fourni.
exports.getOneBook = (req, res) => 
{
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
}

//Renvoie un tableau de tous les livres de la base de données
exports.getAllBooks =  (req, res) => 
{
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
}

//Renvoie un tableau des 3 livres de la base de données ayant la meilleure note moyenne.
exports.getBestRatedBooks =  (req, res) => 
{
    Book.find().sort({'averageRating': -1}).limit(3)
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
}