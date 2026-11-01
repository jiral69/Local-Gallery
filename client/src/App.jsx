import { useState, useEffect} from 'react'
import './App.css'

function App() {

  const [mediaList , setMediaList]=useState([]);
  const [showFavorite , setShowFavorite]=useState(false);
  const [searchQuery , setSearchQuery]=useState("");
  const [selectedIndex , setSelectedIndex]=useState(null);
  const [currentChannel, setCurrentChannel] = useState('Discover');
  const [channelsList, setChannelsList]=useState(['All']);
  const [activePrompt, setActivePrompt] = useState(null); 
  const [promptText, setPromptText] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
 

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

    async function TagsHandler(filename, currentTags,promptText){
      if(!promptText) return;
      const updatedTags=[...currentTags, promptText];
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
    function addChannel(promptText){
      if(!promptText) return;
      if(channelsList.includes(promptText)) return;
      const updateChannel=[...channelsList, promptText];
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

    async function UrlDownloadHandler(promptText) {
      if(!promptText) return;

      const response =await fetch('http://localhost:3001/api/media/download-url',{
        method:'POST',
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url:promptText,
          channel:currentChannel
        })

    });

    const data=await response.json();

    if(data.success){
      const newMedia={
        filename:data.filename,
        is_favorite:0,
        tags:[],
        url:`http://localhost:3001/media/${data.filename}`,
        channel:currentChannel
      };

      setMediaList([...mediaList,newMedia]);
    }




    }

    async function PromptSubmitHandler(){
      if(!promptText.trim()) return;

      if(activePrompt==='channel'){
        addChannel(promptText.trim());
      }
      else if(activePrompt==='download'){
        await UrlDownloadHandler(promptText.trim());
      }
      else if(activePrompt==='tag'){
        await TagsHandler(activeItem.filename,activeItem.tags,promptText.trim())
      }

      setPromptText('');
      setActivePrompt(null);
    }
      

  useEffect(()=>{
     async function loadServer(){
      try{
        const response =await fetch('http://localhost:3001/api/media');
        const data= await response.json();

        setMediaList(data); 

        setMediaList(data);

        
        
        const uniqueChannels = [...new Set(['All', ...data.map(item => item.channel?.trim()).filter(Boolean)])];
        setChannelsList(uniqueChannels);
      }
      catch(error){
        console.error("failed to fetch:",error);
      }
      
    }


    loadServer()

  }, []);

  


    console.log(mediaList);



    const fileteredListByFav = showFavorite ? mediaList.filter((item) => item.is_favorite === 1) : mediaList;

    const fileteredListByTags = fileteredListByFav.filter((item) => {
      return item.filename.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase()) || 
            item.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLocaleLowerCase()));
    });

    let fileteredList = fileteredListByTags.filter((item) => {
      if (currentChannel === 'Discover') return true; 
      return currentChannel === 'All' || item.channel === currentChannel;
    });

    // Apply the correct sorting transformation
    if (sortOrder === 'a-z') {
      fileteredList.sort((a, b) => a.filename.localeCompare(b.filename));
    } else if (sortOrder === 'z-a') {
      fileteredList.sort((a, b) => b.filename.localeCompare(a.filename));
    } else if (sortOrder === 'newest') {
      fileteredList.reverse(); // Simply flips the naturally ordered database array
    }

    const activeItem= selectedIndex!==null? fileteredList[selectedIndex] : null;  

    useEffect(() => {
    // Only listen for keys if the lightbox is actually open
      if (selectedIndex === null || activePrompt !== null) return;

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
    }, [selectedIndex, fileteredList.length, activePrompt]);
        
        
  return (
    <main className="container">
      <h1>Local Gallery</h1>
      
      {/*The search bar and sort */}
      <div className='FavoriteCheck'>
        <input 
        type="text"
        placeholder='Search name or tag'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)} 
      />

      <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="sort-select">
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="a-z">Alphabetical (A-Z)</option>
        <option value="z-a">Alphabetical (Z-A)</option>
      </select>
        <button onClick={() => setShowFavorite(!showFavorite)}>
          {showFavorite ? " Show All Images" : "★ Show Favorites"}
        </button>
        <input 
          type="text"
          placeholder='Search name or tag'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
        <input 
          type="file" 
          accept="image/*,video/mp4" 
          onChange={UploadHandler} 
        />

        <aside className='Channel-sidebar'>
          <h3>Channels</h3>
          <div className='Channel-list'>
            <button 
              onClick={() => setCurrentChannel('Discover')} 
              className={currentChannel === 'Discover' ? 'channel-btn active' : 'channel-btn'}
            >
              🎲 Discover
            </button>
            {channelsList.map((item) => {
              // Calculate how many items belong to this specific channel
              const count = item === 'All' 
                ? mediaList.length 
                : mediaList.filter(media => media.channel === item).length;

              return (
                <button 
                  key={item} 
                  onClick={() => setCurrentChannel(item)} 
                  className={currentChannel === item ? 'channel-btn active' : 'channel-btn'}
                >
                  <span className="channel-name">{item}</span>
                  <span className="channel-count">{count}</span>
                </button>
              )
            })}
          </div>

          <button onClick={()=>setActivePrompt('channel')} className="add-channel-btn">+ Add Channel</button>

          <button onClick={()=>setActivePrompt('download')} style={{ marginTop: '10px' }} className="add-channel-btn">Download Link</button>
        </aside>
      </div>

      {/* Conditionally render Welcome Screen OR the Image Grid */}
      {currentChannel === 'Discover' ? (
        <div style={{ textAlign: 'center', marginTop: '20vh', color: '#a1a1aa' }}>
          <h2>Welcome to Local Gallery</h2>
          <p>Select a channel from the left sidebar to start browsing.</p>
        </div>
      ) : (
        <div className='IF'>
          {fileteredList.map((item, index) => {
            return (
              <div onClick={() => setSelectedIndex(index)} key={item.filename} className='Unifile'>
                {item.filename.endsWith('.mp4') === false ? 
                  <img src={item.url} /> : <video src={item.url} controls />
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
      )}

      

      {/* Lightbox Overlay */}
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
              {channelsList.map((item) => {
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
                    <button className="remove-tag-btn" onClick={() => RemoveTag(activeItem.filename, activeItem.tags, Itag)}>x</button>
                  </span>
                ))}
              </div>
              <button onClick={()=>setActivePrompt('tag')}>+ Add Tag</button>
            </div>
          </div>
        </div>
      )}

      {/*Active prompt overlay */}
      {activePrompt && (
        <div className="lightbox-overlay">
          <div className="prompt-box" style={{ background: '#18181b', padding: '20px', borderRadius: '8px' }}>
            <h3>Enter {activePrompt}</h3>
            
            <input 
              type="text" 
              value={promptText} 
              onChange={(e) => setPromptText(e.target.value)} 
            />
            
            <button onClick={PromptSubmitHandler}>Submit</button>
            <button onClick={() => { setActivePrompt(null); setPromptText(''); }}>Cancel</button>
          </div>
        </div>
      )}
    </main>
  );
}
export default App
