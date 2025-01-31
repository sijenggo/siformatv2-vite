import React, { useRef, useEffect, useContext } from "react"; 
import { ambil_data, formattedDate } from "./control/services";
import { useQuery } from "@tanstack/react-query";
import { Col, Container, Row} from "react-bootstrap";
import AutoScrollTable from "./control/autoscroll";
import { useState } from "react";
import ReactPlayer from "react-player";
import { WebSocketContext } from "../main";

const fetchAntrian = async (id_loket) => {
    let today = new Date();
    /*let dite = new Date();
    let today = new Date(dite);
    today.setDate(dite.getDate() - 1);*/
    let date = formattedDate(today);
    return await ambil_data(
      `SELECT * FROM tmp_antrian LEFT JOIN sys_loket ON tmp_antrian.id_loket = sys_loket.id_loket ORDER BY id_antrian DESC`
    );
};

const RenderCetak = ({nomor_antrian, ket}) =>{
    return(
        <div id="cetakIni" className="hide-this" style={{ width: '58mm', height: '90mm' }}>
          <div className="container">
              <div className="row">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <table style={{ textAlign: 'center', fontSize: '16px' }}>
                          <thead>
                              <tr style={{ fontSize: '23px' }}>
                                  <td style={{ padding: '18px 0 0 0' }}>Layanan Antrian</td>
                              </tr>
                              <tr style={{ fontSize: '16px' }}>
                                  <td>Pengadilan Negeri Banyumas</td>
                              </tr>
                              <tr style={{ fontSize: '12px' }}>
                                  <td>Jalan Pramuka No.9 Sudagaran Banyumas</td>
                              </tr>
                          </thead>
                          <tbody>
                              <tr style={{ fontSize: '60px' }}>
                                  <th style={{ padding: '20px 0 20px 0' }}>{nomor_antrian}</th>
                              </tr>
                              <tr style={{ fontSize: '12px' }}>
                                  <td>{ket}</td>
                              </tr>
                          </tbody>
                          <tfoot>
                              <tr style={{ fontSize: '11px' }}>
                                  <td>Silahkan menunggu panggilan di ruang tunggu yang disediakan</td>
                              </tr>
                          </tfoot>
                      </table>
                  </div>
              </div>
          </div>
      </div>
    );
};


const Papan = () =>{
    const [isPlaying, setIsPlaying] = useState(true);
    const [volume, setVolume] = useState(0.8);
    const [nomorAntrian, setNomorAntrian] = useState('-');
    const [ket, setKet] = useState('-');
    const [updateTrigger, setUpdateTrigger] = useState(0);
    const buser = useRef([]);
    
    const [cetaknomorAntrian, setcetakNomorAntrian] = useState('-');
    const [cetakket, setcetakKet] = useState('-');

    const { ws, setMessageHandler } = useContext(WebSocketContext);

    useEffect(() => {
        setMessageHandler((data) => {
            if (data.type === "cetak") {
                console.log(data.id);
            }
        });

        return () => setMessageHandler(null);
    }, [setMessageHandler]);

    const { data: antrianPerdata = [], isLoading: loadingPerdata } = useQuery({
      queryKey: ["antrian", 2],
      queryFn: () => fetchAntrian(2),
    });
  
    const { data: antrianPidana = [], isLoading: loadingPidana } = useQuery({
      queryKey: ["antrian", 3],
      queryFn: () => fetchAntrian(3),
    });
  
    const { data: antrianHukum = [], isLoading: loadingHukum } = useQuery({
      queryKey: ["antrian", 4],
      queryFn: () => fetchAntrian(4),
    });
  
    const { data: antrianUmum = [], isLoading: loadingUmum } = useQuery({
      queryKey: ["antrian", 5],
      queryFn: () => fetchAntrian(5),
    });
  
    const { data: antrianEcourt = [], isLoading: loadingEcourt } = useQuery({
      queryKey: ["antrian", 6],
      queryFn: () => fetchAntrian(6),
    });

    const handleOnStart = (nomor_antrian, ket) => {
        buser.current = [...buser.current, { nomor_antrian, ket }];
        
        if (buser.current.length === 1) {
            setNomorAntrian(nomor_antrian);
            setKet(ket);
        }
        
        setUpdateTrigger(prev => prev + 1);

        if(isPlaying){
            setVolume(0.1);
        }
    };
    
    const handleOnEnd = () => {
        if (buser.current.length > 0) {
            console.log(buser.current[0]); //ini buat send ke api untuk panggilan selesei
            buser.current.shift();
    
            if (buser.current.length > 0) {
                setNomorAntrian(buser.current[0].nomor_antrian);
                setKet(buser.current[0].ket);
            } else {
                setVolume(0.8);
            }
    
            setUpdateTrigger(prev => prev + 1);
        }
    };

    return(
        <>
            <div className='limiter'>
                <div className="bg-container">
                    <div className="main-container p-1">
                        <div className="h-70">
                            <Container fluid className="h-100 p-0">
                                <Row className="h-100 py-2">
                                    <Col md={3} className="h-100">
                                        <div className="main-display d-flex flex-column justify-content-center align-items-center px-1 py-0 h-100">
                                            <h3 className="text-center px-2">Antrian PTSP</h3>
                                            <h5 className="text-center">Pengadilan Negeri Banyumas</h5>
                                            <h1 className="fs-big m-5">{nomorAntrian}</h1>
                                            <h5 className="text-center">{ket}</h5>
                                        </div>
                                    </Col>
                                    <Col md={9} className="h-100">
                                        <div className="main-display d-flex flex-column justify-content-evenly align-items-center p-1 h-100">
                                            <div className="red-box">
                                                <ReactPlayer 
                                                    url="/videos/video1.mp4" 
                                                    controls
                                                    playing = {isPlaying}
                                                    loop
                                                    volume= {volume}
                                                    width="100%" 
                                                    height="100%"
                                                />
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Container>
                        </div>
                        <div className="h-30">
                            <Container fluid className="h-100 p-0">
                                <Row className="h-100 py-2">
                                    <Col className="h-100">
                                        <div className="main-display p-1 h-100">
                                            <Container fluid className="h-100">
                                                <Row className="h-100 p-2">
                                                    <Col className="h-100 d-flex flex-column align-items-center">
                                                        <div>
                                                            <h5>Meja PTSP Perdata</h5>
                                                        </div>
                                                        <div className="main-content">
                                                            <AutoScrollTable antrian={antrianPerdata} loading={loadingPerdata} handleOnStart={handleOnStart} handleOnEnd={handleOnEnd} />
                                                        </div>
                                                    </Col>
                                                    <Col className="h-100 d-flex flex-column align-items-center">
                                                        <div>
                                                            <h5>Meja PTSP Pidana</h5>
                                                        </div>
                                                        <div className="main-content">
                                                            <AutoScrollTable antrian={antrianPidana} loading={loadingPidana} handleOnStart={handleOnStart} handleOnEnd={handleOnEnd} />
                                                        </div>
                                                    </Col>
                                                    <Col className="h-100 d-flex flex-column align-items-center">
                                                        <div>
                                                            <h5>Meja PTSP Hukum</h5>
                                                        </div>
                                                        <div className="main-content">
                                                            <AutoScrollTable antrian={antrianHukum} loading={loadingHukum} handleOnStart={handleOnStart} handleOnEnd={handleOnEnd} />
                                                        </div>
                                                    </Col>
                                                    <Col className="h-100 d-flex flex-column align-items-center">
                                                        <div>
                                                            <h5>Meja PTSP Umum</h5>
                                                        </div>
                                                        <div className="main-content">
                                                            <AutoScrollTable antrian={antrianUmum} loading={loadingUmum} handleOnStart={handleOnStart} handleOnEnd={handleOnEnd} />
                                                        </div>
                                                    </Col>
                                                    <Col className="h-100 d-flex flex-column align-items-center">
                                                        <div>
                                                            <h5>Meja PTSP <i>E - Court</i></h5>
                                                        </div>
                                                        <div className="main-content">
                                                            <AutoScrollTable antrian={antrianEcourt} loading={loadingEcourt} handleOnStart={handleOnStart} handleOnEnd={handleOnEnd} />
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Container>
                                        </div>
                                    </Col>
                                </Row>
                            </Container>
                        </div>
                    </div>
                </div>
            </div>
            <RenderCetak nomor_antrian={cetaknomorAntrian} ket={cetakket} />
        </>
    )
}

export default Papan;