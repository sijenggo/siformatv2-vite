import React, { useRef, useEffect, useContext } from "react"; 
import { ambil_data, formattedDate } from "./control/services";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
      `
        SELECT 
            * 
        FROM 
            tmp_antrian 
        LEFT JOIN 
            sys_loket 
        ON 
            tmp_antrian.id_loket = sys_loket.id_loket 
        WHERE 
            tmp_antrian.id_loket = ${id_loket} 
        AND 
            DATE(tmp_antrian.waktu) = '${date}'`
    );
};

const Papan = () =>{
    const [isPlaying, setIsPlaying] = useState(true);
    const [volume, setVolume] = useState(0.8);
    const [nomorAntrian, setNomorAntrian] = useState('-');
    const [ket, setKet] = useState('-');
    const [updateTrigger, setUpdateTrigger] = useState(0);
    const buser = useRef([]);

    const queryClient = useQueryClient();

    const { ws, setMessageHandler } = useContext(WebSocketContext);

    useEffect(() => {
        setMessageHandler((data) => {
            if (data.type === "cetak") {
                CetakAntrian(data.nomor_antrian, data.ket);
                refetchAllAntrian();
                //console.log(data.nomor_antrian, data.ket);
            }else if(data.type === "panggil"){
                handlePanggil(data.id);
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

    const refetchAllAntrian = () => {
        [2, 3, 4, 5, 6].forEach((id) => queryClient.invalidateQueries(["antrian", id]));
    };

    const handleOnStart = (id, nomor_antrian, ket) => {
        buser.current = [...buser.current, { id, nomor_antrian, ket }];
        
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
            kirimPanggil(buser.current[0].id);
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

    const kirimPanggil = (id) => {
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify({ type: 'update_panggil', id: id, status: false }));
		}else{
			console.error('Error gagal kirim status antrian');
		}
    };

    const handlePanggil = (id) => {
        const button = document.getElementById(id);
        if (button) {
            button.click();
        } else {
            console.error(`Button with id ${id} not found`);
        }
    };

    const CetakAntrian = (nomorAntrian, ketAntrian) => {   
        return new Promise((resolve, reject) => {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            
            iframeDocument.write(`
              <html>
                <head>
                  <title>Cetak</title>
                  <style>
                    @page {
                      size: 5.8cm 9cm;
                      margin: 0;
                    }
                    body {
                      margin: 0;
                      padding: 0;
                      text-align: center;
                      font-family: Arial, sans-serif;
                    }
                    .container {
                      width: 58mm;
                      height: 90mm;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      flex-direction: column;
                    }
                    .nomor {
                      font-size: 60px;
                      padding: 20px 0;
                    }
                    .title {
                      font-size: 23px;
                      padding-top: 18px;
                    }
                    .subtitle {
                      font-size: 16px;
                    }
                    .info {
                      font-size: 12px;
                    }
                    .footer {
                      font-size: 11px;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="title">Layanan Antrian</div>
                    <div class="subtitle">Pengadilan Negeri Banyumas</div>
                    <div class="info">Jalan Pramuka No.9 Sudagaran Banyumas</div>
                    <div class="nomor">${nomorAntrian || '-'}</div>
                    <div class="info">${ketAntrian || '-'}</div>
                    <div class="footer">Silahkan menunggu panggilan di ruang tunggu yang disediakan</div>
                  </div>
                </body>
              </html>
            `);
    
            iframeDocument.close();
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            document.body.removeChild(iframe);
            resolve();
        });
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
        </>
    )
}

export default Papan;