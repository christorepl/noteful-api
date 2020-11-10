require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const NotesService = require('./notes/notes-service')
const app = express()
const morganOption = (NODE_ENV === 'production' ? 'tiny' : 'common')
app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.get('/notes', (req, res, next) => {
    const knexInstance = req.app.get('db')
    NotesService.getAllNotes(knexInstance)
        .then(notes => {
            res.json(notes)
        })
        .catch(next)
})

app.get('/notes/:note_id', (req, res, next) => {
    const knexInstance = req.app.get('db')
    NotesService.getById(knexInstance, req.params.note_id)
        .then(note => {
            if(!note) {
                return res.status(404).json({
                    error: { message: `Note doesn't exist`}
                })
            }
            res.json(note)
        })
        .catch(next)
})

app.post('/notes', (req, res, next) => {
    const knexInstance = req.app.get('db')
    console.log(req.body)
    const { note_name, content, folder_id } = req.body
    const newNote = { note_name, content, folder_id}
    NotesService.insertNote(knexInstance, newNote)
        .then(note => {
            res
                .status(201)
                .location(`/notes/${note.id}`)
                .json(note)
        })
        .catch(next)
})

app.use(function errorHandler(e, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: {message: 'server error'}}
    } else {
        console.error(error)
        response = {message: error.message, error}
    }
    res.status(500).json(response)
})



module.exports = app