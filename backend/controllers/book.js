const Book = require('../models/book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

    const book = new Book ({
        ...bookObject,
        userId : req.auth.userId,
        ratings : [{
            userId : req.auth.userId,
            grade : bookObject.ratings[0].grade
        }],
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    book.save()
        .then (()=>res.status(201).json({message:'Livre crée'}))
        .catch (error => res.status(400).json({error}));
};

exports.createRating = (req, res, next) => {
    Book.findOne({_id:req.params.id})
    .then(book => {
        var userVote = 0;
        for (let i=0; i<book.ratings.length; i++)
            if(book.ratings[i].userId == req.auth.userId){
                userVote = 1;
                res.status(401).json({message:'no authorized'})
            }
        if(userVote != 1){
            const newRating = {grade: `${req.body.rating}`, userId: `${req.auth.userId}`}
            book.updateOne(
                {$addToSet : {ratings : newRating}})
                    .then(() => {
                        Book.findOne({_id:req.params.id})
                            .then((bookAverage) => {
                                var averageTotalVote = 0;
                                var averageRating = 0;
                                for (let i=0; i<bookAverage.ratings.length; i++)
                                    averageTotalVote += bookAverage.ratings[i].grade;
                                    averageRating = averageTotalVote / bookAverage.ratings.length;
                                    bookAverage.updateOne({averageRating})
                                        .then(()=> {
                                            Book.findOne({_id:req.params.id})
                                                .then(book => res.status(200).json(book))
                                                .catch(error => res.status(404).json({error}));
                                        })
                                        .catch (error => res.status(500).json ({error}));
                            })
                            .catch(error => res.status (500).json({error}))
                    })
                    .catch(error => res.status(400).json({error}));
        }
    })
    .catch(error => res.status(500).json({error}));
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

exports.getBestRating = (req, res, next) => {
    Book.find().sort({ averageRating: -1 }).limit(3)
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({error}));
};

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl : `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : {...req.body};

        delete bookObject._userId;
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
            .catch((error) => {res.status(400).json({error})});
};

exports.deleteOneBook = (req, res, next) => {
    Book.findOne({_id:req.params.id})
        .then(book =>{
            if(book.userId != req.auth.userId){
                res.status(401).json({message:'not authorized'});
            }else{
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`,() => {
                    Book.deleteOne ({_id:req.params.id})
                        .then(()=>{res.status(200).json({message :'Livre supprimé'})})
                        .catch(error => res.status(401).json({error}));
                });
            }
        })
        .catch(error => {res.status(500).json({error})});
};