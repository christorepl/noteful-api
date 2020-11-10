require('dotenv').config()
const knex = require('knex')
const NotesService = require('./notes/notes-service')

const knexInstance = knex({
  client: 'pg',
  connection: process.env.DB_URL,
})

NotesService.getAllNotes(knexInstance)
    .then(notes => console.log(notes))
    .then(() => {
        NotesService.insertNote(knexInstance, {
            note_name: 'New note',
            content: 'New content',
            folder_id: 7
        })
    })
    .then(newNote => {
        console.log(newNote)
        return NotesService.updateNote(
            knexInstance,
            newNote.id,
            {note_name: 'Updated note name'}
        ).then(() => NotesService.getById(knexInstance, newNote.id))
    })
    .then(note => {
        console.log(note)
        return NotesService.deleteNote(knexInstance, note.id)
})