import React, { useState } from "react";
import { ambil_data } from "./control/services";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "react-bootstrap";

const fetchLoketData = async () => {
    return await ambil_data(
      "SELECT * FROM sys_loket ORDER BY CASE WHEN id_loket = (SELECT MAX(id_loket) FROM sys_loket) THEN 1 ELSE 1 END, id_loket DESC"
    );
};
  
const fetchConfigData = async () => {
    return await ambil_data("SELECT * FROM sys_config");
};

const RenderBeranda = ({}) => {
    const[showKep, setShowKep] = useState(null);
    const { 
        data: loket = [], 
        isLoading: isLoadingLoket, 
        error: errorLoket
    } = useQuery({queryKey: ["loket"], queryFn: fetchLoketData});

    
    if (isLoadingLoket){
        return(
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        )
    }

    if (errorLoket) return <div>Error fetching loket data: {errorLoket.message}</div>;

    const handleFigureClick = (item) => {
        setShowKep(true);
    };

    const handleKembali = () =>{
        setShowKep(false);
    }

    if (showKep) {
        return (
            <div className="w-100">
                <div className="display-tombol-kep">
                    {kep.map((item, index) => (
                        <div key={index} className="m-2">
                            {item.keperluan !== 'lainlain' ? (
                                <div>
                                    <button className="button-kep">
                                        <span>
                                            {item.keperluan}
                                        </span>
                                        <svg style={{ '--btn-color': `${warna}` }} viewBox="-5 -5 110 110" preserveAspectRatio="none" aria-hidden="true">
                                            <path d="M0,0 C0,0 100,0 100,0 C100,0 100,100 100,100 C100,100 0,100 0,100 C0,100 0,0 0,0" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="form-group">
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control form-control-lg fonts-19" aria-describedby="button-addon2" placeholder="Keperluan Lain .." />
                                        <div className="input-group-append">
                                            <button disabled={!keperluanlain.trim()} className="btn btn-lg btn-secondary fonts-19" type="button" id="button-addon2">Pilih</button>
                                        </div>
                                    </div>
                                </div>
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
      </div>
    );
};

const RenderConfig = () =>{
    const { data: config = [], isLoading: isLoadingConfig, error: errorConfig} = useQuery({queryKey: ["config"], queryFn: fetchConfigData});
    
    if (isLoadingConfig){
        return(
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        )
    }

    if (errorConfig) return <div>Error fetching config data: {errorConfig.message}</div>;
    return config[0].nama_satker;
}

const Home = () =>{
    return(
        <>
            <div className="limiter">
				<div className="background-container">
					<div className="wrap">
						<div className="container h-100 display-container">
							<div className="row text-center h-auto">
								<div className="col judul">
									<h1><RenderConfig /></h1>
								</div>
							</div>
							<div className="row text-center mb-3 h-auto">
								<div className="col">
									<h3>Silahkan Ambil Antrian Anda ..</h3>
								</div>
							</div>
						</div>
						<div className="container">
                            <RenderBeranda />
						</div>
					</div>
				</div>
			</div>
        </>
    )
}

export default Home;