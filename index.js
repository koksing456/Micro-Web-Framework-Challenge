const Joi = require('joi')
const multer = require('multer');
const express = require('express')
const app = express()
app.use(express.json())
//to make a folder publicly accessible
app.use(express.static('uploads'))

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toDateString() + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/zip'){
        cb(null, true)
    }
    else
        cb(new Error('the file is not a picture or zip.'), false)
}

const upload = multer({storage: storage, fileFilter: fileFilter})

let pictures = [
    
]

app.get('/', (req, res) => {
    res.send('HU')
})

app.get('/api/pictures', (req, res) => {
    res.send(pictures)
})

app.get('/api/pictures/:id', (req, res) => {
    const picture = pictures.find(p => p.id === parseInt(req.params.id))
    if (!picture) {
        return res.status(404).send('The picture with the given id cannot be found')
    }

    res.send(picture)
})

app.post('/api/pictures', upload.single('image'), (req, res) => {
    // attach a picture
    // permanent link to this picture
    console.log(req.file);
    // const { error } = validatePicture(req.body)

    // if (error) {
    //     res.status(400).send(result.error.details[0].message)
    //     return
    // }

    const pic = {
        id: pictures.length + 1,
        originalName: req.file.originalname,
        fileName: req.file.filename,
        path: 'http://localhost:3000/' + req.file.path.replace('uploads\\', '')
    }

    pictures.push(pic)
    res.send(pictures)
})

app.put('/api/pictures/:id', (req, res) => {

    const picture = pictures.find(p => p.id === parseInt(req.params.id))
    if (!picture) {
        return res.status(404).send('The picture with the given id cannot be found')
    }

    const { error } = validatePicture(req.body)

    if (error) {
        res.status(400).send(result.error.details[0].message)
        return
    }

    picture.name = req.body.name
    res.send(pictures)
})

app.delete('/api/pictures/:id', (req, res) => {

    const picture = pictures.find(p => p.id === parseInt(req.params.id))
    if (!picture) {
        return res.status(404).send('The picture with the given id cannot be found')
    }

    pictures = pictures.filter(p => p.id != picture.id)
    res.send(pictures)
})

function validatePicture(pictures) {
    const schema = Joi.object({
        name: Joi.string().min(3).required(),
        description: Joi.string().required()
    })

    return result = schema.validate(pictures)
}

const port = process.env.PORT || 3000;
app.listen(port)