const router = require("express").Router();
const mongoose = require("mongoose");
const User = require("../models/User.model");
const axios = require('axios');
const urlParams = require('url-search-params')
const querystring = require('querystring');
const isLoggedIn = require("../middleware/isLoggedIn");
const SpotifyWebApi = require('spotify-web-api-node');
const Playlist = require("../models/Playlist.model");
const Track = require("../models/Track.model");

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
});

/////         P   R   O   F   I   L   E         ///// 

router.get('/create/access_token=:accessToken&refresh_token=:refreshToken', (req,res,next) => {
    req.app.locals.accessToken = req.params.accessToken
    req.app.locals.refreshToken = req.params.refreshToken

    axios.get('https://api.spotify.com/v1/me', {
            params: { limit: 50, offset: 0 },
            headers: {
                Accept: 'application/json',
                Authorization: 'Bearer ' + req.app.locals.accessToken,
                'Content-Type': 'application/json',
            },
        })
    .then((myInfo) => {
        const myProfile = myInfo.data;
        req.app.locals.myProfile = myProfile;
        req.session.myProfile = myProfile;
        res.render('list/create-playlist', { myProfile })
    })
    .catch(err => next(err))
  })


    ////          C R E A T E    P L A Y L I S T              /////


router.post('/create-playlist', async (req,res,next) => {
      const {name, description} = req.body
      const author = await User.findById(req.session.user._id)
      const accessToken = req.app.locals.accessToken
  
       axios({
        method: 'post',
        url: `https://api.spotify.com/v1/users/${req.session.myProfile.id}/playlists`,
        data: {
           name: name,
           description: description,
           public: false
          },
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${accessToken}`, 
          },
      })
      .then((data) => {
        const spotifyId = data.data.id
        /* console.log('spotifyId when I create the playlist: ', spotifyId, data.data.id) */
        Playlist.create({name, description, author, spotifyId: data.data.id})
        .then(playlistCreated => {
            const user = req.app.locals.user._id;
    
        User.findById(user)
            .then((foundUser) => {
              foundUser.playlists.push(playlistCreated._id)
              foundUser.save();
              res.redirect(`/viewplaylist/${playlistCreated._id}`)
            })
        })
        .catch(err => next(err))
      
      })
      .catch((err) => console.log(err))   
      
    })  

////          S   E    A    R   C   H         T   R   A   C   K   S             /////


router.post('/search-songs', (req,res,next) => { //spotifyId 6216841d53722ef37f93a49e Help
      const accessToken = req.app.locals.accessToken;
      const query = req.body.search;
      const { spotifyId, playlistId } = req.body
      
      console.log('---------spotifyID in search tracks is ok --------------', spotifyId, playlistId)
   
        axios.get(`https://api.spotify.com/v1/search?q=${query}&type=track`, {  
               params: { limit: 20, offset: 0 }, 
               headers: {
                   Accept: 'application/json',
                   Authorization: 'Bearer ' + accessToken,
                   'Content-Type': 'application/json',
               },
           })
       .then((resp) => {
        const songResults = resp.data.tracks.items 
        res.render('list/search-results', {songResults, spotifyId, playlistId}) 
        console.log(' a song name not in add tracks yet',songResults[0].name)
       })
       .catch(err => next(err)) 
     })


////          A   D   D         T   R   A   C   K   S             /////


router.post('/add-songs/:songId', async (req,res,next) => {
  const {songId} = req.params;
  const {spotifyId, playlistId} = req.body
  const accessToken = req.app.locals.accessToken
  console.log('In add tracks buttton, its ok so far ------ song id: ', songId, 'spotifyId: ',spotifyId,'playlistId: ', playlistId)

   axios({
    method: 'post',
    url: `https://api.spotify.com/v1/playlists/${spotifyId}/tracks?uris=spotify:track:${songId}`,
    data: {
    }, 
    headers: {
      'content-type': 'application/json',
      'Content-Length': '0',
      Authorization: `Bearer ${accessToken}`, 
      },
  })
  .then((res) => console.log('creating a track on spotify:',res.data))
  .catch((err) => console.log(err))   

  Track.create( { name: songId })
    .then(trackCreated => {
        const user = req.app.locals.user._id;

        Playlist.findById(playlistId)
        .then((foundPlaylist) => {
          console.log('foundPlaylist:', foundPlaylist)
          foundPlaylist.tracks.push(trackCreated._id)
          foundPlaylist.save();
          res.redirect(`/viewplaylist/${playlistId}`)
        })
    })
    .catch(err => next(err))
  }) 

  module.exports = router;