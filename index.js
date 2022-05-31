// const Joi = require('joi')
const multer = require('multer');
const express = require('express')
const app = express()
// parses incoming JSON requests and puts the parsed data in req.body
app.use(express.json())
//to make a folder publicly accessible
app.use(express.static('uploads'))
//to unzip
var AdmZip = require("adm-zip");
// to resize image
const sharp = require('sharp');
const path = require('path');
const zipEntry = require('adm-zip/zipEntry');
require('dotenv').config()

const DEFAULT_DIMENSION = 128
let pictures = []

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/zip') {
        cb(null, true)
    }
    else
    {
        const errorMessage = new Error('the file is not a picture or zip.')
        cb(errorMessage, false)
    }
        
}

const upload = multer({
    storage: storage, fileFilter: fileFilter
})

app.post('/api/pictures', upload.single('image'), (req, res) => {
    // const { error } = validatePicture(req.body)

    if (req.file.mimetype === 'application/zip') {
        let zip = new AdmZip(req.file.path);
        let zipEntries = zip.getEntries();
        let thumbnails = []
        zip.extractAllTo('uploads', true);

        zipEntries.forEach(function (zipEntry) {
            let extArray = zipEntry.entryName.split(".")
            let thumbnailName = extArray[0]
            let extension = extArray[extArray.length - 1]
            
            thumbnails = [`${thumbnailName}-thumbnail_1.${extension}`, `${thumbnailName}-thumbnail_2.${extension}`]

            let pic = {
                id: pictures.length + 1,
                name: zipEntry.entryName,
                image: `http://localhost:3000/${zipEntry.entryName}`,
                thumbnails: [`http://localhost:3000/${thumbnails[0]}`, `http://localhost:3000/${thumbnails[1]}`]
            }

            const image = sharp(`uploads\\${zipEntry.entryName}`)
            resizeImage(image, extension, zipEntry.entryName)

            pictures.push(pic)
        });
    } else {
        let extArray = req.file.originalname.split(".")
        let name = extArray[0]
        let extension = extArray[extArray.length - 1]

        const image = sharp(req.file.path)
        resizeImage(image, extension, name)

        let pic = {
            id: pictures.length + 1,
            name: req.file.originalname,
            image: 'http://localhost:3000/' + req.file.path.replace('uploads\\', ''),
            thumbnails: [`http://localhost:3000/${name}-thumbnail_1.${extension}`, `http://localhost:3000/${name}-thumbnail_2.${extension}`],
        }

        pictures.push(pic)
    }

    res.send(pictures)
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

app.put('/api/pictures/:id', upload.single('image'), (req, res) => {

    let picture = pictures.find(p => p.id === parseInt(req.params.id))
    if (!picture) {
        return res.status(404).send('The picture with the given id cannot be found')
    }

    // const { error } = validatePicture(req.body)

    // if (error) {
    //     res.status(400).send(result.error.details[0].message)
    //     return
    // }

        let extArray = req.file.originalname.split(".")
        let name = extArray[0]
        let extension = extArray[extArray.length - 1]

        const image = sharp(req.file.path)
        resizeImage(image, extension, name)

        picture = {
            id: picture.id,
            name: req.file.originalname,
            image: 'http://localhost:3000/' + req.file.path.replace('uploads\\', ''),
            thumbnails: [`http://localhost:3000/${name}-thumbnail_1.${extension}`, `http://localhost:3000/${name}-thumbnail_2.${extension}`],
        }

        pictures.splice(picture.id - 1, 1, picture)

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

// function validatePicture(pictures) {
//     const schema = Joi.object({
//         name: Joi.string().min(3).required(),
//         description: Joi.string().required()
//     })

//     return result = schema.validate(pictures)
// }

function getResizedImageRatio(dimension, n) {
    return Math.floor(dimension / n)
}

function resizeImage(image, extension, name) {

    image.metadata() // get image metadata for size
        .then((metadata) => {
            const thumbnailSizes = [{ width: getResizedImageRatio(metadata.width, 4), height: getResizedImageRatio(metadata.height, 4) },
                { width: getResizedImageRatio(metadata.width, 2), height: getResizedImageRatio(metadata.height, 2) }
                ];
            if (metadata.width >= DEFAULT_DIMENSION && metadata.height >= DEFAULT_DIMENSION) {
                let n = 1
                thumbnailSizes.forEach((t) => {
                    console.log(t.width);
                    image
                        .resize({ width: t.width, height: t.height })
                        .toFile(`uploads/${name}-thumbnail_${n}.${extension}`)
                        .then(console.log(`Resize thumbnail ${n}`));
                    n++
                })
            } else {
                for (let i = 0; i < thumbnailSizes.length; i++) {
                    image
                        .resize({ width: metadata.width, height: metadata.height })
                        .toFile(`uploads/${name}-thumbnail_${i+1}.${extension}`)
                }
            }
        })
}

const port = process.env.PORT;
app.listen(port)