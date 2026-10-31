import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import db from '../DataBase.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MEDIA_DIR = path.join(__dirname,'..', 'media');

const router= express.Router();



// Serve static files from the media directory, it will allow the client to access the media files directly via URL

router.get('/', async(req, res)=> {

    //we are using the fs.promises.readdir method to read the contents of the media directory, it returns an array of filenames in the directory
    try{
        const files =await fs.readdir(MEDIA_DIR);
        const statment= db.prepare('select is_favorite, tags, channel FROM media_metadata WHERE filename=?');

        //we are mapping the files to an array of objects containing the filename and the URL to access the file so it looks simpler and takes you directly to the file when you click on it in the browser
        let MediaFilesMapping=files.map((x)=> {

            let favoriteStatus, mediaTags, channel;
            const row= statment.get(x);

            if(row){ 
                favoriteStatus=row.is_favorite;
                mediaTags=JSON.parse(row.tags);
                channel=row.channel;}
            else{
                favoriteStatus=0;
                mediaTags=[];
                channel="All";
            }

            return {
                filename: x,
                url : `http://localhost:3001/media/${x}`,
                is_favorite: favoriteStatus,
                tags: mediaTags,
                channel: channel

            }
            
        })
        
        res.json(MediaFilesMapping)
    }

    //if there is an error reading the media directory, we will send a 500 status code and an error message
    catch(error){
        res.status(500).json({error: "Failed to read media folder"})
    }
})

//this works to update and check is the image or gif was favorited
router.post('/favorite',(req,res)=>{
    try{
        
        const {filename , is_favorite}= req.body;

        const statment= db.prepare('select * FROM media_metadata WHERE filename=?');
        const existingFile=statment.get(filename);

        if(existingFile!==undefined){
            const updateStatment= db.prepare('update media_metadata SET is_favorite=? WHERE filename=?');
            updateStatment.run(is_favorite,filename);
        }
        else{
            const insertStatment= db.prepare('INSERT INTO media_metadata (filename , is_favorite) VALUES (?,?)');
            insertStatment.run(filename,is_favorite);
        }

        res.json({success:true, message:"file saved"})
    }
    catch(error){
        console.error(error);
        res.status(500).json({error: "Failed to update media metadata"})
    }
})

router.post('/tags',(req,res)=>{

    try{
        const {filename , tags}= req.body;

        let TagUnpacked= JSON.stringify(tags);

        const statment= db.prepare('select * FROM media_metadata WHERE filename=?');
        const existingFile=statment.get(filename);

        if(existingFile!==undefined){
            const updateStatment= db.prepare('UPDATE media_metadata SET tags=? WHERE filename=?');
            updateStatment.run(TagUnpacked,filename);
        }
        else{
            const insertStatment= db.prepare('INSERT INTO media_metadata (filename, tags) VALUES (?,?)');
            insertStatment.run(filename,TagUnpacked);
        }

        res.json({success:true, message:"tags saved"})
    }
    catch(error){
        console.error(error);
        res.status(500).json({error: "Failed to update media metadata"})
    }
})

router.post('/channel', (req,res)=>{
    try{
        const {filename , newChannel}= req.body;

        const statment= db.prepare('SELECT * from media_metadata WHERE filename=?');
        const existingFile=statment.get(filename);

        if(existingFile!==undefined){
            const updateStatment= db.prepare('UPDATE media_metadata SET channel=? WHERE filename=?');
            updateStatment.run(newChannel,filename);
        }
        else{
            const insertStatment= db.prepare('INSERT INTO media_metadata (filename,channel) VALUES (?,?)');
            insertStatment.run(filename,newChannel)
        }

        res.json({success:true, message:"channel saved"});
    }
    catch(error){
        console.error(error);
        res.status(500).json({error: "Failed to update media metadata"})
    }
})

export default router;
