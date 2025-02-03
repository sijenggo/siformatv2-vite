import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Nav, Table, Spinner, Alert, Button } from 'react-bootstrap';
import { ambil_data, hapus_data, formattedDate, formattedDateLocale } from './control/services';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
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
            id_antrian,
            tmp_antrian.id_loket,
            nomor_antrian AS 'Nomor Antrian',
            CASE
                WHEN sys_keperluan.keperluan = 'lainlain' THEN keperluan_lain
                ELSE sys_keperluan.keperluan
            END AS 'Keperluan',
            nama AS 'Nama',
            waktu AS 'Waktu Daftar',
            status_panggil AS 'Aksi'
        FROM 
            tmp_antrian 
        LEFT JOIN 
            sys_loket ON tmp_antrian.id_loket = sys_loket.id_loket
        LEFT JOIN
            sys_keperluan ON tmp_antrian.id_keperluan = sys_keperluan.id_keperluan
        WHERE 
            tmp_antrian.id_loket = ${id_loket}
        AND
            DATE(waktu) = '${date}'`
    );
};

const Admin = () =>{
    const [activeTab, setActiveTab] = useState(5);
    const [activeId, setActiveId] = useState([]);

    const showNotification = () => {
        if (Notification.permission === "granted") {
        new Notification("Notifikasi SIFORMAT", {
            body: "Ada antrian baru di PTSP!",
            icon: "/logo192.png",
        });
        } else {
        Notification.requestPermission().then((perm) => {
            if (perm === "granted") showNotification();
        });
        }
    };

    const queryClient = useQueryClient();

    const {
        data: antrian =[],
        isLoading: loadingAntrian,
        isError: errorAntrian,
    } = useQuery({
        queryKey: ["antrian", activeTab],
        queryFn: () => fetchAntrian(activeTab),
        enabled: !!activeTab && activeTab !== 1,
    });

    const refretchAntrian = () => {
        queryClient.invalidateQueries(["antrian", activeTab]);
    }


    const { ws, setMessageHandler } = useContext(WebSocketContext);

    useEffect(() => {
        setMessageHandler((data) => {
            if (data.type === "update_panggil") {
                setActiveId((prev) => ({
                    ...prev,
                    [data.id]: data.status,
                }));
            }else if (data.type === "update_status") {
                console.log(data.type)
                /*if(data.id_loket == activeTab){
                    refretchAntrian();
                    showNotification();
                }*/
            }
        });

        return () => setMessageHandler(null);
    }, [setMessageHandler]);

    const kirimPanggil = (id) => {
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify({ type: 'panggil', id: id }));
		}else{
			console.error('Error gagal kirim status antrian');
		}
        
    }

    const handlePanggil = (id) => {
        setActiveId((prev) => ({
            ...prev,
            [id]: true,
        }));
        kirimPanggil(id);
    };

    const handleDelete = (id) => {
        Swal.fire({
            icon: "warning",
            title: "Yakin anda akan menghapus ini?",
            showCancelButton: true,
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Hapus",
            confirmButtonColor: "#dc3545",
          }).then(async(result) => {
            if (result.isConfirmed) {
                try {
                    const result = await hapus_data("tmp_antrian", { 'id_antrian': id });
                    if (result.success) {
                        Swal.fire("Berhasil menghapus!", "", "success").then(() => {
                            refretchAntrian();
                        });
                    } else {
                        Swal.fire("Gagal menghapus!", "", "error");
                    }
                } catch (error) {
                    console.error("Error deleting data:", error);
                    Swal.fire("Gagal menghapus!", "", "error");
                }
            }
        });
    }

    const handleReset = async() => {
        Swal.fire({
            icon: "warning",
            title: "Yakin anda akan menghapus seluruh antrian hari ini?",
            showCancelButton: true,
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Hapus",
            confirmButtonColor: "#dc3545",
          }).then(async(result) => {
            if (result.isConfirmed) {
                try {
                    let today = new Date();
                    let date = today.toISOString().split("T")[0];

                    const antrianHariIni = antrian.filter(item =>
                        item.id_loket == activeTab && item["Waktu Daftar"].slice(0, 10) === date
                    );
            
                    if (antrianHariIni.length === 0) {
                        Swal.fire("Tidak ada antrian yang perlu dihapus hari ini.", "", "question");
                        return;
                    }
            
                    for (const item of antrianHariIni) {
                        // console.log("Menghapus antrian:", item);
                        await hapus_data("tmp_antrian", { id_antrian: item.id_antrian });
                    }
            
                    Swal.fire("Berhasil menghapus!", "", "success").then(() => {
                        refretchAntrian();
                    });
                } catch (error) {
                    console.error("Gagal menghapus antrian:", error);
                    Swal.fire("Gagal menghapus!", "", "error");
                }
            }
        });
    }

    return(
        <>
            <div className='limiter'>
                <div className="bg-container">
                    <div className="main-container p-1">
                        <Container fluid className="h-100 p-0">
                            <Row className="flex-column justify-content-center align-items-center h-100 py-2">
                                <Col md={12} className="h-90 w-90">
                                    <div className="main-display d-flex flex-column align-items-center px-1 py-4 h-100">
                                        <Row>
                                            <Col>
                                                <h3 className="text-center px-2"><b>Antrian PTSP Pengadilan Negeri Banyumas</b></h3>
                                            </Col>
                                        </Row>
                                        <Row className='w-100 mt-2'>
                                            <Col>
                                                <Nav fill variant="tabs" defaultActiveKey={activeTab} onSelect={(selectedKey) => setActiveTab(selectedKey)}>
                                                    <Nav.Item>
                                                        <Nav.Link eventKey={5}>
                                                            Umum
                                                        </Nav.Link>
                                                    </Nav.Item>
                                                    <Nav.Item>
                                                        <Nav.Link eventKey={4}>Hukum</Nav.Link>
                                                    </Nav.Item>
                                                    <Nav.Item>
                                                        <Nav.Link eventKey={3}>Pidana</Nav.Link>
                                                    </Nav.Item>
                                                    <Nav.Item>
                                                        <Nav.Link eventKey={2}>Perdata</Nav.Link>
                                                    </Nav.Item>
                                                    <Nav.Item>
                                                        <Nav.Link eventKey={6}>E-Court</Nav.Link>
                                                    </Nav.Item>
                                                </Nav>
                                            </Col>
                                        </Row>
                                        <Row className="h-100 w-100">
                                            <Col className="h-100 d-flex flex-column">
                                                {loadingAntrian ? (
                                                    <div className="bg-putih-radius p-2 d-flex flex-column justify-content-center align-items-center">
                                                        <Spinner animation="border" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </Spinner>
                                                    </div>
                                                ) : errorAntrian ? (
                                                    <div className="bg-putih-radius p-1 d-flex flex-column justify-content-center align-items-center">
                                                        <Alert className="m-0 w-100" variant="danger">Error fetching data: {errorAntrian.message}</Alert>
                                                    </div>
                                                ) : antrian.length > 0 ? (
                                                    <div className="main-content">
                                                        <div className='hide-scroll' style={{ overflowY: "scroll", maxHeight: "55vh" }}>
                                                            <Table className="mb-1" striped bordered hover>
                                                                <thead className="text-wrap text-center align-middle">
                                                                    <tr>
                                                                    <th>No.</th>
                                                                    {Object.keys(antrian[0])
                                                                        .filter((key) => key !== "id_antrian" && key !== 'id_loket') // Hindari key "id_antrian"
                                                                        .map((key) => (
                                                                            <th key={key}>{key}</th>
                                                                    ))}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {antrian.map((item, index) => (
                                                                        <tr key={item.id_antrian}>
                                                                            <td>{index + 1}</td>
                                                                            <td>{item["Nomor Antrian"]}</td>
                                                                            <td>{item["Keperluan"]}</td>
                                                                            <td>{item["Nama"]}</td>
                                                                            <td>{formattedDateLocale(item["Waktu Daftar"])}</td>
                                                                            <td className="text-center">
                                                                                <Button
                                                                                    className="mx-2"
                                                                                    variant={activeId[item.id_antrian] ? "success" : "primary"}
                                                                                    size="sm"
                                                                                    onClick={() => handlePanggil(item.id_antrian)}
                                                                                >
                                                                                    <i className={`fa-solid ${activeId[item.id_antrian] ? "fa-spinner fa-spin fa-lg" : "fa-circle-play fa-lg"}`}></i>
                                                                                </Button>
                                                                                <Button 
                                                                                    variant="danger"
                                                                                    size="sm"
                                                                                    onClick={() => handleDelete(item.id_antrian)}
                                                                                >
                                                                                    <i className="fa-solid fa-trash fa-lg"></i>
                                                                                </Button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </Table>
                                                        </div>
                                                        <div className="w-100 pt-1 d-flex flex-row justify-content-end">
                                                            <Button variant="warning" onClick={() => handleReset()}>
                                                                <b className="text-black">Reset</b>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="bg-putih-radius p-1 d-flex flex-column justify-content-center align-items-center">
                                                        <Alert className="m-0 w-100" variant="info">Tidak ada antrian</Alert>
                                                    </div>
                                                )}
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Admin;