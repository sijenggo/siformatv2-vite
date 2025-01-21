import React, { useState, useCallback } from 'react';
import { Form } from 'react-bootstrap';
import { useQuery } from "@tanstack/react-query";
import { ambil_data, fetchJabPTSP, fetchJabNama } from './services';

const fetchJabatanData = async (ptspPlus) => {
    if (ptspPlus == 1) {
      return await fetchJabPTSP();
      //return await ambil_data('SELECT * FROM ref_pejabat GROUP BY id_jabatan');
    } else {
      return await ambil_data('SELECT * FROM ref_pejabat GROUP BY id_jabatan');
    }
};

const fetchNamaPejData = async (ptspPlus, id) =>{
    if (ptspPlus == 1) {
      return await fetchJabNama(id);
    } else {
      return await ambil_data(`SELECT * FROM ref_pejabat WHERE id_jabatan = ${id}`);
    }
}

const SelectJabatan = ({ptspplus}) => {
	const [namaPejabat, setNamapejabat] = useState([]);
	const [selIdjab, setSelidjab] = useState('');

    const showNama = useCallback(async (event) => {
        const selectedValue = event.target.value;
        const jabatan = event.target.selectedOptions[0].getAttribute('data-jabatan');
        setSelidjab(selectedValue);

        if (ptspplus !== undefined) {
            const response = await fetchNamaPejData(ptspplus, selectedValue);
            setNamapejabat(response);
        }
        
    }, [selIdjab]);

    const RenderNamaPejabat = () => {
        if(selIdjab !== ''){
            if (ptspplus !== undefined && ptspplus == 1) {
                return (
                    <Form.Group className="mb-2 w-60">
                        <Form.Label>Pejabat yg ditemui</Form.Label>
                        <Form.Select size='lg'>
                            <option value="">Pilih Pejabat yang ditemui ..</option>
                            {Object.entries(namaPejabat).map(([key, value]) => (
                                <option key={key} value={value[1]} data-nama={value[0]} data-id={value[1]}>
                                    {value[0]}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                );
            } else {
                return (
                    <Form.Group className="mb-2 w-60">
                        <Form.Label>Pejabat yg ditemui</Form.Label>
                        <Form.Select size='lg'>
                            <option value="">Pilih Pejabat yang ditemui ..</option>
                            {namaPejabat.map((item, index) => (
                                <option key={index} value={item.id_namapejabat} data-nama={item.nama_pejabat} data-id={item.id_namapejabat}>
                                    {item.nama_pejabat}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                );
            }
        }
        return null;
	};

    const RenderJab = () =>{
        const { 
            data: jabatan = [], 
            isError, 
            error 
        } = useQuery({
            queryKey: ['jabatan'],
            queryFn: async () => {
              if (ptspplus !== undefined) {
                return fetchJabatanData(ptspplus);
              }
              return [];
            },
            enabled: Boolean(ptspplus !== undefined)
        });
    
        if (ptspplus !== undefined && ptspplus == 1) {
            return (
                <Form.Group className="mb-2 w-60">
                    <Form.Label>Pejabat yg ditemui</Form.Label>
                    <Form.Select size='lg' onChange={showNama} value={selIdjab}>
                        <option value="">Pilih ..</option>
                        {Object.entries(jabatan).map(([key, value]) => (
                            <option key={key} value={value[1]} data-jabatan={value[0]} data-id={value[1]}>
                                {value[0]}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
            );
        } else {
            return (
                <Form.Group className="mb-2 w-60">
                    <Form.Label>Pejabat yg ditemui</Form.Label>
                    <Form.Select size='lg' onChange={showNama} value={selIdjab}>
                        <option value="">Pilih ..</option>
                        {jabatan.map((item, index) => (
                            <option key={index} value={item.id_jabatan} data-jabatan={item.nama_jabatan} data-id={item.id_jabatan}>
                                {item.nama_jabatan}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
            );
        }
    }

    return(
        <Form>
            <Form.Group className="mb-2 w-60">
                <Form.Label>Nama Lengkap</Form.Label>
                <Form.Control name='nama' size='lg' type="text" placeholder="Masukan Nama Lengkap Anda .." />
            </Form.Group>
            <Form.Group className="mb-2 w-60">
                <Form.Label>Nomor Handphone</Form.Label>
                <Form.Control name='nohp' size='lg' type="text" placeholder="Masukan Nomor HP Anda .." />
            </Form.Group>
            <Form.Group className="mb-2 w-60">
                <Form.Label>Alamat</Form.Label>
                <Form.Control name='alamat' as="textarea" placeholder="Masukkan Alamat ..." rows={3} />
            </Form.Group>
            <RenderJab />
            <RenderNamaPejabat />
        </Form>
    )
};

export default SelectJabatan;
