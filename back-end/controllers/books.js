const Book = require('../models/Book');

//Capture et enregistre l'image, analyse le livre transformé en chaîne de caractères, et l'enregistre dans la base de données en définissant
//correctement son ImageUrl.Initialise la note moyenne du livre à 0 et le rating avec un tableau vide. Remarquez que le corps de la
//demande initiale est vide ; lorsque Multer est ajouté, il renvoie une chaîne pour le corps de la demande en fonction des données soumises avec le fichier.
exports.createBook = (req, res) => 
{
    delete req.body._id;
    console.log(req.body);
    const book = new Book({
        ...req.body
    });
    book.save()
        .then(() => res.status(201).json({ message: 'Livre enregistré !'}))
        .catch(error => res.status(400).json({ error }));
};

//Définit la note pour le user ID fourni. La note doit être comprise entre 0 et 5. L'ID de l'utilisateur et la note doivent être ajoutés au
//tableau "rating" afin de ne pas laisser un utilisateur noter deux fois le même livre.
//Il n’est pas possible de modifier une note. La note moyenne "averageRating" doit être tenue à
//jour, et le livre renvoyé en réponse de la requête.
exports.rateBook = (req, res) => 
{
    delete req.body._id;
    const book = new Book({
        ...req.body
    });
    book.save()
        .then(() => res.status(201).json({ message: 'Livre enregistré !'}))
        .catch(error => res.status(400).json({ error }));
}

//Met à jour le livre avec l'_id fourni
exports.modifyBook = (req, res) => 
{
    Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Livre modifié !'}))
        .catch(error => res.status(400).json({ error }));
};

//Supprime le livre avec l'_id fourni ainsi que l’image associée.
exports.deleteBook = (req, res) => 
{
    Book.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Livre supprimé !'}))
        .catch(error => res.status(400).json({ error }));
}

//Renvoie le livre avec l’_id fourni.
exports.getOneBook = (req, res) => 
{
    Thing.findOne({ _id: req.params.id })
        .then(thing => res.status(200).json(thing))
        .catch(error => res.status(404).json({ error }));
}

//Renvoie un tableau de tous les livres de la base de données
exports.getAllBooks =  (req, res) => 
{
    Book.find()
        .then(things => res.status(200).json(things))
        .catch(error => res.status(400).json({ error }));
}

//Renvoie un tableau des 3 livres de la base de données ayant la meilleure note moyenne.
exports.getBestRatedBooks =  (req, res) => 
{
    Thing.findOne({ _id: req.params.id })
        .then(thing => res.status(200).json(thing))
        .catch(error => res.status(404).json({ error }));
}