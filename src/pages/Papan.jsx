import React, { useEffect, useState } from "react"; 
import { ambil_data, formattedDate } from "./control/services";
import { useQuery } from "@tanstack/react-query";
import { Col, Container, Row, Button, Table, Modal } from "react-bootstrap";

const fetchAntrian = async (id_loket) => {
    //let today = new Date();
    let dite = new Date();
    let today = new Date(dite);
    today.setDate(dite.getDate() - 1);
    let date = formattedDate(today);
    return await ambil_data(
      `SELECT * FROM tmp_antrian WHERE DATE(waktu) = '${date}' ORDER BY id_antrian DESC`
    );
};

const Papan = () =>{
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
                                            <h1 className="fs-big">A - 2</h1>
                                            <h4>PTSP Perdata</h4>
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
                                                <Row className="h-100">
                                                    <Col className="h-100">
                                                        <h5>Meja PTSP Perdata</h5>
                                                        <div className="main-content">
                                                            {loadingPerdata ? (
                                                                <p>Loading data Perdata...</p>
                                                            ) : antrianPerdata.length > 0 ? (
                                                                <Table borderless hover size="sm" responsive='sm' className="fs-small">
                                                                    <tbody>
                                                                    {antrianPerdata.map((item) => (
                                                                        <tr key={item.id_antrian}>
                                                                        <td>{item.nama}</td>
                                                                        </tr>
                                                                    ))}
                                                                    </tbody>
                                                                </Table>
                                                                
                                                            ) : (
                                                                <p>Tidak ada antrian.</p>
                                                            )}
                                                        </div>
                                                    </Col>
                                                    <Col>2</Col>
                                                    <Col>3</Col>
                                                    <Col>4</Col>
                                                    <Col>5</Col>
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