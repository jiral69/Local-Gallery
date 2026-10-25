import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import router from './routes/media.js'


const PORT = 3001;
const app= express();

//to get the current directory name in ES modules, we need to use the fileURLToPath and path.dirname methods

//basically one snatches the raw URL and  translates it into a standared windows path
const __filename = fileURLToPath(import.meta.url);
//this one takes the full path and chops off index.js leaving C:\programming\Local Gallery\server
const __dirname = path.dirname(__filename);
//this one works depending on the operating system, so it doesnt crash when we switch to some diffrent os
const MEDIA_DIR = path.join(__dirname, 'media');



app.use('/media', express.static(MEDIA_DIR));

app.use(cors());
app.use(express.json());

app.use('/api/media', router);


app.listen(PORT, ()=>{
    console.log("listening on port:", PORT);
    console.log(MEDIA_DIR);
    console.log("Data base is working")


})


