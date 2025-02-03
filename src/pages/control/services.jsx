import axios from "axios";
import Swal from "sweetalert2";
import { Modal } from "react-bootstrap";
import { format } from "date-fns";
import { id } from "date-fns/locale";
const BASE_URL = `http://192.168.3.7/siformatv2/backend/api/`; //taruh apimu disini

export const connectWs = (url, onMessage) => {
  const ws = new WebSocket(url);
  ws.onmessage = onMessage;
  return ws;  
}

//fungsi data DB
export const ambil_data = async (query) => {
    try {
      const response = await axios.post(`${BASE_URL}ambil_data`,{ query });
      return response.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
};

export const tambah_data = async (table, data, ptspplus) => {
  try {
    const response = await axios.post(`${BASE_URL}tambah_data`, {
      table,
      data,
      ptspplus
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const hapus_data = async (table, id) => {
  try {
    const response = await axios.post(`${BASE_URL}hapus_data`, {
      table,
      id
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting data:', error.response ? error.response.data : error.message);
    throw error;
  }
}

export const fetchJabPTSP = async () => {
  try {
    const response = await axios.get(`${BASE_URL}apilistpejabat`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const fetchJabNama = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}apinamapejabat/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const fetchIndex = async () => {
  try {
    const response = await axios.get(`${BASE_URL}apinomorindex`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

//fungsi modal
export const modalGeneral = ({itemJudul, itemBody, itemFooter, show, onHide}) =>{
  return (
    <>
      <Modal
        show={show}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        scrollable
        backdrop='static'
        keyboard
      >
        <Modal.Header closeButton onClick={onHide}>
          <Modal.Title id="contained-modal-title-vcenter">
            {itemJudul}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {itemBody}
        </Modal.Body>
      </Modal>
    </>
  );
}

//fungsi general
export const formattedDate = (date) =>{
  return format(date, 'yyyy-MM-dd');
};

export const formattedDateHourMinute = (date) =>{
  return format(date, 'yyyy-MM-dd HH:mm:ss');
};

export const formattedDateLocale = (date) =>{
  return format(date, 'd MMMM yyyy HH:mm', {locale: id});
};

export const alertNotif = (icon, title, text, footer) =>{
  Swal.fire({
      icon: icon,
      title: title,
      text: text,
      footer: footer
    });
}

export const prepText = (id_loket, nomor_antrian) => {
  let teks = "";
  let parts = nomor_antrian.split(" - ");
  if(id_loket == 2){
      teks = `Nomor antrian, ${parts[0]}, ${parts[1]}, silakan menuju meja PTSP Perdata.`;
  }else if(id_loket == 3){
      teks = `Nomor antrian, ${parts[0]}, ${parts[1]}, silakan menuju meja PTSP Pidana.`;
  }else if(id_loket == 4){
      teks = `Nomor antrian, ${parts[0]}, ${parts[1]}, silakan menuju meja PTSP Hukum.`;
  }else if(id_loket == 5){
      teks = `Nomor antrian, ${parts[0]}, ${parts[1]}, silakan menuju meja PTSP Umum.`;
  }else if(id_loket == 6){
      teks = `Nomor antrian, ${parts[0]}, ${parts[1]}, silakan menuju meja PTSP Ecourt.`;
  }
  return teks;
}