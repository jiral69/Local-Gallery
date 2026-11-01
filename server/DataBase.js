import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';


const appDataPath = process.env.APPDATA;
const galleryFolder = path.join(appDataPath, 'LocalGallery');

if (!fs.existsSync(galleryFolder)) {
  fs.mkdirSync(galleryFolder, { recursive: true });
}

const dbPath = path.join(galleryFolder, 'gallery.db');
const db = new Database(dbPath);


const createTableQuery=`
    CREATE TABLE IF NOT EXISTS media_metadata(
        filename text primary key,
        is_favorite integer default 0,
        tags text default '[]',
        channel TEXT DEFAULT 'All'
        );`;

db.exec(createTableQuery);



export default db;