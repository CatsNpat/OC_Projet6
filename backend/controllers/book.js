const Book = require('../models/book');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    delete bookObject.rating;

    const book = new Book ({
        ...bookObject,
        userId : req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
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
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl : `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : {...req.body};

        delete bookObject._userId;
        delete bookObject.rating;
        Book.findOne({_id : req.params.id})
            .then((book) => {
                if(book.userId != req.auth.userId){
                    res.status(401).json({message : 'Not authorized'});
                }else {
                    Book.updateOne({_id:req.params.id}, {...bookObject,_id:req.params.id})
                        .then(() => res.status(200).json({message:'Livre modifié'}))
                        .catch(error => res.status(400).json({error}));
                }
            })
            .catch((error) => {
                res.status(400).json({error})
            });
};

exports.deleteOneBook = (req, res, next) => {
    Book.deleteOne({_id:req.params.id})
        .then(() => res.status(200).json({message:'Livre supprimé'}))
        .catch(error => res.status(400).json({error}));
}