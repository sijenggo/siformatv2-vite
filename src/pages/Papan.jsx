import React from "react"; 
import { ambil_data, formattedDate } from "./control/services";
import { useQuery } from "@tanstack/react-query";
import { Col, Container, Row} from "react-bootstrap";
import AutoScrollTable from "./control/autoscroll";
import { useState } from "react";

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


const Papan = () =>{
    const [nomorAntrian, setNomorAntrian] = useState('-');
    const [ket, setKet] = useState('-');
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

    const handleOnEnd = () => {
        console.log("End");
    }

    const handleOnStart = (nomor_antrian, ket) =>{
        setNomorAntrian(nomor_antrian);
        setKet(ket);
    }

    return(
        <>
            <div className='limiter'>
                <div className="bg-container">
                    <div className="main-container p-1">
                        <div className="h-70">
                            <Container fluid className="h-100 p-0">
                                <Row className="h-100 py-2">
                                    <Col md={3} className="h-100">
                                        <div className="main-display d-flex flex-column justify-content-evenly align-items-center p-1 h-100">
                                            <h1 className="text-center">Antrian PTSP Pengadilan Negeri Banyumas</h1>
                                            <h1 className="fs-big">{nomorAntrian}</h1>
                                            <h4>{ket}</h4>
                                        </div>
                                    </Col>
                                    <Col md={9} className="h-100">
                                        <div className="main-display d-flex flex-column justify-content-evenly align-items-center p-1 h-100">
                                            b
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