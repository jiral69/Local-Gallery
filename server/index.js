import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import router from './routes/media.js'
import db from './DataBase.js'
import multer from 'multer';



const PORT = 3001;
const app= express();

const storage = multer.diskStorage({
    destination:(req, file ,cb)=> cb(null, './media'),
    filename: (req ,file ,cb)=>cb(null, file.originalname)
});

const upload =multer({storage : storage});

//to get the current directory name in ES modules, we need to use the fileURLToPath and path.dirname methods

//basically one snatches the raw URL and  translates it into a standared windows path
const __filename = fileURLToPath(import.meta.url);
//this one takes the full path and chops off index.js leaving C:\programming\Local Gallery\server
const __dirname = path.dirname(__filename);
//this one works depending on the operating system, so it doesnt crash when we switch to some diffrent os
const MEDIA_DIR = path.join(__dirname, 'media');

app.use(express.static(path.join(__dirname, '../client/dist')));

app.use('/media', express.static(MEDIA_DIR));

app.use(cors());
app.use(express.json());

app.use('/api/media', router);

app.post('/api/media/upload', upload.single('file'), (req,res)=>{
    if(!req.file) return res.json({success:false, error:"No File"});
    const Nrow=db.prepare("INSERT INTO media_metadata (filename, is_favorite, tags, channel) values (?, 0, '[]', ?)");
    Nrow.run(req.file?.originalname),req.body.channel || 'All';

    res.json({success:true});


})


app.listen(PORT, ()=>{
    console.log("listening on port:", PORT);
    console.log(MEDIA_DIR);
    console.log("Data base is working")


})


