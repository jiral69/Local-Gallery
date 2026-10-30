import { useState, useEffect} from 'react'
import './App.css'

function App() {

  const [mediaList , setMediaList]=useState([]);
  const [showFavorite , setShowFavorite]=useState(false);
  const [searchQuery , setSearchQuery]=useState("");
 

    async function FavoriteHandler(filename , currentFavorite){
      const Status= currentFavorite==1 ? 0:1;
      await fetch('http://localhost:3001/api/media/favorite',{
        method:'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename:filename,
          is_favorite:Status
        })
      });

      setMediaList(mediaList.map((item)=>{
        if(item.filename===filename){
          return {...item, is_favorite: Status};
        }
        else{
          return item;
        }
      }));

    }

    async function TagsHandler(filename, currentTags){
      const newTag=prompt("enter a new tag:");
      if(!newTag) return;
      const updatedTags=[...currentTags, newTag];
      await fetch('http://localhost:3001/api/media/tags',{
        method:'POST',
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename:filename,
          tags:updatedTags
        })
      })

      setMediaList(mediaList.map((item)=>{
        if(item.filename===filename){
          return {...item, tags:updatedTags};
        }
        else{
          return item;
        }
      }))
    }
      

  useEffect(()=>{
     async function loadServer(){
      try{
        const response =await fetch('http://localhost:3001/api/media');
        const data= await response.json();

        setMediaList(data); 
      }
      catch(error){
        console.error("failed to fetch:",error);
      }
      
    }

    loadServer()

  }, []);
                console.log(mediaList);


    const fileteredListByFav=showFavorite? mediaList.filter((item)=>item.is_favorite===1): mediaList;
    const fileteredList=fileteredListByFav.filter((item)=>{
      return item.filename.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase()) || item.tags?.some((tag)=>{return tag.toLowerCase().includes(searchQuery.toLocaleLowerCase())});
    })
        
        
  return(
    <div>
      <h1>Test Header</h1>
      
      <div className='FavoriteCheck'>
        <button onClick={()=>setShowFavorite(!showFavorite)}>{showFavorite  ? " Show All Images" : "★ Show Favorites"}</button>
        <input type="text"
            placeholder='Search name or tag'
            value={searchQuery}
            onChange={(e)=>setSearchQuery(e.target.value)} />
      </div>


      <div className='IF'>
        {fileteredList.map((item) =>{
          return(
            <div key={item.filename} className='Unifile'>
              <img src={item.url} width={200} />
              <p>{item.filename}</p>
              <button onClick={()=> FavoriteHandler(item.filename, item.is_favorite)}>
                {item.is_favorite === 1 ? "★ Favorited" : "☆ Favorite"}
              </button>
              {item.tags?.map((Itag)=>{
                return <span key={Itag} className='tag-badge'>{Itag}</span>
                
              })}
              <button onClick={()=>TagsHandler(item.filename, item.tags)}>Add Tag</button>

            </div>
          )
        })}
      </div>
    </div>
  );

 
}
export default App
