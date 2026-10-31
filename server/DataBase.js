import {DatabaseSync} from 'node:sqlite'

const db= new DatabaseSync('gallery.db');

const createTableQuery=`
    CREATE TABLE IF NOT EXISTS media_metadata(
        filename text primary key,
        is_favorite integer default 0,
        tags text default '[]',
        channel TEXT DEFAULT 'All'
        );`;

db.exec(createTableQuery);



export default db;