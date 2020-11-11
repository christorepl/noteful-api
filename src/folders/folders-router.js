const express = require('express')
const path = require('path')
const xss = require('xss')
const FoldersService = require('./folders-service')
const foldersRouter = express.Router()
const jsonParser = express.json()

const sanitizeFolder = folder => ({
    id: folder.id,
    name: xss(folder.name)
})

foldersRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        FoldersService.getAllFolders(knexInstance)
            .then(folders => {
                res.json(folders.map(sanitizeFolder))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const { name } = req.body
        const newFolder = { name }
        for (const [key, value] of Object.entries(newFolder)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing ${key} in request body`}
                })
            }
        }
        FoldersService.insertFolder(knexInstance, newFolder)
            .then(folder => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl,`/folders/${folder.id}`))
                    .json(sanitizeFolder(folder))
            })
            .catch(next)
})

foldersRouter
    .route('/:folder_id')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        FoldersService.getById(knexInstance, req.params.folder_id)
            .then(folder => {
                if(!folder) {
                    return res.status(404).json({
                        error : { message: `Folder doesn't exist`}
                    })
                }
                res.json(sanitizeFolder(folder))
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        FoldersService.deleteFolder(
            req.app.get('db'),
            req.params.folder_id
        )
        .then(rowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { name } = req.body
        const folderToUpdate = { name }
        FoldersService.updateFolder(
            req.app.get('db'),
            req.params.folder_id,
            folderToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })


module.exports = foldersRouter