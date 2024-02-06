import axios from 'axios';
import {useState} from 'react';
import './styles.css';
import logo from './public/images/logo.png'

const App = () => {
  const [diamonds, setDiamonds] = useState([])
  
  const API_URL = 'https://intg-customer-staging.nivodaapi.net/api/diamonds';
  // For production, the API_URL is 'https://integrations.nivoda.net/api/diamonds';
  
  let authenticate_query = `{
    authenticate { 
      username_and_password(username: "testaccount@sample.com", password: "staging-nivoda-22") {
        token
      }
    }
  }
  `;
  
  (async function() {
    try {
      let authenticate_result = await axios.post(API_URL, {
        query: authenticate_query
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      const authenticationData = authenticate_result.data.data.authenticate.username_and_password;

  
      if (!authenticationData || !authenticationData.token) {
        throw new Error('Authentication failed. Token not received.');
      }
  
      let { token } = authenticationData;

  
      let diamond_query = `
        query {
          diamonds_by_query(
            query: {
              labgrown: false,
              shapes: ["ROUND", "OVAL", "PRINCESS", "EMERALD", "CUSHION", "MARQUISE", "RADIANT" ],
              sizes: [{ from: 0.5, to: 20 }],
              has_v360: true,
              has_image: true,
              color: [D, E],
            },
            offset: 0,
            limit: 50,
            order: { type: price, direction: ASC }
          ) {
            items {
              id
              diamond {
                id
                video
                image
                availability
                supplierStockId
                brown
                green
                milky
                eyeClean
                mine_of_origin
                certificate {
                  id
                  lab
                  shape
                  certNumber
                  cut
                  carats
                  clarity
                  polish
                  symmetry
                  color
                  width
                  length
                  depth
                  girdle
                  floInt
                  floCol
                  depthPercentage
                  table
                }
              }
              price
              discount
            }
            total_count
          }
        }
      `;

  
    try {
      let result = await axios.post(API_URL, {
        query: diamond_query
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      setDiamonds(result.data.data.diamonds_by_query.items)
    } catch (error) {
      console.error('Error:', error.response.data)
    }

    } catch (error) {
      console.error('An error occurred:', error.message);
    }
  })();

  let filteredDiamonds = diamonds.filter(diamond => diamond.diamond.video !== null)

  console.log(filteredDiamonds)
  
  return (
    <div>
      <header>
        <img src={logo} alt="Culture Diamonds logo" width={150}/>
        <h1>Culture Diamonds</h1>
      </header>
      <main>

      
        <div className='diamond-grid'>
        {filteredDiamonds.map(diamond => {
          let cert = diamond.diamond.certificate
          let video = diamond.diamond.video.replace('500/500', '300/300')

          function convertToTitleCase(inputString) {
            return inputString.charAt(0).toUpperCase() + inputString.slice(1).toLowerCase();
          }

          let measurement
          let length = Number(cert.length).toFixed(2)
          let width = Number(cert.width).toFixed(2)
          let depth = Number(cert.depth).toFixed(2)
          let depthPercentage = Number(cert.depthPercentage).toFixed(2)
          let table = Number(cert.table)

          if (convertToTitleCase(cert.shape) === 'Round') {
            measurement = `${length} - ${width} x ${depth}`
          } else {
            measurement = `${length} x ${width} x ${depth}`
          }

          return(
            <div className='diamond-card' key={cert.certNumber}>
              <iframe src={video} width={300} height={300}></iframe>
            
            <ul>
              <li>{cert.lab}: {cert.certNumber}</li>
            </ul>
            <h2>{convertToTitleCase(cert.shape)} {cert.carats}ct {cert.color} {cert.clarity} {cert.cut} {cert.polish} {cert.symmetry} </h2>
            <hr />
            <ul>
              <li label="Table">T:{table}%</li>
              <li>D:{depthPercentage}%</li>
              <li>R:{(length/width).toFixed(2)}</li>
              <li>M:{measurement}</li>
            </ul>
          </div>
          )
          
        })}
        </div>
        </main>
    </div>
    
  )
}

export default App