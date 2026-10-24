import express from 'express'
import cors from 'cors'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import db from './DataBase.js'


const PORT = 3001;
const app= express();

//to get the current directory name in ES modules, we need to use the fileURLToPath and path.dirname methods
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MEDIA_DIR = path.join(__dirname, 'media');





app.use(cors());
app.use(express.json());

// Serve static files from the media directory, it will allow the client to access the media files directly via URL
app.use('/media', express.static(MEDIA_DIR));

app.get('/api/media', async(req, res)=> {

    //we are using the fs.promises.readdir method to read the contents of the media directory, it returns an array of filenames in the directory
    try{
        const files =await fs.readdir(MEDIA_DIR);
        const statment= db.prepare('select is_favorite, tags FROM media_metadata WHERE filename=?');

        //we are mapping the files to an array of objects containing the filename and the URL to access the file so it looks simpler and takes you directly to the file when you click on it in the browser
        let MediaFilesMapping=files.map((x)=> {
            let favoriteStatus, mediaTags;
            const row= statment.get(x);
            if(row){ 
                favoriteStatus=row.is_favorite;
                mediaTags=JSON.parse(row.tags);}
            else{
                favoriteStatus=false;
                mediaTags=[];
            }

            return {
                filename: x,
                url : `http://localhost:3001/media/${x}`,
                is_favorite: favoriteStatus,
                tags: mediaTags

            }
            
        })
        
        res.json(MediaFilesMapping)
    }

    //if there is an error reading the media directory, we will send a 500 status code and an error message
    catch(error){
        res.status(500).json({error: "Failed to read media folder"})
    }
})



app.listen(PORT, ()=>{
    console.log("listening on port:", PORT);
    console.log(MEDIA_DIR);
    console.log("Data base is working")


})


