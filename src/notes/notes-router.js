const express = require('express')
const NotesService = require('./notes-service')
const notesRouter = express.Router()
const jsonParser = express.json()

notesRouter
    .route('/')
    .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    NotesService.getAllNotes(knexInstance)
        .then(notes => {
            res.json(notes)
        })
        .catch(next)
})
    .post(jsonParser, (req, res, next) => {
    console.log(req.body)
    const knexInstance = req.app.get('db')
    const { note_name, content, folder_id } = req.body
    const newNote = { note_name, content, folder_id}
    for (const [key, value] of Object.entries(newNote)) {
        if (value == null) {
            return res.status(400).json({
                error: { message: `Missing ${key} in request body`}
            })
        }
    }
    NotesService.insertNote(knexInstance, newNote)
        .then(note => {
            res
                .status(201)
                .location(`/notes/${note.id}`)
                .json(note)
        })
        .catch(next)
})

notesRouter
    .route('/:note_id')
    .get((req, res, next) => {
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

module.exports = notesRouter