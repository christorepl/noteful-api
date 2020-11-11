const express = require('express')
const path = require('path')
const xss = require('xss')
const NotesService = require('./notes-service')
const notesRouter = express.Router()
const jsonParser = express.json()

const sanitizeNote = note => ({
    id: note.id,
    folder: xss(note.folder),
    title: xss(note.title),
    content: xss(note.content)
})

notesRouter
    .route('/')
    .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    NotesService.getAllNotes(knexInstance)
        .then(notes => {
            res.json(notes.map(sanitizeNote))
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { title, content, folder } = req.body
    const newNote = { title, content, folder}
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
                .location(path.posix.join(req.originalUrl,`/notes/${note.id}`))
                .json(sanitizeNote(note))
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
            res.json(sanitizeNote(note))
        })
        .catch(next)
    })
    .delete((req, res, next) => {
        NotesService.deleteNote(
            req.app.get('db'),
            req.params.note_id
        )
        .then(() => {
            if(!note) {
                return res
                    .status(404)
                    .json({
                        error: { message: `Note with id ${req.params.note_id} doesn't exist`}
                    })
            }
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { title, content, folder } = req.body
        const noteToUpdate = { title, content, folder }
        NotesService.updateNote(
            req.app.get('db'),
            req.params.note_id,
            noteToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })

module.exports = notesRouter