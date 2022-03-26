const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playlistSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    href: String,
    author: { type: Schema.Types.ObjectId, ref: 'User'},
    tracks: [ { type: Schema.Types.ObjectId, ref: 'Track'} ],
    spotifyId: String
},
{
    timestamps: true
})
const Playlist = mongoose.model("Playlist", playlistSchema);

module.exports = Playlist;