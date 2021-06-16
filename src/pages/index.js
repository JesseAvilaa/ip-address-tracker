import { Container, SearchSection, MapContainer, SearchInfos } from "../styles/HomeStyles";
import Arrow from '../assets/icon-arrow.svg';
import dynamic from 'next/dynamic';
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import Head from "next/head";

const Map = dynamic(() => import("../components/Map"), { ssr: false });

export default function Home() {
  const [ipAddress, setIpAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResult] = useState({});

  const apiKey = process.env.NEXT_PUBLIC_API_KEY;

  useEffect(() => {
    async function getInitialData() {
      try {
        setLoading(true);

        const response = await fetch(`https://geo.ipify.org/api/v1?apiKey=${apiKey}`);
        const data = await response.json();
        
        if(response.status !== 200) throw new Error();

        setResult(data);
  
      } catch (err) {
        toast.error("Ocorreu um erro ao pesquisar seu IP!")
      } finally {
        setLoading(false);
      }
    }
    getInitialData();
  }, [])

  async function handleSubmit() {
    if(!ipAddress) return;

    try {
      setLoading(true);

      if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipAddress)) {  
        
        const response = await fetch(`https://geo.ipify.org/api/v1?apiKey=${apiKey}&ipAddress=${ipAddress}`);
        const data = await response.json();
        
        if(response.status !== 200) throw new Error();

        setResult(data);

      } else {

        const response = await fetch(`https://geo.ipify.org/api/v1?apiKey=${apiKey}&domain=${ipAddress}`);
        const data = await response.json();

        if(response.status !== 200) throw new Error();

        setResult(data);

      }

    } catch (err) {
      toast.error("Ocorreu um erro ao pesquisar este IP ou domínio! Por favor, tente novamente.")
    } finally {
      setLoading(false);
    }
  }
  
  const defaultPosition = [-23.550520, -46.633308]

  useEffect(() => {
    toast.warn("Desative o ADBlock para que o aplicativo funcione normalmente 😊🚀", {
      autoClose: '10000',
    })
  }, [])

  return (
    <Container>
      <Head>
        <title>IP Address Tracker - Encontre qualquer endereço IP ou domínio facilmente.</title>
      </Head>

      <SearchSection results={results.location}>
        <h2>IP Address Tracker</h2>

        <div>
          <input
            type="text"
            placeholder="Pesquise qualquer endereço IP ou domínio"
            value={ipAddress}
            onChange={({target}) => setIpAddress(target.value)}
          />
          <button disabled={!!loading} onClick={handleSubmit}>{loading ? <Loader /> : <Arrow />}</button>
        </div>

        {results?.location && (
          <SearchInfos>
            <ul>
              <li>
                <div>
                  <strong>Endereço de IP</strong>
                  <p>{results.ip}</p>
                </div>
              </li>
              <li>
                <div>
                  <strong>Localização</strong>
                  <p>{`${results.location.city}, ${results.location.country}`}<br />{results.location.region}</p>
                </div>
              </li>
              <li>
                <div>
                  <strong>Timezone</strong>
                  <p>UTC {results.location.timezone}</p>
                </div>
              </li>
              <li>
                <div>
                  <strong>ISP</strong>
                  <p>{results.isp}</p>
                </div>
              </li>
            </ul>
          </SearchInfos>
        )}

      </SearchSection>

      <MapContainer loading={loading} >
        <Map defaultPosition={defaultPosition} location={results.location ? [results.location.lat, results.location.lng] : defaultPosition}/>
      </MapContainer>
    </Container>
  )
}
