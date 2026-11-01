import { useState, useEffect} from 'react'
import './App.css'

function App() {

  const [mediaList , setMediaList]=useState([]);
  const [showFavorite , setShowFavorite]=useState(false);
  const [searchQuery , setSearchQuery]=useState("");
  const [selectedIndex , setSelectedIndex]=useState(null);
  const [currentChannel, setCurrentChannel]=useState('All');
  const [channelsList, setChannelsList]=useState(['All']);
 

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
    async function UploadHandler(e){
      const file=e.target.files[0];
      if(!file) return;

      const formData= new FormData();

      formData.append('file',file);
      formData.append('channel', currentChannel);

      await fetch('http://localhost:3001/api/media/upload', {
        method:'POST',
        body:formData
      });

      const newMedia = {
      filename: file.name,
      is_favorite: 0,
      tags: [],
      url: `http://localhost:3001/media/${file.name}`,
      channel: currentChannel
    };

      setMediaList([...mediaList, newMedia]);
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

    async function RemoveTag(filename, currentTag,clickedTag ){
      const updatedTags=currentTag.filter((t)=> {return t!==clickedTag});

      await fetch('http://localhost:3001/api/media/tags', {
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
    function addChannel(){
      const newChan=prompt("enter channel name");
      if(!newChan) return;
      if(channelsList.includes(newChan)) return;
      const updateChannel=[...channelsList, newChan];
      setChannelsList(updateChannel);
    }
    async function ChannelHandler(filename, newChannel){

      await fetch('http://localhost:3001/api/media/channel',{
        method:'POST',
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename:filename,
          newChannel:newChannel
        })

      })

      setMediaList(mediaList.map((item)=>{
        if(item.filename===filename){
          return {...item,channel:newChannel}
        }
        else{
          return item;
        }
      }))
    }

    async function DeleteHandler(filename){
      if(!window.confirm("are you sure you want to delete this file?")) return;

      await fetch('http://localhost:3001/api/media/delete',{
        method:'POST',
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({filename:filename})
      });

      setMediaList(mediaList.filter((item)=> item.filename!==filename));
      setSelectedIndex(null);
    }
      

  useEffect(()=>{
     async function loadServer(){
      try{
        const response =await fetch('http://localhost:3001/api/media');
        const data= await response.json();

        setMediaList(data); 

        
        const uniqueChannels = [...new Set(['All', ...data.map(item => item.channel).filter(Boolean)])];
        setChannelsList(uniqueChannels);
      }
      catch(error){
        console.error("failed to fetch:",error);
      }
      
    }


    loadServer()

  }, []);

  


    console.log(mediaList);


    const fileteredListByFav=showFavorite? mediaList.filter((item)=>item.is_favorite===1): mediaList;
    const fileteredListByTags=fileteredListByFav.filter((item)=>{
      return item.filename.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase()) || item.tags?.some((tag)=>{return tag.toLowerCase().includes(searchQuery.toLocaleLowerCase())});
    });
    const fileteredList=fileteredListByTags.filter((item)=>{
      return currentChannel==='All'|| item.channel===currentChannel;
    })

    const activeItem= selectedIndex!==null? fileteredList[selectedIndex] : null;  

    useEffect(() => {
  // Only listen for keys if the lightbox is actually open
  if (selectedIndex === null) return;

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setSelectedIndex(null);
    } else if (e.key === "ArrowRight" && selectedIndex < fileteredList.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    } else if (e.key === "ArrowLeft" && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => window.removeEventListener("keydown", handleKeyDown);
}, [selectedIndex, fileteredList.length]);
        
        
  return(
    <main className="container">
      <h1>Local Gallery</h1>
      
      <div className='FavoriteCheck'>
        <button onClick={()=>setShowFavorite(!showFavorite)}>{showFavorite  ? " Show All Images" : "★ Show Favorites"}</button>
        <input type="text"
            placeholder='Search name or tag'
            value={searchQuery}
            onChange={(e)=>setSearchQuery(e.target.value)} />
        <input 
          type="file" 
          accept="image/*,video/mp4" 
          onChange={UploadHandler} 
        />

        <aside className='Channel-sidebar'>
          <h3>Channels</h3>
          <div className='Channel-list'>
            {channelsList.map((item)=>{
              return(
                <button key={item} onClick={()=>setCurrentChannel(item)} className='channel-btn'>{item}</button>
              )
            })}
          </div>
          <button onClick={()=>addChannel()} className="add-channel-btn" >+ Add Channel</button>
        </aside>
      </div>


      <div className='IF'>
        {fileteredList.map((item,index) =>{
          return(
            <div onClick={()=>setSelectedIndex(index)} key={item.filename} className='Unifile'>
              {item.filename.endsWith('.mp4')===false? 
               <img src={item.url} />: <video src={item.url}  controls />
              }
              <p>{item.filename}</p>
              <button 
                className="card-star-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  FavoriteHandler(item.filename, item.is_favorite);
                }}
>
  {item.is_favorite === 1 ? "★" : "☆"}
</button>                        
            </div>
          )
        })}
      </div>


      {activeItem && (
  <div className="lightbox-overlay">
      
    {/* Left 75%: Media Stage & Navigation */}
    <div className="lightbox-stage">
      <button 
        className="nav-btn prev-btn" 
        onClick={() => setSelectedIndex(selectedIndex - 1)}
        disabled={selectedIndex === 0}
      >
        &#10094;
      </button>

      {activeItem.filename.endsWith('.mp4') === false ? (
        <img src={activeItem.url} />
      ) : (
        <video src={activeItem.url} controls autoPlay />
      )}

      <button 
        className="nav-btn next-btn" 
        onClick={() => setSelectedIndex(selectedIndex + 1)}
        disabled={selectedIndex === fileteredList.length - 1}
      >
        &#10095;
      </button>
    </div>
      
    {/* Right 25%: Inspector Sidebar */}
    <div className="lightbox-sidebar">
    <button onClick={() => DeleteHandler(activeItem.filename)}>Delete File</button>
      <select onChange={(e)=> ChannelHandler(activeItem.filename, e.target.value)} className='Channel-select' value={activeItem.channel}>
        {channelsList.map((item)=>{
          
          return <option key={item} value={item}>{item}</option>
        
        })}
      </select>
      <div className="sidebar-header">
        <h3>{activeItem.filename}</h3>
        <button className="close-btn" onClick={() => setSelectedIndex(null)}>✕</button>
    </div>
      {/*Zoomed in page Favortie button */}
      <button onClick={() => FavoriteHandler(activeItem.filename, activeItem.is_favorite)}>
        {activeItem.is_favorite === 1 ? "★ Favorited" : "☆ Favorite"}
      </button>

      <div className="sidebar-tags">
        <h4>Tags</h4>
        {/*code that handles tags */}
        <div>
          {activeItem.tags?.map((Itag) => (
            <span key={Itag} className="tag-badge">{Itag}
              <button className="remove-tag-btn" onClick={()=>RemoveTag(activeItem.filename, activeItem.tags, Itag)}>x</button>
            </span>
          ))}
      </div>
        <button onClick={() => TagsHandler(activeItem.filename, activeItem.tags)}>+ Add Tag</button>
      </div>
    </div>
  </div>
)}
    </main>
  );

 
}
export default App
