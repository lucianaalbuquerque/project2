const router = require ('express').Router();
const mongoose = require ('mongoose');
const isLoggedIn = require('../middleware/isLoggedIn');

const Playlist = require('../models/Playlist.model');
const User = require("../models/User.model");


router.get('/profile', isLoggedIn, async (req, res, next) => {
    User.findById(req.session.user._id)
    .then(user => {
        res.render('profile', user);
    })
});

router.get('/myplaylists', isLoggedIn, async (req,res,next) => {
    User.findById(req.session.user._id)
    .populate('playlists')
    .then(user => {
        const userPlaylists = user.playlists
        res.render('list/my-playlists', {userPlaylists} )
    })
})

router.get('/search-playlist', (req, res, next) => {
    res.render('list/search-playlist');
});

router.post('/search-playlist', (req, res, next) => {
    const { name, author } = req.body;
    
    if ( name ) {
        Playlist.findOne( { name } )
        .then(playlistFound => {
        const {_id} = playlistFound; 
        res.redirect(`/viewplaylist/${_id}`)
        })
        .catch(err => {
            next(err)
            res.redirect('/search-playlist')
        })
    }  
    //fix looking for author.username 

    /* else if ( !name && author ) {
    Playlist.findOne( { author.username: author } )
    .then(playlistFound => {
    const {_id} = playlistFound;
    res.redirect(`/viewplaylist/${_id}`)
    })     
}  */

});
  

router.get('/viewplaylist/:_id', async (req,res,next) => {
    const {_id} = req.params
    
    Playlist.findById(_id)
    .populate('author')
    .then(playlist => {
        const {author, tracks} = playlist
        res.render('list/view-playlist', {playlist, author, tracks})
    })
    .catch(err => {next(err)})
})


router.get('/edit/:playlistId', (req,res,next) => {
    const {playlistId} = req.params;

    Playlist.findById(playlistId)
    .then(editPlaylist => {
        res.render('list/edit-playlist', {playlist: editPlaylist})
    })
    .catch(err => next(err))
})

router.post('/edit/:playlistId', (req,res,next) => {
    const {playlistId} = req.params;
    const {name, description} = req.body;

    Playlist.findByIdAndUpdate(playlistId, {name, description})
    .then((updatedPlaylist) => {
        res.redirect(`/viewplaylist/${updatedPlaylist._id}`)
    })
    .catch(err => next(err))
})

router.post('/delete/:playlistId', (req,res,next) => {
    const {playlistId} = req.params
    Playlist.findByIdAndDelete(playlistId)
    .then(() => res.redirect('/profile'))
    .catch(err => next(err))
})

router.get('/about', (req,res,next) => {
    res.render('about')
})

module.exports = router;
