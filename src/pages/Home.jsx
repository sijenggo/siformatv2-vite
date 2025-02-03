import React, { useEffect, useState, useRef } from "react";
import { ambil_data, modalGeneral as ModalGeneral } from "./control/services";
import { useQuery } from "@tanstack/react-query";
import { Spinner, Button, InputGroup, Form } from "react-bootstrap";
import SelectJabatan from "./control/pejabat";
import AntrianPtsp from "./control/antrian";

const fetchLoketData = async () => {
    return await ambil_data(
      "SELECT * FROM sys_loket ORDER BY CASE WHEN id_loket = (SELECT MAX(id_loket) FROM sys_loket) THEN 1 ELSE 1 END, id_loket DESC"
    );
};
  
const fetchConfigData = async () => {
    return await ambil_data("SELECT * FROM sys_config");
};

const fetchKepData = async (id_loket) => {
    return await ambil_data(
      `SELECT * FROM sys_keperluan WHERE id_loket = ${id_loket}`
    );
};

const RenderBeranda = ({bukaModal, tutupModal}) => {
    const [showKep, setShowKep] = useState(false);
    const [selectedLoket, setSelectedLoket] = useState(null);
	const [warna, setWarna] = useState('blue');
	const [keperluanlain, setkeperluanlain] = useState('');
    const config = JSON.parse(localStorage.getItem('config'));
    const ws  = useRef(null);

    useEffect(() => {
        if(ws.current === null){
            ws.current = new WebSocket("ws://192.168.3.7:93");
            ws.current.onopen = () => console.log("Connected to WebSocket");
            ws.current.onclose = () => console.log("WebSocket Disconnected");
        }
    }, []);

    const { 
        data: loket = [], 
        isLoading: isLoadingLoket, 
        error: errorLoket
    } = useQuery({queryKey: ["loket"], queryFn: fetchLoketData});

    const {
        data: kep = [],
        isLoading: isLoadingKep,
        error: errorKep,
    } = useQuery({
        queryKey: ["kep", selectedLoket],
        queryFn: () => fetchKepData(selectedLoket),
        enabled: !!selectedLoket && selectedLoket !== 'tamu',
    });

    const handleFigureClick = (id_loket, id_warna, id_kode) => {
		if (id_loket != 1) {
            setSelectedLoket(id_loket);
			setShowKep(true);
			setWarna(id_warna);
            setkeperluanlain('');
		} else {
            setSelectedLoket('tamu');
            setShowKep(false);
            KunjunganTamu();
		}
    };

    const handleKembali = () =>{
        setShowKep(false);
    }

    const closeModal = () =>{
        setSelectedLoket(null);
        setShowKep(false);
        tutupModal();
    }

    const handleInputChange = (event) => {
		setkeperluanlain(event.target.value);
	};

    const KunjunganTamu = () =>{
        let header = `Kunjungan Tamu ke ${config.nama_satker}`
        let body = <SelectJabatan ptspplus={config.ptspplus} onHide={closeModal} />
        bukaModal(header, body);
    }

    const FormAntrianPtsp = (id_keperluan) =>{
        let header =`Antrian PTSP ${config.nama_satker}`
        let body = <AntrianPtsp ptspplus={config.ptspplus} onHide={closeModal} id_loket={selectedLoket} id_keperluan={id_keperluan} keperluanlain={keperluanlain} kirimCetak={kirimCetak} kirimUpdate={kirimUpdate} />
        bukaModal(header, body);
    }

    const kirimCetak = (nomor_antrian, ket) => {
		if (ws.current.readyState === WebSocket.OPEN) {
			ws.current.send(JSON.stringify({ type: 'cetak', nomor_antrian: nomor_antrian, ket: ket }));
		}else{
			console.error('Error gagal kirim status antrian');
		}
    }

    const kirimUpdate = (id) => {
		if (ws.current.readyState === WebSocket.OPEN) {
			ws.current.send(JSON.stringify({ type: 'update_status', id: id }));
		}else{
			console.error('Error gagal kirim status antrian');
		}
    }

    if (isLoadingLoket){
        return(
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        )
    }

    if (errorLoket) return <div>Error fetching loket data: {errorLoket.message}</div>;

    if (showKep) {
        return (
            <div className="w-100">
                <div className="display-tombol-kep">
                    {kep.map((item, index) => (
                        <div key={index} className="m-2">
                            {item.keperluan !== 'lainlain' ? (
                                <div>
                                    <button onClick={() => FormAntrianPtsp(item.id_keperluan)} className="button-kep">
                                        <span>
                                            {item.keperluan}
                                        </span>
                                        <svg style={{ '--btn-color': `${warna}` }} viewBox="-5 -5 110 110" preserveAspectRatio="none" aria-hidden="true">
                                            <path d="M0,0 C0,0 100,0 100,0 C100,0 100,100 100,100 C100,100 0,100 0,100 C0,100 0,0 0,0" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <InputGroup className="mb-3">
                                        <Form.Control
                                            placeholder="Keperluan Lain .."
                                            size="lg"
                                            value={keperluanlain} 
                                            onChange={handleInputChange}
                                        />
                                        <Button onClick={() => FormAntrianPtsp(item.id_keperluan)} disabled={!keperluanlain.trim()} variant="secondary" size="lg">
                                            Pilih
                                        </Button>
                                    </InputGroup>
                                </>
                            )}
                        </div>
                    ))}
                </div>
                <div>
                    <div className="display-tombol">
                        <div className="m-2">
                            <div onClick={() => handleKembali()} className="btn btn-lg btn-info text-white">
                                Kembali
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
      <div className="display-tombol">
        {loket.map((item, index) => (
          <div key={index} className="m-2" onClick={() => handleFigureClick(item.id_loket, item.warna, item.kode)}>
            <figure 
              className="card card--1" 
              style={{ backgroundImage: `url(${new URL(`../assets/images/${item.img_btn}`, import.meta.url)})` }}
            >
              <figcaption>
                <span className="info">
                  <h3>{item.ket}</h3>
                  <span><i className="fa-regular fa-circle-down"></i> Pilih</span>
                </span>
              </figcaption>
            </figure>
          </div>
        ))}
        { /* <Button onClick={() => kirimUpdate(6)} variant="secondary" size="lg">Kirim</Button> */ }
      </div>
    );
};

const RenderConfig = () => {
    const { data: config = [] } = useQuery({
      queryKey: ["config"],
      queryFn: fetchConfigData,
    });
  
    useEffect(() => {
      if (config.length > 0) {
        localStorage.setItem('config', JSON.stringify(config[0]));
      }
    }, [config]);
  
    return null;
};

const Home = () => {
    const [namaSatker, setNamaSatker] = useState('');
	const [showModal, setShowModal] = useState(false);
    const [itemHeader, setItemHeader] = useState('');
    const [itemBody, setItemBody] = useState(null);
  
    useEffect(() => {
        const updateConfig = () => {
            const storedConfig = localStorage.getItem('config');
            if (storedConfig) {
                const parsedConfig = JSON.parse(storedConfig);
                setNamaSatker(parsedConfig.nama_satker || '');
            }
        };
      
        updateConfig();
        window.addEventListener('storage', updateConfig);

        return () => {
            window.removeEventListener('storage', updateConfig);
        };
    }, []);

    const bukaModal = (judul, body) => {
        setItemHeader(judul);
        setItemBody(body);
        setShowModal(true);
    };

    const tutupModal = () =>{
        setShowModal(false);
        setItemHeader('');
        setItemBody(null);
    }
  
    return (
      <>
        <RenderConfig />
        <div className="limiter">
            <div className="background-container">
                <div className="wrap">
                    <div className="container h-100 display-container">
                        <div className="row text-center h-auto">
                            <div className="col judul">
                                <h1>{namaSatker ? `${namaSatker}` : 'Loading...'}</h1>
                            </div>
                        </div>
                        <div className="row text-center mb-3 h-auto">
                            <div className="col">
                                <h3>Silahkan Ambil Antrian Anda ..</h3>
                            </div>
                        </div>
                    </div>
                    <div className="container">
                        <RenderBeranda bukaModal={bukaModal} tutupModal={tutupModal} />
                        <ModalGeneral
                            show={showModal}
                            onHide={tutupModal}
                            itemJudul={itemHeader}
                            itemBody={itemBody}
                        />
                    </div>
                </div>
            </div>
        </div>
    </>
    )
}

export default Home;