const Book = require('../models/book');

exports.createBook = (req, res, next) => {
    delete req.body_id;
    const book = new Book ({
        ...req.body
    });

    book.save()
        .then (()=>res.status(201).json({message:'Livre crée'}))
        .catch (error => res.status(400).json({error}));
};

exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({error}));
};

exports.getOneBooks = (req, res, next) => {
    Book.findOne({_id:req.params.id})
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({error}));
};

exports.modifyBook = (req, res, next) => {
    Book.updateOne({_id:req.params.id}, {...req.body,_id:req.params.id})
        .then(() => res.status(200).json({message:'Livre modifié'}))
        .catch(error => res.status(400).json({error}));
};

exports.deleteOneBook = (req, res, next) => {
    Book.deleteOne({_id:req.params.id})
        .then(() => res.status(200).json({message:'Livre supprimé'}))
        .catch(error => res.status(400).json({error}));
}