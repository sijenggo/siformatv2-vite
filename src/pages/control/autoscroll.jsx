import React, { useEffect, useRef } from "react";
import { animateScroll as scroll } from "react-scroll";
import { Table, Button } from "react-bootstrap";
import jingle from "../../assets/audios/jingle.mp3";
import { prepText } from "./services";
import { useSpeech, useQueue } from "react-text-to-speech";

const ItemPanggil = ({id, id_loket, nomor_antrian, onSpeechEnd }) => {
    const playjingle = useRef(new Audio(jingle)); // Gunakan useRef untuk menghindari reinitiasi
    let teks = prepText(id_loket, nomor_antrian);
    const {speechStatus, isInQueue, start, stop } = useSpeech({
        text: teks,
        autoPlay: false,
        preserveUtteranceQueue: true,
        volume: 1,
        voiceURI: "Google Bahasa Indonesia",
        lang: "id-ID",
        onStop: () => {
            onSpeechEnd();
        }
    });

    const {
        queue,
    } = useQueue();

    const handleStart = () => {
        if(queue.length > 0){
            start();
        }else{
            let play = playjingle.current.play();
            if (play !== undefined) {
                play
                    .then(() => {
                        setTimeout(() => {
                            start();
                        }, 2150);
                    })
                    .catch((error) => {
                        console.error("Error sound!");
                    });
            } else {
                start();
            }
        }
    };

    const handleStop = () => {
        stop();
        playjingle.current.pause();
        playjingle.current.currentTime = 0;
    };

    useEffect(() => {
        if (speechStatus === "started" && queue.length === 0) {
            setTimeout(() => {
                stop();
            }, teks.length * 100);
        }
    }, [speechStatus]);

    return (
        <>
            {speechStatus !== "started" || !isInQueue ? (
                <Button
                    id={id}
                    onClick={handleStart}
                    variant="outline-primary"
                    size="sm"
                    className="non-pad"
                >
                    <i className="fa-solid fa-circle-play fa-beat-fade fa-2xs"></i>
                </Button>
            ) : (
                <Button
                    id={id}
                    onClick={handleStop}
                    variant="outline-danger"
                    size="sm"
                    className="non-pad"
                >
                    <i className="fa-solid fa-circle-stop fa-beat-fade fa-2xs"></i>
                </Button>
            )}
        </>
    );
};

const AutoScrollTable = ({ antrian, loading, handleOnEnd }) => {
    const tableRef = useRef(null);

    useEffect(() => {
        if (antrian.length > 0) {
            let scrollDown = true;

            const scrollTable = () => {
                if (!tableRef.current) return;

                if (scrollDown) {
                    scroll.scrollToBottom({
                        containerId: "scrollable-table",
                        duration: antrian.length * 1000, // Sesuaikan kecepatan scrolling
                        smooth: "linear"
                    });
                } else {
                    scroll.scrollToTop({
                        containerId: "scrollable-table",
                        duration: antrian.length * 1000,
                        smooth: "linear"
                    });
                }

                scrollDown = !scrollDown;
            };

            const interval = setInterval(scrollTable, antrian.length * 1000 + 2000); // Beri jeda sebelum scroll balik
            return () => clearInterval(interval);
        }
    }, [antrian]);

    return (
        <div id="scrollable-table" ref={tableRef} style={{ overflowY: "hidden", maxHeight: "200px" }}>
            {loading ? (
                <p>Loading data...</p>
            ) : antrian.length > 0 ? (
                <Table borderless hover size="sm" responsive="sm" className="fs-5 non-bg">
                    <tbody>
                        {antrian.map((item) => (
                            <tr key={item.id_antrian}>
                                <td className="text-center">{item.nomor_antrian}</td>
                                <td className="text-center">
                                    <ItemPanggil id={item.id_antrian} id_loket={item.id_loket} nomor_antrian={item.nomor_antrian} onSpeechEnd={handleOnEnd} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p>Tidak ada antrian.</p>
            )}
        </div>
    );
};

export default AutoScrollTable;
