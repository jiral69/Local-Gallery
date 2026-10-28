import { useState, useEffect} from 'react'
import './App.css'

function App() {

  const [mediaList , setMediaList]=useState([]);

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
   
  return(
    <div>
      <h1>Test Header</h1>
      <div className='IF'>
        {mediaList.map((item) =>{
          return(
            <div key={item.filename} className='Unifile'>
              <img src={item.url} width={200} />
              <p>{item.filename}</p>
            </div>
          )
        })}
      </div>
    </div>
  );

 
}
export default App
