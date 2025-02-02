import React, { useEffect, useRef, useMemo, useState } from "react";
import { animateScroll as scroll } from "react-scroll";
import { Table, Button } from "react-bootstrap";
import jingle from "../../assets/audios/jingle.mp3";
import { prepText } from "./services";
import { useSpeech, useQueue } from "react-text-to-speech";

const ItemPanggil = ({ id, id_loket, nomor_antrian, ket, onSpeechEnd, onSpeechStart }) => {
    const playjingle = useMemo(() => new Audio(jingle), []); // Gunakan useMemo agar tetap konsisten
    const [isPlayingJingle, setIsPlayingJingle] = useState(false);
    const teks = prepText(id_loket, nomor_antrian);

    const { speechStatus, isInQueue, start, stop } = useSpeech({
        text: teks,
        autoPlay: false,
        preserveUtteranceQueue: true,
        volume: 1,
        voiceURI: "Google Bahasa Indonesia",
        lang: "id-ID",
        onStop: onSpeechEnd,
    });

    const { queue } = useQueue();

    useEffect(() => {
        if (!playjingle) return;

        const handlePlay = () => setIsPlayingJingle(true);
        const handlePause = () => setIsPlayingJingle(false);
        const handleEnded = () => setIsPlayingJingle(false);

        playjingle.addEventListener("play", handlePlay);
        playjingle.addEventListener("pause", handlePause);
        playjingle.addEventListener("ended", handleEnded);

        return () => {
            playjingle.removeEventListener("play", handlePlay);
            playjingle.removeEventListener("pause", handlePause);
            playjingle.removeEventListener("ended", handleEnded);
        };
    }, [playjingle]);

    const handleStart = () => {
        if (queue.length > 0) {
            start();
        } else {
            const playPromise = playjingle.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setTimeout(() => {
                            start();
                        }, 2150);
                    })
                    .catch((error) => {
                        console.error("Error playing sound:", error);
                        start();
                    });
            } else {
                start();
            }
        }
        onSpeechStart(id, nomor_antrian, ket);
    };

    const handleStop = () => {
        stop();
        playjingle.pause();
        playjingle.currentTime = 0;
    };

    useEffect(() => {
        if (speechStatus === "started" && queue.length === 0) {
            setTimeout(() => {
                stop();
            }, teks.length * 100);
        }
    }, [speechStatus, queue, stop, teks.length]);

    return (
        <>
            {!isPlayingJingle && speechStatus !== "started" && !isInQueue ? (
                <Button id={id} onClick={handleStart} variant="outline-primary" size="sm" className="non-pad">
                    <i className="fa-solid fa-circle-play fa-beat-fade fa-sm"></i>
                </Button>
            ) : (
                <Button id={id} onClick={handleStop} variant="outline-danger" size="sm" className="non-pad">
                    <i className="fa-solid fa-circle-stop fa-beat-fade fa-sm"></i>
                </Button>
            )}
        </>
    );
};


const AutoScrollTable = ({ antrian, loading, handleOnEnd, handleOnStart }) => {
    const tableRef = useRef(null);
    const containerId = `scrollable-table-${Math.random().toString(36).substr(2, 9)}`; // ID unik untuk tiap komponen

    useEffect(() => {
        if (antrian.length > 0) {
            let scrollDown = true;

            const scrollTable = () => {
                if (!tableRef.current) return;

                if (scrollDown) {
                    scroll.scrollToBottom({
                        containerId,
                        duration: antrian.length * 1000, // Sesuaikan kecepatan scrolling
                        smooth: "linear"
                    });
                } else {
                    scroll.scrollToTop({
                        containerId,
                        duration: antrian.length * 1000,
                        smooth: "linear"
                    });
                }

                scrollDown = !scrollDown;
            };

            const interval = setInterval(scrollTable, antrian.length * 1000 + 2000); // Beri jeda sebelum scroll balik
            return () => clearInterval(interval);
        }
    }, [antrian, containerId]);

    return (
        <div id={containerId} ref={tableRef} style={{ overflowY: "hidden", maxHeight: "100%" }}>
            {loading ? (
                <p>Loading data...</p>
            ) : antrian.length > 0 ? (
                <Table borderless hover size="sm" responsive="sm" className="fs-5 non-bg">
                    <tbody>
                        {antrian.map((item) => (
                            <tr key={item.id_antrian}>
                                <td className="text-center">{item.nomor_antrian}</td>
                                <td className="text-center">
                                    <ItemPanggil id={item.id_antrian} id_loket={item.id_loket} nomor_antrian={item.nomor_antrian} ket={item.ket} onSpeechStart={handleOnStart} onSpeechEnd={handleOnEnd} />
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
