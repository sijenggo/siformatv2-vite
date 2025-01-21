import axios from "axios";
import { Modal, Button } from "react-bootstrap";
const BASE_URL = `http://192.168.3.7/siformatv2/backend/api/`; //taruh apimu disini

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

export const fetchJabPTSP = async () => {
  try {
    const response = await axios.get(`http://192.168.3.7/siformatv2/backend/api/apilistpejabat`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const fetchJabNama = async (id) => {
  try {
    const response = await axios.get(`http://192.168.3.7/siformatv2/backend/api/apinamapejabat/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

//fungsi modal
export const modalGeneral = ({itemJudul, itemBody, show, onHide}) =>{
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
        <Modal.Footer>
          <Button onClick={onHide}>Keluar</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}